import { describe, expect, it, vi } from "vitest";
import { formatServerDate, getNotificationTitle, redirectUserToTargetUrl } from "./common";
import { NOTIFICATION_TYPE } from "./enums";
import { NotificationModel } from "../app/modules/users/models";
import type { IntlShape } from "react-intl";

describe("formatServerDate", () => {
  it("keeps the business date in IST for UTC timestamps", () => {
    expect(formatServerDate("2026-08-12T18:30:00.000Z", "YYYY-MM-DD")).toBe("2026-08-13");
  });

  it("preserves date-only values as the calendar date instead of shifting them", () => {
    expect(formatServerDate("2026-08-12", "YYYY-MM-DD")).toBe("2026-08-12");
  });

  it("preserves midnight business-date strings without timezone conversion", () => {
    expect(formatServerDate("2026-08-13T00:00:00", "YYYY-MM-DD")).toBe("2026-08-13");
  });
});

describe("Notification titles and navigation", () => {
  const mockIntl = {
    formatMessage: vi.fn(({ id }) => `translated:${id}`),
  } as unknown as IntlShape;

  it("returns server title directly for withdrawn leave notifications", () => {
    const notification: NotificationModel = {
      userNotificationId: "unotif-1",
      title: "Leave Request Withdrawn - Anaya Sharma - Casual leave (CL)",
      body: "Anaya Sharma has withdrawn their leave request for 26 Oct 2026.",
      notificationTypes: NOTIFICATION_TYPE.NOTICE,
      sentDateTime: "2026-10-22T06:00:00Z",
      sentBy: "emp-1",
      isRead: false,
      targetId: "leave-req-123",
    };

    expect(getNotificationTitle(notification, mockIntl)).toBe(
      "Leave Request Withdrawn - Anaya Sharma - Casual leave (CL)"
    );
  });

  it("returns server title directly for cancelled leave notifications", () => {
    const notification: NotificationModel = {
      userNotificationId: "unotif-2",
      title: "Leave Request Cancelled - Casual leave (CL) - 26 Oct 2026",
      body: "Your leave request from 26 Oct 2026 to 26 Oct 2026 has been cancelled by an administrator.",
      notificationTypes: NOTIFICATION_TYPE.NOTICE,
      sentDateTime: "2026-10-22T06:00:00Z",
      sentBy: "admin-1",
      isRead: false,
      targetId: "leave-req-123",
    };

    expect(getNotificationTitle(notification, mockIntl)).toBe(
      "Leave Request Cancelled - Casual leave (CL) - 26 Oct 2026"
    );
  });

  it("redirects withdrawn leave notifications to leave management request queue", () => {
    const navigate = vi.fn();
    const notification: NotificationModel = {
      userNotificationId: "unotif-1",
      title: "Leave Request Withdrawn - Anaya Sharma - Casual leave (CL)",
      body: "Anaya Sharma has withdrawn their leave request for 26 Oct 2026.",
      notificationTypes: NOTIFICATION_TYPE.NOTICE,
      sentDateTime: "2026-10-22T06:00:00Z",
      sentBy: "emp-1",
      isRead: false,
      targetId: "leave-req-123",
    };

    redirectUserToTargetUrl(notification, navigate);

    expect(navigate).toHaveBeenCalledWith("/leavemanagement/leaverequest", {
      state: "leave-req-123",
      replace: true,
    });
  });

  it("redirects cancelled leave notifications to employee leave profile", () => {
    const navigate = vi.fn();
    const notification: NotificationModel = {
      userNotificationId: "unotif-2",
      title: "Leave Request Cancelled - Casual leave (CL) - 26 Oct 2026",
      body: "Your leave request has been cancelled by an administrator.",
      notificationTypes: NOTIFICATION_TYPE.NOTICE,
      sentDateTime: "2026-10-22T06:00:00Z",
      sentBy: "admin-1",
      isRead: false,
      targetId: "leave-req-123",
    };

    redirectUserToTargetUrl(notification, navigate);

    expect(navigate).toHaveBeenCalledWith("/profile/leave", {
      state: "leave-req-123",
      replace: true,
    });
  });
  it("redirects WFH request notifications to leave management work from home queue", () => {
    const navigate = vi.fn();
    const notification: NotificationModel = {
      userNotificationId: "unotif-wfh-1",
      title: "WFH request submitted",
      body: "Rahul Sharma (EMP001) - 26 Oct",
      notificationTypes: NOTIFICATION_TYPE.WORK_FROM_HOME_REQUEST,
      sentDateTime: "2026-10-23T06:00:00Z",
      sentBy: "emp-1",
      isRead: false,
      targetId: "wfh-req-123",
    };
    redirectUserToTargetUrl(notification, navigate);
    expect(navigate).toHaveBeenCalledWith("/leavemanagement/work-from-home", {
      state: "wfh-req-123",
      replace: true,
    });
  });

  it("redirects WFH approved and rejected notifications to employee leave profile", () => {
    const navigate = vi.fn();
    const notification: NotificationModel = {
      userNotificationId: "unotif-wfh-2",
      title: "Your Work From Home request was approved.",
      body: "WFH dates: 26 Oct 2026",
      notificationTypes: NOTIFICATION_TYPE.WORK_FROM_HOME_APPROVED,
      sentDateTime: "2026-10-23T06:00:00Z",
      sentBy: "mgr-1",
      isRead: false,
      targetId: "wfh-req-123",
    };
    redirectUserToTargetUrl(notification, navigate);
    expect(navigate).toHaveBeenCalledWith("/profile/leave", {
      state: "wfh-req-123",
      replace: true,
    });
  });

  it("generates correct WFH notification titles", () => {
    const notif: NotificationModel = {
      userNotificationId: "unotif-wfh-3",
      title: "",
      body: "",
      targetId: "",
      notificationTypes: NOTIFICATION_TYPE.WORK_FROM_HOME_REQUEST,
      sentDateTime: "2026-10-23T06:00:00Z",
      sentBy: "mgr-1",
      isRead: false,
    };
    expect(getNotificationTitle(notif, mockIntl)).toBe("Work From Home Request");
    expect(getNotificationTitle({ ...notif, notificationTypes: NOTIFICATION_TYPE.WORK_FROM_HOME_APPROVED }, mockIntl)).toBe("Work From Home Approved");
    expect(getNotificationTitle({ ...notif, notificationTypes: NOTIFICATION_TYPE.WORK_FROM_HOME_REJECTED }, mockIntl)).toBe("Work From Home Decision");
  });
});
