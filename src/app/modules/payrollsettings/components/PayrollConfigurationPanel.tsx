import AddRounded from "@mui/icons-material/AddRounded";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import FolderOffOutlined from "@mui/icons-material/FolderOffOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import HourglassEmptyRounded from "@mui/icons-material/HourglassEmptyRounded";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import TuneRounded from "@mui/icons-material/TuneRounded";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  useTheme,
} from "@mui/material";
import { useIsDark } from "../../theme/useIsDark";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { deleteRequest, getRequest, postRequest } from "../../../../server/axios";
import {
  AppAlert,
  AppButton,
  AppCheckbox,
  AppSelect,
  AppTextField,
  AppIconButton,
  AppSwitch,
} from "../../../shared/components/ui";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import { toast } from "react-toastify";
import { currencyFormatter } from "../../../../utils/common";
import { getAllEmployees } from "../../employees/employeeServices";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { PayrollPolicyFields } from "./PayrollPolicyFields";
import { PayrollPolicyProfileList } from "./PayrollPolicyProfileList";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";
import { PayrollPayGroupsPanel, type PayrollPayGroup } from "./PayrollPayGroupsPanel";
import { PayrollBulkAssignmentPanel } from "./PayrollBulkAssignmentPanel";
import { coversConfigurationWindow, currentComponentVersions, isApprovedConfigurationForWindow } from "./payrollConfigurationSelection";
import { PayrollSalaryTemplatesPanel } from "./PayrollSalaryTemplatesPanel";
import type { SalaryTemplate } from "./payrollTemplateCalculation";

import { PayrollDateField } from "./PayrollDateField";
import { PayrollWorkflowBlueprint } from "./PayrollWorkflowBlueprint";
export type PayrollDivisorPolicyConfig = {
  id?: string;
  payrollMode: "Startup" | "Standard" | "Enterprise";
  divisorPolicy: "CALENDAR_DAYS" | "FIXED_30_DAYS" | "WORKING_DAYS";
  lopCalculationBase: "FIXED_GROSS" | "BASIC_ONLY";
  epfMode: "EXEMPT" | "CAPPED_CEILING" | "ACTUAL_BASIC_12";
  epfWageCeiling: number;
  epfEmployeeRatePercent: number;
  epfEmployerRatePercent: number;
  esicMode: "EXEMPT" | "STATUTORY";
  esicWageCeiling: number;
  esicEmployeeRatePercent: number;
  esicEmployerRatePercent: number;
  tdsMode: "AUTO_NEW_REGIME" | "AUTO_OLD_REGIME" | "MANUAL_ONLY";
  requireAttendanceLock: boolean;
  effectiveFrom: string;
  isActive: boolean;
  version: number;
};

type PayGroup = PayrollPayGroup;


export type StatutoryProfile = {
  id?: string;
  name: string;
  version: number;
  statutoryJurisdiction: string;
  financialYear: string;
  statutoryRuleVersion: string;
  approvalStatus: "DRAFT" | "SUBMITTED" | "APPROVED" | string;
  submittedBy?: string;
  approvedBy?: string;
  approvedAtUtc?: string;
  divisorPolicy: "CALENDAR_DAYS" | "FIXED_30_DAYS" | "WORKING_DAYS";
  requireAttendanceLock: boolean;
  epfMode: "EXEMPT" | "CAPPED_CEILING" | "ACTUAL_BASIC_12";
  epfWageCeiling: number;
  epfEmployeeRatePercent: number;
  epfEmployerRatePercent: number;
  esicMode: "EXEMPT" | "STATUTORY";

  esicWageCeiling: number;
  esicEmployeeRatePercent: number;
  esicEmployerRatePercent: number;
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

type Template = SalaryTemplate;

type Assignment = {
  id?: string;
  employeeId: string;
  payGroupId?: string;
  salaryTemplateId?: string;
  policyProfileId?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isApproved: boolean;
  isRejected?: boolean;
  rejectionReason?: string;
  isCancelled?: boolean;
};

const defaultPolicy = (): PayrollDivisorPolicyConfig => ({
  payrollMode: "Standard",
  divisorPolicy: "CALENDAR_DAYS",
  lopCalculationBase: "FIXED_GROSS",
  epfMode: "CAPPED_CEILING",
  epfWageCeiling: 15000,
  epfEmployeeRatePercent: 12,
  epfEmployerRatePercent: 12,
  esicMode: "STATUTORY",
  esicWageCeiling: 21000,
  esicEmployeeRatePercent: 0.75,
  esicEmployerRatePercent: 3.25,
  tdsMode: "AUTO_NEW_REGIME",
  requireAttendanceLock: true,
  effectiveFrom: dayjs().startOf("month").format("YYYY-MM-01"),
  isActive: true,
  version: 1,
});

export function PayrollConfigurationPanel({ canEdit, canApprove, canApproveEmployeeSalary = false, canApprovePolicy = false, canDeletePolicy = false }: { canEdit: boolean; canApprove: boolean; canApproveEmployeeSalary?: boolean; canApprovePolicy?: boolean; canDeletePolicy?: boolean }) {
  const theme = useTheme();
  const isDark = useIsDark();

  const [activeTab, setActiveTab] = useState<"policy" | "components" | "groups" | "templates" | "assignments">("policy");

  // Statutory Policy State
  const [policyConfig, setPolicyConfig] = useState<PayrollDivisorPolicyConfig>(defaultPolicy);
  const [companyPolicyDefaults, setCompanyPolicyDefaults] = useState<PayrollDivisorPolicyConfig>(defaultPolicy);
  const [activeApprovedProfile, setActiveApprovedProfile] = useState<StatutoryProfile | null>(null);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Pay Group State
  const [groups, setGroups] = useState<PayGroup[]>([]);
  const [statutoryProfiles, setStatutoryProfiles] = useState<StatutoryProfile[]>([]);
  const [policyDraftExpanded, setPolicyDraftExpanded] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<{ id: string; version: number; isActive: boolean } | null>(null);
  const [policyDraftSource, setPolicyDraftSource] = useState<string | null>(null);
  const [policyToDelete, setPolicyToDelete] = useState<StatutoryProfile | null>(null);
  const [policyToRetire, setPolicyToRetire] = useState<StatutoryProfile | null>(null);
  const [showComponentHistory, setShowComponentHistory] = useState(false);

  const [policyName, setPolicyName] = useState("Standard statutory profile");
  const [policyScope, setPolicyScope] = useState<"COMPANY_DEFAULT" | "ASSIGNMENT_ONLY">("COMPANY_DEFAULT");
  const [policyEffectiveFrom, setPolicyEffectiveFrom] = useState(() => dayjs().format("YYYY-MM"));
  const [policyEffectiveTo, setPolicyEffectiveTo] = useState("");
  const [statutoryJurisdiction, setStatutoryJurisdiction] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [statutoryRuleVersion, setStatutoryRuleVersion] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);


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
  const [componentFilterText, setComponentFilterText] = useState("");
  const [componentTypeFilter, setComponentTypeFilter] = useState<"ALL" | "EARNING" | "DEDUCTION">("ALL");

  // Salary Template State
  const [templates, setTemplates] = useState<Template[]>([]);

  // Assignment State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentToReject, setAssignmentToReject] = useState<Assignment | null>(null);
  const [assignmentToCancel, setAssignmentToCancel] = useState<Assignment | null>(null);
  const [assignmentRejectionReason, setAssignmentRejectionReason] = useState("");
  const [assignmentToEnd, setAssignmentToEnd] = useState<Assignment | null>(null);
  const [assignmentEndToDate, setAssignmentEndToDate] = useState("");
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [assignmentGroupId, setAssignmentGroupId] = useState("");
  const [assignmentTemplateId, setAssignmentTemplateId] = useState("");
  const [assignmentPolicyId, setAssignmentPolicyId] = useState("");
  const [assignmentEffectiveFrom, setAssignmentEffectiveFrom] = useState(() => dayjs().startOf("month").format("YYYY-MM-DD"));
  const [assignmentEffectiveTo, setAssignmentEffectiveTo] = useState("");
  const assignmentDateRangeError = Boolean(assignmentEffectiveTo && assignmentEffectiveFrom && assignmentEffectiveTo < assignmentEffectiveFrom);
  const assignmentEligibleGroups = groups.filter((group) => coversConfigurationWindow(group, assignmentEffectiveFrom, assignmentEffectiveTo));
  const assignmentGroupValid = assignmentEligibleGroups.some((group) => (group.id || group.name) === assignmentGroupId);
  const assignmentEligibleTemplates = templates.filter((template) =>
    coversConfigurationWindow(template, assignmentEffectiveFrom, assignmentEffectiveTo) &&
    (!template.payGroupId || template.payGroupId === assignmentGroupId),
  );
  const assignmentTemplateValid = !assignmentTemplateId || assignmentEligibleTemplates.some((template) => (template.id || template.name) === assignmentTemplateId);
  const assignmentEligibleProfiles = statutoryProfiles.filter((profile) =>
    Boolean(profile.id) && profile.isActive && isApprovedConfigurationForWindow(profile, assignmentEffectiveFrom, assignmentEffectiveTo),
  );
  const assignmentPolicyValid = !assignmentPolicyId || assignmentEligibleProfiles.some((profile) => profile.id === assignmentPolicyId);
  const assignmentConfigurationValid = Boolean(assignmentEffectiveFrom) && !assignmentDateRangeError &&
    assignmentGroupValid && assignmentTemplateValid && assignmentPolicyValid;

  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  // Employee Directory state for rich profile assignment
  const [employeeDirectory, setEmployeeDirectory] = useState<GetAllEmployeeResponseModel[]>([]);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState<GetAllEmployeeResponseModel | null>(null);
  const [isEmployeeDirectoryLoading, setIsEmployeeDirectoryLoading] = useState(false);

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentComponentFeatures = useMemo(() =>
    currentComponentVersions(components, dayjs().format("YYYY-MM-DD")).sort((left, right) => left.name.localeCompare(right.name)),
  [components]);

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
          epfEmployeeRatePercent: approvedProfile.epfEmployeeRatePercent,
          epfEmployerRatePercent: approvedProfile.epfEmployerRatePercent,
          esicMode: approvedProfile.esicMode,
          esicWageCeiling: approvedProfile.esicWageCeiling,
          esicEmployeeRatePercent: approvedProfile.esicEmployeeRatePercent,
          esicEmployerRatePercent: approvedProfile.esicEmployerRatePercent,
          tdsMode: approvedProfile.tdsMode,
        } : {}),
      });
      setGroups(gRes.data ?? []);
      setTemplates(tRes.data ?? []);
      setAssignments(aRes.data ?? []);
      setComponents(cRes.data ?? []);
      setStatutoryProfiles(profilesRes.data ?? []);
      setEditingPolicy(null);
      setPolicyDraftSource(null);
      setPolicyDraftExpanded((profilesRes.data ?? []).length === 0);

      // Load employee directory for assignment profile matching
      setIsEmployeeDirectoryLoading(true);
      void getAllEmployees({ name: "", pageNo: 1, records: 500, departmentId: [], gender: [], employmentStatus: "All" })
        .then((res) => {
          if (res?.data?.success) {
            setEmployeeDirectory(res.data.methodResults ?? []);
          }
        })
        .catch(() => {})
        .finally(() => setIsEmployeeDirectoryLoading(false));
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
          id: editingPolicy?.id,
          version: editingPolicy?.version ?? 1,
          divisorPolicy: policyConfig.divisorPolicy,
          requireAttendanceLock: policyConfig.requireAttendanceLock,
          epfMode: policyConfig.epfMode,
          epfWageCeiling: policyConfig.epfWageCeiling,
          epfEmployeeRatePercent: policyConfig.epfEmployeeRatePercent,
          epfEmployerRatePercent: policyConfig.epfEmployerRatePercent,
          esicMode: policyConfig.esicMode,
          esicWageCeiling: policyConfig.esicWageCeiling,
          esicEmployeeRatePercent: policyConfig.esicEmployeeRatePercent,
          esicEmployerRatePercent: policyConfig.esicEmployerRatePercent,
          tdsMode: policyConfig.tdsMode,
          statutoryJurisdiction: statutoryJurisdiction.trim(),
          financialYear: financialYear.trim(),
          statutoryRuleVersion: statutoryRuleVersion.trim(),
          effectiveFrom: `${dayjs(policyEffectiveFrom).startOf("month").format("YYYY-MM-DD")}T00:00:00`,
          effectiveTo: policyEffectiveTo ? `${dayjs(policyEffectiveTo).endOf("month").format("YYYY-MM-DD")}T00:00:00` : undefined,
          isActive: editingPolicy?.isActive ?? true,
        },
      );
      if (!data.success) throw new Error(data.message || "Unable to save statutory profile.");
      toast.success(editingPolicy ? "Payroll policy draft updated. Submit it for authorized approval before payroll uses it." : "Statutory profile saved as a draft. Submit it for authorized approval before payroll uses it.");
      setEditingPolicy(null);
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save statutory profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const editOrRevisePolicy = (profile: StatutoryProfile) => {
    const isDraftOrSubmitted = profile.approvalStatus === "DRAFT" || profile.approvalStatus === "SUBMITTED";
    setEditingPolicy(isDraftOrSubmitted && profile.id ? { id: profile.id, version: profile.version, isActive: profile.isActive } : null);
    setPolicyDraftSource(profile.name);
    const cleanBaseName = profile.name.replace(/\s*\((?:revision|revised)(?:\s+\d+)?\)/gi, "").trim() || profile.name;
    setPolicyName(isDraftOrSubmitted ? profile.name : `${cleanBaseName} (revision)`);
    setPolicyScope(profile.scope ?? "COMPANY_DEFAULT");
    setPolicyEffectiveFrom(isDraftOrSubmitted
      ? dayjs(profile.effectiveFrom).format("YYYY-MM")
      : [dayjs(), dayjs(profile.effectiveFrom), ...(profile.effectiveTo ? [dayjs(profile.effectiveTo)] : [])]
        .sort((left, right) => right.valueOf() - left.valueOf())[0].startOf("month").add(1, "month").format("YYYY-MM"));
    setPolicyEffectiveTo(isDraftOrSubmitted && profile.effectiveTo ? dayjs(profile.effectiveTo).format("YYYY-MM") : "");
    setStatutoryJurisdiction(profile.statutoryJurisdiction ?? "");
    setFinancialYear(profile.financialYear ?? "");
    setStatutoryRuleVersion(profile.statutoryRuleVersion ?? "");
    setPolicyConfig((current) => ({
      ...current,
      divisorPolicy: profile.divisorPolicy,
      requireAttendanceLock: profile.requireAttendanceLock,
      epfMode: profile.epfMode,
      epfWageCeiling: profile.epfWageCeiling,
      epfEmployeeRatePercent: profile.epfEmployeeRatePercent,
      epfEmployerRatePercent: profile.epfEmployerRatePercent,
      esicMode: profile.esicMode,
      esicWageCeiling: profile.esicWageCeiling,
      esicEmployeeRatePercent: profile.esicEmployeeRatePercent,
      esicEmployerRatePercent: profile.esicEmployerRatePercent,
      tdsMode: profile.tdsMode,
    }));
    setPolicyDraftExpanded(true);
    const draftForm = document.getElementById("payroll-policy-draft");
    if (typeof draftForm?.scrollIntoView === "function") draftForm.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelPolicySubmission = async (profile: StatutoryProfile) => {
    if (!profile.id || profile.approvalStatus !== "SUBMITTED" || !canEdit) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        `api/payroll/configuration/policies/cancel?policyId=${encodeURIComponent(profile.id)}&version=${profile.version}`,
        {},
      );
      if (!data.success) {
        toast.error(data.message || "Unable to withdraw policy submission.");
        return;
      }
      toast.success("Policy submission withdrawn to draft.");
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to withdraw policy submission.");
    } finally {
      setBusy(false);
    }
  };

  const retirePolicy = async (profile: StatutoryProfile) => {
    if (!profile.id || !profile.isActive || !canEdit) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        `api/payroll/configuration/policies/retire?policyId=${encodeURIComponent(profile.id)}&version=${profile.version}`,
        {},
      );
      if (!data.success) {
        toast.error(data.message || "Unable to deactivate payroll policy.");
        return;
      }
      toast.success("Payroll policy deactivated.");
      setPolicyToRetire(null);
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to deactivate payroll policy.");
    } finally {
      setBusy(false);
    }
  };

  const deletePolicyDraft = async (profile: StatutoryProfile) => {
    if (!profile.id || !canDeletePolicy) return;
    setBusy(true);
    try {
      if (profile.approvalStatus === "APPROVED") {
        if (!profile.isActive) {
          toast.info("This approved policy is already archived for tax audit compliance.");
          setPolicyToDelete(null);
          return;
        }
        const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
          `api/payroll/configuration/policies/retire?policyId=${encodeURIComponent(profile.id)}&version=${profile.version}`,
          {},
        );
        if (!data.success) throw new Error(data.message || "Unable to retire payroll policy.");
        toast.success(data.message || "Approved payroll policy safely retired/deactivated.");
      } else {
        const { data } = await deleteRequest<{ success: boolean; message?: string }>(
          `api/payroll/configuration/policies/${encodeURIComponent(profile.id)}?version=${profile.version}`,
        );
        if (!data.success) throw new Error(data.message || "Unable to delete payroll policy.");
        if (editingPolicy?.id === profile.id) setEditingPolicy(null);
        toast.success(data.message || "Payroll policy removed.");
      }
      setPolicyToDelete(null);
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete payroll policy.");
    } finally {
      setBusy(false);
    }
  };

  const startNewPolicyDraft = () => {
    const source = activeApprovedProfile ?? companyPolicyDefaults;
    setPolicyConfig({
      ...companyPolicyDefaults,
      divisorPolicy: source.divisorPolicy,
      requireAttendanceLock: source.requireAttendanceLock,
      epfMode: source.epfMode,
      epfWageCeiling: source.epfWageCeiling,
      epfEmployeeRatePercent: source.epfEmployeeRatePercent,
      epfEmployerRatePercent: source.epfEmployerRatePercent,
      esicMode: source.esicMode,
      esicWageCeiling: source.esicWageCeiling,
      esicEmployeeRatePercent: source.esicEmployeeRatePercent,
      esicEmployerRatePercent: source.esicEmployerRatePercent,
      tdsMode: source.tdsMode,
    });
    setEditingPolicy(null);
    setPolicyDraftSource(null);
    setPolicyName("Standard statutory profile");
    setPolicyScope("COMPANY_DEFAULT");
    setPolicyEffectiveFrom(dayjs().format("YYYY-MM"));
    setPolicyEffectiveTo("");
    setStatutoryJurisdiction("");
    setFinancialYear("");
    setStatutoryRuleVersion("");
    setPolicyDraftExpanded(true);
  };

  const updatePolicyApproval = async (profile: StatutoryProfile, action: "submit" | "approve") => {
    if (!profile.id || (action === "submit" && !canEdit) || (action === "approve" && !canApprovePolicy)) return;
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
          epfEmployeeRatePercent: companyPolicyDefaults.epfEmployeeRatePercent,
          epfEmployerRatePercent: companyPolicyDefaults.epfEmployerRatePercent,
          esicMode: companyPolicyDefaults.esicMode,
          esicWageCeiling: companyPolicyDefaults.esicWageCeiling,
          esicEmployeeRatePercent: companyPolicyDefaults.esicEmployeeRatePercent,
          esicEmployerRatePercent: companyPolicyDefaults.esicEmployerRatePercent,
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
        toast.success(componentId ? "New effective-dated salary component version saved." : "Salary component saved.");
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
      const today = dayjs().format("YYYY-MM-DD");
      const effectiveFrom = dayjs(component.effectiveFrom).isAfter(dayjs(), "day")
        ? dayjs(component.effectiveFrom).format("YYYY-MM-DD")
        : today;
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
          effectiveFrom: `${effectiveFrom}T00:00:00`,
          effectiveTo: undefined,
          isActive,
          version: component.version,
        },
      );
      if (!data.success) {
        toast.error(data.message || "Unable to update this payroll component.");
        return;
      }
      await loadAll();
      toast.success(`${component.name} ${isActive ? "included" : "excluded"} from ${effectiveFrom}. Previous component versions are preserved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update this payroll component.");
    } finally {
      setBusy(false);
    }
  };

  const componentVersionWindow = (component: SalaryComponent) => {
    if (component.effectiveTo) return dayjs(component.effectiveTo).format("DD MMM YYYY");
    const start = dayjs(component.effectiveFrom).startOf("day");
    const nextVersion = components
      .filter((candidate) => candidate.code.toUpperCase() === component.code.toUpperCase() && candidate.id !== component.id &&
        (dayjs(candidate.effectiveFrom).isAfter(start, "day") ||
          (dayjs(candidate.effectiveFrom).isSame(start, "day") && candidate.version > component.version)))
      .sort((left, right) => dayjs(left.effectiveFrom).valueOf() - dayjs(right.effectiveFrom).valueOf() || left.version - right.version)[0];
    return nextVersion
      ? `superseded by v${nextVersion.version} from ${dayjs(nextVersion.effectiveFrom).format("DD MMM YYYY")}`
      : "No end date";
  };

  const standardComponentPresets = [
    { code: "HRA", name: "House Rent Allowance", kind: "EARNING" as const, calculationType: "FIXED" as const, taxable: true },
    { code: "SPECIAL_ALLOWANCE", name: "Special Allowance", kind: "EARNING" as const, calculationType: "FIXED" as const, taxable: true },
    { code: "LTA", name: "Leave Travel Allowance", kind: "EARNING" as const, calculationType: "FIXED" as const, taxable: true },
    { code: "BONUS", name: "Performance Bonus", kind: "EARNING" as const, calculationType: "FIXED" as const, taxable: true },
    { code: "HEALTH_INSURANCE", name: "Health Insurance", kind: "DEDUCTION" as const, calculationType: "FIXED" as const, taxable: false },
  ];

  const [isSeedingStandard, setIsSeedingStandard] = useState(false);

  const seedStandardComponentsHandler = async () => {
    if (isSeedingStandard || busy) return;
    setIsSeedingStandard(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        "api/payroll/configuration/components/seed-standard",
        {},
      );
      if (data.success) {
        toast.success("Standard Indian salary components (HRA, Special Allowance, LTA, Bonus, Health Insurance) initialized successfully.");
        await loadAll();
      } else {
        toast.error(data.message || "Failed to initialize standard components.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to initialize standard salary components.");
    } finally {
      setIsSeedingStandard(false);
    }
  };

  const applyComponentPreset = (preset: {
    code: string;
    name: string;
    kind: SalaryComponent["kind"];
    calculationType: SalaryComponent["calculationType"];
    taxable: boolean;
  }) => {
    setComponentId(undefined);
    setComponentVersion(0);
    setComponentCode(preset.code);
    setComponentName(preset.name);
    setComponentKind(preset.kind);
    setComponentCalculationType(preset.calculationType);
    setComponentTaxable(preset.taxable);
    setComponentBaseCode("");
    setComponentEffectiveFrom(dayjs().startOf("year").format("YYYY-MM-DD"));
    setComponentEffectiveTo("");
  };

  // Save Assignment
  const saveAssignment = async () => {
    if (!employeeId.trim() || !assignmentConfigurationValid) return;
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
          effectiveTo: assignmentEffectiveTo ? `${assignmentEffectiveTo}T00:00:00` : undefined,
        },
      );
      if (data.success) {
        setEmployeeId("");
        setSelectedEmployeeProfile(null);
        setAssignmentGroupId("");
        setAssignmentTemplateId("");
        setAssignmentPolicyId("");
        setAssignmentEffectiveFrom(dayjs().startOf("month").format("YYYY-MM-DD"));
        setAssignmentEffectiveTo("");
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
    if (!employeeId.trim() || !assignmentConfigurationValid) return;
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
          effectiveTo: assignmentEffectiveTo ? `${assignmentEffectiveTo}T00:00:00` : undefined,
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

  const rejectAssignment = async (assignment: Assignment, reason: string) => {
    reason = reason.trim();
    if (!reason || reason.length > 500) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>("api/payroll/configuration/assignments/reject", { employeeId: assignment.employeeId, effectiveFrom: assignment.effectiveFrom, reason });
      if (!data.success) throw new Error(data.message || "Unable to reject assignment.");
      setAssignmentToReject(null);
      setAssignmentRejectionReason("");
      await loadAll();
      toast.success(`Assignment for ${assignment.employeeId} rejected.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to reject assignment."); }
    finally { setBusy(false); }
  };

  const cancelAssignment = async (assignment: Assignment) => {
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(`api/payroll/configuration/assignments/cancel?employeeId=${encodeURIComponent(assignment.employeeId)}&effectiveFrom=${encodeURIComponent(assignment.effectiveFrom)}`, {});
      if (!data.success) throw new Error(data.message || "Unable to withdraw assignment.");
      setAssignmentToCancel(null);
      await loadAll();
      toast.success(`Pending assignment for ${assignment.employeeId} withdrawn.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to withdraw assignment."); }
    finally { setBusy(false); }
  };

  const endAssignment = async (assignment: Assignment, effectiveTo: string) => {
    if (!effectiveTo) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
        "api/payroll/configuration/assignments/end",
        {
          employeeId: assignment.employeeId,
          effectiveFrom: assignment.effectiveFrom,
          effectiveTo,
        }
      );
      if (!data.success) throw new Error(data.message || "Unable to end assignment.");
      setAssignmentToEnd(null);
      await loadAll();
      toast.success(`Assignment for ${assignment.employeeId} ended on ${dayjs(effectiveTo).format("DD MMM YYYY")}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to end assignment.");
    } finally {
      setBusy(false);
    }
  };

  const deleteAssignment = async (assignment: Assignment) => {
    setBusy(true);
    try {
      const { data } = await deleteRequest<{ success: boolean; message?: string }>(
        `api/payroll/configuration/assignments?employeeId=${encodeURIComponent(assignment.employeeId)}&effectiveFrom=${encodeURIComponent(assignment.effectiveFrom)}`
      );
      if (!data.success) throw new Error(data.message || "Unable to delete assignment.");
      setAssignmentToDelete(null);
      await loadAll();
      toast.success(`Assignment for ${assignment.employeeId} deleted.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete assignment.");
    } finally {
      setBusy(false);
    }
  };

  const approveBulkAssignments = async () => {
    if (selectedAssignments.length === 0) return;
    setBusy(true);
    try {
      const pendingToApprove = assignments.filter(
        (assignment) => !assignment.isApproved && selectedAssignments.includes(assignmentSelectionKey(assignment)),
      );
      if (pendingToApprove.length === 0) {
        setSelectedAssignments([]);
        await loadAll();
        return;
      }
      const outcomes = await Promise.allSettled(pendingToApprove.map(async (assignment) => {
        const { data } = await postRequest<unknown, { success: boolean; message?: string }>(
          `api/payroll/configuration/assignments/approve?employeeId=${encodeURIComponent(assignment.employeeId)}&effectiveFrom=${encodeURIComponent(assignment.effectiveFrom)}`,
          {},
        );
        return data;
      }));
      const failedAssignments = pendingToApprove.filter((_, index) => {
        const outcome = outcomes[index];
        return outcome.status === "rejected" || !outcome.value.success;
      });
      const failedKeys = new Set(failedAssignments.map(assignmentSelectionKey));
      const approvedCount = pendingToApprove.length - failedAssignments.length;
      setSelectedAssignments((previous) => previous.filter((key) => failedKeys.has(key)));
      await loadAll();
      if (failedAssignments.length > 0) {
        toast.error(`${approvedCount} assignment(s) approved; ${failedAssignments.length} remain pending. Review the refreshed rows and retry only those still pending.`);
      } else {
        toast.success(`${approvedCount} employee assignment(s) approved.`);
      }
    } catch {
      toast.error("Failed to approve some assignments.");
    } finally {
      setBusy(false);
    }
  };

  const pendingAssignmentsCount = useMemo(
    () => assignments.filter((a) => !a.isApproved && !a.isRejected && !a.isCancelled).length,
    [assignments],
  );

  const tabLabel = (title: string, count: number | string) => (
    <Stack direction="row" spacing={0.85} alignItems="center" sx={{ whiteSpace: "nowrap", minWidth: 0 }}>
      <Box component="span">{title}</Box>
      <Chip
        size="small"
        label={count}
        sx={{
          height: 20,
          minWidth: 22,
          fontSize: "0.68rem",
          fontWeight: 750,
          borderRadius: "5px",
          bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
          color: "inherit",
          "& .MuiChip-label": { px: 0.6 },
        }}
      />
    </Stack>
  );

  const tableContainerSx = {
    width: "100%", border: "1px solid", borderColor: "divider", borderRadius: 2.5,
    overflowX: "auto" as const, overscrollBehaviorX: "contain" as const, WebkitOverflowScrolling: "touch" as const,
  };

  const assignmentSelectionKey = (assignment: Assignment) =>
    assignment.id || `${assignment.employeeId}::${assignment.effectiveFrom}`;

  const filteredAssignments = useMemo(() => {
    if (!assignmentFilter.trim()) return assignments;
    const term = assignmentFilter.trim().toLowerCase();
    return assignments.filter((a) => a.employeeId.toLowerCase().includes(term));
  }, [assignments, assignmentFilter]);

  const filteredAssignmentKeys = [...new Set(filteredAssignments.map(assignmentSelectionKey))];
  const allFilteredSelected =
    filteredAssignmentKeys.length > 0 &&
    filteredAssignmentKeys.every((key) => selectedAssignments.includes(key));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(filteredAssignmentKeys);
    }
  };

  const toggleSelectRow = (selectionKey: string) => {
    setSelectedAssignments((prev) =>
      prev.includes(selectionKey) ? prev.filter((key) => key !== selectionKey) : [...prev, selectionKey],
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
    p: { xs: 2, sm: 2.5, lg: 3 },
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
  const policyCoveragePreview = policyEffectiveFrom && !invalidProfileDateRange
    ? `Coverage preview: ${dayjs(policyEffectiveFrom).startOf("month").format("D MMM YYYY")} onward${policyEffectiveTo ? `, through ${dayjs(policyEffectiveTo).endOf("month").format("D MMM YYYY")}` : " (no scheduled end)"}. ${policyEffectiveTo ? "Payroll periods outside this window use another applicable approved policy or remain uncovered." : "This version continues until a later approved version takes effect."} Existing payroll snapshots keep the version already used.`
    : "Choose a valid first payroll month to preview when this version will apply.";

  const renderEmptyState = (title: string, desc: string) => (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: "center",
        borderRadius: "14px",
        border: "1px dashed",
        borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(203, 213, 225, 0.8)",
        bgcolor: isDark ? "rgba(30, 41, 59, 0.25)" : "rgba(248, 250, 252, 0.6)",
        transition: "all 0.2s ease",
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          mx: "auto",
          mb: 1.5,
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          bgcolor: isDark ? "rgba(11, 92, 171, 0.18)" : "rgba(11, 92, 171, 0.08)",
          color: "primary.main",
        }}
      >
        <FolderOffOutlined sx={{ fontSize: 26 }} />
      </Box>
      <Typography variant="subtitle1" fontWeight={750} sx={{ color: "text.primary", mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem", maxWidth: 440, mx: "auto", lineHeight: 1.5 }}>
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
            Configure statutory compliance (EPF, ESIC, TDS), calculation policies, pay groups, and salary templates. Employee salaries are managed under <strong>Payroll Settings</strong>.
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

      {/* Visual Payroll Architecture & Connection Blueprint */}
      <PayrollWorkflowBlueprint
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        activeApprovedProfile={activeApprovedProfile}
        componentsCount={components.length}
        activeComponentsCount={components.filter((c) => c.isActive).length}
        groupsCount={groups.length}
        templatesCount={templates.length}
        assignmentsCount={assignments.length}
      />

      {/* Full-Width Responsive Navigation Tabs */}
      <Box
        sx={{
          width: "100%",
          mb: 3,
          p: 0.6,
          borderRadius: "12px",
          bgcolor: isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.85)",
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#E2E8F0",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            width: "100%",
            minHeight: 44,
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTabs-flexContainer": {
              display: "flex",
              gap: 1,
              width: "100%",
            },
            "& .MuiTab-root": {
              flex: { xs: "0 0 auto", lg: "1 1 0" },
              minWidth: { xs: "auto", lg: 0 },
              minHeight: 44,
              textTransform: "none",
              fontWeight: 650,
              fontSize: "0.835rem",
              px: { xs: 1.5, sm: 2 },
              py: 0.85,
              borderRadius: "9px",
              color: "text.secondary",
              whiteSpace: "nowrap",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&.Mui-selected": {
                color: "primary.main",
                bgcolor: isDark ? "rgba(11, 92, 171, 0.2)" : "#FFFFFF",
                boxShadow: isDark
                  ? "0 2px 8px rgba(0, 0, 0, 0.35)"
                  : "0 2px 10px rgba(15, 23, 42, 0.06)",
                border: "1px solid",
                borderColor: isDark ? "rgba(11, 92, 171, 0.4)" : "rgba(226, 232, 240, 0.9)",
              },
              "&:hover:not(.Mui-selected)": {
                bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.7)",
                color: "text.primary",
              },
            },
          }}
        >
          <Tab
            value="policy"
            icon={<TuneRounded sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Statutory & Calculation Policy"
          />
          <Tab
            value="components"
            icon={<PaymentsOutlined sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={tabLabel("Salary Components", `${new Set(components.map((component) => component.code.toUpperCase())).size}/${components.length}`)}
          />
          <Tab
            value="groups"
            icon={<GroupsOutlined sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={tabLabel("Pay Groups", groups.length)}
          />
          <Tab
            value="templates"
            icon={<ReceiptLongOutlined sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={tabLabel("Salary Templates", templates.length)}
          />
          <Tab
            value="assignments"
            icon={<BadgeOutlined sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={0.85} alignItems="center" sx={{ whiteSpace: "nowrap" }}>
                <span>Employee Assignments</span>
                <Chip
                  size="small"
                  label={assignments.length}
                  sx={{
                    height: 20,
                    minWidth: 22,
                    fontSize: "0.68rem",
                    fontWeight: 750,
                    borderRadius: "5px",
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                    color: "inherit",
                    "& .MuiChip-label": { px: 0.6 },
                  }}
                />
                {pendingAssignmentsCount > 0 && (
                  <Box
                    sx={{
                      px: 0.75,
                      py: 0.1,
                      borderRadius: "999px",
                      bgcolor: "warning.main",
                      color: "warning.contrastText",
                      fontSize: "0.68rem",
                      fontWeight: 750,
                      lineHeight: 1.5,
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
      {activeTab === "policy" && (
        <Stack spacing={3}>
          {/* 1. Sleek Active Policy Status Hero Banner */}
          <Box
            sx={{
              p: { xs: 1.75, sm: 2.25 },
              borderRadius: "14px",
              border: "1px solid",
              borderColor: activeApprovedProfile
                ? isDark
                  ? "rgba(16, 185, 129, 0.3)"
                  : "rgba(16, 185, 129, 0.25)"
                : isDark
                ? "rgba(245, 158, 11, 0.3)"
                : "rgba(245, 158, 11, 0.25)",
              bgcolor: activeApprovedProfile
                ? isDark
                  ? "rgba(16, 185, 129, 0.05)"
                  : "rgba(16, 185, 129, 0.02)"
                : isDark
                ? "rgba(245, 158, 11, 0.05)"
                : "rgba(245, 158, 11, 0.02)",
              boxShadow: isDark
                ? "0 4px 18px rgba(0, 0, 0, 0.25)"
                : "0 2px 8px rgba(15, 23, 42, 0.03)",
            }}
          >
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", lg: "center" }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ mb: 0.75 }}>
                  <Chip
                    size="small"
                    label={activeApprovedProfile ? "🟢 Active Company Default" : "⚠️ No Active Default"}
                    color={activeApprovedProfile ? "success" : "warning"}
                    sx={{
                      height: 22,
                      fontWeight: 750,
                      fontSize: "0.72rem",
                      borderRadius: "6px",
                    }}
                  />
                  {activeApprovedProfile && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`v${activeApprovedProfile.version || 1}`}
                      sx={{
                        height: 22,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        borderRadius: "6px",
                        borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "#CBD5E1",
                      }}
                    />
                  )}
                  {activeApprovedProfile && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={activeApprovedProfile.scope === "ASSIGNMENT_ONLY" ? "Linked only" : "Company default"}
                      sx={{
                        height: 22,
                        fontWeight: 650,
                        fontSize: "0.7rem",
                        borderRadius: "6px",
                        borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "#CBD5E1",
                      }}
                    />
                  )}
                </Stack>

                {activeApprovedProfile ? (
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
                      <Typography
                        variant="h6"
                        fontWeight={750}
                        sx={{
                          fontSize: { xs: "1.05rem", sm: "1.15rem" },
                          letterSpacing: "-0.015em",
                          color: "text.primary",
                        }}
                      >
                        {activeApprovedProfile.name.replace(/\s*\((?:revision|revised)(?:\s+\d+)?\)/gi, "").trim() || activeApprovedProfile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
                        Effective: {dayjs(activeApprovedProfile.effectiveFrom).format("MMM YYYY")}{activeApprovedProfile.effectiveTo ? ` – ${dayjs(activeApprovedProfile.effectiveTo).format("MMM YYYY")}` : " onward"}
                      </Typography>
                    </Stack>

                    {/* Key Policy Highlights Badges */}
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center" sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`⚙️ ${activeApprovedProfile.divisorPolicy === "CALENDAR_DAYS" ? "Calendar Days" : activeApprovedProfile.divisorPolicy === "FIXED_30_DAYS" ? "Fixed 30 Days" : "Working Days"}`}
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 650, borderRadius: "5px" }}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`🛡️ ${activeApprovedProfile.epfMode !== "EXEMPT" ? `EPF Capped (₹${activeApprovedProfile.epfWageCeiling?.toLocaleString() || "15,000"})` : "EPF Exempt"}`}
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 650, borderRadius: "5px" }}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`🏥 ${activeApprovedProfile.esicMode !== "EXEMPT" ? `ESIC Statutory (₹${activeApprovedProfile.esicWageCeiling?.toLocaleString() || "21,000"})` : "ESIC Exempt"}`}
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 650, borderRadius: "5px" }}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`💼 ${activeApprovedProfile.tdsMode !== "MANUAL_ONLY" ? "TDS Auto New Regime" : "TDS Manual"}`}
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 650, borderRadius: "5px" }}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`🔒 ${activeApprovedProfile.requireAttendanceLock ? "Attendance Lock Active" : "No Attendance Lock"}`}
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 650, borderRadius: "5px" }}
                      />
                    </Stack>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary" }}>
                      No active statutory policy profile
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                      Create and approve an effective-dated statutory profile to establish the calculation rules for payroll.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Action Buttons Top Right */}
              <Stack direction="row" spacing={1} flexShrink={0} sx={{ width: { xs: "100%", lg: "auto" }, justifyContent: { xs: "flex-start", lg: "flex-end" } }}>
                {canEdit && (
                  <AppButton
                    size="small"
                    variant="contained"
                    startIcon={<AddRounded />}
                    onClick={startNewPolicyDraft}
                    sx={{ borderRadius: "8px", fontWeight: 700, textTransform: "none", height: 34, px: 2, fontSize: "0.78rem" }}
                  >
                    Create policy version
                  </AppButton>
                )}
                <AppButton
                  size="small"
                  variant="outlined"
                  onClick={() => void loadAll()}
                  disabled={loading}
                  sx={{ borderRadius: "8px", fontWeight: 650, textTransform: "none", height: 34, px: 1.75, fontSize: "0.78rem" }}
                >
                  Refresh profiles
                </AppButton>
              </Stack>
            </Stack>
          </Box>

          {/* Active Draft Banner */}
          {policyDraftSource && (
            <AppAlert
              severity="info"
              sx={{
                borderRadius: "12px",
                border: "1px solid",
                borderColor: isDark ? "rgba(11, 92, 171, 0.3)" : "rgba(11, 92, 171, 0.2)",
                bgcolor: isDark ? "rgba(11, 92, 171, 0.12)" : "rgba(11, 92, 171, 0.04)",
                fontSize: "0.825rem",
                lineHeight: 1.55,
              }}
            >
              {editingPolicy ? "Editing draft" : "Creating a new revision of"} <strong>{policyDraftSource}</strong>. The rules below belong to this draft. Save and submit it for admin approval.
            </AppAlert>
          )}

          {canEdit && (
              <Accordion
                id="payroll-policy-draft"
                expanded={policyDraftExpanded}
                onChange={(_, expanded) => setPolicyDraftExpanded(expanded)}
                disableGutters
                sx={{
                  ...sectionPanelSx,
                  p: 0,
                  overflow: "hidden",
                  scrollMarginTop: 100,
                  border: "1.5px solid",
                  borderColor: isDark ? "rgba(37, 99, 235, 0.35)" : "rgba(37, 99, 235, 0.25)",
                  boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 2px 12px rgba(37, 99, 235, 0.05)",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded />}
                  aria-controls="payroll-policy-draft-content"
                  id="payroll-policy-draft-heading"
                  sx={{
                    px: { xs: 2, sm: 2.5 },
                    minHeight: 64,
                    bgcolor: isDark ? "rgba(37, 99, 235, 0.06)" : "rgba(37, 99, 235, 0.03)",
                    "& .MuiAccordionSummary-content": { my: 1.25 },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "10px",
                        color: "primary.main",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                        flexShrink: 0,
                      }}
                    >
                      <SaveRounded fontSize="small" />
                    </Box>
                    <Box minWidth={0}>
                      <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.925rem" }}>
                        {editingPolicy ? "Update payroll policy draft" : "Create a dated policy version"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Choose when these rules apply. A draft cannot affect payroll until approved.
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails id="payroll-policy-draft-content" sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: "0.825rem" }}>
                    Earlier approved versions remain in history. Use the optional end month only when you know when these rules stop applying.
                  </Typography>
                  <Grid container spacing={2} alignItems="flex-start">
                    {/* Row 1: Profile Name (6) + Applies To (6) */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <AppTextField
                        fullWidth
                        size="small"
                        label="Profile name"
                        value={policyName}
                        onChange={(e) => setPolicyName(e.target.value)}
                        helperText="Use a distinct name and start date for each revision."
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <AppTextField
                        fullWidth
                        select
                        size="small"
                        label="Applies to"
                        value={policyScope}
                        onChange={(e) => setPolicyScope(e.target.value as "COMPANY_DEFAULT" | "ASSIGNMENT_ONLY")}
                        helperText="Choose whether this is the company fallback or used only when linked."
                      >
                        <MenuItem value="COMPANY_DEFAULT">Company default</MenuItem>
                        <MenuItem value="ASSIGNMENT_ONLY">Linked pay groups or employees only</MenuItem>
                      </AppTextField>
                    </Grid>

                    {/* Row 2: Statutory Jurisdiction (4) + Financial Year (4) + Rule Version (4) */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <AppTextField
                        fullWidth
                        size="small"
                        required={requiresStatutoryMetadata}
                        label="Statutory jurisdiction"
                        placeholder="Country / state / region"
                        value={statutoryJurisdiction}
                        onChange={(e) => setStatutoryJurisdiction(e.target.value)}
                        helperText="Enter the company’s applicable jurisdiction."
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <AppTextField
                        fullWidth
                        size="small"
                        required={requiresStatutoryMetadata}
                        label="Financial year"
                        placeholder="e.g. 2026–27"
                        value={financialYear}
                        onChange={(e) => setFinancialYear(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                      <AppTextField
                        fullWidth
                        size="small"
                        required={requiresStatutoryMetadata}
                        label="Statutory rule version"
                        placeholder="Adviser-confirmed version"
                        value={statutoryRuleVersion}
                        onChange={(e) => setStatutoryRuleVersion(e.target.value)}
                      />
                    </Grid>

                    {/* Row 3: First payroll month (6) + Last payroll month (6) */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomisedDatePicker
                        label="First payroll month"
                        value={policyEffectiveFrom ? dayjs(policyEffectiveFrom) : null}
                        setValue={(newDate) => setPolicyEffectiveFrom(newDate ? newDate.format("YYYY-MM") : "")}
                        views={["month", "year"]}
                        format="MM/YYYY"
                        required
                        helperText="Begins on this month's first day."
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomisedDatePicker
                        label="Last payroll month (optional)"
                        value={policyEffectiveTo ? dayjs(policyEffectiveTo) : null}
                        setValue={(newDate) => setPolicyEffectiveTo(newDate ? newDate.format("YYYY-MM") : "")}
                        views={["month", "year"]}
                        format="MM/YYYY"
                        clearable
                        error={invalidProfileDateRange}
                        helperText={invalidProfileDateRange ? "Must be after start month" : "Ends on this month's last day; blank means open-ended."}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <AppAlert severity={invalidProfileDateRange ? "error" : "info"} sx={{ borderRadius: "10px" }}>
                        {invalidProfileDateRange ? "The last payroll month must be the same as or after the first payroll month." : `${policyCoveragePreview} This profile is only a draft until an authorized approver approves it. Confirm jurisdiction, rates, limits, tax settings, and rule version with your payroll/legal adviser.`}
                      </AppAlert>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          pt: 1.5,
                          borderTop: "1px dashed",
                          borderColor: "divider",
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          justifyContent: "space-between",
                          alignItems: { xs: "flex-start", sm: "center" },
                          gap: 2,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.76rem", lineHeight: 1.45 }}>
                            💡 <strong>Synchronized Rules:</strong> The calculation features (EPF, ESIC, TDS, Attendance lock, and Daily rate divisor) selected in Steps 1 &amp; 2 below will be packaged into this draft.
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1.5} sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: "flex-end" }}>
                          {(editingPolicy || policyDraftSource) && (
                            <AppButton
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setEditingPolicy(null);
                                setPolicyDraftSource(null);
                                setPolicyDraftExpanded(false);
                              }}
                              sx={{ height: 40, px: 2, fontWeight: 700, borderRadius: "10px", textTransform: "none" }}
                            >
                              Cancel
                            </AppButton>
                          )}
                          <AppButton
                            startIcon={<SaveRounded />}
                            variant="contained"
                            disabled={isSavingProfile || !policyName.trim() || !policyEffectiveFrom || invalidProfileDateRange || (requiresStatutoryMetadata && (!statutoryJurisdiction.trim() || !financialYear.trim() || !statutoryRuleVersion.trim()))}
                            onClick={() => void saveStatutoryProfile()}
                            sx={{
                              height: 40,
                              px: 3,
                              fontWeight: 700,
                              borderRadius: "10px",
                              textTransform: "none",
                              bgcolor: "#0B5CAB",
                              boxShadow: "0 4px 12px rgba(11, 92, 171, 0.25)",
                              "&:hover": {
                                bgcolor: "#094a8a",
                                transform: "translateY(-1px)",
                                boxShadow: "0 6px 16px rgba(11, 92, 171, 0.35)",
                              },
                              transition: "all 0.15s ease",
                            }}
                          >
                            {isSavingProfile ? "Saving…" : editingPolicy ? "Update payroll policy draft" : "Save payroll policy draft"}
                          </AppButton>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

          <Divider sx={{ my: 1 }} />

          {/* 3. Feature Selection & Configuration */}
          <Box>
            <PayrollPolicyFields
              config={policyConfig}
              canEdit={canEdit}
              onChange={setPolicyConfig}
              onSaveLopBase={() => void handleSavePolicy()}
              savingLopBase={isSavingPolicy}
              onOpenComponents={() => setActiveTab("components")}
              onOpenGroups={() => setActiveTab("groups")}
              onOpenTemplates={() => setActiveTab("templates")}
              componentFeatures={currentComponentFeatures}
              componentsBusy={busy}
              onToggleComponent={(feature, checked) => {
                const component = currentComponentFeatures.find((candidate) => candidate.id === feature.id);
                if (component) void toggleComponent(component, checked);
              }}
            />
          </Box>

          {/* 4. Stepper Guide: How this policy reaches payroll */}
          <Box
            sx={{
              p: { xs: 2, sm: 2.25 },
              border: "1px solid",
              borderColor: isDark ? "rgba(148, 163, 184, 0.16)" : "rgba(226, 232, 240, 0.9)",
              borderRadius: "14px",
              bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1.5, fontSize: "0.875rem", color: "text.primary" }}>
              How this policy reaches payroll
            </Typography>
            <Grid container spacing={1.5}>
              {[
                ["1", "Choose company rules", "Enable only the statutory and attendance features your company uses."],
                ["2", "Set the effective months", "From starts the first covered payroll month; optional To is the last covered month."],
                ["3", "Submit and approve", "A dated draft is not active until an authorized approver signs it off."],
                ["4", "Assign and calculate", "Groups or employees can override the company default; each run freezes its chosen version."],
              ].map(([number, title, detail]) => (
                <Grid key={number} size={{ xs: 12, sm: 12, md: 6, lg: 3 }}>
                  <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="flex-start"
                    sx={{
                      height: "100%",
                      p: 1.5,
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(226, 232, 240, 0.8)",
                      borderRadius: "10px",
                      bgcolor: "background.paper",
                      boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.02)",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 10px rgba(15,23,42,0.05)",
                      },
                    }}
                  >
                    <Chip size="small" color="primary" label={number} sx={{ minWidth: 26, height: 26, fontWeight: 800, borderRadius: "50%" }} />
                    <Box minWidth={0}>
                      <Typography variant="caption" fontWeight={750} display="block" sx={{ fontSize: "0.78rem" }}>{title}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, fontSize: "0.74rem", lineHeight: 1.35 }}>{detail}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* 5. Effective-dated Statutory Profiles & Version History Archive */}
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" fontWeight={750} sx={{ letterSpacing: "-0.01em", fontSize: "1.05rem" }}>
                    Effective-dated statutory profiles
                  </Typography>
                  <Chip
                    size="small"
                    label={`${statutoryProfiles.length} version${statutoryProfiles.length === 1 ? "" : "s"}`}
                    sx={{
                      height: 20,
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      borderRadius: "5px",
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                  Historical versions, approved baselines, and pending drafts. Click any card to create a revision or inspect audit history.
                </Typography>
              </Box>
            </Box>

            <PayrollPolicyProfileList
              profiles={statutoryProfiles}
              canEdit={canEdit}
              canDelete={canDeletePolicy}
              canApprove={canApprovePolicy}
              busy={busy || isSavingProfile}
              onEdit={editOrRevisePolicy}
              onDelete={setPolicyToDelete}
              onSubmit={(profile) => void updatePolicyApproval(profile, "submit")}
              onApprove={(profile) => void updatePolicyApproval(profile, "approve")}
              onCancelSubmission={(profile) => void cancelPolicySubmission(profile)}
              onRetire={setPolicyToRetire}
            />
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
          {/* Informative Guidance Banner */}
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: "14px",
              border: "1px solid",
              borderColor: isDark ? "rgba(11, 92, 171, 0.25)" : "rgba(11, 92, 171, 0.15)",
              bgcolor: isDark ? "rgba(11, 92, 171, 0.08)" : "rgba(11, 92, 171, 0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                }}
              >
                <PaymentsOutlined sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.88rem" }}>
                  Salary Components Guide
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.76rem" }}>
                  <strong>Earnings</strong> add to monthly gross salary. <strong>Deductions</strong> reduce salary. Once configured, heads can be packaged into <em>Salary Templates</em> or assigned directly to employees.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={`${components.filter(c => c.kind === "EARNING" && c.isActive).length} Earnings`}
                sx={{ height: 22, fontWeight: 700, fontSize: "0.7rem", borderRadius: "5px" }}
              />
              <Chip
                size="small"
                color="secondary"
                variant="outlined"
                label={`${components.filter(c => c.kind === "DEDUCTION" && c.isActive).length} Deductions`}
                sx={{ height: 22, fontWeight: 700, fontSize: "0.7rem", borderRadius: "5px" }}
              />
            </Stack>
          </Box>

          {canEdit && (
            <Box sx={{ ...sectionPanelSx, mb: 3 }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        bgcolor: isDark ? "rgba(11, 92, 171, 0.25)" : "rgba(11, 92, 171, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PaymentsOutlined sx={{ fontSize: 18, color: "primary.main" }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.95rem" }}>
                        {componentId ? "Edit Component Version" : "Add Salary Component"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {componentId
                          ? "Update component rules by defining a new version effective on a specific date."
                          : "Define custom earnings, allowances, or deductions before assembling salary packages."}
                      </Typography>
                    </Box>
                  </Stack>
                  <AppButton
                    variant="contained"
                    size="small"
                    data-testid="seed-standard-components-btn"
                    startIcon={isSeedingStandard ? <CircularProgress size={16} color="inherit" /> : <AddRounded sx={{ fontSize: 17 }} />}
                    disabled={isSeedingStandard || busy || !canEdit}
                    onClick={() => void seedStandardComponentsHandler()}
                    sx={{
                      height: 36,
                      px: 2,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      borderRadius: "8px",
                      textTransform: "none",
                    }}
                  >
                    {isSeedingStandard ? "Initializing Standard Heads…" : "Seed Standard Indian Heads"}
                  </AppButton>
                </Stack>

                {!componentId && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "8px",
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(2, 132, 199, 0.04)",
                      border: "1px dashed",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(2, 132, 199, 0.25)",
                    }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mr: 0.5 }}>
                          Quick Standard Presets:
                        </Typography>
                        {standardComponentPresets.map((preset) => {
                          const alreadyConfigured = components.some(
                            (c) => c.code.toUpperCase() === preset.code.toUpperCase() && c.isActive,
                          );
                          return (
                            <Chip
                              key={preset.code}
                              size="small"
                              label={`${preset.code} (${preset.kind === "EARNING" ? "Earning" : "Deduction"})${alreadyConfigured ? " ✓" : ""}`}
                              onClick={() => applyComponentPreset(preset)}
                              color={alreadyConfigured ? "success" : "default"}
                              variant={alreadyConfigured ? "filled" : "outlined"}
                              sx={{
                                fontSize: "0.74rem",
                                fontWeight: 650,
                                cursor: "pointer",
                                "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                              }}
                            />
                          );
                        })}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                        Click to pre-fill standard head parameters
                      </Typography>
                    </Stack>
                  </Box>
                )}

                <Grid container spacing={2} alignItems="flex-start">
                  {/* Row 1: Core Details */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AppTextField
                      fullWidth
                      size="small"
                      label="Code"
                      placeholder="MEAL_ALLOWANCE"
                      value={componentCode}
                      disabled={Boolean(componentId)}
                      onChange={(e) => setComponentCode(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                      helperText="Unique uppercase identifier, e.g. HRA, BONUS"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AppTextField
                      fullWidth
                      size="small"
                      label="Name"
                      placeholder="Meal allowance"
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      helperText="Display name for payslips & structures"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AppTextField
                      fullWidth
                      select
                      size="small"
                      label="Kind"
                      value={componentKind}
                      onChange={(e) => setComponentKind(e.target.value as SalaryComponent["kind"])}
                      helperText={componentKind === "EARNING" ? "Adds to monthly Gross Pay" : "Subtracts from salary"}
                    >
                      <MenuItem value="EARNING">Earning (+)</MenuItem>
                      <MenuItem value="DEDUCTION">Deduction (-)</MenuItem>
                    </AppTextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        height: 40,
                        px: 1.5,
                        border: "1px solid",
                        borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(203, 213, 225, 0.8)",
                        borderRadius: "8px",
                        bgcolor: isDark ? "rgba(15, 23, 42, 0.4)" : "#FFFFFF",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <FormControlLabel
                        control={
                          <AppCheckbox
                            size="small"
                            checked={componentTaxable}
                            onChange={(e) => setComponentTaxable(e.target.checked)}
                          />
                        }
                        label={
                          <Typography variant="body2" fontWeight={650}>
                            Taxable {componentTaxable ? "(TDS)" : "(Exempt)"}
                          </Typography>
                        }
                        sx={{ m: 0, width: "100%" }}
                      />
                    </Box>
                  </Grid>

                  {/* Row 2: Calculation & Dates */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AppTextField
                      fullWidth
                      select
                      size="small"
                      label="Calculation"
                      value={componentCalculationType}
                      onChange={(e) => setComponentCalculationType(e.target.value as SalaryComponent["calculationType"])}
                      helperText={
                        componentCalculationType === "FIXED"
                          ? "Flat monthly rupee amount"
                          : componentCalculationType === "PERCENT_OF_GROSS"
                          ? "Percentage of total gross pay"
                          : "Percentage of another component"
                      }
                    >
                      <MenuItem value="FIXED">Fixed amount</MenuItem>
                      <MenuItem value="PERCENT_OF_GROSS">% of gross</MenuItem>
                      <MenuItem value="PERCENT_OF_COMPONENT">% of component</MenuItem>
                    </AppTextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AppTextField
                      fullWidth
                      size="small"
                      label="Base component code (optional)"
                      placeholder="e.g. BASIC"
                      value={componentBaseCode}
                      onChange={(e) => setComponentBaseCode(e.target.value.toUpperCase())}
                      helperText="Used for percentage-of-component rules."
                    />
                    {componentCalculationType === "PERCENT_OF_COMPONENT" && (
                      <Stack direction="row" spacing={0.6} alignItems="center" flexWrap="wrap" sx={{ mt: 0.75 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", fontWeight: 700 }}>
                          Base:
                        </Typography>
                        {["BASIC", "GROSS", ...components.filter(c => c.kind === "EARNING" && c.code.toUpperCase() !== componentCode.toUpperCase() && c.isActive).map(c => c.code.toUpperCase())].slice(0, 4).map((code) => (
                          <Chip
                            key={code}
                            size="small"
                            label={code}
                            variant={componentBaseCode.toUpperCase() === code ? "filled" : "outlined"}
                            color={componentBaseCode.toUpperCase() === code ? "primary" : "default"}
                            onClick={() => setComponentBaseCode(code)}
                            sx={{ height: 20, fontSize: "0.66rem", fontWeight: 700, cursor: "pointer" }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <CustomisedDatePicker
                      label="Effective from"
                      value={componentEffectiveFrom ? dayjs(componentEffectiveFrom) : null}
                      setValue={(newDate) => setComponentEffectiveFrom(newDate ? newDate.format("YYYY-MM-DD") : "")}
                      views={["year", "month", "day"]}
                      format="DD-MM-YYYY"
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <CustomisedDatePicker
                      label="Effective to (optional)"
                      value={componentEffectiveTo ? dayjs(componentEffectiveTo) : null}
                      setValue={(newDate) => setComponentEffectiveTo(newDate ? newDate.format("YYYY-MM-DD") : "")}
                      views={["year", "month", "day"]}
                      format="DD-MM-YYYY"
                      clearable
                    />
                  </Grid>

                  {/* Live Formula Preview Box */}
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "10px",
                        bgcolor: isDark ? "rgba(11, 92, 171, 0.1)" : "rgba(11, 92, 171, 0.04)",
                        border: "1px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1.5,
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "7px",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "primary.main",
                            color: "#FFFFFF",
                          }}
                        >
                          <ReceiptLongOutlined sx={{ fontSize: 16 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" fontWeight={750} color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "0.68rem", letterSpacing: "0.04em" }}>
                            Live Calculation Rule Preview
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.825rem", color: "text.primary" }}>
                            {componentCalculationType === "FIXED"
                              ? `${componentName || "Component"}: Fixed rupee amount configured per employee or template`
                              : componentCalculationType === "PERCENT_OF_GROSS"
                              ? `${componentName || "Component"}: Rate% × Total Monthly Gross Salary`
                              : `${componentName || "Component"}: Rate% × (${componentBaseCode ? componentBaseCode.toUpperCase() : "BASIC"}) pay each month`}
                            {" · "}
                            <span style={{ color: componentTaxable ? "#D97706" : "#059669" }}>
                              {componentTaxable ? "Subject to Income Tax (TDS)" : "Tax-Exempt Allowance"}
                            </span>
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        size="small"
                        color={componentKind === "EARNING" ? "primary" : "secondary"}
                        label={componentKind === "EARNING" ? "+ Adds to Gross Pay" : "- Deducts from Salary"}
                        sx={{ height: 22, fontWeight: 750, fontSize: "0.7rem", borderRadius: "5px" }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    pt: 1.5,
                    borderTop: "1px dashed",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: { xs: "column", lg: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", lg: "center" },
                    gap: 1.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1, maxWidth: 700, lineHeight: 1.45, fontSize: "0.76rem" }}>
                    Saving an edit creates a new effective-dated version; past definitions and approved payroll runs remain unchanged.
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>
                    {componentId && (
                      <AppButton
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setComponentId(undefined);
                          setComponentCode("");
                          setComponentName("");
                          setComponentBaseCode("");
                          setComponentEffectiveTo("");
                        }}
                        sx={{ height: 38, px: 2, textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
                      >
                        Cancel
                      </AppButton>
                    )}
                    <AppButton
                      variant="contained"
                      size="small"
                      onClick={() => void saveComponent()}
                      disabled={busy || !componentCode.trim() || !componentName.trim() || !componentEffectiveFrom || Boolean(componentEffectiveTo && componentEffectiveTo < componentEffectiveFrom)}
                      sx={{
                        height: 38,
                        px: 3,
                        whiteSpace: "nowrap",
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: "8px",
                        bgcolor: "#0B5CAB",
                        boxShadow: "0 4px 12px rgba(11, 92, 171, 0.25)",
                        "&:hover": {
                          bgcolor: "#094a8a",
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 16px rgba(11, 92, 171, 0.35)",
                        },
                        transition: "all 0.15s ease",
                      }}
                    >
                      {componentId ? "Create new version" : "Add component"}
                    </AppButton>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Search, Filter Toolbar & Version History Toggle */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ width: { xs: "100%", sm: "auto" } }}>
              <TextField
                size="small"
                placeholder="Search components by code or name..."
                value={componentFilterText}
                onChange={(e) => setComponentFilterText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: "100%", sm: 260 }, bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
              />
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Chip
                  size="small"
                  clickable
                  variant={componentTypeFilter === "ALL" ? "filled" : "outlined"}
                  color="primary"
                  label={`All (${components.length})`}
                  onClick={() => setComponentTypeFilter("ALL")}
                  sx={{ height: 28, fontWeight: 700, fontSize: "0.72rem", borderRadius: "6px" }}
                />
                <Chip
                  size="small"
                  clickable
                  variant={componentTypeFilter === "EARNING" ? "filled" : "outlined"}
                  color="primary"
                  label={`Earnings (${components.filter(c => c.kind === "EARNING").length})`}
                  onClick={() => setComponentTypeFilter("EARNING")}
                  sx={{ height: 28, fontWeight: 700, fontSize: "0.72rem", borderRadius: "6px" }}
                />
                <Chip
                  size="small"
                  clickable
                  variant={componentTypeFilter === "DEDUCTION" ? "filled" : "outlined"}
                  color="secondary"
                  label={`Deductions (${components.filter(c => c.kind === "DEDUCTION").length})`}
                  onClick={() => setComponentTypeFilter("DEDUCTION")}
                  sx={{ height: 28, fontWeight: 700, fontSize: "0.72rem", borderRadius: "6px" }}
                />
              </Stack>
            </Stack>

            {components.length > 0 && (
              <FormControlLabel
                control={<AppCheckbox checked={showComponentHistory} onChange={(event) => setShowComponentHistory(event.target.checked)} />}
                label={<Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 650 }}>Show component version history</Typography>}
                sx={{ m: 0 }}
              />
            )}
          </Stack>

          {components.length === 0 ? renderEmptyState("No Salary Components Configured", "Define reusable earning and deduction components before assembling salary templates.") : (
            <TableContainer sx={tableContainerSx}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(241, 245, 249, 0.85)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Version</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Effective dates</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Kind</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Calculation</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Tax</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Include in payroll</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(showComponentHistory ? components : currentComponentFeatures)
                    .filter((component) => {
                      const matchesQuery = !componentFilterText.trim() ||
                        component.code.toLowerCase().includes(componentFilterText.trim().toLowerCase()) ||
                        component.name.toLowerCase().includes(componentFilterText.trim().toLowerCase());
                      const matchesType = componentTypeFilter === "ALL" || component.kind === componentTypeFilter;
                      return matchesQuery && matchesType;
                    })
                    .map((component) => (
                    <TableRow key={component.id || `${component.code}-${component.version}`} hover sx={{ "&:hover": { bgcolor: alpha("#0B5CAB", 0.03) } }}>
                      <TableCell sx={{ fontWeight: 700 }}>{component.code}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{component.name}</TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" label={`v${component.version}`} sx={{ height: 22, fontWeight: 700, borderRadius: "4px" }} />
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>{dayjs(component.effectiveFrom).format("DD MMM YYYY")} → {componentVersionWindow(component)}</TableCell>
                      <TableCell>
                        <Chip size="small" color={component.kind === "EARNING" ? "primary" : "secondary"} label={component.kind} sx={{ height: 22, fontWeight: 700, borderRadius: "4px" }} />
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>{component.calculationType.replace(/_/g, " ")}</TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" color={component.isTaxable ? "warning" : "default"} label={component.isTaxable ? "Taxable" : "Exempt"} sx={{ height: 22, borderRadius: "4px" }} />
                      </TableCell>
                      <TableCell>
                        <AppCheckbox
                          size="small"
                          checked={component.isActive}
                          disabled={!canEdit || busy || !component.id || !currentComponentFeatures.some(current => current.id === component.id)}
                          inputProps={{ "aria-label": `${component.isActive ? "Exclude" : "Include"} ${component.name} v${component.version} in payroll` }}
                          onChange={(event) => void toggleComponent(component, event.target.checked)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {canEdit && (
                          <AppButton
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setComponentId(component.id);
                              setComponentVersion(component.version);
                              setComponentCode(component.code);
                              setComponentName(component.name);
                              setComponentKind(component.kind);
                              setComponentCalculationType(component.calculationType);
                              setComponentBaseCode(component.baseComponentCode || "");
                              setComponentTaxable(component.isTaxable);
                              setComponentEffectiveFrom(dayjs(component.effectiveFrom).isAfter(dayjs(), "day") ? dayjs(component.effectiveFrom).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"));
                              setComponentEffectiveTo("");
                            }}
                            sx={{ height: 28, fontSize: "0.75rem", textTransform: "none", fontWeight: 700, borderRadius: "6px" }}
                          >
                            New version
                          </AppButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
      {/* TAB 3: PAY GROUPS                                                        */}
      {/* ========================================================================= */}
      {activeTab === "groups" && (
        <PayrollPayGroupsPanel groups={groups} profiles={statutoryProfiles} canEdit={canEdit} onSaved={loadAll} />
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SALARY TEMPLATES                                                  */}
      {/* ========================================================================= */}
      {activeTab === "templates" && <PayrollSalaryTemplatesPanel templates={templates} groups={groups} components={components} canEdit={canEdit} onSaved={loadAll} />}

      {/* ========================================================================= */}
      {/* TAB 5: EMPLOYEE ASSIGNMENTS                                               */}
      {/* ========================================================================= */}
      {activeTab === "assignments" && (
        <Box>
          {canEdit && <Accordion disableGutters sx={{ mb: 2, border: 1, borderColor: "divider", borderRadius: 2, "&:before": { display: "none" } }}><AccordionSummary expandIcon={<ExpandMoreRounded />}><Box><Typography variant="subtitle2" fontWeight={750}>Bulk assign employees</Typography><Typography variant="caption" color="text.secondary">Preview department, role, employment-type, or employee-list assignments before Admin approval.</Typography></Box></AccordionSummary><AccordionDetails><PayrollBulkAssignmentPanel groups={groups} templates={templates} profiles={statutoryProfiles} canEdit={canEdit} onSubmitted={loadAll} /></AccordionDetails></Accordion>}
          {canEdit && (
            <Box sx={{ ...sectionPanelSx, mb: 3 }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      bgcolor: isDark ? "rgba(11, 92, 171, 0.25)" : "rgba(11, 92, 171, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AddRounded sx={{ fontSize: 18, color: "primary.main" }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.95rem" }}>
                      Assign Employee to Pay Group & Salary Structure
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Map an employee to a pay cohort, optional template, and statutory compliance rules for an effective date range.
                    </Typography>
                  </Box>
                </Stack>

                {/* Selected Employee Profile Preview Banner */}
                {selectedEmployeeProfile && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "10px",
                      bgcolor: isDark ? "rgba(11, 92, 171, 0.14)" : "rgba(11, 92, 171, 0.05)",
                      border: "1px solid",
                      borderColor: alpha("#0B5CAB", 0.25),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={selectedEmployeeProfile.fullProfileUrl || undefined}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: "primary.main",
                          fontWeight: 750,
                          fontSize: "1rem",
                          border: "2px solid",
                          borderColor: "primary.contrastText",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        {selectedEmployeeProfile.fullName.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="subtitle1" fontWeight={750} sx={{ fontSize: "0.95rem" }}>
                            {selectedEmployeeProfile.fullName}
                          </Typography>
                          <Chip
                            size="small"
                            label={selectedEmployeeProfile.employeeId}
                            color="primary"
                            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 750, borderRadius: "6px" }}
                          />
                          {selectedEmployeeProfile.employmentStatus && (
                            <Chip
                              size="small"
                              variant="outlined"
                              label={selectedEmployeeProfile.employmentStatus}
                              color={selectedEmployeeProfile.employmentStatus === "Active" ? "success" : "default"}
                              sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: "4px" }}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
                          {selectedEmployeeProfile.email}
                          {selectedEmployeeProfile.department ? ` · ${typeof selectedEmployeeProfile.department === "string" ? selectedEmployeeProfile.department : Object.values(selectedEmployeeProfile.department)[0]}` : ""}
                          {selectedEmployeeProfile.jobRole ? ` · ${typeof selectedEmployeeProfile.jobRole === "string" ? selectedEmployeeProfile.jobRole : Object.values(selectedEmployeeProfile.jobRole)[0]}` : ""}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setSelectedEmployeeProfile(null);
                        setEmployeeId("");
                      }}
                      sx={{ textTransform: "none", fontSize: "0.75rem", borderRadius: "8px", fontWeight: 650 }}
                    >
                      Choose Different Employee
                    </Button>
                  </Box>
                )}

                {/* Assignment Controls: Row 1 - Structure Mapping */}
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid size={{ xs: 12, md: 3 }}>
                    {!selectedEmployeeProfile ? (
                      <Autocomplete
                        freeSolo
                        size="small"
                        options={employeeDirectory}
                        loading={isEmployeeDirectoryLoading}
                        getOptionLabel={(option) => {
                          if (typeof option === "string") return option;
                          return `${option.fullName} (${option.employeeId})`;
                        }}
                        filterOptions={(options, state) => {
                          const query = state.inputValue.trim().toLowerCase();
                          if (!query) return options;
                          return options.filter((opt) =>
                            opt.fullName?.toLowerCase().includes(query) ||
                            opt.employeeId?.toLowerCase().includes(query) ||
                            opt.email?.toLowerCase().includes(query)
                          );
                        }}
                        onChange={(_, value) => {
                          if (typeof value === "string") {
                            setEmployeeId(value.trim());
                            const matched = employeeDirectory.find(
                              (e) => e.employeeId.toLowerCase() === value.trim().toLowerCase()
                            );
                            setSelectedEmployeeProfile(matched || null);
                          } else if (value) {
                            setSelectedEmployeeProfile(value);
                            setEmployeeId(value.employeeId);
                          } else {
                            setSelectedEmployeeProfile(null);
                            setEmployeeId("");
                          }
                        }}
                        onInputChange={(_, value) => {
                          if (!selectedEmployeeProfile) {
                            setEmployeeId(value);
                          }
                        }}
                        renderOption={(props, option) => {
                          const { key, ...rest } = props as { key: React.Key; [k: string]: unknown };
                          return (
                            <Box key={key} component="li" {...rest} sx={{ py: 1 }}>
                              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
                                <Avatar
                                  src={option.fullProfileUrl || undefined}
                                  sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: "0.8rem", fontWeight: 700 }}
                                >
                                  {option.fullName ? option.fullName.slice(0, 2).toUpperCase() : "EM"}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight={750} noWrap>
                                    {option.fullName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                                    {option.employeeId} · {option.department ? (typeof option.department === "string" ? option.department : Object.values(option.department)[0]) : option.email}
                                  </Typography>
                                </Box>
                                <Chip
                                  size="small"
                                  label={option.employeeId}
                                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, borderRadius: "4px" }}
                                />
                              </Stack>
                            </Box>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Search Employee"
                            placeholder="Search name, ID, or email..."
                            sx={{
                              bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
                              borderRadius: "8px",
                              "& .MuiOutlinedInput-root": { height: 40 },
                            }}
                          />
                        )}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        disabled
                        label="Assigned Employee ID"
                        value={employeeId}
                        sx={{
                          bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
                          borderRadius: "8px",
                          "& .MuiOutlinedInput-root": { height: 40 },
                        }}
                      />
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="asgn-grp-label">Pay Group</InputLabel>
                      <Select
                        labelId="asgn-grp-label"
                        label="Pay Group"
                        value={assignmentGroupId}
                        onChange={(e) => { setAssignmentGroupId(e.target.value); setAssignmentTemplateId(""); }}
                        sx={{
                          bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
                          borderRadius: "8px",
                          height: 40,
                        }}
                      >
                        <MenuItem value="">
                          <em>Select Pay Group</em>
                        </MenuItem>
                        {assignmentGroupId && !assignmentGroupValid && <MenuItem value={assignmentGroupId} disabled>Unavailable for these assignment dates</MenuItem>}
                        {assignmentEligibleGroups.map((g) => (
                          <MenuItem key={g.id || g.name} value={g.id || g.name}>{g.name}</MenuItem>
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
                        sx={{
                          bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
                          borderRadius: "8px",
                          height: 40,
                        }}
                      >
                        <MenuItem value="">
                          <em>Optional Template</em>
                        </MenuItem>
                        {assignmentTemplateId && !assignmentTemplateValid && <MenuItem value={assignmentTemplateId} disabled>Unavailable for these dates or pay group</MenuItem>}
                        {assignmentEligibleTemplates.map((t) => (
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
                        sx={{
                          bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
                          borderRadius: "8px",
                          height: 40,
                        }}
                      >
                        <MenuItem value=""><em>Inherit pay-group profile</em></MenuItem>
                        {assignmentPolicyId && !assignmentPolicyValid && <MenuItem value={assignmentPolicyId} disabled>Unavailable, unapproved, or outside these dates</MenuItem>}
                        {assignmentEligibleProfiles.map((profile) => (
                          <MenuItem key={profile.id} value={profile.id}>{profile.name} · v{profile.version} · {profile.effectiveFrom.slice(0, 10)}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Validation warnings */}
                {(assignmentDateRangeError || (assignmentGroupId && !assignmentGroupValid) || (assignmentTemplateId && !assignmentTemplateValid) || (assignmentPolicyId && !assignmentPolicyValid)) && (
                  <Alert severity="warning">
                    {assignmentDateRangeError
                      ? "The assignment end date must be on or after its start date."
                      : assignmentGroupId && !assignmentGroupValid
                        ? "The selected pay group must be active and cover the full assignment date range. Choose another group or adjust the dates."
                        : assignmentTemplateId && !assignmentTemplateValid
                          ? "The selected salary template is not active for the full date range or is linked to a different pay group. Choose another template or clear it."
                          : "A statutory override must be an approved, active profile covering the full assignment date range. Choose an eligible profile or inherit the pay-group profile."}
                  </Alert>
                )}

                {/* Row 2: Validity Period & Actions */}
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <PayrollDateField label="Assignment effective from" value={assignmentEffectiveFrom} onChange={setAssignmentEffectiveFrom} required />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <PayrollDateField
                      label="Assignment effective to (optional)"
                      value={assignmentEffectiveTo}
                      onChange={setAssignmentEffectiveTo}
                      minDate={assignmentEffectiveFrom}
                      error={assignmentDateRangeError}
                      helperText={assignmentDateRangeError ? "End date must be on or after the start date." : "Leave blank for an open-ended assignment."}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        px: 2,
                        borderRadius: "8px",
                        bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(241, 245, 249, 0.6)",
                        border: "1px dashed",
                        borderColor: "divider",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        Assignments are effective-dated and take effect upon Admin approval. You can preview calculation impact before final submission.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Row 3: Action Buttons Footer */}
                <Box
                  sx={{
                    pt: 1.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <AppButton
                    variant="outlined"
                    color="primary"
                    disabled={busy || !employeeId.trim() || !assignmentConfigurationValid}
                    onClick={() => void previewAssignment()}
                    sx={{
                      height: 38,
                      px: 2.5,
                      fontWeight: 650,
                      borderRadius: "8px",
                      textTransform: "none",
                    }}
                  >
                    Preview assignment
                  </AppButton>
                  <AppButton
                    variant="contained"
                    color="primary"
                    disabled={busy || !employeeId.trim() || !assignmentConfigurationValid}
                    onClick={() => void saveAssignment()}
                    sx={{
                      height: 38,
                      px: 3,
                      fontWeight: 650,
                      borderRadius: "8px",
                      textTransform: "none",
                      bgcolor: "#0B5CAB",
                      boxShadow: "0 4px 12px rgba(11, 92, 171, 0.25)",
                      "&:hover": {
                        bgcolor: "#094a8a",
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 16px rgba(11, 92, 171, 0.35)",
                      },
                      transition: "all 0.15s ease",
                    }}
                  >
                    Assign Employee
                  </AppButton>
                </Box>
              </Stack>
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
              {selectedAssignments.length > 0 && canApprove && (
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
            <TableContainer sx={tableContainerSx}>
              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(241, 245, 249, 0.85)" }}>
                  <TableRow>
                    {canApprove && (
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
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Effective to</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Approval Status</TableCell>
                    {(canApprove || canEdit) && (
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>
                        Action
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssignments.map((a) => {
                    const grp = groups.find((g) => (g.id || g.name) === a.payGroupId);
                    const tpl = templates.find((t) => (t.id || t.name) === a.salaryTemplateId);
                    const profile = statutoryProfiles.find((p) => p.id === a.policyProfileId) || statutoryProfiles.find((p) => p.id === grp?.policyProfileId);
                    const selectionKey = assignmentSelectionKey(a);
                    const isSelected = selectedAssignments.includes(selectionKey);

                    return (
                      <TableRow key={a.id || a.employeeId} hover selected={isSelected} sx={{ "&:hover": { bgcolor: alpha("#0B5CAB", 0.03) } }}>
                        {canApprove && (
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(selectionKey)}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ py: 1.5 }}>
                          {(() => {
                            const emp = employeeDirectory.find(
                              (e) => e.employeeId.toLowerCase() === a.employeeId.toLowerCase() || e.userId === a.employeeId
                            );
                            return (
                              <Stack direction="row" spacing={1.25} alignItems="center">
                                <Avatar
                                  src={emp?.fullProfileUrl || undefined}
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    fontSize: "0.75rem",
                                    bgcolor: isDark ? "rgba(11, 92, 171, 0.3)" : "rgba(11, 92, 171, 0.12)",
                                    color: "primary.main",
                                    fontWeight: 750,
                                  }}
                                >
                                  {emp?.fullName ? emp.fullName.slice(0, 2).toUpperCase() : a.employeeId.slice(0, 2).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={750} sx={{ fontSize: "0.85rem" }}>
                                    {emp?.fullName || a.employeeId}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {a.employeeId} {emp?.email ? `· ${emp.email}` : ""}
                                  </Typography>
                                </Box>
                              </Stack>
                            );
                          })()}
                        </TableCell>
                        <TableCell>{grp ? grp.name : a.payGroupId || "—"}</TableCell>
                        <TableCell>{tpl ? tpl.name : a.salaryTemplateId || "Custom"}</TableCell>
                        <TableCell>{profile ? `${profile.name} · v${profile.version}` : "Company default"}</TableCell>
                        <TableCell>{dayjs(a.effectiveFrom).format("YYYY-MM-DD")}</TableCell>
                        <TableCell>{a.effectiveTo ? dayjs(a.effectiveTo).format("YYYY-MM-DD") : "No end date"}</TableCell>
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
                              label={a.isRejected ? "Rejected" : a.isCancelled ? "Withdrawn" : "Pending Approval"}
                              sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, borderRadius: "4px" }}
                            />
                          )}
                        </TableCell>
                        {(canApprove || canEdit) && (
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.75} justifyContent="flex-end" alignItems="center">
                              {!a.isApproved && !a.isRejected && !a.isCancelled && canApprove && (
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
                              {!a.isApproved && !a.isRejected && !a.isCancelled && canApprove && (
                                <AppButton
                                  size="small"
                                  color="error"
                                  variant="text"
                                  disabled={busy}
                                  onClick={() => { setAssignmentRejectionReason(""); setAssignmentToReject(a); }}
                                  sx={{ height: 26, fontSize: "0.75rem", fontWeight: 650, borderRadius: "6px" }}
                                >
                                  Reject
                                </AppButton>
                              )}
                              {!a.isApproved && !a.isRejected && !a.isCancelled && (
                                <AppButton
                                  size="small"
                                  variant="text"
                                  disabled={busy}
                                  onClick={() => setAssignmentToCancel(a)}
                                  sx={{ height: 26, fontSize: "0.75rem", fontWeight: 650, borderRadius: "6px" }}
                                >
                                  Withdraw
                                </AppButton>
                              )}
                              {a.isApproved && canEdit && (
                                <AppButton
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  disabled={busy}
                                  onClick={() => {
                                    setAssignmentToEnd(a);
                                    setAssignmentEndToDate(dayjs().endOf("month").format("YYYY-MM-DD"));
                                  }}
                                  sx={{ height: 26, fontSize: "0.75rem", fontWeight: 650, borderRadius: "6px" }}
                                >
                                  End
                                </AppButton>
                              )}
                              {canEdit && (
                                <AppButton
                                  size="small"
                                  variant="text"
                                  color="error"
                                  disabled={busy}
                                  onClick={() => setAssignmentToDelete(a)}
                                  sx={{ height: 26, fontSize: "0.75rem", fontWeight: 650, borderRadius: "6px" }}
                                >
                                  Delete
                                </AppButton>
                              )}
                            </Stack>
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
      {assignmentToReject && (
        <Dialog open fullWidth maxWidth="sm" onClose={() => { if (!busy) setAssignmentToReject(null); }}>
          <DialogTitle>Reject payroll assignment</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>This request will remain in assignment history, but it will not affect payroll. The employee can be assigned again after the issue is corrected.</Alert>
            <Typography variant="body2" sx={{ mb: 1 }}>Employee: <strong>{assignmentToReject.employeeId}</strong></Typography>
            <TextField fullWidth multiline minRows={3} maxRows={6} label="Reason for rejection" value={assignmentRejectionReason} onChange={(event) => setAssignmentRejectionReason(event.target.value.slice(0, 500))} helperText={`${assignmentRejectionReason.length}/500 · A reason is required for the audit record.`} autoFocus />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <AppButton variant="outlined" disabled={busy} onClick={() => setAssignmentToReject(null)}>Keep pending</AppButton>
            <AppButton color="error" variant="contained" disabled={busy || !assignmentRejectionReason.trim()} onClick={() => void rejectAssignment(assignmentToReject, assignmentRejectionReason)}>Reject assignment</AppButton>
          </DialogActions>
        </Dialog>
      )}
      {assignmentToCancel && <ConfirmationModal open title="Withdraw pending assignment"
        content={`Withdraw the pending payroll assignment for ${assignmentToCancel.employeeId}? It will be retained in history and will not affect payroll.`}
        handleClose={() => { if (!busy) setAssignmentToCancel(null); }} confirming={busy}
        handleConfirmation={() => void cancelAssignment(assignmentToCancel)} />}
      {assignmentToEnd && (
        <Dialog open fullWidth maxWidth="xs" onClose={() => { if (!busy) setAssignmentToEnd(null); }}>
          <DialogTitle>End employee payroll assignment</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Set the concluding date for <strong>{assignmentToEnd.employeeId}</strong>. Once ended, a new payroll assignment can begin after this date without conflict.
            </Alert>
            <PayrollDateField
              label="Assignment effective to"
              value={assignmentEndToDate}
              onChange={setAssignmentEndToDate}
              minDate={dayjs(assignmentToEnd.effectiveFrom).format("YYYY-MM-DD")}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <AppButton variant="outlined" disabled={busy} onClick={() => setAssignmentToEnd(null)}>Cancel</AppButton>
            <AppButton
              color="primary"
              variant="contained"
              disabled={busy || !assignmentEndToDate || assignmentEndToDate < dayjs(assignmentToEnd.effectiveFrom).format("YYYY-MM-DD")}
              onClick={() => void endAssignment(assignmentToEnd, assignmentEndToDate)}
            >
              End assignment
            </AppButton>
          </DialogActions>
        </Dialog>
      )}
      {assignmentToDelete && (
        <ConfirmationModal
          open
          title="Delete payroll assignment?"
          content={`Permanently delete the assignment for employee ${assignmentToDelete.employeeId} (effective ${dayjs(assignmentToDelete.effectiveFrom).format("DD MMM YYYY")})?`}
          ok_btn
          confirming={busy}
          handleClose={() => { if (!busy) setAssignmentToDelete(null); }}
          handleConfirmation={(result) => { if (result === "ok") void deleteAssignment(assignmentToDelete); }}
        />
      )}
      {policyToDelete && (
        <ConfirmationModal
          open
          title={
            policyToDelete.approvalStatus === "DRAFT"
              ? "Delete payroll policy draft"
              : policyToDelete.approvalStatus === "SUBMITTED"
              ? "Delete submitted policy"
              : "Delete or retire policy"
          }
          content={
            policyToDelete.approvalStatus === "APPROVED"
              ? `Delete or retire policy "${policyToDelete.name}"? If active employee assignments or past processed payroll reference this policy, it will be safely deactivated/retired to preserve audit compliance.`
              : `Delete "${policyToDelete.name}"? This cannot be undone.`
          }
          handleClose={() => {
            if (!busy) setPolicyToDelete(null);
          }}
          confirming={busy}
          handleConfirmation={() => void deletePolicyDraft(policyToDelete)}
        />
      )}
      {policyToRetire && (
        <ConfirmationModal
          open
          title="Deactivate payroll policy"
          content={`Deactivate approved policy "${policyToRetire.name}"? It will no longer apply to future payroll runs, but past processed payroll and audit logs will be safely preserved.`}
          handleClose={() => {
            if (!busy) setPolicyToRetire(null);
          }}
          confirming={busy}
          handleConfirmation={() => void retirePolicy(policyToRetire)}
        />
      )}
    </Card>
  );
}








