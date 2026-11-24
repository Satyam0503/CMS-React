import { ArrowDownward, ArrowUpward, EventAvailableOutlined, FlightTakeoffOutlined, GroupsOutlined, WorkOutlineOutlined } from "@mui/icons-material";
import { Box, Card, Skeleton, Stack, Tooltip, Typography, alpha } from "@mui/material";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import { Link, useInRouterContext } from "react-router-dom";
import { DashboardOverview } from "../model";
import { percentOf } from "../dashboardMetrics";
import { dashboardSourceVisibility } from "../dashboardSourceVisibility";
import { IconTile, TileColor } from "./DashboardCard";

type Chip = { value: number; color: TileColor; arrow?: "up" | "down"; hint: string };

const KpiChip = ({ chip }: { chip: Chip }) => (
  <Tooltip title={chip.hint}>
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.25}
      tabIndex={0}
      aria-label={`${chip.value}% — ${chip.hint}`}
      sx={{
        px: 0.75,
        py: 0.25,
        borderRadius: "8px",
        color: `${chip.color}.main`,
        bgcolor: (theme) => alpha(theme.palette[chip.color].main, 0.12),
        fontSize: "0.8125rem",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {chip.arrow === "up" && <ArrowUpward sx={{ fontSize: 14 }} />}
      {chip.arrow === "down" && <ArrowDownward sx={{ fontSize: 14 }} />}
      <span>{`${chip.arrow ? Math.abs(chip.value) : chip.value}%`}</span>
    </Stack>
  </Tooltip>
);

const KpiCard = ({
  label,
  value,
  icon,
  color,
  chip,
  loading,
  unavailableLabel,
  to,
}: {
  label: string;
  value: number | null;
  icon: ReactNode;
  color: TileColor;
  chip?: Chip;
  loading: boolean;
  unavailableLabel: string;
  to?: string;
}) => {
  const inRouter = useInRouterContext();
  const isClickable = Boolean(to && inRouter && !loading && value != null);

  return (
    <Card
      {...(isClickable ? { component: Link, to } : {})}
      sx={{
        p: { xs: 1.75, md: 2.25 },
        height: "100%",
        textDecoration: "none",
        color: "inherit",
        display: "block",
        position: "relative",
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        ...(isClickable
          ? {
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette[color].main, 0.15)}`,
                borderColor: `${color}.main`,
              },
            }
          : {}),
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: "100%" }}>
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <IconTile color={color} size={48}>
            {icon}
          </IconTile>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography color="text.secondary" sx={{ fontSize: "0.875rem", fontWeight: 600 }} noWrap title={label}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={72} sx={{ fontSize: "1.9rem" }} />
          ) : value == null ? (
            <Typography aria-label={unavailableLabel} sx={{ fontSize: { xs: "1.5rem", md: "1.875rem" }, fontWeight: 800, lineHeight: 1.25 }}>
              —
            </Typography>
          ) : (
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <Typography sx={{ fontSize: { xs: "1.5rem", md: "1.875rem" }, fontWeight: 800, lineHeight: 1.25, fontVariantNumeric: "tabular-nums" }}>
                {value.toLocaleString()}
              </Typography>
              {chip && <KpiChip chip={chip} />}
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

type Props = {
  overview: DashboardOverview | null | undefined;
  loading: boolean;
  error?: boolean;
  showOpenPositions?: boolean;
  showEmployees?: boolean;
  showAttendance?: boolean;
  showLeave?: boolean;
};

export const KpiCards = ({
  overview,
  loading,
  error = false,
  showOpenPositions = true,
  showEmployees = true,
  showAttendance = true,
  showLeave = true,
}: Props) => {
  const { formatMessage: i } = useIntl();
  const total = overview?.totalEmployees ?? 0;
  const change = overview?.totalEmployeesChangePercent;
  const shareHint = i({ id: "DASHBOARD.KPI.SHARE_HINT" });
  const sources = dashboardSourceVisibility(overview?.sourceAvailability);
  const showEmployeeCount = showEmployees && sources.employees;
  const showAttendanceKpi = showAttendance && sources.attendanceKpi;
  const showLeaveKpi = showLeave && sources.leaveKpi;
  const showJobsKpi = showOpenPositions && sources.openPositions;
  const unavailableLabel = i({ id: "DASHBOARD.UNAVAILABLE" });

  const cards = [
    ...(showEmployeeCount ? [{
      key: "total",
      label: i({ id: "DASHBOARD.KPI.TOTAL_EMPLOYEES" }),
      value: error ? null : total,
      icon: <GroupsOutlined />,
      color: "primary" as const,
      to: "/employees",
      chip: error || change == null || change === 0
        ? undefined
        : { value: change, color: change > 0 ? ("success" as const) : ("error" as const), arrow: change > 0 ? ("up" as const) : ("down" as const), hint: i({ id: "DASHBOARD.KPI.CHANGE_HINT" }) },
    }] : []),
    ...(showAttendanceKpi ? [{
      key: "present",
      label: i({ id: "DASHBOARD.KPI.PRESENT_TODAY" }),
      value: error ? null : (overview?.presentToday ?? 0),
      icon: <EventAvailableOutlined />,
      color: "success" as const,
      to: "/attendance",
      chip: !error && overview?.isWorkingDay && total > 0 ? { value: percentOf(overview.presentToday, total), color: "success" as const, hint: shareHint } : undefined,
    }] : []),
    ...(showLeaveKpi ? [{
      key: "leave",
      label: i({ id: "DASHBOARD.KPI.ON_LEAVE" }),
      value: error ? null : (overview?.onLeaveToday ?? 0),
      icon: <FlightTakeoffOutlined />,
      color: "warning" as const,
      to: "/leavemanagement",
      chip: !error && overview?.isWorkingDay && total > 0 ? { value: percentOf(overview.onLeaveToday, total), color: "warning" as const, hint: shareHint } : undefined,
    }] : []),
    ...(showJobsKpi
      ? [{ key: "open", label: i({ id: "DASHBOARD.KPI.OPEN_POSITIONS" }), value: error ? null : (overview?.openPositions ?? 0), icon: <WorkOutlineOutlined />, color: "info" as const, to: "/recruitment/jobs", chip: undefined }]
      : []),
  ];

  if (cards.length === 0) {
    return null;
  }

  const count = cards.length;
  const gridTemplate =
    count === 1
      ? "minmax(0, 1fr)"
      : count === 2
      ? "repeat(2, minmax(0, 1fr))"
      : count === 3
      ? "repeat(3, minmax(0, 1fr))"
      : "repeat(4, minmax(0, 1fr))";

  return (
    <Box
      sx={{
        display: "grid",
        gap: { xs: 1.5, md: 2.5 },
        gridTemplateColumns: count === 1 ? "minmax(0, 1fr)" : { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))" },
        "@container (min-width: 820px)": { gridTemplateColumns: gridTemplate },
      }}
    >
      {cards.map(({ key, ...card }) => (
        <KpiCard key={key} {...card} loading={loading} unavailableLabel={unavailableLabel} />
      ))}
    </Box>
  );
};
