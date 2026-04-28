import { Card, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useAppSelector } from "../../../Redux/hooks";
import { NotificationsActive } from "@mui/icons-material";

const PushNotification = () => {
    const { formatMessage } = useIntl();
    const isAuthenticated = useAppSelector(state => state.auth.isUserAuthenticated);
    const requestUserPermission = async () => {
        if (!("Notification" in window)) {
            console.log("Your browser does not support notifications.");
            return;
        }
        if (isAuthenticated && Notification.permission === "default") {
            await Notification.requestPermission();
        }
    }
    return <Card className="push-notification-card">
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