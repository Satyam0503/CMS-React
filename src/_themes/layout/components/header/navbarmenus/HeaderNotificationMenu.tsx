import {
  Badge,
  Box,
  Chip,
  List,
  ListItem,
  CircularProgress,
  Popover,
  Stack,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";
import { AccessTime, Cake, CalendarMonth, Celebration, NotificationsActive, ThumbDownAlt, ThumbUpAlt } from "@mui/icons-material";
import { useIntl } from "react-intl";
import Connector from "../../../../../server/SignalR";
import { NotificationModel, NotificationRequestPayload } from "../../../../../app/modules/users/models";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { dismissNotification, getNotifications, markAllNotificationAsRead, markNotificationAsRead, snoozeNotification } from "../../../../../app/modules/users/userservices";
import { getNotificationTitle, redirectUserToTargetUrl, relativeTimeFormatter } from "../../../../../utils/common";
import clsx from "clsx";
import { NOTIFICATION_TYPE } from "../../../../../utils/enums";
import { showCustomToast } from "../../../../../app/shared/components/C_Toast";
import { useNavigate } from "react-router-dom";
import { createNotifications } from "../../../../../app/modules/dashboard/components/pushNotificationUtils";
import { toAbsoluteUrl } from "../../../../helpers";

import { AppIconButton } from "../../../../../app/shared/components/ui";
import { queryClient } from "../../../../../app/query/queryClient";

export const NotificationIconMapper: {
  [index: number]: ReactNode;
} = {
  [NOTIFICATION_TYPE.NOTICE]: <NotificationsActive className="fs-32" />,
  [NOTIFICATION_TYPE.LEAVE_REQUEST]: <CalendarMonth className="fs-32" />,
  [NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED]: <ThumbUpAlt className="fs-32" />,
  [NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED]: <ThumbDownAlt className="fs-32" />,
  [NOTIFICATION_TYPE.BIRTHDAY]: <Cake className="fs-36" />,
  [NOTIFICATION_TYPE.WORK_ANNIVERSARY]: <Celebration className="fs-36" />,
};

const renderNotificationIcon = (type: number) => {
  switch (type) {
    case NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED:
      return <ThumbUpAlt sx={{ fontSize: 19, color: "success.main" }} />;
    case NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED:
      return <ThumbDownAlt sx={{ fontSize: 19, color: "error.main" }} />;
    case NOTIFICATION_TYPE.LEAVE_REQUEST:
      return <CalendarMonth sx={{ fontSize: 19, color: "primary.main" }} />;
    case NOTIFICATION_TYPE.BIRTHDAY:
      return <Cake sx={{ fontSize: 19, color: "warning.main" }} />;
    case NOTIFICATION_TYPE.WORK_ANNIVERSARY:
      return <Celebration sx={{ fontSize: 19, color: "secondary.main" }} />;
    default:
      return <NotificationsActive sx={{ fontSize: 19, color: "primary.main" }} />;
  }
};

const getNotificationIconBg = (type: number) => {
  switch (type) {
    case NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED:
      return "rgba(46, 125, 50, 0.12)";
    case NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED:
      return "rgba(211, 47, 47, 0.12)";
    case NOTIFICATION_TYPE.LEAVE_REQUEST:
      return "rgba(41, 142, 137, 0.12)";
    case NOTIFICATION_TYPE.BIRTHDAY:
      return "rgba(237, 108, 2, 0.12)";
    case NOTIFICATION_TYPE.WORK_ANNIVERSARY:
      return "rgba(156, 39, 176, 0.12)";
    default:
      return "rgba(41, 142, 137, 0.12)";
  }
};

const initialPaginationValue = { pageNo: 1, records: 10 };

export default function HeaderNotificationMenu() {
  const intl = useIntl();
  const { formatMessage: i } = intl;
  const [notificationList, setNotificationList] = useState<NotificationModel[]>([]);
  const [notificationCount, setNotificationCount] = useState({
    totalNotification: 0,
    unread: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const [paginationValues, setPaginationValues] = useState(initialPaginationValue);
  const id = open ? "notification-popover" : undefined;
  const [activeTab, setActiveTab] = useState(1);
  const navigate = useNavigate();

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
    setPaginationValues(initialPaginationValue);
    setNotificationList([]);
  };

  const [refreshIndex, setRefreshIndex] = useState(0);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setPaginationValues(initialPaginationValue);
    setRefreshIndex((prev) => prev + 1);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLoadMoreNotification = () => {
    setPaginationValues({
      ...paginationValues,
      pageNo: paginationValues.pageNo + 1,
    });
  };

  const handleNewNotification = useCallback(
    (notification: NotificationModel) => {
      // Cross-user signal that server-backed data changed (leave requests, approvals, attendance, etc.)
      void queryClient.invalidateQueries({ refetchType: "all" });
      if (document.visibilityState === "hidden" && Notification.permission === "granted") {
        createNotifications(notification, intl);
      } else {
        showCustomToast(notification);
      }
      setNotificationList((prev) => [notification, ...prev]);
      setNotificationCount((prev) => ({
        ...prev,
        totalNotification: prev.totalNotification + 1,
        unread: prev.unread + 1,
      }));
    },
    [intl]
  );

  const handleMarkAllAsRead = async () => {
    try {
      const { data } = await markAllNotificationAsRead();
      if (data.success) {
        setNotificationCount((prev) => ({ ...prev, unread: 0 }));
        if (activeTab === 2) {
          setNotificationList([]);
        } else {
          setNotificationList((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  const connection = Connector.getInstance().getConnection();

  useEffect(() => {
    if (!connection) return;
    connection.on("notification", handleNewNotification);
    return () => {
      connection.off("notification", handleNewNotification);
    };
  }, [connection, handleNewNotification]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const payload: NotificationRequestPayload = {
          type: activeTab === 1 ? "all" : "unread",
          pageNo: paginationValues.pageNo,
          records: paginationValues.records,
        };
        const { data } = await getNotifications(payload);
        if (data.success) {
          setNotificationList((prev) => {
            if (paginationValues.pageNo === 1) {
              return data.methodResult.notificationList;
            }
            const existingIds = new Set(prev.map((n) => n.userNotificationId));
            const newItems = data.methodResult.notificationList.filter(
              (n) => !existingIds.has(n.userNotificationId)
            );
            return [...prev, ...newItems];
          });

          setNotificationCount({
            totalNotification: data.methodResult.all,
            unread: data.methodResult.unread,
          });
        }
      } catch (error) {
        console.log((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [activeTab, paginationValues.pageNo, paginationValues.records, refreshIndex]);

  const handleMarkNotificationAsRead = async (userNotificationId: string) => {
    try {
      const { data } = await markNotificationAsRead(userNotificationId);
      if (data.success) {
        if (activeTab === 1) {
          setNotificationList((prev) =>
            prev.map((notification) =>
              notification.userNotificationId === userNotificationId
                ? { ...notification, isRead: true }
                : notification
            )
          );
        } else {
          setNotificationList((prev) =>
            prev.filter((notification) => notification.userNotificationId !== userNotificationId)
          );
        }
        setNotificationCount((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  const handleNotificationClick = (notification: NotificationModel) => {
    if (!notification.isRead) {
      handleMarkNotificationAsRead(notification.userNotificationId);
    }
    redirectUserToTargetUrl(notification, navigate);
    setAnchorEl(null);
  };

  const handleDismiss = async (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    const target = notificationList.find((item) => item.userNotificationId === id);
    const { data } = await dismissNotification(id);
    if (data.success) {
      setNotificationList((current) => current.filter((item) => item.userNotificationId !== id));
      setNotificationCount((prev) => ({
        totalNotification: Math.max(0, prev.totalNotification - 1),
        unread: target && !target.isRead ? Math.max(0, prev.unread - 1) : prev.unread,
      }));
    }
  };

  const handleSnooze = async (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    const target = notificationList.find((item) => item.userNotificationId === id);
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { data } = await snoozeNotification(id, until);
    if (data.success) {
      setNotificationList((current) => current.filter((item) => item.userNotificationId !== id));
      setNotificationCount((prev) => ({
        totalNotification: Math.max(0, prev.totalNotification - 1),
        unread: target && !target.isRead ? Math.max(0, prev.unread - 1) : prev.unread,
      }));
    }
  };

  const hasMore =
    activeTab === 1
      ? notificationList.length < notificationCount.totalNotification
      : notificationList.length < notificationCount.unread;

  return (
    <>
      <Tooltip title={i({ id: "TOOLTIP.NOTIFICATIONS", defaultMessage: "Notifications" })} placement="bottom">
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
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            className: "notification-menu-paper",
            sx: {
              width: { xs: "calc(100vw - 24px)", sm: 400 },
              maxWidth: 420,
              borderRadius: 2.5,
              boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            },
          },
        }}
      >
        <Box className="notification-header" sx={{ p: "16px 16px 0 16px" }}>
          <Stack className="flex-row justify-content-between align-items-center mb-1">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "1rem" }}>
              {i({ id: "NOTIFICATION.TITLE", defaultMessage: "Notifications" })}
            </Typography>
            {notificationCount.unread > 0 && (
              <Box
                component="span"
                sx={{
                  color: "primary.main",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={handleMarkAllAsRead}
              >
                {i({ id: "BUTTON.MARK_ALL_AS_READ", defaultMessage: "Mark all as read" })}
              </Box>
            )}
          </Stack>

          <Stack direction="row" spacing={2} className="notification-menu-tabList" aria-label="notifications tabs">
            <Stack onClick={() => handleTabChange(1)} className={clsx({ "active-tab": activeTab === 1 })}>
              <span>{i({ id: "NOTIFICATION.ALL", defaultMessage: "All" })}</span>
              <Chip
                label={notificationCount.totalNotification}
                size="small"
                sx={{
                  height: 20,
                  minWidth: 20,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  bgcolor: activeTab === 1 ? "primary.main" : "action.selected",
                  color: activeTab === 1 ? "common.white" : "text.secondary",
                }}
              />
            </Stack>
            <Stack onClick={() => handleTabChange(2)} className={clsx({ "active-tab": activeTab === 2 })}>
              <span>{i({ id: "NOTIFICATION.UNREAD", defaultMessage: "Unread" })}</span>
              <Chip
                label={notificationCount.unread}
                size="small"
                sx={{
                  height: 20,
                  minWidth: 20,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  bgcolor: activeTab === 2 ? "primary.main" : "action.selected",
                  color: activeTab === 2 ? "common.white" : "text.secondary",
                }}
              />
            </Stack>
          </Stack>
        </Box>

        <Stack>
          <List disablePadding className="notification-wrapper">
            {isLoading && notificationList.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : notificationList.length > 0 ? (
              notificationList.map((item) => {
                const titleText = item.targetId?.startsWith("attendance-review-")
                  ? item.title
                  : getNotificationTitle(item, intl);
                const hasBody = Boolean(item.body) && item.body?.trim() !== titleText?.trim();

                return (
                  <ListItem
                    key={item.userNotificationId}
                    disablePadding
                    className={clsx("notification-list-item", { "unread-notification": !item.isRead })}
                    onClick={() => handleNotificationClick(item)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNotificationClick(item);
                      }
                    }}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 1.5,
                      p: "10px 12px",
                      mb: 0.75,
                      borderRadius: 1.5,
                      cursor: "pointer",
                      width: "100%",
                      boxSizing: "border-box",
                      bgcolor: item.isRead ? "transparent" : "rgba(41, 142, 137, 0.07)",
                      border: "1px solid",
                      borderColor: item.isRead ? "transparent" : "rgba(41, 142, 137, 0.2)",
                      borderLeft: item.isRead ? "3px solid transparent" : "3px solid #298e89",
                      transition: "background-color 0.15s ease, border-color 0.15s ease",
                      "&:hover": {
                        bgcolor: item.isRead ? "rgba(0, 0, 0, 0.04)" : "rgba(41, 142, 137, 0.12)",
                      },
                    }}
                  >
                    <Box
                      className="notification-item-icon"
                      sx={{
                        width: 38,
                        minWidth: 38,
                        maxWidth: 38,
                        height: 38,
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: getNotificationIconBg(item.notificationTypes),
                        mt: 0.25,
                      }}
                    >
                      {renderNotificationIcon(item.notificationTypes)}
                    </Box>

                    <Box className="notification-item-content" sx={{ flex: "1 1 0%", minWidth: 0 }}>
                      <Box className="notification-item-title-row" sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.75 }}>
                        <Typography
                          className="notification-item-title"
                          sx={{
                            fontSize: "0.84rem",
                            fontWeight: item.isRead ? 500 : 700,
                            color: "text.primary",
                            lineHeight: 1.35,
                            wordBreak: "break-word",
                          }}
                        >
                          {titleText}
                        </Typography>
                        {!item.isRead && (
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                              flexShrink: 0,
                              mt: 0.65,
                            }}
                            aria-label="unread"
                          />
                        )}
                      </Box>

                      {hasBody && (
                        <Typography
                          className="notification-item-body"
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.35,
                            mt: 0.35,
                            fontSize: "0.78rem",
                          }}
                        >
                          {item.body}
                        </Typography>
                      )}

                      <Box
                        className="notification-item-footer"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mt: 0.75,
                          pt: 0.25,
                        }}
                      >
                        <Box className="notification-item-time" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                          <AccessTime sx={{ fontSize: 13 }} />
                          <Typography variant="caption" sx={{ fontSize: "11px", color: "text.secondary" }}>
                            {relativeTimeFormatter(item.sentDateTime)}
                          </Typography>
                        </Box>

                        <Box className="notification-item-actions" sx={{ display: "flex", alignItems: "center", gap: 0.75 }} onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(event) => handleSnooze(event, item.userNotificationId)}
                            sx={{
                              minWidth: 0,
                              px: 0.9,
                              py: 0.15,
                              fontSize: 11,
                              fontWeight: 500,
                              textTransform: "none",
                              borderRadius: 1,
                              borderColor: "divider",
                              color: "text.secondary",
                              "&:hover": {
                                borderColor: "primary.main",
                                color: "primary.main",
                                bgcolor: "rgba(41, 142, 137, 0.08)",
                              },
                            }}
                          >
                            Snooze
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(event) => handleDismiss(event, item.userNotificationId)}
                            sx={{
                              minWidth: 0,
                              px: 0.9,
                              py: 0.15,
                              fontSize: 11,
                              fontWeight: 500,
                              textTransform: "none",
                              borderRadius: 1,
                              borderColor: "divider",
                              color: "text.secondary",
                              "&:hover": {
                                borderColor: "error.main",
                                color: "error.main",
                                bgcolor: "rgba(211, 47, 47, 0.08)",
                              },
                            }}
                          >
                            Dismiss
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                );
              })
            ) : (
              <Box component="div" sx={{ height: "100%" }} className="no-notification-box">
                <img src={toAbsoluteUrl("media/Icons/no-notification.png")} alt="no notifications" />
                <Typography sx={{ color: "text.secondary" }}>
                  {i({ id: "NOTIFICATION.NONE", defaultMessage: "No notifications" })}
                </Typography>
              </Box>
            )}
          </List>

          {hasMore && (
            <Box className="notification-footer" sx={{ p: 1, textAlign: "center", borderTop: 1, borderColor: "divider" }}>
              <Button
                variant="text"
                size="small"
                onClick={handleLoadMoreNotification}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "primary.main",
                }}
              >
                {i({ id: "BUTTON.SEE_MORE", defaultMessage: "See More" })}
              </Button>
            </Box>
          )}
        </Stack>
      </Popover>
    </>
  );
}
