import { Box, Skeleton, Typography, alpha, useColorScheme, useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useIntl } from "react-intl";
import { WorkforceMovementPoint } from "../model";
import { formatDashboardMonth } from "../utils/formatDashboardMonth";
import { getChartPalette } from "../../theme/themePalettes";
import { CardMessage, DashboardCard, LoadError } from "./DashboardCard";
import { RangeLabel } from "./AttendanceOverviewCard";

type Props = { trend: WorkforceMovementPoint[] | undefined; asOfDate?: string | null; loading: boolean; error: boolean };

export const WorkforceMovementCard = ({ trend, asOfDate, loading, error }: Props) => {
  const { formatMessage: i, locale } = useIntl();
  const { mode, systemMode } = useColorScheme();
  const { appStyle } = useTheme();
  const [hiresColor, exitsColor] = getChartPalette(mode, systemMode, appStyle);
  const points = trend ?? [];
  const asOf = asOfDate && /^\d{4}-\d{2}-\d{2}$/.test(asOfDate) ? new Date(`${asOfDate}T00:00:00Z`) : null;
  const validAsOf = asOf && !Number.isNaN(asOf.getTime()) && asOf.toISOString().slice(0, 10) === asOfDate;
  const partial = Boolean(validAsOf && points.at(-1)?.month === asOfDate!.slice(0, 7));
  const partialNote = partial ? i(
    { id: "DASHBOARD.MOVEMENT.PARTIAL", defaultMessage: "Current month is partial through {date}." },
    { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(asOf!) },
  ) : "";

  let body;
  if (loading) body = <Skeleton variant="rounded" height={250} />;
  else if (error) body = <LoadError />;
  else if (points.length < 2) body = <CardMessage>{i({ id: "DASHBOARD.MOVEMENT.EMPTY", defaultMessage: "Workforce movement data is unavailable." })}</CardMessage>;
  else {
    const summary = i({ id: "DASHBOARD.MOVEMENT.SUMMARY", defaultMessage: "Monthly workforce movement: {points}.{partialNote}" }, {
      points: points.map((point) => `${formatDashboardMonth(point.month, locale)}: ${i({ id: "DASHBOARD.MOVEMENT.HIRES", defaultMessage: "hires" })} ${point.hires.toLocaleString(locale)}, ${i({ id: "DASHBOARD.MOVEMENT.EXITS", defaultMessage: "exits" })} ${point.exits.toLocaleString(locale)}, ${i({ id: "DASHBOARD.MOVEMENT.NET", defaultMessage: "net" })} ${point.netChange.toLocaleString(locale)}`).join("; "),
      partialNote: partialNote ? ` ${partialNote}` : "",
    });
    body = <>
      <Box role="img" aria-label={summary}>
        <BarChart
          height={250}
          xAxis={[{ scaleType: "band", data: points.map((p) => formatDashboardMonth(p.month, locale, "short")), disableLine: true, disableTicks: true }]}
          yAxis={[{ min: 0, disableLine: true, disableTicks: true, width: 38 }]}
          series={[
            { data: points.map((p) => p.hires), label: i({ id: "DASHBOARD.MOVEMENT.HIRES", defaultMessage: "Hires" }), color: hiresColor, valueFormatter: (v) => (v == null ? "" : v.toLocaleString()) },
            { data: points.map((p) => p.exits), label: i({ id: "DASHBOARD.MOVEMENT.EXITS", defaultMessage: "Exits" }), color: exitsColor, valueFormatter: (v) => (v == null ? "" : v.toLocaleString()) },
          ]}
          slotProps={{ legend: { direction: "horizontal", position: { vertical: "top", horizontal: "end" } } }}
          sx={{ "& .MuiChartsGrid-line": { strokeDasharray: "4 4", stroke: "var(--mui-palette-divider)" }, "& .MuiBarElement-root": { rx: 4, ry: 4, stroke: alpha(hiresColor, 0.1) } }}
        />
      </Box>
      <details style={{ marginTop: 8 }}>
        <summary>{i({ id: "DASHBOARD.MOVEMENT.DATA_TABLE", defaultMessage: "View data table" })}</summary>
        <Box sx={{ overflowX: "auto", mt: 1 }}>
          <table aria-label={i({ id: "DASHBOARD.MOVEMENT.TABLE_CAPTION", defaultMessage: "Monthly workforce movement data" })} style={{ width: "100%", borderCollapse: "collapse", textAlign: "start" }}>
            <thead><tr>
              {[i({ id: "DASHBOARD.MOVEMENT.MONTH", defaultMessage: "Month" }), i({ id: "DASHBOARD.MOVEMENT.HIRES", defaultMessage: "Hires" }), i({ id: "DASHBOARD.MOVEMENT.EXITS", defaultMessage: "Exits" }), i({ id: "DASHBOARD.MOVEMENT.NET", defaultMessage: "Net" })].map((label) => <th key={label} scope="col" style={{ textAlign: "start", padding: "8px 12px", borderBottom: "1px solid var(--mui-palette-divider)" }}>{label}</th>)}
            </tr></thead>
            <tbody>{points.map((point) => <tr key={point.month}>
              <th scope="row" style={{ textAlign: "start", padding: "8px 12px", borderBottom: "1px solid var(--mui-palette-divider)" }}>{formatDashboardMonth(point.month, locale)}</th>
              {[point.hires, point.exits, point.netChange].map((value, index) => <td key={`${point.month}-${index}`} style={{ padding: "8px 12px", borderBottom: "1px solid var(--mui-palette-divider)" }}>{value.toLocaleString(locale)}</td>)}
            </tr>)}</tbody>
          </table>
        </Box>
      </details>
      {partialNote && <Typography role="note" variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>{partialNote}</Typography>}
    </>;
  }

  return <DashboardCard id="workforce-movement" title={i({ id: "DASHBOARD.MOVEMENT.TITLE", defaultMessage: "Workforce movement" })} action={<RangeLabel>{i({ id: "DASHBOARD.MOVEMENT.RANGE", defaultMessage: "Last 12 months" })}</RangeLabel>}>{body}</DashboardCard>;
};
