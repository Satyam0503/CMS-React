import {
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CalendarMonthOutlined,
  CheckCircleOutline,
  CheckRounded,
  DescriptionOutlined,
  FactCheckOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  InsertDriveFileOutlined,
  RequestPageOutlined,
  TaskAltOutlined,
  TimelineOutlined,
  UndoOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  acknowledgeEmployeeExit,
  createEmployeeExitFormerEmployeeRequest,
  decideOwnEmployeeExitNoticeOffer,
  downloadEmployeeExitEvidence,
  getOwnEmployeeExitCase,
  getOwnEmployeeExitHistory,
  EmployeeExitCase,
  EmployeeExitHistory,
  requestEmployeeExitNoticeAdjustment,
  respondToEmployeeExitDiscussion,
  reviewEmployeeExitHandover,
  updateEmployeeExitPostExitContact,
  uploadEmployeeExitEvidence,
  withdrawOwnEmployeeExit,
} from "../../employees/employeeServices";
import { useUserDetails } from "../UserDataProvider";
import { useAppSelector } from "../../../Redux/hooks";
import { AppButton, CustomisedModal } from "../../../shared/components";
import { toast } from "react-toastify";

const ReviewJourney = () => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: "action.hover",
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography variant="caption" fontWeight={800} color="text.secondary">
      WHAT HAPPENS NEXT?
    </Typography>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 1, sm: 1.5 }}
      sx={{ mt: 1 }}
    >
      {[
        "Request submitted",
        "Manager / HR review",
        "Decision shared with you",
      ].map((step, index) => (
        <Stack
          key={step}
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flex: 1 }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
              bgcolor: "primary.lighter",
              color: "primary.main",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {index + 1}
          </Box>
          <Typography variant="body2" fontWeight={600}>
            {step}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Box>
);

export const EmployeeExitCaseCard = () => {
  const { userDetails, setRefresh } = useUserDetails();
  const permissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasOffboarding = permissions.some((p) => p.startsWith("Offboarding."));
  const [exitCase, setExitCase] = useState<EmployeeExitCase | null>(null);
  const [history, setHistory] = useState<EmployeeExitHistory[]>([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activePanel, setActivePanel] = useState<"notice" | "withdrawal" | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [discussionNotes, setDiscussionNotes] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [confirmPostExitContact, setConfirmPostExitContact] = useState(false);
  const [requestType, setRequestType] = useState<
    | "RelievingLetter"
    | "ExperienceLetter"
    | "FnFStatement"
    | "TaxDocument"
    | "Correction"
    | "Other"
  >("RelievingLetter");
  const [requestDetails, setRequestDetails] = useState("");
  const [evidenceCategory, setEvidenceCategory] = useState("Resignation");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [confirmEvidenceUpload, setConfirmEvidenceUpload] = useState(false);
  const [requestedLwd, setRequestedLwd] = useState("");
  const [noticeReason, setNoticeReason] = useState("");
  const [noticeRequestType, setNoticeRequestType] = useState("EmployeeEarlyRelease");

  useEffect(() => {
    if (!hasOffboarding || !userDetails.userId) {
      setExitCase(null);
      setHistory([]);
      return;
    }
    Promise.all([
      getOwnEmployeeExitCase(userDetails.userId),
      getOwnEmployeeExitHistory(userDetails.userId),
    ])
      .then(([response, historyResponse]) => {
        setExitCase(response.data.success ? response.data.methodResult : null);
        setHistory(
          historyResponse.data.success ? historyResponse.data.methodResult : [],
        );
      })
      .catch(() => {
        setExitCase(null);
        setHistory([]);
      });
  }, [hasOffboarding, userDetails.userId]);

  useEffect(() => {
    setPersonalEmail(exitCase?.postExitContact?.personalEmail ?? "");
  }, [exitCase?.employeeExitId, exitCase?.postExitContact?.personalEmail]);

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
  }, [
    exitCase?.employeeExitId,
    exitCase?.version,
    exitCase?.status,
    exitCase?.noticeAdjustments,
  ]);

  if (!hasOffboarding || !exitCase) return null;

  const withdraw = async () => {
    setWithdrawing(true);
    try {
      const response = await withdrawOwnEmployeeExit({
        employeeExitId: exitCase.employeeExitId,
        version: exitCase.version,
        reason: withdrawReason.trim() || undefined,
      });
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to withdraw resignation.",
        );
      toast.success("Your resignation has been withdrawn.");
      setExitCase(null);
      setRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to withdraw resignation.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const respondToDiscussion = async () => {
    setWithdrawing(true);
    try {
      const response = await respondToEmployeeExitDiscussion({
        employeeExitId: exitCase.employeeExitId,
        version: exitCase.version,
        notes: discussionNotes.trim() || undefined,
      });
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to respond to the discussion.",
        );
      const refreshed = await getOwnEmployeeExitCase(userDetails.userId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
      setDiscussionNotes("");
      toast.success("Your discussion response has been sent.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to respond to the discussion.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const savePostExitContact = async () => {
    setWithdrawing(true);
    try {
      const response = await updateEmployeeExitPostExitContact({
        employeeExitId: exitCase.employeeExitId,
        version: exitCase.version,
        personalEmail,
      });
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to save your post-exit contact.",
        );
      toast.success(
        exitCase.postExitContact?.personalEmail
          ? "Post-exit contact updated. Please verify the new email."
          : "Post-exit contact saved. Please verify the email sent to you.",
      );
      const refreshed = await getOwnEmployeeExitCase(userDetails.userId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save contact.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const acknowledge = async () => {
    setWithdrawing(true);
    try {
      const response = await acknowledgeEmployeeExit({
        employeeExitId: exitCase.employeeExitId,
        version: exitCase.version,
      });
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to record acknowledgement.",
        );
      toast.success("Acknowledgement recorded.");
      const refreshed = await getOwnEmployeeExitCase(userDetails.userId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to record acknowledgement.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const createRequest = async () => {
    setWithdrawing(true);
    try {
      const response = await createEmployeeExitFormerEmployeeRequest({
        employeeExitId: exitCase.employeeExitId,
        version: exitCase.version,
        type: requestType,
        details: requestDetails,
      });
      if (!response.data.success)
        throw new Error(response.data.message || "Unable to create request.");
      toast.success("Request sent to HR.");
      setRequestDetails("");
      const refreshed = await getOwnEmployeeExitCase(userDetails.userId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create request.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const uploadEvidence = async () => {
    if (!evidenceFile) return;
    setWithdrawing(true);
    try {
      const payload = new FormData();
      payload.append("employeeExitId", exitCase.employeeExitId);
      payload.append("category", evidenceCategory);
      payload.append("visibility", "EmployeeManagerHR");
      payload.append("file", evidenceFile);
      const response = await uploadEmployeeExitEvidence(payload);
      if (!response.data.success)
        throw new Error(response.data.message || "Unable to upload evidence.");
      toast.success("Evidence uploaded for review.");
      setEvidenceFile(null);
      const refreshed = await getOwnEmployeeExitCase(userDetails.userId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload evidence.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const openEvidence = async (
    evidenceId: string,
    action: "open" | "download",
    fileName?: string,
  ) => {
    const preview = action === "open" ? window.open("", "_blank") : null;
    try {
      const response = await downloadEmployeeExitEvidence(
        exitCase.employeeExitId,
        evidenceId,
      );
      const url = URL.createObjectURL(response.data);
      if (action === "open") {
        if (!preview) throw new Error("Preview window was blocked.");
        preview.opener = null;
        preview.location.href = url;
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "exit-evidence";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      preview?.close();
      toast.error(`Unable to ${action} this evidence file.`);
    }
  };

  const refreshCase = async () => {
    const refreshed = await getOwnEmployeeExitCase(userDetails.userId);
    setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
  };

  const requestNoticeAdjustment = async () => {
    if (!requestedLwd || !noticeReason.trim()) return;
    setWithdrawing(true);
    try {
      const response = await requestEmployeeExitNoticeAdjustment({
        employeeExitId: exitCase.employeeExitId,
        version: exitCase.version,
        type: noticeRequestType,
        requestedLastWorkingDate: requestedLwd,
        waivedDays: 0,
        recoveryAmount: 0,
        reason: noticeReason.trim(),
      });
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to submit notice adjustment.",
        );
      toast.success("Notice adjustment submitted for review.");
      setNoticeReason("");
      setActivePanel(null);
      await refreshCase();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit notice adjustment.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const submitHandover = async (handoverTaskId: string) => {
    setWithdrawing(true);
    try {
      const response = await reviewEmployeeExitHandover({
        employeeExitId: exitCase.employeeExitId,
        handoverTaskId,
        version: exitCase.version,
        action: "Submit",
      });
      if (!response.data.success)
        throw new Error(response.data.message || "Unable to submit handover.");
      toast.success("Handover task submitted for approval.");
      await refreshCase();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit handover.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const decideOffer = async (noticeAdjustmentId: string, accept: boolean) => {
    setWithdrawing(true);
    try {
      const response = await decideOwnEmployeeExitNoticeOffer({
        employeeExitId: exitCase.employeeExitId,
        noticeAdjustmentId,
        version: exitCase.version,
        accept,
      });
      if (!response.data.success)
        throw new Error(
          response.data.message || "Unable to record your decision.",
        );
      toast.success(
        accept
          ? "You accepted the notice-period offer. Your last working date has been updated."
          : "Offer declined. You will serve your original notice period.",
      );
      await refreshCase();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to record your decision.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const activeCase = exitCase.status !== "Withdrawn";
  const pendingNoticeHr = exitCase.noticeAdjustments.find(
    (item) => item.status === "Pending",
  );
  const pendingNoticeOffer = exitCase.noticeAdjustments.find(
    (item) => item.status === "AwaitingEmployeeDecision",
  );
  const pendingNotice = pendingNoticeOffer || pendingNoticeHr;
  const canWithdraw =
    exitCase.withdrawal?.status !== "Pending" &&
    (exitCase.permittedActions.includes("Withdraw") ||
      [
        "PendingManagerApproval",
        "PendingHrApproval",
        "DiscussionRequested",
        "NoticePeriod",
        "AwaitingEmployeeNoticeOffer",
      ].includes(exitCase.status));
  const canRequestNoticeChange = exitCase.status === "NoticePeriod";
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(exitCase.lastWorkingDate).getTime() - Date.now()) / 86400000,
    ),
  );
  const format = (value: string) => value.replace(/([A-Z])/g, " $1").trim();

  const cardSx = {
    p: { xs: 2, sm: 2.5 },
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2.5,
    bgcolor: "background.paper",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
    minWidth: 0,
  };

  const actionSx = {
    minHeight: 40,
    fontWeight: 700,
    width: { xs: "100%", sm: "auto" },
    borderRadius: 2,
    textTransform: "none",
  };

  const isExitComplete = ["Resigned", "Terminated"].includes(exitCase.status);
  const managerReviewCurrent = [
    "PendingManagerApproval",
    "DiscussionRequested",
  ].includes(exitCase.status);
  const managerReviewComplete =
    !managerReviewCurrent && exitCase.status !== "Withdrawn";
  const isInNoticePhase = [
    "NoticePeriod",
    "AwaitingEmployeeNoticeOffer",
  ].includes(exitCase.status);
  const hrReviewCurrent = exitCase.status === "PendingHrApproval";
  const hrReviewComplete = isExitComplete || isInNoticePhase;
  const noticePeriodCurrent = isInNoticePhase;
  const trackedItems = [...exitCase.clearances, ...exitCase.handoverTasks];
  const completedItems = trackedItems.filter((item) =>
    ["Completed", "Waived", "Approved"].includes(item.status),
  ).length;
  const taskProgress = trackedItems.length
    ? completedItems / trackedItems.length
    : hrReviewComplete
      ? 1
      : 0;
  const phaseProgress = Math.round(
    Math.min(
      100,
      15 +
        (managerReviewComplete ? 15 : 0) +
        (hrReviewComplete ? 15 : 0) +
        (noticePeriodCurrent || isExitComplete ? 20 : 0) +
        taskProgress * 25 +
        (isExitComplete ? 10 : 0),
    ),
  );
  const phases = [
    { label: "Request submitted", complete: true, current: false },
    {
      label: "Manager review",
      complete: managerReviewComplete,
      current: managerReviewCurrent,
    },
    {
      label: "HR review",
      complete: hrReviewComplete,
      current: hrReviewCurrent,
    },
    {
      label: "Notice period",
      complete: isExitComplete,
      current: noticePeriodCurrent,
    },
    { label: "Exit completed", complete: isExitComplete, current: false },
  ];

  const filteredHistory = history.filter(
    (item) => item.employeeExitId !== exitCase.employeeExitId,
  );

  return (
    <>
      <AppButton
        fullWidth
        variant="outlined"
        startIcon={activeCase ? <FactCheckOutlined /> : <HistoryOutlined />}
        onClick={() => setOpen(true)}
        sx={{ minHeight: 44, fontWeight: 700 }}
      >
        {activeCase ? "View offboarding case" : "View resignation history"}
      </AppButton>

      <CustomisedModal
        open={open}
        handleClose={() => !withdrawing && setOpen(false)}
        title={
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
            gap={1}
            sx={{ pr: 1 }}
          >
            <Box>
              <Typography component="h2" variant="h6" fontWeight={750}>
                Offboarding Centre
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Your exit journey · Track notice, handover & clearances
              </Typography>
            </Box>
            <Chip
              size="small"
              color={
                activeCase
                  ? pendingNoticeOffer
                    ? "warning"
                    : "primary"
                  : "default"
              }
              label={format(exitCase.status)}
              sx={{ alignSelf: { xs: "flex-start", sm: "auto" }, fontWeight: 700 }}
            />
          </Stack>
        }
        maxWidth="md"
        fullWidth
        allowMaximize
        paperSx={{
          width: { xs: "calc(100% - 16px)", md: 940 },
          maxWidth: "calc(100% - 16px)",
          maxHeight: "calc(100% - 18px)",
          overflow: "hidden",
          borderRadius: { xs: 2, sm: 3 },
        }}
        contentSx={{
          p: 0,
          bgcolor: "background.default",
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
      >
        {/* Navigation Tabs Header */}
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            pt: 1.5,
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
              icon={<TimelineOutlined sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Overview & Journey"
            />
            <Tab
              icon={<TaskAltOutlined sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <span>Tasks & Sign-off</span>
                  {exitCase.handoverTasks.length > 0 && (
                    <Chip
                      size="small"
                      label={exitCase.handoverTasks.length}
                      sx={{ height: 20, fontSize: "0.75rem" }}
                    />
                  )}
                </Stack>
              }
            />
            <Tab
              icon={<FolderOpenOutlined sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <span>Documents & Evidence</span>
                  {exitCase.evidence.length > 0 && (
                    <Chip
                      size="small"
                      label={exitCase.evidence.length}
                      sx={{ height: 20, fontSize: "0.75rem" }}
                    />
                  )}
                </Stack>
              }
            />
            {filteredHistory.length > 0 && (
              <Tab
                icon={<HistoryOutlined sx={{ fontSize: 20 }} />}
                iconPosition="start"
                label="History"
              />
            )}
          </Tabs>
        </Box>

        {/* Tab Content Panels */}
        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {/* TAB 0: OVERVIEW & JOURNEY */}
          {activeTab === 0 && (
            <Stack spacing={2}>
              {/* Stepper Progress Card */}
              <Box
                sx={{
                  ...cardSx,
                  borderTop: "3px solid",
                  borderTopColor: activeCase ? "primary.main" : "warning.main",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  gap={1}
                >
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.2 }}>
                      {activeCase ? "CASE PROGRESS" : "RESIGNATION RECORD"}
                    </Typography>
                    <Typography variant="h6" fontWeight={750}>
                      {activeCase ? "Your Exit Journey" : "Withdrawn Resignation"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeCase
                        ? "Track milestones, notice countdown and case approvals."
                        : `Original last working day: ${new Date(exitCase.lastWorkingDate).toLocaleDateString()}`}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color={activeCase ? "primary" : "warning"}
                    label={format(exitCase.status)}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>

                {activeCase && (
                  <Box
                    sx={{
                      overflowX: "auto",
                      mt: 2.5,
                      pb: 0.5,
                      "&::-webkit-scrollbar": { height: 6 },
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${phases.length}, minmax(104px, 1fr))`,
                        minWidth: 540,
                        gap: 0.5,
                      }}
                    >
                      {phases.map((phase, index) => (
                        <Stack
                          key={phase.label}
                          spacing={0.75}
                          alignItems="center"
                          sx={{
                            minWidth: 0,
                            position: "relative",
                            "&:not(:last-child)::after": {
                              content: '""',
                              position: "absolute",
                              zIndex: 0,
                              top: 15,
                              left: "calc(50% + 15px)",
                              width: "calc(100% - 30px)",
                              height: 2,
                              bgcolor: phase.complete ? "success.main" : "divider",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              display: "grid",
                              placeItems: "center",
                              position: "relative",
                              zIndex: 1,
                              borderRadius: "50%",
                              bgcolor: phase.complete
                                ? "success.main"
                                : phase.current
                                  ? "primary.main"
                                  : "background.paper",
                              color:
                                phase.complete || phase.current
                                  ? "common.white"
                                  : "text.secondary",
                              border: "1.5px solid",
                              borderColor:
                                phase.complete || phase.current
                                  ? "transparent"
                                  : "divider",
                              fontSize: 13,
                              fontWeight: 800,
                              boxShadow: phase.current
                                ? "0 0 0 4px color-mix(in srgb, var(--mui-palette-primary-main) 18%, transparent)"
                                : "none",
                            }}
                          >
                            {phase.complete ? (
                              <CheckRounded sx={{ fontSize: 18 }} />
                            ) : phase.current ? (
                              "•"
                            ) : (
                              index + 1
                            )}
                          </Box>
                          <Typography
                            variant="caption"
                            textAlign="center"
                            sx={{
                              lineHeight: 1.2,
                              fontWeight: phase.current ? 800 : 600,
                              color: phase.current ? "primary.main" : "text.secondary",
                              maxWidth: 96,
                            }}
                          >
                            {phase.label}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Status and Action Alert if offer pending */}
              {pendingNoticeOffer && (
                <Box
                  sx={{
                    ...cardSx,
                    border: "2px solid",
                    borderColor: "warning.main",
                    bgcolor: "warning.lighter",
                    boxShadow: "0 8px 24px rgba(237, 108, 2, 0.12)",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ sm: "flex-start" }}
                      gap={1}
                    >
                      <Box>
                        <Typography variant="overline" color="warning.dark" sx={{ fontWeight: 800 }}>
                          DECISION REQUIRED
                        </Typography>
                        <Typography variant="h6" fontWeight={750} color="warning.dark">
                          Notice Adjustment Offer
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          HR reviewed your request and prepared the following counter-offer. Please review and choose whether to accept.
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color="warning"
                        label="Action required"
                        sx={{ fontWeight: 800 }}
                      />
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
                        gap: 1.5,
                        alignItems: "center",
                        p: 1.5,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Current Last Working Day
                        </Typography>
                        <Typography variant="body1" fontWeight={750}>
                          {new Date(exitCase.lastWorkingDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography
                        color="text.secondary"
                        sx={{ display: { xs: "none", sm: "block" }, fontWeight: 700 }}
                      >
                        →
                      </Typography>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Proposed Last Working Day
                        </Typography>
                        <Typography variant="body1" fontWeight={750} color="primary.main">
                          {new Date(pendingNoticeOffer.requestedLastWorkingDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="success.main" fontWeight={600}>
                          {pendingNoticeOffer.shortfallDays} day(s) earlier
                        </Typography>
                      </Box>
                    </Box>

                    {pendingNoticeOffer.reason && (
                      <Alert severity="info" sx={{ py: 0.5 }}>
                        <strong>Offer details:</strong> {pendingNoticeOffer.reason}
                      </Alert>
                    )}

                    {pendingNoticeOffer.recoveryAmount > 0 && (
                      <Alert severity="warning" sx={{ py: 0.5 }}>
                        Settlement adjustment: <strong>₹{pendingNoticeOffer.recoveryAmount.toLocaleString()}</strong> (
                        {pendingNoticeOffer.type === "Buyout" ? "Buyout receivable" : "Notice recovery deduction"}
                        ).
                      </Alert>
                    )}

                    <Stack
                      direction={{ xs: "column-reverse", sm: "row" }}
                      justifyContent="flex-end"
                      gap={1}
                      sx={{ pt: 1 }}
                    >
                      <AppButton
                        variant="outlined"
                        color="inherit"
                        disabled={withdrawing}
                        onClick={() =>
                          void decideOffer(pendingNoticeOffer.noticeAdjustmentId, false)
                        }
                        sx={actionSx}
                      >
                        Keep original notice
                      </AppButton>
                      <AppButton
                        color="primary"
                        variant="contained"
                        disabled={withdrawing}
                        onClick={() =>
                          void decideOffer(pendingNoticeOffer.noticeAdjustmentId, true)
                        }
                        sx={actionSx}
                      >
                        Accept offer
                      </AppButton>
                    </Stack>
                  </Stack>
                </Box>
              )}

              {/* Notice Period Metrics Grid */}
              {activeCase && (
                <Box sx={cardSx}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ sm: "center" }}
                    gap={1}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={750}>
                        Notice Period & Timeline
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Key dates, clearance milestones and status updates.
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`${daysRemaining} day(s) remaining`}
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 2,
                    }}
                  >
                    {/* Metric 1: LWD */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: "primary.lighter",
                            color: "primary.main",
                            width: 44,
                            height: 44,
                          }}
                        >
                          <CalendarMonthOutlined />
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            LAST WORKING DAY
                          </Typography>
                          <Typography variant="h6" fontWeight={750} sx={{ lineHeight: 1.2 }}>
                            {new Date(exitCase.lastWorkingDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {daysRemaining > 0
                              ? `${daysRemaining} calendar day(s) left`
                              : "Last working day reached"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Metric 2: Progress */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          OVERALL PROGRESS
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                          {phaseProgress}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={phaseProgress}
                        sx={{
                          height: 8,
                          borderRadius: 99,
                          my: 1.25,
                          "& .MuiLinearProgress-bar": { borderRadius: 99 },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {trackedItems.length > 0
                          ? `${completedItems} of ${trackedItems.length} checklist/handover items completed`
                          : "No clearance tasks assigned yet"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Current Requests Callout */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "action.hover",
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <CheckCircleOutline
                        color={
                          pendingNotice || exitCase.withdrawal?.status === "Pending"
                            ? "warning"
                            : "success"
                        }
                        fontSize="small"
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {pendingNoticeOffer
                          ? "Notice adjustment offer awaiting your decision above."
                          : pendingNoticeHr
                            ? "Notice change request awaiting HR review."
                            : exitCase.withdrawal?.status === "Pending"
                              ? "Withdrawal request awaiting manager / HR review."
                              : "No active notice or withdrawal requests."}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Quick Actions Buttons */}
                  {(canRequestNoticeChange || canWithdraw) && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1.25 }}>
                        Quick Actions
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
                        {canRequestNoticeChange && (
                          <AppButton
                            variant={activePanel === "notice" ? "contained" : "outlined"}
                            startIcon={<RequestPageOutlined />}
                            disabled={Boolean(pendingNotice)}
                            onClick={() =>
                              setActivePanel((prev) => (prev === "notice" ? null : "notice"))
                            }
                            sx={{ ...actionSx, flex: 1 }}
                          >
                            Request notice change
                          </AppButton>
                        )}
                        {canWithdraw && (
                          <AppButton
                            startIcon={<UndoOutlined />}
                            color="error"
                            variant={activePanel === "withdrawal" ? "contained" : "outlined"}
                            onClick={() =>
                              setActivePanel((prev) => (prev === "withdrawal" ? null : "withdrawal"))
                            }
                            sx={{ ...actionSx, flex: 1 }}
                          >
                            Request withdrawal
                          </AppButton>
                        )}
                      </Stack>
                    </>
                  )}
                </Box>
              )}

              {/* Notice Change Expandable Form */}
              {activePanel === "notice" && !pendingNotice && (
                <Box
                  sx={{
                    ...cardSx,
                    border: "1.5px solid",
                    borderColor: "primary.main",
                    animation: "fadeIn .25s ease",
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={750}>
                        Request Notice Change
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Request an earlier or modified last working day. HR will review your request.
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        SELECT REQUEST TYPE
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                          },
                          gap: 1.25,
                        }}
                      >
                        {[
                          [
                            "EmployeeEarlyRelease",
                            "Early release",
                            "Leave before your scheduled LWD",
                          ],
                          [
                            "FullWaiver",
                            "Notice waiver",
                            "Request a partial or full shortfall waiver",
                          ],
                          [
                            "Buyout",
                            "Buyout",
                            "Request release against recovery / buyout",
                          ],
                          [
                            "NoticeExtension",
                            "Notice extension",
                            "Request a later last working day",
                          ],
                        ].map(([value, title, detail]) => (
                          <Box
                            key={value}
                            role="button"
                            tabIndex={0}
                            onClick={() => setNoticeRequestType(value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ")
                                setNoticeRequestType(value);
                            }}
                            sx={{
                              p: 1.5,
                              border: "1.5px solid",
                              borderColor:
                                noticeRequestType === value
                                  ? "primary.main"
                                  : "divider",
                              borderRadius: 2,
                              cursor: "pointer",
                              bgcolor:
                                noticeRequestType === value
                                  ? "primary.lighter"
                                  : "background.paper",
                              transition: "all .15s ease",
                              "&:hover": {
                                borderColor: "primary.main",
                              },
                            }}
                          >
                            <Typography variant="body2" fontWeight={750}>
                              {title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {detail}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <TextField
                      size="small"
                      type="date"
                      label="Requested last working date"
                      value={requestedLwd}
                      onChange={(event) => setRequestedLwd(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                      size="small"
                      label="Reason for request"
                      placeholder="Please provide context for HR review..."
                      value={noticeReason}
                      onChange={(event) => setNoticeReason(event.target.value)}
                      multiline
                      minRows={3}
                    />

                    <Stack
                      direction={{ xs: "column-reverse", sm: "row" }}
                      justifyContent="flex-end"
                      gap={1}
                    >
                      <AppButton
                        variant="text"
                        onClick={() => setActivePanel(null)}
                        sx={actionSx}
                      >
                        Cancel
                      </AppButton>
                      <AppButton
                        disabled={
                          withdrawing || !requestedLwd || !noticeReason.trim()
                        }
                        onClick={() => void requestNoticeAdjustment()}
                        sx={actionSx}
                      >
                        Submit request
                      </AppButton>
                    </Stack>
                  </Stack>
                </Box>
              )}

              {/* Withdrawal Request Expandable Form */}
              {activePanel === "withdrawal" && canWithdraw && (
                <Box
                  sx={{
                    ...cardSx,
                    border: "1.5px solid",
                    borderColor: "error.main",
                    animation: "fadeIn .25s ease",
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={750} color="error.main">
                        Request Resignation Withdrawal
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Submit a request to cancel your resignation and remain with the organization.
                      </Typography>
                    </Box>

                    {exitCase.status === "NoticePeriod" && (
                      <Alert severity="info">
                        Review required — your resignation remains active until a manager or HR reviewer approves this withdrawal.
                      </Alert>
                    )}

                    <TextField
                      size="small"
                      label="Reason for withdrawal (optional)"
                      placeholder="Explain what changed or your reasons for staying..."
                      value={withdrawReason}
                      onChange={(event) => setWithdrawReason(event.target.value)}
                      multiline
                      minRows={3}
                    />

                    <ReviewJourney />

                    <Stack
                      direction={{ xs: "column-reverse", sm: "row" }}
                      justifyContent="flex-end"
                      gap={1}
                    >
                      <AppButton
                        variant="text"
                        onClick={() => setActivePanel(null)}
                        sx={actionSx}
                      >
                        Cancel
                      </AppButton>
                      <AppButton
                        color="error"
                        variant="contained"
                        disabled={withdrawing}
                        onClick={() => void withdraw()}
                        sx={actionSx}
                      >
                        Submit withdrawal request
                      </AppButton>
                    </Stack>
                  </Stack>
                </Box>
              )}

              {/* Discussion Response Form if discussion requested */}
              {exitCase.status === "DiscussionRequested" && (
                <Box sx={{ ...cardSx, border: "1px solid", borderColor: "info.light" }}>
                  <Stack spacing={1.5}>
                    <Alert severity="info">
                      Your manager or HR has requested a discussion before concluding this resignation step.
                    </Alert>
                    <TextField
                      size="small"
                      multiline
                      minRows={2}
                      label="Your discussion response"
                      value={discussionNotes}
                      onChange={(event) => setDiscussionNotes(event.target.value)}
                    />
                    <Stack direction="row" justifyContent="flex-end">
                      <AppButton
                        disabled={withdrawing || !discussionNotes.trim()}
                        onClick={() => void respondToDiscussion()}
                        sx={actionSx}
                      >
                        Send response
                      </AppButton>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Stack>
          )}

          {/* TAB 1: TASKS & SIGN-OFF */}
          {activeTab === 1 && (
            <Stack spacing={2}>
              {/* Handover Tasks Section */}
              <Box sx={cardSx}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="h6" fontWeight={750}>
                      Handover Tasks
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submit each assigned task for manager sign-off before your last working day.
                    </Typography>
                  </Box>

                  {exitCase.handoverTasks.length === 0 ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <TaskAltOutlined sx={{ fontSize: 36, color: "text.disabled", mb: 0.5 }} />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        No handover tasks currently assigned
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Your manager or HR will assign specific handover requirements if needed.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {exitCase.handoverTasks.map((task) => (
                        <Stack
                          key={task.handoverTaskId}
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ sm: "center" }}
                          gap={1}
                          sx={{
                            p: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            bgcolor: "background.default",
                          }}
                        >
                          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                            <TaskAltOutlined
                              color={task.status === "Approved" ? "success" : "action"}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={700}>
                                {task.title}
                              </Typography>
                              {task.details && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                  {task.details}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                            <Chip
                              size="small"
                              color={
                                task.status === "Approved"
                                  ? "success"
                                  : task.status === "Submitted"
                                    ? "info"
                                    : "default"
                              }
                              label={task.status}
                            />
                            {exitCase.permittedActions.includes("SubmitHandover") &&
                              !["Submitted", "Approved", "Waived"].includes(task.status) && (
                                <AppButton
                                  size="small"
                                  variant="outlined"
                                  disabled={withdrawing}
                                  onClick={() => void submitHandover(task.handoverTaskId)}
                                >
                                  Submit
                                </AppButton>
                              )}
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Box>

              {/* Balanced 2-Column Grid: Contact & Acknowledge */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                {/* Post-exit contact card */}
                <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
                  <Stack spacing={1.5} sx={{ flex: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={750}>
                        Post-Exit Contact Email
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        A personal email for important follow-up, tax forms and former-employee access.
                      </Typography>
                    </Box>

                    {exitCase.postExitContact?.personalEmail && (
                      <Alert
                        severity={
                          exitCase.postExitContact.personalEmailVerified
                            ? "success"
                            : "info"
                        }
                        sx={{ py: 0.5 }}
                      >
                        Saved: <strong>{exitCase.postExitContact.personalEmail}</strong>
                        {exitCase.postExitContact.personalEmailVerified
                          ? " (verified)"
                          : " (verification pending)"}
                      </Alert>
                    )}

                    <TextField
                      size="small"
                      type="email"
                      label="Personal email"
                      placeholder="name@personal.com"
                      value={personalEmail}
                      disabled={
                        Boolean(exitCase.postExitContact?.personalEmail) &&
                        !confirmPostExitContact
                      }
                      onChange={(event) => setPersonalEmail(event.target.value)}
                    />

                    <Box sx={{ mt: "auto", pt: 1 }}>
                      {exitCase.postExitContact?.personalEmail &&
                      !confirmPostExitContact ? (
                        <AppButton
                          variant="outlined"
                          disabled={withdrawing}
                          onClick={() => setConfirmPostExitContact(true)}
                          sx={actionSx}
                        >
                          Edit contact
                        </AppButton>
                      ) : (
                        <AppButton
                          variant="outlined"
                          disabled={withdrawing || !personalEmail.trim()}
                          onClick={() =>
                            exitCase.postExitContact?.personalEmail
                              ? setConfirmPostExitContact(true)
                              : void savePostExitContact()
                          }
                          sx={actionSx}
                        >
                          Save contact
                        </AppButton>
                      )}
                    </Box>
                  </Stack>
                </Box>

                {/* Acknowledge summary card */}
                <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
                  <Stack spacing={1.5} sx={{ flex: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={750}>
                        Acknowledge Exit Terms
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Confirm that you have reviewed your exit details, handover tasks and notice responsibilities.
                      </Typography>
                    </Box>

                    <Alert severity="info" sx={{ py: 0.5 }}>
                      Acknowledging records your confirmation in the case audit trail and notifies HR.
                    </Alert>

                    <Box sx={{ mt: "auto", pt: 1 }}>
                      <AppButton
                        variant="contained"
                        disabled={withdrawing}
                        onClick={() => void acknowledge()}
                        sx={actionSx}
                      >
                        Acknowledge summary
                      </AppButton>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Stack>
          )}

          {/* TAB 2: DOCUMENTS & EVIDENCE */}
          {activeTab === 2 && (
            <Stack spacing={2}>
              {/* Upload Exit Evidence Card */}
              <Box sx={cardSx}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.lighter", color: "primary.main" }}>
                      <FileUploadOutlined />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={750}>
                        Upload Exit Evidence
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        PDF, PNG, JPG or email message. HR verifies required documents before exit completion.
                      </Typography>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "minmax(220px, 1fr) 2fr" },
                      gap: 1.5,
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      select
                      size="small"
                      label="Evidence category"
                      value={evidenceCategory}
                      onChange={(event) =>
                        setEvidenceCategory(event.target.value)
                      }
                    >
                      {[
                        ["Resignation", "Resignation document / confirmation"],
                        ["Medical", "Medical certificate"],
                        ["Handover", "Handover clearance note"],
                        ["Other", "Other exit evidence"],
                      ].map(([catKey, catLabel]) => (
                        <MenuItem key={catKey} value={catKey}>
                          {catLabel}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Box
                      sx={{
                        p: 1.5,
                        border: "1.5px dashed",
                        borderColor: evidenceFile ? "primary.main" : "divider",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        bgcolor: evidenceFile ? "primary.lighter" : "background.default",
                        minWidth: 0,
                      }}
                    >
                      <AppButton
                        component="label"
                        variant="outlined"
                        size="small"
                        disabled={withdrawing}
                        sx={{ flexShrink: 0 }}
                      >
                        Choose file
                        <input
                          hidden
                          type="file"
                          accept="application/pdf,image/png,image/jpeg,message/rfc822"
                          onChange={(event) =>
                            setEvidenceFile(event.target.files?.[0] || null)
                          }
                        />
                      </AppButton>
                      <Typography
                        variant="body2"
                        color={evidenceFile ? "primary.dark" : "text.secondary"}
                        sx={{
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {evidenceFile
                          ? evidenceFile.name
                          : "Supported formats: PDF, PNG, JPG (Max 25MB)"}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" justifyContent="flex-end">
                    <AppButton
                      disabled={
                        withdrawing || !evidenceFile || !evidenceCategory.trim()
                      }
                      onClick={() => setConfirmEvidenceUpload(true)}
                      sx={actionSx}
                    >
                      Review & submit
                    </AppButton>
                  </Stack>

                  {/* Submitted Evidence List (Overflow Fixed) */}
                  {exitCase.evidence.length > 0 && (
                    <Box sx={{ pt: 1 }}>
                      <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1 }}>
                        Submitted Evidence ({exitCase.evidence.length})
                      </Typography>
                      <Stack spacing={1}>
                        {exitCase.evidence.map((item) => (
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
                            <Stack
                              direction="row"
                              spacing={1.25}
                              alignItems="center"
                              sx={{ minWidth: 0, flex: 1 }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: "primary.lighter",
                                  color: "primary.main",
                                  width: 36,
                                  height: 36,
                                  flexShrink: 0,
                                }}
                              >
                                <InsertDriveFileOutlined fontSize="small" />
                              </Avatar>
                              <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                                <Tooltip
                                  title={item.fileName || item.category}
                                  arrow
                                  placement="top"
                                >
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
                                    {item.fileName || item.category}
                                  </Typography>
                                </Tooltip>
                                <Typography variant="caption" color="text.secondary">
                                  {item.category} · {item.status}
                                </Typography>
                              </Box>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ flexShrink: 0, alignSelf: { xs: "flex-end", sm: "center" } }}
                            >
                              <AppButton
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityOutlined />}
                                onClick={() =>
                                  void openEvidence(
                                    item.evidenceId,
                                    "open",
                                    item.fileName,
                                  )
                                }
                              >
                                Open
                              </AppButton>
                              <AppButton
                                size="small"
                                variant="outlined"
                                startIcon={<FileDownloadOutlined />}
                                onClick={() =>
                                  void openEvidence(
                                    item.evidenceId,
                                    "download",
                                    item.fileName,
                                  )
                                }
                              >
                                Download
                              </AppButton>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Request Documents from HR */}
              <Box sx={cardSx}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: "info.lighter", color: "info.main" }}>
                      <DescriptionOutlined />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={750}>
                        Request Documents from HR
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Request formal post-employment letters (Relieving letter, Experience certificate, etc.)
                      </Typography>
                    </Box>
                  </Stack>

                  <TextField
                    select
                    size="small"
                    label="Document type"
                    value={requestType}
                    onChange={(event) =>
                      setRequestType(event.target.value as typeof requestType)
                    }
                  >
                    {[
                      "RelievingLetter",
                      "ExperienceLetter",
                      "FnFStatement",
                      "TaxDocument",
                      "Correction",
                      "Other",
                    ].map((value) => (
                      <MenuItem key={value} value={value}>
                        {format(value)}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    size="small"
                    label="Additional details / context"
                    placeholder="Provide any specific requirements or dispatch address..."
                    value={requestDetails}
                    onChange={(event) => setRequestDetails(event.target.value)}
                    multiline
                    minRows={2}
                  />

                  <Stack direction="row" justifyContent="flex-end">
                    <AppButton
                      disabled={withdrawing || !requestDetails.trim()}
                      onClick={() => void createRequest()}
                      sx={actionSx}
                    >
                      Send to HR
                    </AppButton>
                  </Stack>

                  {/* Document Requests List */}
                  {exitCase.formerEmployeeRequests.length > 0 && (
                    <Box sx={{ pt: 1 }}>
                      <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1 }}>
                        Your Document Requests ({exitCase.formerEmployeeRequests.length})
                      </Typography>
                      <Stack spacing={1}>
                        {exitCase.formerEmployeeRequests.map((request) => {
                          const document = request.evidenceId
                            ? exitCase.evidence.find(
                                (item) =>
                                  item.evidenceId === request.evidenceId &&
                                  item.issuedToFormerEmployeeAtUtc,
                              )
                            : undefined;
                          return (
                            <Box
                              key={request.requestId}
                              sx={{
                                p: 1.5,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                bgcolor: "background.default",
                              }}
                            >
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ sm: "center" }}
                                gap={1}
                              >
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="body2" fontWeight={750}>
                                    {format(request.type)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Requested{" "}
                                    {new Date(request.requestedAtUtc).toLocaleString()}
                                    {request.status === "InProgress"
                                      ? " · HR is preparing your document"
                                      : ""}
                                    {request.issuedAtUtc
                                      ? ` · Issued ${new Date(request.issuedAtUtc).toLocaleDateString()}`
                                      : ""}
                                  </Typography>
                                </Box>
                                <Chip
                                  size="small"
                                  color={
                                    request.status === "Issued"
                                      ? "success"
                                      : request.status === "InProgress"
                                        ? "info"
                                        : "default"
                                  }
                                  label={format(request.status)}
                                  sx={{ fontWeight: 700 }}
                                />
                              </Stack>

                              {document && (
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  sx={{ mt: 1.25, pt: 1, borderTop: "1px solid", borderColor: "divider" }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="success.main"
                                    fontWeight={700}
                                    sx={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                  >
                                    Ready: {document.fileName || "Issued document"}
                                  </Typography>
                                  <AppButton
                                    size="small"
                                    variant="outlined"
                                    startIcon={<VisibilityOutlined />}
                                    onClick={() =>
                                      void openEvidence(
                                        document.evidenceId,
                                        "open",
                                        document.fileName,
                                      )
                                    }
                                  >
                                    Open
                                  </AppButton>
                                  <AppButton
                                    size="small"
                                    variant="outlined"
                                    startIcon={<FileDownloadOutlined />}
                                    onClick={() =>
                                      void openEvidence(
                                        document.evidenceId,
                                        "download",
                                        document.fileName,
                                      )
                                    }
                                  >
                                    Download
                                  </AppButton>
                                </Stack>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}

          {/* TAB 3: RESIGNATION HISTORY (if present) */}
          {activeTab === 3 && filteredHistory.length > 0 && (
            <Box sx={cardSx}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="h6" fontWeight={750}>
                    Withdrawn Resignation History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Record of previous resignation requests and withdrawals.
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  {filteredHistory.map((item) => (
                    <Box
                      key={item.employeeExitId}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={0.5}>
                        <Typography variant="body2" fontWeight={750}>
                          Requested LWD: {new Date(item.lastWorkingDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Submitted: {new Date(item.initiatedAtUtc).toLocaleDateString()}
                        </Typography>
                      </Stack>
                      {item.withdrawalReason && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Reason: {item.withdrawalReason}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Box>
          )}
        </Box>

        {/* MODAL: Post-exit contact confirmation */}
        <CustomisedModal
          open={
            confirmPostExitContact &&
            Boolean(exitCase.postExitContact?.personalEmail)
          }
          handleClose={() => !withdrawing && setConfirmPostExitContact(false)}
          title="Update post-exit contact"
          maxWidth="xs"
          fullWidth
        >
          <Stack spacing={1.5}>
            <Alert severity="warning">
              Changing this email requires verification again before
              former-employee portal access can be enabled.
            </Alert>
            <TextField
              size="small"
              type="email"
              label="New personal email"
              value={personalEmail}
              onChange={(event) => setPersonalEmail(event.target.value)}
              autoFocus
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <AppButton
                variant="text"
                disabled={withdrawing}
                onClick={() => {
                  setPersonalEmail(
                    exitCase.postExitContact?.personalEmail ?? "",
                  );
                  setConfirmPostExitContact(false);
                }}
              >
                Cancel
              </AppButton>
              <AppButton
                disabled={
                  withdrawing ||
                  !personalEmail.trim() ||
                  personalEmail.trim().toLowerCase() ===
                    exitCase.postExitContact?.personalEmail?.toLowerCase()
                }
                onClick={() => {
                  setConfirmPostExitContact(false);
                  void savePostExitContact();
                }}
              >
                Confirm update
              </AppButton>
            </Stack>
          </Stack>
        </CustomisedModal>

        {/* MODAL: Evidence upload confirmation */}
        <CustomisedModal
          open={confirmEvidenceUpload}
          handleClose={() => !withdrawing && setConfirmEvidenceUpload(false)}
          title="Submit exit evidence?"
          maxWidth="xs"
          fullWidth
        >
          <Stack spacing={1.5}>
            <Alert severity="info">
              HR will be able to open, download and verify this file. It is not
              accepted for completion until HR marks it verified.
            </Alert>
            <Typography variant="body2">
              <strong>Category:</strong> {evidenceCategory}
              <br />
              <strong>File:</strong> {evidenceFile?.name}
            </Typography>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <AppButton
                variant="text"
                disabled={withdrawing}
                onClick={() => setConfirmEvidenceUpload(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                disabled={withdrawing || !evidenceFile}
                onClick={() => {
                  setConfirmEvidenceUpload(false);
                  void uploadEvidence();
                }}
              >
                Submit evidence
              </AppButton>
            </Stack>
          </Stack>
        </CustomisedModal>
      </CustomisedModal>
    </>
  );
};
