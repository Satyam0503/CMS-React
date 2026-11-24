import { CampaignOutlined, CheckCircleOutline, LogoutOutlined, PersonAddAlt1Outlined } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import { Link } from "react-router-dom";
import { relativeTimeFormatter } from "../../../../utils/common";
import { DashboardActivity, DashboardActivityType } from "../model";
import { CardMessage, DashboardCard, IconTile, ListSkeleton, LoadError, TileColor } from "./DashboardCard";

const ACTIVITY: Record<DashboardActivityType, { icon: ReactNode; color: TileColor; key: string; detailKey?: string }> = {
  joined: { icon: <PersonAddAlt1Outlined />, color: "primary", key: "DASHBOARD.ACTIVITY.JOINED", detailKey: "DASHBOARD.ACTIVITY.JOINED_AS" },
  leaveApproved: { icon: <CheckCircleOutline />, color: "success", key: "DASHBOARD.ACTIVITY.LEAVE_APPROVED" },
  exitInitiated: { icon: <LogoutOutlined />, color: "error", key: "DASHBOARD.ACTIVITY.EXIT_INITIATED" },
  jobPosted: { icon: <CampaignOutlined />, color: "info", key: "DASHBOARD.ACTIVITY.JOB_POSTED", detailKey: "DASHBOARD.ACTIVITY.JOB_POSTED_AS" },
};

type Props = { activities: DashboardActivity[] | undefined; loading: boolean; error: boolean; canOpenEmployees: boolean };

export const RecentActivitiesCard = ({ activities, loading, error, canOpenEmployees }: Props) => {
  const { formatMessage: i } = useIntl();
  const items = (activities ?? []).filter((a) => ACTIVITY[a.type]).slice(0, 5);

  const body = () => {
    if (loading) return <ListSkeleton rows={4} />;
    if (error) return <LoadError />;
    if (items.length === 0) return <CardMessage>{i({ id: "DASHBOARD.ACTIVITY.EMPTY" })}</CardMessage>;
    return (
      <Stack component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {items.map((activity, index) => {
          const meta = ACTIVITY[activity.type];
          const text = i({ id: activity.detail && meta.detailKey ? meta.detailKey : meta.key }, { name: activity.employeeName, detail: activity.detail ?? "" });
          const linkable = canOpenEmployees && activity.employeeId && activity.type !== "jobPosted";
          return (
            <Stack
              component="li"
              key={`${activity.type}-${activity.occurredAt}-${index}`}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ py: 1.25, borderTop: index ? 1 : 0, borderColor: "divider" }}
            >
              <IconTile color={meta.color} size={40}>
                {meta.icon}
              </IconTile>
              <Stack sx={{ minWidth: 0 }}>
                <Typography
                  {...(linkable ? { component: Link, to: `/employees/${activity.employeeId}` } : {})}
                  sx={{ fontWeight: 600, fontSize: "0.9375rem", color: "text.primary", textDecoration: "none", "&:hover": linkable ? { color: "primary.main" } : undefined }}
                >
                  {text}
                </Typography>
                <Typography component="time" dateTime={activity.occurredAt} color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
                  {relativeTimeFormatter(activity.occurredAt)}
                </Typography>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    );
  };

  return (
    <DashboardCard id="recent-activities" title={i({ id: "DASHBOARD.ACTIVITY.TITLE" })}>
      {body()}
    </DashboardCard>
  );
};
