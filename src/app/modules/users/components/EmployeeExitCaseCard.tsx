import { Alert, Box, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { acknowledgeEmployeeExit, createEmployeeExitFormerEmployeeRequest, getOwnEmployeeExitCase, EmployeeExitCase, requestEmployeeExitNoticeAdjustment, respondToEmployeeExitDiscussion, reviewEmployeeExitHandover, updateEmployeeExitPostExitContact, uploadEmployeeExitEvidence, withdrawOwnEmployeeExit } from "../../employees/employeeServices";
import { useUserDetails } from "../UserDataProvider";
import { AppButton } from "../../../shared/components/ui";
import { toast } from "react-toastify";

export const EmployeeExitCaseCard = () => {
  const { userDetails, setRefresh } = useUserDetails();
  const [exitCase, setExitCase] = useState<EmployeeExitCase | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [discussionNotes, setDiscussionNotes] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [requestType, setRequestType] = useState<"RelievingLetter" | "ExperienceLetter" | "FnFStatement" | "TaxDocument" | "Correction" | "Other">("RelievingLetter");
  const [requestDetails, setRequestDetails] = useState("");
  const [evidenceCategory, setEvidenceCategory] = useState("Resignation");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [requestedLwd, setRequestedLwd] = useState("");
  const [noticeReason, setNoticeReason] = useState("");
  useEffect(() => {
    if (!userDetails.userId) return;
    getOwnEmployeeExitCase(userDetails.userId).then(response => {
      if (response.data.success) setExitCase(response.data.methodResult);
    }).catch(() => setExitCase(null));
  }, [userDetails.userId]);
  if (!exitCase) return null;
  const withdraw = async () => {
    setWithdrawing(true);
    try {
      const response = await withdrawOwnEmployeeExit({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, reason: withdrawReason.trim() || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to withdraw resignation.");
      toast.success("Your resignation has been withdrawn.");
      setExitCase(null);
      setRefresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to withdraw resignation."); }
    finally { setWithdrawing(false); }
  };
  const respondToDiscussion = async () => {
    setWithdrawing(true);
    try {
      const response = await respondToEmployeeExitDiscussion({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, notes: discussionNotes.trim() || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to respond to the discussion.");
      const refreshed = await getOwnEmployeeExitCase(userDetails.userId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
      setDiscussionNotes("");
      toast.success("Your discussion response has been sent.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to respond to the discussion."); }
    finally { setWithdrawing(false); }
  };
  const savePostExitContact = async () => {
    setWithdrawing(true);
    try {
      const response = await updateEmployeeExitPostExitContact({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, personalEmail });
      if (!response.data.success) throw new Error(response.data.message || "Unable to save your post-exit contact.");
      toast.success("Post-exit contact saved.");
      const refreshed = await getOwnEmployeeExitCase(userDetails.userId); setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save contact."); } finally { setWithdrawing(false); }
  };
  const acknowledge = async () => {
    setWithdrawing(true);
    try {
      const response = await acknowledgeEmployeeExit({ employeeExitId: exitCase.employeeExitId, version: exitCase.version });
      if (!response.data.success) throw new Error(response.data.message || "Unable to record acknowledgement.");
      toast.success("Acknowledgement recorded.");
      const refreshed = await getOwnEmployeeExitCase(userDetails.userId); setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to record acknowledgement."); } finally { setWithdrawing(false); }
  };
  const createRequest = async () => {
    setWithdrawing(true);
    try {
      const response = await createEmployeeExitFormerEmployeeRequest({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, type: requestType, details: requestDetails });
      if (!response.data.success) throw new Error(response.data.message || "Unable to create request.");
      toast.success("Request sent to HR."); setRequestDetails("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create request."); } finally { setWithdrawing(false); }
  };
  const uploadEvidence = async () => {
    if (!evidenceFile) return;
    setWithdrawing(true);
    try {
      const payload = new FormData(); payload.append("employeeExitId", exitCase.employeeExitId); payload.append("category", evidenceCategory); payload.append("visibility", "EmployeeManagerHR"); payload.append("file", evidenceFile);
      const response = await uploadEmployeeExitEvidence(payload);
      if (!response.data.success) throw new Error(response.data.message || "Unable to upload evidence.");
      toast.success("Evidence uploaded for review."); setEvidenceFile(null);
      const refreshed = await getOwnEmployeeExitCase(userDetails.userId); setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to upload evidence."); } finally { setWithdrawing(false); }
  };
  const refreshCase = async () => { const refreshed = await getOwnEmployeeExitCase(userDetails.userId); setExitCase(refreshed.data.success ? refreshed.data.methodResult : null); };
  const requestNoticeAdjustment = async () => {
    if (!requestedLwd || !noticeReason.trim()) return;
    setWithdrawing(true);
    try { const response = await requestEmployeeExitNoticeAdjustment({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, type: "EmployeeEarlyRelease", requestedLastWorkingDate: requestedLwd, waivedDays: 0, recoveryAmount: 0, reason: noticeReason.trim() }); if (!response.data.success) throw new Error(response.data.message || "Unable to submit notice adjustment."); toast.success("Notice adjustment submitted for review."); setNoticeReason(""); await refreshCase(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to submit notice adjustment."); } finally { setWithdrawing(false); }
  };
  const submitHandover = async (handoverTaskId: string) => {
    setWithdrawing(true);
    try { const response = await reviewEmployeeExitHandover({ employeeExitId: exitCase.employeeExitId, handoverTaskId, version: exitCase.version, action: "Submit" }); if (!response.data.success) throw new Error(response.data.message || "Unable to submit handover."); toast.success("Handover submitted for approval."); await refreshCase(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to submit handover."); } finally { setWithdrawing(false); }
  };
  return <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontWeight={700}>Your offboarding case</Typography><Chip size="small" label={exitCase.status} /></Stack>
    <Typography variant="body2" sx={{ mt: 1 }}>Last working date: {new Date(exitCase.lastWorkingDate).toLocaleDateString()}</Typography>
    {exitCase.clearances.length > 0 && <Alert severity="info" sx={{ mt: 1.5 }}>Clearance tasks: {exitCase.clearances.filter(x => x.status !== "Completed" && x.status !== "Waived").length} pending.</Alert>}
    {exitCase.auditHistory.length > 0 && <Stack spacing={0.5} sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary">Recent activity</Typography>
      {exitCase.auditHistory.slice(-3).reverse().map((event, index) => <Typography key={`${event.action}-${event.atUtc}-${index}`} variant="body2">{event.action} · {new Date(event.atUtc).toLocaleString()}</Typography>)}
    </Stack>}
    {exitCase.permittedActions.includes("Withdraw") && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <TextField size="small" label="Withdrawal reason (optional)" value={withdrawReason} onChange={event => setWithdrawReason(event.target.value)} />
      <AppButton color="warning" variant="outlined" disabled={withdrawing} onClick={withdraw}>{withdrawing ? "Withdrawing…" : "Withdraw resignation"}</AppButton>
    </Stack>}
    {exitCase.permittedActions.includes("RespondDiscussion") && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <TextField size="small" label="Your discussion response" value={discussionNotes} onChange={event => setDiscussionNotes(event.target.value)} multiline minRows={2} />
      <AppButton variant="contained" disabled={withdrawing} onClick={() => void respondToDiscussion}>{withdrawing ? "Sending…" : "Send response"}</AppButton>
    </Stack>}
    {exitCase.status === "NoticePeriod" && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary">Request a notice-period adjustment</Typography>
      <TextField size="small" type="date" label="Requested last working date" value={requestedLwd} onChange={event => setRequestedLwd(event.target.value)} InputLabelProps={{ shrink: true }} />
      <TextField size="small" label="Reason" value={noticeReason} onChange={event => setNoticeReason(event.target.value)} multiline minRows={2} />
      <AppButton variant="outlined" disabled={withdrawing || !requestedLwd || !noticeReason.trim()} onClick={() => void requestNoticeAdjustment()}>Request adjustment</AppButton>
    </Stack>}
    {exitCase.handoverTasks.length > 0 && <Stack spacing={0.75} sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary">Handover tasks</Typography>
      {exitCase.handoverTasks.map(task => <Stack key={task.handoverTaskId} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}><Typography variant="body2">{task.title} <Chip size="small" label={task.status} /></Typography>{!["Submitted", "Approved", "Waived"].includes(task.status) && <AppButton size="small" variant="outlined" disabled={withdrawing} onClick={() => void submitHandover(task.handoverTaskId)}>Submit handover</AppButton>}</Stack>)}
    </Stack>}
    <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary">Post-exit contact</Typography>
      <TextField size="small" type="email" label="Personal email" value={personalEmail} onChange={event => setPersonalEmail(event.target.value)} />
      <AppButton variant="outlined" disabled={withdrawing || !personalEmail} onClick={() => void savePostExitContact()}>Save post-exit contact</AppButton>
    </Stack>
    <AppButton sx={{ mt: 1.5 }} variant="outlined" disabled={withdrawing} onClick={() => void acknowledge()}>Acknowledge exit summary</AppButton>
    <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary">Upload exit evidence</Typography>
      <TextField size="small" label="Evidence category" value={evidenceCategory} onChange={event => setEvidenceCategory(event.target.value)} />
      <AppButton component="label" variant="outlined" disabled={withdrawing}>Choose file<input hidden type="file" accept="application/pdf,image/png,image/jpeg,message/rfc822" onChange={event => setEvidenceFile(event.target.files?.[0] || null)} /></AppButton>
      {evidenceFile && <Typography variant="caption">Selected: {evidenceFile.name}</Typography>}
      <AppButton variant="contained" disabled={withdrawing || !evidenceFile || !evidenceCategory.trim()} onClick={() => void uploadEvidence()}>Upload evidence</AppButton>
    </Stack>
    <Stack spacing={1} sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary">Document or support request</Typography>
      <TextField select size="small" label="Request type" value={requestType} onChange={event => setRequestType(event.target.value as typeof requestType)}>{["RelievingLetter", "ExperienceLetter", "FnFStatement", "TaxDocument", "Correction", "Other"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      <TextField size="small" label="Details" value={requestDetails} onChange={event => setRequestDetails(event.target.value)} multiline minRows={2} />
      <AppButton variant="outlined" disabled={withdrawing || !requestDetails.trim()} onClick={() => void createRequest()}>Send request</AppButton>
    </Stack>
  </Box>;
};
