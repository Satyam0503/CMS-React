import {
  AddRounded,
  BadgeOutlined,
  CheckCircleRounded,
  CloudUploadRounded,
  FolderOffOutlined,
  GroupsOutlined,
  HourglassEmptyRounded,
  ReceiptLongOutlined,
  RefreshRounded,
  RestartAltRounded,
  SaveRounded,
  SearchRounded,
  TuneRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { getRequest, postRequest } from "../../../../server/axios";
import { AppButton } from "../../../shared/components/ui";
import { toast } from "react-toastify";
import { currencyFormatter } from "../../../../utils/common";
import { getAllEmployees } from "../../employees/employeeServices";
import type { GetAllEmployeeResponseModel } from "../../employees/models";
import { EmployeeSalaryImportPanel } from "./EmployeeSalaryImportPanel";
import { PayrollPolicyFields } from "./PayrollPolicyFields";

export type PayrollDivisorPolicyConfig = {
  id?: string;
  payrollMode: "Startup" | "Standard" | "Enterprise";
  divisorPolicy: "CALENDAR_DAYS" | "FIXED_30_DAYS" | "WORKING_DAYS";
  lopCalculationBase: "FIXED_GROSS" | "BASIC_ONLY";
  epfMode: "EXEMPT" | "CAPPED_CEILING" | "ACTUAL_BASIC_12";
  epfWageCeiling: number;
  esicMode: "EXEMPT" | "STATUTORY";
  esicWageCeiling: number;
  tdsMode: "AUTO_NEW_REGIME" | "AUTO_OLD_REGIME" | "MANUAL_ONLY";
  requireAttendanceLock: boolean;
  effectiveFrom: string;
  isActive: boolean;
  version: number;
};

type PayGroup = {
  id?: string;
  name: string;
  schedule: string;
  policyProfileId?: string;
  effectiveFrom: string;
  isActive: boolean;
};


type StatutoryProfile = {
  id?: string;
  name: string;
  version: number;
  statutoryJurisdiction: string;
  financialYear: string;
  statutoryRuleVersion: string;
  approvalStatus: "DRAFT" | "SUBMITTED" | "APPROVED" | string;
  submittedBy?: string;
  approvedBy?: string;
  divisorPolicy: "CALENDAR_DAYS" | "FIXED_30_DAYS" | "WORKING_DAYS";
  requireAttendanceLock: boolean;
  epfMode: "EXEMPT" | "CAPPED_CEILING" | "ACTUAL_BASIC_12";
  epfWageCeiling: number;
  esicMode: "EXEMPT" | "STATUTORY";

  esicWageCeiling: number;
  tdsMode: "AUTO_NEW_REGIME" | "AUTO_OLD_REGIME" | "MANUAL_ONLY";
  scope?: "COMPANY_DEFAULT" | "ASSIGNMENT_ONLY";
  createdBy?: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};
type SalaryComponent = {
  id?: string;
  code: string;
  name: string;
  kind: "EARNING" | "DEDUCTION";
  calculationType: "FIXED" | "PERCENT_OF_GROSS" | "PERCENT_OF_COMPONENT";
  baseComponentCode?: string;
  isTaxable: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  version: number;
};

type Template = {
  id?: string;
  name: string;
  payGroupId?: string;
  basicPay?: number;
  hra?: number;
  lta?: number;
  otherAllowance?: number;
  bonus?: number;
  components?: Array<{
    componentId?: string;
    code: string;
    name: string;
    kind: SalaryComponent["kind"];
    calculationType: SalaryComponent["calculationType"];
    baseComponentCode?: string;
    value: number;
    isTaxable: boolean;
    sortOrder: number;
  }>;
  effectiveFrom: string;
  isActive: boolean;
};

type Assignment = {
  id?: string;
  employeeId: string;
  payGroupId?: string;
  salaryTemplateId?: string;
  policyProfileId?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isApproved: boolean;
};

const defaultPolicy = (): PayrollDivisorPolicyConfig => ({
  payrollMode: "Standard",
  divisorPolicy: "CALENDAR_DAYS",
  lopCalculationBase: "FIXED_GROSS",
  epfMode: "CAPPED_CEILING",
  epfWageCeiling: 15000,
  esicMode: "STATUTORY",
  esicWageCeiling: 21000,
  tdsMode: "AUTO_NEW_REGIME",
  requireAttendanceLock: true,
  effectiveFrom: dayjs().startOf("month").format("YYYY-MM-01"),
  isActive: true,
  version: 1,
});

export function PayrollConfigurationPanel({ canEdit, canApprove }: { canEdit: boolean; canApprove: boolean }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [activeTab, setActiveTab] = useState<"policy" | "components" | "groups" | "templates" | "assignments" | "salary-import">("policy");

  // Statutory Policy State
  const [policyConfig, setPolicyConfig] = useState<PayrollDivisorPolicyConfig>(defaultPolicy);
  const [companyPolicyDefaults, setCompanyPolicyDefaults] = useState<PayrollDivisorPolicyConfig>(defaultPolicy);
  const [activeApprovedProfile, setActiveApprovedProfile] = useState<StatutoryProfile | null>(null);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Pay Group State
  const [groups, setGroups] = useState<PayGroup[]>([]);
  const [statutoryProfiles, setStatutoryProfiles] = useState<StatutoryProfile[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupPolicyId, setGroupPolicyId] = useState("");
  const [policyName, setPolicyName] = useState("Standard statutory profile");
  const [policyScope, setPolicyScope] = useState<"COMPANY_DEFAULT" | "ASSIGNMENT_ONLY">("COMPANY_DEFAULT");
  const [policyEffectiveFrom, setPolicyEffectiveFrom] = useState(() => dayjs().format("YYYY-MM"));
  const [policyEffectiveTo, setPolicyEffectiveTo] = useState("");
  const [statutoryJurisdiction, setStatutoryJurisdiction] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [statutoryRuleVersion, setStatutoryRuleVersion] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [groupIsActive, setGroupIsActive] = useState(true);

  // Salary Component State
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [componentId, setComponentId] = useState<string | undefined>();
  const [componentVersion, setComponentVersion] = useState(0);
  const [componentCode, setComponentCode] = useState("");
  const [componentName, setComponentName] = useState("");
  const [componentKind, setComponentKind] = useState<SalaryComponent["kind"]>("EARNING");
  const [componentCalculationType, setComponentCalculationType] = useState<SalaryComponent["calculationType"]>("FIXED");
  const [componentBaseCode, setComponentBaseCode] = useState("");
  const [componentTaxable, setComponentTaxable] = useState(true);
  const [componentEffectiveFrom, setComponentEffectiveFrom] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [componentEffectiveTo, setComponentEffectiveTo] = useState("");

  // Salary Template State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templateBasic, setTemplateBasic] = useState("");
  const [templateHra, setTemplateHra] = useState("");
  const [templateLta, setTemplateLta] = useState("");
  const [templateOther, setTemplateOther] = useState("");
  const [templateBonus, setTemplateBonus] = useState("");
  const [templateBonusIncluded, setTemplateBonusIncluded] = useState(false);
  const [templateComponentValues, setTemplateComponentValues] = useState<Record<string, string>>({});
  const [templateGroupId, setTemplateGroupId] = useState("");
  const [templateIsActive, setTemplateIsActive] = useState(true);

  // Assignment State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [assignmentGroupId, setAssignmentGroupId] = useState("");
  const [assignmentTemplateId, setAssignmentTemplateId] = useState("");
  const [assignmentPolicyId, setAssignmentPolicyId] = useState("");
  const [assignmentEffectiveFrom, setAssignmentEffectiveFrom] = useState(() => dayjs().startOf("month").format("YYYY-MM-DD"));

  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const month = dayjs().startOf("month").format("YYYY-MM-01");
      const [polRes, gRes, tRes, aRes, cRes, profilesRes] = await Promise.all([
        getRequest<PayrollDivisorPolicyConfig>("api/payroll/divisor-policy", { params: { month } }),
        getRequest<PayGroup[]>("api/payroll/configuration/pay-groups"),
        getRequest<Template[]>("api/payroll/configuration/salary-templates"),
        getRequest<Assignment[]>("api/payroll/configuration/assignments"),
        getRequest<SalaryComponent[]>("api/payroll/configuration/components"),
        getRequest<StatutoryProfile[]>("api/payroll/configuration/policies"),
      ]);

      const effectiveDay = dayjs(month).startOf("day");
      const approvedProfile = (profilesRes.data ?? [])
        .filter((profile) => profile.isActive && profile.approvalStatus === "APPROVED" && profile.scope !== "ASSIGNMENT_ONLY" &&
          dayjs(profile.effectiveFrom).startOf("day").valueOf() <= effectiveDay.valueOf() &&
          (!profile.effectiveTo || dayjs(profile.effectiveTo).startOf("day").valueOf() >= effectiveDay.valueOf()))
        .sort((left, right) => dayjs(right.effectiveFrom).valueOf() - dayjs(left.effectiveFrom).valueOf() || right.version - left.version)[0];
      setActiveApprovedProfile(approvedProfile ?? null);
      const defaults = { ...defaultPolicy(), ...(polRes.data ?? {}) };
      setCompanyPolicyDefaults(defaults);
      setPolicyConfig({
        ...defaults,
        ...(approvedProfile ? {
          divisorPolicy: approvedProfile.divisorPolicy,
          requireAttendanceLock: approvedProfile.requireAttendanceLock,
          epfMode: approvedProfile.epfMode,
          epfWageCeiling: approvedProfile.epfWageCeiling,
          esicMode: approvedProfile.esicMode,
          esicWageCeiling: approvedProfile.esicWageCeiling,
          tdsMode: approvedProfile.tdsMode,
        } : {}),
      });
      setGroups(gRes.data ?? []);
      setTemplates(tRes.data ?? []);
      setAssignments(aRes.data ?? []);
      setComponents(cRes.data ?? []);
      setStatutoryProfiles(profilesRes.data ?? []);
    } catch {
      toast.error("Unable to load payroll configuration. Refresh and retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const saveStatutoryProfile = async () => {
    if (!policyName.trim() || !policyEffectiveFrom) return;
    setIsSavingProfile(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        "api/payroll/configuration/policies",
        {
          name: policyName.trim(),
          scope: policyScope,
          version: 1,
          divisorPolicy: policyConfig.divisorPolicy,
          requireAttendanceLock: policyConfig.requireAttendanceLock,
          epfMode: policyConfig.epfMode,
          epfWageCeiling: policyConfig.epfWageCeiling,
          esicMode: policyConfig.esicMode,
          esicWageCeiling: policyConfig.esicWageCeiling,
          tdsMode: policyConfig.tdsMode,
          statutoryJurisdiction: statutoryJurisdiction.trim(),
          financialYear: financialYear.trim(),
          statutoryRuleVersion: statutoryRuleVersion.trim(),
          effectiveFrom: `${dayjs(policyEffectiveFrom).startOf("month").format("YYYY-MM-DD")}T00:00:00`,
          effectiveTo: policyEffectiveTo ? `${dayjs(policyEffectiveTo).endOf("month").format("YYYY-MM-DD")}T00:00:00` : undefined,
          isActive: true,
        },
      );
      if (!data.success) throw new Error(data.message || "Unable to save statutory profile.");
      toast.success("Statutory profile saved as a draft. Submit it for authorized approval before payroll uses it.");
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save statutory profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const updatePolicyApproval = async (profile: StatutoryProfile, action: "submit" | "approve") => {
    if (!profile.id || (action === "submit" && !canEdit) || (action === "approve" && !canApprove)) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        `api/payroll/configuration/policies/${action}?policyId=${encodeURIComponent(profile.id)}&version=${profile.version}`,
        {},
      );
      if (!data.success) {
        toast.error(data.message || `Unable to ${action} statutory profile.`);
        return;
      }
      await loadAll();
      toast.success(action === "submit" ? "Statutory profile submitted for approval." : "Statutory profile approved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to ${action} statutory profile.`);
    } finally {
      setBusy(false);
    }
  };
  const handleSavePolicy = async () => {
    setIsSavingPolicy(true);
    try {
      const { data } = await postRequest<PayrollDivisorPolicyConfig, { success: boolean; message?: string }>(
        "api/payroll/divisor-policy",
        {
          ...policyConfig,
          // Keep the legacy company fallback separate from an approved profile's effective values.
          // Only the LOP base is not part of the profile; the profile-owned settings remain unchanged here.
          divisorPolicy: companyPolicyDefaults.divisorPolicy,
          requireAttendanceLock: companyPolicyDefaults.requireAttendanceLock,
          epfMode: companyPolicyDefaults.epfMode,
          epfWageCeiling: companyPolicyDefaults.epfWageCeiling,
          esicMode: companyPolicyDefaults.esicMode,
          esicWageCeiling: companyPolicyDefaults.esicWageCeiling,
          tdsMode: companyPolicyDefaults.tdsMode,
          effectiveFrom: dayjs().startOf("month").format("YYYY-MM-01"),
          isActive: true,
        },
      );
      if (data.success) {
        toast.success("Unpaid leave base saved for the current month. Feature and daily-rate changes require an approved policy profile.");
        await loadAll();
      } else {
        toast.error(data.message || "Unable to save payroll policy.");
      }
    } catch {
      toast.error("Unable to save payroll policy.");
    } finally {
      setIsSavingPolicy(false);
    }
  };

  // Save Salary Component
  const saveComponent = async () => {
    if (!componentCode.trim() || !componentName.trim() || !componentEffectiveFrom || (componentEffectiveTo && componentEffectiveTo < componentEffectiveFrom)) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        "api/payroll/configuration/components",
        {
          id: componentId,
          code: componentCode.trim().toUpperCase(),
          name: componentName.trim(),
          kind: componentKind,
          calculationType: componentCalculationType,
          baseComponentCode: componentBaseCode.trim().toUpperCase() || undefined,
          isTaxable: componentTaxable,
          effectiveFrom: `${componentEffectiveFrom}T00:00:00`,
          effectiveTo: componentEffectiveTo ? `${componentEffectiveTo}T00:00:00` : undefined,
          isActive: true,
          version: componentVersion || 1,
        },
      );
      if (data.success) {
        setComponentId(undefined);
        setComponentVersion(0);
        setComponentCode("");
        setComponentName("");
        setComponentBaseCode("");
        setComponentKind("EARNING");
        setComponentCalculationType("FIXED");
        setComponentTaxable(true);
        setComponentEffectiveFrom(dayjs().format("YYYY-MM-DD"));
        setComponentEffectiveTo("");
        await loadAll();
        toast.success("Salary component saved.");
      } else toast.error(data.message || "Unable to save salary component.");
    } catch {
      toast.error("Unable to save salary component.");
    } finally {
      setBusy(false);
    }
  };

  const toggleComponent = async (component: SalaryComponent, isActive: boolean) => {
    if (!component.id || busy) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        "api/payroll/configuration/components",
        {
          id: component.id,
          code: component.code,
          name: component.name,
          kind: component.kind,
          calculationType: component.calculationType,
          baseComponentCode: component.baseComponentCode,
          isTaxable: component.isTaxable,
          effectiveFrom: component.effectiveFrom,
          effectiveTo: component.effectiveTo,
          isActive,
          version: component.version,
        },
      );
      if (!data.success) {
        toast.error(data.message || "Unable to update this payroll component.");
        return;
      }
      await loadAll();
      toast.success(`${component.name} ${isActive ? "included" : "excluded"} for new payroll setups.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update this payroll component.");
    } finally {
      setBusy(false);
    }
  };

  // Save Pay Group
  const saveGroup = async () => {
    if (!groupName.trim()) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        "api/payroll/configuration/pay-groups",
        {
          name: groupName.trim(),
          schedule: "MONTHLY",
          policyProfileId: groupPolicyId || undefined,
          effectiveFrom: new Date().toISOString(),
          isActive: groupIsActive,
        },
      );
      if (data.success) {
        setGroupName("");
        setGroupPolicyId("");
        setGroupIsActive(true);
        await loadAll();
        toast.success("Pay Group created.");
      } else {
        toast.error(data.message || "Unable to save Pay Group.");
      }
    } catch {
      toast.error("Unable to save Pay Group.");
    } finally {
      setBusy(false);
    }
  };

  // Save Salary Template
  const templateBasicNum = Number(templateBasic) || 0;
  const templateHraNum = Number(templateHra) || 0;
  const templateLtaNum = Number(templateLta) || 0;
  const templateOtherNum = Number(templateOther) || 0;
  const templateBonusNum = Number(templateBonus) || 0;
  const totalTemplateMonthly =
    templateBasicNum + templateHraNum + templateLtaNum + templateOtherNum + templateBonusNum;

  const saveTemplate = async () => {
    if (!templateName.trim()) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        "api/payroll/configuration/salary-templates",
        {
          name: templateName.trim(),
          payGroupId: templateGroupId || undefined,
          basicPay: templateBasicNum,
          hra: templateHraNum,
          lta: templateLtaNum,
          otherAllowance: templateOtherNum,
          bonus: templateBonusIncluded ? templateBonusNum : 0,
          components: components
            .filter((component) => component.isActive && component.id && Object.prototype.hasOwnProperty.call(templateComponentValues, component.id))
            .map((component, index) => ({
              componentId: component.id,
              code: component.code,
              name: component.name,
              kind: component.kind,
              calculationType: component.calculationType,
              baseComponentCode: component.baseComponentCode,
              value: Number(templateComponentValues[component.id!]) || 0,
              isTaxable: component.isTaxable,
              sortOrder: index + 100,
            })),
          effectiveFrom: new Date().toISOString(),
          isActive: templateIsActive,
        },
      );
      if (data.success) {
        setTemplateName("");
        setTemplateGroupId("");
        setTemplateBasic("");
        setTemplateHra("");
        setTemplateLta("");
        setTemplateOther("");
        setTemplateBonus("");
        setTemplateBonusIncluded(false);
        setTemplateComponentValues({});
        setTemplateIsActive(true);
        await loadAll();
        toast.success("Salary template created.");
      } else {
        toast.error(data.message || "Unable to save template.");
      }
    } catch {
      toast.error("Unable to save template.");
    } finally {
      setBusy(false);
    }
  };

  // Save Assignment
  const saveAssignment = async () => {
    if (!employeeId.trim() || !assignmentGroupId) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        "api/payroll/configuration/assignments",
        {
          employeeId: employeeId.trim(),
          payGroupId: assignmentGroupId,
          salaryTemplateId: assignmentTemplateId || undefined,
          policyProfileId: assignmentPolicyId || undefined,
          effectiveFrom: `${assignmentEffectiveFrom}T00:00:00`,
        },
      );
      if (data.success) {
        setEmployeeId("");
        setAssignmentGroupId("");
        setAssignmentTemplateId("");
        setAssignmentPolicyId("");
        setAssignmentEffectiveFrom(dayjs().startOf("month").format("YYYY-MM-DD"));
        await loadAll();
        toast.success("Employee assignment saved.");
      } else {
        toast.error(data.message || "Unable to save assignment.");
      }
    } catch {
      toast.error("Unable to save assignment.");
    } finally {
      setBusy(false);
    }
  };

  const previewAssignment = async () => {
    if (!employeeId.trim() || !assignmentGroupId || !assignmentEffectiveFrom) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string; methodResults?: Array<{ employeeId: string; employeeName: string; conflictMessage?: string; canSubmit: boolean }> }>(
        "api/payroll/configuration/assignments/bulk/preview",
        {
          employeeIds: [employeeId.trim()],
          payGroupId: assignmentGroupId,
          salaryTemplateId: assignmentTemplateId || undefined,
          policyProfileId: assignmentPolicyId || undefined,
          effectiveFrom: `${assignmentEffectiveFrom}T00:00:00`,
        },
      );
      const row = data.methodResults?.[0];
      if (!data.success || !row) throw new Error(data.message || "Preview did not return this employee.");
      if (!row.canSubmit) {
        toast.error(row.conflictMessage || "The employee already has an overlapping payroll assignment.");
        return;
      }
      toast.success(`Assignment preview passed for ${row.employeeName || row.employeeId}; it will remain pending approval.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Assignment preview failed.");
    } finally {
      setBusy(false);
    }
  };
  const approveSingleAssignment = async (assignment: Assignment) => {
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        `api/payroll/configuration/assignments/approve?employeeId=${encodeURIComponent(
          assignment.employeeId,
        )}&effectiveFrom=${encodeURIComponent(assignment.effectiveFrom)}`,
        {},
      );
      if (data.success) {
        await loadAll();
        toast.success(`Assignment for ${assignment.employeeId} approved.`);
      } else {
        toast.error(data.message || "Unable to approve assignment.");
      }
    } catch {
      toast.error("Unable to approve assignment.");
    } finally {
      setBusy(false);
    }
  };

  const approveBulkAssignments = async () => {
    if (selectedAssignments.length === 0) return;
    setBusy(true);
    try {
      const pendingToApprove = assignments.filter(
        (a) => !a.isApproved && selectedAssignments.includes(a.employeeId),
      );
      await Promise.all(
        pendingToApprove.map((a) =>
          postRequest<unknown, { success: boolean }>(
            `api/payroll/configuration/assignments/approve?employeeId=${encodeURIComponent(
              a.employeeId,
            )}&effectiveFrom=${encodeURIComponent(a.effectiveFrom)}`,
            {},
          ),
        ),
      );
      toast.success(`${pendingToApprove.length} employee assignment(s) approved.`);
      setSelectedAssignments([]);
      await loadAll();
    } catch {
      toast.error("Failed to approve some assignments.");
    } finally {
      setBusy(false);
    }
  };

  const pendingAssignmentsCount = useMemo(
    () => assignments.filter((a) => !a.isApproved).length,
    [assignments],
  );

  const filteredAssignments = useMemo(() => {
    if (!assignmentFilter.trim()) return assignments;
    const term = assignmentFilter.trim().toLowerCase();
    return assignments.filter((a) => a.employeeId.toLowerCase().includes(term));
  }, [assignments, assignmentFilter]);

  const allFilteredSelected =
    filteredAssignments.length > 0 &&
    filteredAssignments.every((a) => selectedAssignments.includes(a.employeeId));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(filteredAssignments.map((a) => a.employeeId));
    }
  };

  const toggleSelectRow = (empId: string) => {
    setSelectedAssignments((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId],
    );
  };

  // Card Styling matching CompanyInfo and OfficeSchedule
  const unifiedCardSx = {
    borderRadius: { xs: 2.5, md: 3 },
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    boxShadow: isDark
      ? "0 10px 30px -4px rgba(0, 0, 0, 0.45)"
      : "0 10px 28px rgba(24, 74, 82, .07)",
    p: { xs: 2, sm: 2.5, md: 3 },
    width: "100%",
  };

  const sectionPanelSx = {
    p: { xs: 2, sm: 2.25 },
    borderRadius: 2.5,
    border: "1px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
    bgcolor: isDark ? "rgba(30, 41, 59, 0.3)" : "rgba(248, 250, 252, 0.75)",
  };

  const statutoryReady = Boolean(activeApprovedProfile);
  const requiresStatutoryMetadata = policyConfig.epfMode !== "EXEMPT" || policyConfig.esicMode !== "EXEMPT" || policyConfig.tdsMode !== "MANUAL_ONLY";
  const invalidProfileDateRange = Boolean(
    policyEffectiveTo && dayjs(policyEffectiveTo).isBefore(dayjs(policyEffectiveFrom), "month"),
  );

  const renderEmptyState = (title: string, desc: string) => (
    <Box
      sx={{
        py: 5,
        px: 2,
        textAlign: "center",
        borderRadius: "12px",
        border: "1px dashed",
        borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
        bgcolor: isDark ? "rgba(30, 41, 59, 0.2)" : "rgba(248, 250, 252, 0.5)",
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          mx: "auto",
          mb: 1.25,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#F1F5F9",
          color: "text.secondary",
        }}
      >
        <FolderOffOutlined sx={{ fontSize: 22 }} />
      </Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary", mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", maxWidth: 420, mx: "auto" }}>
        {desc}
      </Typography>
    </Box>
  );

  return (
    <Card variant="outlined" sx={unifiedCardSx}>
      {/* Clean Minimal Executive Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="h6" fontWeight={750} sx={{ letterSpacing: "-0.015em", color: "text.primary", fontSize: "1.125rem" }}>
              Payroll &amp; Statutory Configuration
            </Typography>
            <Chip
              size="small"
              label="Company policy"
              sx={{
                height: 22,
                fontWeight: 700,
                fontSize: "0.72rem",
                borderRadius: "5px",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem", mt: 0.35 }}>
            Configure organization calculation policies, statutory compliance (EPF, ESIC, TDS), pay groups, and salary structures.
          </Typography>
        </Box>

        <AppButton
          size="small"
          variant="outlined"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <RefreshRounded sx={{ fontSize: 16 }} />}
          onClick={() => void loadAll()}
          disabled={loading}
          sx={{
            height: 34,
            px: 1.75,
            fontSize: "0.8rem",
            fontWeight: 650,
            borderRadius: "8px",
            borderColor: isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1",
          }}
        >
          Refresh
        </AppButton>
      </Stack>

      {/* Full-Width Responsive Navigation Tabs */}
      <Box
        sx={{
          width: "100%",
          mb: 3,
          p: 0.6,
          borderRadius: 2.5,
          bgcolor: isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.85)",
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#E2E8F0",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{
            width: "100%",
            minHeight: 42,
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTabs-flexContainer": {
              width: "100%",
              display: "flex",
              gap: 0.75,
            },
            "& .MuiTab-root": {
              flex: isMobile ? "none" : "1 1 0",
              maxWidth: "none",
              minHeight: 40,
              textTransform: "none",
              fontWeight: 650,
              fontSize: "0.84rem",
              px: { xs: 2, md: 2.5 },
              py: 0.75,
              borderRadius: "8px",
              color: "text.secondary",
              transition: "all 0.2s ease",
              "&.Mui-selected": {
                color: "#0B5CAB",
                bgcolor: isDark ? "rgba(11, 92, 171, 0.2)" : "#FFFFFF",
                boxShadow: isDark
                  ? "0 2px 8px rgba(0, 0, 0, 0.35)"
                  : "0 2px 8px rgba(11, 92, 171, 0.08)",
                border: "1px solid",
                borderColor: isDark ? "rgba(11, 92, 171, 0.4)" : "rgba(226, 232, 240, 0.9)",
              },
              "&:hover:not(.Mui-selected)": {
                bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.6)",
                color: "text.primary",
              },
            },
          }}
        >
               <Tab
            value="salary-import"
            icon={<CloudUploadRounded sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Salary Import"
          />
     <Tab
            value="policy"
            icon={<TuneRounded sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Statutory & Calculation Policy"
          />
          <Tab
            value="groups"
            icon={<GroupsOutlined sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={`Pay Groups (${groups.length})`}
          />
          <Tab
            value="templates"
            icon={<ReceiptLongOutlined sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={`Salary Templates (${templates.length})`}
          />
          <Tab
            value="assignments"
            icon={<BadgeOutlined sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={0.75} alignItems="center">
                <span>Employee Assignments ({assignments.length})</span>
                {pendingAssignmentsCount > 0 && (
                  <Box
                    sx={{
                      px: 0.75,
                      py: 0.1,
                      borderRadius: "4px",
                      bgcolor: "#F59E0B",
                      color: "#FFFFFF",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    {pendingAssignmentsCount} pending
                  </Box>
                )}
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {/* ========================================================================= */}
      {/* TAB 1: STATUTORY & CALCULATION POLICY ENGINE                              */}
      {/* ========================================================================= */}
      {activeTab === "salary-import" && (
        <EmployeeSalaryImportPanel canEdit={canEdit} />
      )}

      {activeTab === "policy" && (
        <Stack spacing={3}>
          <Alert severity="info">
            Configure this company’s calculation rules and select its payroll features. PF, ESIC, and TDS changes are activated through a dated statutory profile after authorized approval, so unreviewed rates or regimes cannot reach payroll. Bonus and other earnings or deductions are managed in Salary Components.
          </Alert>
          {activeApprovedProfile && <Alert severity="success">
            For this payroll month, the approved company default is <strong>{activeApprovedProfile.name}</strong>, effective {dayjs(activeApprovedProfile.effectiveFrom).format("MMM YYYY")}{activeApprovedProfile.effectiveTo ? `–${dayjs(activeApprovedProfile.effectiveTo).format("MMM YYYY")}` : " onward"}. The checkboxes below show these approved rules; edits must be saved as a new monthly draft and approved before payroll uses them.
          </Alert>}

          <PayrollPolicyFields
            config={policyConfig}
            canEdit={canEdit}
            onChange={setPolicyConfig}
            onSaveLopBase={() => void handleSavePolicy()}
            savingLopBase={isSavingPolicy}
            onOpenComponents={() => setActiveTab("components")}
            onOpenGroups={() => setActiveTab("groups")}
            onOpenTemplates={() => setActiveTab("templates")}
          />

          {canEdit && <Button variant="contained" startIcon={<SaveRounded />} sx={{ alignSelf: "flex-start" }} onClick={() => document.getElementById("payroll-policy-draft")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Review and save these selections as a draft</Button>}


          <Divider sx={{ my: 2.5 }} />
          <Stack spacing={1.5}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>Effective-dated statutory profiles</Typography>
                <Typography variant="caption" color="text.secondary">Company defaults apply when no group or employee-specific profile is selected. Assignment-only profiles apply only when linked. Approved versions and payroll snapshots remain available for audit.</Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={() => void loadAll()} disabled={loading}>Refresh profiles</Button>
            </Stack>
            {statutoryProfiles.length > 0 && (
              <Stack spacing={1.25}>
                {statutoryProfiles.map((profile) => (
                  <Box key={profile.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.25}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography variant="body2" fontWeight={700}>{profile.name}</Typography>
                          <Chip size="small" label={profile.approvalStatus || "UNVERIFIED"} color={profile.approvalStatus === "APPROVED" ? "success" : profile.approvalStatus === "SUBMITTED" ? "warning" : "default"} />
                          <Chip size="small" variant="outlined" label={profile.scope === "ASSIGNMENT_ONLY" ? "Linked groups or employees only" : "Company default"} />
                          {!profile.isActive && <Chip size="small" variant="outlined" label="Inactive" />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {profile.statutoryJurisdiction || "Jurisdiction not recorded"} · {profile.financialYear || "Financial year not recorded"} · Rules {profile.statutoryRuleVersion || "version not recorded"} · Applies {dayjs(profile.effectiveFrom).format("DD MMM YYYY")} to {profile.effectiveTo ? dayjs(profile.effectiveTo).format("DD MMM YYYY") : "until replaced"}
                        </Typography>
                        {profile.approvedBy && <Typography variant="caption" color="text.secondary" display="block">Approved by {profile.approvedBy}</Typography>}
                      </Box>
                      <Stack direction="row" spacing={1} flexShrink={0}>
                        {canEdit && profile.id && profile.approvalStatus !== "SUBMITTED" && profile.approvalStatus !== "APPROVED" && (
                          <Button size="small" variant="outlined" disabled={busy} onClick={() => void updatePolicyApproval(profile, "submit")}>Submit for approval</Button>
                        )}
                        {canApprove && profile.id && profile.approvalStatus === "SUBMITTED" && (
                          <Button size="small" variant="contained" disabled={busy} onClick={() => void updatePolicyApproval(profile, "approve")}>Approve policy</Button>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
            {canEdit && <Box id="payroll-policy-draft" sx={{ ...sectionPanelSx, p: 2, scrollMarginTop: 100 }}>
              <Typography variant="subtitle2" fontWeight={750}>Save these payroll rules as a dated draft</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Choose the first payroll month for these rules. The optional end month is the final month covered; leave it blank when no end is planned. Saving a draft never changes live payroll, and earlier approved versions remain in history.</Typography>
              <Grid container spacing={1.5} alignItems="flex-start">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth size="small" label="Profile name" value={policyName} onChange={(e) => setPolicyName(e.target.value)} helperText="Use a distinct name and start date for each revision." /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth select size="small" label="Applies to" value={policyScope} onChange={(e) => setPolicyScope(e.target.value as "COMPANY_DEFAULT" | "ASSIGNMENT_ONLY")} helperText="Choose whether this is the company fallback or used only when linked."><MenuItem value="COMPANY_DEFAULT">Company default</MenuItem><MenuItem value="ASSIGNMENT_ONLY">Linked pay groups or employees only</MenuItem></TextField></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}><TextField fullWidth size="small" required={requiresStatutoryMetadata} label="Statutory jurisdiction" placeholder="Country / state / region" value={statutoryJurisdiction} onChange={(e) => setStatutoryJurisdiction(e.target.value)} helperText="Enter the company’s applicable jurisdiction." /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}><TextField fullWidth size="small" required={requiresStatutoryMetadata} label="Financial year" placeholder="e.g. 2026–27" value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}><TextField fullWidth size="small" required={requiresStatutoryMetadata} label="Statutory rule version" placeholder="Adviser-confirmed version" value={statutoryRuleVersion} onChange={(e) => setStatutoryRuleVersion(e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}><TextField fullWidth size="small" type="month" label="First payroll month" value={policyEffectiveFrom} onChange={(e) => setPolicyEffectiveFrom(e.target.value)} InputLabelProps={{ shrink: true }} helperText="Begins on this month's first day." /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}><TextField fullWidth size="small" type="month" label="Last payroll month (optional)" value={policyEffectiveTo} onChange={(e) => setPolicyEffectiveTo(e.target.value)} InputLabelProps={{ shrink: true }} helperText="Ends on this month's last day; blank means open-ended." error={invalidProfileDateRange} /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><Button startIcon={<SaveRounded />} variant="contained" disabled={isSavingProfile || !policyName.trim() || !policyEffectiveFrom || invalidProfileDateRange || (requiresStatutoryMetadata && (!statutoryJurisdiction.trim() || !financialYear.trim() || !statutoryRuleVersion.trim()))} onClick={() => void saveStatutoryProfile()}>{isSavingProfile ? "Saving…" : "Save payroll policy draft"}</Button></Grid>
              <Grid size={{ xs: 12 }}><Alert severity={invalidProfileDateRange ? "error" : "warning"}>{invalidProfileDateRange ? "The last payroll month must be the same as or after the first payroll month." : "A saved statutory profile is a draft until an authorized approver approves it. Confirm jurisdiction, rates, limits, tax settings, and rule version with your payroll/legal adviser."}</Alert></Grid>
              </Grid>
            </Box>}
          </Stack>
          {/* Action Footer Bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{
              pt: 2.25,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Stack direction="row" spacing={0.6} alignItems="center">
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: statutoryReady ? "success.main" : "warning.main" }} />
                <Typography variant="caption" sx={{ color: statutoryReady ? "success.main" : "warning.main", fontWeight: 650 }}>
                  {statutoryReady ? "Approved company default" : "No approved company default"}
                </Typography>
              </Stack>
            </Stack>

            {canEdit && (
              <Stack direction="row" spacing={1.25} alignItems="center">
                <AppButton
                  size="small"
                  variant="outlined"
                  startIcon={<RestartAltRounded sx={{ fontSize: 16 }} />}
                  onClick={() => void loadAll()}
                  disabled={loading || isSavingPolicy}
                  sx={{
                    height: 36,
                    px: 2,
                    fontSize: "0.8rem",
                    fontWeight: 650,
                    borderRadius: "8px",
                    borderColor: isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1",
                  }}
                >
                  Reset Changes
                </AppButton>
              </Stack>
            )}
          </Stack>
        </Stack>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SALARY COMPONENTS                                                */}
      {activeTab === "components" && (
        <Box>
          {canEdit && (
            <Box sx={{ ...sectionPanelSx, mb: 3 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems={{ xs: "stretch", md: "center" }}>
                <TextField size="small" label="Code" placeholder="MEAL_ALLOWANCE" value={componentCode} onChange={(e) => setComponentCode(e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="Name" placeholder="Meal allowance" value={componentName} onChange={(e) => setComponentName(e.target.value)} sx={{ flex: 1.4 }} />
                <TextField select size="small" label="Kind" value={componentKind} onChange={(e) => setComponentKind(e.target.value as SalaryComponent["kind"])} sx={{ flex: 1 }}>
                  <MenuItem value="EARNING">Earning</MenuItem><MenuItem value="DEDUCTION">Deduction</MenuItem>
                </TextField>
                <TextField select size="small" label="Calculation" value={componentCalculationType} onChange={(e) => setComponentCalculationType(e.target.value as SalaryComponent["calculationType"])} sx={{ flex: 1.4 }}>
                  <MenuItem value="FIXED">Fixed amount</MenuItem><MenuItem value="PERCENT_OF_GROSS">% of gross</MenuItem><MenuItem value="PERCENT_OF_COMPONENT">% of component</MenuItem>
                </TextField>
                <TextField size="small" type="date" label="Effective from" value={componentEffectiveFrom} onChange={(e) => setComponentEffectiveFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: 1.1 }} />
                <TextField size="small" type="date" label="Effective to (optional)" value={componentEffectiveTo} onChange={(e) => setComponentEffectiveTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: 1.1 }} />
                <AppButton variant="contained" onClick={() => void saveComponent()} disabled={busy || !componentCode.trim() || !componentName.trim() || !componentEffectiveFrom || Boolean(componentEffectiveTo && componentEffectiveTo < componentEffectiveFrom)} sx={{ minHeight: 40, whiteSpace: "nowrap" }}>{componentId ? "Save changes" : "Add component"}</AppButton>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>These dates control when this component can be selected for salary setups. Existing approved salary records and payroll snapshots are not changed. Leave the end date blank to keep it available until replaced.</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1.5 }}>
                <TextField size="small" label="Base component code (optional)" value={componentBaseCode} onChange={(e) => setComponentBaseCode(e.target.value)} helperText="Used for percentage-of-component rules." />
                <FormControlLabel control={<Checkbox size="small" checked={componentTaxable} onChange={(e) => setComponentTaxable(e.target.checked)} />} label="Taxable" />
              </Stack>
            </Box>
          )}
          {components.length === 0 ? renderEmptyState("No Salary Components Configured", "Define reusable earning and deduction components before assembling salary templates.") : (
            <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: "10px", overflow: "hidden" }}>
              <Table size="small"><TableHead><TableRow><TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Kind</TableCell><TableCell>Calculation</TableCell><TableCell>Tax</TableCell><TableCell>Include in payroll</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
                <TableBody>{components.map((component) => <TableRow key={component.id || component.code}><TableCell sx={{ fontWeight: 700 }}>{component.code}</TableCell><TableCell>{component.name}</TableCell><TableCell>{component.kind}</TableCell><TableCell>{component.calculationType.replace(/_/g, " ")}</TableCell><TableCell>{component.isTaxable ? "Taxable" : "Exempt"}</TableCell><TableCell><Checkbox size="small" checked={component.isActive} disabled={!canEdit || busy || !component.id} inputProps={{ "aria-label": `${component.isActive ? "Exclude" : "Include"} ${component.name} in payroll` }} onChange={(event) => void toggleComponent(component, event.target.checked)} /></TableCell><TableCell align="right">{canEdit && <Button size="small" variant="outlined" onClick={() => { setComponentId(component.id); setComponentVersion(component.version); setComponentCode(component.code); setComponentName(component.name); setComponentKind(component.kind); setComponentCalculationType(component.calculationType); setComponentBaseCode(component.baseComponentCode || ""); setComponentTaxable(component.isTaxable); setComponentEffectiveFrom(dayjs(component.effectiveFrom).format("YYYY-MM-DD")); setComponentEffectiveTo(component.effectiveTo ? dayjs(component.effectiveTo).format("YYYY-MM-DD") : ""); }}>Edit</Button>}</TableCell></TableRow>)}</TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* TAB 3: PAY GROUPS                                                        */}
      {/* ========================================================================= */}
      {activeTab === "groups" && (
        <Box>
          {canEdit && (
            <Box sx={{ ...sectionPanelSx, mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <AddRounded sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.875rem" }}>
                  Add New Pay Group
                </Typography>
              </Stack>

              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pay Group Name"
                    placeholder="e.g. Core Engineering, Monthly Salaried, Sales"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="pg-policy-label">Statutory Profile</InputLabel>
                    <Select
                      labelId="pg-policy-label"
                      label="Statutory Profile"
                      value={groupPolicyId}
                      onChange={(e) => setGroupPolicyId(e.target.value)}
                      sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                    >
                      <MenuItem value=""><em>Use company default</em></MenuItem>
                      {statutoryProfiles.filter((profile) => profile.isActive && (!profile.effectiveTo || !dayjs(profile.effectiveTo).isBefore(dayjs(), "day"))).map((profile) => (
                        <MenuItem key={profile.id} value={profile.id}>
                          {profile.name} · EPF {profile.epfMode} · ESIC {profile.esicMode} · TDS {profile.tdsMode}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6, md: 1.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={groupIsActive}
                        onChange={(e) => setGroupIsActive(e.target.checked)}
                      />
                    }
                    label={<Typography variant="body2" fontWeight={650}>Active</Typography>}
                  />
                </Grid>

                <Grid size={{ xs: 6, md: 1.5 }}>
                  <AppButton
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={busy || !groupName.trim()}
                    onClick={() => void saveGroup()}
                    sx={{
                      height: 40,
                      fontWeight: 650,
                      borderRadius: "8px",
                      bgcolor: "#0B5CAB",
                      boxShadow: "0 4px 12px rgba(11, 92, 171, 0.25)",
                    }}
                  >
                    Save Group
                  </AppButton>
                </Grid>
              </Grid>
            </Box>
          )}

          {groups.length === 0 ? (
            renderEmptyState("No Pay Groups Configured", "Create your first pay group using the form above to organize employee salary schedules.")
          ) : (
            <TableContainer sx={{ border: "1px solid", borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(241, 245, 249, 0.85)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Pay Group Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Schedule</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Linked Policy</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups.map((g) => (
                    <TableRow key={g.id || g.name} hover sx={{ "&:hover": { bgcolor: alpha("#0B5CAB", 0.03) } }}>
                      <TableCell sx={{ fontWeight: 650 }}>{g.name}</TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>{g.schedule}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={g.policyProfileId || "Company Default Policy"}
                          sx={{ height: 22, fontSize: "0.72rem", borderRadius: "4px" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          label={g.isActive ? "Active" : "Inactive"}
                          color={g.isActive ? "success" : "default"}
                          sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, borderRadius: "4px" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SALARY TEMPLATES                                                  */}
      {/* ========================================================================= */}
      {activeTab === "templates" && (
        <Box>
          {canEdit && (
            <Box sx={{ ...sectionPanelSx, mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <AddRounded sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.875rem" }}>
                  Create Salary Structure Template
                </Typography>
              </Stack>

              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Template Name"
                    placeholder="e.g. SDE-2 Full Stack Structure"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="tpl-group-label">Assign to Pay Group</InputLabel>
                    <Select
                      labelId="tpl-group-label"
                      label="Assign to Pay Group"
                      value={templateGroupId}
                      onChange={(e) => setTemplateGroupId(e.target.value)}
                      sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                    >
                      <MenuItem value="">
                        <em>None (Unbound Template)</em>
                      </MenuItem>
                      {groups.map((g) => (
                        <MenuItem key={g.id || g.name} value={g.id || g.name}>
                          {g.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6, md: 1.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={templateIsActive}
                        onChange={(e) => setTemplateIsActive(e.target.checked)}
                      />
                    }
                    label={<Typography variant="body2" fontWeight={650}>Active</Typography>}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      px: 1.75,
                      borderRadius: "8px",
                      bgcolor: isDark ? "rgba(11, 92, 171, 0.15)" : "rgba(11, 92, 171, 0.06)",
                      border: "1px solid",
                      borderColor: alpha("#0B5CAB", 0.2),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      Monthly CTC:
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={750} color="primary.main">
                      {currencyFormatter(totalTemplateMonthly)}
                    </Typography>
                  </Box>
                </Grid>

                {/* Salary Components */}
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Basic Pay"
                    value={templateBasic}
                    onChange={(e) => setTemplateBasic(e.target.value)}
                    sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="HRA"
                    value={templateHra}
                    onChange={(e) => setTemplateHra(e.target.value)}
                    sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="LTA"
                    value={templateLta}
                    onChange={(e) => setTemplateLta(e.target.value)}
                    sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Other Allowance"
                    value={templateOther}
                    onChange={(e) => setTemplateOther(e.target.value)}
                    sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <FormControlLabel control={<Checkbox size="small" checked={templateBonusIncluded} onChange={(event) => { setTemplateBonusIncluded(event.target.checked); if (!event.target.checked) setTemplateBonus(""); }} />} label="Include bonus" />
                  {templateBonusIncluded && <TextField fullWidth size="small" type="number" label="Monthly bonus" value={templateBonus} onChange={(e) => setTemplateBonus(e.target.value)} inputProps={{ min: 0 }} />}
                </Grid>
                {components.filter((component) => component.isActive && component.id && component.code.toUpperCase() !== "BONUS").map((component) => {
                  const selected = Object.prototype.hasOwnProperty.call(templateComponentValues, component.id!);
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={component.id}>
                      <FormControlLabel
                        control={<Checkbox size="small" checked={selected} onChange={(event) => setTemplateComponentValues((current) => {
                          const next = { ...current };
                          if (event.target.checked) next[component.id!] = "0";
                          else delete next[component.id!];
                          return next;
                        })} />}
                        label={component.name}
                      />
                      {selected && <TextField fullWidth size="small" type="number" label={component.calculationType === "FIXED" ? `${component.name} amount` : `${component.name} rate`} value={templateComponentValues[component.id!] ?? "0"} onChange={(event) => setTemplateComponentValues((current) => ({ ...current, [component.id!]: event.target.value }))} inputProps={{ min: 0, step: "any" }} helperText={`${component.kind.toLowerCase()} · ${component.calculationType.replace(/_/g, " ").toLowerCase()}`} />}
                    </Grid>
                  );
                })}
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <AppButton
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={busy || !templateName.trim()}
                    onClick={() => void saveTemplate()}
                    sx={{
                      height: 40,
                      fontWeight: 650,
                      borderRadius: "8px",
                      bgcolor: "#0B5CAB",
                      boxShadow: "0 4px 12px rgba(11, 92, 171, 0.25)",
                    }}
                  >
                    Save Template
                  </AppButton>
                </Grid>
              </Grid>
            </Box>
          )}

          {templates.length === 0 ? (
            renderEmptyState("No Salary Templates Defined", "Add pre-configured salary structures to auto-populate employee compensation.")
          ) : (
            <TableContainer sx={{ border: "1px solid", borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(241, 245, 249, 0.85)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Template</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Pay Group</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Basic Pay</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>HRA</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Allowances</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Total Gross</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((t) => {
                    const gross =
                      (t.basicPay || 0) +
                      (t.hra || 0) +
                      (t.lta || 0) +
                      (t.otherAllowance || 0) +
                      (t.bonus || 0);
                    const grp = groups.find((g) => (g.id || g.name) === t.payGroupId);
                    return (
                      <TableRow key={t.id || t.name} hover sx={{ "&:hover": { bgcolor: alpha("#0B5CAB", 0.03) } }}>
                        <TableCell sx={{ fontWeight: 650 }}>{t.name}</TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>{grp ? grp.name : "Unbound"}</TableCell>
                        <TableCell align="right">{currencyFormatter(t.basicPay || 0)}</TableCell>
                        <TableCell align="right">{currencyFormatter(t.hra || 0)}</TableCell>
                        <TableCell align="right">{currencyFormatter((t.lta || 0) + (t.otherAllowance || 0) + (t.bonus || 0))}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 750, color: "primary.main" }}>{currencyFormatter(gross)}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={t.isActive ? "Active" : "Draft"}
                            color={t.isActive ? "success" : "default"}
                            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, borderRadius: "4px" }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EMPLOYEE ASSIGNMENTS                                               */}
      {/* ========================================================================= */}
      {activeTab === "assignments" && (
        <Box>
          {canEdit && (
            <Box sx={{ ...sectionPanelSx, mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <AddRounded sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.875rem" }}>
                  Assign Employee to Pay Group &amp; Salary Structure
                </Typography>
              </Stack>

              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Employee Code / ID"
                    placeholder="e.g. EMP001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="asgn-grp-label">Pay Group</InputLabel>
                    <Select
                      labelId="asgn-grp-label"
                      label="Pay Group"
                      value={assignmentGroupId}
                      onChange={(e) => setAssignmentGroupId(e.target.value)}
                      sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                    >
                      <MenuItem value="">
                        <em>Select Pay Group</em>
                      </MenuItem>
                      {groups.map((g) => (
                        <MenuItem key={g.id || g.name} value={g.id || g.name}>
                          {g.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="asgn-tpl-label">Salary Template</InputLabel>
                    <Select
                      labelId="asgn-tpl-label"
                      label="Salary Template"
                      value={assignmentTemplateId}
                      onChange={(e) => setAssignmentTemplateId(e.target.value)}
                      sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                    >
                      <MenuItem value="">
                        <em>Optional Template</em>
                      </MenuItem>
                      {templates.map((t) => (
                        <MenuItem key={t.id || t.name} value={t.id || t.name}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="asgn-policy-label">Statutory Profile (optional)</InputLabel>
                    <Select
                      labelId="asgn-policy-label"
                      label="Statutory Profile (optional)"
                      value={assignmentPolicyId}
                      onChange={(e) => setAssignmentPolicyId(e.target.value)}
                      sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                    >
                      <MenuItem value=""><em>Use pay-group profile</em></MenuItem>
                      {statutoryProfiles.filter((profile) => profile.isActive).map((profile) => (
                        <MenuItem key={profile.id} value={profile.id}>{profile.name} · v{profile.version} · {profile.effectiveFrom.slice(0, 10)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth size="small" type="date" label="Assignment effective from" value={assignmentEffectiveFrom} onChange={(e) => setAssignmentEffectiveFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <AppButton
                    fullWidth
                    variant="outlined"
                    color="primary"
                    disabled={busy || !employeeId.trim() || !assignmentGroupId || !assignmentEffectiveFrom}
                    onClick={() => void previewAssignment()}
                    sx={{ height: 40, fontWeight: 650, borderRadius: "8px" }}
                  >
                    Preview assignment
                  </AppButton>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <AppButton
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={busy || !employeeId.trim() || !assignmentGroupId || !assignmentEffectiveFrom}
                    onClick={() => void saveAssignment()}
                    sx={{
                      height: 40,
                      fontWeight: 650,
                      borderRadius: "8px",
                      bgcolor: "#0B5CAB",
                      boxShadow: "0 4px 12px rgba(11, 92, 171, 0.25)",
                    }}
                  >
                    Assign Employee
                  </AppButton>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Search Filter & Bulk Action Bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <TextField
              size="small"
              placeholder="Search assigned employees..."
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 280 }, bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
            />

            <Stack direction="row" spacing={1.5} alignItems="center">
              {selectedAssignments.length > 0 && canEdit && (
                <AppButton
                  size="small"
                  variant="contained"
                  color="success"
                  disabled={busy}
                  onClick={() => void approveBulkAssignments()}
                  sx={{ height: 32, fontSize: "0.78rem", fontWeight: 700, borderRadius: "6px" }}
                >
                  Approve Selected ({selectedAssignments.length})
                </AppButton>
              )}
              <Typography variant="caption" color="text.secondary">
                Showing {filteredAssignments.length} of {assignments.length} assignments
              </Typography>
            </Stack>
          </Stack>

          {assignments.length === 0 ? (
            renderEmptyState("No Employee Assignments Yet", "Map employees to pay groups and salary templates to enable automated batch payroll calculation.")
          ) : (
            <TableContainer sx={{ border: "1px solid", borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(241, 245, 249, 0.85)" }}>
                  <TableRow>
                    {canEdit && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={allFilteredSelected}
                          indeterminate={selectedAssignments.length > 0 && !allFilteredSelected}
                          onChange={toggleSelectAll}
                        />
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Employee ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Pay Group</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Salary Template</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Statutory Profile</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Effective from</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Approval Status</TableCell>                    {canEdit && <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Action</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssignments.map((a) => {
                    const grp = groups.find((g) => (g.id || g.name) === a.payGroupId);
                    const tpl = templates.find((t) => (t.id || t.name) === a.salaryTemplateId);
                    const profile = statutoryProfiles.find((p) => p.id === a.policyProfileId) || statutoryProfiles.find((p) => p.id === grp?.policyProfileId);
                    const isSelected = selectedAssignments.includes(a.employeeId);

                    return (
                      <TableRow key={a.id || a.employeeId} hover selected={isSelected} sx={{ "&:hover": { bgcolor: alpha("#0B5CAB", 0.03) } }}>
                        {canEdit && (
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(a.employeeId)}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 700 }}>{a.employeeId}</TableCell>
                        <TableCell>{grp ? grp.name : a.payGroupId || "—"}</TableCell>
                        <TableCell>{tpl ? tpl.name : a.salaryTemplateId || "Custom"}</TableCell>
                        <TableCell>{profile ? `${profile.name} · v${profile.version}` : "Company default"}</TableCell>
                        <TableCell>{dayjs(a.effectiveFrom).format("YYYY-MM-DD")}</TableCell>
                        <TableCell>
                          {a.isApproved ? (
                            <Chip
                              size="small"
                              icon={<CheckCircleRounded sx={{ fontSize: "14px !important" }} />}
                              color="success"
                              label="Approved"
                              sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, borderRadius: "4px" }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              icon={<HourglassEmptyRounded sx={{ fontSize: "14px !important" }} />}
                              color="warning"
                              label="Pending Approval"
                              sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, borderRadius: "4px" }}
                            />
                          )}
                        </TableCell>
                        {canEdit && (
                          <TableCell align="right">
                            {!a.isApproved && (
                              <AppButton
                                size="small"
                                variant="outlined"
                                color="success"
                                disabled={busy}
                                onClick={() => void approveSingleAssignment(a)}
                                sx={{ height: 26, fontSize: "0.75rem", fontWeight: 650, borderRadius: "6px" }}
                              >
                                Approve
                              </AppButton>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Card>
  );
}








