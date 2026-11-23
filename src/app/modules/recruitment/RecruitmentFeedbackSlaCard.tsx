import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Chip, Grid, LinearProgress, Stack, Typography, alpha, useTheme } from "@mui/material";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import NotificationImportantRounded from "@mui/icons-material/NotificationImportantRounded";
import { AppButton } from "../../shared/components/ui";
import { getRecruitmentFeedbackSla, queueRecruitmentFeedbackReminders } from "./services";
import { toast } from "react-toastify";
import { RecruitmentFeedbackSlaReport } from "./models";
import dayjs from "dayjs";
import RecruitmentCapabilityNotice from "./RecruitmentCapabilityNotice";
import { isRecruitmentFeatureDisabled, responseDataFromError } from "./recruitmentCapabilityUtils";

export default function RecruitmentFeedbackSlaCard() {
  const theme = useTheme();
  const [report, setReport] = useState<RecruitmentFeedbackSlaReport>();
  const [queueing, setQueueing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [featureDisabled, setFeatureDisabled] = useState(false);
  const [loadError, setLoadError] = useState<string>();

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRecruitmentFeedbackSla();
      if (!data.success) {
        setReport(undefined);
        if (isRecruitmentFeatureDisabled(data)) {
          setFeatureDisabled(true);
          setLoadError(undefined);
        } else {
          setFeatureDisabled(false);
          setLoadError(data.message || "The SLA report could not be loaded.");
        }
        return;
      }
      setFeatureDisabled(false);
      setLoadError(data.methodResult ? undefined : "The SLA report returned no data.");
      setReport(data.methodResult ?? undefined);
    } catch (error) {
      setReport(undefined);
      const response = responseDataFromError(error);
      if (isRecruitmentFeatureDisabled(response)) {
        setFeatureDisabled(true);
        setLoadError(undefined);
      } else {
        setFeatureDisabled(false);
        setLoadError((response as { message?: string } | undefined)?.message || "The SLA report could not be loaded. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const queueReminders = async () => {
    setQueueing(true);
    try {
      const { data } = await queueRecruitmentFeedbackReminders();
      if (!data.success && isRecruitmentFeatureDisabled(data)) {
        toast.info(data.message || "Interviewer reminder emails are turned off in Recruitment Settings.");
        return;
      }
      if (!data.success) throw new Error(data.message || "Unable to queue reminders.");
      toast.success(data.message || "Feedback reminders queued.");
      await loadReport();
    } catch (error) {
      const response = responseDataFromError(error);
      if (isRecruitmentFeatureDisabled(response)) {
        toast.info((response as { message?: string } | undefined)?.message || "Interviewer reminder emails are turned off in Recruitment Settings.");
      } else {
        toast.error((error as Error).message || "Unable to queue reminders.");
      }
    } finally {
      setQueueing(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  if (loading) return <LinearProgress aria-label="Loading interviewer feedback SLA report" />;
  if (featureDisabled || loadError || !report) {
    return (
      <RecruitmentCapabilityNotice
        feature="Interviewer feedback SLA tracking"
        settingsArea="Operating model → Interview feedback deadlines, and Enterprise Operations → Interview feedback SLA"
        disabled={featureDisabled}
        errorMessage={loadError}
        onRetry={() => void loadReport()}
        retrying={loading}
      />
    );
  }

  const hasOverdue = (report.overdueRounds || 0) > 0;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: "1px solid",
        borderColor: hasOverdue ? alpha(theme.palette.warning.main, 0.4) : "divider",
        borderRadius: "12px",
        bgcolor: hasOverdue ? alpha(theme.palette.warning.main, 0.05) : "background.paper",
        boxShadow: "none",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
        flexWrap="wrap"
        useFlexGap
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              bgcolor: hasOverdue ? alpha(theme.palette.warning.main, 0.12) : alpha(theme.palette.primary.main, 0.1),
              color: hasOverdue ? "warning.dark" : "primary.main",
              flexShrink: 0,
            }}
          >
            <TimerOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: "0.95rem" }}>
              Interviewer Feedback SLA Tracking
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
              Track overdue scorecards and follow up with interviewers who have not submitted feedback.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: "100%", sm: "auto" } }}>
          <Chip
            size="small"
            variant="outlined"
            label={`${report.totalOpenRounds} open`}
            sx={{ height: 26, fontWeight: 700, fontSize: "0.72rem", borderRadius: "6px" }}
          />
          <Chip
            size="small"
            color={hasOverdue ? "warning" : "success"}
            label={`${report.overdueRounds} overdue`}
            sx={{ height: 26, fontWeight: 750, fontSize: "0.72rem", borderRadius: "6px" }}
          />
          {hasOverdue && (
            <AppButton
              size="small"
              variant="contained"
              color="warning"
              startIcon={<NotificationImportantRounded sx={{ fontSize: 16 }} />}
              onClick={() => void queueReminders()}
              disabled={queueing}
              sx={{ height: 32, fontSize: "0.76rem", fontWeight: 700, borderRadius: "8px", textTransform: "none" }}
            >
              {queueing ? "Queueing…" : "Remind panel"}
            </AppButton>
          )}
        </Stack>
      </Stack>

      {hasOverdue && (
        <Alert
          severity="warning"
          sx={{
            mt: 2,
            borderRadius: "10px",
            fontSize: "0.8rem",
            border: "1px solid",
            borderColor: alpha(theme.palette.warning.main, 0.35),
          }}
        >
          Overdue interview scorecards detected. Please notify interviewers or complete the debrief review.
        </Alert>
      )}

      {report.items && report.items.length > 0 && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={0.5}>
            Active Rounds Requiring Scorecards
          </Typography>
          <Grid container spacing={1.25}>
            {report.items.slice(0, 6).map((item) => (
              <Grid key={item.interviewId} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: item.overdue ? alpha(theme.palette.warning.main, 0.35) : "divider",
                    bgcolor: item.overdue ? alpha(theme.palette.warning.main, 0.06) : "background.default",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box minWidth={0}>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.82rem" }}>
                      Round {item.roundNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.74rem" }}>
                      Scorecards: {item.submittedScorecards} / {Math.max(item.assignedInterviewers, 1)} submitted
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color={item.overdue ? "warning" : "default"}
                    variant={item.overdue ? "filled" : "outlined"}
                    label={item.overdue ? "Overdue" : dayjs(item.dueAtUtc).format("D MMM, h:mm A")}
                    sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700, borderRadius: "5px" }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}
    </Box>
  );
}
