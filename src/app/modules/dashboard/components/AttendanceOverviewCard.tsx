import { BeachAccessOutlined } from "@mui/icons-material";
import { Box, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { visuallyHidden } from "@mui/utils";
import { useIntl } from "react-intl";
import { DashboardOverview } from "../model";
import { attendanceBreakdown } from "../dashboardMetrics";
import { CardMessage, DashboardCard, IconTile, LoadError } from "./DashboardCard";

const LABEL_KEYS = {
  presentOnly: "DASHBOARD.ATTENDANCE.PRESENT_ONLY",
  leaveOnly: "DASHBOARD.ATTENDANCE.LEAVE_ONLY",
  presentAndOnLeave: "DASHBOARD.ATTENDANCE.PRESENT_AND_LEAVE",
  absent: "DASHBOARD.ATTENDANCE.ABSENT",
  otherStatus: "DASHBOARD.ATTENDANCE.OTHER_STATUS",
  unreported: "DASHBOARD.ATTENDANCE.UNREPORTED",
} as const;

const LABEL_DEFAULTS = {
  presentOnly: "Present",
  leaveOnly: "On leave",
  presentAndOnLeave: "Present & on leave",
  absent: "Absent",
  otherStatus: "Other status",
  unreported: "No attendance record",
} as const;

export const RangeLabel = ({ children }: { children: string }) => (
  <Typography
    component="span"
    sx={{ px: 1.5, py: 0.5, border: 1, borderColor: "divider", borderRadius: "10px", fontSize: "0.8125rem", fontWeight: 600, color: "text.secondary" }}
  >
    {children}
  </Typography>
);

type Props = { overview: DashboardOverview | null | undefined; loading: boolean; error: boolean };

export const AttendanceOverviewCard = ({ overview, loading, error }: Props) => {
  const { formatMessage: i } = useIntl();
  const { palette } = useTheme();
  const colors = {
    presentOnly: palette.primary.main,
    leaveOnly: palette.warning.main,
    presentAndOnLeave: palette.success.main,
    absent: palette.error.main,
    otherStatus: palette.info.main,
    unreported: palette.grey[500],
  };

  const body = () => {
    if (loading)
      return (
        <Stack role="status" aria-live="polite" aria-busy="true" direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
          <Typography sx={visuallyHidden}>{i({ id: "DASHBOARD.ATTENDANCE.LOADING", defaultMessage: "Loading attendance summary" })}</Typography>
          <Skeleton aria-hidden="true" variant="circular" width={176} height={176} />
          <Box
            aria-hidden="true"
            sx={{ flexGrow: 1, width: "100%", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}
          >
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <Skeleton key={key} variant="rounded" height={68} />
            ))}
          </Box>
        </Stack>
      );
    if (error || !overview) return <LoadError />;
    if (!overview.isWorkingDay)
      return (
        <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ minHeight: 200, textAlign: "center" }}>
          <IconTile color="info" size={56}>
            <BeachAccessOutlined />
          </IconTile>
          <Typography sx={{ fontWeight: 700 }}>{i({ id: "DASHBOARD.ATTENDANCE.NON_WORKING_TITLE" })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {i({ id: "DASHBOARD.ATTENDANCE.NON_WORKING_BODY" })}
          </Typography>
        </Stack>
      );

    const { tracked, slices, presentPercent } = attendanceBreakdown(overview);
    if (!overview.attendanceBreakdown) return <CardMessage>{i({ id: "DASHBOARD.ATTENDANCE.BREAKDOWN_UNAVAILABLE", defaultMessage: "Attendance breakdown is unavailable for this response." })}</CardMessage>;
    if (tracked === 0) return <CardMessage>{i({ id: "DASHBOARD.ATTENDANCE.EMPTY" })}</CardMessage>;

    const summary = i(
      { id: "DASHBOARD.ATTENDANCE.SUMMARY_V2", defaultMessage: "Today's expected workforce: {expected}. Present: {present}; on leave: {leave}; absent: {absent}; other status: {other}; no attendance record: {unreported}." },
      {
        expected: tracked,
        present: overview.attendanceBreakdown.presentOnly + overview.attendanceBreakdown.presentAndOnLeave,
        leave: overview.attendanceBreakdown.leaveOnly + overview.attendanceBreakdown.presentAndOnLeave,
        absent: overview.attendanceBreakdown.explicitlyAbsent,
        other: overview.attendanceBreakdown.otherStatus,
        unreported: overview.attendanceBreakdown.unreported,
      },
    );

    return (
      <Stack useFlexGap spacing={2} alignItems="center" sx={{ "@container (min-width: 400px)": { flexDirection: "row", gap: 2.5 } }}>
        <Box role="img" aria-label={summary} sx={{ position: "relative", width: 176, height: 176, flexShrink: 0 }}>
          <PieChart
            width={176}
            height={176}
            hideLegend
            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            series={[
              {
                innerRadius: 58,
                outerRadius: 84,
                paddingAngle: slices.filter((s) => s.count > 0).length > 1 ? 1.5 : 0,
                cornerRadius: 3,
                data: slices.map((s) => ({ id: s.key, value: s.count, color: colors[s.key], label: i({ id: LABEL_KEYS[s.key], defaultMessage: LABEL_DEFAULTS[s.key] }) })),
              },
            ]}
          />
          <Stack aria-hidden alignItems="center" justifyContent="center" sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <Typography sx={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
              {presentPercent}%
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "0.9375rem", fontWeight: 600 }}>
              {i({ id: "DASHBOARD.ATTENDANCE.PRESENT", defaultMessage: "Present" })}
            </Typography>
          </Stack>
        </Box>
        <Box
          component="ul"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            flexGrow: 1,
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          {slices.map((s) => (
            <Stack
              component="li"
              key={s.key}
              spacing={0.75}
              justifyContent="space-between"
              sx={{
                minWidth: 0,
                minHeight: 68,
                boxSizing: "border-box",
                px: 1.25,
                py: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: "12px",
                bgcolor: "background.default",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                <Box aria-hidden sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: colors[s.key], flexShrink: 0 }} />
                <Typography
                  title={LABEL_DEFAULTS[s.key]}
                  sx={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "text.secondary",
                  }}
                >
                  {i({ id: LABEL_KEYS[s.key], defaultMessage: LABEL_DEFAULTS[s.key] })}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ pl: 2.25 }}>
                <Typography sx={{ fontSize: "0.9375rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {s.count}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.75rem", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {s.percent}%
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Box>
      </Stack>
    );
  };

  return (
    <DashboardCard id="attendance-overview" title={i({ id: "DASHBOARD.ATTENDANCE.TITLE" })} action={<RangeLabel>{i({ id: "DASHBOARD.ATTENDANCE.TODAY" })}</RangeLabel>}>
      {body()}
    </DashboardCard>
  );
};
