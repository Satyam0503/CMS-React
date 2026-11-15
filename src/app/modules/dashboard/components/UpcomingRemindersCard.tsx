import { Cake, EventOutlined, FestivalOutlined, WorkspacePremiumOutlined } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ReactNode, useMemo } from "react";
import { useIntl } from "react-intl";
import { useUpcomingCelebrationsQuery, useUpcomingEventsQuery } from "../dashboardQueries";
import { mergeReminders, Reminder, ReminderKind } from "../dashboardMetrics";
import { CardMessage, DashboardCard, IconTile, ListSkeleton, LoadError, TileColor, ViewAllLink } from "./DashboardCard";

const KIND: Record<ReminderKind, { icon: ReactNode; color: TileColor }> = {
  holiday: { icon: <FestivalOutlined />, color: "success" },
  event: { icon: <EventOutlined />, color: "primary" },
  birthday: { icon: <Cake />, color: "warning" },
  anniversary: { icon: <WorkspacePremiumOutlined />, color: "secondary" },
};

const MAX_ITEMS = 4;

export const UpcomingRemindersCard = ({ showCalendar }: { showCalendar: boolean }) => {
  const { formatMessage: i } = useIntl();
  const events = useUpcomingEventsQuery(showCalendar);
  const celebrations = useUpcomingCelebrationsQuery();

  const reminders = useMemo(
    () =>
      mergeReminders(
        showCalendar && events.data?.success ? events.data.methodResult : null,
        celebrations.data?.success ? celebrations.data.methodResult : null,
      ).slice(0, MAX_ITEMS),
    [showCalendar, events.data, celebrations.data],
  );

  const title = (r: Reminder) => {
    if (r.kind === "birthday") return i({ id: "DASHBOARD.REMINDERS.BIRTHDAY" }, { name: r.name });
    if (r.kind === "anniversary") return i({ id: "DASHBOARD.REMINDERS.ANNIVERSARY" }, { name: r.name, years: r.ordinal ?? 1 });
    return r.name;
  };

  const subtitle = (r: Reminder) => {
    const date = r.date.isSame(dayjs(), "day") ? i({ id: "DASHBOARD.REMINDERS.TODAY" }) : r.date.format("ddd, D MMM");
    if (r.kind === "holiday" || r.kind === "event") return `${date} · ${i({ id: r.kind === "holiday" ? "DASHBOARD.REMINDERS.HOLIDAY" : "DASHBOARD.REMINDERS.EVENT" })}`;
    return date;
  };

  const loading = (showCalendar && events.isPending) || celebrations.isPending;
  const failed = celebrations.isError && (!showCalendar || events.isError);

  const body = () => {
    if (loading) return <ListSkeleton rows={3} />;
    if (failed) return <LoadError />;
    if (reminders.length === 0) return <CardMessage>{i({ id: "DASHBOARD.REMINDERS.EMPTY" })}</CardMessage>;
    return (
      <Stack component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {reminders.map((r, index) => (
          <Stack component="li" key={r.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.25, borderTop: index ? 1 : 0, borderColor: "divider" }}>
            <IconTile color={KIND[r.kind].color} size={40}>
              {KIND[r.kind].icon}
            </IconTile>
            <Stack sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem" }} noWrap title={title(r)}>
                {title(r)}
              </Typography>
              <Typography component="time" dateTime={r.date.format("YYYY-MM-DD")} color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
                {subtitle(r)}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    );
  };

  return (
    <DashboardCard id="upcoming-reminders" title={i({ id: "DASHBOARD.REMINDERS.TITLE" })} action={showCalendar ? <ViewAllLink to="/calendar" /> : undefined}>
      {body()}
    </DashboardCard>
  );
};
