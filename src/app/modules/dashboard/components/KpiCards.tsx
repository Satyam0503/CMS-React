import { ArrowDownward, ArrowUpward, EventAvailableOutlined, FlightTakeoffOutlined, GroupsOutlined, WorkOutlineOutlined } from "@mui/icons-material";
import { Box, Card, Skeleton, Stack, Tooltip, Typography, alpha } from "@mui/material";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import { DashboardOverview } from "../model";
import { percentOf } from "../dashboardMetrics";
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

const KpiCard = ({ label, value, icon, color, chip, loading }: { label: string; value: number; icon: ReactNode; color: TileColor; chip?: Chip; loading: boolean }) => (
  <Card sx={{ p: { xs: 1.75, md: 2.25 }, height: "100%" }}>
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

type Props = { overview: DashboardOverview | null | undefined; loading: boolean; showOpenPositions: boolean };

export const KpiCards = ({ overview, loading, showOpenPositions }: Props) => {
  const { formatMessage: i } = useIntl();
  const total = overview?.totalEmployees ?? 0;
  const change = overview?.totalEmployeesChangePercent;
  const shareHint = i({ id: "DASHBOARD.KPI.SHARE_HINT" });

  const cards = [
    {
      key: "total",
      label: i({ id: "DASHBOARD.KPI.TOTAL_EMPLOYEES" }),
      value: total,
      icon: <GroupsOutlined />,
      color: "primary" as const,
      chip:
        change == null || change === 0
          ? undefined
          : { value: change, color: change > 0 ? ("success" as const) : ("error" as const), arrow: change > 0 ? ("up" as const) : ("down" as const), hint: i({ id: "DASHBOARD.KPI.CHANGE_HINT" }) },
    },
    {
      key: "present",
      label: i({ id: "DASHBOARD.KPI.PRESENT_TODAY" }),
      value: overview?.presentToday ?? 0,
      icon: <EventAvailableOutlined />,
      color: "success" as const,
      chip: overview?.isWorkingDay && total > 0 ? { value: percentOf(overview.presentToday, total), color: "success" as const, hint: shareHint } : undefined,
    },
    {
      key: "leave",
      label: i({ id: "DASHBOARD.KPI.ON_LEAVE" }),
      value: overview?.onLeaveToday ?? 0,
      icon: <FlightTakeoffOutlined />,
      color: "warning" as const,
      chip: overview?.isWorkingDay && total > 0 ? { value: percentOf(overview.onLeaveToday, total), color: "warning" as const, hint: shareHint } : undefined,
    },
    ...(showOpenPositions
      ? [{ key: "open", label: i({ id: "DASHBOARD.KPI.OPEN_POSITIONS" }), value: overview?.openPositions ?? 0, icon: <WorkOutlineOutlined />, color: "info" as const, chip: undefined }]
      : []),
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gap: { xs: 1.5, md: 2.5 },
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        "@container (min-width: 820px)": { gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` },
      }}
    >
      {cards.map(({ key, ...card }) => (
        <KpiCard key={key} {...card} loading={loading} />
      ))}
    </Box>
  );
};
