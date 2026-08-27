import { Alert, Box, Chip, Divider, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { EmployeeExitCase, createFormerEmployeePortalInvite, getEmployeeExitCaseForManagement, resolveEmployeeExitFormerEmployeeRequest, reviewEmployeeExit, revokeFormerEmployeePortalAccess } from "../../employees/employeeServices";
import { AppButton } from "../../../shared/components/ui";
import { toast } from "react-toastify";
import { EmployeeExitOperationsPanel } from "./EmployeeExitOperationsPanel";

type Props = { employeeUserId: string };

export const EmployeeExitManagementCard = ({ employeeUserId }: Props) => {
  const [exitCase, setExitCase] = useState<EmployeeExitCase | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [portalInviteUrl, setPortalInviteUrl] = useState("");
  const [portalRevokeReason, setPortalRevokeReason] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  useEffect(() => {
    let active = true;
    getEmployeeExitCaseForManagement(employeeUserId)
      .then(response => { if (active && response.data.success) setExitCase(response.data.methodResult); })
      .catch(() => { if (active) setExitCase(null); });
    return () => { active = false; };
  }, [employeeUserId]);
  if (!exitCase) return null;
  const review = async (action: "Approve" | "Discuss" | "JointDiscussion") => {
    setSaving(true);
    try {
      const response = await reviewEmployeeExit({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, action, notes: notes.trim() || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to update the offboarding case.");
      toast.success(action === "Approve" ? "Offboarding case approved." : "Discussion requested from the employee.");
      const refreshed = await getEmployeeExitCaseForManagement(employeeUserId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
      setNotes("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update the offboarding case."); }
    finally { setSaving(false); }
  };
  const createPortalInvite = async () => {
    setSaving(true);
    try {
      const response = await createFormerEmployeePortalInvite({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, validForHours: 72 });
      if (!response.data.success || !response.data.methodResult) throw new Error(response.data.message || "Unable to create the portal invitation.");
      const inviteUrl = `${window.location.origin}/former-employee?token=${encodeURIComponent(response.data.methodResult.portalToken)}`;
      setPortalInviteUrl(inviteUrl);
      try { await navigator.clipboard.writeText(inviteUrl); toast.success("Secure portal invitation copied. Send it only to the employee’s verified personal email."); }
      catch { toast.info("Invitation created. Copy the link shown below and send it only to the employee’s verified personal email."); }
      const refreshed = await getEmployeeExitCaseForManagement(employeeUserId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create the portal invitation."); }
    finally { setSaving(false); }
  };
  const revokePortalAccess = async () => {
    if (!portalRevokeReason.trim()) return;
    setSaving(true);
    try {
      const response = await revokeFormerEmployeePortalAccess({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, reason: portalRevokeReason.trim() });
      if (!response.data.success) throw new Error(response.data.message || "Unable to revoke portal access.");
      setPortalInviteUrl(""); setPortalRevokeReason(""); toast.success("Former-employee portal access was revoked.");
      const refreshed = await getEmployeeExitCaseForManagement(employeeUserId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to revoke portal access."); }
    finally { setSaving(false); }
  };
  const resolveFormerEmployeeRequest = async (requestId: string, status: "InProgress" | "Issued" | "Closed") => {
    setSaving(true);
    try {
      const response = await resolveEmployeeExitFormerEmployeeRequest({ employeeExitId: exitCase.employeeExitId, requestId, version: exitCase.version, status, notes: requestNotes.trim() || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to update the former-employee request.");
      const refreshed = await getEmployeeExitCaseForManagement(employeeUserId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
      setRequestNotes("");
      toast.success(`Former-employee request marked ${status}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update the former-employee request."); }
    finally { setSaving(false); }
  };
  const pending = exitCase.clearances.filter(item => item.status !== "Completed" && item.status !== "Waived");
  const refresh = async () => { const response = await getEmployeeExitCaseForManagement(employeeUserId); setExitCase(response.data.success ? response.data.methodResult : null); };
  return <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, mt: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><Box><Typography fontWeight={700}>Offboarding management</Typography><Typography variant="body2" color="text.secondary">Last working date: {new Date(exitCase.lastWorkingDate).toLocaleDateString()}</Typography></Box><Chip size="small" label={exitCase.status} /></Stack>
    {pending.length > 0 && <Alert severity="info" sx={{ mt: 1.5 }}>{pending.length} clearance task{pending.length === 1 ? "" : "s"} still pending.</Alert>}
    {(exitCase.pendingHandoverCount + exitCase.pendingAssetCount + exitCase.pendingAccessCount + exitCase.pendingFinanceCount + exitCase.pendingBenefitCount) > 0 && <Alert severity="warning" sx={{ mt: 1.5 }}>Pending: {exitCase.pendingHandoverCount} handover, {exitCase.pendingAssetCount} assets, {exitCase.pendingAccessCount} access, {exitCase.pendingFinanceCount} finance, {exitCase.pendingBenefitCount} benefits.</Alert>}
    <Stack spacing={0.75} sx={{ mt: 1.5 }}><AppButton variant="outlined" disabled={saving} onClick={() => void createPortalInvite()}>Create former-employee portal invitation</AppButton><Typography variant="caption" color="text.secondary">Available only after the employee provides a personal email and the company policy enables the portal.</Typography>{portalInviteUrl && <TextField label="One-time portal invitation" value={portalInviteUrl} InputProps={{ readOnly: true }} helperText="Copy and send this link securely now; it will not be shown again after this page is closed." />}<TextField size="small" label="Reason to revoke former portal access" value={portalRevokeReason} onChange={event => setPortalRevokeReason(event.target.value)} /><AppButton color="error" variant="outlined" disabled={saving || !portalRevokeReason.trim()} onClick={() => void revokePortalAccess()}>Revoke former-employee portal access</AppButton></Stack>
    {exitCase.formerEmployeeRequests.length > 0 && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Typography fontWeight={600}>Former-employee requests</Typography>
      <TextField size="small" label="Resolution note (applies to the next request action)" value={requestNotes} onChange={event => setRequestNotes(event.target.value)} multiline minRows={2} />
      {exitCase.formerEmployeeRequests.map(request => <Box key={request.requestId} sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
        <Stack direction="row" justifyContent="space-between" gap={1}><Typography variant="body2" fontWeight={600}>{request.type}</Typography><Chip size="small" label={request.status} /></Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{request.details}</Typography>
        {!(["Issued", "Closed"] as string[]).includes(request.status) && <Stack direction={{ xs: "column", sm: "row" }} gap={1} sx={{ mt: 1 }}>
          <AppButton size="small" variant="outlined" disabled={saving || request.status === "InProgress"} onClick={() => void resolveFormerEmployeeRequest(request.requestId, "InProgress")}>Mark in progress</AppButton>
          <AppButton size="small" variant="contained" disabled={saving} onClick={() => void resolveFormerEmployeeRequest(request.requestId, "Issued")}>Mark issued</AppButton>
          <AppButton size="small" variant="outlined" disabled={saving} onClick={() => void resolveFormerEmployeeRequest(request.requestId, "Closed")}>Close request</AppButton>
        </Stack>}
      </Box>)}
    </Stack>}
    <EmployeeExitOperationsPanel exitCase={exitCase} onRefresh={refresh} />
    {(exitCase.permittedActions.includes("Approve") || exitCase.permittedActions.includes("Discuss") || exitCase.permittedActions.includes("JointDiscussion")) && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <TextField size="small" label="Decision or discussion note" value={notes} onChange={event => setNotes(event.target.value)} multiline minRows={2} />
      <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
        {exitCase.permittedActions.includes("Approve") && <AppButton variant="contained" color="success" disabled={saving} onClick={() => void review("Approve")}>Approve</AppButton>}
        {exitCase.permittedActions.includes("Discuss") && <AppButton variant="outlined" disabled={saving} onClick={() => void review("Discuss")}>Request discussion</AppButton>}
        {exitCase.permittedActions.includes("JointDiscussion") && <AppButton variant="outlined" disabled={saving} onClick={() => void review("JointDiscussion")}>Request joint discussion</AppButton>}
      </Stack>
    </Stack>}
    <Divider sx={{ my: 1.5 }} />
    <Typography variant="caption" color="text.secondary">Case history</Typography>
    <Stack spacing={0.5} sx={{ mt: 0.5 }}>{exitCase.auditHistory.slice(-5).reverse().map((event, index) => <Typography key={`${event.action}-${event.atUtc}-${index}`} variant="body2">{event.action} · {new Date(event.atUtc).toLocaleString()}</Typography>)}</Stack>
  </Box>;
};
