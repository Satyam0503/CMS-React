import { IntlShape } from "react-intl";
import { NotificationModel } from "../../users/models";
import { NOTIFICATION_TYPE } from "../../../../utils/enums";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { getNotificationTitle } from "../../../../utils/common";
import { BaseUrl } from "../../../../utils/constant/Constant";

export const getNotificationOption = (type: number) => {
  let option: {
    icon?: string;
    fullUrl?: string;
  } = {};
  const hostName = BaseUrl;

  switch (type) {
    case NOTIFICATION_TYPE.NOTICE:
      option = {
        icon: `${toAbsoluteUrl("media/Icons/notice-icon-128.png")}`,
        fullUrl: `${hostName}/noticeboard/notices`,
      };
      break;
    case NOTIFICATION_TYPE.LEAVE_REQUEST:
      option = {
        icon: `${toAbsoluteUrl("media/Icons/leaverequest.png")}`,
        fullUrl: `${hostName}/leavemanagement/leaverequest`,
      };
      break;
    case NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED:
    case NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED:
      option = {
        icon: `${toAbsoluteUrl("media/Icons/leaverequest.png")}`,
        fullUrl: `${hostName}/profile/leave`,
      };
      break;
    case NOTIFICATION_TYPE.BIRTHDAY:
    case NOTIFICATION_TYPE.WORK_ANNIVERSARY:
      option = {
        icon: `${toAbsoluteUrl("media/Icons/birthday_cake.png")}`,
        fullUrl: `${hostName}`,
      };
      break;
    default:
      option = {
        icon: `${toAbsoluteUrl("media/Icons/notification.png")}`,
        fullUrl: `${hostName}`,
      };
      break;
  }

  return option;
};

export const createNotifications = (
  notificationModel: NotificationModel,
  intl: IntlShape
) => {
  const option = getNotificationOption(notificationModel.notificationTypes);
  const title = getNotificationTitle(notificationModel, intl);

  const notification = new Notification(title, {
    body:
      notificationModel.notificationTypes === NOTIFICATION_TYPE.NOTICE
        ? notificationModel.body.slice(0, 50)
        : "",
    icon: option?.icon,
  });

  notification.addEventListener("click", () => {
    window.focus();
  });

  setTimeout(() => {
    notification.close();
  }, 4000);
};
