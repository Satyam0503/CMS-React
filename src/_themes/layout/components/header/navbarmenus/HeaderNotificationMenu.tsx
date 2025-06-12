import {
  Badge,
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
import { Cake, CircleNotifications, NotificationsOutlined } from "@mui/icons-material";
import { useIntl } from "react-intl";
import Connector from "../../../../../server/SignalR";
import { NotificationModel } from "../../../../../app/modules/users/models";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { getNotifications } from "../../../../../app/modules/users/userservices";
import { relativeTimeFormatter } from "../../../../../utils/common";
import clsx from "clsx";
import { NOTIFICATION_TYPE } from "../../../../../utils/enums";

export const NotificationIconMapper: {
  [index: number]: ReactNode
} = {
  [NOTIFICATION_TYPE.NOTICE]: <CircleNotifications />,
  [NOTIFICATION_TYPE.ALERT]: <Cake />,
}


export default function HeaderNotificationMenu() {
  const { formatMessage } = useIntl();
  const [notificationList, setNotificationList] = useState<NotificationModel[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;
  const [activeTab, setActiveTab] = useState(1);

  const handleChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const connection = Connector.getInstance().getConnection();
    if (!connection) return;
    const handleNewNotification = (notice: NotificationModel) => {
      // Prepend the new notification to the existing list
      console.log(notice);

      setNotificationList((prevList) => [notice, ...prevList]);
    };
    connection.on("noticeNofity", handleNewNotification);
    return () => {
      connection.off("noticeNofity", handleNewNotification);
    };
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getNotifications();
        if (data.success) {
          setNotificationList(data.methodResults);
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
  return (
    <>
      <Tooltip title="Notifications" placement="bottom">
        <Badge badgeContent={unReadNotificationCount} color="primary">
          <IconButton
            onClick={handleClick}
            aria-describedby={id}
            sx={{ border: 0, p: 0 }}
          >
            <NotificationsOutlined fontSize="large" />
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
              padding: 2
            }
          }
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>{formatMessage({ id: "Notifications" })}</Typography>
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

        <List disablePadding className="notification-wrapper" >
          {
            filteredNotificationList.length > 0 ?
              filteredNotificationList.map(item => (
                <ListItem key={item.userNotificationId} disablePadding className={clsx({ "unread-notification": !item.isRead })}>
                  <Stack sx={{ bgcolor: "secondary.light" }}>
                    <Stack sx={{ alignItems: "center", justifyContent: "center", color: "secondary.dark" }} >{NotificationIconMapper[item.notificationTypes]} </Stack>
                  </Stack>
                  <ListItemText primary={item.title} secondary={relativeTimeFormatter(item.sentDateTime)} />
                </ListItem>
              ))
              :
              <ListItem>
                <ListItemText primary={<Typography variant="h6" sx={{ textAlign: "center" }}>{formatMessage({ id: "Notifications.None" })}</Typography>} />
              </ListItem>
          }
        </List>

      </Popover >
    </>
  );
}

