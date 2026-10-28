import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AssignmentTurnedInOutlined,
  CheckCircleOutline,
  FolderOpenOutlined,
  HistoryRounded,
  InsertDriveFileOutlined,
  LockOutlined,
  MailOutline,
  ManageAccounts,
  RateReviewOutlined,
  UndoRounded,
  WorkOutlineOutlined,
} from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../../../Redux/hooks";
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
  | "Approve"
  | "Discuss"
  | "JointDiscussion"
  | "Reject"
  | "RequestDiscussion";

const offboardingErrorMessage = (message?: string) => {
  if (message === "NOTICE_ADJUSTMENT_DATE_IN_PAST")
    return "The requested last working day is before today. Select today or a future date.";
  if (message === "EXIT_NOTICE_ADJUSTMENT_DATE_INVALID")
    return "Choose today or a future last working day that is after the exit was started.";
  return message || "Unable to update the offboarding case.";
};

export const EmployeeExitManagementCard = ({ employeeUserId }: Props) => {
  const permissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasOffboarding = permissions.some((p) => p.startsWith("Offboarding."));
  const [exitCase, setExitCase] = useState<EmployeeExitCase | null>(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
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
  const [newOwner, setNewOwner] = useState<GetAllEmployeeResponseModel | null>(null);
  const [noticeDecisionType, setNoticeDecisionType] = useState("CompanyEarlyRelease");
  const [noticeWaivedDays, setNoticeWaivedDays] = useState(0);
  const [discussionCandidates, setDiscussionCandidates] = useState<GetAllEmployeeResponseModel[]>([]);
  const [discussionParticipants, setDiscussionParticipants] = useState<GetAllEmployeeResponseModel[]>([]);
  const [jointDiscussionReply, setJointDiscussionReply] = useState("");
  const [rejoinReason, setRejoinReason] = useState("");

  const refresh = useCallback(async () => {
    if (!hasOffboarding) {
      setExitCase(null);
      return;
    }
    const response = await getEmployeeExitCaseForManagement(employeeUserId);
    const nextCase = response.data.success ? response.data.methodResult : null;
    setExitCase(nextCase);
    setRehireEligible(nextCase?.exitInterview?.isRehireEligible === true);
    setRehireEligibilityChanged(false);
  }, [hasOffboarding, employeeUserId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const hasEmployeeOffer =
      exitCase?.status === "AwaitingEmployeeNoticeOffer" &&
      exitCase.noticeAdjustments.some(
        (item) => item.status === "AwaitingEmployeeDecision",
      );
    if (hasEmployeeOffer) {
      setOpen(true);
      setActiveTab(0);
    }
  }, [exitCase?.employeeExitId, exitCase?.version, exitCase?.status, exitCase?.noticeAdjustments]);

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
  }, [hasOffboarding, employeeUserId]);

  if (!hasOffboarding || !exitCase) return null;

  const run = async (
    work: () => Promise<{ data: { success: boolean; message?: string } }>,
    message: string,
  ) => {
    setSaving(true);
    try {
      const response = await work();
      if (!response.data.success)
        throw new Error(offboardingErrorMessage(response.data.message));
      toast.success(message);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update the offboarding case.",
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
    if (!portalDocumentFile || !uploadRequestId) {
      toast.error("Choose the employee request and document to upload.");
      return;
    }
    const payload = new FormData();
    payload.append("employeeExitId", exitCase.employeeExitId);
    payload.append(
      "category",
      portalDocumentCategory.trim() || "FormerEmployeeDocument",
    );
    payload.append("visibility", "EmployeeOnly");
    payload.append("formerEmployeeRequestId", uploadRequestId);
    payload.append("file", portalDocumentFile);
    setSaving(true);
    try {
      const response = await uploadEmployeeExitEvidence(payload);
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to upload the document.",
        );
      setPortalDocumentFile(null);
      toast.success(
        "Document uploaded. Verify it before publishing to the former employee.",
      );
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload the document.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openHrPortalDocument = async (
    evidenceId: string,
    fileName?: string,
    download = false,
  ) => {
    try {
      const response = await downloadEmployeeExitEvidence(
        exitCase.employeeExitId,
        evidenceId,
      );
      const url = URL.createObjectURL(response.data);
      if (download) {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "former-employee-document";
        link.click();
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      toast.error("Unable to open this document.");
    }
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
        throw new Error(
          response.data.message || "Unable to send the portal invitation.",
        );
      toast.success(
        "A secure former-employee portal invitation was sent to the verified personal email.",
      );
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send the portal invitation.",
      );
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
  const canManageCurrentCase = ![
    "Withdrawn",
    "Cancelled",
    "Rejoined",
  ].includes(exitCase.status);
  const canManageFormerPortal = exitCase.permittedActions.includes(
    "ManageFormerPortal",
  );
  const personalEmailVerified =
    exitCase.postExitContact?.personalEmailVerified === true;
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
  const workflowStep =
    exitCase.status === "PendingManagerApproval" ||
    exitCase.status === "DiscussionRequested"
      ? 1
      : exitCase.status === "PendingHrApproval"
        ? 2
        : ["NoticePeriod", "AwaitingEmployeeNoticeOffer"].includes(
              exitCase.status,
            )
          ? 3
          : ["Resigned", "Terminated"].includes(exitCase.status)
            ? 4
            : 0;

  const pendingNoticeAdjustment = exitCase.noticeAdjustments.find(
    (x) => x.status === "Pending",
  );
  const awaitingDecisionAdjustment = exitCase.noticeAdjustments.find(
    (x) => x.status === "AwaitingEmployeeDecision",
  );

  const pendingApprovalsCount =
    (pendingNoticeAdjustment ? 1 : 0) +
    (exitCase.withdrawal?.status === "Pending" ? 1 : 0) +
    (exitCase.permittedActions.some((a) => reviewActions.includes(a as ReviewAction)) ? 1 : 0);

  const pendingClearancesCount =
    pendingClearances +
    exitCase.pendingHandoverCount +
    exitCase.pendingAssetCount +
    exitCase.pendingAccessCount +
    exitCase.pendingFinanceCount +
    exitCase.pendingBenefitCount;

  const inProgressDocumentRequestsCount = exitCase.formerEmployeeRequests.filter(
    (x) => x.status === "InProgress",
  ).length;

  const cardSx = {
    p: { xs: 2, sm: 2.5 },
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2.5,
    bgcolor: "background.paper",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
    minWidth: 0,
  };

  return (
    <>
      {canManageCurrentCase ? (
        <AppButton
          fullWidth
          variant="outlined"
          startIcon={<ManageAccounts />}
          onClick={() => setOpen(true)}
          sx={{ minHeight: 44, borderRadius: 2, fontWeight: 700 }}
        >
          Manage offboarding
        </AppButton>
      ) : (
        <AppButton
          fullWidth
          variant="outlined"
          startIcon={<HistoryRounded />}
          endIcon={<UndoRounded />}
          onClick={() => setOpen(true)}
          aria-label="Open resignation history"
          sx={{
            minHeight: 66,
            justifyContent: "flex-start",
            textAlign: "left",
            borderRadius: 2.5,
            px: 1.75,
            color: "primary.main",
            borderColor: "rgba(41,142,137,.28)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,.98), rgba(235,250,249,.9))",
            boxShadow: "0 10px 24px rgba(33,93,110,.07)",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Resignation history
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Withdrawn · View closed resignation details
            </Typography>
          </Box>
        </AppButton>
      )}

      <CustomisedModal
        open={open}
        handleClose={() => !saving && setOpen(false)}
        maxWidth="md"
        fullWidth
        allowMaximize
        paperSx={{
          width: { xs: "100%", sm: "calc(100% - 32px)", md: 940 },
          maxWidth: 960,
          maxHeight: { xs: "100%", sm: "calc(100% - 32px)" },
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
        }}
        contentSx={{
          p: 0,
          bgcolor: "background.default",
          overflowY: "auto",
          overscrollBehavior: "contain",
          minWidth: 0,
        }}
        title={
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
            gap={1}
            sx={{ pr: 1 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={750}>
                {canManageCurrentCase
                  ? "Offboarding Management"
                  : "Resignation History"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {canManageCurrentCase ? "Last working date" : "Withdrawn resignation"} ·{" "}
                {new Date(exitCase.lastWorkingDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Chip
              size="small"
              color={canManageCurrentCase ? "primary" : "default"}
              label={exitCase.status.replace(/([A-Z])/g, " $1").trim()}
              sx={{ alignSelf: { xs: "flex-start", sm: "auto" }, fontWeight: 700 }}
            />
          </Stack>
        }
      >
        {/* WITHDRAWN CASE VIEW */}
        {!canManageCurrentCase && (
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              This resignation was withdrawn. There are no approval, portal, or clearance actions remaining.
            </Alert>
            <Box sx={cardSx}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <HistoryRounded color="primary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Resignation Timeline
                </Typography>
              </Stack>
              <Stack spacing={1.25} role="list" aria-label="Resignation history timeline">
                {[...(exitCase.auditHistory ?? [])].reverse().map((event, index) => (
                  <Box
                    key={`${event.atUtc}-${index}`}
                    role="listitem"
                    sx={{
                      pl: 1.5,
                      borderLeft: "2px solid",
                      borderColor: index === 0 ? "primary.main" : "divider",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {event.action.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.atUtc).toLocaleString()}
                      {event.notes ? ` · ${event.notes}` : ""}
                    </Typography>
                  </Box>
                ))}
                {(!exitCase.auditHistory || exitCase.auditHistory.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No additional resignation events recorded.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        )}

        {/* ACTIVE CASE VIEW WITH CLEAN TABS */}
        {canManageCurrentCase && (
          <>
            {/* Top Stepper Banner */}
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                bgcolor: "background.paper",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
                gap={0.75}
              >
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.2 }}>
                    CASE LIFECYCLE
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Follow the decision roadmap from request review to final settlement.
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  color={noticeAdjustmentBlockingApproval ? "warning" : "primary"}
                  label={
                    noticeAdjustmentBlockingApproval
                      ? "Action required"
                      : exitCase.status.replace(/([A-Z])/g, " $1").trim()
                  }
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Stepper
                activeStep={workflowStep}
                alternativeLabel
                sx={{
                  minWidth: 500,
                  mt: 2,
                  "& .MuiStepLabel-label": {
                    mt: 0.5,
                    fontSize: { xs: 11, sm: 12 },
                    fontWeight: 700,
                    lineHeight: 1.2,
                  },
                  "& .MuiStepConnector-line": { borderTopWidth: 2 },
                }}
              >
                {workflowSteps.map((label, index) => (
                  <Step key={label} completed={index < workflowStep}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Navigation Tabs Header */}
            <Box
              sx={{
                px: { xs: 1.5, sm: 2.5 },
                pt: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 46,
                  "& .MuiTab-root": {
                    minHeight: 46,
                    fontWeight: 700,
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    textTransform: "none",
                    gap: 0.75,
                  },
                }}
              >
                <Tab
                  icon={<RateReviewOutlined sx={{ fontSize: 20 }} />}
                  iconPosition="start"
                  label={
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <span>Approvals & Review</span>
                      {pendingApprovalsCount > 0 && (
                        <Chip
                          size="small"
                          color="warning"
                          label={pendingApprovalsCount}
                          sx={{ height: 20, fontSize: "0.75rem", fontWeight: 800 }}
                        />
                      )}
                    </Stack>
                  }
                />
                <Tab
                  icon={<AssignmentTurnedInOutlined sx={{ fontSize: 20 }} />}
                  iconPosition="start"
                  label={
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <span>Clearance & Operations</span>
                      {pendingClearancesCount > 0 && (
                        <Chip
                          size="small"
                          label={pendingClearancesCount}
                          sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                        />
                      )}
                    </Stack>
                  }
                />
                <Tab
                  icon={<WorkOutlineOutlined sx={{ fontSize: 20 }} />}
                  iconPosition="start"
                  label="Formalities & Settlement"
                />
                <Tab
                  icon={<FolderOpenOutlined sx={{ fontSize: 20 }} />}
                  iconPosition="start"
                  label={
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <span>Documents & Former Portal</span>
                      {inProgressDocumentRequestsCount > 0 && (
                        <Chip
                          size="small"
                          color="info"
                          label={inProgressDocumentRequestsCount}
                          sx={{ height: 20, fontSize: "0.75rem", fontWeight: 800 }}
                        />
                      )}
                    </Stack>
                  }
                />
              </Tabs>
            </Box>

            {/* TAB CONTENTS */}
            <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              {/* TAB 0: APPROVALS & CASE REVIEW */}
              {activeTab === 0 && (
                <Stack spacing={2}>
                  {/* High Priority: Notice adjustment pending review */}
                  {pendingNoticeAdjustment &&
                    exitCase.permittedActions.includes("DecideNoticeAdjustment") && (
                      <Box
                        sx={{
                          ...cardSx,
                          border: "2px solid",
                          borderColor: "warning.main",
                          bgcolor: "warning.lighter",
                          boxShadow: "0 8px 24px rgba(237, 108, 2, 0.1)",
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ sm: "flex-start" }}
                            gap={0.75}
                          >
                            <Box>
                              <Typography variant="overline" color="warning.dark" sx={{ fontWeight: 800 }}>
                                ACTION REQUIRED
                              </Typography>
                              <Typography variant="h6" fontWeight={750} color="warning.dark">
                                Notice Adjustment Request
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Requested LWD:{" "}
                                <strong>
                                  {new Date(
                                    pendingNoticeAdjustment.requestedLastWorkingDate,
                                  ).toLocaleDateString()}
                                </strong>{" "}
                                · Notice shortfall: <strong>{pendingNoticeAdjustment.shortfallDays} day(s)</strong>.
                              </Typography>
                              {pendingNoticeAdjustment.reason && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                  Employee reason: {pendingNoticeAdjustment.reason}
                                </Typography>
                              )}
                            </Box>
                            <Chip size="small" color="warning" label="Awaiting HR Review" sx={{ fontWeight: 800 }} />
                          </Stack>

                          {/* Visual Comparison Tiles */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr auto 1fr",
                              },
                              gap: 1.5,
                              alignItems: "center",
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: "background.paper",
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Current LWD
                              </Typography>
                              <Typography variant="body1" fontWeight={800}>
                                {new Date(exitCase.lastWorkingDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Typography
                              textAlign="center"
                              color="text.secondary"
                              sx={{ display: { xs: "none", sm: "block" }, fontWeight: 700 }}
                            >
                              →
                            </Typography>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Requested LWD
                              </Typography>
                              <Typography variant="body1" fontWeight={800} color="primary.main">
                                {new Date(
                                  pendingNoticeAdjustment.requestedLastWorkingDate,
                                ).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="success.main" fontWeight={700}>
                                {pendingNoticeAdjustment.shortfallDays} days earlier
                              </Typography>
                            </Box>
                          </Box>

                          {/* Settlement Decision Controls */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                sm: "minmax(240px, 1fr) minmax(140px, 0.5fr)",
                              },
                              gap: 1.5,
                            }}
                          >
                            <TextField
                              select
                              size="small"
                              label="HR settlement decision"
                              value={noticeDecisionType}
                              onChange={(event) => setNoticeDecisionType(event.target.value)}
                            >
                              <MenuItem value="CompanyEarlyRelease">Company early release — no recovery</MenuItem>
                              <MenuItem value="FullWaiver">Full waiver — waive all shortfall</MenuItem>
                              <MenuItem value="PartialWaiver">Partial waiver — waive selected days</MenuItem>
                              <MenuItem value="Recovery">Recover through final settlement</MenuItem>
                              <MenuItem value="Buyout">Buyout — collect separately</MenuItem>
                              <MenuItem value="NoticeExtension">Notice extension</MenuItem>
                            </TextField>
                            <TextField
                              size="small"
                              type="number"
                              disabled={noticeDecisionType !== "PartialWaiver"}
                              inputProps={{ min: 0, max: pendingNoticeAdjustment.shortfallDays }}
                              label="Days waived"
                              value={
                                noticeDecisionType === "FullWaiver" ||
                                noticeDecisionType === "CompanyEarlyRelease"
                                  ? pendingNoticeAdjustment.shortfallDays
                                  : noticeWaivedDays
                              }
                              onChange={(event) =>
                                setNoticeWaivedDays(Math.max(0, Number(event.target.value) || 0))
                              }
                            />
                          </Box>

                          <Alert severity={noticeDecisionType === "Buyout" ? "warning" : "info"} sx={{ py: 0.5 }}>
                            {noticeDecisionType === "Recovery" || noticeDecisionType === "PartialWaiver"
                              ? "Calculated automatically from payroll and included in the final settlement. Case completes after employee accepts the offer."
                              : noticeDecisionType === "Buyout"
                                ? "Recorded as a separate finance receivable. Not deducted from final settlement, and employee must accept the offer."
                                : "Updates the notice-period terms. Completion remains blocked until the employee accepts or declines."}
                          </Alert>

                          <Stack direction={{ xs: "column", sm: "row" }} gap={1} justifyContent="flex-end">
                            <AppButton
                              color="error"
                              variant="outlined"
                              disabled={saving}
                              onClick={() =>
                                void run(
                                  () =>
                                    decideEmployeeExitNoticeAdjustment({
                                      employeeExitId: exitCase.employeeExitId,
                                      noticeAdjustmentId: pendingNoticeAdjustment.noticeAdjustmentId,
                                      version: exitCase.version,
                                      approve: false,
                                    }),
                                  "Notice adjustment declined.",
                                )
                              }
                            >
                              Decline
                            </AppButton>
                            <AppButton
                              disabled={saving}
                              onClick={() =>
                                void run(
                                  () =>
                                    decideEmployeeExitNoticeAdjustment({
                                      employeeExitId: exitCase.employeeExitId,
                                      noticeAdjustmentId: pendingNoticeAdjustment.noticeAdjustmentId,
                                      version: exitCase.version,
                                      approve: true,
                                      decisionType: noticeDecisionType,
                                      waivedDays:
                                        noticeDecisionType === "FullWaiver" ||
                                        noticeDecisionType === "CompanyEarlyRelease"
                                          ? pendingNoticeAdjustment.shortfallDays
                                          : noticeWaivedDays,
                                      recoveryAmount: 0,
                                    }),
                                  "Notice adjustment approved and sent to employee.",
                                )
                              }
                            >
                              Approve adjustment & send offer
                            </AppButton>
                          </Stack>
                        </Stack>
                      </Box>
                    )}

                  {/* Awaiting employee decision notification */}
                  {awaitingDecisionAdjustment && (
                    <Box
                      sx={{
                        ...cardSx,
                        border: "1.5px solid",
                        borderColor: "warning.light",
                        bgcolor: "action.hover",
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle1" fontWeight={750}>
                          Notice Offer Sent · Awaiting Employee Decision
                        </Typography>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
                            gap: 1,
                            alignItems: "center",
                            p: 1.25,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box>
                            <Typography variant="caption" color="text.secondary">Current LWD</Typography>
                            <Typography fontWeight={800}>{new Date(exitCase.lastWorkingDate).toLocaleDateString()}</Typography>
                          </Box>
                          <Typography textAlign="center" color="text.secondary">→</Typography>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Offered LWD</Typography>
                            <Typography fontWeight={800} color="primary.main">
                              {new Date(awaitingDecisionAdjustment.requestedLastWorkingDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Alert severity="warning" sx={{ py: 0.5 }}>
                          HR-approved {awaitingDecisionAdjustment.type === "Buyout" ? "buyout" : "notice recovery"}:{" "}
                          <strong>₹{awaitingDecisionAdjustment.recoveryAmount.toLocaleString()}</strong> for{" "}
                          {awaitingDecisionAdjustment.shortfallDays} shortfall day(s). Exit completion remains on hold until the employee responds.
                        </Alert>
                      </Stack>
                    </Box>
                  )}

                  {/* Withdrawal decision if pending */}
                  {exitCase.withdrawal?.status === "Pending" &&
                    exitCase.permittedActions.includes("DecideWithdrawal") && (
                      <Box sx={{ ...cardSx, borderLeft: "4px solid", borderLeftColor: "warning.main" }}>
                        <Stack spacing={1.5}>
                          <Typography variant="subtitle1" fontWeight={750}>
                            Employee Requested Withdrawal
                          </Typography>
                          <Alert severity="warning">
                            Reason: {exitCase.withdrawal.reason || "No reason provided."}
                          </Alert>
                          <Stack direction={{ xs: "column", sm: "row" }} gap={1} justifyContent="flex-end">
                            <AppButton
                              color="error"
                              variant="outlined"
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
                              Decline withdrawal
                            </AppButton>
                            <AppButton
                              color="success"
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
                          </Stack>
                        </Stack>
                      </Box>
                    )}

                  {/* Joint Discussion Thread if Joint */}
                  {exitCase.discussionMode === "Joint" && (
                    <Box sx={{ ...cardSx, border: "1.5px solid", borderColor: "primary.light" }}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={750}>
                            Joint Discussion Thread
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {exitCase.discussionRequest || "A joint discussion was requested."}
                          </Typography>
                        </Box>
                        {exitCase.discussionMessages.map((message) => (
                          <Box
                            key={message.messageId}
                            sx={{ p: 1.25, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              {message.authorUserId === employeeUserId ? "Exiting Employee" : "Reviewer"} ·{" "}
                              {new Date(message.createdAtUtc).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>{message.message}</Typography>
                          </Box>
                        ))}
                        {canReplyToJointDiscussion && (
                          <Stack spacing={1}>
                            <TextField
                              size="small"
                              multiline
                              minRows={2}
                              label="Your contribution"
                              value={jointDiscussionReply}
                              onChange={(event) => setJointDiscussionReply(event.target.value)}
                            />
                            <Stack direction="row" justifyContent="flex-end">
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
                            </Stack>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Main Case Review / Approval Actions */}
                  {exitCase.permittedActions.some((action) =>
                    reviewActions.includes(action as ReviewAction),
                  ) && (
                    <Box sx={cardSx}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={750}>
                            Case Review & Approvals
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Add review feedback, initiate discussions or record an approval decision.
                          </Typography>
                        </Box>

                        {combinedManagerHrApproval && (
                          <Alert severity="info" sx={{ borderRadius: 2 }}>
                            You are the assigned reporting manager and an authorised HR reviewer. After any pending notice decision is resolved, one approval completes both review stages and starts the notice period.
                          </Alert>
                        )}

                        <TextField
                          size="small"
                          label="Decision or discussion note"
                          placeholder="Provide context or decision rationale..."
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
                            isOptionEqualToValue={(left, right) => left.userId === right.userId}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Invite colleagues to the joint discussion"
                                helperText="Selected colleagues receive in-app notification and join the discussion."
                              />
                            )}
                          />
                        )}

                        <Stack direction={{ xs: "column", sm: "row" }} gap={1} justifyContent="flex-end">
                          {reviewActions
                            .filter((action) => exitCase.permittedActions.includes(action))
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
                                  (["Discuss", "JointDiscussion", "RequestDiscussion"].includes(action) &&
                                    !notes.trim()) ||
                                  (action === "JointDiscussion" && discussionParticipants.length === 0) ||
                                  (action === "Approve" && Boolean(noticeAdjustmentBlockingApproval))
                                }
                                onClick={() => void review(action)}
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
                              ? "Resolve the notice-period request above before approving this case."
                              : "Waiting for the employee to accept or decline the notice-period offer above before this case can be approved."}
                          </Alert>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Document Generation Quick Actions */}
                  {exitCase.permittedActions.includes("GenerateDocuments") && (
                    <Box sx={cardSx}>
                      <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1 }}>
                        Quick Document Generation
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
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
                            Generate {type.replace(/([A-Z])/g, " $1")}
                          </AppButton>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              )}

              {/* TAB 1: CLEARANCES & OPERATIONS */}
              {activeTab === 1 && (
                <Stack spacing={2}>
                  {canManageOperationalWork ? (
                    <EmployeeExitOperationsPanel
                      exitCase={exitCase}
                      onRefresh={refresh}
                      managerOnly={!exitCase.permittedActions.includes("ManageClearance")}
                    />
                  ) : (
                    <Box sx={cardSx}>
                      <Alert severity="info">
                        Operational clearance tasks and exit readiness are enabled once the resignation reaches the Notice Period phase.
                      </Alert>
                    </Box>
                  )}
                </Stack>
              )}

              {/* TAB 2: FORMALITIES & SETTLEMENT */}
              {activeTab === 2 && (
                <Stack spacing={2}>
                  {/* Exit Interview Card */}
                  {exitCase.permittedActions.includes("RecordInterview") && (
                    <Box sx={cardSx}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={750}>
                            Exit Interview & Rehire Assessment
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Record exit interview discussion, rehire eligibility and attach notes.
                          </Typography>
                        </Box>

                        {exitCase.exitInterview?.hrNotes && (
                          <Alert severity="success" sx={{ py: 0.5 }}>
                            Saved{exitCase.exitInterview.conductedAtUtc ? ` on ${new Date(exitCase.exitInterview.conductedAtUtc).toLocaleDateString()}` : ""}:{" "}
                            {exitCase.exitInterview.hrNotes}
                          </Alert>
                        )}

                        {exitCase.evidence.filter((item) => item.category === "ExitInterview").length > 0 && (
                          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                              INTERVIEW ATTACHMENTS
                            </Typography>
                            {exitCase.evidence
                              .filter((item) => item.category === "ExitInterview")
                              .map((item) => (
                                <Stack key={item.evidenceId} direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                  <InsertDriveFileOutlined fontSize="small" color="primary" />
                                  <Typography variant="body2" fontWeight={650}>
                                    {item.fileName || "Interview file"}
                                  </Typography>
                                  <Chip size="small" label={item.status} sx={{ height: 20 }} />
                                </Stack>
                              ))}
                          </Box>
                        )}

                        <TextField
                          size="small"
                          multiline
                          minRows={3}
                          label={exitCase.exitInterview ? "Update interview notes" : "Interview notes"}
                          placeholder="Summarize reasons for departure, feedback and transition arrangements..."
                          value={interviewNotes}
                          onChange={(event) => setInterviewNotes(event.target.value)}
                        />

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={rehireEligible}
                              onChange={(event) => {
                                setRehireEligible(event.target.checked);
                                setRehireEligibilityChanged(true);
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={600}>
                              Mark employee eligible for future rehire
                            </Typography>
                          }
                        />

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                          <AppButton component="label" variant="outlined" size="small" disabled={saving}>
                            {interviewFile ? "Replace file" : "Attach interview file"}
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

                        <Stack direction="row" justifyContent="flex-end">
                          <AppButton
                            disabled={saving || (!interviewNotes.trim() && !interviewFile && !rehireEligibilityChanged)}
                            onClick={() => void saveInterview()}
                          >
                            {exitCase.exitInterview ? "Save update" : "Save interview"}
                          </AppButton>
                        </Stack>
                      </Stack>
                    </Box>
                  )}

                  {/* Rejoin Employee Card (if eligible) */}
                  {canRejoin && (
                    <Box sx={{ ...cardSx, border: "1.5px solid", borderColor: "success.light", bgcolor: "success.lighter" }}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={750} color="success.dark">
                            Rejoin Former Employee
                          </Typography>
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
                        <Stack direction="row" justifyContent="flex-end">
                          <AppButton
                            color="success"
                            variant="contained"
                            disabled={saving || !rejoinReason.trim()}
                            onClick={() => void rejoin()}
                          >
                            Rejoin employee
                          </AppButton>
                        </Stack>
                      </Stack>
                    </Box>
                  )}

                  {/* Transfer Work Ownership */}
                  {canManageOperationalWork && (
                    <Box sx={cardSx}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={750}>
                            Transfer Work Ownership
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Reassign active projects, client approvals, or department duties to active team members.
                          </Typography>
                        </Box>

                        {exitCase.responsibilityReassignments.length > 0 && (
                          <Stack spacing={0.75} sx={{ mb: 1 }}>
                            {exitCase.responsibilityReassignments.map((item, index) => (
                              <Chip
                                key={`${item.responsibility}-${index}`}
                                size="small"
                                color="success"
                                variant="outlined"
                                label={`${item.responsibility} → ${discussionCandidates.find((c) => c.userId === item.newOwnerUserId)?.fullName || "Assigned employee"}`}
                                sx={{ alignSelf: "flex-start", fontWeight: 600 }}
                              />
                            ))}
                          </Stack>
                        )}

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr auto" },
                            gap: 1.25,
                            alignItems: "start",
                          }}
                        >
                          <TextField
                            size="small"
                            label="Work to transfer"
                            placeholder="e.g. Client account sign-off, Repository admin"
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
                            isOptionEqualToValue={(left, right) => left.userId === right.userId}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="New owner"
                                placeholder="Choose an active colleague"
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
                    </Box>
                  )}

                  {/* Full & Final Settlement */}
                  {exitCase.permittedActions.includes("CalculateSettlement") && (
                    <Box sx={cardSx}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={750}>
                            Full & Final Settlement
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Calculated automatically from processed payroll through the employee's last working day.
                          </Typography>
                        </Box>

                        {exitCase.finalSettlement && (
                          <Alert severity="success" sx={{ py: 0.5 }}>
                            Status: <strong>{exitCase.finalSettlement.status}</strong> · Net payable:{" "}
                            <strong>₹{exitCase.finalSettlement.netPayable.toLocaleString()}</strong>{" "}
                            {exitCase.finalSettlement.sourcePayrollRunId
                              ? `· run ${exitCase.finalSettlement.sourcePayrollRunId}`
                              : exitCase.finalSettlement.sourcePayrollMonth
                                ? `· ${new Date(exitCase.finalSettlement.sourcePayrollMonth).toLocaleDateString(undefined, { month: "short", year: "numeric" })} payroll`
                                : ""}
                          </Alert>
                        )}

                        {exitCase.finalSettlement?.status !== "Paid" && (
                          <Stack direction="row" justifyContent="flex-end">
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
                            >
                              Calculate from payroll
                            </AppButton>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              )}

              {/* TAB 3: DOCUMENTS & FORMER PORTAL */}
              {activeTab === 3 && (
                <Stack spacing={2}>
                  {/* Former Employee Portal Management */}
                  {canManageFormerPortal && (
                    <Box
                      sx={{
                        ...cardSx,
                        borderColor: portalEnabled ? "success.light" : "divider",
                        bgcolor: portalEnabled ? "success.lighter" : "background.paper",
                      }}
                    >
                      <Stack spacing={1.75}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ sm: "center" }}
                          gap={1}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              sx={{
                                bgcolor: portalEnabled ? "success.main" : "primary.lighter",
                                color: portalEnabled ? "common.white" : "primary.main",
                              }}
                            >
                              {portalEnabled ? <CheckCircleOutline /> : <LockOutlined />}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={750}>
                                Former-Employee Portal Access
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Secure post-employment document download and limited requests via OTP
                              </Typography>
                            </Box>
                          </Stack>
                          <Chip
                            size="small"
                            color={portalEnabled ? "success" : "default"}
                            label={portalEnabled ? "Access Enabled" : "Access Disabled"}
                            sx={{ fontWeight: 700 }}
                          />
                        </Stack>

                        <Stepper
                          activeStep={portalEnabled ? 3 : personalEmailVerified ? 2 : 1}
                          alternativeLabel
                          sx={{
                            mt: 1,
                            "& .MuiStepLabel-label": { fontSize: { xs: 10, sm: 12 }, fontWeight: 650 },
                          }}
                        >
                          <Step completed={Boolean(portalEmail)}>
                            <StepLabel>Personal email</StepLabel>
                          </Step>
                          <Step completed={personalEmailVerified}>
                            <StepLabel>Verified</StepLabel>
                          </Step>
                          <Step completed={portalEnabled}>
                            <StepLabel>Portal enabled</StepLabel>
                          </Step>
                          <Step completed={portalEnabled}>
                            <StepLabel>OTP access</StepLabel>
                          </Step>
                        </Stepper>

                        <Alert
                          severity={portalEnabled ? "success" : personalEmailVerified ? "info" : "warning"}
                          sx={{ py: 0.5 }}
                        >
                          {portalEnabled ? (
                            <>
                              OTP sign-in is available for <strong>{portalEmail}</strong>.
                            </>
                          ) : personalEmailVerified ? (
                            <>
                              The personal email is verified. Enable the portal to allow OTP sign-in.
                            </>
                          ) : (
                            <>
                              OTP sign-in remains unavailable until the employee opens and verifies the post-exit email link.
                            </>
                          )}
                        </Alert>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
                          {!portalEnabled ? (
                            <AppButton
                              startIcon={<CheckCircleOutline />}
                              disabled={saving || !personalEmailVerified}
                              onClick={() => void enableFormerEmployeePortal()}
                            >
                              {personalEmailVerified ? "Enable portal access" : "Awaiting email verification"}
                            </AppButton>
                          ) : (
                            <>
                              <AppButton
                                variant="outlined"
                                startIcon={<MailOutline />}
                                disabled={saving}
                                onClick={() => void sendFormerEmployeePortalInvite()}
                              >
                                Send secure invitation
                              </AppButton>
                              <AppButton
                                color="error"
                                variant="outlined"
                                disabled={saving || !revokeReason.trim()}
                                onClick={() =>
                                  void run(
                                    () =>
                                      revokeFormerEmployeePortalAccess({
                                        employeeExitId: exitCase.employeeExitId,
                                        version: exitCase.version,
                                        reason: revokeReason.trim(),
                                      }),
                                    "Former-employee portal access disabled.",
                                  )
                                }
                              >
                                Disable portal
                              </AppButton>
                            </>
                          )}
                        </Stack>

                        {portalEnabled && (
                          <TextField
                            size="small"
                            fullWidth
                            label="Reason to disable portal access"
                            value={revokeReason}
                            onChange={(event) => setRevokeReason(event.target.value)}
                            helperText="A reason is required to revoke portal access."
                          />
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Former Employee Document Fulfillment */}
                  {exitCase.permittedActions.includes("ManageDocumentRequests") && (
                    <Box sx={cardSx}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={750}>
                            Former-Employee Document Fulfillment
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Prepare, verify and publish requested letters and statements to the former-employee portal.
                          </Typography>
                        </Box>

                        {/* Upload Draft Document Row */}
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "action.hover",
                            border: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 1.25,
                            alignItems: { md: "center" },
                          }}
                        >
                          <TextField
                            select
                            size="small"
                            label="Target request"
                            value={uploadRequestId}
                            onChange={(event) => setUploadRequestId(event.target.value)}
                            sx={{ minWidth: { md: 200 } }}
                          >
                            <MenuItem value="">Select an in-progress request</MenuItem>
                            {exitCase.formerEmployeeRequests
                              .filter((req) => req.status === "InProgress")
                              .map((req) => (
                                <MenuItem key={req.requestId} value={req.requestId}>
                                  {req.type.replace(/([A-Z])/g, " $1").trim()}
                                </MenuItem>
                              ))}
                          </TextField>
                          <TextField
                            size="small"
                            label="Category"
                            value={portalDocumentCategory}
                            onChange={(event) => setPortalDocumentCategory(event.target.value)}
                            sx={{ minWidth: { md: 180 } }}
                          />
                          <AppButton component="label" variant="outlined" size="small" disabled={saving}>
                            Choose file
                            <input
                              hidden
                              type="file"
                              onChange={(event) =>
                                setPortalDocumentFile(event.target.files?.[0] ?? null)
                              }
                            />
                          </AppButton>
                          <Typography
                            variant="body2"
                            color={portalDocumentFile ? "primary.dark" : "text.secondary"}
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {portalDocumentFile?.name ?? "No file selected"}
                          </Typography>
                          <AppButton
                            disabled={saving || !portalDocumentFile || !uploadRequestId}
                            onClick={() => void uploadPortalDocument()}
                          >
                            Upload document
                          </AppButton>
                        </Box>

                        {/* Verify / Select Draft Document Row */}
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems={{ md: "center" }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            value={issueEvidenceId}
                            onChange={(event) => setIssueEvidenceId(event.target.value)}
                            label="Uploaded draft to verify / publish"
                          >
                            <MenuItem value="">Select an uploaded draft file</MenuItem>
                            {exitCase.evidence
                              .filter(
                                (item) =>
                                  item.visibility === "EmployeeOnly" &&
                                  !item.issuedToFormerEmployeeAtUtc,
                              )
                              .map((item) => (
                                <MenuItem key={item.evidenceId} value={item.evidenceId}>
                                  {item.status} · {item.fileName ?? item.category}
                                </MenuItem>
                              ))}
                          </TextField>
                          {issueEvidenceId &&
                            exitCase.evidence.some(
                              (item) => item.evidenceId === issueEvidenceId && item.status !== "Verified",
                            ) && (
                              <AppButton
                                variant="outlined"
                                disabled={saving}
                                onClick={() =>
                                  void run(
                                    () =>
                                      verifyEmployeeExitEvidence({
                                        employeeExitId: exitCase.employeeExitId,
                                        evidenceId: issueEvidenceId,
                                        version: exitCase.version,
                                        verified: true,
                                      }),
                                    "Document verified and ready to publish.",
                                  )
                                }
                                sx={{ flexShrink: 0 }}
                              >
                                Verify document
                              </AppButton>
                            )}
                        </Stack>

                        <TextField
                          size="small"
                          label="Resolution or dispatch note"
                          placeholder="Note sent to the former employee alongside the issued document..."
                          value={requestNotes}
                          onChange={(event) => setRequestNotes(event.target.value)}
                        />

                        {/* Document Drafts & Issued Files (Overflow Fixed) */}
                        {exitCase.evidence.filter(
                          (item) => item.visibility === "EmployeeOnly" && item.status !== "Superseded",
                        ).length > 0 && (
                          <Box sx={{ pt: 1 }}>
                            <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1 }}>
                              Document Drafts & Issued Files
                            </Typography>
                            <Stack spacing={1}>
                              {exitCase.evidence
                                .filter(
                                  (item) =>
                                    item.visibility === "EmployeeOnly" &&
                                    item.status !== "Superseded",
                                )
                                .map((item) => (
                                  <Box
                                    key={item.evidenceId}
                                    sx={{
                                      p: 1.25,
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 2,
                                      bgcolor: "background.default",
                                      display: "flex",
                                      flexDirection: { xs: "column", sm: "row" },
                                      justifyContent: "space-between",
                                      alignItems: { xs: "flex-start", sm: "center" },
                                      gap: 1,
                                      minWidth: 0,
                                    }}
                                  >
                                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                                      <InsertDriveFileOutlined color="primary" sx={{ fontSize: 24, flexShrink: 0 }} />
                                      <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Tooltip title={item.fileName ?? item.category} arrow placement="top">
                                          <Typography
                                            variant="body2"
                                            fontWeight={700}
                                            sx={{
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                              display: "block",
                                            }}
                                          >
                                            {item.fileName ?? item.category}
                                          </Typography>
                                        </Tooltip>
                                        <Typography variant="caption" color="text.secondary">
                                          {item.status}
                                          {item.issuedToFormerEmployeeAtUtc ? " · Published to portal" : " · Draft"}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0, alignSelf: { xs: "flex-end", sm: "center" } }}>
                                      <AppButton
                                        size="small"
                                        variant="outlined"
                                        onClick={() => void openHrPortalDocument(item.evidenceId, item.fileName)}
                                      >
                                        Open
                                      </AppButton>
                                      <AppButton
                                        size="small"
                                        variant="outlined"
                                        onClick={() => void openHrPortalDocument(item.evidenceId, item.fileName, true)}
                                      >
                                        Download
                                      </AppButton>
                                      {!item.issuedToFormerEmployeeAtUtc && (
                                        <AppButton
                                          size="small"
                                          color="error"
                                          variant="outlined"
                                          disabled={saving}
                                          onClick={() =>
                                            void run(
                                              () =>
                                                supersedeEmployeeExitEvidence({
                                                  employeeExitId: exitCase.employeeExitId,
                                                  evidenceId: item.evidenceId,
                                                  version: exitCase.version,
                                                }),
                                              "Draft document deleted.",
                                            )
                                          }
                                        >
                                          Delete
                                        </AppButton>
                                      )}
                                    </Stack>
                                  </Box>
                                ))}
                            </Stack>
                          </Box>
                        )}

                        {/* List of Employee Document Requests */}
                        {exitCase.formerEmployeeRequests.length > 0 && (
                          <Box sx={{ pt: 1 }}>
                            <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1 }}>
                              Employee Requests ({exitCase.formerEmployeeRequests.length})
                            </Typography>
                            <Stack spacing={1}>
                              {exitCase.formerEmployeeRequests.map((request) => (
                                <Box
                                  key={request.requestId}
                                  sx={{
                                    p: 1.5,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    bgcolor: "background.default",
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    justifyContent: "space-between",
                                    alignItems: { xs: "flex-start", sm: "center" },
                                    gap: 1.25,
                                  }}
                                >
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="body2" fontWeight={750}>
                                      {request.type.replace(/([A-Z])/g, " $1").trim()} ·{" "}
                                      <Chip
                                        size="small"
                                        color={request.status === "Issued" ? "success" : request.status === "InProgress" ? "info" : "default"}
                                        label={request.status}
                                        sx={{ height: 20 }}
                                      />
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                                      {request.details || "No additional notes provided."}
                                    </Typography>
                                  </Box>
                                  {!["Issued", "Closed"].includes(request.status) && (
                                    <Stack direction={{ xs: "column", sm: "row" }} gap={1} alignItems="center" sx={{ flexShrink: 0 }}>
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
                                      {request.status === "InProgress" &&
                                        ({
                                          RelievingLetter: "RelievingLetter",
                                          ExperienceLetter: "ExperienceLetter",
                                          FnFStatement: "FinalSettlementStatement",
                                        } as const)[
                                          request.type as
                                            | "RelievingLetter"
                                            | "ExperienceLetter"
                                            | "FnFStatement"
                                        ] && (
                                          <AppButton
                                            size="small"
                                            variant="outlined"
                                            disabled={saving}
                                            onClick={() =>
                                              void run(
                                                () =>
                                                  generateEmployeeExitDocument({
                                                    employeeExitId: exitCase.employeeExitId,
                                                    requestId: request.requestId,
                                                    version: exitCase.version,
                                                    type: ({
                                                      RelievingLetter: "RelievingLetter",
                                                      ExperienceLetter: "ExperienceLetter",
                                                      FnFStatement: "FinalSettlementStatement",
                                                    } as const)[
                                                      request.type as
                                                        | "RelievingLetter"
                                                        | "ExperienceLetter"
                                                        | "FnFStatement"
                                                    ],
                                                  }),
                                                "Document generated. Select it above to preview or issue.",
                                              )
                                            }
                                          >
                                            Generate
                                          </AppButton>
                                        )}
                                      <AppButton
                                        size="small"
                                        disabled={
                                          saving ||
                                          request.status !== "InProgress" ||
                                          !issueEvidenceId ||
                                          !exitCase.evidence.some(
                                            (item) =>
                                              item.evidenceId === issueEvidenceId &&
                                              item.status === "Verified" &&
                                              item.visibility === "EmployeeOnly",
                                          )
                                        }
                                        onClick={() =>
                                          void run(
                                            () =>
                                              issueEmployeeExitDocument({
                                                employeeExitId: exitCase.employeeExitId,
                                                requestId: request.requestId,
                                                evidenceId: issueEvidenceId,
                                                version: exitCase.version,
                                                message: requestNotes.trim() || undefined,
                                              }),
                                            "Requested document published and the former employee notified.",
                                          )
                                        }
                                      >
                                        Attach selected & publish
                                      </AppButton>
                                    </Stack>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          </>
        )}
      </CustomisedModal>
    </>
  );
};
