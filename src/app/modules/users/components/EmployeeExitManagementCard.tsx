import { Alert, Box, Chip, Divider, Stack, TextField, Typography } from "@mui/material";
import { AssignmentTurnedIn } from "@mui/icons-material";
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
  const refresh = async () => {
    const refreshed = await getEmployeeExitCaseForManagement(employeeUserId);
    setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
  };
  const review = async (action: "Approve" | "Discuss" | "JointDiscussion" | "Reject" | "RequestDiscussion") => {
    setSaving(true);
    try {
      const response = await reviewEmployeeExit({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, action, notes: notes.trim() || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to update the offboarding case.");
      toast.success(action === "Approve" ? "Offboarding case approved." : action === "Reject" ? "Offboarding case rejected." : "Discussion requested from the employee.");
      await refresh();
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
</Stack>}</Box>;
/* Alternate pre-merge modal implementation is retained in the named safety stash.
  const addHandover = async () => {
    if (!exitCase || !handoverTitle.trim()) return;
    setSaving(true);
    try {
      const response = await upsertEmployeeExitHandoverTask({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, title: handoverTitle.trim(), status: "Pending" });
      if (!response.data.success) throw new Error(response.data.message || "Unable to add the handover task.");
      setHandoverTitle(""); await refresh(); toast.success("Handover task added.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to add the handover task."); }
    finally { setSaving(false); }
  };
  const hrAction = async (action: "calculate" | "approve" | "paid" | "interview" | "document", documentType?: "RelievingLetter" | "ExperienceLetter" | "FinalSettlementStatement") => {
    if (!exitCase) return;
    setSaving(true);
    try {
      const payload = { employeeExitId: exitCase.employeeExitId, version: exitCase.version };
      const response = action === "calculate" ? await calculateEmployeeFinalSettlement({ ...payload, ...settlement })
        : action === "approve" ? await approveEmployeeFinalSettlement(payload)
        : action === "paid" ? await markEmployeeFinalSettlementPaid(payload)
        : action === "interview" ? await recordEmployeeExitInterview({ ...payload, employeeFeedback: employeeFeedback.trim() || undefined })
        : await generateEmployeeExitDocument({ ...payload, type: documentType! });
      if (!response.data.success) throw new Error(response.data.message || "Unable to update the offboarding case.");
      await refresh(); toast.success("Offboarding action saved.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update the offboarding case."); }
    finally { setSaving(false); }
  };
  const completeClearance = async (clearanceId: string, status: "Completed" | "Issue") => {
    if (!exitCase) return; setSaving(true);
    try {
      const response = await updateEmployeeExitClearanceStatus({ employeeExitId: exitCase.employeeExitId, clearanceId, version: exitCase.version, status });
      if (!response.data.success) throw new Error(response.data.message || "Unable to update clearance.");
      await refresh(); toast.success(`Clearance marked ${status.toLowerCase()}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update clearance."); }
    finally { setSaving(false); }
  };
  const pending = exitCase.clearances.filter(item => item.status !== "Completed" && item.status !== "Waived");
  return <>
    <Box sx={{ width: "100%" }}>
      <AppButton fullWidth variant="outlined" startIcon={<AssignmentTurnedIn />} onClick={() => setOpen(true)} sx={{ minHeight: 44, borderRadius: 2, fontWeight: 800, textTransform: "none", justifyContent: "center" }}>
        Manage offboarding
      </AppButton>
    </Box>
    <CustomisedModal
      open={open}
      handleClose={() => !saving && setOpen(false)}
      title={<Stack direction="row" spacing={1.25} alignItems="center"><AssignmentTurnedIn color="primary" /><Box><Typography fontWeight={800}>Offboarding management</Typography><Typography variant="caption" color="text.secondary">Review, handover, clearance, and final settlement</Typography></Box></Stack>}
      maxWidth="md"
      fullWidth
      allowMaximize
      paperSx={{ width: { xs: "calc(100% - 24px)", sm: "min(900px, calc(100% - 48px))" }, maxWidth: "calc(100% - 24px)", borderRadius: { xs: 2.5, sm: 3 } }}
      contentSx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}
    >
      <Box sx={{ pt: 0.5 }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.25} sx={{ p: 1.75, borderRadius: 2, bgcolor: "action.hover" }}><Box><Typography fontWeight={800}>Current case</Typography><Typography variant="body2" color="text.secondary">Last working date: {new Date(exitCase.lastWorkingDate).toLocaleDateString()}</Typography></Box><Chip size="small" label={exitCase.status.replace(/([a-z])([A-Z])/g, "$1 $2")} color="primary" /></Stack>
    {pending.length > 0 && <Alert severity="info" sx={{ mt: 1.5 }}>{pending.length} clearance task{pending.length === 1 ? "" : "s"} still pending.</Alert>}
    {(exitCase.permittedActions.includes("Approve") || exitCase.permittedActions.includes("Reject")) && <Stack spacing={1.25} sx={{ mt: 2, p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}>
      <Box>
        <Typography variant="subtitle2" fontWeight={800}>Review decision</Typography>
        <Typography variant="caption" color="text.secondary">Approve or reject the resignation. Add a note to request a discussion.</Typography>
      </Box>
      <TextField size="small" label="Decision note" value={notes} onChange={event => setNotes(event.target.value)} multiline minRows={2} helperText="Required only when requesting a discussion." />
      <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
        {exitCase.permittedActions.includes("Approve") && <AppButton variant="contained" color="success" disabled={saving} onClick={() => void review("Approve")} sx={{ minHeight: 40, fontWeight: 800, textTransform: "none" }}>Approve</AppButton>}
        {exitCase.permittedActions.includes("Reject") && <AppButton variant="outlined" color="error" disabled={saving} onClick={() => void review("Reject")} sx={{ minHeight: 40, fontWeight: 800, textTransform: "none" }}>Reject</AppButton>}
        {exitCase.permittedActions.includes("RequestDiscussion") && <AppButton variant="outlined" color="primary" disabled={saving || !notes.trim()} onClick={() => void review("RequestDiscussion")} sx={{ minHeight: 40, fontWeight: 800, textTransform: "none", "&.Mui-disabled": { color: "text.secondary", borderColor: "divider" } }}>Request discussion</AppButton>}
*/
      </Stack>
    </Stack>}
    {exitCase.permittedActions.includes("ManageHandover") && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Typography variant="subtitle2">Knowledge transfer & handover</Typography>
      {exitCase.handoverTasks.map(task => <Typography key={task.handoverTaskId} variant="body2">{task.title} · {task.status}</Typography>)}
      <TextField size="small" label="Handover task" value={handoverTitle} onChange={event => setHandoverTitle(event.target.value)} />
      <AppButton variant="outlined" disabled={saving || !handoverTitle.trim()} onClick={() => void addHandover()}>Add handover task</AppButton>
    </Stack>}
    {exitCase.permittedActions.includes("ManageClearance") && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Typography variant="subtitle2">Department clearance / no dues</Typography>
      {exitCase.clearances.map(item => <Stack key={item.clearanceId} direction={{ xs: "column", sm: "row" }} gap={1} alignItems={{ sm: "center" }}><Typography variant="body2" sx={{ flex: 1 }}>{item.category} · {item.status}</Typography>{item.status === "Pending" && <><AppButton variant="outlined" disabled={saving} onClick={() => void completeClearance(item.clearanceId, "Completed")}>Clear</AppButton><AppButton color="warning" variant="outlined" disabled={saving} onClick={() => void completeClearance(item.clearanceId, "Issue")}>Raise issue</AppButton></>}</Stack>)}
    </Stack>}
    {exitCase.permittedActions.includes("RecordInterview") && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Typography variant="subtitle2">Exit interview</Typography>
      <TextField size="small" multiline minRows={2} label="Employee feedback / interview notes" value={employeeFeedback} onChange={event => setEmployeeFeedback(event.target.value)} />
      <AppButton variant="outlined" disabled={saving} onClick={() => void hrAction("interview")}>Save exit interview</AppButton>
    </Stack>}
    {exitCase.permittedActions.includes("CalculateSettlement") && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Typography variant="subtitle2">Full & final settlement</Typography>
      <Stack direction={{ xs: "column", sm: "row" }} gap={1}>{Object.keys(settlement).map(key => <TextField key={key} size="small" type="number" label={key.replace(/([A-Z])/g, " $1")} value={settlement[key as keyof typeof settlement]} onChange={event => setSettlement(current => ({ ...current, [key]: Number(event.target.value) || 0 }))} />)}</Stack>
      <Stack direction={{ xs: "column", sm: "row" }} gap={1}><AppButton variant="outlined" disabled={saving} onClick={() => void hrAction("calculate")}>Calculate F&F</AppButton><AppButton variant="outlined" disabled={saving} onClick={() => void hrAction("approve")}>Approve F&F</AppButton><AppButton variant="outlined" disabled={saving} onClick={() => void hrAction("paid")}>Mark paid</AppButton></Stack>
    </Stack>}
    {exitCase.permittedActions.includes("GenerateDocuments") && <Stack spacing={1} sx={{ mt: 1.5 }}><Typography variant="subtitle2">Exit documents</Typography><Stack direction={{ xs: "column", sm: "row" }} gap={1}>{(["RelievingLetter", "ExperienceLetter", "FinalSettlementStatement"] as const).map(type => <AppButton key={type} variant="outlined" disabled={saving} onClick={() => void hrAction("document", type)}>{type.replace(/([A-Z])/g, " $1")}</AppButton>)}</Stack></Stack>}
    <Divider sx={{ my: 1.5 }} />
    <Typography variant="caption" color="text.secondary">Case history</Typography>
    <Stack spacing={0.5} sx={{ mt: 0.5 }}>{exitCase.auditHistory.slice(-5).reverse().map((event, index) => <Typography key={`${event.action}-${event.atUtc}-${index}`} variant="body2">{event.action} · {new Date(event.atUtc).toLocaleString()}</Typography>)}</Stack>
      </Box>
    </CustomisedModal>
  </>;
};
