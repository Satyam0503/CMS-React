import { useEffect, useState } from "react";
import { Alert, Box, Chip, Divider, Grid, Stack, Typography, alpha, useTheme } from "@mui/material";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import NotificationImportantRounded from "@mui/icons-material/NotificationImportantRounded";
import { AppButton } from "../../shared/components/ui";
import { getRecruitmentFeedbackSla, queueRecruitmentFeedbackReminders } from "./services";
import { toast } from "react-toastify";
import { RecruitmentFeedbackSlaReport } from "./models";
import { useIsDark } from "../theme/useIsDark";
import dayjs from "dayjs";

export default function RecruitmentFeedbackSlaCard() {
  const theme = useTheme();
  const isDark = useIsDark();
  const [report, setReport] = useState<RecruitmentFeedbackSlaReport>();
  const [queueing, setQueueing] = useState(false);

  const queueReminders = async () => {
    setQueueing(true);
    try {
      const { data } = await queueRecruitmentFeedbackReminders();
      if (!data.success) throw new Error(data.message || "Unable to queue reminders.");
      toast.success(data.message || "Feedback reminders queued.");
      const refreshed = await getRecruitmentFeedbackSla();
      if (refreshed.data.success) setReport(refreshed.data.methodResult ?? undefined);
    } catch (error) {
      toast.error((error as Error).message || "Unable to queue reminders.");
    } finally {
      setQueueing(false);
    }
  };

  useEffect(() => {
    void getRecruitmentFeedbackSla()
      .then(({ data }) => {
        if (data.success) setReport(data.methodResult ?? undefined);
      })
      .catch(() => undefined);
  }, []);

  if (!report) return null;

  const hasOverdue = (report.overdueRounds || 0) > 0;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: "1px solid",
        borderColor: hasOverdue
          ? isDark
            ? "rgba(245, 158, 11, 0.4)"
            : "rgba(245, 158, 11, 0.35)"
          : isDark
          ? "rgba(255, 255, 255, 0.08)"
          : "#E2E8F0",
        borderRadius: "14px",
        bgcolor: hasOverdue
          ? isDark
            ? "rgba(245, 158, 11, 0.05)"
            : "rgba(245, 158, 11, 0.02)"
          : isDark
          ? "rgba(30, 41, 59, 0.3)"
          : "background.paper",
        boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.02)",
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
              bgcolor: hasOverdue ? alpha("#F59E0B", 0.12) : alpha(theme.palette.primary.main, 0.1),
              color: hasOverdue ? "#D97706" : "primary.main",
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
              Monitor scorecard turnaround times and trigger automated panel reminders.
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
            borderColor: isDark ? "rgba(245, 158, 11, 0.3)" : "rgba(245, 158, 11, 0.2)",
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
              <Grid key={item.interviewId} size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: item.overdue
                      ? isDark
                        ? "rgba(245, 158, 11, 0.3)"
                        : "#FDE68A"
                      : isDark
                      ? "rgba(255, 255, 255, 0.06)"
                      : "#E2E8F0",
                    bgcolor: item.overdue
                      ? isDark
                        ? "rgba(245, 158, 11, 0.08)"
                        : "#FFFBEB"
                      : isDark
                      ? "rgba(15, 23, 42, 0.25)"
                      : "#F8FAFC",
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
