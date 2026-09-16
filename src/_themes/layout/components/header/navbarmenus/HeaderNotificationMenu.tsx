import {
  Badge,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { AccessTime, Cake, CalendarMonth, Celebration, NotificationsActive, ThumbDownAlt, ThumbUpAlt } from "@mui/icons-material";
import { useIntl } from "react-intl";
import Connector from "../../../../../server/SignalR";
import { NotificationModel, NotificationRequestPayload } from "../../../../../app/modules/users/models";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { getNotifications, markAllNotificationAsRead, markNotificationAsRead } from "../../../../../app/modules/users/userservices";
import { getNotificationTitle, redirectUserToTargetUrl, relativeTimeFormatter } from "../../../../../utils/common";
import clsx from "clsx";
import { NOTIFICATION_TYPE } from "../../../../../utils/enums";
import { showCustomToast } from "../../../../../app/shared/components/C_Toast";
import { useNavigate } from "react-router-dom";
import { createNotifications } from "../../../../../app/modules/dashboard/components/pushNotificationUtils";
import { toAbsoluteUrl } from "../../../../helpers";

import { AppIconButton } from "../../../../../app/shared/components/ui";
export const NotificationIconMapper: {
  [index: number]: ReactNode
} = {
  [NOTIFICATION_TYPE.NOTICE]: <NotificationsActive className="fs-32" />,
  [NOTIFICATION_TYPE.LEAVE_REQUEST]: <CalendarMonth className="fs-32" />,
  [NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED]: <ThumbUpAlt className="fs-32" />,
  [NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED]: <ThumbDownAlt className="fs-32" />,
  [NOTIFICATION_TYPE.BIRTHDAY]: <Cake className="fs-36" />,
  [NOTIFICATION_TYPE.WORK_ANNIVERSARY]: <Celebration className="fs-36" />,
}

const initialPaginationValue = { pageNo: 1, records: 10 }

export default function HeaderNotificationMenu() {
  const intl = useIntl();
  const { formatMessage: i } = intl;
  const [notificationList, setNotificationList] = useState<NotificationModel[]>([]);
  const [notificationCount, setNotificationCount] = useState({
    totalNotification: 0,
    unread: 0
  })
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const [paginationValues, setPaginationValues] = useState(initialPaginationValue);
  const id = open ? 'notification-popover' : undefined;
  const [activeTab, setActiveTab] = useState(1);
  const navigate = useNavigate();

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
    setPaginationValues(initialPaginationValue);
    setNotificationList([]);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLoadMoreNotification = () => {
    setPaginationValues({
      ...paginationValues,
      pageNo: paginationValues.pageNo + 1,
    })
  }

  const handleNewNotification = useCallback((notification: NotificationModel) => {
    if (document.visibilityState === "hidden" && Notification.permission === "granted") {
      createNotifications(notification, intl);
    }
    else {
      // show custom toast
      showCustomToast(notification);
    }
    // Prepend new notification to the existing list
    setNotificationList(prev => [notification, ...prev,]);
    setNotificationCount(prev => ({ ...prev, totalNotification: prev.totalNotification + 1, unread: prev.unread + 1 }));
  }, [intl]);

  const handleMarkAllAsRead = async () => {
    try {
      const { data } = await markAllNotificationAsRead();
      if (data.success) {
        // setAnchorEl(null);
        setNotificationCount(prev => ({ ...prev, unread: 0 }));
        setNotificationList(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  }
  const connection = Connector.getInstance().getConnection();

  useEffect(() => {
    if (!connection) return;
    connection.on("notification", handleNewNotification);
    return () => {
      connection.off("notification", handleNewNotification);
    };
  }, [connection, handleNewNotification])

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const payload: NotificationRequestPayload = {
          type: activeTab === 1 ? "all" : "unread",
          pageNo: paginationValues.pageNo,
          records: paginationValues.records
        }
        const { data } = await getNotifications(payload);
        if (data.success) {
          setNotificationList(prev => {
            const existingIds = new Set(prev.map(n => n.userNotificationId));
            const newItems = data.methodResult.notificationList.filter(
              n => !existingIds.has(n.userNotificationId)
            );
            return [...prev, ...newItems];
          });

          setNotificationCount({ totalNotification: data.methodResult.all, unread: data.methodResult.unread })
        }
      }
      catch (error) {
        console.log((error as Error).message);
      }
      finally {
        setIsLoading(false);
      }
    })();
  }, [activeTab, paginationValues.pageNo, paginationValues.records])


  const handleMarkNotificationAsRead = async (userNotificationId: string) => {
    try {
      const { data } = await markNotificationAsRead(userNotificationId);
      if (data.success) {
        if (activeTab == 1) {
          setNotificationList(notificationList.map(notification => {
            if (notification.userNotificationId !== userNotificationId) {
              return notification;
            }
            return {
              ...notification,
              isRead: true
            }
          }));
        }
        else {
          setNotificationList(notificationList.filter(notification => notification.userNotificationId !== userNotificationId));
        }
        setNotificationCount({ ...notificationCount, unread: notificationCount.unread - 1 });
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  }

  const handleNotificationClick = (notification: NotificationModel) => {
    if (!notification.isRead) {
      handleMarkNotificationAsRead(notification.userNotificationId);
    }
    redirectUserToTargetUrl(notification, navigate);
    setAnchorEl(null);
  }


  return (
    <>
      <Tooltip title={i({ id: "TOOLTIP.NOTIFICATIONS" })} placement="bottom">
        <Badge badgeContent={notificationCount.unread || undefined} color="primary" aria-live="polite">
          <AppIconButton
            onClick={handleClick}
            aria-describedby={id}
            sx={{ border: 0, p: 0 }}
            role="button"
            aria-label="notification menu"
          >
            <NotificationsActive className="fs-32" />
          </AppIconButton>
        </Badge>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        className="notification-menu"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 250,
              width: 400,
            }
          }
        }}
      >
        <Box component="div" className="px-4 pt-4"  >
          <Stack className="flex-row justify-content-between align-items-center">
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>{i({ id: "NOTIFICATION.TITLE" })}</Typography>
            {
              notificationCount.unread > 0 &&
              <Box component="span" sx={{ color: "primary.main", cursor: "pointer" }} onClick={handleMarkAllAsRead}  >
                {i({ id: "BUTTON.MARK_ALL_AS_READ" })}
              </Box>
            }
          </Stack>

          <Stack direction="row" spacing={2} className="notification-menu-tabList" aria-label="notifications tabs">
            <Stack onClick={() => handleTabChange(1)} className={clsx({ "active-tab": activeTab === 1 })}>
              <span>{i({ id: "NOTIFICATION.ALL" })}</span>
              <Chip label={notificationCount.totalNotification} size="small" color="secondary" />
            </Stack>
            <Stack onClick={() => handleTabChange(2)} className={clsx({ "active-tab": activeTab === 2 })}>
              <span>{i({ id: "NOTIFICATION.NEW" })}</span>
              <Chip label={notificationCount.unread} size="small" color="secondary" />
            </Stack>
          </Stack>
        </Box>
        <Stack>
          <List disablePadding className="notification-wrapper" >
            {isLoading && notificationList.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : notificationList.length > 0 ? (
              notificationList.map(item => (
                <ListItem
                  key={item.userNotificationId}
                  disablePadding
                  className={clsx({ "unread-notification": !item.isRead })}
                  onClick={() => handleNotificationClick(item)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(item);
                    }
                  }}
                >
                  <Stack sx={{ bgcolor: "secondary.light" }}>
                    <Stack sx={{ alignItems: "center", justifyContent: "center", color: "secondary.darker" }} >{NotificationIconMapper[item.notificationTypes] ?? <NotificationsActive className="fs-32" />} </Stack>
                  </Stack>
                  <ListItemText
                    primary={<Typography fontWeight={item.targetId?.startsWith("attendance-review-") ? 700 : undefined}>{item.targetId?.startsWith("attendance-review-") ? item.title : getNotificationTitle(item, intl)}</Typography>}
                    secondary={
                      <Box component="span">
                        {item.targetId?.startsWith("attendance-review-") && <Typography variant="caption" component="span" sx={{ color: "text.secondary", display: "block", lineHeight: 1.35 }}>{item.body}</Typography>}
                        <Box component="span" className="d-flex align-items-center gap-1">
                          <AccessTime className="fs-16" />
                          <Typography variant="caption" sx={{ color: "text.secondary" }}> {relativeTimeFormatter(item.sentDateTime)}</Typography>
                        </Box>
                      </Box>} />
                </ListItem>
              ))
            ) : (
              <Box component="div" sx={{ height: "100%" }} className="no-notification-box">
                <img src={toAbsoluteUrl("media/Icons/no-notification.png")} alt="no notifications" />
                <Typography sx={{ color: "text.secondary" }}>{i({ id: "NOTIFICATION.NONE" })}</Typography>
              </Box>
            )}
          </List>
          {
            (activeTab == 1 ? notificationList.length < notificationCount.totalNotification :
              notificationList.length < notificationCount.unread) &&
            <Box component="span" sx={{ color: "primary.main", cursor: "pointer", mx: 2, mb: 1, fontSize: 12 }} onClick={handleLoadMoreNotification} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); handleLoadMoreNotification(); } }} >
              {i({ id: "BUTTON.SEE_MORE" })}
            </Box>
          }
        </Stack>

      </Popover >
    </>
  );
}

