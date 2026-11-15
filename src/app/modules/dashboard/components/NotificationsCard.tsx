import { Cake, CalendarMonth, Celebration, ChatBubbleOutline, HomeWork, NotificationsActive, ThumbDownAlt, ThumbUpAlt } from "@mui/icons-material";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { getNotificationTitle, redirectUserToTargetUrl, relativeTimeFormatter } from "../../../../utils/common";
import { NOTIFICATION_TYPE } from "../../../../utils/enums";
import { queryKeys } from "../../../query/queryKeys";
import { NotificationModel } from "../../users/models";
import { markNotificationAsRead } from "../../users/userservices";
import { useDashboardNotificationsQuery } from "../dashboardQueries";
import { CardMessage, DashboardCard, IconTile, ListSkeleton, LoadError, TileColor } from "./DashboardCard";

const ICONS: Record<number, { icon: ReactNode; color: TileColor }> = {
  [NOTIFICATION_TYPE.LEAVE_REQUEST]: { icon: <CalendarMonth />, color: "error" },
  [NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED]: { icon: <ThumbUpAlt />, color: "success" },
  [NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED]: { icon: <ThumbDownAlt />, color: "error" },
  [NOTIFICATION_TYPE.BIRTHDAY]: { icon: <Cake />, color: "warning" },
  [NOTIFICATION_TYPE.WORK_ANNIVERSARY]: { icon: <Celebration />, color: "secondary" },
  [NOTIFICATION_TYPE.WORK_FROM_HOME_REQUEST]: { icon: <HomeWork />, color: "info" },
  [NOTIFICATION_TYPE.WORK_FROM_HOME_APPROVED]: { icon: <HomeWork />, color: "success" },
  [NOTIFICATION_TYPE.WORK_FROM_HOME_REJECTED]: { icon: <HomeWork />, color: "error" },
  [NOTIFICATION_TYPE.MESSAGE]: { icon: <ChatBubbleOutline />, color: "info" },
};
const FALLBACK = { icon: <NotificationsActive />, color: "primary" as const };

export const NotificationsCard = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useDashboardNotificationsQuery();

  const open = (notification: NotificationModel) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.userNotificationId)
        .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.notifications }))
        .catch(() => undefined);
    }
    redirectUserToTargetUrl(notification, navigate);
  };

  const body = () => {
    if (isPending) return <ListSkeleton rows={3} />;
    if (isError) return <LoadError />;
    if (!data?.length) return <CardMessage>{intl.formatMessage({ id: "DASHBOARD.NOTIFICATIONS.EMPTY" })}</CardMessage>;
    return (
      <Stack component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {data.map((notification, index) => {
          const meta = ICONS[notification.notificationTypes] ?? FALLBACK;
          return (
            <Box component="li" key={notification.userNotificationId} sx={{ borderTop: index ? 1 : 0, borderColor: "divider" }}>
              <ButtonBase
                onClick={() => open(notification)}
                sx={{ width: "100%", justifyContent: "flex-start", textAlign: "left", gap: 1.5, py: 1.25, px: 0.5, borderRadius: "10px", "&:hover": { bgcolor: "action.hover" } }}
              >
                <IconTile color={meta.color} size={40}>
                  {meta.icon}
                </IconTile>
                <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: notification.isRead ? 500 : 700, fontSize: "0.9375rem" }} noWrap>
                    {getNotificationTitle(notification, intl)}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
                    {relativeTimeFormatter(notification.sentDateTime)}
                  </Typography>
                </Stack>
                {!notification.isRead && <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />}
              </ButtonBase>
            </Box>
          );
        })}
      </Stack>
    );
  };

  return (
    <DashboardCard id="dashboard-notifications" title={intl.formatMessage({ id: "DASHBOARD.NOTIFICATIONS.TITLE" })}>
      {body()}
    </DashboardCard>
  );
};
