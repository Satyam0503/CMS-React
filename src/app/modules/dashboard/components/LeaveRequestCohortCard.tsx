import { Box, Skeleton, Typography, alpha, useColorScheme, useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useIntl } from "react-intl";
import { LeaveRequestCohortPoint } from "../model";
import { formatDashboardMonth } from "../utils/formatDashboardMonth";
import { getChartPalette } from "../../theme/themePalettes";
import { CardMessage, DashboardCard, LoadError } from "./DashboardCard";
import { RangeLabel } from "./AttendanceOverviewCard";

type Props = { trend: LeaveRequestCohortPoint[] | undefined; asOfDate?: string | null; loading: boolean; error: boolean };

export const LeaveRequestCohortCard = ({ trend, asOfDate, loading, error }: Props) => {
  const { formatMessage: i, locale } = useIntl();
  const { mode, systemMode } = useColorScheme();
  const { appStyle } = useTheme();
  const colors = getChartPalette(mode, systemMode, appStyle);
  const points = trend ?? [];
  const asOf = asOfDate && /^\d{4}-\d{2}-\d{2}$/.test(asOfDate) ? new Date(`${asOfDate}T00:00:00Z`) : null;
  const validAsOf = asOf && !Number.isNaN(asOf.getTime()) && asOf.toISOString().slice(0, 10) === asOfDate;
  const partial = Boolean(validAsOf && points.at(-1)?.month === asOfDate!.slice(0, 7));
  const partialNote = partial ? i(
    { id: "DASHBOARD.LEAVE_COHORT.PARTIAL", defaultMessage: "Current submission month is partial through {date}." },
    { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(asOf!) },
  ) : "";
  const cohortNote = i({
    id: "DASHBOARD.LEAVE_COHORT.DEFINITION",
    defaultMessage: "Grouped by submission month; status buckets show each request's current status, which can change later.",
  });

  let body;
  if (loading) body = <Skeleton variant="rounded" height={270} />;
  else if (error) body = <LoadError />;
  else if (points.length < 2) body = <CardMessage>{i({ id: "DASHBOARD.LEAVE_COHORT.EMPTY", defaultMessage: "Leave request cohort data is unavailable." })}</CardMessage>;
  else {
    const statuses = [
      { key: "pending", label: i({ id: "DASHBOARD.LEAVE_COHORT.PENDING", defaultMessage: "Pending" }), color: colors[3] },
      { key: "approved", label: i({ id: "DASHBOARD.LEAVE_COHORT.APPROVED", defaultMessage: "Approved" }), color: colors[4] },
      { key: "rejected", label: i({ id: "DASHBOARD.LEAVE_COHORT.REJECTED", defaultMessage: "Rejected" }), color: colors[5] },
      { key: "withdrawn", label: i({ id: "DASHBOARD.LEAVE_COHORT.WITHDRAWN", defaultMessage: "Withdrawn" }), color: colors[6] },
      { key: "otherStatus", label: i({ id: "DASHBOARD.LEAVE_COHORT.OTHER", defaultMessage: "Other status" }), color: colors[7] },
    ] as const;
    const summary = i({ id: "DASHBOARD.LEAVE_COHORT.SUMMARY", defaultMessage: "Leave requests by submission month and current status: {points}.{partialNote}" }, {
      points: points.map((point) => `${formatDashboardMonth(point.month, locale)}: ${point.totalRequests.toLocaleString(locale)} ${i({ id: "DASHBOARD.LEAVE_COHORT.REQUESTS", defaultMessage: "requests" })}; ${statuses.map((status) => `${status.label.toLocaleLowerCase(locale)} ${point[status.key].toLocaleString(locale)}`).join(", ")}`).join("; "),
      partialNote: partialNote ? ` ${partialNote}` : "",
    });
    body = <>
      <Box role="img" aria-label={summary}>
        <BarChart
          height={260}
          xAxis={[{ scaleType: "band", data: points.map((point) => formatDashboardMonth(point.month, locale, "short")), disableLine: true, disableTicks: true }]}
          yAxis={[{ min: 0, disableLine: true, disableTicks: true, width: 38 }]}
          series={statuses.map((status) => ({
            data: points.map((point) => point[status.key]),
            label: status.label,
            color: status.color,
            stack: "leave-request-status",
            valueFormatter: (value) => value == null ? "" : value.toLocaleString(),
          }))}
          slotProps={{ legend: { direction: "horizontal", position: { vertical: "top", horizontal: "end" } } }}
          sx={{
            "& .MuiChartsGrid-line": { strokeDasharray: "4 4", stroke: "var(--mui-palette-divider)" },
            "& .MuiBarElement-root": { rx: 3, ry: 3, stroke: alpha(colors[0], 0.08) },
          }}
        />
      </Box>
      <details style={{ marginTop: 8 }}>
        <summary>{i({ id: "DASHBOARD.LEAVE_COHORT.DATA_TABLE", defaultMessage: "View data table" })}</summary>
        <Box sx={{ overflowX: "auto", mt: 1 }}>
          <table aria-label={i({ id: "DASHBOARD.LEAVE_COHORT.TABLE_CAPTION", defaultMessage: "Leave requests by submission month and current status" })} style={{ width: "100%", borderCollapse: "collapse", textAlign: "start" }}>
            <thead><tr>
              {[i({ id: "DASHBOARD.LEAVE_COHORT.MONTH", defaultMessage: "Month" }), i({ id: "DASHBOARD.LEAVE_COHORT.TOTAL", defaultMessage: "Total requests" }), ...statuses.map((status) => status.label)].map((label) => <th key={label} scope="col" style={{ textAlign: "start", padding: "8px 12px", borderBottom: "1px solid var(--mui-palette-divider)" }}>{label}</th>)}
            </tr></thead>
            <tbody>{points.map((point) => <tr key={point.month}>
              <th scope="row" style={{ textAlign: "start", padding: "8px 12px", borderBottom: "1px solid var(--mui-palette-divider)" }}>{formatDashboardMonth(point.month, locale)}</th>
              {[point.totalRequests, ...statuses.map((status) => point[status.key])].map((value, index) => <td key={`${point.month}-${index}`} style={{ padding: "8px 12px", borderBottom: "1px solid var(--mui-palette-divider)" }}>{value.toLocaleString(locale)}</td>)}
            </tr>)}</tbody>
          </table>
        </Box>
      </details>
      <Typography role="note" variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>{cohortNote}</Typography>
      {partialNote && <Typography role="note" variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>{partialNote}</Typography>}
    </>;
  }

  return <DashboardCard id="leave-request-cohort" title={i({ id: "DASHBOARD.LEAVE_COHORT.TITLE", defaultMessage: "Leave request cohorts" })} action={<RangeLabel>{i({ id: "DASHBOARD.LEAVE_COHORT.RANGE", defaultMessage: "Last 12 months" })}</RangeLabel>}>{body}</DashboardCard>;
};
