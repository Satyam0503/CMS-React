import { Grid, Card, Stack, Typography, Skeleton, useTheme, useMediaQuery, Box, Chip, alpha } from "@mui/material";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { EmployeeLeaveTypeBalance } from "../../../leaves/model";
import { BarChart } from "@mui/x-charts";

interface PropsType {
  leaveBalance: EmployeeLeaveTypeBalance[];
  isLoading: boolean;
}

export const EmployeeLeaveTypesCharts = ({
  leaveBalance,
  isLoading,
}: PropsType) => {
  const { formatMessage: i } = useIntl();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("sm"));

  const leaveTypeLabels = useMemo(
    () => leaveBalance.map((type) => isCompact ? type.code || type.name : type.name),
    [isCompact, leaveBalance],
  );

  const series = useMemo(() => {
    return [
      {
        label: i({ id: "LEAVE.TAKEN" }),
        data: leaveBalance.map((type) => type.taken),
        color: theme.palette.primary.main,
      },
      {
        label: i({ id: "LEAVE.REMAINING" }),
        data: leaveBalance.map((type) => type.remaining),
        color: theme.palette.success.main,
      },
    ];
  }, [leaveBalance, i, theme.palette.primary.main, theme.palette.success.main]);

  const chartScale = useMemo(() => {
    const largestEntitlement = Math.max(
      ...leaveBalance.map((type) => Math.max(0, type.taken) + Math.max(0, type.remaining)),
      0,
    );
    // Keep every whole-day mark for normal balances. Larger leave policies
    // automatically use fewer labels, avoiding an unreadable Y axis.
    const max = Math.max(1, Math.ceil(largestEntitlement));
    const step = max <= 10 ? 1 : Math.ceil(max / 10);
    const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, index) => index * step);
    if (ticks[ticks.length - 1] !== max) ticks.push(max);
    return { max, ticks, height: isCompact ? 220 : 250 };
  }, [isCompact, leaveBalance]);

  const balanceSummary = useMemo(() => ({
    taken: leaveBalance.reduce((total, type) => total + Math.max(0, type.taken), 0),
    remaining: leaveBalance.reduce((total, type) => total + Math.max(0, type.remaining), 0),
  }), [leaveBalance]);

  if (isLoading) {
    return (
      <Card sx={{ minHeight: "280px" }} className="p-4 d-flex flex-column">
        <Stack spacing={1} className="flex-grow-1 ">
          <Skeleton variant="text" className="fs-20" />
        </Stack>
      </Card>
    );
  }

  if (leaveBalance.length === 0) {
    return (
      <Card className="py-6 d-flex flex-column align-items-center">
        <Typography variant="h6" className="fs-24">
          {i({ id: "ERROR.OPPS" })}
        </Typography>
        <Typography variant="h6">
          {i({ id: "MESSAGE.NO_LEAVE_DATA_AVAILABLE" })}
        </Typography>
      </Card>
    );
  }

  return (
    <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ minWidth: 0 }}>
      <Grid size={12}>
        <Card sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, minWidth: 0, border: `1px solid ${alpha(theme.palette.divider, 0.8)}`, boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}` }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 1.25 }}>
            <Box>
              <Typography className="fw-bold fs-16">
              {i({ id: "LEAVE.TITLES.LEAVE_BALANCE_GRAPH", defaultMessage: "Leave Balance Overview" })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                Your used and available days by leave type.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={`${balanceSummary.taken} taken`} sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.14), color: theme.palette.primary.main }} />
              <Chip size="small" label={`${balanceSummary.remaining} remaining`} sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.success.main, 0.14), color: theme.palette.success.dark }} />
            </Stack>
          </Stack>
          <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden", borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.025) }}>
            <BarChart
              height={chartScale.height}
              series={series.map((item) => ({ ...item, stack: "leaveBalance" }))}
              xAxis={[{ scaleType: "band", data: leaveTypeLabels, tickPlacement: "middle", tickLabelPlacement: "middle", categoryGapRatio: isCompact ? 0.45 : 0.72, barGapRatio: 0.14, tickLabelStyle: { fontSize: isCompact ? 9 : 11 } }]}
              yAxis={[{ width: 34, min: 0, max: chartScale.max, tickInterval: chartScale.ticks, valueFormatter: (value: number) => `${value}` }]}
              slotProps={{
                legend: {
                  direction: "horizontal",
                  position: { vertical: "bottom", horizontal: "center" },
                },
                tooltip: {
                  trigger: "item",
                },
              }}
              loading={isLoading}
              borderRadius={6}
              margin={{ top: 8, bottom: 42, left: isCompact ? 0 : 8, right: isCompact ? 0 : 8 }}
              sx={{
                "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": { stroke: theme.palette.divider },
                "& .MuiChartsAxis-tickLabel": { fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 600 },
                "& .MuiChartsLegend-label": { fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 700 },
                "& .MuiChartsGrid-line": { stroke: alpha(theme.palette.divider, 0.55), strokeDasharray: "3 4" },
                "& .MuiBarElement-root": { filter: `drop-shadow(0 2px 2px ${alpha(theme.palette.common.black, 0.1)})` },
              }}
              style={{ width: "100%", minWidth: 0, display: "block" }}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};
