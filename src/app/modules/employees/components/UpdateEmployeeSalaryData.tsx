import { AppSelect } from "../../../shared/components/ui";
import {
  Grid,
  Stack } from "@mui/system";
import { Formik,
  FormikProps } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { CreateEmployeeSalary,
  SalaryModel } from "../models";
import dayjs,
  { Dayjs } from "dayjs";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  CloudUploadRounded,
  FileDownloadOutlined,
  PaymentsOutlined,
  AccountBalanceWalletOutlined,
  CalendarMonthOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import { useIntl } from "react-intl";
import { approveEmployeeSalaryStructure, getEmployeeSalaryHistory, getPayrollPayGroups, getPayrollSalaryComponents, getPayrollSalaryTemplates, previewEmployeeSalaryImport, previewEmployeeSalaryPdf, saveEmployeeSalaryStructure } from "../../payroll/services";
import { EmployeeSalaryComponentValueModel, EmployeeSalaryImportRowModel, EmployeeSalaryStructureModel, PayrollPayGroupModel, PayrollSalaryComponentModel, PayrollSalaryTemplateModel } from "../../payroll/models";
import { salaryValidationSchema } from "../../../../utils/Schema/salaryValidationSchema";
import { downloadEmployeeSalarySampleTemplate, hasExplicitSalaryComponentValue, invalidStandardSalaryValues, rowToImport } from "../../payrollsettings/components/salaryImportMapping";
import { salaryTemplateValues, calculateEmployeePayrollComponents, getSalaryComponentInputGuidance, isEmployeePayrollComponentEligible, normalizeImportedSalaryComponentValues, resolveEmployeePayrollComponentDefinition, resolveEmployeePayrollComponents, resolveEmployeeSalaryMetadata, resolveSalaryImportEffectiveDate } from "./employeeSalaryMetadata";
import * as XLSX from "xlsx";

import { CurrencyInput } from "../../../shared/components/form-component/CurrencyInput";
interface PropsTypes {
  userId: string;
  employeeId: string;
  employeeName?: string;
  onUserUpdate: (success: boolean) => void | Promise<void>;
  formRef: React.MutableRefObject<FormikProps<CreateEmployeeSalary> | null>;
  handleButtonLoading: (loading: boolean) => void;
  // pre-fills the form with the employee's current active salary when editing one that
  // already exists; omit for a brand new employee who has no salary yet
  existingSalary?: SalaryModel | null;
  defaultEffectiveFrom?: string;
  canApprove?: boolean;
}

const employeeSalaryInitialValues: CreateEmployeeSalary = {
  userId: "",
  employeeId: "",
  basicPay: 0,
  hra: 0,
  otherAllowance: 0,
  lta: 0,
  bonus: 0,
  healthInsurance: 0,
  totalDeductions: 0,
  effectiveFrom: dayjs(Date.now()),
  effectiveTo: null,
  paymentFrequency: "",
  status: true,
};

const fixedComponentFields: Record<string, keyof CreateEmployeeSalary> = {
  BASIC: "basicPay",
  BASIC_PAY: "basicPay",
  HRA: "hra",
  LTA: "lta",
  OTHER_ALLOWANCE: "otherAllowance",
  SPECIAL_ALLOWANCE: "otherAllowance",
  BONUS: "bonus",
  HEALTH_INSURANCE: "healthInsurance",
  TOTAL_DEDUCTIONS: "totalDeductions",
};

const formatInr = (amount: number) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
}).format(amount);

export const UpdateEmployeeSalaryData = (props: PropsTypes) => {
  const {
    userId,
    employeeId,
    onUserUpdate,
    formRef,
    handleButtonLoading,
    existingSalary,
    defaultEffectiveFrom,
    canApprove,
  } = props;
  const { formatMessage: i } = useIntl();
  const [salaryTemplates, setSalaryTemplates] = useState<PayrollSalaryTemplateModel[]>([]);
  const [salaryComponentDefinitions, setSalaryComponentDefinitions] = useState<PayrollSalaryComponentModel[]>([]);
  const [componentCatalogLoaded, setComponentCatalogLoaded] = useState(false);
  const [componentCatalogFailed, setComponentCatalogFailed] = useState(false);
  const [payGroups, setPayGroups] = useState<PayrollPayGroupModel[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedPayGroupId, setSelectedPayGroupId] = useState("");
  const [importedSalaryMetadata, setImportedSalaryMetadata] = useState<{
    offerId?: string | null;
    offerVersion?: number | null;
    employeeType?: string | null;
    gradeId?: string | null;
    departmentId?: string | null;
  }>({});
  const [importedSalaryComponents, setImportedSalaryComponents] = useState<EmployeeSalaryComponentValueModel[]>([]);
  const [activeSalaryRecord, setActiveSalaryRecord] = useState<EmployeeSalaryStructureModel | null>(null);
  const [isImportingSalary, setIsImportingSalary] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ severity: "success" | "error"; message: string } | null>(null);
  const salaryFileInput = useRef<HTMLInputElement>(null);
  const fixedComponentCodes = new Set([
    "BASIC",
    "BASIC_PAY",
    "HRA",
    "LTA",
    "OTHER_ALLOWANCE",
    "SPECIAL_ALLOWANCE",
    "BONUS",
    "HEALTH_INSURANCE",
    "TOTAL_DEDUCTIONS",
  ]);
  const buildSalaryCalculation = (values: CreateEmployeeSalary, effectiveFrom: string) => {
    const isEnabled = (code: string) => isEmployeePayrollComponentEligible(salaryComponentDefinitions, code, effectiveFrom, true);
    const templateComponents = resolveEmployeePayrollComponents(
      salaryComponentDefinitions,
      salaryTemplates.find((template) => template.id === selectedTemplateId)?.components ?? [],
      effectiveFrom,
      importedSalaryComponents,
    );
    const isSpecialOrOtherEnabled = isEnabled("SPECIAL_ALLOWANCE") || isEnabled("OTHER_ALLOWANCE");
    const configuredSpecialOrOtherDef = salaryComponentDefinitions.find((c) => {
      const code = c.code.trim().toUpperCase();
      return (code === "SPECIAL_ALLOWANCE" || code === "OTHER_ALLOWANCE") &&
        isEmployeePayrollComponentEligible(salaryComponentDefinitions, code, effectiveFrom);
    });
    const specialOrOtherCode = configuredSpecialOrOtherDef?.code.trim().toUpperCase() ||
      (salaryComponentDefinitions.some((c) => c.code.trim().toUpperCase() === "SPECIAL_ALLOWANCE") ? "SPECIAL_ALLOWANCE" : "OTHER_ALLOWANCE");
    const specialOrOtherName = configuredSpecialOrOtherDef?.name ||
      (specialOrOtherCode === "SPECIAL_ALLOWANCE" ? "Special Allowance" : "Other Allowance");

    const fixedRows: [string, string, unknown, boolean, "EARNING" | "DEDUCTION"][] = [
      ["BASIC", "Basic Pay", values.basicPay, true, "EARNING"],
      ...(isEnabled("HRA") ? [["HRA", "HRA", values.hra, true, "EARNING"] as [string, string, unknown, boolean, "EARNING"]] : []),
      ...(isEnabled("LTA") ? [["LTA", "LTA", values.lta, true, "EARNING"] as [string, string, unknown, boolean, "EARNING"]] : []),
      ...(isSpecialOrOtherEnabled ? [[specialOrOtherCode, specialOrOtherName, values.otherAllowance, true, "EARNING"] as [string, string, unknown, boolean, "EARNING"]] : []),
      ...(isEnabled("BONUS") ? [["BONUS", "Bonus", values.bonus, true, "EARNING"] as [string, string, unknown, boolean, "EARNING"]] : []),
      ...(isEnabled("HEALTH_INSURANCE") ? [["HEALTH_INSURANCE", "Health Insurance", values.healthInsurance, true, "DEDUCTION"] as [string, string, unknown, boolean, "DEDUCTION"]] : []),
    ];
    const fixedComponents = fixedRows.map(([componentCode, defaultName, value, isRecurring, defaultKind]) => {
      const definition = salaryComponentDefinitions.find((component) =>
        component.code.trim().toUpperCase() === componentCode && isEmployeePayrollComponentEligible(salaryComponentDefinitions, componentCode, effectiveFrom),
      );
      const kind = definition?.kind ?? defaultKind;
      return {
        componentCode, componentName: definition?.name ?? defaultName, kind,
        value: Number(value || 0), calculationType: definition?.calculationType ?? "FIXED",
        baseComponentCode: definition?.baseComponentCode, isTaxable: definition?.isTaxable ?? kind !== "DEDUCTION",
        isRecurring: Boolean(isRecurring), isStatutory: false, isEmployerContribution: false,
      };
    });
    const configuredComponents = templateComponents
      .filter((component) => !fixedComponentCodes.has(component.code.toUpperCase()))
      .map((component) => ({ componentCode: component.code.toUpperCase(), componentName: component.name, kind: component.kind,
        value: Number((values as CreateEmployeeSalary & Record<string, unknown>)[component.code.toUpperCase()] || 0), calculationType: component.calculationType,
        baseComponentCode: component.baseComponentCode, isTaxable: component.isTaxable, isRecurring: true, isStatutory: false, isEmployerContribution: false }));
    const importedComponents = importedSalaryComponents
      .filter((component) => !fixedComponentCodes.has(component.componentCode.toUpperCase()))
      .map((component) => ({
        ...component,
        value: Number((values as CreateEmployeeSalary & Record<string, unknown>)[component.componentCode.toUpperCase()] ?? component.value),
        percentage: component.calculationType.toUpperCase() === "FIXED"
          ? component.percentage
          : Number((values as CreateEmployeeSalary & Record<string, unknown>)[component.componentCode.toUpperCase()] ?? component.value),
      }));
    const components = [...fixedComponents, ...configuredComponents, ...importedComponents];
    return { components, calculation: calculateEmployeePayrollComponents(components) };
  };
  useEffect(() => {
    let mounted = true;
    void getPayrollSalaryTemplates().then(({ data }) => {
      if (mounted) setSalaryTemplates((data ?? []).filter((template) => template.isActive && template.id));
    }).catch(() => { if (mounted) setSalaryTemplates([]); });
    void getPayrollSalaryComponents().then(({ data }) => {
      if (mounted) setSalaryComponentDefinitions(data ?? []);
    }).catch(() => { if (mounted) { setSalaryComponentDefinitions([]); setComponentCatalogFailed(true); } }).finally(() => {
      if (mounted) setComponentCatalogLoaded(true);
    });
    void getPayrollPayGroups().then(({ data }) => {
      if (mounted) setPayGroups((data ?? []).filter((group) => group.isActive && group.id));
    }).catch(() => { if (mounted) setPayGroups([]); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    void getEmployeeSalaryHistory(employeeId).then(({ data }) => {
      if (!mounted) return;
      const sorted = (data ?? []).slice().sort((left, right) => dayjs(right.effectiveFrom).valueOf() - dayjs(left.effectiveFrom).valueOf());
      const current = sorted.find((salary) => salary.status === "ACTIVE" && salary.approvalStatus === "APPROVED") ?? sorted[0];
      if (!current) return;
      setActiveSalaryRecord(current);
      setSelectedTemplateId(current.salaryTemplateId ?? "");
      setSelectedPayGroupId(current.payGroupId ?? "");
      setImportedSalaryMetadata({
        offerId: current.offerId,
        offerVersion: current.offerVersion,
        employeeType: current.employeeType,
        gradeId: current.gradeId,
        departmentId: current.departmentId,
      });
      if (current.components && current.components.length > 0 && formRef?.current) {
        const specialComp = current.components.find((c) => {
          const code = c.componentCode.toUpperCase();
          return code === "SPECIAL_ALLOWANCE" || code === "OTHER_ALLOWANCE";
        });
        if (specialComp && !formRef.current.values.otherAllowance) {
          void formRef.current.setFieldValue("otherAllowance", specialComp.value);
        }
      }
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, [employeeId, existingSalary, formRef]);

  async function UpadteSalaryData(
    values: CreateEmployeeSalary,
    setSubmittng: (isSubmitting: boolean) => void,
  ) {
    try {
      if (!componentCatalogLoaded || componentCatalogFailed) {
        toast.error(componentCatalogFailed
          ? "Company payroll components could not be loaded. Refresh before saving this salary structure."
          : "Company payroll components are still loading. Please try again in a moment.");
        await onUserUpdate(false);
        return;
      }
      const effectiveFrom = values.effectiveFrom
        ? dayjs(values.effectiveFrom).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");
      const effectiveTo = values.effectiveTo
        ? dayjs(values.effectiveTo).format("YYYY-MM-DD")
        : null;
      const { components, calculation: payrollCalculation } = buildSalaryCalculation(values, effectiveFrom);
      if (!payrollCalculation.success) {
        toast.error(payrollCalculation.errorMessage);
        await onUserUpdate(false);
        return;
      }
      const monthlyGross = payrollCalculation.gross;
      const selectedTemplate = salaryTemplates.find((template) => template.id === selectedTemplateId);
      const requestedPayGroupId = selectedPayGroupId || selectedTemplate?.payGroupId || undefined;
      const salaryMetadata = resolveEmployeeSalaryMetadata(selectedTemplateId, selectedPayGroupId, salaryTemplates, payGroups, importedSalaryMetadata);
      if (requestedPayGroupId && !salaryMetadata.payGroupId) {
        toast.error("The selected pay group is no longer active in this company. Choose an active group before saving.");
        await onUserUpdate(false);
        return;
      }
      const isSameEffectiveDate = activeSalaryRecord && dayjs(activeSalaryRecord.effectiveFrom).format("YYYY-MM-DD") === effectiveFrom;
      const canonicalPayload: EmployeeSalaryStructureModel = {
        id: isSameEffectiveDate ? activeSalaryRecord.id : undefined,
        version: isSameEffectiveDate ? (activeSalaryRecord.version ?? 1) : 1,
        employeeId,
        userId,
        ...salaryMetadata,
        currency: "INR",
        paymentFrequency: values.paymentFrequency || "Monthly",
        annualCtc: monthlyGross * 12,
        monthlyGross,
        effectiveFrom,
        effectiveTo,
        status: "DRAFT",
        approvalStatus: "DRAFT",
        source: "ONBOARDING_MANUAL",

        components,
      };
      const response = await saveEmployeeSalaryStructure(canonicalPayload);
      if (!response.data.success) {
        toast.error(response.data.message || "Salary structure could not be saved. Please correct the issue and try again.");
        await onUserUpdate(false);
        return;
      }
      const savedId = response.data.resourceId || (response.data as unknown as { methodResult?: { id?: string; version?: number } }).methodResult?.id;
      const savedVersion = (response.data as unknown as { methodResult?: { id?: string; version?: number } }).methodResult?.version ?? 1;
      if (canApprove && savedId) {
        try {
          const approveRes = await approveEmployeeSalaryStructure(savedId, savedVersion);
          if (approveRes.data.success) {
            toast.success("Salary structure saved and approved successfully.");
            await onUserUpdate(true);
            return;
          }
        } catch {
          // Fall through to draft toast if approval failed
        }
      }
      toast.success("Salary structure saved as a draft. It must be approved before payroll can use it.");
      await onUserUpdate(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Salary structure could not be saved. Please try again.");
      await onUserUpdate(false);
    } finally {
      setSubmittng(false);
      handleButtonLoading(false);
    }
  }
  return (
    <Stack spacing={2.5} sx={{ p: 0, width: "100%" }}>
      {!existingSalary && (
        <Alert
          severity="info"
          icon={<InfoOutlined fontSize="small" />}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
            py: 0.75,
            px: 2,
            fontSize: "0.82rem",
            lineHeight: 1.45,
            alignItems: "center",
          }}
        >
          A salary structure is required to finish employee setup. Optional earning and deduction fields follow this company’s enabled payroll components for the salary start date. Saving creates a draft; payroll can use it only after authorized approval.
        </Alert>
      )}
      <Formik
        initialValues={{
          ...employeeSalaryInitialValues,
          effectiveFrom: existingSalary?.effectiveFrom
            ? dayjs(existingSalary.effectiveFrom)
            : (defaultEffectiveFrom ? dayjs(defaultEffectiveFrom) : employeeSalaryInitialValues.effectiveFrom),
          ...(existingSalary && {
            basicPay: existingSalary.basicPay,
            hra: existingSalary.hra,
            lta: existingSalary.lta,
            otherAllowance: existingSalary.otherAllowance ?? existingSalary.otherAllowances ?? 0,
            bonus: existingSalary.bonus,
            healthInsurance: existingSalary.healthInsurance,
            totalDeductions: existingSalary.totalDeductions,
            paymentFrequency: existingSalary.paymentFrequency,
          }),
          userId,
          employeeId,
        }}
        onSubmit={(values, { setSubmitting }) => {
          UpadteSalaryData(values, setSubmitting);
        }}
        validationSchema={salaryValidationSchema}
        innerRef={formRef}
      >
        {({
          values,
          setFieldTouched,
          setFieldValue,
          handleSubmit,
        }) => {
          const salaryEffectiveDate = values.effectiveFrom ? dayjs(values.effectiveFrom).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
          const salaryCalculationPreview = componentCatalogLoaded && !componentCatalogFailed
            ? buildSalaryCalculation(values, salaryEffectiveDate).calculation
            : null;
          const activeTemplateComponents = resolveEmployeePayrollComponents(
            salaryComponentDefinitions,
            salaryTemplates.find((template) => template.id === selectedTemplateId)?.components ?? [],
            salaryEffectiveDate,
            importedSalaryComponents,
          );
          const bonusEnabled = componentCatalogLoaded && isEmployeePayrollComponentEligible(
            salaryComponentDefinitions, "BONUS", salaryEffectiveDate, !componentCatalogFailed,
          );
          const componentEnabled = (code: string) => componentCatalogLoaded && isEmployeePayrollComponentEligible(
            salaryComponentDefinitions, code, salaryEffectiveDate, !componentCatalogFailed,
          );
          const componentInputGuidance = (code: string) => {
            const definition = resolveEmployeePayrollComponentDefinition(salaryComponentDefinitions, code, salaryEffectiveDate);
            return definition ? getSalaryComponentInputGuidance(definition) : {};
          };
          const standardCatalogAudit = (() => {
            if (!componentCatalogLoaded || componentCatalogFailed) return null;
            const hasDefinitions = salaryComponentDefinitions.length > 0;
            const configuredCodes = new Set(
              salaryComponentDefinitions
                .filter((c) => isEmployeePayrollComponentEligible(salaryComponentDefinitions, c.code, salaryEffectiveDate, true))
                .map((c) => c.code.trim().toUpperCase()),
            );
            const isSpecialOrOtherConfigured = configuredCodes.has("SPECIAL_ALLOWANCE") || configuredCodes.has("OTHER_ALLOWANCE");
            const standardHeads = [
              { code: "HRA", name: "House Rent Allowance", kind: "EARNING" },
              { code: "LTA", name: "Leave Travel Allowance", kind: "EARNING" },
              { code: "OTHER_ALLOWANCE", name: "Other Allowance", kind: "EARNING" },
              { code: "BONUS", name: "Performance Bonus", kind: "EARNING" },
              { code: "HEALTH_INSURANCE", name: "Health Insurance", kind: "DEDUCTION" },
            ];

            const unconfiguredStandardHeads = hasDefinitions
              ? standardHeads.filter((head) => {
                  if (head.code === "OTHER_ALLOWANCE") return !isSpecialOrOtherConfigured;
                  return !configuredCodes.has(head.code);
                })
              : [];

            return {
              hasDefinitions,
              configuredCount: configuredCodes.size,
              unconfiguredStandardHeads,
            };
          })();
          const showConfiguredComponentWarning = componentCatalogFailed;
          const handleSalaryFile = async (file?: File) => {
            if (!file) return;
            setIsImportingSalary(true);
            setImportFeedback(null);
            try {
              let importedRow: EmployeeSalaryImportRowModel;
              if (file.name.toLowerCase().endsWith(".pdf")) {
                const response = await previewEmployeeSalaryPdf(
                  file,
                  employeeId,
                  values.effectiveFrom ? dayjs(values.effectiveFrom).format("YYYY-MM-DD") : undefined,
                );
                if (!response.data.row) throw new Error(response.data.errors?.join(" ") || "No salary data could be extracted from this PDF.");
                importedRow = response.data.row;
              } else {
                const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) throw new Error("The spreadsheet has no worksheets.");
                const sourceRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheetName], { defval: "" });
                if (sourceRows.length === 0) throw new Error("The spreadsheet contains no salary rows.");
                const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "").replace(/[_-]/g, "");
                const rowForEmployee = sourceRows.find((row) => {
                  const employeeKey = Object.keys(row).find((key) => ["employeeid", "employeecode"].includes(normalizeHeader(key)));
                  return employeeKey && String(row[employeeKey]).trim().toLowerCase() === employeeId.trim().toLowerCase();
                });
                const rowIndex = rowForEmployee ? sourceRows.indexOf(rowForEmployee) : -1;
                const sourceRow = rowForEmployee ?? (sourceRows.length === 1 ? sourceRows[0] : undefined);
                if (!sourceRow) throw new Error(`Select a spreadsheet with one row for employee ${employeeId}, or include an Employee ID column.`);
                const invalidValues = invalidStandardSalaryValues(sourceRow);
                if (invalidValues.length > 0) throw new Error(`The selected row has invalid numeric values for: ${invalidValues.join(", ")}.`);
                if (!hasExplicitSalaryComponentValue(sourceRow)) throw new Error("The selected row has no numeric salary component values.");
                importedRow = rowToImport(sourceRow, rowIndex >= 0 ? rowIndex + 2 : 2);
              }

              const importedPaymentFrequency = String(importedRow.paymentFrequency ?? "").trim().toUpperCase();
              if (importedPaymentFrequency && importedPaymentFrequency !== "MONTHLY" && importedPaymentFrequency !== "MONTH") {
                throw new Error("This payroll currently supports monthly processing only. The offer uses a different payment frequency; confirm a monthly payroll arrangement before importing.");
              }
              if (importedRow.employeeId && importedRow.employeeId.trim().toLowerCase() !== employeeId.trim().toLowerCase()) {
                throw new Error(`The salary document is for ${importedRow.employeeId}, not this employee (${employeeId}).`);
              }
              importedRow.employeeId = employeeId;
              importedRow.userId = userId;
              const importEffectiveDate = resolveSalaryImportEffectiveDate(
                importedRow.effectiveFrom,
                values.effectiveFrom ? dayjs(values.effectiveFrom).format("YYYY-MM-DD") : undefined,
                dayjs().format("YYYY-MM-DD"),
              );
              const unavailableComponents = importedRow.components.filter((component) => {
                const code = component.componentCode.trim().toUpperCase();
                if (code === "BASIC" || code === "BASIC_PAY") return false;
                return !isEmployeePayrollComponentEligible(
                  salaryComponentDefinitions,
                  code,
                  importEffectiveDate,
                  salaryComponentDefinitions.length === 0 && !componentCatalogFailed,
                );
              });
              if (unavailableComponents.length > 0) {
                throw new Error(`The offer contains payroll components not enabled for ${importEffectiveDate}: ${unavailableComponents.map((component) => component.componentName).join(", ")}. Enable them in Payroll Settings or remove them from the import.`);
              }
              importedRow.components = normalizeImportedSalaryComponentValues(importedRow.components, salaryComponentDefinitions, importEffectiveDate);
              const importedPayrollCalculation = calculateEmployeePayrollComponents(importedRow.components);
              if (!importedPayrollCalculation.success) throw new Error(importedPayrollCalculation.errorMessage);
              importedRow.monthlyGross = importedPayrollCalculation.gross;
              importedRow.annualCtc = importedRow.annualCtc ?? importedPayrollCalculation.gross * 12;
              const preview = await previewEmployeeSalaryImport([importedRow]);
              const validation = preview.data?.[0];
              if (!validation?.isValid) {
                throw new Error(validation?.errors?.join(" ") || "Salary data did not pass payroll validation.");
              }

              importedRow.components.forEach((component) => {
                const field = fixedComponentFields[component.componentCode.toUpperCase()];
                if (field) void setFieldValue(field, component.value);
                else void setFieldValue(component.componentCode.toUpperCase(), component.value);
              });
              setImportedSalaryComponents(importedRow.components.filter((component) => !fixedComponentCodes.has(component.componentCode.toUpperCase())));
              if (importedRow.effectiveFrom) void setFieldValue("effectiveFrom", dayjs(importedRow.effectiveFrom));
              void setFieldValue("effectiveTo", importedRow.effectiveTo ? dayjs(importedRow.effectiveTo) : null);
              void setFieldValue("paymentFrequency", "MONTHLY");
              const importedTemplateId = importedRow.salaryTemplateId && salaryTemplates.some((template) => template.id === importedRow.salaryTemplateId)
                ? importedRow.salaryTemplateId
                : "";
              setSelectedTemplateId(importedTemplateId);
              setSelectedPayGroupId(importedRow.payGroupId ?? "");
              setImportedSalaryMetadata({
                offerId: importedRow.offerId,
                offerVersion: importedRow.offerVersion,
                employeeType: importedRow.employeeType,
                gradeId: importedRow.gradeId,
                departmentId: importedRow.departmentId,
              });
              setImportFeedback({ severity: "success", message: "Import validated. Review the extracted salary values and effective dates below; saving creates a draft that still needs approval." });
            } catch (error) {
              setImportFeedback({ severity: "error", message: error instanceof Error ? error.message : "Unable to import this salary document." });
            } finally {
              setIsImportingSalary(false);
            }
          };

          const handleDownloadSample = () => {
            try {
              const activeCustomComponents = [
                ...activeTemplateComponents.filter((c) => !fixedComponentCodes.has(c.code.toUpperCase())),
                ...importedSalaryComponents,
              ].map((c) => ({
                code: "code" in c ? c.code : c.componentCode,
                name: "name" in c ? c.name : c.componentName,
                value: Number((values as Record<string, unknown>)[("code" in c ? c.code : c.componentCode).toUpperCase()] ?? ("value" in c ? c.value : 0)),
              }));

              downloadEmployeeSalarySampleTemplate({
                employeeId,
                employeeName: props.employeeName,
                basicPay: Number(values.basicPay || 0),
                hra: Number(values.hra || 0),
                lta: Number(values.lta || 0),
                otherAllowance: Number(values.otherAllowance || 0),
                bonus: Number(values.bonus || 0),
                healthInsurance: Number(values.healthInsurance || 0),
                effectiveFrom: values.effectiveFrom ? dayjs(values.effectiveFrom).format("YYYY-MM-DD") : undefined,
                effectiveTo: values.effectiveTo ? dayjs(values.effectiveTo).format("YYYY-MM-DD") : undefined,
                customComponents: activeCustomComponents,
              });
              toast.success("Sample Excel template downloaded.");
            } catch (err) {
              toast.error("Failed to download sample template.");
            }
          };

          const monthlyGross = salaryCalculationPreview?.gross ?? Number(values.basicPay || 0);
          const monthlyDeductions = salaryCalculationPreview?.deductions ?? Number(values.healthInsurance || 0);

          return (
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                {/* 1. Executive Compensation Summary & Quick Document Actions */}
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.25 },
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1.5}
                    sx={{ mb: 2 }}
                  >
                    <div>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.95rem" }}>
                          Live Salary Breakdown
                        </Typography>
                        <Chip
                          size="small"
                          label="Live Projection"
                          sx={{
                            height: 20,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                            color: "success.main",
                            border: "1px solid",
                            borderColor: (theme) => alpha(theme.palette.success.main, 0.25),
                            borderRadius: 1.25,
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.76rem" }}>
                        Recalculates dynamically from enabled company components and selected pay group.
                      </Typography>
                    </div>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ rowGap: 1 }}>
                      <input
                        ref={salaryFileInput}
                        hidden
                        type="file"
                        accept=".pdf,.xlsx,.xls"
                        onChange={(event) => {
                          void handleSalaryFile(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadOutlined sx={{ fontSize: 16 }} />}
                        onClick={handleDownloadSample}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 650,
                          textTransform: "none",
                          py: 0.65,
                          px: 1.5,
                          fontSize: "0.78rem",
                          borderColor: "divider",
                          color: "text.primary",
                          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                        }}
                      >
                        Download Sample Template
                      </Button>
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        startIcon={<CloudUploadRounded sx={{ fontSize: 16 }} />}
                        disabled={isImportingSalary || !componentCatalogLoaded || componentCatalogFailed}
                        onClick={() => salaryFileInput.current?.click()}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 650,
                          textTransform: "none",
                          py: 0.65,
                          px: 1.75,
                          fontSize: "0.78rem",
                          boxShadow: "none",
                        }}
                      >
                        {isImportingSalary
                          ? "Reading salary document…"
                          : !componentCatalogLoaded
                            ? "Loading payroll components…"
                            : "Import offer salary (PDF / Excel)"}
                      </Button>
                    </Stack>
                  </Stack>

                  {importFeedback && (
                    <Alert
                      severity={importFeedback.severity}
                      sx={{
                        borderRadius: 2,
                        mb: 1.5,
                        py: 0.5,
                        px: 2,
                        fontSize: "0.82rem",
                      }}
                    >
                      {importFeedback.message}
                    </Alert>
                  )}
                  {showConfiguredComponentWarning && (
                    <Alert
                      severity="error"
                      sx={{
                        borderRadius: 2,
                        mb: 1.5,
                        py: 0.5,
                        px: 2,
                        fontSize: "0.82rem",
                      }}
                    >
                      Company payroll components could not be loaded. Refresh before saving to avoid an incomplete salary structure.
                    </Alert>
                  )}
                  {!componentCatalogLoaded && (
                    <Alert severity="info" sx={{ mb: 1.5, borderRadius: 2, py: 0.5, fontSize: "0.82rem" }}>
                      Loading company payroll components; the breakdown will appear when they are ready.
                    </Alert>
                  )}
                  {componentCatalogFailed && (
                    <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, py: 0.5, fontSize: "0.82rem" }}>
                      Salary totals are unavailable until company payroll components load successfully.
                    </Alert>
                  )}
                  {salaryCalculationPreview && !salaryCalculationPreview.success && (
                    <Alert severity="warning" sx={{ mb: 1.5, borderRadius: 2, py: 0.5, fontSize: "0.82rem" }}>
                      {salaryCalculationPreview.errorMessage}
                    </Alert>
                  )}

                  {salaryCalculationPreview?.success && (
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Card
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                            bgcolor: "background.default",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Monthly Gross
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5, color: "text.primary", fontSize: "1.2rem", letterSpacing: "-0.01em" }}>
                            <span data-testid="salary-preview-gross">{formatInr(salaryCalculationPreview.gross)}</span>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                            All earnings combined
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Card
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                            bgcolor: "background.default",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Monthly Deductions
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5, color: "text.primary", fontSize: "1.2rem", letterSpacing: "-0.01em" }}>
                            <span data-testid="salary-preview-deductions">{formatInr(salaryCalculationPreview.deductions)}</span>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                            Pre-tax company withholdings
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Card
                          sx={(theme) => ({
                            p: 2,
                            borderRadius: 2.5,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            boxShadow: "none",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          })}
                        >
                          <Typography variant="caption" color="primary.main" fontWeight={750} sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Estimated Net Take-Home
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5, color: "primary.main", fontSize: "1.2rem", letterSpacing: "-0.01em" }}>
                            <span data-testid="salary-preview-net">{formatInr(salaryCalculationPreview.net)}</span>
                          </Typography>
                          <Typography variant="caption" color="primary.main" sx={{ fontSize: "0.72rem", opacity: 0.9 }}>
                            Net take-home projection
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Card
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                            bgcolor: "background.default",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Annual CTC (Gross × 12)
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5, color: "text.primary", fontSize: "1.2rem", letterSpacing: "-0.01em" }}>
                            {formatInr(salaryCalculationPreview.gross * 12)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                            Annualized compensation
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  )}

                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" sx={{ mt: 1.5, pt: 1.25, borderTop: "1px dashed", borderColor: "divider" }} spacing={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                      Note: Excludes statutory taxes (EPF, ESIC, PT, TDS) and attendance deductions computed during final payroll runs.
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem", display: { xs: "none", md: "inline" } }}>
                      Document imports preview before filling; saving creates an unapproved draft.
                    </Typography>
                  </Stack>
                </Box>

                {standardCatalogAudit && standardCatalogAudit.unconfiguredStandardHeads.length > 0 && (
                  <Alert
                    severity="info"
                    icon={<InfoOutlined fontSize="small" />}
                    sx={{
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: (theme) => alpha(theme.palette.info.main, 0.25),
                      py: 1.25,
                      px: 2,
                      fontSize: "0.82rem",
                      bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
                    }}
                    action={
                      <Button
                        color="info"
                        size="small"
                        variant="outlined"
                        href="/admin/companydetails/payroll-configuration"
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          borderRadius: 1.5,
                          py: 0.5,
                          px: 1.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Payroll Configuration ↗
                      </Button>
                    }
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.84rem", mb: 0.25 }}>
                      Company Component Catalog Notice
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.45 }}>
                      {standardCatalogAudit.unconfiguredStandardHeads.map((h) => h.code).join(", ")}{" "}
                      {standardCatalogAudit.unconfiguredStandardHeads.length === 1 ? "is" : "are"} not active in this company&apos;s Payroll Configuration.
                      Only components configured in your company catalog are available for salary assignments.
                    </Typography>
                  </Alert>
                )}

                {/* 3. Systematic 2-Column Corporate Grid */}
                <Grid container spacing={3} alignItems="flex-start">
                  {/* LEFT COLUMN: Earnings & Deductions */}
                  <Grid size={{ xs: 12, lg: 7 }}>
                    <Stack spacing={3}>
                      {/* Card A: Earnings & Allowances */}
                      <Box
                        sx={{
                          p: { xs: 2.5, sm: 3 },
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
                        }}
                      >
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5} sx={{ mb: 2.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2.25,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                color: "primary.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <PaymentsOutlined fontSize="small" />
                            </Box>
                            <div>
                              <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "text.primary", fontSize: "0.95rem" }}>
                                Earnings & Allowances
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Monthly recurring compensation components
                              </Typography>
                            </div>
                          </Stack>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.75,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                              border: "1px solid",
                              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                            }}
                          >
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.72rem" }}>
                              Total Gross:
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: "primary.main", fontWeight: 800, fontSize: "0.85rem", lineHeight: 1 }}>
                              {formatInr(monthlyGross)}
                              <Typography component="span" variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.7rem", ml: 0.35 }}>
                                / mo
                              </Typography>
                            </Typography>
                          </Box>
                        </Stack>

                        <Grid container spacing={2}>
                          {/* Basic Pay anchor across full row */}
                          <Grid size={{ xs: 12 }}>
                            <CurrencyInput
                              label={i({ id: "EMPLOYEE.SALARY.BASIC_PAY" })}
                              required
                              name="basicPay"
                              helperText="Core foundational component for statutory calculations (PF, Gratuity, and HRA exemption)."
                            />
                          </Grid>

                          {/* Remaining allowances in balanced 2-column grid */}
                          {componentEnabled("HRA") && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <CurrencyInput
                                label={i({ id: "EMPLOYEE.SALARY.HRA" })}
                                name="hra"
                                {...componentInputGuidance("HRA")}
                              />
                            </Grid>
                          )}
                          {componentEnabled("LTA") && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <CurrencyInput
                                label={i({ id: "EMPLOYEE.SALARY.LTA" })}
                                name="lta"
                                {...componentInputGuidance("LTA")}
                              />
                            </Grid>
                          )}
                          {(componentEnabled("SPECIAL_ALLOWANCE") || componentEnabled("OTHER_ALLOWANCE")) && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <CurrencyInput
                                label={
                                  salaryComponentDefinitions.find((c) => {
                                    const code = c.code.trim().toUpperCase();
                                    return (code === "SPECIAL_ALLOWANCE" || code === "OTHER_ALLOWANCE") &&
                                      isEmployeePayrollComponentEligible(salaryComponentDefinitions, code, salaryEffectiveDate);
                                  })?.name || (salaryComponentDefinitions.some((c) => c.code.trim().toUpperCase() === "SPECIAL_ALLOWANCE") ? "Special Allowance" : i({ id: "EMPLOYEE.SALARY.OTHER_ALLOWANCE" }))
                                }
                                name="otherAllowance"
                                {...componentInputGuidance(componentEnabled("SPECIAL_ALLOWANCE") ? "SPECIAL_ALLOWANCE" : "OTHER_ALLOWANCE")}
                              />
                            </Grid>
                          )}
                          {bonusEnabled && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <CurrencyInput
                                label={i({ id: "EMPLOYEE.SALARY.BONUS" })}
                                name="bonus"
                                {...componentInputGuidance("BONUS")}
                              />
                            </Grid>
                          )}
                          {activeTemplateComponents
                            .filter((component) => !fixedComponentCodes.has(component.code.toUpperCase()) && component.kind.toUpperCase() !== "DEDUCTION")
                            .map((component) => (
                              <Grid size={{ xs: 12, sm: 6 }} key={component.code}>
                                <CurrencyInput
                                  label={component.name}
                                  name={component.code.toUpperCase()}
                                  {...getSalaryComponentInputGuidance(component)}
                                />
                              </Grid>
                            ))}
                          {importedSalaryComponents
                            .filter((component) => component.kind.toUpperCase() !== "DEDUCTION")
                            .map((component) => (
                              <Grid size={{ xs: 12, sm: 6 }} key={`imported-${component.componentCode}`}>
                                <CurrencyInput
                                  label={component.componentName}
                                  name={component.componentCode.toUpperCase()}
                                  {...getSalaryComponentInputGuidance(component)}
                                />
                              </Grid>
                            ))}
                          {salaryComponentDefinitions.length > 0 && (!componentEnabled("HRA") || !componentEnabled("LTA") || !bonusEnabled) && (
                            <Grid size={{ xs: 12 }}>
                              <Box
                                sx={{
                                  p: 1.25,
                                  borderRadius: 2,
                                  border: "1px dashed",
                                  borderColor: "divider",
                                  bgcolor: "action.hover",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                  <Typography variant="caption" color="text.secondary" fontWeight={650}>
                                    Unconfigured in Company Catalog:
                                  </Typography>
                                  {!componentEnabled("HRA") && <Chip size="small" label="HRA" variant="outlined" sx={{ height: 20, fontSize: "0.68rem" }} />}
                                  {!componentEnabled("LTA") && <Chip size="small" label="LTA" variant="outlined" sx={{ height: 20, fontSize: "0.68rem" }} />}
                                  {!bonusEnabled && <Chip size="small" label="Bonus" variant="outlined" sx={{ height: 20, fontSize: "0.68rem" }} />}
                                </Stack>
                                <Typography
                                  component="a"
                                  href="/admin/companydetails/payroll-configuration"
                                  target="_blank"
                                  rel="noreferrer"
                                  variant="caption"
                                  sx={{
                                    color: "primary.main",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                    fontSize: "0.74rem",
                                    "&:hover": { textDecoration: "underline" },
                                  }}
                                >
                                  Configure in Payroll Settings ↗
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Box>

                      {/* Card B: Deductions & Retentions */}
                      <Box
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
                        }}
                      >
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5} sx={{ mb: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                color: "error.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <AccountBalanceWalletOutlined fontSize="small" />
                            </Box>
                            <div>
                              <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "text.primary", fontSize: "0.92rem" }}>
                                Deductions & Retentions
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Voluntary monthly withholdings and benefit premiums
                              </Typography>
                            </div>
                          </Stack>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.75,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
                              border: "1px solid",
                              borderColor: (theme) => alpha(theme.palette.error.main, 0.18),
                            }}
                          >
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.72rem" }}>
                              Total Deductions:
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: "error.main", fontWeight: 800, fontSize: "0.85rem", lineHeight: 1 }}>
                              {formatInr(monthlyDeductions)}
                              <Typography component="span" variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.7rem", ml: 0.35 }}>
                                / mo
                              </Typography>
                            </Typography>
                          </Box>
                        </Stack>

                        <Grid container spacing={2}>
                          {componentEnabled("HEALTH_INSURANCE") && (
                            <Grid size={{ xs: 12 }}>
                              <CurrencyInput
                                label={i({ id: "EMPLOYEE.SALARY.HEALTH_INSURANCE" })}
                                name="healthInsurance"
                                {...componentInputGuidance("HEALTH_INSURANCE")}
                              />
                            </Grid>
                          )}
                          {activeTemplateComponents
                            .filter((component) => !fixedComponentCodes.has(component.code.toUpperCase()) && component.kind.toUpperCase() === "DEDUCTION")
                            .map((component) => (
                              <Grid size={{ xs: 12, sm: 6 }} key={component.code}>
                                <CurrencyInput
                                  label={`${component.name} (deduction)`}
                                  name={component.code.toUpperCase()}
                                  {...getSalaryComponentInputGuidance(component)}
                                />
                              </Grid>
                            ))}
                          {importedSalaryComponents
                            .filter((component) => component.kind.toUpperCase() === "DEDUCTION")
                            .map((component) => (
                              <Grid size={{ xs: 12, sm: 6 }} key={`imported-${component.componentCode}`}>
                                <CurrencyInput
                                  label={`${component.componentName} (deduction)`}
                                  name={component.componentCode.toUpperCase()}
                                  {...getSalaryComponentInputGuidance(component)}
                                />
                              </Grid>
                            ))}

                          {/* Statutory Taxes & Funds full-width info box */}
                          <Grid size={{ xs: 12 }}>
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
                                border: "1px solid",
                                borderColor: (theme) => alpha(theme.palette.info.main, 0.15),
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1.25,
                              }}
                            >
                              <InfoOutlined fontSize="small" color="info" sx={{ mt: 0.2, fontSize: "1.1rem" }} />
                              <div>
                                <Typography variant="caption" fontWeight={750} color="text.primary" sx={{ display: "block" }}>
                                  Statutory Taxes & Funds
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", lineHeight: 1.4 }}>
                                  EPF (12%), ESIC, PT, and TDS are automatically computed during the payroll execution run.
                                </Typography>
                              </div>
                            </Box>
                          </Grid>

                          {salaryComponentDefinitions.length > 0 && !componentEnabled("HEALTH_INSURANCE") && (
                            <Grid size={{ xs: 12 }}>
                              <Box
                                sx={{
                                  p: 1.25,
                                  borderRadius: 2,
                                  border: "1px dashed",
                                  borderColor: "divider",
                                  bgcolor: "action.hover",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="text.secondary" fontWeight={650}>
                                    Unconfigured in Company Catalog:
                                  </Typography>
                                  <Chip size="small" label="Health Insurance" variant="outlined" sx={{ height: 20, fontSize: "0.68rem" }} />
                                </Stack>
                                <Typography
                                  component="a"
                                  href="/admin/companydetails/payroll-configuration"
                                  target="_blank"
                                  rel="noreferrer"
                                  variant="caption"
                                  sx={{
                                    color: "primary.main",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                    fontSize: "0.74rem",
                                    "&:hover": { textDecoration: "underline" },
                                  }}
                                >
                                  Configure in Payroll Settings ↗
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* RIGHT COLUMN: Classification & Schedule */}
                  <Grid size={{ xs: 12, lg: 5 }}>
                    <Stack spacing={2.5}>
                      {/* Card C: Payroll Classification */}
                      <Box
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <PaymentsOutlined fontSize="small" />
                          </Box>
                          <div>
                            <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "text.primary", fontSize: "0.92rem" }}>
                              Payroll Classification
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Assign template rules and schedule group
                            </Typography>
                          </div>
                        </Stack>

                        <Stack spacing={2}>
                          {salaryTemplates.length > 0 && (
                            <FormControl fullWidth size="small">
                              <InputLabel id="salary-template-label">Salary template</InputLabel>
                              <AppSelect
                                labelId="salary-template-label"
                                value={selectedTemplateId}
                                label="Salary template"
                                onChange={(event) => {
                                  const templateId = String(event.target.value);
                                  const template = salaryTemplates.find((item) => item.id === templateId);
                                  setSelectedTemplateId(templateId);
                                  if (!template) return;
                                  setSelectedPayGroupId(template.payGroupId ?? "");
                                  setImportedSalaryComponents([]);
                                  const templateValues = salaryTemplateValues(template);
                                  const fixedValues: Record<string, number> = {};
                                  Object.entries(fixedComponentFields).forEach(([code, field]) => {
                                    if (code === "BASIC_PAY") return;
                                    if (code === "SPECIAL_ALLOWANCE" || code === "OTHER_ALLOWANCE") {
                                      const val = templateValues["SPECIAL_ALLOWANCE"] || templateValues["OTHER_ALLOWANCE"] || 0;
                                      fixedValues["otherAllowance"] = val;
                                      return;
                                    }
                                    fixedValues[field] = templateValues[code] ?? 0;
                                  });
                                  Object.entries(fixedValues).forEach(([field, value]) => setFieldValue(field, value));
                                  const templateEffectiveFrom = values.effectiveFrom ? dayjs(values.effectiveFrom).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
                                  resolveEmployeePayrollComponents(salaryComponentDefinitions, template.components ?? [], templateEffectiveFrom)
                                    .filter((component) => !fixedComponentFields[component.code.trim().toUpperCase()])
                                    .forEach((component) => setFieldValue(component.code.trim().toUpperCase(), templateValues[component.code.trim().toUpperCase()] ?? 0));
                                }}
                              >
                                <MenuItem value=""><em>Manual structure</em></MenuItem>
                                {salaryTemplates.map((template) => (
                                  <MenuItem key={template.id ?? template.name} value={template.id ?? ""}>{template.name}</MenuItem>
                                ))}
                              </AppSelect>
                            </FormControl>
                          )}

                          <FormControl fullWidth size="small">
                            <InputLabel id="employee-pay-group-label">Payroll pay group</InputLabel>
                            <AppSelect
                              labelId="employee-pay-group-label"
                              value={selectedPayGroupId}
                              label="Payroll pay group"
                              onChange={(event) => setSelectedPayGroupId(String(event.target.value))}
                            >
                              <MenuItem value=""><em>Use the selected template's pay group</em></MenuItem>
                              {selectedPayGroupId && !payGroups.some((group) => group.id === selectedPayGroupId) && (
                                <MenuItem value={selectedPayGroupId} disabled>Unavailable pay group: {selectedPayGroupId}</MenuItem>
                              )}
                              {payGroups.map((group) => (
                                <MenuItem key={group.id ?? group.name} value={group.id ?? ""}>{group.name}</MenuItem>
                              ))}
                            </AppSelect>
                          </FormControl>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: -0.5, lineHeight: 1.45 }}>
                            This group supplies the employee's payroll schedule and statutory-policy default unless an approved employee assignment overrides it.
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Card D: Validity & Effective Period */}
                      <Box
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CalendarMonthOutlined fontSize="small" />
                          </Box>
                          <div>
                            <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "text.primary", fontSize: "0.92rem" }}>
                              When does this salary apply?
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Define effective date boundaries for this salary version
                            </Typography>
                          </div>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, lineHeight: 1.45 }}>
                          These dates define one salary version. Payroll uses the version covering each pay date; a later approved change creates a new version.
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomisedDatePicker
                              label={i({ id: "EMPLOYEE.SALARY.EFFECTIVE_FROM" })}
                              value={values.effectiveFrom ? dayjs(values.effectiveFrom) : null}
                              setValue={(newDate: Dayjs | null) => {
                                setFieldTouched("effectiveFrom", true);
                                setFieldValue("effectiveFrom", newDate);
                              }}
                              name="effectiveFrom"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, fontSize: "0.72rem", lineHeight: 1.35 }}>
                              Start date: prefilled from joining date. Change it only when the approved offer or salary start date differs.
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomisedDatePicker
                              label={i({ id: "EMPLOYEE.SALARY.EFFECTIVE_TO" })}
                              value={values.effectiveTo ? dayjs(values.effectiveTo) : null}
                              setValue={(newDate: Dayjs | null) => {
                                setFieldTouched("effectiveTo", true);
                              }}
                              name="effectiveTo"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, fontSize: "0.72rem", lineHeight: 1.35 }}>
                              Optional end date. Leave blank for the current version. When a new version starts, the prior one normally ends the day before.
                            </Typography>
                          </Grid>
                        </Grid>

                        {values.effectiveTo && values.effectiveFrom && dayjs(values.effectiveTo).isBefore(dayjs(values.effectiveFrom), "day") && (
                          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                            End date must be on or after the start date.
                          </Alert>
                        )}

                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "action.hover",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.25,
                          }}
                        >
                          <InfoOutlined fontSize="small" color="info" sx={{ mt: 0.2, fontSize: "1.1rem" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
                            Payroll cadence: monthly. Employee payment timing follows the assigned payroll pay group; weekly, biweekly, quarterly, and annual payroll runs are not currently supported.
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </form>
          );
        }}
      </Formik>
    </Stack>
  );
};
