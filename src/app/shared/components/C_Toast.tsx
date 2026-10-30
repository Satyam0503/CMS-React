import { toast, ToastContentProps } from "react-toastify";
import { NOTIFICATION_TYPE } from "../../../utils/enums";
import { NotificationModel } from "../../modules/users/models";
import { Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import {
  AccessTimeFilledRounded,
  CakeRounded,
  CelebrationRounded,
  CheckCircleRounded,
  HighlightOffRounded,
  MessageRounded,
  NotificationsActiveRounded,
  TaskAltRounded,
} from "@mui/icons-material";
import { getNotificationTitle, relativeTimeFormatter } from "../../../utils/common";

type CustomToastComponentProps = Partial<ToastContentProps> & {
  notificationData: NotificationModel;
};

export const showCustomToast = (notification: NotificationModel) => {
  toast(<CustomNotificationWithAction notificationData={notification} />, {
    autoClose: 5000,
    className: "app-toast app-toast--notification",
    icon: false,
  });
};

const getNotificationMeta = (notification: NotificationModel) => {
  const isAttendance = Boolean(notification.targetId?.startsWith("attendance-review-"));

  switch (notification.notificationTypes) {
    case NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED:
    case NOTIFICATION_TYPE.WORK_FROM_HOME_APPROVED:
      return {
        category: "Approved",
        color: "#16a34a",
        bg: "rgba(22, 163, 74, 0.12)",
        icon: <CheckCircleRounded sx={{ fontSize: 20, color: "#16a34a" }} />,
      };
    case NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED:
    case NOTIFICATION_TYPE.WORK_FROM_HOME_REJECTED:
      return {
        category: "Rejected",
        color: "#dc2626",
        bg: "rgba(220, 38, 38, 0.12)",
        icon: <HighlightOffRounded sx={{ fontSize: 20, color: "#dc2626" }} />,
      };
    case NOTIFICATION_TYPE.BIRTHDAY:
      return {
        category: "Birthday",
        color: "#d97706",
        bg: "rgba(217, 119, 6, 0.12)",
        icon: <CakeRounded sx={{ fontSize: 20, color: "#d97706" }} />,
      };
    case NOTIFICATION_TYPE.WORK_ANNIVERSARY:
      return {
        category: "Anniversary",
        color: "#9333ea",
        bg: "rgba(147, 51, 234, 0.12)",
        icon: <CelebrationRounded sx={{ fontSize: 20, color: "#9333ea" }} />,
      };
    case NOTIFICATION_TYPE.MESSAGE:
      return {
        category: "Message",
        color: "#2563eb",
        bg: "rgba(37, 99, 235, 0.12)",
        icon: <MessageRounded sx={{ fontSize: 20, color: "#2563eb" }} />,
      };
    case NOTIFICATION_TYPE.NOTICE:
      return {
        category: "Notice",
        color: "#0891b2",
        bg: "rgba(8, 145, 178, 0.12)",
        icon: <NotificationsActiveRounded sx={{ fontSize: 20, color: "#0891b2" }} />,
      };
    case NOTIFICATION_TYPE.LEAVE_REQUEST:
    case NOTIFICATION_TYPE.WORK_FROM_HOME_REQUEST:
      return {
        category: "Request",
        color: "#0284c7",
        bg: "rgba(2, 132, 199, 0.12)",
        icon: <AccessTimeFilledRounded sx={{ fontSize: 20, color: "#0284c7" }} />,
      };
    default:
      if (isAttendance) {
        return {
          category: "Attendance",
          color: "#0d9488",
          bg: "rgba(13, 148, 136, 0.12)",
          icon: <TaskAltRounded sx={{ fontSize: 20, color: "#0d9488" }} />,
        };
      }
      return {
        category: "Update",
        color: "#0d9488",
        bg: "rgba(13, 148, 136, 0.12)",
        icon: <NotificationsActiveRounded sx={{ fontSize: 20, color: "#0d9488" }} />,
      };
  }
};

const CustomNotificationWithAction = ({ notificationData, closeToast }: CustomToastComponentProps) => {
  const intl = useIntl();
  const title = getNotificationTitle(notificationData, intl);
  const { formatMessage: i } = intl;
  const meta = getNotificationMeta(notificationData);

  const hasTarget = Boolean(
    notificationData.targetId ||
    notificationData.notificationTypes === NOTIFICATION_TYPE.LEAVE_REQUEST ||
    notificationData.notificationTypes === NOTIFICATION_TYPE.WORK_FROM_HOME_REQUEST ||
    notificationData.notificationTypes === NOTIFICATION_TYPE.WORK_FROM_HOME_APPROVED ||
    notificationData.notificationTypes === NOTIFICATION_TYPE.WORK_FROM_HOME_REJECTED ||
    notificationData.notificationTypes === NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED ||
    notificationData.notificationTypes === NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED ||
    notificationData.notificationTypes === NOTIFICATION_TYPE.NOTICE
  );

  const handleNavigate = () => {
    window.dispatchEvent(
      new CustomEvent("codeji:notification-click", { detail: notificationData })
    );
    closeToast?.(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        width: "100%",
        cursor: hasTarget ? "pointer" : "default",
      }}
      onClick={() => {
        if (hasTarget) handleNavigate();
      }}
    >
      {/* Icon Badge */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: meta.bg,
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {meta.icon}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 0.25 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: meta.color,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.68rem",
            }}
          >
            {meta.category}
          </Typography>
          {notificationData.sentDateTime && (
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
              {relativeTimeFormatter(notificationData.sentDateTime)}
            </Typography>
          )}
        </Stack>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.35,
            fontSize: "0.85rem",
            mb: notificationData.body && notificationData.body !== title ? 0.35 : 0.6,
          }}
        >
          {title}
        </Typography>

        {notificationData.body && notificationData.body !== title && (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.78rem",
              lineHeight: 1.35,
              mb: 0.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {notificationData.body}
          </Typography>
        )}

        {/* Footer Actions */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {hasTarget && (
            <Typography
              variant="caption"
              component="button"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate();
              }}
              sx={{
                fontWeight: 700,
                color: "primary.main",
                fontSize: "0.75rem",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View details →
            </Typography>
          )}
          <button
            type="button"
            className="app-toast__dismiss"
            onClick={(e) => {
              e.stopPropagation();
              closeToast?.(true);
            }}
          >
            {i({ id: "BUTTON.DISMISS" })}
          </button>
        </Stack>
      </Box>
    </Box>
  );
};
