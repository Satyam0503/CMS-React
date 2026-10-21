import { useState } from "react";
import dayjs from "dayjs";
import { Alert, Box, Chip, FormControlLabel, Grid, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, alpha, useTheme } from "@mui/material";
import { AppButton, AppCheckbox, AppTextField } from "../../../shared/components/ui";
import { postRequest, deleteRequest } from "../../../../server/axios";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";
import { toast } from "react-toastify";
import { configurationWindowIssue, coversConfigurationWindow } from "./payrollConfigurationSelection";
import { PayrollDateField } from "./PayrollDateField";
import { useIsDark } from "../../theme/useIsDark";

export type PayrollPayGroup = {
  id?: string; name: string; schedule: string; policyProfileId?: string;
  legalEntityId?: string; effectiveFrom: string; effectiveTo?: string | null;
  isActive: boolean; version?: number;
};
type GroupPolicy = { id?: string; name: string; approvalStatus: string; scope?: string; isActive: boolean; effectiveFrom: string; effectiveTo?: string | null };
type Props = { groups: PayrollPayGroup[]; profiles: GroupPolicy[]; canEdit: boolean; onSaved: () => Promise<void> };

export function PayrollPayGroupsPanel({ groups, profiles, canEdit, onSaved }: Props) {
  const theme = useTheme();
  const isDark = useIsDark();
  const [editing, setEditing] = useState<PayrollPayGroup | null>(null);
  const [name, setName] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [from, setFrom] = useState(() => dayjs().startOf("month").format("YYYY-MM-DD"));
  const [to, setTo] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<PayrollPayGroup | null>(null);

  const deleteGroup = async (group: PayrollPayGroup) => {
    if (!canEdit || !group.id || busy) return;
    setBusy(true);
    try {
      const { data } = await deleteRequest<{ success: boolean; message?: string }>(
        `api/payroll/configuration/pay-groups/${encodeURIComponent(group.id)}`
      );
      if (!data.success) {
        toast.error(data.message || "Unable to delete pay group.");
        return;
      }
      setGroupToDelete(null);
      toast.success(`Pay group "${group.name}" deleted.`);
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete pay group.");
    } finally {
      setBusy(false);
    }
  };
  const approvedProfiles = profiles.filter(profile => profile.isActive && profile.approvalStatus === "APPROVED" && profile.scope !== "ASSIGNMENT_ONLY");
  const eligibleProfiles = approvedProfiles.filter(profile => coversConfigurationWindow(profile, from, to));
  const selectedPolicy = profiles.find(profile => profile.id === policyId);
  const invalidDates = !from || Boolean(to && to < from);
  const invalidPolicy = Boolean(policyId && (!selectedPolicy || !approvedProfiles.includes(selectedPolicy) || !coversConfigurationWindow(selectedPolicy, from, to)));
  const reset = () => {
    setEditing(null); setName(""); setPolicyId(""); setFrom(dayjs().startOf("month").format("YYYY-MM-DD")); setTo(""); setActive(true);
  };
  const edit = (group: PayrollPayGroup) => {
    setEditing(group); setName(group.name); setPolicyId(group.policyProfileId ?? "");
    setFrom(dayjs(group.effectiveFrom).format("YYYY-MM-DD")); setTo(group.effectiveTo ? dayjs(group.effectiveTo).format("YYYY-MM-DD") : ""); setActive(group.isActive);
  };
  const save = async () => {
    if (!canEdit || busy || !name.trim() || invalidDates || invalidPolicy) return;
    setBusy(true);
    try {
      const { data } = await postRequest<unknown, { success: boolean; message?: string }>("api/payroll/configuration/pay-groups", {
        id: editing?.id, version: editing?.version, legalEntityId: editing?.legalEntityId,
        name: name.trim(), schedule: "MONTHLY", policyProfileId: policyId || undefined,
        effectiveFrom: from + "T00:00:00", effectiveTo: to ? to + "T00:00:00" : undefined, isActive: active,
      });
      if (!data.success) { toast.error(data.message || "Unable to save pay group."); return; }
      await onSaved(); toast.success(editing ? "Pay group updated." : "Pay group created."); reset();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save pay group."); }
    finally { setBusy(false); }
  };
  return <Stack spacing={3}>
    {canEdit && (
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: "14px",
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(226, 232, 240, 0.9)",
          bgcolor: isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(248, 250, 252, 0.75)",
          boxShadow: isDark ? "0 4px 16px rgba(0, 0, 0, 0.25)" : "0 2px 8px rgba(0, 0, 0, 0.03)",
        }}
      >
        <Stack spacing={0.5} sx={{ mb: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={750} sx={{ fontSize: "0.95rem" }}>
            {editing ? "Edit pay group: " + editing.name : "Create a pay group"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Set the monthly payroll cohort and the approved statutory profile that applies during its active dates.
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AppTextField fullWidth size="small" label="Pay Group Name" value={name} onChange={event => setName(event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AppTextField
              fullWidth
              select
              size="small"
              label="Statutory Profile"
              value={policyId}
              onChange={event => setPolicyId(event.target.value)}
              helperText={`${eligibleProfiles.length} approved profile${eligibleProfiles.length === 1 ? "" : "s"} cover these dates. Leave unbound to use the company default.`}
            >
              <MenuItem value="">Use company default</MenuItem>
              {approvedProfiles.map(profile => {
                const issue = configurationWindowIssue(profile, from, to);
                const reason = issue === "starts-after" ? "starts too late" : issue === "ends-before" ? "ends before this group" : issue === "inactive" ? "inactive" : issue === "invalid-window" ? "invalid dates" : "covers these dates";
                return (
                  <MenuItem key={profile.id} value={profile.id} disabled={Boolean(issue)}>
                    {profile.name} · {dayjs(profile.effectiveFrom).format("DD MMM YYYY")} → {profile.effectiveTo ? dayjs(profile.effectiveTo).format("DD MMM YYYY") : "No end date"} · {reason}
                  </MenuItem>
                );
              })}
              {policyId && !approvedProfiles.some(profile => profile.id === policyId) && (
                <MenuItem value={policyId} disabled>{selectedPolicy?.name ?? "Unavailable profile"}</MenuItem>
              )}
            </AppTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <PayrollDateField label="Effective from" value={from} onChange={setFrom} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <PayrollDateField
              label="Effective to (optional)"
              value={to}
              onChange={setTo}
              minDate={from}
              helperText="Leave blank for an open-ended group. The linked profile must cover this date range."
              error={Boolean(to && to < from)}
            />
          </Grid>
        </Grid>
        {invalidPolicy && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {selectedPolicy && configurationWindowIssue(selectedPolicy, from, to) === "starts-after"
              ? `The selected policy starts ${dayjs(selectedPolicy.effectiveFrom).format("DD MMM YYYY")}, after this group begins. Choose a profile that covers the full group period, change the group start date, or use the company default.`
              : selectedPolicy && configurationWindowIssue(selectedPolicy, from, to) === "ends-before"
                ? `The selected policy ends ${dayjs(selectedPolicy.effectiveTo).format("DD MMM YYYY")}, before this group ends. Choose a policy that covers the full date range, set a group end date within the policy, or use the company default.`
                : "This policy is unavailable or does not cover this group's full date range. Choose another approved profile or use the company default."}
          </Alert>
        )}
        <Box
          sx={{
            pt: 2,
            mt: 2,
            borderTop: "1px dashed",
            borderColor: "divider",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.5,
          }}
        >
          <FormControlLabel
            control={<AppCheckbox checked={active} onChange={event => setActive(event.target.checked)} />}
            label={<Typography variant="body2" fontWeight={650}>Active</Typography>}
          />
          <Stack direction="row" spacing={1.5}>
            {editing && (
              <AppButton
                variant="outlined"
                disabled={busy}
                onClick={reset}
                sx={{ height: 38, px: 2, textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
              >
                Cancel edit
              </AppButton>
            )}
            <AppButton
              variant="contained"
              disabled={busy || !name.trim() || invalidDates || invalidPolicy}
              onClick={() => void save()}
              sx={{
                height: 38,
                px: 2.5,
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
              {editing ? "Update Group" : "Save Group"}
            </AppButton>
          </Stack>
        </Box>
      </Box>
    )}
    {groups.length === 0 ? (
      <Alert severity="info">No Pay Groups Configured. Create a group to organize employees who share monthly payroll defaults.</Alert>
    ) : (
      <TableContainer
        sx={{
          overflowX: "auto",
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(226, 232, 240, 0.8)",
          borderRadius: "12px",
          boxShadow: isDark ? "0 4px 16px rgba(0, 0, 0, 0.2)" : "0 2px 8px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(241, 245, 249, 0.85)" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Pay Group Name</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Schedule</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Linked Policy</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Effective dates</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Status</TableCell>
              {canEdit && <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map(group => (
              <TableRow key={group.id ?? group.name} hover sx={{ "&:hover": { bgcolor: alpha("#0B5CAB", 0.03) } }}>
                <TableCell sx={{ fontWeight: 700 }}>{group.name}</TableCell>
                <TableCell>{group.schedule}</TableCell>
                <TableCell>{profiles.find(profile => profile.id === group.policyProfileId)?.name ?? (group.policyProfileId ? "Unavailable policy" : "Company default")}</TableCell>
                <TableCell sx={{ color: "text.secondary" }}>{dayjs(group.effectiveFrom).format("DD MMM YYYY")} → {group.effectiveTo ? dayjs(group.effectiveTo).format("DD MMM YYYY") : "No end date"}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={group.isActive ? "Active" : "Inactive"}
                    color={group.isActive ? "success" : "default"}
                    sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, borderRadius: "4px" }}
                  />
                </TableCell>
                {canEdit && (
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <AppButton
                        size="small"
                        variant="outlined"
                        disabled={busy}
                        onClick={() => edit(group)}
                        aria-label={"Edit " + group.name + " pay group"}
                        sx={{ height: 28, fontSize: "0.75rem", textTransform: "none", fontWeight: 700, borderRadius: "6px" }}
                      >
                        Edit
                      </AppButton>
                      <AppButton
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={busy || !group.id}
                        onClick={() => setGroupToDelete(group)}
                        aria-label={"Delete " + group.name + " pay group"}
                        sx={{ height: 28, fontSize: "0.75rem", textTransform: "none", fontWeight: 700, borderRadius: "6px" }}
                      >
                        Delete
                      </AppButton>
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
    {groupToDelete && (
      <ConfirmationModal
        open
        title="Delete pay group?"
        content={`Delete pay group "${groupToDelete.name}"? If any employees or salary templates are linked to this pay group, deletion will be blocked and you should deactivate it instead.`}
        ok_btn
        confirming={busy}
        handleClose={() => { if (!busy) setGroupToDelete(null); }}
        handleConfirmation={(result) => { if (result === "ok") void deleteGroup(groupToDelete); }}
      />
    )}
  </Stack>;
}
