import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CalendarMonthOutlined,
  CheckRounded,
  ExpandMoreOutlined,
  FactCheckOutlined,
  FileUploadOutlined,
  HistoryOutlined,
  PendingActionsOutlined,
  RequestPageOutlined,
  TaskAltOutlined,
  UndoOutlined,
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
import { AppButton, CustomisedModal } from "../../../shared/components";
import { toast } from "react-toastify";

const ReviewJourney = () => (
  <Box
    sx={{
      p: 1.25,
      borderRadius: 2,
      bgcolor: "action.hover",
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography variant="caption" fontWeight={800}>
      What happens next?
    </Typography>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0.75, sm: 1.25 }}
      sx={{ mt: 0.9 }}
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
          spacing={0.65}
          sx={{ flex: 1 }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
              bgcolor: "primary.lighter",
              color: "primary.main",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {index + 1}
          </Box>
          <Typography variant="caption" fontWeight={600}>
            {step}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Box>
);

export const EmployeeExitCaseCard = () => {
  const { userDetails, setRefresh } = useUserDetails();
  const [exitCase, setExitCase] = useState<EmployeeExitCase | null>(null);
  const [history, setHistory] = useState<EmployeeExitHistory[]>([]);
  const [open, setOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "notice" | "withdrawal" | null
  >(null);
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
  const [noticeRequestType, setNoticeRequestType] = useState(
    "EmployeeEarlyRelease",
  );
  useEffect(() => {
    if (!userDetails.userId) return;
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
  }, [userDetails.userId]);
  useEffect(() => {
    setPersonalEmail(exitCase?.postExitContact?.personalEmail ?? "");
  }, [exitCase?.employeeExitId, exitCase?.postExitContact?.personalEmail]);
  useEffect(() => {
    const hasEmployeeOffer =
      exitCase?.status === "AwaitingEmployeeNoticeOffer" &&
      exitCase.noticeAdjustments.some(
        (item) => item.status === "AwaitingEmployeeDecision",
      );
    if (hasEmployeeOffer) setOpen(true);
  }, [exitCase?.employeeExitId, exitCase?.version, exitCase?.status]);
  if (!exitCase) return null;
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
      toast.success("Handover submitted for approval.");
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
          ? "You accepted the notice-period offer."
          : "You will serve your original notice period.",
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
  const pendingNotice = exitCase.noticeAdjustments.find((item) =>
    ["Pending", "AwaitingEmployeeDecision"].includes(item.status),
  );
  const canWithdraw =
    exitCase.withdrawal?.status !== "Pending" &&
    (exitCase.permittedActions.includes("Withdraw") ||
      [
        "PendingManagerApproval",
        "PendingHrApproval",
        "DiscussionRequested",
        "NoticePeriod",
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
    p: { xs: 1.5, sm: 2 },
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    bgcolor: "background.paper",
    boxShadow: "0 6px 18px rgba(20, 84, 92, .045)",
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
  const hrReviewCurrent = exitCase.status === "PendingHrApproval";
  const hrReviewComplete = isExitComplete || exitCase.status === "NoticePeriod";
  const noticePeriodCurrent = exitCase.status === "NoticePeriod";
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
          <Stack spacing={0.25}>
              <Typography component="h2" variant="h6" fontWeight={700}>
              Offboarding Centre
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your exit journey
            </Typography>
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
        }}
        contentSx={{
          px: { xs: 1.5, sm: 2.5 },
          py: 2,
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
      >
        <Stack spacing={2}>
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
              gap={1}
            >
              <Box>
                <Typography variant="overline" color="text.secondary">
                  {activeCase ? "Current case" : "Resignation record"}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {activeCase
                    ? "Your exit journey"
                    : "Latest withdrawn resignation"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeCase
                    ? "Track your notice period, requests and remaining tasks."
                    : `Last working day: ${new Date(exitCase.lastWorkingDate).toLocaleDateString()}`}
                </Typography>
              </Box>
              <Chip
                size="small"
                color={activeCase ? "primary" : "warning"}
                label={format(exitCase.status)}
              />
            </Stack>
            {activeCase && (
              <Box
                sx={{
                  overflowX: "auto",
                  mt: 2,
                  pb: 0.5,
                  "&::-webkit-scrollbar": { height: 5 },
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${phases.length}, minmax(98px, 1fr))`,
                    minWidth: 520,
                    gap: 0.5,
                  }}
                >
                  {phases.map((phase, index) => (
                    <Stack
                      key={phase.label}
                      spacing={0.6}
                      alignItems="center"
                      sx={{
                        minWidth: 0,
                        position: "relative",
                        "&:not(:last-child)::after": {
                          content: '""',
                          position: "absolute",
                          zIndex: 0,
                          top: 14,
                          left: "calc(50% + 14px)",
                          width: "calc(100% - 28px)",
                          height: 2,
                          bgcolor: phase.complete ? "success.main" : "divider",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
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
                          border: "1px solid",
                          borderColor:
                            phase.complete || phase.current
                              ? "transparent"
                              : "divider",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {phase.complete ? (
                          <CheckRounded sx={{ fontSize: 17 }} />
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
                          lineHeight: 1.15,
                          fontWeight: phase.current ? 800 : 600,
                          maxWidth: 88,
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
          {activeCase && (
            <>
              <Box sx={cardSx}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  gap={1}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Notice period
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your progress, current requests and next actions.
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color="warning"
                    label={format(exitCase.status)}
                  />
                </Stack>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 1.25,
                    mt: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.25,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack direction="row" spacing={1}>
                      <CalendarMonthOutlined color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Last working day
                        </Typography>
                        <Typography fontWeight={700}>
                          {new Date(
                            exitCase.lastWorkingDate,
                          ).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {daysRemaining} day(s) remaining
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      p: 1.25,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Notice progress
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={1}
                      sx={{ mt: 0.75 }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={phaseProgress}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 99,
                          "& .MuiLinearProgress-bar": { borderRadius: 99 },
                        }}
                      />
                      <Typography variant="caption" fontWeight={800}>
                        {phaseProgress}%
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.75 }}
                    >
                      {completedItems} of {trackedItems.length} items completed
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    mt: 1.25,
                    p: 1.25,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                  >
                    Current requests
                  </Typography>
                  <Stack
                    direction="row"
                    gap={1}
                    alignItems="center"
                    sx={{ mt: 0.75 }}
                  >
                    <CheckRounded
                      color={
                        pendingNotice ||
                        exitCase.withdrawal?.status === "Pending"
                          ? "warning"
                          : "success"
                      }
                      fontSize="small"
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {pendingNotice
                        ? "Notice change request awaiting HR review."
                        : exitCase.withdrawal?.status === "Pending"
                          ? "Withdrawal request awaiting review."
                          : "No active notice or withdrawal requests."}
                    </Typography>
                  </Stack>
                </Box>
                {(canRequestNoticeChange || canWithdraw) && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ mb: 1 }}
                    >
                      Quick actions
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                      {canRequestNoticeChange && (
                        <AppButton
                          startIcon={<RequestPageOutlined />}
                          disabled={Boolean(pendingNotice)}
                          onClick={() => setActivePanel("notice")}
                          sx={{ ...actionSx, flex: 1 }}
                        >
                          Request notice change
                        </AppButton>
                      )}
                      {canWithdraw && (
                        <AppButton
                          startIcon={<UndoOutlined />}
                          color="error"
                          variant="outlined"
                          onClick={() => setActivePanel("withdrawal")}
                          sx={{ ...actionSx, flex: 1 }}
                        >
                          Request withdrawal
                        </AppButton>
                      )}
                    </Stack>
                  </>
                )}
              </Box>
              {activePanel === "notice" && !pendingNotice && (
                <Box sx={cardSx}>
                  <Stack spacing={1.25}>
                    <Box>
                      <Typography fontWeight={700}>
                        Request notice change
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Request an earlier last working day. HR will review your
                        request.
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ mb: 0.75 }}
                      >
                        What would you like to request?
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                          },
                          gap: 1,
                        }}
                      >
                        {[
                          [
                            "EmployeeEarlyRelease",
                            "Early release",
                            "Leave before your current LWD",
                          ],
                          [
                            "FullWaiver",
                            "Notice waiver",
                            "Request a partial or full waiver",
                          ],
                          [
                            "Buyout",
                            "Buyout",
                            "Request release against recovery",
                          ],
                          [
                            "NoticeExtension",
                            "Notice extension",
                            "Request a later LWD",
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
                              p: 1.1,
                              border: "1px solid",
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
                            }}
                          >
                            <Typography variant="body2" fontWeight={800}>
                              {title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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
                      label="Reason"
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
              {activePanel === "withdrawal" && canWithdraw && (
                <Box sx={cardSx}>
                  <Stack spacing={1.25}>
                    <Box>
                      <Typography fontWeight={700}>
                        Request withdrawal
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Withdraw your resignation request.
                      </Typography>
                    </Box>
                    {exitCase.status === "NoticePeriod" && (
                      <Alert severity="info">
                        Review required — your resignation remains active until
                        a manager or HR reviewer decides.
                      </Alert>
                    )}
                    <TextField
                      size="small"
                      label="Reason for withdrawal (optional)"
                      value={withdrawReason}
                      onChange={(event) =>
                        setWithdrawReason(event.target.value)
                      }
                      multiline
                      minRows={3}
                    />
                    <ReviewJourney />
                    <Typography variant="caption" color="text.secondary">
                      Your resignation stays active until this request is
                      approved.
                    </Typography>
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
                        variant="outlined"
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
              {exitCase.withdrawal?.status === "Pending" && (
                <Box
                  sx={{
                    ...cardSx,
                    borderLeft: "3px solid",
                    borderLeftColor: "warning.main",
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    <PendingActionsOutlined color="warning" />
                    <Box>
                      <Typography fontWeight={700}>
                        Withdrawal request pending
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your manager or HR will update you after review.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
              {pendingNotice && (
                <Box
                  sx={{
                    ...cardSx,
                    borderLeft: "3px solid",
                    borderLeftColor:
                      pendingNotice.status === "Pending"
                        ? "info.main"
                        : "warning.main",
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Box>
                        <Typography fontWeight={700}>
                          {pendingNotice.status === "Pending"
                            ? "Notice-change request pending"
                            : "Notice offer awaiting your decision"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Requested LWD:{" "}
                          {new Date(
                            pendingNotice.requestedLastWorkingDate,
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={
                          pendingNotice.status === "Pending"
                            ? "info"
                            : "warning"
                        }
                        label={
                          pendingNotice.status === "Pending"
                            ? "Pending HR review"
                            : "Decision required"
                        }
                      />
                    </Stack>
                    {pendingNotice.reason && (
                      <Typography variant="body2">
                        {pendingNotice.reason}
                      </Typography>
                    )}
                    {pendingNotice.status === "AwaitingEmployeeDecision" && (
                      <Stack
                        direction={{ xs: "column-reverse", sm: "row" }}
                        justifyContent="flex-end"
                        gap={1}
                      >
                        <AppButton
                          variant="outlined"
                          disabled={withdrawing}
                          onClick={() =>
                            void decideOffer(
                              pendingNotice.noticeAdjustmentId,
                              false,
                            )
                          }
                          sx={actionSx}
                        >
                          Keep original notice
                        </AppButton>
                        <AppButton
                          disabled={withdrawing}
                          onClick={() =>
                            void decideOffer(
                              pendingNotice.noticeAdjustmentId,
                              true,
                            )
                          }
                          sx={actionSx}
                        >
                          Accept offer
                        </AppButton>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              )}
              {exitCase.handoverTasks.length > 0 && (
                <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Box>
                      <Typography fontWeight={700}>Handover tasks</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Submit each task assigned to you for manager review.
                      </Typography>
                    </Box>
                    {exitCase.handoverTasks.map((task) => (
                      <Stack
                        key={task.handoverTaskId}
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ sm: "center" }}
                        gap={1}
                        sx={{
                          p: 1.25,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Stack direction="row" spacing={1}>
                          <TaskAltOutlined color="action" />
                          <Typography variant="body2">{task.title}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={task.status} />
                          {exitCase.permittedActions.includes(
                            "SubmitHandover",
                          ) &&
                            !["Submitted", "Approved", "Waived"].includes(
                              task.status,
                            ) && (
                              <AppButton
                                size="small"
                                variant="outlined"
                                disabled={withdrawing}
                                onClick={() =>
                                  void submitHandover(task.handoverTaskId)
                                }
                              >
                                Submit
                              </AppButton>
                            )}
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}
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
                <Box sx={cardSx}>
                  <Stack spacing={1}>
                    <Typography fontWeight={700}>Post-exit contact</Typography>
                    <Typography variant="body2" color="text.secondary">
                      A personal email for important follow-up and
                      former-employee access.
                    </Typography>
                    {exitCase.postExitContact?.personalEmail && (
                      <Alert
                        severity={
                          exitCase.postExitContact.personalEmailVerified
                            ? "success"
                            : "info"
                        }
                      >
                        Saved: {exitCase.postExitContact.personalEmail}
                        {exitCase.postExitContact.personalEmailVerified
                          ? " (verified)"
                          : " (verification pending)"}
                      </Alert>
                    )}
                    <TextField
                      size="small"
                      type="email"
                      label="Personal email"
                      value={personalEmail}
                      disabled={
                        Boolean(exitCase.postExitContact?.personalEmail) &&
                        !confirmPostExitContact
                      }
                      onChange={(event) => setPersonalEmail(event.target.value)}
                    />
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
                  </Stack>
                </Box>
                <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Typography fontWeight={700}>
                      Acknowledge summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confirm you have reviewed the exit information.
                    </Typography>
                    <AppButton
                      variant="contained"
                      disabled={withdrawing}
                      onClick={() => void acknowledge()}
                      sx={actionSx}
                    >
                      Acknowledge summary
                    </AppButton>
                  </Stack>
                </Box>
              </Box>
              <Box sx={cardSx}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1}>
                    <FileUploadOutlined color="action" />
                    <Box>
                      <Typography fontWeight={700}>
                        Upload exit evidence
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        PDF, PNG, JPG or email message. HR verifies required
                        evidence before exit completion.
                      </Typography>
                    </Box>
                  </Stack>
                  <TextField
                    size="small"
                    label="Evidence category"
                    value={evidenceCategory}
                    onChange={(event) =>
                      setEvidenceCategory(event.target.value)
                    }
                  />
                  <Box
                    sx={{
                      p: 1.25,
                      border: "1px dashed",
                      borderColor: evidenceFile ? "primary.main" : "divider",
                    }}
                  >
                    <AppButton
                      component="label"
                      variant="outlined"
                      disabled={withdrawing}
                      sx={actionSx}
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
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {evidenceFile
                        ? `Ready to upload: ${evidenceFile.name}`
                        : "Supported file types"}
                    </Typography>
                  </Box>
                  <Stack alignItems={{ sm: "flex-end" }}>
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
                  {exitCase.evidence.length > 0 && (
                    <Stack spacing={0.75}>
                      <Typography variant="subtitle2">
                        Submitted evidence
                      </Typography>
                      {exitCase.evidence.map((item) => (
                        <Stack
                          key={item.evidenceId}
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ sm: "center" }}
                          gap={0.75}
                          sx={{
                            p: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1.5,
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={650}>
                              {item.fileName || item.category}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.category} · {item.status}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={0.75}>
                            <AppButton
                              size="small"
                              variant="outlined"
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
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Box>
              <Box sx={cardSx}>
                <Stack spacing={1}>
                  <Typography fontWeight={700}>
                    Request documents from HR
                  </Typography>
                  <TextField
                    select
                    size="small"
                    label="Request type"
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
                    label="Details"
                    value={requestDetails}
                    onChange={(event) => setRequestDetails(event.target.value)}
                    multiline
                    minRows={2}
                  />
                  <Stack alignItems={{ sm: "flex-end" }}>
                    <AppButton
                      disabled={withdrawing || !requestDetails.trim()}
                      onClick={() => void createRequest()}
                      sx={actionSx}
                    >
                      Send to HR
                    </AppButton>
                  </Stack>
                  {exitCase.formerEmployeeRequests.length > 0 && (
                    <Stack spacing={0.75}>
                      <Typography variant="subtitle2">Your requests</Typography>
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
                              p: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1.5,
                            }}
                          >
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              justifyContent="space-between"
                              gap={0.75}
                            >
                              <Box>
                                <Typography variant="body2" fontWeight={700}>
                                  {format(request.type)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Requested{" "}
                                  {new Date(
                                    request.requestedAtUtc,
                                  ).toLocaleString()}
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
                                    : undefined
                                }
                                label={format(request.status)}
                              />
                            </Stack>
                            {document && (
                              <Stack
                                direction="row"
                                spacing={0.75}
                                sx={{ mt: 0.75 }}
                              >
                                <AppButton
                                  size="small"
                                  variant="outlined"
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
                  )}
                </Stack>
              </Box>
            </>
          )}
          {history.filter(
            (item) => item.employeeExitId !== exitCase.employeeExitId,
          ).length > 0 && (
            <Accordion
              disableGutters
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                <Stack direction="row" spacing={1}>
                  <HistoryOutlined color="action" />
                  <Typography fontWeight={700}>
                    Withdrawn resignation history
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {history
                    .filter(
                      (item) => item.employeeExitId !== exitCase.employeeExitId,
                    )
                    .map((item) => (
                      <Box
                        key={item.employeeExitId}
                        sx={{
                          p: 1,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight={700}>
                          Requested LWD:{" "}
                          {new Date(item.lastWorkingDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Submitted:{" "}
                          {new Date(item.initiatedAtUtc).toLocaleDateString()}
                        </Typography>
                        {item.withdrawalReason && (
                          <Typography variant="body2">
                            {item.withdrawalReason}
                          </Typography>
                        )}
                      </Box>
                    ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>
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
  /* Legacy inline card retained below for reference.
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
// Alternate pre-merge compact modal implementation is retained in the named safety stash.
      const response = await respondToEmployeeExitDiscussion({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, notes: discussionResponse.trim() || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to respond to the discussion.");
      const refreshed = await getOwnEmployeeExitCase(userDetails.userId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null); setDiscussionResponse(""); toast.success("Your response was sent to the reporting manager.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to respond to the discussion."); }
    finally { setWithdrawing(false); }
  };
  return <>
    <Box sx={{ width: "100%" }}>
      <AppButton
        fullWidth
        variant="outlined"
        onClick={() => setOpen(true)}
        sx={{ minHeight: 44, borderRadius: 2, px: 1.25, textTransform: "none" }}
      >
        <Stack component="span" direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ width: "100%", minWidth: 0 }}>
          <Box component="span" sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "primary.main", fontSize: 12, fontWeight: 700 }}>
            {formatExitStatus(exitCase.status)}
          </Box>
          <Box component="span" sx={{ flex: "0 0 auto", fontSize: 12, fontWeight: 800 }}>
            View case
          </Box>
        </Stack>
      </AppButton>
    </Box>
    <CustomisedModal
      open={open}
      handleClose={() => !withdrawing && setOpen(false)}
      title="Your offboarding case"
      maxWidth="sm"
      fullWidth
      paperSx={{ width: { xs: "calc(100% - 24px)", sm: 560 }, maxWidth: "calc(100% - 24px)", borderRadius: 3 }}
      contentSx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">Last working date</Typography>
            <Typography fontWeight={700}>{new Date(exitCase.lastWorkingDate).toLocaleDateString()}</Typography>
          </Box>
          <Chip size="small" label={formatExitStatus(exitCase.status)} color="primary" />
        </Stack>
        {exitCase.clearances.length > 0 && <Alert severity="info">Clearance tasks: {exitCase.clearances.filter(x => x.status !== "Completed" && x.status !== "Waived").length} pending.</Alert>}
        {exitCase.auditHistory.length > 0 && <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">Recent activity</Typography>
          {exitCase.auditHistory.slice(-3).reverse().map((event, index) => <Typography key={`${event.action}-${event.atUtc}-${index}`} variant="body2">{event.action} · {new Date(event.atUtc).toLocaleString()}</Typography>)}
        </Stack>}
        {exitCase.permittedActions.includes("Withdraw") && <Stack spacing={1}>
          <TextField size="small" label="Withdrawal reason (optional)" value={withdrawReason} onChange={event => setWithdrawReason(event.target.value)} />
          <AppButton color="warning" variant="outlined" disabled={withdrawing} onClick={withdraw}>{withdrawing ? "Withdrawing…" : "Withdraw resignation"}</AppButton>
        </Stack>}
        {exitCase.status === "DiscussionRequested" && <Stack spacing={1}>
          <Alert severity="info">Your manager or HR requested a discussion before the resignation can proceed.</Alert>
          <TextField size="small" multiline minRows={2} label="Your response" value={discussionResponse} onChange={event => setDiscussionResponse(event.target.value)} />
          <AppButton variant="contained" disabled={withdrawing || !discussionResponse.trim()} onClick={() => void respondToDiscussion()}>Send response</AppButton>
        </Stack>}
      </Stack>
    </CustomisedModal>
  </>;
*/
};
