import { toast, ToastContentProps } from "react-toastify";
import { NOTIFICATION_TYPE } from "../../../utils/enums";
import { NotificationModel } from "../../modules/users/models";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { NotificationIconMapper } from "../../../_themes/layout/components/header/navbarmenus/HeaderNotificationMenu";
import { Message } from "@mui/icons-material";


type CustomToastComponentProps = Partial<ToastContentProps> & {
    notificationData: NotificationModel
};

export const showCustomToast = (notification: NotificationModel) => {
    switch (notification.notificationTypes) {
        case NOTIFICATION_TYPE.NOTICE:
            toast(<CustomNotificationWithAction notificationData={notification} />, {
                autoClose: 1500,
                hideProgressBar: true,
                closeButton: false,
                className: "p-3 shadow"
            });
            break;

        case NOTIFICATION_TYPE.MESSAGE:
            toast(<CustomMessageToast notificationData={notification} />, {
                autoClose: 1500,
                closeButton: false,
                className: "p-3 shadow"
            });
            break;
        default: toast(notification.title);
    }
}

const CustomNotificationWithAction = ({ notificationData, closeToast }: CustomToastComponentProps) => {
    const { formatMessage } = useIntl();
    return (
        <Stack className="flex-column gap-1 overflow-hidden w-100">
            <Stack className="flex-row gap-2 align-items-center">
                <Box sx={{ width: 24, height: 24, color: 'text.primary' }}>
                    {NotificationIconMapper[notificationData.notificationTypes]}
                </Box>
                <Typography variant="subtitle2" sx={{ color: "text.primary" }} className="fw-bold">{formatMessage({ id: "Toast.NotificationType.Notice.Title" })}</Typography>
            </Stack>
            <Typography variant="body2" className="text-truncate ms-8">{notificationData.title}</Typography>
            <span aria-label="close button" role="button" className="fw-bold d-inline-block ms-8 mt-1" onClick={closeToast}>
                {formatMessage({ id: "BUTTON.DISMISS" })}
            </span>
        </Stack>
    )
}
const CustomMessageToast = ({ closeToast, notificationData }: CustomToastComponentProps) => {
    const { formatMessage } = useIntl();
    return (
        <Stack className="flex-column gap-1 overflow-hidden">
            <Stack className="flex-row gap-2 align-items-center">
                <Avatar className="align-self-start" sx={{ bgcolor: 'secondary.lighter', width: 40, height: 40 }}>
                    <Message sx={{ color: "secondary.dark" }} />
                </Avatar>
                <Stack className="gap-1">
                    <Typography variant="subtitle2" sx={{ color: "text.secondary" }} className="fw-bold">{formatMessage({ id: "Toast.NotificationType.Message.Title" })}</Typography>
                    <Typography variant="body1">{formatMessage({ id: "Toast.Message.Content" }, { userName: notificationData.sentBy })}</Typography>
                </Stack>
            </Stack>
            <span aria-label="View button" role="button" className="fw-bold align-self-start ms-12 mt-1" onClick={closeToast}>
                {formatMessage({ id: "BUTTON.DISMISS" })}
            </span>
        </Stack>
    )
}