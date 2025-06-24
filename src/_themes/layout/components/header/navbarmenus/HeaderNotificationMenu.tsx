import {
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { AccessTime, Cake, CircleNotifications, NotificationsOutlined } from "@mui/icons-material";
import { useIntl } from "react-intl";
import Connector from "../../../../../server/SignalR";
import { NotificationModel } from "../../../../../app/modules/users/models";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { getNotifications, markAllNotificationAsRead, markNotificationAsRead } from "../../../../../app/modules/users/userservices";
import { relativeTimeFormatter } from "../../../../../utils/common";
import clsx from "clsx";
import { NOTIFICATION_TYPE } from "../../../../../utils/enums";
import { showCustomToast } from "../../../../../app/shared/components/CustomToastComponents";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { createNotifications } from "../../../../../app/modules/dashboard/components/PushNotification";

export const NotificationIconMapper: {
  [index: number]: ReactNode
} = {
  [NOTIFICATION_TYPE.NOTICE]: <CircleNotifications />,
  [NOTIFICATION_TYPE.ALERT]: <Cake />,
}
const redirectUserToUrl = (notification: NotificationModel, navigate: NavigateFunction) => {
  switch (notification.notificationTypes) {
    case NOTIFICATION_TYPE.NOTICE: {
      navigate("/noticeboard/notices");
      break;
    }
  }
}

export default function HeaderNotificationMenu() {
  const { formatMessage } = useIntl();
  const [notificationList, setNotificationList] = useState<NotificationModel[]>([]);
  const [totalNotification, setTotalNotification] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const [paginationValues, setPaginationValues] = useState({ pageNo: 1, records: 10 });
  const id = open ? 'notification-popover' : undefined;
  const [activeTab, setActiveTab] = useState(1);
  const navigate = useNavigate();

  const handleChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleNewNotification = (notification: NotificationModel) => {
    if (document.visibilityState === "hidden") {
      createNotifications(notification);
    }
    else {
      // show custom toast
      showCustomToast(notification);
    }
    // Prepend new notification to the existing list
    setNotificationList((prevList) => [notification, ...prevList]);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { data } = await markAllNotificationAsRead();
      if (data.success) {
        setAnchorEl(null);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    const connection = Connector.getInstance().getConnection();
    if (!connection) return;
    connection.on("noticeNofity", handleNewNotification);
    return () => {
      connection.off("noticeNofity", handleNewNotification);
    };
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getNotifications(paginationValues.pageNo, paginationValues.records);
        if (data.success) {
          setNotificationList(data.methodResult.notificationList);
          setTotalNotification(data.methodResult.all);
        } else {
          console.log("Failed to Fetch Notifications");
        }
      }
      catch {
        console.log("Failed to Fetch Notifications");
      }
    })();
  }, [])

  const filteredNotificationList = useMemo(() => {
    if (activeTab === 1) return notificationList;
    if (activeTab === 2) return notificationList.filter(item => !item.isRead);
    return notificationList.filter(item => item.isRead);
  }, [notificationList, activeTab]);

  const unReadNotificationCount = useMemo(() => notificationList.length === 0 ? 0 : notificationList.filter(item => !item.isRead).length, [notificationList]);

  const handleMarkNotificationAsRead = async (userNotificationId: string) => {
    try {
      const { data } = await markNotificationAsRead(userNotificationId);
      if (data.success) {
        setNotificationList(notificationList.map(notification => {
          if (notification.userNotificationId !== userNotificationId) {
            return notification;
          }
          return {
            ...notification,
            isRead: true
          }
        }))
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  const handleNotificationClick = (notification: NotificationModel) => {
    if (!notification.isRead) {
      handleMarkNotificationAsRead(notification.userNotificationId);
    }
    redirectUserToUrl(notification, navigate);
    setAnchorEl(null);
  }


  return (
    <>
      <Tooltip title="Notifications" placement="bottom">
        <Badge badgeContent={unReadNotificationCount} color="primary">
          <IconButton
            onClick={handleClick}
            aria-describedby={id}
            sx={{ border: 0, p: 0 }}
          >
            <NotificationsOutlined className="icon-fs-32" />
          </IconButton>
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
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>{formatMessage({ id: "Notifications" })}</Typography>
            <Box component="span" sx={{ color: "primary.main", cursor: "pointer" }} onClick={handleMarkAllAsRead}  >
              {formatMessage({ id: "MARK_ALL_AS_READ" })}
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} className="notification-menu-tabList" aria-label="notifications tabs">
            <Stack onClick={() => handleChange(1)} className={clsx({ "active-tab": activeTab === 1 })}>
              <span>{formatMessage({ id: "Notifications.All" })}</span>
              <Chip label={notificationList.length} size="small" color="secondary" />
            </Stack>
            <Stack onClick={() => handleChange(2)} className={clsx({ "active-tab": activeTab === 2 })}>
              <span>{formatMessage({ id: "Notifications.New" })}</span>
              <Chip label={unReadNotificationCount} size="small" color="secondary" />
            </Stack>
            <Stack onClick={() => handleChange(3)} className={clsx({ "active-tab": activeTab === 3 })}>
              <span>{formatMessage({ id: "Notifications.Read" })}</span>
              <Chip label={notificationList.length - unReadNotificationCount} size="small" color="secondary" />
            </Stack>
          </Stack>
        </Box>
        <Stack>
          <List disablePadding className="notification-wrapper" >
            {
              filteredNotificationList.length > 0 ?
                filteredNotificationList.map(item => (
                  <ListItem key={item.userNotificationId} disablePadding className={clsx({ "unread-notification": !item.isRead })} onClick={() => handleNotificationClick(item)} >
                    <Stack sx={{ bgcolor: "secondary.light" }}>
                      <Stack sx={{ alignItems: "center", justifyContent: "center", color: "secondary.dark" }} >{NotificationIconMapper[item.notificationTypes]} </Stack>
                    </Stack>
                    <ListItemText primary={item.title} secondary={
                      <Box component="div" className="d-flex align-items-center gap-1">
                        <AccessTime className="icon-fs-16" />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}> {relativeTimeFormatter(item.sentDateTime)}</Typography>
                      </Box>} />
                  </ListItem>
                ))
                :
                <ListItem>
                  <ListItemText primary={<Typography variant="h6" sx={{ textAlign: "center" }}>{formatMessage({ id: "Notifications.None" })}</Typography>} />
                </ListItem>
            }
          </List>
          <Box component="span" sx={{ color: "primary.main", cursor: "pointer", mx: 2, mb: 1 }} onClick={handleMarkAllAsRead}  >
            {formatMessage({ id: "SEE_MORE" })}
          </Box>
        </Stack>

      </Popover >
    </>
  );
}

