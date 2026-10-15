import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Card, Checkbox, Chip, Divider, FormControlLabel, IconButton, InputAdornment, MenuItem, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { AddOutlined, DeleteOutlineRounded, ExpandMore, InfoOutlined } from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getAllDepartments, getAllRoles } from "../../admin/adminservices";
import { DepartmentModel, RoleModel } from "../../admin/models";
import { deleteEmployeeExitClearanceTemplate, EmployeeExitClearanceTemplate, EmployeeExitFeatureConfiguration, EmployeeExitPolicy, getEmployeeExitClearanceTemplates, getEmployeeExitPolicies, saveEmployeeExitClearanceTemplate, saveEmployeeExitPolicy, updateEmployeeExitPolicy } from "../../employees/employeeServices";
import { AppButton } from "../../../shared/components/ui";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";

type PolicyScope = "company" | "department" | "role";

const defaultPolicy: EmployeeExitPolicy = {
  minimumNoticeDays: 30, noticePaySalaryBasis: "GrossMonthly", noticePayDailyRateDivisor: 30, enableOffboarding: true, allowEmployeeSelfResignation: true, allowRejoin: true, requireManagerReview: true, requireHrReview: true, allowJointDiscussion: true, requireResignationEvidence: true, requireEmployeeAcknowledgement: true, enableFormerEmployeePortal: true, enableNoticePeriodReminders: true, noticePeriodReminderEveryDays: 3, noticePeriodReminderOffsets: ["30", "15", "7", "3", "1", "0"], notifyNoticePeriodEmployee: true, notifyNoticePeriodReportingManager: true, notifyNoticePeriodHr: true, notifyNoticePeriodAdmins: false, noticePeriodReminderEmail: true, requireHandover: false, requireAssetClearance: false, requireAccessRevocation: false, requireFinanceClearance: false, requireBenefitClearance: false, requireFinalSettlement: false, presetLevel: "Basic", features: [], isActive: true,
};

type FeatureKey = EmployeeExitFeatureConfiguration["key"];
type FeatureOption = { key: FeatureKey; title: string; description: string; legacyKey?: keyof EmployeeExitPolicy; completionCapable?: boolean };

const featureSections: Array<{ title: string; description: string; options: FeatureOption[] }> = [
  { title: "Start", description: "Choose how an exit can begin.", options: [{ key: "SelfResignation", title: "Employee resignation", description: "Employees can start their own resignation.", legacyKey: "allowEmployeeSelfResignation" }, { key: "HrInitiatedExit", title: "HR initiated exit", description: "HR can begin an employer-initiated exit." }] },
  { title: "Approvals & conversations", description: "Configure the decision path once; these controls replace the duplicate review settings.", options: [{ key: "ManagerApproval", title: "Manager approval", description: "The reporting manager reviews the exit before HR.", legacyKey: "requireManagerReview" }, { key: "HrApproval", title: "HR approval", description: "HR approves before the notice period begins.", legacyKey: "requireHrReview" }, { key: "Discussion", title: "Joint discussion", description: "Employee, manager and HR can record a discussion.", legacyKey: "allowJointDiscussion" }] },
  { title: "Notice", description: "Enable the notice-period capabilities needed for this policy.", options: [{ key: "NoticePeriod", title: "Notice period", description: "Track the configured notice period." }, { key: "NoticeAdjustments", title: "Notice adjustments", description: "Allow approved notice buyout or recovery adjustments." }, { key: "Withdrawal", title: "Withdrawal", description: "Allow a resignation to be withdrawn." }] },
  { title: "Operational work", description: "Turn on the work that belongs in the exit. A checked completion blocker must be finished before the exit can close.", options: [{ key: "Handover", title: "Handover", description: "Knowledge and work transfer.", legacyKey: "requireHandover", completionCapable: true }, { key: "Clearance", title: "Clearance", description: "Create applicable clearance tasks." }, { key: "Assets", title: "Assets", description: "Return or financially recover company assets.", legacyKey: "requireAssetClearance", completionCapable: true }, { key: "ItAccess", title: "IT access", description: "Revoke or schedule access removal.", legacyKey: "requireAccessRevocation", completionCapable: true }, { key: "Finance", title: "Finance", description: "Review payments and recoveries.", legacyKey: "requireFinanceClearance", completionCapable: true }, { key: "Benefits", title: "Benefits", description: "Stop or transfer benefits.", legacyKey: "requireBenefitClearance", completionCapable: true }, { key: "FinalSettlement", title: "Final settlement", description: "Calculate and approve the final settlement.", legacyKey: "requireFinalSettlement", completionCapable: true }] },
  { title: "Employee requirements", description: "Set the information and acknowledgements required from the employee.", options: [{ key: "Evidence", title: "Resignation evidence", description: "Require the configured resignation proof.", legacyKey: "requireResignationEvidence" }] },
  { title: "Exit experience", description: "Optional activities and documents during the exit.", options: [{ key: "ExitInterview", title: "Exit interview", description: "Include an exit interview." }, { key: "Documents", title: "Documents", description: "Prepare exit documents." }] },
  { title: "Post-exit", description: "Control access after employment ends.", options: [{ key: "FormerEmployeePortal", title: "Former employee portal", description: "Allow eligible former employees to access approved post-exit records.", legacyKey: "enableFormerEmployeePortal" }] },
];

const featureOptions = featureSections.flatMap(section => section.options);
const legacyFeatureValues: Array<[keyof EmployeeExitPolicy, FeatureKey]> = featureOptions.flatMap(option => option.legacyKey ? [[option.legacyKey, option.key] as [keyof EmployeeExitPolicy, FeatureKey]] : []);
const legacyCompletionKeys: Partial<Record<FeatureKey, keyof EmployeeExitPolicy>> = { Handover: "requireHandover", Assets: "requireAssetClearance", ItAccess: "requireAccessRevocation", Finance: "requireFinanceClearance", Benefits: "requireBenefitClearance", FinalSettlement: "requireFinalSettlement" };
const acknowledgementOption = { key: "requireEmployeeAcknowledgement" as const, title: "Employee acknowledgement", description: "Require the employee to acknowledge confirmed exit details." };

const departmentName = (department: DepartmentModel) => Object.values(department.titles ?? {})[0] || "Unnamed department";
const policyDepartmentIds = (policy: EmployeeExitPolicy) => Array.from(new Set([...(policy.departmentIds || []), policy.departmentId].filter((value): value is string => Boolean(value))));
const getFeature = (policy: EmployeeExitPolicy, option: FeatureOption): EmployeeExitFeatureConfiguration => {
  const saved = policy.features?.find(feature => feature.key === option.key);
  const legacyEnabled = option.legacyKey ? Boolean(policy[option.legacyKey]) : false;
  return saved || { key: option.key, enabled: legacyEnabled, blocksCompletion: Boolean(legacyCompletionKeys[option.key] && policy[legacyCompletionKeys[option.key]!]), required: false, allowWaiver: false, waiverReasonRequired: false };
};
const normalizePolicy = (policy: EmployeeExitPolicy): EmployeeExitPolicy => {
  const features = featureOptions.map(option => getFeature(policy, option)).map(feature => ({ ...feature, blocksCompletion: feature.enabled && feature.blocksCompletion }));
  const normalized = { ...policy, features };
  legacyFeatureValues.forEach(([legacyKey, featureKey]) => {
    const enabled = features.find(feature => feature.key === featureKey)?.enabled ?? false;
    (normalized as Record<string, unknown>)[legacyKey] = enabled;
  });
  Object.entries(legacyCompletionKeys).forEach(([featureKey, legacyKey]) => {
    const feature = features.find(item => item.key === featureKey);
    (normalized as Record<string, unknown>)[legacyKey] = Boolean(feature?.enabled && feature.blocksCompletion);
  });
  return normalized;
};

const FieldHelp = ({ text }: { text: string }) => <Tooltip title={text} arrow placement="top"><Box component="span" className="policy-help" aria-label="More information" sx={{ display: "inline-flex", alignItems: "center", fontSize: 16, lineHeight: 1, color: "primary.main", opacity: 0, transition: "opacity .16s ease" }}><InfoOutlined fontSize="inherit" /></Box></Tooltip>;

const ToggleTile = ({
  option,
  checked,
  disabled = false,
  onChange,
}: {
  option: { key: keyof EmployeeExitPolicy; title: string; description: string };
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) => (
  <Box
    role="switch"
    aria-checked={checked}
    aria-disabled={disabled}
    tabIndex={disabled ? -1 : 0}
    onClick={disabled ? undefined : onChange}
    onKeyDown={(event) => {
      if (!disabled && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onChange();
      }
    }}
    sx={{
      minHeight: 44,
      px: 1.25,
      py: 0.75,
      display: "flex",
      alignItems: "center",
      gap: 1,
      cursor: disabled ? "default" : "pointer",
      border: "1px solid",
      borderColor: checked
        ? "color-mix(in srgb, var(--mui-palette-primary-main) 45%, transparent)"
        : "divider",
      borderRadius: 2,
      bgcolor: checked
        ? "color-mix(in srgb, var(--mui-palette-primary-main) 4%, var(--mui-palette-background-paper))"
        : "background.paper",
      color: "text.primary",
      opacity: disabled ? 0.6 : 1,
      transition: "all 0.18s ease",
      "&:hover, &:focus-visible, &:focus-within": disabled
        ? {}
        : {
            borderColor: "primary.main",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            outline: "none",
          },
      "& .MuiSwitch-root": { mr: 0, ml: -0.5 },
    }}
  >
    <Switch
      size="small"
      checked={checked}
      disabled={disabled}
      onClick={(event) => event.stopPropagation()}
      onChange={onChange}
    />
    <Box minWidth={0} sx={{ flex: 1 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 650,
          fontSize: "12.5px",
          color: checked ? "text.primary" : "text.secondary",
          lineHeight: 1.25,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {option.title}
      </Typography>
    </Box>
    <FieldHelp text={option.description} />
  </Box>
);

interface FeatureTileProps {
  title: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void;
  completionCapable?: boolean;
  blocksCompletion?: boolean;
  onToggleBlocker?: (blocks: boolean) => void;
  isEditing: boolean;
}

const FeatureTile = ({
  title,
  description,
  enabled,
  disabled = false,
  onToggle,
  completionCapable = false,
  blocksCompletion = false,
  onToggleBlocker,
  isEditing,
}: FeatureTileProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: completionCapable ? 84 : 64,
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 2,
        border: "1px solid",
        borderColor: enabled
          ? "color-mix(in srgb, var(--mui-palette-primary-main) 40%, transparent)"
          : "divider",
        bgcolor: enabled
          ? "color-mix(in srgb, var(--mui-palette-primary-main) 4%, var(--mui-palette-background-paper))"
          : "background.paper",
        boxShadow: enabled ? "0 1px 3px rgba(0, 0, 0, 0.04)" : "none",
        transition: "all 0.18s ease",
        opacity: !disabled && isEditing ? 1 : 0.72,
        "&:hover": !disabled && isEditing
          ? {
              borderColor: "primary.main",
              bgcolor: enabled
                ? "color-mix(in srgb, var(--mui-palette-primary-main) 7%, var(--mui-palette-background-paper))"
                : "action.hover",
            }
          : {},
      }}
    >
      <Box minWidth={0}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              fontSize: "13px",
              color: enabled ? "text.primary" : "text.secondary",
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
          <Tooltip title={enabled ? `Disable ${title}` : `Enable ${title}`}>
            <span>
              <Switch
                size="small"
                checked={enabled}
                disabled={disabled}
                onChange={onToggle}
                sx={{ my: -0.5, mr: -0.5 }}
              />
            </span>
          </Tooltip>
        </Stack>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: "11.5px",
            lineHeight: 1.35,
            display: "block",
            mt: 0.5,
          }}
        >
          {description}
        </Typography>
      </Box>

      {completionCapable && (
        <Box
          sx={{
            mt: 1,
            pt: 0.75,
            borderTop: "1px dashed",
            borderColor: enabled
              ? "color-mix(in srgb, var(--mui-palette-primary-main) 25%, transparent)"
              : "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 28,
          }}
        >
          <FormControlLabel
            sx={{
              m: 0,
              "& .MuiFormControlLabel-label": {
                fontSize: "11.5px",
                fontWeight: blocksCompletion ? 600 : 400,
                color: blocksCompletion ? "warning.dark" : "text.secondary",
              },
            }}
            label="Blocks completion"
            control={
              <Checkbox
                size="small"
                checked={enabled && blocksCompletion}
                disabled={disabled || !enabled}
                onChange={(e) => onToggleBlocker?.(e.target.checked)}
                sx={{
                  p: 0.25,
                  mr: 0.5,
                  "&.Mui-checked": { color: "warning.main" },
                }}
              />
            }
          />
          {enabled && blocksCompletion && (
            <Chip
              label="Blocker"
              size="small"
              color="warning"
              variant="outlined"
              sx={{
                height: 18,
                fontSize: "10px",
                fontWeight: 700,
                px: 0.25,
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export const EmployeeExitPolicySettings = () => {
  const [policy, setPolicy] = useState(defaultPolicy); const [policies, setPolicies] = useState<EmployeeExitPolicy[]>([]); const [departments, setDepartments] = useState<DepartmentModel[]>([]); const [roles, setRoles] = useState<RoleModel[]>([]); const [templates, setTemplates] = useState<EmployeeExitClearanceTemplate[]>([]); const [scope, setScope] = useState<PolicyScope>("company"); const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]); const [category, setCategory] = useState(""); const [templateKey, setTemplateKey] = useState(""); const [templateScope, setTemplateScope] = useState<"Global" | "Department">("Global"); const [templateDepartmentId, setTemplateDepartmentId] = useState(""); const [ownerPermission, setOwnerPermission] = useState(""); const [templateGate, setTemplateGate] = useState<EmployeeExitClearanceTemplate["requiredPolicyGate"]>("General"); const [dueDays, setDueDays] = useState(0); const [mandatory, setMandatory] = useState(true); const [visible, setVisible] = useState(false); const [saving, setSaving] = useState(false); const [expandedPolicyId, setExpandedPolicyId] = useState<string | false>(false); const [editingPolicyId, setEditingPolicyId] = useState<string | false>(false); const [templatePendingDelete, setTemplatePendingDelete] = useState<EmployeeExitClearanceTemplate | null>(null); const [deletingTemplate, setDeletingTemplate] = useState(false);
  const saveInFlight = useRef(false);
  const companyPolicy = useMemo(() => policies.find(item => !policyDepartmentIds(item).length && !item.roleId && !item.exitType), [policies]);
  const exitTypeLabel = (item: EmployeeExitPolicy) => item.exitType ? ({ Resigned: "Resignation", Terminated: "Termination", Retired: "Retirement", ContractEnded: "Contract end", Deceased: "Death" }[item.exitType] || item.exitType) : "Generic";
  const selectedDepartments = departments.filter(item => selectedDepartmentIds.includes(item.departmentId || ""));
  const selectedRole = roles.find(item => item.rolesId === policy.roleId) ?? null;
  const makeScopedPolicy = (nextScope: PolicyScope, id?: string) => {
    const existing = policies.find(item => nextScope === "company" ? !item.departmentId && !item.roleId && item.exitType === policy.exitType : nextScope === "department" ? item.departmentId === id && !item.roleId && item.exitType === policy.exitType : item.roleId === id && !item.departmentId && item.exitType === policy.exitType);
    if (existing) return existing;
    const base = companyPolicy ?? defaultPolicy;
    return { ...base, employeeExitPolicyId: undefined, departmentId: nextScope === "department" ? id : undefined, roleId: nextScope === "role" ? id : undefined };
  };
  const load = async (selection?: { scope: PolicyScope; departmentIds?: string[]; roleId?: string }) => { try { const [policyResponse, clearanceResponse, departmentResponse, roleResponse] = await Promise.all([getEmployeeExitPolicies(), getEmployeeExitClearanceTemplates(), getAllDepartments(true), getAllRoles(true)]); if (!policyResponse.data.success || !clearanceResponse.data.success) return; const loadedPolicies = policyResponse.data.methodResults || []; setPolicies(loadedPolicies); setDepartments(departmentResponse.data.success ? departmentResponse.data.methodResults || [] : []); setRoles(roleResponse.data.success ? roleResponse.data.methodResults || [] : []); setTemplates(clearanceResponse.data.methodResults || []); const requestedDepartmentIds = [...(selection?.departmentIds || [])].sort(); const selected = selection?.scope === "department" ? loadedPolicies.find(item => !item.roleId && JSON.stringify(policyDepartmentIds(item).sort()) === JSON.stringify(requestedDepartmentIds)) : selection?.scope === "role" ? loadedPolicies.find(item => item.roleId === selection.roleId && !policyDepartmentIds(item).length) : loadedPolicies.find(item => !policyDepartmentIds(item).length && !item.roleId); setPolicy(selected || loadedPolicies.find(item => !policyDepartmentIds(item).length && !item.roleId) || defaultPolicy); setVisible(true); } catch { setVisible(false); } };
  useEffect(() => { void load(); }, []);
  const chooseScope = (nextScope: PolicyScope, id?: string) => { setScope(nextScope); if (nextScope !== "department") setSelectedDepartmentIds([]); setPolicy(makeScopedPolicy(nextScope, id)); };
  const chooseDepartments = (values: DepartmentModel[]) => {
    const ids = values.map(item => item.departmentId).filter((id): id is string => Boolean(id));
    setSelectedDepartmentIds(ids);
    if (ids.length === 1) setPolicy(makeScopedPolicy("department", ids[0]));
    if (ids.length !== 1) { const base = policy.employeeExitPolicyId ? policy : companyPolicy ?? defaultPolicy; setPolicy({ ...base, employeeExitPolicyId: policy.employeeExitPolicyId, departmentId: undefined, departmentIds: ids, roleId: undefined }); }
  };
  const policyScopeLabel = (item: EmployeeExitPolicy) => {
    const departmentIds = policyDepartmentIds(item);
    if (departmentIds.length) {
      const names = departmentIds.map(id => departments.find(value => value.departmentId === id)).filter((value): value is DepartmentModel => Boolean(value)).map(departmentName);
      return `${exitTypeLabel(item)} · Department${departmentIds.length > 1 ? "s" : ""} · ${names.length ? names.join(", ") : `${departmentIds.length} selected`}`;
    }
    if (item.roleId) {
      const role = roles.find(value => value.rolesId === item.roleId);
      return role ? `${exitTypeLabel(item)} · Access role · ${role.titles}` : `${exitTypeLabel(item)} · Access role policy`;
    }
    return `${exitTypeLabel(item)} · Company default`;
  };
  const policyScopeKind = (item: EmployeeExitPolicy): PolicyScope => policyDepartmentIds(item).length ? "department" : item.roleId ? "role" : "company";
  const editPolicy = (item: EmployeeExitPolicy) => {
    const nextScope = policyScopeKind(item);
    setScope(nextScope);
    setSelectedDepartmentIds(policyDepartmentIds(item));
    setPolicy({ ...item });
    setExpandedPolicyId(item.employeeExitPolicyId || false);
    setEditingPolicyId(item.employeeExitPolicyId || false);
  };
  const addPolicy = () => {
    const base = companyPolicy ?? defaultPolicy;
    setScope("department");
    setSelectedDepartmentIds([]);
    setPolicy({ ...base, employeeExitPolicyId: undefined, departmentId: undefined, roleId: undefined });
    setExpandedPolicyId("new");
    setEditingPolicyId("new");
  };
  const toggle = (key: keyof EmployeeExitPolicy) => setPolicy(current => ({ ...current, [key]: !current[key] }));
  const updateFeature = (option: FeatureOption, changes: Partial<EmployeeExitFeatureConfiguration>) => setPolicy(current => {
    const value = getFeature(current, option);
    const next = { ...value, ...changes, blocksCompletion: changes.enabled === false ? false : Boolean(changes.blocksCompletion ?? value.blocksCompletion) };
    return { ...current, presetLevel: "Custom", features: [...(current.features || []).filter(feature => feature.key !== option.key), next] };
  });
  const savePolicy = async () => { if (saveInFlight.current) return; saveInFlight.current = true; setSaving(true); try { if (scope === "department" && !selectedDepartmentIds.length) throw new Error("Select at least one department."); const normalized = normalizePolicy(policy); const { companyId: _companyId, scopeKey: _scopeKey, createdBy: _createdBy, createdDate: _createdDate, updatedBy: _updatedBy, updatedDate: _updatedDate, isDeleted: _isDeleted, ...editablePolicy } = normalized as EmployeeExitPolicy & Record<string, unknown>; const payload = scope === "department" ? { ...editablePolicy, departmentId: selectedDepartmentIds.length === 1 ? selectedDepartmentIds[0] : undefined, departmentIds: selectedDepartmentIds, consolidateDepartmentPolicies: selectedDepartmentIds.length > 1, roleId: undefined } : editablePolicy; const existingPolicyId = typeof editingPolicyId === "string" && editingPolicyId !== "new" ? editingPolicyId : undefined; const response = existingPolicyId ? await updateEmployeeExitPolicy(existingPolicyId, payload) : await saveEmployeeExitPolicy(payload); if (!response.data.success) { const message = response.data.message === "EXIT_POLICY_SCOPE_CONFLICT" ? "This policy scope no longer matches the saved policy. Reload it before saving." : response.data.message === "EXIT_POLICY_DEPARTMENT_CONFIGURATION_DIFFERS" ? "Selected departments have different policies. Keep them separate or first make their settings match." : response.data.message === "EXIT_POLICY_DEPARTMENT_ALREADY_CONFIGURED" ? "This department already has a policy. Open and edit that policy instead." : response.data.message || "Unable to save policy."; throw new Error(message); } toast.success(scope === "department" ? `Shared policy saved for ${selectedDepartmentIds.length} department${selectedDepartmentIds.length === 1 ? "" : "s"}.` : "Offboarding policy saved."); await load({ scope, departmentIds: selectedDepartmentIds, roleId: policy.roleId }); setEditingPolicyId(false); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save policy."); } finally { saveInFlight.current = false; setSaving(false); } };
  const addTemplate = async () => { if (!category.trim() || (templateScope === "Department" && !templateDepartmentId)) return; setSaving(true); try { const response = await saveEmployeeExitClearanceTemplate({ templateKey: templateKey.trim() || undefined, scope: templateScope, departmentId: templateScope === "Department" ? templateDepartmentId : undefined, category: category.trim(), ownerPermission: ownerPermission || undefined, requiredPolicyGate: templateGate, isMandatory: mandatory, dueDaysBeforeLastWorkingDate: dueDays, isActive: true }); if (!response.data.success) throw new Error(response.data.message); setCategory(""); setTemplateKey(""); setTemplateDepartmentId(""); setOwnerPermission(""); setTemplateGate("General"); toast.success("Clearance template saved."); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save clearance template."); } finally { setSaving(false); } };
  const deleteTemplate = async () => { const templateId = templatePendingDelete?.employeeExitClearanceTemplateId; if (!templateId) return; setDeletingTemplate(true); try { const response = await deleteEmployeeExitClearanceTemplate(templateId); if (!response.data.success) throw new Error(response.data.message); toast.success("Clearance template deleted."); setTemplatePendingDelete(null); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete clearance template."); } finally { setDeletingTemplate(false); } };
  if (!visible) return null;
  const orderedPolicies = [...policies].sort((left, right) => {
    const leftRank = policyDepartmentIds(left).length ? 1 : left.roleId ? 2 : 0;
    const rightRank = policyDepartmentIds(right).length ? 1 : right.roleId ? 2 : 0;
    return leftRank - rightRank || policyScopeLabel(left).localeCompare(policyScopeLabel(right));
  });
  const renderPolicyFields = (item: EmployeeExitPolicy, isEditing: boolean, isNew = false) => {
    const displayedPolicy = isEditing ? policy : item;
    const displayedScope = isEditing ? scope : policyScopeKind(item);
    const displayedDepartments = isEditing ? selectedDepartments : departments.filter(value => policyDepartmentIds(item).includes(value.departmentId || ""));
    const displayedRole = isEditing ? selectedRole : roles.find(value => value.rolesId === item.roleId) ?? null;
    const canSaveHere = isEditing && !saving && !(displayedScope === "department" ? !selectedDepartmentIds.length : displayedScope === "role" && !policy.roleId);

    const activeFeatureCount =
      featureOptions.filter((option) => getFeature(displayedPolicy, option).enabled).length +
      (displayedPolicy.requireEmployeeAcknowledgement ? 1 : 0);
    const blockerFeatureCount = featureOptions.filter((option) => {
      const feature = getFeature(displayedPolicy, option);
      return feature.enabled && feature.blocksCompletion;
    }).length;

    return (
      <Stack spacing={2} sx={{ pt: 1.75, borderTop: "1px solid", borderColor: "divider" }}>
        {/* Basic Policy Configuration */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.5,
            minWidth: 0,
            "& .MuiFormHelperText-root": {
              minHeight: { sm: 20 },
              mx: 0.5,
              mt: 0.5,
              lineHeight: 1.25,
              fontSize: "11px",
            },
          }}
        >
          {/* Field 1: Exit outcome */}
          <TextField
            select
            fullWidth
            size="small"
            disabled={!isEditing || !isNew}
            label="Exit outcome"
            value={displayedPolicy.exitType || ""}
            onChange={event => setPolicy(current => ({ ...current, exitType: (event.target.value || undefined) as EmployeeExitPolicy["exitType"] }))}
            helperText="Applies generically or for a specific exit outcome"
          >
            <MenuItem value="">Generic offboarding policy</MenuItem>
            <MenuItem value="Resigned">Resignation</MenuItem>
            <MenuItem value="Terminated">Termination</MenuItem>
            <MenuItem value="Retired">Retirement</MenuItem>
            <MenuItem value="ContractEnded">Contract end</MenuItem>
            <MenuItem value="Deceased">Death</MenuItem>
          </TextField>

          {/* Field 2: Policy scope */}
          {isNew ? (
            <TextField
              select
              fullWidth
              size="small"
              label="Policy scope"
              value={displayedScope}
              onChange={event => chooseScope(event.target.value as PolicyScope)}
              helperText="Scope this policy applies to"
            >
              <MenuItem value="company">Everyone in the company</MenuItem>
              <MenuItem value="department">Selected departments</MenuItem>
              <MenuItem value="role">One access role</MenuItem>
            </TextField>
          ) : (
            <TextField
              fullWidth
              size="small"
              disabled
              label="Policy scope"
              value={policyScopeLabel(item)}
              helperText={isEditing ? "Saved policy scope cannot be changed" : "Configured policy scope"}
            />
          )}

          {/* Field 3: Workflow starting preset */}
          <TextField
            select
            fullWidth
            disabled={!isEditing}
            size="small"
            label="Workflow starting preset"
            value={displayedPolicy.presetLevel || "Custom"}
            onChange={event => setPolicy(current => ({ ...current, presetLevel: event.target.value as NonNullable<EmployeeExitPolicy["presetLevel"]> }))}
            helperText="Preconfigures default modules below"
          >
            <MenuItem value="Disabled">Disabled</MenuItem>
            <MenuItem value="Basic">Basic</MenuItem>
            <MenuItem value="Structured">Structured</MenuItem>
            <MenuItem value="Operational">Operational</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
            <MenuItem value="Enterprise">Enterprise</MenuItem>
            <MenuItem value="Custom">Custom</MenuItem>
          </TextField>

          {/* If scope needs department / role picker, it spans the entire grid evenly below */}
          {displayedScope === "department" && (
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                disabled={!isEditing}
                size="small"
                value={displayedDepartments}
                options={departments}
                getOptionLabel={departmentName}
                onChange={(_, values) => chooseDepartments(values)}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox size="small" checked={selected} sx={{ mr: 0.75 }} />
                    {departmentName(option)}
                  </li>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Departments"
                    placeholder="Select departments"
                    helperText={isEditing ? "Departments sharing this exact offboarding journey" : undefined}
                  />
                )}
              />
            </Box>
          )}
          {displayedScope === "role" && (
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Autocomplete
                disabled={!isEditing || !isNew}
                size="small"
                value={displayedRole}
                options={roles}
                getOptionLabel={value => value.titles}
                onChange={(_, value) => chooseScope("role", value?.rolesId)}
                renderInput={params => <TextField {...params} label="Access role" placeholder="Select a role" />}
              />
            </Box>
          )}
          {displayedScope === "company" && isNew && (
            <Box sx={{ gridColumn: "1 / -1", minHeight: 32, px: 1.25, py: 0.5, display: "flex", alignItems: "center", border: "1px dashed", borderColor: "divider", borderRadius: 1.5, bgcolor: "action.hover" }}>
              <Typography variant="caption" color="text.secondary">Applies as company default to all employees without a specific exception.</Typography>
            </Box>
          )}

          {/* Field 4: Minimum notice days */}
          <TextField
            fullWidth
            disabled={!isEditing}
            size="small"
            label="Minimum notice days"
            type="number"
            inputProps={{ min: 0 }}
            value={displayedPolicy.minimumNoticeDays}
            onChange={event => setPolicy(current => ({ ...current, minimumNoticeDays: Math.max(0, Number(event.target.value) || 0) }))}
            helperText="Use 0 when no notice period is required"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <FieldHelp text="Shortest normal notice period. An earlier LWD requires approved adjustment." />
                </InputAdornment>
              ),
            }}
          />

          {/* Field 5: Notice-pay salary basis */}
          <TextField
            select
            fullWidth
            disabled={!isEditing}
            size="small"
            label="Notice-pay salary basis"
            value={displayedPolicy.noticePaySalaryBasis}
            onChange={event => setPolicy(current => ({ ...current, noticePaySalaryBasis: event.target.value as EmployeeExitPolicy["noticePaySalaryBasis"] }))}
            helperText="Payroll amount used for buyout or recovery"
          >
            <MenuItem value="GrossMonthly">Gross monthly pay</MenuItem>
            <MenuItem value="BasicMonthly">Basic monthly pay</MenuItem>
          </TextField>

          {/* Field 6: Daily-rate divisor */}
          <TextField
            fullWidth
            disabled={!isEditing}
            size="small"
            label="Daily-rate divisor"
            type="number"
            inputProps={{ min: 1, max: 31 }}
            value={displayedPolicy.noticePayDailyRateDivisor}
            onChange={event => setPolicy(current => ({ ...current, noticePayDailyRateDivisor: Math.min(31, Math.max(1, Number(event.target.value) || 30)) }))}
            helperText="Monthly pay ÷ divisor = daily rate"
          />
        </Box>

        {/* Notice-period Reminders */}
        <Card
          variant="outlined"
          sx={{
            p: { xs: 1.25, sm: 1.75 },
            borderRadius: 2,
            bgcolor: "background.paper",
            borderColor: "divider",
            minWidth: 0,
          }}
        >
          {/* Header with Title + Chip + Master Toggle */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
            gap={1}
            sx={{ mb: 1.5 }}
          >
            <Box minWidth={0}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="subtitle2" sx={{ fontWeight: 750, fontSize: "13px" }}>
                  Notice-period reminders
                </Typography>
                <Chip
                  size="small"
                  variant={displayedPolicy.enableNoticePeriodReminders ? "filled" : "outlined"}
                  color={displayedPolicy.enableNoticePeriodReminders ? "primary" : "default"}
                  label={displayedPolicy.enableNoticePeriodReminders ? "Active" : "Paused"}
                  sx={{ height: 20, fontSize: "10.5px", fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "11.5px", display: "block" }}>
                Automated server-side notifications sent during active notice period.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.25,
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: displayedPolicy.enableNoticePeriodReminders
                  ? "color-mix(in srgb, var(--mui-palette-primary-main) 6%, var(--mui-palette-background-paper))"
                  : "action.hover",
                border: "1px solid",
                borderColor: displayedPolicy.enableNoticePeriodReminders
                  ? "color-mix(in srgb, var(--mui-palette-primary-main) 35%, transparent)"
                  : "divider",
                alignSelf: { xs: "stretch", sm: "auto" },
                justifyContent: { xs: "space-between", sm: "flex-start" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 650, fontSize: "12px" }}>
                Enable reminders
              </Typography>
              <Switch
                size="small"
                checked={displayedPolicy.enableNoticePeriodReminders}
                disabled={!isEditing}
                onChange={() => toggle("enableNoticePeriodReminders")}
                color="primary"
              />
            </Box>
          </Stack>

          {/* Body content */}
          <Box
            sx={{
              opacity: displayedPolicy.enableNoticePeriodReminders ? 1 : 0.6,
              pointerEvents: displayedPolicy.enableNoticePeriodReminders ? "auto" : "none",
              transition: "opacity 0.2s ease",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {/* Cadence & Milestones: Exactly 2 equal columns on sm+ */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 1.5,
                "& .MuiFormHelperText-root": {
                  minHeight: 20,
                  mx: 0.5,
                  mt: 0.5,
                  lineHeight: 1.25,
                  fontSize: "11px",
                },
              }}
            >
              <TextField
                fullWidth
                size="small"
                disabled={!isEditing || !displayedPolicy.enableNoticePeriodReminders}
                label="Repeat cadence"
                type="number"
                inputProps={{ min: 1, max: 365 }}
                value={displayedPolicy.noticePeriodReminderEveryDays}
                onChange={event =>
                  setPolicy(current => ({
                    ...current,
                    noticePeriodReminderEveryDays: Math.min(365, Math.max(1, Number(event.target.value) || 3)),
                  }))
                }
                helperText="Send recurring reminders every N days during notice"
                InputProps={{
                  endAdornment: <InputAdornment position="end">days</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                size="small"
                disabled={!isEditing || !displayedPolicy.enableNoticePeriodReminders}
                label="Milestones before last working day"
                value={(displayedPolicy.noticePeriodReminderOffsets || []).join(", ")}
                onChange={event =>
                  setPolicy(current => ({
                    ...current,
                    noticePeriodReminderOffsets: event.target.value.split(",").map(value => value.trim()).filter(Boolean),
                  }))
                }
                helperText="Specific alert days before LWD (e.g. 30, 15, 7, 3, 1, 0)"
              />
            </Box>

            {/* Notification Recipients: 4 equal columns on md+, 2 on sm */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, fontSize: "10.5px", mb: 0.75, display: "block" }}>
                Notify Recipients
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                  gap: 1,
                }}
              >
                <ToggleTile
                  option={{ key: "notifyNoticePeriodEmployee", title: "Employee", description: "Send the employee notice-period reminders." }}
                  checked={displayedPolicy.notifyNoticePeriodEmployee}
                  disabled={!isEditing || !displayedPolicy.enableNoticePeriodReminders}
                  onChange={() => toggle("notifyNoticePeriodEmployee")}
                />
                <ToggleTile
                  option={{ key: "notifyNoticePeriodReportingManager", title: "Reporting manager", description: "Send the reporting manager reminder alerts." }}
                  checked={displayedPolicy.notifyNoticePeriodReportingManager}
                  disabled={!isEditing || !displayedPolicy.enableNoticePeriodReminders}
                  onChange={() => toggle("notifyNoticePeriodReportingManager")}
                />
                <ToggleTile
                  option={{ key: "notifyNoticePeriodHr", title: "HR / Case manager", description: "Send authorized offboarding managers the reminder." }}
                  checked={displayedPolicy.notifyNoticePeriodHr}
                  disabled={!isEditing || !displayedPolicy.enableNoticePeriodReminders}
                  onChange={() => toggle("notifyNoticePeriodHr")}
                />
                <ToggleTile
                  option={{ key: "notifyNoticePeriodAdmins", title: "System admins", description: "Include administrators when explicitly required." }}
                  checked={displayedPolicy.notifyNoticePeriodAdmins}
                  disabled={!isEditing || !displayedPolicy.enableNoticePeriodReminders}
                  onChange={() => toggle("notifyNoticePeriodAdmins")}
                />
              </Box>
            </Box>

            {/* Delivery Channel: Full width clean card strip */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                px: 1.5,
                py: 0.85,
                borderRadius: 1.5,
                bgcolor: displayedPolicy.noticePeriodReminderEmail
                  ? "color-mix(in srgb, var(--mui-palette-primary-main) 4%, var(--mui-palette-background-paper))"
                  : "action.hover",
                border: "1px dashed",
                borderColor: displayedPolicy.noticePeriodReminderEmail
                  ? "color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)"
                  : "divider",
              }}
            >
              <Box minWidth={0}>
                <Typography variant="body2" sx={{ fontWeight: 650, fontSize: "12.5px" }}>
                  Email notification delivery
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "11px", display: "block" }}>
                  Deliver email notifications to verified email addresses of selected recipients.
                </Typography>
              </Box>
              <Switch
                size="small"
                checked={displayedPolicy.noticePeriodReminderEmail}
                disabled={!isEditing || !displayedPolicy.enableNoticePeriodReminders}
                onChange={() => toggle("noticePeriodReminderEmail")}
                color="primary"
              />
            </Box>
          </Box>
        </Card>

        {/* Master Control Bar for Policy Modules */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: displayedPolicy.enableOffboarding
              ? "color-mix(in srgb, var(--mui-palette-primary-main) 30%, transparent)"
              : "divider",
            bgcolor: displayedPolicy.enableOffboarding
              ? "color-mix(in srgb, var(--mui-palette-primary-main) 3%, var(--mui-palette-background-paper))"
              : "action.hover",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box minWidth={0}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: { xs: "14px", sm: "15px" } }}>
                Policy modules
              </Typography>
              <Chip
                size="small"
                color={displayedPolicy.enableOffboarding ? "primary" : "default"}
                variant={displayedPolicy.enableOffboarding ? "filled" : "outlined"}
                label={displayedPolicy.enableOffboarding ? "Active" : "Disabled"}
                sx={{ height: 22, fontSize: "11px", fontWeight: 700 }}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${activeFeatureCount} active`}
                sx={{ height: 22, fontSize: "11px", fontWeight: 600 }}
              />
              {blockerFeatureCount > 0 && (
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={`${blockerFeatureCount} completion blockers`}
                  sx={{ height: 22, fontSize: "11px", fontWeight: 600 }}
                />
              )}
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "12px" }}>
              Each capability is configured once. Completion blockers appear only on operational work the server can enforce.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              alignSelf: { xs: "stretch", sm: "auto" },
              justifyContent: { xs: "space-between", sm: "flex-start" },
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "13px" }}>
                Enable offboarding
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "11px" }}>
                {displayedPolicy.enableOffboarding ? "Workflow is active" : "Workflow is paused"}
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={displayedPolicy.enableOffboarding}
              disabled={!isEditing}
              onChange={() => toggle("enableOffboarding")}
              color="primary"
            />
          </Box>
        </Box>

        {/* Feature Sections */}
        <Stack spacing={1.5}>
          {featureSections.map(section => {
            const isEmpReq = section.title === "Employee requirements";
            const sectionEnabledCount =
              section.options.filter(option => getFeature(displayedPolicy, option).enabled).length +
              (isEmpReq && displayedPolicy.requireEmployeeAcknowledgement ? 1 : 0);
            const sectionTotalCount = section.options.length + (isEmpReq ? 1 : 0);

            const getGridCols = () => {
              if (section.title === "Approvals & conversations" || section.title === "Notice") {
                return { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" };
              }
              if (section.title === "Post-exit") {
                return { xs: "1fr" };
              }
              return { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" };
            };

            return (
              <Card
                component="section"
                key={section.title}
                variant="outlined"
                sx={{
                  p: { xs: 1.25, sm: 1.5 },
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  boxShadow: "none",
                  borderColor: "divider",
                  minWidth: 0,
                  opacity: displayedPolicy.enableOffboarding ? 1 : 0.65,
                  transition: "opacity 0.2s ease",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  gap={0.5}
                  sx={{ mb: 1.25 }}
                >
                  <Box minWidth={0}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 750, fontSize: "13px" }}>
                      {section.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "11.5px", display: "block" }}>
                      {section.description}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={sectionEnabledCount > 0 ? "primary" : "default"}
                    label={`${sectionEnabledCount}/${sectionTotalCount} enabled`}
                    sx={{
                      height: 22,
                      fontSize: "11px",
                      fontWeight: 600,
                      alignSelf: { xs: "flex-start", sm: "center" },
                    }}
                  />
                </Stack>

                <Box sx={{ display: "grid", gridTemplateColumns: getGridCols(), gap: 1 }}>
                  {section.options.map(option => {
                    const value = getFeature(displayedPolicy, option);
                    const isLastOperational = section.title === "Operational work" && option.key === "FinalSettlement";
                    return (
                      <Box key={option.key} sx={{ gridColumn: isLastOperational ? { sm: "1 / -1" } : undefined, height: "100%" }}>
                        <FeatureTile
                          title={option.title}
                          description={option.description}
                          enabled={value.enabled}
                          disabled={!isEditing || !displayedPolicy.enableOffboarding}
                          onToggle={() => updateFeature(option, { enabled: !value.enabled })}
                          completionCapable={option.completionCapable}
                          blocksCompletion={value.blocksCompletion}
                          onToggleBlocker={blocks => updateFeature(option, { blocksCompletion: blocks })}
                          isEditing={isEditing}
                        />
                      </Box>
                    );
                  })}
                  {isEmpReq && (
                    <Box sx={{ height: "100%" }}>
                      <FeatureTile
                        key={acknowledgementOption.key}
                        title={acknowledgementOption.title}
                        description={acknowledgementOption.description}
                        enabled={displayedPolicy.requireEmployeeAcknowledgement}
                        disabled={!isEditing || !displayedPolicy.enableOffboarding}
                        onToggle={() => toggle("requireEmployeeAcknowledgement")}
                        isEditing={isEditing}
                      />
                    </Box>
                  )}
                </Box>
              </Card>
            );
          })}
        </Stack>

        {/* Action Buttons */}
        {isEditing ? (
          <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="flex-end" gap={1} sx={{ pt: 1 }}>
            <AppButton variant="outlined" onClick={() => { setEditingPolicyId(false); if (!isNew) setPolicy({ ...item }); }}>Cancel</AppButton>
            <AppButton disabled={!canSaveHere} onClick={() => void savePolicy()}>{saving ? "Saving…" : isNew ? "Create policy" : "Save changes"}</AppButton>
          </Stack>
        ) : (
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1} sx={{ pt: 1 }}>
            <Typography variant="caption" color="text.secondary">Fields are read-only until you choose Edit policy.</Typography>
            <AppButton size="small" variant="outlined" onClick={() => editPolicy(item)} sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>Edit policy</AppButton>
          </Stack>
        )}
      </Stack>
    );
  };
  // This route sits inside the shared Company Details tab layout. Keep it fluid so it
  // uses the same available width as Company Details, Modules and Office Schedule.
  return <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ py: 0, width: "100%", maxWidth: "none", minWidth: 0 }}>
    <Alert severity="info" sx={{ borderRadius: { xs: 2.5, sm: 3 }, alignItems: "center" }}>Policy priority is <strong>Department</strong>, then <strong>access role</strong>, then the <strong>company default</strong>. Create the company default first, then add an exception only where needed.</Alert>
    <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, borderRadius: { xs: 2.5, sm: 3 }, boxShadow: "0 10px 28px rgba(24, 74, 82, .07)", minWidth: 0 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1.25}>
        <Box><Typography variant="h6" fontWeight={750}>Saved offboarding policies</Typography><Typography variant="body2" color="text.secondary">Expand a policy to review it, then edit it or add a new exception for a department or access role.</Typography></Box>
        <AppButton size="small" startIcon={<AddOutlined />} onClick={addPolicy} sx={{ alignSelf: { xs: "stretch", sm: "auto" }, flexShrink: 0 }}>Add policy</AppButton>
      </Stack>
      <Stack spacing={1.25} sx={{ mt: 2 }}>
        {orderedPolicies.map((item, index) => {
          const itemId = item.employeeExitPolicyId || `${item.departmentId || item.roleId || "company"}-${index}`;
          const journeyCount = featureOptions.filter(option => getFeature(item, option).enabled).length;
          const gateCount = featureOptions.filter(option => { const feature = getFeature(item, option); return feature.enabled && feature.blocksCompletion; }).length;
          return <Accordion key={itemId} disableGutters elevation={0} expanded={expandedPolicyId === itemId} onChange={(_, expanded) => setExpandedPolicyId(expanded ? itemId : false)} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "12px !important", overflow: "hidden", "&:before": { display: "none" }, "&.Mui-expanded": { borderColor: "primary.main" } }}>
            <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: { xs: 1.25, sm: 1.75 }, minHeight: 64, "& .MuiAccordionSummary-content": { my: 1.25, minWidth: 0 }, "& .MuiAccordionSummary-content.Mui-expanded": { my: 1.25 } }}>
              <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1} width="100%" minWidth={0}>
                <Box minWidth={0}><Typography fontWeight={750} noWrap>{policyScopeLabel(item)}</Typography><Typography variant="caption" color="text.secondary">{item.enableOffboarding ? "Offboarding enabled" : "Offboarding turned off"} · {item.minimumNoticeDays} day notice period</Typography></Box>
                <Stack direction="row" flexWrap="wrap" gap={.75} sx={{ pr: { sm: 1 } }}><Chip size="small" label={`${journeyCount} journey setting${journeyCount === 1 ? "" : "s"}`} variant="outlined" /><Chip size="small" label={gateCount ? `${gateCount} required gate${gateCount === 1 ? "" : "s"}` : "No required gates"} color={gateCount ? "warning" : "default"} variant="outlined" /></Stack>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 1.25, sm: 1.75 }, pt: 0, pb: 1.5 }}>{renderPolicyFields(item, editingPolicyId === itemId)}</AccordionDetails>
          </Accordion>;
        })}
        {editingPolicyId === "new" && <Accordion disableGutters elevation={0} expanded={expandedPolicyId === "new"} sx={{ border: "1px solid", borderColor: "primary.main", borderRadius: "12px !important", overflow: "hidden", "&:before": { display: "none" } }}><AccordionSummary sx={{ px: { xs: 1.25, sm: 1.75 }, minHeight: 64, "& .MuiAccordionSummary-content": { my: 1.25 } }}><Box><Typography fontWeight={750}>New offboarding policy</Typography><Typography variant="caption" color="text.secondary">Choose a department or access role, then configure its exit journey.</Typography></Box></AccordionSummary><AccordionDetails sx={{ px: { xs: 1.25, sm: 1.75 }, pt: 0, pb: 1.5 }}>{renderPolicyFields(defaultPolicy, true, true)}</AccordionDetails></Accordion>}
      </Stack>
    </Card>

    <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, borderRadius: 3, minWidth: 0 }}>
      <Typography variant="h6" fontWeight={750}>Clearance templates</Typography>
      <Typography variant="body2" color="text.secondary">Global templates apply to everyone. A department template replaces only the matching template key for that department.</Typography>
      {templates.length > 0 && <Stack spacing={1} sx={{ mt: 2 }}>{templates.map(template => <Box key={template.employeeExitClearanceTemplateId || `${template.scope}-${template.templateKey || template.category}`} sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 1, alignItems: "center", p: { xs: 1, sm: 1.25 }, borderRadius: 2, bgcolor: "action.hover", minWidth: 0 }}><Stack direction="row" flexWrap="wrap" gap={.75} alignItems="center" sx={{ minWidth: 0 }}><Typography fontWeight={650} sx={{ mr: { sm: .25 }, overflowWrap: "anywhere" }}>{template.category}</Typography><Chip size="small" color="primary" variant="outlined" label={template.templateKey || template.category} /><Chip size="small" label={template.scope === "Department" ? "Department override" : "Global"} /><Chip size="small" color="primary" variant="outlined" label={template.requiredPolicyGate || "General"} /><Chip size="small" label={template.ownerRole || "HR / manager fallback"} /><Chip size="small" color={template.isMandatory ? "warning" : "default"} label={template.isMandatory ? "Mandatory" : "Optional"} /><Typography variant="caption" color="text.secondary" sx={{ whiteSpace: { xs: "normal", sm: "nowrap" } }}>Due {template.dueDaysBeforeLastWorkingDate} day(s) before LWD</Typography></Stack><Tooltip title="Delete clearance template" arrow><span><IconButton aria-label={`Delete ${template.category} clearance template`} color="error" size="small" disabled={!template.employeeExitClearanceTemplateId} onClick={() => setTemplatePendingDelete(template)} sx={{ width: 34, height: 34, border: "1px solid", borderColor: "divider", borderRadius: 1.75, "&:hover": { bgcolor: "error.lighter", borderColor: "error.main" } }}><DeleteOutlineRounded fontSize="small" /></IconButton></span></Tooltip></Box>)}</Stack>}
      <Divider sx={{ my: 2.5 }} />
      <Typography fontWeight={700}>Add clearance template</Typography>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
        gap: 1.25,
        mt: 1.5,
        alignItems: "start",
        minWidth: 0,
        "& .MuiFormHelperText-root": {
          minHeight: 18,
          mx: 0.5,
          mt: 0.5,
          lineHeight: 1.25,
          fontSize: "11px",
        },
      }}>
        <TextField size="small" label="Clearance category" placeholder="For example: Laptop return" value={category} onChange={event => setCategory(event.target.value)} />
        <TextField size="small" label="Template key" placeholder="For example: LAPTOP_RETURN" value={templateKey} onChange={event => setTemplateKey(event.target.value)} helperText="Use the same key to override this task for a department." />
        <TextField select size="small" label="Applies to" value={templateScope} onChange={event => { const value = event.target.value as "Global" | "Department"; setTemplateScope(value); if (value === "Global") setTemplateDepartmentId(""); }}><MenuItem value="Global">Everyone in the company</MenuItem><MenuItem value="Department">One department</MenuItem></TextField>
        {templateScope === "Department" && <Autocomplete size="small" options={departments} getOptionLabel={departmentName} value={departments.find(department => department.departmentId === templateDepartmentId) || null} onChange={(_, department) => setTemplateDepartmentId(department?.departmentId || "")} renderInput={params => <TextField {...params} label="Department" required helperText="This template replaces only the same key for this department." />} />}
        <TextField select size="small" label="Required completion gate" value={templateGate} onChange={event => setTemplateGate(event.target.value as EmployeeExitClearanceTemplate["requiredPolicyGate"])}><MenuItem value="General">General</MenuItem><MenuItem value="Handover">Handover</MenuItem><MenuItem value="AssetClearance">Asset clearance</MenuItem><MenuItem value="AccessRevocation">Access revocation</MenuItem><MenuItem value="FinanceClearance">Finance clearance</MenuItem><MenuItem value="BenefitClearance">Benefit clearance</MenuItem></TextField>
        <TextField select size="small" label="Responsible permission" value={ownerPermission} onChange={event => setOwnerPermission(event.target.value)} helperText="Leave empty for the reporting-manager fallback."><MenuItem value="">Reporting manager fallback</MenuItem><MenuItem value="CaseManage">Offboarding case management</MenuItem><MenuItem value="AssetManage">Asset management</MenuItem><MenuItem value="AccessManage">IT access management</MenuItem><MenuItem value="FinanceManage">Finance management</MenuItem><MenuItem value="BenefitsManage">Benefits management</MenuItem></TextField>
        <TextField size="small" type="number" inputProps={{ min: 0 }} label="Days before last working day" value={dueDays} onChange={event => setDueDays(Math.max(0, Number(event.target.value) || 0))} />
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1} sx={{ mt: 1.5, pt: 1.25, borderTop: "1px solid", borderColor: "divider" }}><FormControlLabel sx={{ m: 0 }} control={<Checkbox checked={mandatory} onChange={event => setMandatory(event.target.checked)} />} label="This clearance is mandatory" /><AppButton disabled={saving || !category.trim() || (templateScope === "Department" && !templateDepartmentId)} onClick={() => void addTemplate()}>Add template</AppButton></Stack>
    </Card>
    {templatePendingDelete && <ConfirmationModal open confirming={deletingTemplate} title="Delete clearance template?" content={`“${templatePendingDelete.category}” will no longer be assigned to new offboarding cases. Existing cases keep their saved clearance details.`} handleClose={() => !deletingTemplate && setTemplatePendingDelete(null)} handleConfirmation={() => void deleteTemplate()} />}
  </Stack>;
};
