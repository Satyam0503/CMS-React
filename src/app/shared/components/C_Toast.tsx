import { toast, ToastContentProps } from "react-toastify";
import { NOTIFICATION_TYPE } from "../../../utils/enums";
import { NotificationModel } from "../../modules/users/models";
import { Avatar, Stack, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { NotificationIconMapper } from "../../../_themes/layout/components/header/navbarmenus/HeaderNotificationMenu";
import { Message } from "@mui/icons-material";
import { getNotificationTitle } from "../../../utils/common";


type CustomToastComponentProps = Partial<ToastContentProps> & {
    notificationData: NotificationModel
};

export const showCustomToast = (notification: NotificationModel) => {
    switch (notification.notificationTypes) {
        case NOTIFICATION_TYPE.NOTICE:
        case NOTIFICATION_TYPE.LEAVE_REQUEST:
        case NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED:
        case NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED:
        case NOTIFICATION_TYPE.BIRTHDAY:
        case NOTIFICATION_TYPE.WORK_ANNIVERSARY:
            toast(<CustomNotificationWithAction notificationData={notification} />, {
                autoClose: 2000,
                closeButton: false,
                className: "p-3 shadow"
            });
            break;
        case NOTIFICATION_TYPE.MESSAGE:
            toast(<CustomMessageToast notificationData={notification} />, {
                autoClose: 2000,
                closeButton: false,
                className: "p-3 shadow"
            });
            break;
        default: toast(<FormattedMessage id="NOTIFICATION.TITLES.FALLBACK" />);
    }
}

const CustomNotificationWithAction = ({ notificationData, closeToast }: CustomToastComponentProps) => {
    const intl = useIntl();
    const title = getNotificationTitle(notificationData, intl);
    const { formatMessage: i } = intl;
    return (
        <Stack className="flex-row gap-2 overflow-hidden w-100" >
            {NotificationIconMapper[notificationData.notificationTypes]}
            <Stack>
                <Typography>{title}</Typography>
                <span aria-label="close button" role="button" className="fw-bold d-inline-block mt-1" onClick={closeToast}>
                    {i({ id: "BUTTON.DISMISS" })}
                </span>
            </Stack>
        </Stack>
    )
}
const CustomMessageToast = ({ closeToast, notificationData }: CustomToastComponentProps) => {
    const intl = useIntl();
    const title = getNotificationTitle(notificationData, intl);
    const { formatMessage: i } = intl;
    return (
        <Stack className="flex-column gap-1 overflow-hidden">
            <Stack className="flex-row gap-2 align-items-center">
                <Avatar className="align-self-start" sx={{ bgcolor: 'secondary.lighter', width: 40, height: 40 }}>
                    <Message sx={{ color: "secondary.dark" }} />
                </Avatar>
                <Stack className="gap-1">
                    <Typography>{title}</Typography>
                    <Typography variant="body1">{notificationData.sentBy}</Typography>
                </Stack>
            </Stack>
            <span aria-label="View button" role="button" className="fw-bold align-self-start ms-12 mt-1" onClick={closeToast}>
                {i({ id: "BUTTON.DISMISS" })}
            </span>
        </Stack>
    )
}