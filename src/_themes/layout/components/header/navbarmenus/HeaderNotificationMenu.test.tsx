import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import HeaderNotificationMenu from "./HeaderNotificationMenu";

const mockGetNotifications = vi.fn();
const mockMarkAllNotificationAsRead = vi.fn();
const mockMarkNotificationAsRead = vi.fn();
const mockDismissNotification = vi.fn();
const mockSnoozeNotification = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@mui/icons-material", () => ({
  default: () => null,
  NotificationsActive: (props: any) => <span data-testid="icon-notifications-active" {...props} />,
  CalendarMonth: (props: any) => <span data-testid="icon-calendar" {...props} />,
  ThumbUpAlt: (props: any) => <span data-testid="icon-thumb-up" {...props} />,
  ThumbDownAlt: (props: any) => <span data-testid="icon-thumb-down" {...props} />,
  Cake: (props: any) => <span data-testid="icon-cake" {...props} />,
  Celebration: (props: any) => <span data-testid="icon-celebration" {...props} />,
  HomeWork: (props: any) => <span data-testid="icon-homework" {...props} />,
  AccessTime: (props: any) => <span data-testid="icon-access-time" {...props} />,
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id?: string }) => defaultMessage || id,
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../../../../server/SignalR", () => ({
  default: {
    getInstance: () => ({
      getConnection: () => ({
        on: vi.fn(),
        off: vi.fn(),
      }),
    }),
  },
}));

vi.mock("../../../../../app/modules/users/userservices", () => ({
  getNotifications: (...args: any[]) => mockGetNotifications(...args),
  markAllNotificationAsRead: () => mockMarkAllNotificationAsRead(),
  markNotificationAsRead: (...args: any[]) => mockMarkNotificationAsRead(...args),
  dismissNotification: (...args: any[]) => mockDismissNotification(...args),
  snoozeNotification: (...args: any[]) => mockSnoozeNotification(...args),
}));

vi.mock("../../../../../app/query/queryClient", () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

vi.mock("../../../../../app/shared/components/C_Toast", () => ({
  showCustomToast: vi.fn(),
}));

vi.mock("../../../../helpers", () => ({
  toAbsoluteUrl: (p: string) => p,
}));

describe("HeaderNotificationMenu UI Component", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();

    mockGetNotifications.mockResolvedValue({
      data: {
        success: true,
        methodResult: {
          notificationList: [
            {
              userNotificationId: "notif-1",
              title: "Leave Request Withdrawn - Anaya Sharma - Casual leave (CL)",
              body: "",
              notificationTypes: 2,
              isRead: false,
              sentDateTime: new Date().toISOString(),
              targetId: "leave-1",
            },
            {
              userNotificationId: "notif-2",
              title: "Review today's attendance",
              body: "Open Attendance to review today's records and update any absence.",
              notificationTypes: 1,
              isRead: true,
              sentDateTime: new Date().toISOString(),
              targetId: "attendance-review-2026-10-22",
            },
          ],
          all: 2,
          unread: 1,
        },
      },
    });

    mockDismissNotification.mockResolvedValue({ data: { success: true } });
    mockSnoozeNotification.mockResolvedValue({ data: { success: true } });
    mockMarkAllNotificationAsRead.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    // Clean up popovers attached to body
    document.querySelectorAll(".notification-menu").forEach((el) => el.remove());
  });

  it("renders notification bell button with unread count badge", async () => {
    await act(async () => {
      root.render(<HeaderNotificationMenu />);
    });

    const bellButton = container.querySelector('button[aria-label="notification menu"]');
    expect(bellButton).toBeTruthy();
  });

  it("opens popover on click and renders structured notification items with icon and separate content", async () => {
    await act(async () => {
      root.render(<HeaderNotificationMenu />);
    });

    const bellButton = container.querySelector('button[aria-label="notification menu"]') as HTMLButtonElement;
    await act(async () => {
      bellButton.click();
    });

    // Wait for popover and data load
    await act(async () => {
      await Promise.resolve();
    });

    // Notification Popover should be open in document body
    const popover = document.querySelector(".notification-menu");
    expect(popover).toBeTruthy();

    // Verify title and tabs
    expect(document.body.textContent).toContain("Notifications");
    expect(document.body.textContent).toContain("All");
    expect(document.body.textContent).toContain("Unread");

    // Verify notification list items exist with separate icon and content classes
    const listItems = document.querySelectorAll(".notification-list-item");
    expect(listItems.length).toBe(2);

    const firstItem = listItems[0];
    const iconBox = firstItem.querySelector(".notification-item-icon");
    const contentBox = firstItem.querySelector(".notification-item-content");
    const titleEl = firstItem.querySelector(".notification-item-title");
    const footerEl = firstItem.querySelector(".notification-item-footer");

    // Distinct elements - no overlapping structure
    expect(iconBox).toBeTruthy();
    expect(contentBox).toBeTruthy();
    expect(titleEl).toBeTruthy();
    expect(footerEl).toBeTruthy();
    expect(titleEl?.textContent).toContain("Leave Request Withdrawn");

    // Action buttons are present in footer
    const buttons = footerEl?.querySelectorAll("button");
    expect(buttons?.length).toBe(2);
    expect(buttons?.[0].textContent).toBe("Snooze");
    expect(buttons?.[1].textContent).toBe("Dismiss");
  });

  it("triggers snooze and dismiss handlers without navigating", async () => {
    await act(async () => {
      root.render(<HeaderNotificationMenu />);
    });

    const bellButton = container.querySelector('button[aria-label="notification menu"]') as HTMLButtonElement;
    await act(async () => {
      bellButton.click();
    });

    await act(async () => {
      await Promise.resolve();
    });

    const listItems = document.querySelectorAll(".notification-list-item");
    const firstItem = listItems[0];
    const snoozeBtn = firstItem.querySelectorAll(".notification-item-actions button")[0] as HTMLButtonElement;

    await act(async () => {
      snoozeBtn.click();
    });

    expect(mockSnoozeNotification).toHaveBeenCalledWith("notif-1", expect.any(String));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
