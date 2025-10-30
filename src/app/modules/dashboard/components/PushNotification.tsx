import { Card, Typography } from "@mui/material"
import { IntlShape, useIntl } from "react-intl"
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useAppSelector } from "../../../Redux/hooks";
import { NotificationsActive } from "@mui/icons-material";
import { NotificationModel } from "../../users/models";
import { NOTIFICATION_TYPE } from "../../../../utils/enums";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { getNotificationTitle } from "../../../../utils/common";
import { BaseUrl } from "../../../../utils/constant/Constant";


export const getNotificationOption = (type: number) => {
    let option: {
        icon?: string,
        fullUrl?: string,
    } = {}
    const hostName = BaseUrl;
    switch (type) {
        case NOTIFICATION_TYPE.NOTICE: (
            option = {
                icon: `${toAbsoluteUrl("media/Icons/notice-icon-128.png")}`,
                fullUrl: `${hostName}/noticeboard/notices`
            })
            break;
        case NOTIFICATION_TYPE.LEAVE_REQUEST: (
            option = {
                icon: `${toAbsoluteUrl("media/Icons/leaverequest.png")}`,
                fullUrl: `${hostName}/leavemanagement/leaverequest`
            })
            break;
        case NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED:
        case NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED: (
            option = {
                icon: `${toAbsoluteUrl("media/Icons/leaverequest.png")}`,
                fullUrl: `${hostName}/profile/leave`
            })
            break;
        case NOTIFICATION_TYPE.BIRTHDAY: (
            option = {
                icon: `${toAbsoluteUrl("media/Icons/birthday_cake.png")}`,
                fullUrl: `${hostName}`
            })
            break;
        case NOTIFICATION_TYPE.WORK_ANNIVERSARY: (
            option = {
                icon: `${toAbsoluteUrl("media/Icons/birthday_cake.png")}`,
                fullUrl: `${hostName}`
            })
            break;
        default:
            option = {
                icon: `${toAbsoluteUrl("media/Icons/notification.png")}`,
                fullUrl: `${hostName}`
            }
            break;
    }
    return option;
}


export const createNotifications = (notificationModel: NotificationModel, intl: IntlShape) => {
    // display desktop notification when window is minimized or opened in background tab
    const option = getNotificationOption(notificationModel.notificationTypes);
    const title = getNotificationTitle(notificationModel, intl);
    const notification = new Notification(title, {
        body: notificationModel.notificationTypes == NOTIFICATION_TYPE.NOTICE ? notificationModel.body.slice(0, 50) : "",
        icon: option?.icon
    })
    // handle click event
    notification.addEventListener("click", () => {
        window.focus();
    });
    // close notification after 4s
    setTimeout(() => {
        notification.close();
    }, 4000)
}

const PushNotification = () => {
    const { formatMessage } = useIntl();
    const isAuthenticated = useAppSelector(state => state.auth.isUserAuthenticated);
    const requestUserPermission = async () => {
        if (!("Notification" in window)) {
            console.log("Your browser does not support notifications.");
            return;
        }
        if (isAuthenticated && Notification.permission === "default") {
            const permission = await Notification.requestPermission();
        }
    }
    return <Card className="push-notification-card flex-shrink-0">
        <Typography variant="h6">{formatMessage({ id: "MESSAGE.PUSH_NOTIFICATION_TITLE" })}</Typography>
        <Typography variant="body1">{formatMessage({ id: "MESSAGE.PUSH_NOTIFICATION_MESSAGE" })}</Typography>
        <CustomisedButton
            handleClick={requestUserPermission}
            label={formatMessage({ id: "BUTTON.NOTIFY_ME" })}
            Icon={<NotificationsActive />}
        />
    </Card>
}
export { PushNotification };