import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Alert, Grid, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { AppButton, AppTextField } from "../../../shared/components/ui";
import { postRequest } from "../../../../server/axios";
import { toast } from "react-toastify";
import { PayrollDateField } from "./PayrollDateField";
import { coversConfigurationWindow } from "./payrollConfigurationSelection";
import type { PayrollPayGroup } from "./PayrollPayGroupsPanel";

type Profile = { id?: string; name: string; version?: number; approvalStatus: string; isActive: boolean; scope?: string; effectiveFrom: string; effectiveTo?: string | null };
type Template = { id?: string; name: string; payGroupId?: string; isActive: boolean; effectiveFrom: string; effectiveTo?: string | null };
type PreviewRow = { employeeId: string; employeeName: string; department?: string; jobRole?: string; hasExistingAssignment: boolean; hasOverlap: boolean; conflictMessage?: string; canSubmit: boolean };
type Props = { groups: PayrollPayGroup[]; templates: Template[]; profiles: Profile[]; canEdit: boolean; onSubmitted: () => Promise<void> };

const employmentTypes = [{ value: 1, label: "Full-time" }, { value: 2, label: "Part-time" }, { value: 3, label: "Contract" }, { value: 4, label: "Internship" }, { value: 5, label: "Apprenticeship" }];

export function PayrollBulkAssignmentPanel({ groups, templates, profiles, canEdit, onSubmitted }: Props) {
  const [employeeIds, setEmployeeIds] = useState("");
  const [department, setDepartment] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [groupId, setGroupId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [from, setFrom] = useState(() => dayjs().startOf("month").format("YYYY-MM-DD"));
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [busy, setBusy] = useState(false);
  const ids = useMemo(() => [...new Set(employeeIds.split(/[\n,;]+/).map(id => id.trim()).filter(Boolean))], [employeeIds]);
  const eligibleGroups = groups.filter(group => group.isActive && coversConfigurationWindow(group, from, to));
  const eligibleTemplates = templates.filter(template => template.isActive && coversConfigurationWindow(template, from, to) && (!template.payGroupId || template.payGroupId === groupId));
  const eligibleProfiles = profiles.filter(profile => profile.isActive && profile.approvalStatus === "APPROVED" && coversConfigurationWindow(profile, from, to));
  const dateError = !from || Boolean(to && to < from);
  const hasTarget = ids.length > 0 || Boolean(department.trim() || jobRole.trim() || employmentType);

  const request = () => ({
    employeeIds: ids,
    department: department.trim() || undefined,
    jobRole: jobRole.trim() || undefined,
    employmentType: employmentType ? Number(employmentType) : undefined,
    payGroupId: groupId,
    salaryTemplateId: templateId || undefined,
    policyProfileId: profileId || undefined,
    effectiveFrom: `${from}T00:00:00`,
    effectiveTo: to ? `${to}T00:00:00` : undefined,
  });

  const preview = async () => {
    if (!canEdit || busy || !hasTarget || !groupId || dateError) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string; methodResults?: PreviewRow[] }>("api/payroll/configuration/assignments/bulk/preview", request());
      if (!data.success) throw new Error(data.message || "Unable to preview this employee group.");
      setRows(data.methodResults ?? []);
      if (!data.methodResults?.length) toast.info("No employees matched these filters.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to preview this employee group.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!canEdit || busy || rows.length === 0 || !rows.some(row => row.canSubmit)) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string; methodResult?: { submittedCount: number; conflictCount: number } }>("api/payroll/configuration/assignments/bulk", request());
      if (!data.success) throw new Error(data.message || "Unable to submit assignments.");
      const count = data.methodResult?.submittedCount ?? rows.filter(row => row.canSubmit).length;
      toast.success(`${count} assignment${count === 1 ? "" : "s"} submitted for Admin approval.`);
      setRows([]);
      setEmployeeIds(""); setDepartment(""); setJobRole(""); setEmploymentType(""); setGroupId(""); setTemplateId(""); setProfileId("");
      await onSubmitted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit assignments.");
    } finally {
      setBusy(false);
    }
  };

  if (!canEdit) return null;
  return <Stack spacing={2} sx={{ p: { xs: 2, md: 2.5 }, border: 1, borderColor: "divider", borderRadius: 2 }}>
    <Typography variant="subtitle1" fontWeight={750}>Assign a cohort</Typography>
    <Typography variant="body2" color="text.secondary">Use department, job role, or employment type filters, or provide employee IDs. Filters combine; when IDs are supplied, the other filters narrow that list. Preview conflicts before submitting. Every new assignment remains pending Admin approval.</Typography>
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, md: 6 }}><AppTextField fullWidth size="small" multiline minRows={2} label="Employee IDs (optional)" placeholder="EMP001, EMP002" value={employeeIds} onChange={event => { setEmployeeIds(event.target.value); setRows([]); }} helperText="Separate IDs with commas or new lines." /></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><AppTextField fullWidth size="small" label="Department ID (optional)" value={department} onChange={event => { setDepartment(event.target.value); setRows([]); }} /></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><AppTextField fullWidth size="small" label="Job role ID (optional)" value={jobRole} onChange={event => { setJobRole(event.target.value); setRows([]); }} /></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><AppTextField fullWidth select size="small" label="Employment type (optional)" value={employmentType} onChange={event => { setEmploymentType(event.target.value); setRows([]); }}><MenuItem value="">Any type</MenuItem>{employmentTypes.map(type => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}</AppTextField></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><AppTextField fullWidth select size="small" label="Pay group" value={groupId} onChange={event => { setGroupId(event.target.value); setTemplateId(""); setRows([]); }}><MenuItem value="">Select monthly group</MenuItem>{eligibleGroups.map(group => <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>)}</AppTextField></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><AppTextField fullWidth select size="small" label="Salary template (optional)" value={templateId} onChange={event => { setTemplateId(event.target.value); setRows([]); }}><MenuItem value="">No template</MenuItem>{eligibleTemplates.map(template => <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>)}</AppTextField></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><AppTextField fullWidth select size="small" label="Employee policy override (optional)" value={profileId} onChange={event => { setProfileId(event.target.value); setRows([]); }}><MenuItem value="">Inherit pay-group/company rule</MenuItem>{eligibleProfiles.map(profile => <MenuItem key={profile.id} value={profile.id}>{profile.name} · v{profile.version}</MenuItem>)}</AppTextField></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><PayrollDateField label="Effective from" value={from} onChange={value => { setFrom(value); setRows([]); }} required /></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><PayrollDateField label="Effective to (optional)" value={to} onChange={value => { setTo(value); setRows([]); }} minDate={from} error={Boolean(to && to < from)} /></Grid>
    </Grid>
    {!hasTarget && <Alert severity="info">Choose at least one target: employee IDs, department, job role, or employment type.</Alert>}
    {dateError && <Alert severity="error">Enter a valid effective date range.</Alert>}
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
      <AppButton variant="outlined" disabled={busy || !hasTarget || !groupId || dateError} onClick={() => void preview()}>{busy ? "Working…" : "Preview cohort"}</AppButton>
      <AppButton variant="contained" disabled={busy || !rows.some(row => row.canSubmit)} onClick={() => void submit()}>Submit eligible assignments</AppButton>
    </Stack>
    {rows.length > 0 && <Stack spacing={1}>
      <Alert severity={rows.some(row => !row.canSubmit) ? "warning" : "success"}>{rows.filter(row => row.canSubmit).length} eligible · {rows.filter(row => !row.canSubmit).length} conflict(s) · {rows.length} matched. Submission will be revalidated by the server.</Alert>
      <TableContainer sx={{ maxHeight: 320, border: 1, borderColor: "divider", borderRadius: 1 }}>
        <Table size="small" stickyHeader><TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Department</TableCell><TableCell>Role</TableCell><TableCell>Preview</TableCell></TableRow></TableHead>
          <TableBody>{rows.map(row => <TableRow key={row.employeeId}><TableCell><Typography variant="body2" fontWeight={650}>{row.employeeName || row.employeeId}</Typography><Typography variant="caption" color="text.secondary">{row.employeeId}</Typography></TableCell><TableCell>{row.department || "—"}</TableCell><TableCell>{row.jobRole || "—"}</TableCell><TableCell>{row.canSubmit ? "Eligible" : row.conflictMessage || "Conflict"}</TableCell></TableRow>)}</TableBody>
        </Table>
      </TableContainer>
    </Stack>}
  </Stack>;
}