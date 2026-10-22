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
});
