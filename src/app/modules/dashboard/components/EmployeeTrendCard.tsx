import { Box, Skeleton, alpha, useColorScheme, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { useIntl } from "react-intl";
import { HeadcountPoint } from "../model";
import { getChartPalette } from "../../theme/themePalettes";
import { CardMessage, DashboardCard, LoadError } from "./DashboardCard";
import { RangeLabel } from "./AttendanceOverviewCard";

type Props = { trend: HeadcountPoint[] | undefined; loading: boolean; error: boolean };

export const EmployeeTrendCard = ({ trend, loading, error }: Props) => {
  const { formatMessage: i } = useIntl();
  const { mode, systemMode } = useColorScheme();
  const { appStyle } = useTheme();
  const color = getChartPalette(mode, systemMode, appStyle)[0];
  const points = trend ?? [];
  const labels = points.map((p) => dayjs(`${p.month}-01`).format("MMM"));
  const counts = points.map((p) => p.count);

  const body = () => {
    if (loading) return <Skeleton variant="rounded" height={220} />;
    if (error) return <LoadError />;
    if (points.length < 2) return <CardMessage>{i({ id: "DASHBOARD.TREND.EMPTY" })}</CardMessage>;

    const first = points[0];
    const last = points[points.length - 1];
    const summary = i(
      { id: "DASHBOARD.TREND.SUMMARY" },
      {
        from: first.count,
        fromMonth: dayjs(`${first.month}-01`).format("MMMM YYYY"),
        to: last.count,
        toMonth: dayjs(`${last.month}-01`).format("MMMM YYYY"),
      },
    );
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const pad = Math.max(2, Math.ceil((max - min) * 0.2));

    return (
      <Box role="img" aria-label={summary}>
        <LineChart
          height={230}
          hideLegend
          margin={{ left: 0, right: 12, top: 12, bottom: 0 }}
          grid={{ horizontal: true }}
          xAxis={[{ scaleType: "point", data: labels, disableLine: true, disableTicks: true }]}
          yAxis={[{ min: Math.max(0, min - pad), max: max + pad, disableLine: true, disableTicks: true, width: 40, tickNumber: 5 }]}
          series={[{ data: counts, area: true, color, showMark: true, curve: "linear", valueFormatter: (v) => (v == null ? "" : v.toLocaleString()) }]}
          sx={{
            "& .MuiAreaElement-root": { fill: alpha(color, 0.16) },
            "& .MuiLineElement-root": { strokeWidth: 3 },
            "& .MuiMarkElement-root": { fill: "var(--mui-palette-background-paper)", strokeWidth: 2.5 },
            "& .MuiChartsGrid-line": { strokeDasharray: "4 4", stroke: "var(--mui-palette-divider)" },
          }}
        />
      </Box>
    );
  };

  return (
    <DashboardCard id="employee-trend" title={i({ id: "DASHBOARD.TREND.TITLE" })} action={<RangeLabel>{i({ id: "DASHBOARD.TREND.RANGE" })}</RangeLabel>}>
      {body()}
    </DashboardCard>
  );
};
