import { BeachAccessOutlined } from "@mui/icons-material";
import { Box, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useIntl } from "react-intl";
import { DashboardOverview } from "../model";
import { attendanceBreakdown } from "../dashboardMetrics";
import { CardMessage, DashboardCard, IconTile, LoadError } from "./DashboardCard";

const LABEL_KEYS = {
  present: "DASHBOARD.ATTENDANCE.PRESENT",
  onLeave: "DASHBOARD.ATTENDANCE.ON_LEAVE",
  absent: "DASHBOARD.ATTENDANCE.ABSENT",
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
  const colors = { present: palette.primary.main, onLeave: palette.warning.main, absent: palette.error.main };

  const body = () => {
    if (loading)
      return (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
          <Skeleton variant="circular" width={180} height={180} />
          <Stack spacing={1.5} sx={{ flexGrow: 1, width: "100%" }}>
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} variant="rounded" height={44} />
            ))}
          </Stack>
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
    if (tracked === 0) return <CardMessage>{i({ id: "DASHBOARD.ATTENDANCE.EMPTY" })}</CardMessage>;

    const summary = i(
      { id: "DASHBOARD.ATTENDANCE.SUMMARY" },
      { present: overview.presentToday, leave: overview.onLeaveToday, absent: overview.absentToday },
    );

    return (
      <Stack useFlexGap spacing={2} alignItems="center" sx={{ "@container (min-width: 400px)": { flexDirection: "row", gap: 2.5 } }}>
        <Box role="img" aria-label={summary} sx={{ position: "relative", width: 190, height: 190, flexShrink: 0 }}>
          <PieChart
            width={190}
            height={190}
            hideLegend
            margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            series={[
              {
                innerRadius: 64,
                outerRadius: 92,
                paddingAngle: slices.filter((s) => s.count > 0).length > 1 ? 1.5 : 0,
                cornerRadius: 3,
                data: slices.map((s) => ({ id: s.key, value: s.count, color: colors[s.key], label: i({ id: LABEL_KEYS[s.key] }) })),
              },
            ]}
          />
          <Stack aria-hidden alignItems="center" justifyContent="center" sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <Typography sx={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
              {presentPercent}%
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "0.9375rem", fontWeight: 600 }}>
              {i({ id: LABEL_KEYS.present })}
            </Typography>
          </Stack>
        </Box>
        <Stack component="ul" spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0, flexGrow: 1, width: "100%" }}>
          {slices.map((s) => (
            <Stack
              component="li"
              key={s.key}
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{ px: 1.5, py: 1.1, border: 1, borderColor: "divider", borderRadius: "10px" }}
            >
              <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: colors[s.key], flexShrink: 0 }} />
              <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>{i({ id: LABEL_KEYS[s.key] })}</Typography>
              <Typography sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {s.count}{" "}
                <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  ({s.percent}%)
                </Box>
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    );
  };

  return (
    <DashboardCard id="attendance-overview" title={i({ id: "DASHBOARD.ATTENDANCE.TITLE" })} action={<RangeLabel>{i({ id: "DASHBOARD.ATTENDANCE.TODAY" })}</RangeLabel>}>
      {body()}
    </DashboardCard>
  );
};
