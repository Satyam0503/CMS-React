import {
  Alert,
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircleOutline, LockOutlined, MailOutline, ManageAccounts, HistoryRounded, UndoRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  calculateEmployeeFinalSettlement,
  createFormerEmployeePortalInvite,
  downloadEmployeeExitEvidence,
  decideEmployeeExitNoticeAdjustment,
  decideEmployeeExitWithdrawal,
  EmployeeExitCase,
  generateEmployeeExitDocument,
  getAllEmployees,
  getEmployeeExitCaseForManagement,
  issueEmployeeExitDocument,
  recordEmployeeExitInterview,
  rejoinEmployee,
  supersedeEmployeeExitEvidence,
  resolveEmployeeExitFormerEmployeeRequest,
  respondToEmployeeExitJointDiscussion,
  reviewEmployeeExit,
  revokeFormerEmployeePortalAccess,
  setFormerEmployeePortalAccess,
  upsertEmployeeExitReassignment,
  verifyEmployeeExitEvidence,
  uploadEmployeeExitEvidence,
} from "../../employees/employeeServices";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { AppButton, CustomisedModal } from "../../../shared/components";
import { toast } from "react-toastify";
import { EmployeeExitOperationsPanel } from "./EmployeeExitOperationsPanel";

type Props = { employeeUserId: string };
type ReviewAction =
  "Approve" | "Discuss" | "JointDiscussion" | "Reject" | "RequestDiscussion";

const offboardingErrorMessage = (message?: string) => {
  if (message === "NOTICE_ADJUSTMENT_DATE_IN_PAST")
    return "The requested last working day is before today. Select today or a future date.";
  if (message === "EXIT_NOTICE_ADJUSTMENT_DATE_INVALID")
    return "Choose today or a future last working day that is after the exit was started.";
  return message || "Unable to update the offboarding case.";
};

export const EmployeeExitManagementCard = ({ employeeUserId }: Props) => {
  const [exitCase, setExitCase] = useState<EmployeeExitCase | null>(null);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [issueEvidenceId, setIssueEvidenceId] = useState("");
  const [portalDocumentFile, setPortalDocumentFile] = useState<File | null>(null);
  const [portalDocumentCategory, setPortalDocumentCategory] = useState("FormerEmployeeDocument");
  const [uploadRequestId, setUploadRequestId] = useState("");
  const [revokeReason, setRevokeReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [interviewNotes, setInterviewNotes] = useState("");
  const [rehireEligible, setRehireEligible] = useState(false);
  const [rehireEligibilityChanged, setRehireEligibilityChanged] = useState(false);
  const [interviewFile, setInterviewFile] = useState<File | null>(null);
  const [responsibility, setResponsibility] = useState("");
  const [newOwner, setNewOwner] = useState<GetAllEmployeeResponseModel | null>(
    null,
  );
  const [noticeDecisionType, setNoticeDecisionType] = useState(
    "CompanyEarlyRelease",
  );
  const [noticeWaivedDays, setNoticeWaivedDays] = useState(0);
  const [discussionCandidates, setDiscussionCandidates] = useState<
    GetAllEmployeeResponseModel[]
  >([]);
  const [discussionParticipants, setDiscussionParticipants] = useState<
    GetAllEmployeeResponseModel[]
  >([]);
  const [jointDiscussionReply, setJointDiscussionReply] = useState("");
  const [rejoinReason, setRejoinReason] = useState("");
  const refresh = async () => {
    const response = await getEmployeeExitCaseForManagement(employeeUserId);
    const nextCase = response.data.success ? response.data.methodResult : null;
    setExitCase(nextCase);
    setRehireEligible(nextCase?.exitInterview?.isRehireEligible === true);
    setRehireEligibilityChanged(false);
  };
  useEffect(() => {
    void refresh();
  }, [employeeUserId]);
  useEffect(() => {
    const hasEmployeeOffer = exitCase?.status === "AwaitingEmployeeNoticeOffer" &&
      exitCase.noticeAdjustments.some((item) => item.status === "AwaitingEmployeeDecision");
    if (hasEmployeeOffer) setOpen(true);
  }, [exitCase?.employeeExitId, exitCase?.version, exitCase?.status]);
  useEffect(() => {
    void getAllEmployees(null)
      .then((response) => {
        if (response.data.success)
          setDiscussionCandidates(
            (response.data.methodResults || []).filter(
              (item) =>
                item.userId !== employeeUserId &&
                item.employmentStatus !== "Resigned" &&
                item.employmentStatus !== "Terminated",
            ),
          );
      })
      .catch(() => setDiscussionCandidates([]));
  }, [employeeUserId]);
  if (!exitCase) return null;

  const run = async (
    work: () => Promise<{ data: { success: boolean; message?: string } }>,
    message: string,
  ) => {
    setSaving(true);
    try {
      const response = await work();
      if (!response.data.success) throw new Error(offboardingErrorMessage(response.data.message));
      toast.success(message);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update the offboarding case.",
      );
    } finally {
      setSaving(false);
    }
  };
  const review = async (action: ReviewAction) => {
    await run(
      () =>
        reviewEmployeeExit({
          employeeExitId: exitCase.employeeExitId,
          version: exitCase.version,
          action,
          notes: notes.trim() || undefined,
          discussionParticipantUserIds:
            action === "JointDiscussion"
              ? discussionParticipants.map((item) => item.userId)
              : undefined,
        }),
      action === "Approve"
        ? "Offboarding case approved."
        : action === "Reject"
          ? "Offboarding case rejected."
          : action === "JointDiscussion"
            ? "Joint discussion invitations sent."
            : "Discussion requested from the employee.",
    );
    setNotes("");
    setDiscussionParticipants([]);
  };
  const uploadInterviewFile = async () => {
    if (!interviewFile) return;
    const payload = new FormData();
    payload.append("employeeExitId", exitCase.employeeExitId);
    payload.append("category", "ExitInterview");
    payload.append("visibility", "EmployeeManagerHR");
    payload.append("file", interviewFile);

    setSaving(true);
    try {
      const response = await uploadEmployeeExitEvidence(payload);
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to upload the interview file.",
        );
      toast.success("Interview attachment uploaded.");
      setInterviewFile(null);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload the interview file.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveInterview = async () => {
    if (!interviewNotes.trim() && !interviewFile && !rehireEligibilityChanged) {
      toast.error("Enter interview notes or select a file before saving.");
      return;
    }

    if (interviewNotes.trim() || rehireEligibilityChanged) {
      await run(
        () =>
          recordEmployeeExitInterview({
            employeeExitId: exitCase.employeeExitId,
            version: exitCase.version,
            hrNotes: interviewNotes.trim() || exitCase.exitInterview?.hrNotes,
            isRehireEligible: rehireEligible,
          }),
        "Exit interview saved.",
      );
      setInterviewNotes("");
    }

    if (interviewFile) {
      await uploadInterviewFile();
    }
  };
  const rejoin = async () => {
    if (!rejoinReason.trim()) {
      toast.error("Enter a reason before rejoining this employee.");
      return;
    }
    await run(
      () =>
        rejoinEmployee({
          employeeExitId: exitCase.employeeExitId,
          version: exitCase.version,
          reason: rejoinReason.trim(),
        }),
      "Employee rejoined successfully.",
    );
    setRejoinReason("");
  };
  const transferOwnership = async () => {
    if (!newOwner || !responsibility.trim()) return;
    await run(
      () =>
        upsertEmployeeExitReassignment({
          employeeExitId: exitCase.employeeExitId,
          version: exitCase.version,
          responsibility: responsibility.trim(),
          newOwnerUserId: newOwner.userId,
        }),
      "Work ownership transferred.",
    );
    setResponsibility("");
    setNewOwner(null);
  };
  const enableFormerEmployeePortal = async () => {
    setSaving(true);
    try {
      const response = await setFormerEmployeePortalAccess({
        employeeExitId: exitCase.employeeExitId,
        version: exitCase.version,
        enabled: true,
      });
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to enable portal access.",
        );
      toast.success(
        "Former-employee portal enabled. The employee can sign in by OTP at their verified personal email.",
      );
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to enable portal access.",
      );
    } finally {
      setSaving(false);
    }
  };
  const uploadPortalDocument = async () => {
    if (!portalDocumentFile || !uploadRequestId) { toast.error("Choose the employee request and document to upload."); return; }
    const payload = new FormData();
    payload.append("employeeExitId", exitCase.employeeExitId);
    payload.append("category", portalDocumentCategory.trim() || "FormerEmployeeDocument");
    payload.append("visibility", "EmployeeOnly");
    payload.append("formerEmployeeRequestId", uploadRequestId);
    payload.append("file", portalDocumentFile);
    setSaving(true);
    try {
      const response = await uploadEmployeeExitEvidence(payload);
      if (!response.data.success) throw new Error(response.data.message || "Unable to upload the document.");
      setPortalDocumentFile(null);
      toast.success("Document uploaded. Verify it before publishing to the former employee.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload the document.");
    } finally { setSaving(false); }
  };
  const openHrPortalDocument = async (evidenceId: string, fileName?: string, download = false) => {
    try {
      const response = await downloadEmployeeExitEvidence(exitCase.employeeExitId, evidenceId);
      const url = URL.createObjectURL(response.data);
      if (download) { const link = document.createElement("a"); link.href = url; link.download = fileName || "former-employee-document"; link.click(); }
      else window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { toast.error("Unable to open this document."); }
  };
  const sendFormerEmployeePortalInvite = async () => {
    setSaving(true);
    try {
      const response = await createFormerEmployeePortalInvite({
        employeeExitId: exitCase.employeeExitId,
        version: exitCase.version,
        validForHours: 168,
      });
      if (!response.data.success)
        throw new Error(response.data.message || "Unable to send the portal invitation.");
      toast.success("A secure former-employee portal invitation was sent to the verified personal email.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send the portal invitation.");
    } finally {
      setSaving(false);
    }
  };
  const reviewActions: ReviewAction[] = [
    "Approve",
    "Discuss",
    "JointDiscussion",
    "Reject",
    "RequestDiscussion",
  ];
  const pendingClearances = exitCase.clearances.filter(
    (item) => !["Completed", "Waived"].includes(item.status),
  ).length;
  const canManageCurrentCase = !["Withdrawn", "Cancelled", "Rejoined"].includes(exitCase.status);
  const canManageFormerPortal =
    exitCase.permittedActions.includes("ManageFormerPortal");
  const personalEmailVerified = exitCase.postExitContact?.personalEmailVerified === true;
  const portalEnabled = exitCase.postExitContact?.portalEnabled === true;
  const portalEmail = exitCase.postExitContact?.personalEmail;
  const canManageOperationalWork =
    canManageCurrentCase &&
    exitCase.status === "NoticePeriod" &&
    exitCase.permittedActions.some((action) =>
      [
        "ManageHandover",
        "ManageClearance",
        "Complete",
        "ExceptionalComplete",
      ].includes(action),
    );
  const canReplyToJointDiscussion = exitCase.permittedActions.includes(
    "RespondJointDiscussion",
  );
  // The API refuses to approve the case while a notice-period request is still
  // pending HR's decision or awaiting the employee's decision on an HR-approved
  // offer - the case's last working date/finance items are not final until then.
  const noticeAdjustmentBlockingApproval = canManageCurrentCase
    ? exitCase.noticeAdjustments.find((item) =>
        ["Pending", "AwaitingEmployeeDecision"].includes(item.status),
      )
    : undefined;
  const combinedManagerHrApproval =
    exitCase.status === "PendingManagerApproval" &&
    exitCase.isAssignedManagerReviewer &&
    exitCase.isHrReviewer;
  const canRejoin =
    ["Resigned", "Terminated"].includes(exitCase.status) &&
    exitCase.permittedActions.includes("Rejoin") &&
    exitCase.exitInterview?.isRehireEligible === true;
  const workflowSteps = [
    "Submitted",
    "Manager review",
    "HR review",
    "Notice period",
    "Completed",
  ];
  const workflowStep = exitCase.status === "PendingManagerApproval" || exitCase.status === "DiscussionRequested"
    ? 1
    : exitCase.status === "PendingHrApproval"
      ? 2
    : ["NoticePeriod", "AwaitingEmployeeNoticeOffer"].includes(exitCase.status)
        ? 3
        : ["Resigned", "Terminated"].includes(exitCase.status)
          ? 4
          : 0;
  return (
    <>
      {canManageCurrentCase ? (
        <AppButton
          fullWidth
          variant="outlined"
          startIcon={<ManageAccounts />}
          onClick={() => setOpen(true)}
          sx={{ minHeight: 44, borderRadius: 2 }}
        >
          Manage offboarding
        </AppButton>
      ) : (
        <AppButton fullWidth variant="outlined" startIcon={<HistoryRounded />} endIcon={<UndoRounded />} onClick={() => setOpen(true)} aria-label="Open resignation history" sx={{ minHeight: 66, justifyContent: "flex-start", textAlign: "left", borderRadius: 2.5, px: 1.75, color: "primary.main", borderColor: "rgba(41,142,137,.28)", background: "linear-gradient(135deg, rgba(255,255,255,.98), rgba(235,250,249,.9))", boxShadow: "0 10px 24px rgba(33,93,110,.07)", animation: "withdrawnHistoryIn .35s cubic-bezier(.2,.8,.2,1)", "@keyframes withdrawnHistoryIn": { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } }, "& .MuiButton-startIcon": { width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 2, bgcolor: "rgba(41,142,137,.12)" }, "& .MuiButton-endIcon": { marginLeft: "auto" }, "&:hover": { transform: "translateY(-2px)", borderColor: "primary.main", boxShadow: "0 14px 28px rgba(33,93,110,.13)" }, "@media (prefers-reduced-motion: reduce)": { animation: "none", transition: "none", transform: "none" } }}>
          <Box sx={{ minWidth: 0 }}><Typography variant="subtitle2" sx={{ fontWeight: 850 }}>Resignation history</Typography><Typography variant="caption" color="text.secondary">Withdrawn · View closed resignation details</Typography></Box>
        </AppButton>
      )}
      <CustomisedModal
        open={open}
        handleClose={() => !saving && setOpen(false)}
        maxWidth="md"
        fullWidth
        paperSx={{
          width: { xs: "100%", sm: "calc(100% - 48px)" },
          maxWidth: 940,
          maxHeight: { xs: "100%", sm: "calc(100% - 48px)" },
          m: { xs: 0, sm: 3 },
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
        }}
        contentSx={{
          px: { xs: 1.5, sm: 2.5, md: 3 },
          py: { xs: 1.5, sm: 2.5 },
          bgcolor: "background.default",
          overflowY: "auto",
          overscrollBehavior: "contain",
          minWidth: 0,
        }}
        title={
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "flex-start" }}
            gap={0.75}
            sx={{ pr: 1 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={750}>
                {canManageCurrentCase ? "Offboarding management" : "Resignation history"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {canManageCurrentCase ? "Last working date" : "Withdrawn resignation"} ·{" "}
                {new Date(exitCase.lastWorkingDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Chip
              size="small"
              color="primary"
              label={exitCase.status}
              sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
            />
          </Stack>
        }
      >
        <Stack spacing={2}>
          {canManageCurrentCase && (
            <Box sx={{ p: { xs: 1.25, sm: 1.5 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "background.paper", overflowX: "auto" }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={.75}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.25 }}>CASE PROGRESS</Typography>
                  <Typography variant="body2" color="text.secondary">Follow the current decision through to offboarding completion.</Typography>
                </Box>
                <Chip size="small" color={noticeAdjustmentBlockingApproval ? "warning" : "primary"} label={noticeAdjustmentBlockingApproval ? "Action required" : exitCase.status.replace(/([A-Z])/g, " $1").trim()} />
              </Stack>
              <Stepper activeStep={workflowStep} alternativeLabel sx={{ minWidth: 520, mt: 1.5, "& .MuiStepLabel-label": { mt: .5, fontSize: { xs: 10, sm: 11 }, fontWeight: 650, lineHeight: 1.1 }, "& .MuiStepConnector-line": { borderTopWidth: 1.5 } }}>
                {workflowSteps.map((label, index) => <Step key={label} completed={index < workflowStep}><StepLabel>{label}</StepLabel></Step>)}
              </Stepper>
            </Box>
          )}
          {!canManageCurrentCase && (
            <>
              <Alert severity="info" sx={{ mt: 1.5 }}>
                This resignation was withdrawn. There are no approval, portal, or clearance actions remaining.
              </Alert>
              <Box sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "background.paper", animation: "withdrawnTimelineIn .3s ease both", "@keyframes withdrawnTimelineIn": { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "translateY(0)" } } }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}><HistoryRounded color="primary" fontSize="small" /><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Resignation timeline</Typography></Stack>
                <Stack spacing={1} role="list" aria-label="Resignation history timeline">
                  {[...(exitCase.auditHistory ?? [])].reverse().map((event, index) => <Box key={`${event.atUtc}-${index}`} role="listitem" sx={{ pl: 1.5, borderLeft: "2px solid", borderColor: index === 0 ? "primary.main" : "divider" }}><Typography variant="body2" sx={{ fontWeight: 700 }}>{event.action.replace(/([a-z])([A-Z])/g, "$1 $2")}</Typography><Typography variant="caption" color="text.secondary">{new Date(event.atUtc).toLocaleString()}{event.notes ? ` · ${event.notes}` : ""}</Typography></Box>)}
                  {(!exitCase.auditHistory || exitCase.auditHistory.length === 0) && <Typography variant="body2" color="text.secondary">No additional resignation events recorded.</Typography>}
                </Stack>
              </Box>
            </>
          )}
          {canRejoin && (
            <Stack
              spacing={1}
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                border: "1px solid",
                borderColor: "success.light",
                borderRadius: 2.5,
                bgcolor: "success.lighter",
              }}
            >
              <Box>
                <Typography fontWeight={750}>Rejoin employee</Typography>
                <Typography variant="body2" color="text.secondary">
                  Exit interview marked this employee as eligible for rehire. Rejoining restores active employment and closes this exit case.
                </Typography>
              </Box>
              <TextField
                size="small"
                label="Reason for rejoining"
                value={rejoinReason}
                onChange={(event) => setRejoinReason(event.target.value)}
                multiline
                minRows={2}
                required
              />
              <AppButton
                color="success"
                variant="contained"
                disabled={saving || !rejoinReason.trim()}
                onClick={() => void rejoin()}
              >
                Rejoin employee
              </AppButton>
            </Stack>
          )}
          {exitCase.discussionMode === "Joint" && (
            <Stack
              spacing={1}
              sx={{
                p: 1.5,
                border: "1px solid",
                borderColor: "primary.light",
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <Box>
                <Typography fontWeight={750}>Joint discussion</Typography>
                <Typography variant="body2" color="text.secondary">
                  {exitCase.discussionRequest ||
                    "A joint discussion was requested."}
                </Typography>
              </Box>
              {exitCase.discussionMessages.map((message) => (
                <Box
                  key={message.messageId}
                  sx={{ p: 1, borderRadius: 1.5, bgcolor: "background.paper" }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {message.authorUserId === employeeUserId
                      ? "Employee"
                      : "Participant"}{" "}
                    · {new Date(message.createdAtUtc).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">{message.message}</Typography>
                </Box>
              ))}
              {canReplyToJointDiscussion && (
                <>
                  <TextField
                    size="small"
                    multiline
                    minRows={2}
                    label="Your contribution"
                    value={jointDiscussionReply}
                    onChange={(event) =>
                      setJointDiscussionReply(event.target.value)
                    }
                  />
                  <AppButton
                    disabled={saving || !jointDiscussionReply.trim()}
                    onClick={() =>
                      void run(
                        () =>
                          respondToEmployeeExitJointDiscussion({
                            employeeExitId: exitCase.employeeExitId,
                            version: exitCase.version,
                            notes: jointDiscussionReply.trim(),
                          }),
                        "Your discussion contribution was shared.",
                      ).then(() => setJointDiscussionReply(""))
                    }
                  >
                    Send contribution
                  </AppButton>
                </>
              )}
            </Stack>
          )}
          {pendingClearances > 0 && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              {pendingClearances} clearance action
              {pendingClearances === 1 ? "" : "s"} pending.
            </Alert>
          )}
          {canManageFormerPortal && (
            <Box sx={{ mt: 1.5, p: { xs: 1.25, sm: 1.75 }, border: "1px solid", borderColor: portalEnabled ? "success.light" : "divider", borderRadius: 2.5, bgcolor: portalEnabled ? "success.lighter" : "background.paper" }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} gap={1.25}>
                <Box><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 2, bgcolor: portalEnabled ? "success.main" : "primary.lighter", color: portalEnabled ? "success.contrastText" : "primary.dark" }}>{portalEnabled ? <CheckCircleOutline fontSize="small" /> : <LockOutlined fontSize="small" />}</Box><Box><Typography fontWeight={750}>Former-employee portal</Typography><Typography variant="caption" color="text.secondary">Secure post-employment documents and limited requests</Typography></Box></Stack></Box>
                <Chip size="small" color={portalEnabled ? "success" : "default"} label={portalEnabled ? "Enabled" : "Disabled"} sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }} />
              </Stack>
              <Stepper activeStep={portalEnabled ? 3 : personalEmailVerified ? 2 : 1} alternativeLabel sx={{ mt: 2, "& .MuiStepLabel-label": { fontSize: { xs: 10, sm: 12 } } }}>
                <Step completed={Boolean(portalEmail)}><StepLabel>Personal email</StepLabel></Step>
                <Step completed={personalEmailVerified}><StepLabel>Verified</StepLabel></Step>
                <Step completed={portalEnabled}><StepLabel>Portal enabled</StepLabel></Step>
                <Step completed={portalEnabled}><StepLabel>OTP access</StepLabel></Step>
              </Stepper>
              <Alert severity={portalEnabled ? "success" : personalEmailVerified ? "info" : "warning"} sx={{ mt: 1.75, borderRadius: 2 }}>
                {portalEnabled ? <>OTP sign-in is available for <strong>{portalEmail}</strong>. Disable access immediately if this email is no longer appropriate.</> : personalEmailVerified ? <>The personal email is verified. Enable the portal to allow OTP sign-in.</> : <>OTP sign-in remains unavailable until the employee opens and verifies the post-exit email link.</>}
              </Alert>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
                {!portalEnabled ? <AppButton startIcon={<CheckCircleOutline />} disabled={saving || !personalEmailVerified} onClick={() => void enableFormerEmployeePortal()}>{personalEmailVerified ? "Enable portal access" : "Awaiting email verification"}</AppButton> : <><AppButton variant="outlined" startIcon={<MailOutline />} disabled={saving} onClick={() => void sendFormerEmployeePortalInvite()}>Send secure invitation</AppButton><AppButton color="error" variant="outlined" disabled={saving || !revokeReason.trim()} onClick={() => void run(() => revokeFormerEmployeePortalAccess({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, reason: revokeReason.trim() }), "Former-employee portal access disabled.")}>Disable portal</AppButton></>}
              </Stack>
              {portalEnabled && <TextField size="small" fullWidth sx={{ mt: 1.25 }} label="Reason to disable portal access" value={revokeReason} onChange={(event) => setRevokeReason(event.target.value)} helperText="A reason is required to disable access. You can enable it again later." />}
            </Box>
          )}
          {exitCase.permittedActions.includes("ManageDocumentRequests") && (
              <Stack
                spacing={1}
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography fontWeight={700}>Former-employee documents</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Upload or generate a draft for a specific employee request, then verify and publish it.
                  </Typography>
                </Box>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }} sx={{ p: 1.25, borderRadius: 2, bgcolor: "action.hover" }}>
                  <TextField select size="small" label="Employee request" value={uploadRequestId} onChange={(event) => setUploadRequestId(event.target.value)} sx={{ minWidth: { md: 180 } }}><MenuItem value="">Select an in-progress request</MenuItem>{exitCase.formerEmployeeRequests.filter((request) => request.status === "InProgress").map((request) => <MenuItem key={request.requestId} value={request.requestId}>{request.type.replace(/([A-Z])/g, " $1").trim()}</MenuItem>)}</TextField>
                  <TextField size="small" label="Document category" value={portalDocumentCategory} onChange={(event) => setPortalDocumentCategory(event.target.value)} sx={{ minWidth: { md: 180 } }} />
                  <AppButton component="label" variant="outlined" disabled={saving}>Choose file<input hidden type="file" onChange={(event) => setPortalDocumentFile(event.target.files?.[0] ?? null)} /></AppButton>
                  <Typography variant="body2" color={portalDocumentFile ? "text.primary" : "text.secondary"} sx={{ flex: 1, overflowWrap: "anywhere" }}>{portalDocumentFile?.name ?? "No file selected"}</Typography>
                  <AppButton disabled={saving || !portalDocumentFile || !uploadRequestId} onClick={() => void uploadPortalDocument()}>Upload document</AppButton>
                </Stack>
                <TextField
                  size="small"
                  label="Resolution note"
                  value={requestNotes}
                  onChange={(event) => setRequestNotes(event.target.value)}
                />
                <TextField select size="small" value={issueEvidenceId} onChange={(event) => setIssueEvidenceId(event.target.value)} label="Uploaded portal document">
                  <MenuItem value="">Select an uploaded file to verify or publish</MenuItem>
                  {exitCase.evidence.filter((item) => item.visibility === "EmployeeOnly" && !item.issuedToFormerEmployeeAtUtc).map((item) => <MenuItem key={item.evidenceId} value={item.evidenceId}>{item.status} · {item.fileName ?? item.category}</MenuItem>)}
                </TextField>
                {issueEvidenceId && <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" spacing={1}>
                  {exitCase.evidence.some((item) => item.evidenceId === issueEvidenceId && item.status !== "Verified") && <AppButton variant="outlined" disabled={saving} onClick={() => void run(() => verifyEmployeeExitEvidence({ employeeExitId: exitCase.employeeExitId, evidenceId: issueEvidenceId, version: exitCase.version, verified: true }), "Document verified and ready to publish.")}>Verify document</AppButton>}
                </Stack>}
                {exitCase.evidence.filter((item) => item.visibility === "EmployeeOnly" && item.status !== "Superseded").length > 0 && <Stack spacing={.75}><Typography variant="subtitle2" fontWeight={700}>Document drafts and issued files</Typography>{exitCase.evidence.filter((item) => item.visibility === "EmployeeOnly" && item.status !== "Superseded").map((item) => <Stack key={item.evidenceId} direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={.75} sx={{ p: 1, borderRadius: 1.5, bgcolor: "background.default" }}><Box><Typography variant="body2" fontWeight={700}>{item.fileName ?? item.category}</Typography><Typography variant="caption" color="text.secondary">{item.status}{item.issuedToFormerEmployeeAtUtc ? " · Published to portal" : " · Draft"}</Typography></Box><Stack direction="row" spacing={.75}><AppButton size="small" variant="outlined" onClick={() => void openHrPortalDocument(item.evidenceId, item.fileName)}>Open</AppButton><AppButton size="small" onClick={() => void openHrPortalDocument(item.evidenceId, item.fileName, true)}>Download</AppButton>{!item.issuedToFormerEmployeeAtUtc && <AppButton size="small" color="error" variant="outlined" disabled={saving} onClick={() => void run(() => supersedeEmployeeExitEvidence({ employeeExitId: exitCase.employeeExitId, evidenceId: item.evidenceId, version: exitCase.version }), "Draft document deleted.")}>Delete</AppButton>}</Stack></Stack>)}</Stack>}
                {exitCase.formerEmployeeRequests.length > 0 && <Typography variant="subtitle2" fontWeight={700}>Employee requests</Typography>}
                {exitCase.formerEmployeeRequests.map((request) => (
                  <Stack
                    key={request.requestId}
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    gap={1}
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: "background.default",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {request.type.replace(/([A-Z])/g, " $1").trim()} ·{" "}
                        {request.status}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.details}
                      </Typography>
                    </Box>
                    {!["Issued", "Closed"].includes(request.status) && (
                      <Stack direction={{ xs: "column", sm: "row" }} gap={1} alignItems={{ sm: "center" }}>
                        <AppButton
                          size="small"
                          disabled={saving}
                          onClick={() =>
                            void run(
                              () =>
                                resolveEmployeeExitFormerEmployeeRequest({
                                  employeeExitId: exitCase.employeeExitId,
                                  requestId: request.requestId,
                                  version: exitCase.version,
                                  status: "InProgress",
                                  notes: requestNotes.trim() || undefined,
                                }),
                              "Request marked in progress.",
                            )
                          }
                        >
                          In progress
                        </AppButton>
                        {request.status === "InProgress" && ({ RelievingLetter: "RelievingLetter", ExperienceLetter: "ExperienceLetter", FnFStatement: "FinalSettlementStatement" } as const)[request.type as "RelievingLetter" | "ExperienceLetter" | "FnFStatement"] && <AppButton size="small" variant="outlined" disabled={saving} onClick={() => void run(() => generateEmployeeExitDocument({ employeeExitId: exitCase.employeeExitId, requestId: request.requestId, version: exitCase.version, type: ({ RelievingLetter: "RelievingLetter", ExperienceLetter: "ExperienceLetter", FnFStatement: "FinalSettlementStatement" } as const)[request.type as "RelievingLetter" | "ExperienceLetter" | "FnFStatement"] }), "Document generated. Select it below to preview or issue.")}>Generate document</AppButton>}
                        <AppButton size="small" disabled={saving || request.status !== "InProgress" || !issueEvidenceId || !exitCase.evidence.some((item) => item.evidenceId === issueEvidenceId && item.status === "Verified" && item.visibility === "EmployeeOnly")} onClick={() => void run(() => issueEmployeeExitDocument({ employeeExitId: exitCase.employeeExitId, requestId: request.requestId, evidenceId: issueEvidenceId, version: exitCase.version, message: requestNotes.trim() || undefined }), "Requested document published and the former employee notified.")}>Attach selected file & publish</AppButton>
                      </Stack>
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
          {canManageOperationalWork && (
            <EmployeeExitOperationsPanel
              exitCase={exitCase}
              onRefresh={refresh}
              managerOnly={!exitCase.permittedActions.includes("ManageClearance")}
            />
          )}
          {exitCase.permittedActions.some((action) =>
            reviewActions.includes(action as ReviewAction),
          ) && (
            <Stack spacing={1} sx={{ mt: 1.5, p: { xs: 1.25, sm: 1.5 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "background.paper" }}>
              <Box>
                <Typography fontWeight={750}>Other actions</Typography>
                <Typography variant="caption" color="text.secondary">Add context, discuss the case, or take an approval decision.</Typography>
              </Box>
              {combinedManagerHrApproval && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  You are the assigned reporting manager and an authorised HR reviewer. After any pending notice decision is resolved, one approval completes both review stages and starts the notice period.
                </Alert>
              )}
              <TextField
                size="small"
                label="Decision or discussion note"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                multiline
                minRows={2}
              />
              {exitCase.permittedActions.includes("JointDiscussion") && (
                <Autocomplete
                  multiple
                  size="small"
                  options={discussionCandidates}
                  value={discussionParticipants}
                  onChange={(_, values) => setDiscussionParticipants(values)}
                  getOptionLabel={(item) =>
                    `${item.fullName}${item.jobRole ? ` · ${Object.values(item.jobRole)[0]}` : ""}`
                  }
                  isOptionEqualToValue={(left, right) =>
                    left.userId === right.userId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Invite colleagues to the joint discussion"
                      helperText="Selected people receive an in-app notification and can see the discussion invitation."
                    />
                  )}
                />
              )}
              <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                {reviewActions
                  .filter((action) =>
                    exitCase.permittedActions.includes(action),
                  )
                  .map((action) => (
                    <AppButton
                      key={action}
                      color={
                        action === "Reject"
                          ? "error"
                          : action === "Approve"
                            ? "success"
                            : "primary"
                      }
                      variant={action === "Approve" ? "contained" : "outlined"}
                      disabled={
                        saving ||
                        ([
                          "Discuss",
                          "JointDiscussion",
                          "RequestDiscussion",
                        ].includes(action) &&
                          !notes.trim()) ||
                        (action === "JointDiscussion" &&
                          discussionParticipants.length === 0) ||
                        (action === "Approve" &&
                          Boolean(noticeAdjustmentBlockingApproval))
                      }
                      onClick={() => void review(action)}
                      sx={{
                        "&.Mui-disabled": {
                          color: "text.disabled",
                          bgcolor: "transparent",
                          borderColor: "divider",
                        },
                      }}
                    >
                      {action === "Approve" && combinedManagerHrApproval
                        ? "Approve as manager & HR"
                        : action === "RequestDiscussion"
                          ? "Request discussion"
                          : action === "JointDiscussion"
                            ? "Start joint discussion"
                            : action}
                    </AppButton>
                  ))}
              </Stack>
              {noticeAdjustmentBlockingApproval && (
                <Alert severity="warning">
                  {noticeAdjustmentBlockingApproval.status === "Pending"
                    ? "Resolve the notice-period request below before approving this case."
                    : "Waiting for the employee to accept or decline the notice-period offer below before this case can be approved."}
                </Alert>
              )}
            </Stack>
          )}
          {exitCase.withdrawal?.status === "Pending" &&
            exitCase.permittedActions.includes("DecideWithdrawal") && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={1}
                sx={{ mt: 1.5 }}
              >
                <Alert severity="warning">
                  Withdrawal requested:{" "}
                  {exitCase.withdrawal.reason || "No reason provided."}
                </Alert>
                <AppButton
                  disabled={saving}
                  onClick={() =>
                    void run(
                      () =>
                        decideEmployeeExitWithdrawal({
                          employeeExitId: exitCase.employeeExitId,
                          version: exitCase.version,
                          approve: true,
                        }),
                      "Withdrawal approved.",
                    )
                  }
                >
                  Approve withdrawal
                </AppButton>
                <AppButton
                  color="error"
                  disabled={saving}
                  onClick={() =>
                    void run(
                      () =>
                        decideEmployeeExitWithdrawal({
                          employeeExitId: exitCase.employeeExitId,
                          version: exitCase.version,
                          approve: false,
                        }),
                      "Withdrawal declined.",
                    )
                  }
                >
                  Decline
                </AppButton>
              </Stack>
            )}
          {canManageCurrentCase &&
            exitCase.permittedActions.includes("DecideNoticeAdjustment") &&
            exitCase.noticeAdjustments
              .filter((item) => item.status === "Pending")
              .map((item) => (
                <Stack
                  key={item.noticeAdjustmentId}
                  spacing={1.25}
                  sx={{
                    p: { xs: 1.25, sm: 1.5 },
                    border: "1px solid",
                    borderColor: "warning.light",
                    borderLeft: "4px solid",
                    borderLeftColor: "warning.main",
                    bgcolor: "warning.lighter",
                    borderRadius: 2.5,
                    boxShadow: "0 8px 20px rgba(173, 102, 0, .08)",
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} gap={.75}>
                    <Box>
                    <Typography variant="overline" color="warning.dark" sx={{ lineHeight: 1.25 }}>ACTION REQUIRED</Typography>
                    <Typography fontWeight={750}>Notice adjustment request</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Requested last working day:{" "}
                      {new Date(
                        item.requestedLastWorkingDate,
                      ).toLocaleDateString()}{" "}
                      · Notice shortfall: {item.shortfallDays} day(s).
                      This is a separate approval step from the overall exit case.
                    </Typography>
                    {item.reason && (
                      <Typography variant="caption" color="text.secondary">
                        Employee reason: {item.reason}
                      </Typography>
                    )}
                    </Box>
                    <Chip size="small" color="warning" label="Awaiting review" sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }} />
                  </Stack>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) 32px minmax(0, 1fr)" }, gap: 1, alignItems: "center", p: 1.25, borderRadius: 2, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
                    <Box><Typography variant="caption" color="text.secondary">Current LWD</Typography><Typography fontWeight={800}>{new Date(exitCase.lastWorkingDate).toLocaleDateString()}</Typography></Box>
                    <Typography textAlign="center" color="text.secondary">→</Typography>
                    <Box><Typography variant="caption" color="text.secondary">Requested LWD</Typography><Typography fontWeight={800}>{new Date(item.requestedLastWorkingDate).toLocaleDateString()}</Typography><Typography variant="caption" color="success.main">{item.shortfallDays} days earlier</Typography></Box>
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                      sm: "minmax(220px, 1fr) minmax(150px, .55fr)",
                      },
                      gap: 1,
                    }}
                  >
                    <TextField
                      select
                      size="small"
                      label="HR settlement decision"
                      value={noticeDecisionType}
                      onChange={(event) =>
                        setNoticeDecisionType(event.target.value)
                      }
                    >
                      <MenuItem value="CompanyEarlyRelease">
                        Company early release — no recovery
                      </MenuItem>
                      <MenuItem value="FullWaiver">
                        Full waiver — waive all shortfall
                      </MenuItem>
                      <MenuItem value="PartialWaiver">
                        Partial waiver — waive selected days
                      </MenuItem>
                      <MenuItem value="Recovery">
                        Recover through final settlement
                      </MenuItem>
                      <MenuItem value="Buyout">
                        Buyout — collect separately
                      </MenuItem>
                      <MenuItem value="NoticeExtension">
                        Notice extension
                      </MenuItem>
                    </TextField>
                    <TextField
                      size="small"
                      type="number"
                      disabled={noticeDecisionType !== "PartialWaiver"}
                      inputProps={{ min: 0, max: item.shortfallDays }}
                      label="Days waived"
                      value={
                        noticeDecisionType === "FullWaiver" ||
                        noticeDecisionType === "CompanyEarlyRelease"
                          ? item.shortfallDays
                          : noticeWaivedDays
                      }
                      onChange={(event) =>
                        setNoticeWaivedDays(
                          Math.max(0, Number(event.target.value) || 0),
                        )
                      }
                    />
                  </Box>
                  <Alert
                    severity={
                      noticeDecisionType === "Buyout" ? "warning" : "info"
                    }
                    sx={{ py: 0 }}
                  >
                    {noticeDecisionType === "Recovery" ||
                    noticeDecisionType === "PartialWaiver"
                      ? "This notice adjustment amount is calculated automatically from processed payroll and included in the final settlement. The exit case itself is still not final until the employee accepts or declines this offer."
                      : noticeDecisionType === "Buyout"
                        ? "This buyout amount is calculated automatically from processed payroll and recorded as a separate finance receivable. It is not deducted from final settlement, and the employee must still accept or reject the offer."
                        : "This decision updates the notice-period terms. The overall exit case remains on hold until the employee accepts or declines any payable offer."}
                  </Alert>
                  <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                    <AppButton
                      disabled={saving}
                      onClick={() =>
                        void run(
                          () =>
                            decideEmployeeExitNoticeAdjustment({
                              employeeExitId: exitCase.employeeExitId,
                              noticeAdjustmentId: item.noticeAdjustmentId,
                              version: exitCase.version,
                              approve: true,
                              decisionType: noticeDecisionType,
                              waivedDays:
                                noticeDecisionType === "FullWaiver" ||
                                noticeDecisionType === "CompanyEarlyRelease"
                                  ? item.shortfallDays
                                  : noticeWaivedDays,
                              recoveryAmount: 0,
                            }),
                          "Notice adjustment approved and sent to employee.",
                        )
                      }
                      sx={{ flex: { sm: "0 0 auto" } }}
                    >
                      Approve adjustment & send offer
                    </AppButton>
                    <AppButton
                      color="error"
                      variant="outlined"
                      disabled={saving}
                      onClick={() =>
                        void run(
                          () =>
                            decideEmployeeExitNoticeAdjustment({
                              employeeExitId: exitCase.employeeExitId,
                              noticeAdjustmentId: item.noticeAdjustmentId,
                              version: exitCase.version,
                              approve: false,
                            }),
                          "Notice adjustment declined.",
                        )
                      }
                    >
                      Decline
                    </AppButton>
                  </Stack>
                </Stack>
              ))}
          {canManageCurrentCase && exitCase.noticeAdjustments
            .filter((item) => item.status === "AwaitingEmployeeDecision")
            .map((item) => (
              <Stack
                key={item.noticeAdjustmentId}
                spacing={1}
                sx={{
                  p: { xs: 1.25, sm: 1.5 },
                  border: "1px solid",
                  borderColor: "warning.light",
                  bgcolor: "action.hover",
                  borderRadius: 2.5,
                }}
              >
                <Typography fontWeight={750}>
                  Employee notice offer · awaiting decision
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 32px 1fr" }, gap: 1, alignItems: "center", p: 1.25, borderRadius: 2, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
                  <Box><Typography variant="caption" color="text.secondary">Current LWD</Typography><Typography fontWeight={800}>{new Date(exitCase.lastWorkingDate).toLocaleDateString()}</Typography></Box>
                  <Typography textAlign="center" color="text.secondary">→</Typography>
                  <Box><Typography variant="caption" color="text.secondary">Offered LWD</Typography><Typography fontWeight={800}>{new Date(item.requestedLastWorkingDate).toLocaleDateString()}</Typography></Box>
                </Box>
                <Alert severity="warning" sx={{ py: 0 }}>
                  HR-approved {item.type === "Buyout" ? "buyout" : "notice recovery"}{" "}
                  amount: <strong>{item.recoveryAmount.toLocaleString()}</strong> for{" "}
                  {item.shortfallDays} shortfall day(s). This offer is separate from the overall case approval, and the employee must accept it or keep the original notice period.
                </Alert>
                <Alert severity="warning" variant="outlined" sx={{ py: 0 }}>Case completion is blocked until the employee accepts or declines this offer.</Alert>
              </Stack>
            ))}
          {exitCase.permittedActions.includes("RecordInterview") && (
            <Stack
              spacing={1.25}
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2.5,
                bgcolor: "background.paper",
              }}
            >
              <Box>
                <Typography fontWeight={750}>Exit interview</Typography>
                <Typography variant="caption" color="text.secondary">
                  Record the discussion and any follow-up agreed with the
                  employee.
                </Typography>
              </Box>
              {exitCase.exitInterview?.hrNotes && (
                <Alert severity="success">
                  Saved{" "}
                  {exitCase.exitInterview.conductedAtUtc
                    ? `on ${new Date(exitCase.exitInterview.conductedAtUtc).toLocaleDateString()}`
                    : ""}
                  : {exitCase.exitInterview.hrNotes}
                </Alert>
              )}
              {exitCase.evidence.filter((item) => item.category === "ExitInterview").length > 0 && (
                <Stack spacing={0.75}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Interview attachments
                  </Typography>
                  {exitCase.evidence
                    .filter((item) => item.category === "ExitInterview")
                    .map((item) => (
                      <Box
                        key={item.evidenceId}
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.default",
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {item.fileName || "Interview file"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.type} · {item.status}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              )}
              <TextField
                size="small"
                multiline
                minRows={3}
                label={
                  exitCase.exitInterview
                    ? "Update interview notes"
                    : "Interview notes"
                }
                value={interviewNotes}
                onChange={(event) => setInterviewNotes(event.target.value)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rehireEligible}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setRehireEligible(checked);
                      setRehireEligibilityChanged(true);
                      toast.info(checked ? "Employee marked eligible for rehire." : "Employee marked not eligible for rehire.");
                    }}
                  />
                }
                label="Mark employee eligible for rehire"
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                <AppButton
                  component="label"
                  variant="outlined"
                  disabled={saving}
                  sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
                >
                  {interviewFile ? "Replace file" : "Upload file"}
                  <input
                    hidden
                    type="file"
                    accept="application/pdf,image/*,.doc,.docx,.txt,.csv,.xls,.xlsx"
                    onChange={(event) => setInterviewFile(event.target.files?.[0] || null)}
                  />
                </AppButton>
                {interviewFile && (
                  <Typography variant="caption" color="text.secondary">
                    Selected: {interviewFile.name}
                  </Typography>
                )}
              </Stack>
              <AppButton
                disabled={saving || (!interviewNotes.trim() && !interviewFile && !rehireEligibilityChanged)}
                onClick={() => void saveInterview()}
                sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
              >
                {exitCase.exitInterview ? "Save update" : "Save interview"}
              </AppButton>
            </Stack>
          )}
          {exitCase.permittedActions.includes("CalculateSettlement") && (
            <Stack
              spacing={1.25}
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2.5,
                bgcolor: "background.paper",
              }}
            >
              <Box>
                <Typography fontWeight={750}>
                  Full & final settlement
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Calculated automatically from the employee’s processed payroll
                  for the last-working-month. For a same-month exit, complete
                  employment first; normal month-end payroll includes the former
                  employee through their last working day, then HR can calculate
                  and approve F&F.
                </Typography>
              </Box>
              {exitCase.finalSettlement && (
                <Alert severity="success">
                  {exitCase.finalSettlement.status} · Net payable:{" "}
                  {exitCase.finalSettlement.netPayable.toLocaleString()}{" "}
                  {exitCase.finalSettlement.sourcePayrollMonth
                    ? `· payroll month ${new Date(exitCase.finalSettlement.sourcePayrollMonth).toLocaleDateString(undefined, { month: "short", year: "numeric" })}`
                    : ""}
                </Alert>
              )}
              {exitCase.finalSettlement?.status !== "Paid" && <Stack direction="row" justifyContent="flex-end">
                <AppButton
                  disabled={saving}
                  onClick={() =>
                    void run(
                      () =>
                        calculateEmployeeFinalSettlement({
                          employeeExitId: exitCase.employeeExitId,
                          version: exitCase.version,
                        }),
                      "Final settlement calculated from payroll.",
                    )
                  }
                  sx={{ minHeight: 40, width: { xs: "100%", sm: "auto" } }}
                >
                  Calculate from payroll
                </AppButton>
              </Stack>}
            </Stack>
          )}
          {canManageOperationalWork && (
            <Stack
              spacing={1.25}
              sx={{
                mt: 1.5,
                p: { xs: 1.25, sm: 1.5 },
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Box>
                <Typography fontWeight={750}>
                  Transfer work ownership
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Record only work that needs a new owner. The new owner is
                  selected from active employees in this company.
                </Typography>
              </Box>
              {exitCase.responsibilityReassignments.length > 0 && (
                <Stack spacing={0.5}>
                  {exitCase.responsibilityReassignments.map((item, index) => (
                    <Chip
                      key={`${item.responsibility}-${index}`}
                      size="small"
                      color="success"
                      variant="outlined"
                      label={`${item.responsibility} → ${discussionCandidates.find((candidate) => candidate.userId === item.newOwnerUserId)?.fullName || "Assigned employee"}`}
                      sx={{ alignSelf: "flex-start" }}
                    />
                  ))}
                </Stack>
              )}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr auto" },
                  gap: 1,
                  alignItems: "start",
                }}
              >
                <TextField
                  size="small"
                  label="Work to transfer"
                  placeholder="Example: Acme client account approvals"
                  value={responsibility}
                  onChange={(event) => setResponsibility(event.target.value)}
                />
                <Autocomplete
                  size="small"
                  options={discussionCandidates}
                  value={newOwner}
                  onChange={(_, value) => setNewOwner(value)}
                  getOptionLabel={(item) =>
                    `${item.fullName}${item.jobRole ? ` · ${Object.values(item.jobRole)[0]}` : ""}`
                  }
                  isOptionEqualToValue={(left, right) =>
                    left.userId === right.userId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="New owner"
                      placeholder="Choose an active employee"
                    />
                  )}
                />
                <AppButton
                  disabled={saving || !responsibility.trim() || !newOwner}
                  onClick={() => void transferOwnership()}
                  sx={{ minHeight: 40 }}
                >
                  Transfer ownership
                </AppButton>
              </Box>
            </Stack>
          )}
          {exitCase.permittedActions.includes("GenerateDocuments") && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={1}
              sx={{ mt: 1.5 }}
            >
              {(
                [
                  "RelievingLetter",
                  "ExperienceLetter",
                  "FinalSettlementStatement",
                ] as const
              ).map((type) => (
                <AppButton
                  key={type}
                  variant="outlined"
                  disabled={saving}
                  onClick={() =>
                    void run(
                      () =>
                        generateEmployeeExitDocument({
                          employeeExitId: exitCase.employeeExitId,
                          version: exitCase.version,
                          type,
                        }),
                      `${type} generated.`,
                    )
                  }
                >
                  {type.replace(/([A-Z])/g, " $1")}
                </AppButton>
              ))}
            </Stack>
          )}
        </Stack>
      </CustomisedModal>
    </>
  );
};
