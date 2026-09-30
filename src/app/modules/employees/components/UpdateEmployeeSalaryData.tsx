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
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import { CloudUploadRounded } from "@mui/icons-material";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import { useIntl } from "react-intl";
import { getPayrollSalaryTemplates, previewEmployeeSalaryImport, previewEmployeeSalaryPdf, saveEmployeeSalaryStructure } from "../../payroll/services";
import { EmployeeSalaryImportRowModel, EmployeeSalaryStructureModel, PayrollSalaryTemplateModel } from "../../payroll/models";
import { salaryValidationSchema } from "../../../../utils/Schema/salaryValidationSchema";
import { rowToImport } from "../../payrollsettings/components/salaryImportMapping";
import * as XLSX from "xlsx";

import { CurrencyInput } from "../../../shared/components/form-component/CurrencyInput";
interface PropsTypes {
  userId: string;
  employeeId: string;
  onUserUpdate: (success: boolean) => void | Promise<void>;
  formRef: React.MutableRefObject<FormikProps<CreateEmployeeSalary> | null>;
  handleButtonLoading: (loading: boolean) => void;
  // pre-fills the form with the employee's current active salary when editing one that
  // already exists; omit for a brand new employee who has no salary yet
  existingSalary?: SalaryModel | null;
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

export const UpdateEmployeeSalaryData = (props: PropsTypes) => {
  const {
    userId,
    employeeId,
    onUserUpdate,
    formRef,
    handleButtonLoading,
    existingSalary,
  } = props;
  const { formatMessage: i } = useIntl();
  const [salaryTemplates, setSalaryTemplates] = useState<PayrollSalaryTemplateModel[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isImportingSalary, setIsImportingSalary] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ severity: "success" | "error"; message: string } | null>(null);
  const salaryFileInput = useRef<HTMLInputElement>(null);
  const fixedComponentCodes = new Set(["BASIC", "HRA", "LTA", "OTHER_ALLOWANCE", "BONUS", "HEALTH_INSURANCE", "TOTAL_DEDUCTIONS"]);

  useEffect(() => {
    void getPayrollSalaryTemplates().then((response) => {
      setSalaryTemplates((response.data ?? []).filter((template) => template.isActive));
    }).catch(() => setSalaryTemplates([]));
  }, []);

  async function UpadteSalaryData(
    values: CreateEmployeeSalary,
    setSubmittng: (isSubmitting: boolean) => void,
  ) {
    try {
      const effectiveFrom = values.effectiveFrom
        ? dayjs(values.effectiveFrom).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");
      const effectiveTo = values.effectiveTo
        ? dayjs(values.effectiveTo).format("YYYY-MM-DD")
        : null;
      const monthlyGross =
        Number(values.basicPay || 0) +
        Number(values.hra || 0) +
        Number(values.lta || 0) +
        Number(values.otherAllowance || 0) +
        Number(values.bonus || 0);
      const fixedComponents = [
        ["BASIC", "Basic Pay", values.basicPay, true, "EARNING"], ["HRA", "HRA", values.hra, true, "EARNING"],
        ["LTA", "LTA", values.lta, true, "EARNING"], ["OTHER_ALLOWANCE", "Other Allowance", values.otherAllowance, true, "EARNING"],
        ["BONUS", "Bonus", values.bonus, false, "EARNING"], ["HEALTH_INSURANCE", "Health Insurance", values.healthInsurance, false, "EARNING"],
        ["TOTAL_DEDUCTIONS", "Total Deductions", values.totalDeductions, false, "DEDUCTION"],
      ].map(([componentCode, componentName, value, isRecurring, kind]) => ({
        componentCode: componentCode as string, componentName: componentName as string, kind: kind as "EARNING" | "DEDUCTION",
        value: Number(value || 0), calculationType: "FIXED", isTaxable: kind !== "DEDUCTION", isRecurring: Boolean(isRecurring),
        isStatutory: false, isEmployerContribution: false,
      }));
      const configuredComponents = (salaryTemplates.find((template) => template.id === selectedTemplateId)?.components ?? [])
        .filter((component) => !fixedComponentCodes.has(component.code.toUpperCase()))
        .map((component) => ({ componentCode: component.code.toUpperCase(), componentName: component.name, kind: component.kind,
          value: Number((values as CreateEmployeeSalary & Record<string, unknown>)[component.code.toUpperCase()] || 0), calculationType: component.calculationType,
          baseComponentCode: component.baseComponentCode, isTaxable: component.isTaxable, isRecurring: true, isStatutory: false, isEmployerContribution: false }));
      const canonicalPayload: EmployeeSalaryStructureModel = {
        employeeId,
        userId,
        currency: "INR",
        paymentFrequency: values.paymentFrequency || "Monthly",
        annualCtc: monthlyGross * 12,
        monthlyGross,
        effectiveFrom,
        effectiveTo,
        status: "DRAFT",
        approvalStatus: "DRAFT",
        source: "ONBOARDING_MANUAL",
        version: 1,
        components: [...fixedComponents, ...configuredComponents],
      };
      const response = await saveEmployeeSalaryStructure(canonicalPayload);
      await onUserUpdate(Boolean(response.data.success));
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setSubmittng(false);
      handleButtonLoading(false);
    }
  }
  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Formik
        initialValues={{
          ...employeeSalaryInitialValues,
          ...(existingSalary && {
            basicPay: existingSalary.basicPay,
            hra: existingSalary.hra,
            lta: existingSalary.lta,
            otherAllowance: existingSalary.otherAllowance,
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
          const handleSalaryFile = async (file?: File) => {
            if (!file) return;
            setIsImportingSalary(true);
            setImportFeedback(null);
            try {
              let importedRow: EmployeeSalaryImportRowModel;
              if (file.name.toLowerCase().endsWith(".pdf")) {
                const response = await previewEmployeeSalaryPdf(file);
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
                importedRow = rowToImport(sourceRow, rowIndex >= 0 ? rowIndex + 2 : 2);
              }

              if (importedRow.employeeId && importedRow.employeeId.trim().toLowerCase() !== employeeId.trim().toLowerCase()) {
                throw new Error(`The salary document is for ${importedRow.employeeId}, not this employee (${employeeId}).`);
              }
              importedRow.employeeId = employeeId;
              importedRow.userId = userId;
              const preview = await previewEmployeeSalaryImport([importedRow]);
              const validation = preview.data?.[0];
              if (!validation?.isValid) {
                throw new Error(validation?.errors?.join(" ") || "Salary data did not pass payroll validation.");
              }

              const formFieldByCode: Record<string, keyof CreateEmployeeSalary> = {
                BASIC: "basicPay", BASIC_PAY: "basicPay", HRA: "hra", LTA: "lta",
                OTHER_ALLOWANCE: "otherAllowance", BONUS: "bonus", HEALTH_INSURANCE: "healthInsurance",
                TOTAL_DEDUCTIONS: "totalDeductions",
              };
              importedRow.components.forEach((component) => {
                const field = formFieldByCode[component.componentCode.toUpperCase()];
                if (field) void setFieldValue(field, component.value);
              });
              if (importedRow.effectiveFrom) void setFieldValue("effectiveFrom", dayjs(importedRow.effectiveFrom));
              void setFieldValue("effectiveTo", importedRow.effectiveTo ? dayjs(importedRow.effectiveTo) : null);
              void setFieldValue("paymentFrequency", importedRow.paymentFrequency || "Monthly");
              setSelectedTemplateId("");
              setImportFeedback({ severity: "success", message: "Import validated. Review the extracted salary values and effective dates below; saving creates a draft that still needs approval." });
            } catch (error) {
              setImportFeedback({ severity: "error", message: error instanceof Error ? error.message : "Unable to import this salary document." });
            } finally {
              setIsImportingSalary(false);
            }
          };

          return (
            <form onSubmit={handleSubmit}>
              <Stack spacing={1}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "center" }}>
                  <input ref={salaryFileInput} hidden type="file" accept=".pdf,.xlsx,.xls" onChange={(event) => { void handleSalaryFile(event.target.files?.[0]); event.target.value = ""; }} />
                  <Button type="button" variant="outlined" startIcon={<CloudUploadRounded />} disabled={isImportingSalary} onClick={() => salaryFileInput.current?.click()}>
                    {isImportingSalary ? "Reading salary document…" : "Import offer salary (PDF / Excel)"}
                  </Button>
                  <Typography variant="caption" color="text.secondary">The file is previewed and checked before it fills this form; it is not saved automatically.</Typography>
                </Stack>
                {importFeedback && <Alert severity={importFeedback.severity}>{importFeedback.message}</Alert>}
                {salaryTemplates.length > 0 && (
                  <FormControl fullWidth>
                    <InputLabel id="salary-template-label">Salary template</InputLabel>
                    <AppSelect
                      labelId="salary-template-label"
                      value={selectedTemplateId}
                      label="Salary template"
                      onChange={(event) => {
                        const templateId = String(event.target.value);
                        const template = salaryTemplates.find((item) => item.id === templateId);
                        setSelectedTemplateId(templateId);
                        template?.components.forEach((component) => {
                          const fieldByCode: Record<string, keyof CreateEmployeeSalary> = {
                            BASIC: "basicPay",
                            HRA: "hra",
                            LTA: "lta",
                            OTHER_ALLOWANCE: "otherAllowance",
                            BONUS: "bonus",
                            HEALTH_INSURANCE: "healthInsurance",
                            TOTAL_DEDUCTIONS: "totalDeductions",
                          };
                          const field = fieldByCode[component.code.toUpperCase()];
                          if (field) setFieldValue(field, component.value);
                          else setFieldValue(component.code.toUpperCase(), component.value);
                        });
                      }}
                    >
                      <MenuItem value=""><em>Manual structure</em></MenuItem>
                      {salaryTemplates.map((template) => (
                        <MenuItem key={template.id ?? template.name} value={template.id ?? ""}>{template.name}</MenuItem>
                      ))}
                    </AppSelect>
                  </FormControl>
                )}
                <Grid container spacing={2}>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.BASIC_PAY" })}
                      required
                      name="basicPay"
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.HRA" })}
                      name="hra"
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.LTA" })}
                      name="lta"
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.OTHER_ALLOWANCE" })}
                      name="otherAllowance"
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.BONUS" })}
                      name="bonus"
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.HEALTH_INSURANCE" })}
                      name="healthInsurance"
                    />
                  </Grid>
                  <Grid size={12} sx={{ marginTop: "10px" }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.TOTAL_DEDUCTIONS" })}
                      name="totalDeductions"
                    />
                  </Grid>
                  {(salaryTemplates.find((template) => template.id === selectedTemplateId)?.components ?? [])
                    .filter((component) => !fixedComponentCodes.has(component.code.toUpperCase()))
                    .map((component) => (
                      <Grid size={{ md: 6, sm: 12, xs: 12 }} key={component.code}>
                        <CurrencyInput label={component.name} name={component.code.toUpperCase()} />
                      </Grid>
                    ))}
                  <Grid size={12}>
                    <CustomisedDatePicker
                      label={i({ id: "EMPLOYEE.SALARY.EFFECTIVE_FROM" })}
                      value={
                        values.effectiveFrom
                          ? dayjs(values.effectiveFrom)
                          : null
                      }
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("effectiveFrom", true);
                        setFieldValue("effectiveFrom", newDate);
                      }}
                      name="effectiveFrom"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      The first date this salary version applies. Use the approved offer/start date; payroll uses this date to choose the correct salary version.
                    </Typography>
                  </Grid>

                  <Grid size={12}>
                    <CustomisedDatePicker
                      label={i({ id: "EMPLOYEE.SALARY.EFFECTIVE_TO" })}
                      value={
                        values.effectiveTo ? dayjs(values.effectiveTo) : null
                      }
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("effectiveTo", true);
                        setFieldValue("effectiveTo", newDate);
                      }}
                      name="effectiveTo"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      Optional last date for this version. Leave blank while it remains current. For a salary change, close this version the day before the new version starts.
                    </Typography>
                    {values.effectiveTo && values.effectiveFrom && dayjs(values.effectiveTo).isBefore(dayjs(values.effectiveFrom), "day") && (
                      <Alert severity="error" sx={{ mt: 1 }}>Effective to must be on or after Effective from.</Alert>
                    )}
                  </Grid>
                  <Grid size={12}>
                    <div>
                      <FormControl
                        sx={{ minWidth: 80, width: "100%", marginTop: "10px" }}
                      >
                        <InputLabel id="demo-simple-select-autowidth-label">
                          {i({ id: "EMPLOYEE.SALARY.PAYMENT_FREQUENCY" })}
                        </InputLabel>
                        <AppSelect
                          labelId="demo-simple-select-autowidth-label"
                          id="demo-simple-select-autowidth"
                          value={values.paymentFrequency}
                          onChange={(e) => {
                            setFieldValue("paymentFrequency", e.target.value);
                          }}
                          autoWidth
                          label="Payment Frequency"
                          name="paymentFrequency"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          <MenuItem value="Monthly">
                            {i({ id: "LEAVE.ACCRUAL_PERIOD.MONTHLY" })}
                          </MenuItem>
                          <MenuItem value="Quaterly">
                            {i({ id: "LEAVE.ACCRUAL_PERIOD.QUARTERLY" })}
                          </MenuItem>
                          <MenuItem value="Yearly">
                            {i({ id: "LEAVE.ACCRUAL_PERIOD.YEARLY" })}
                          </MenuItem>
                        </AppSelect>
                      </FormControl>
                    </div>
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
