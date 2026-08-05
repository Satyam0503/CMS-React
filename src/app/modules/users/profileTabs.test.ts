import { describe, expect, it } from "vitest";
import { getProfileTabs, isLeaveTabEnabled } from "./profileTabs";

describe("profile tabs visibility", () => {
  it("uses leave-management permission for leave tab visibility", () => {
    expect(isLeaveTabEnabled(["NoticeBoard.View"])).toBe(false);
    expect(isLeaveTabEnabled(["LeaveManagement.View"])).toBe(true);
  });

  it("keeps leave tab hidden for employees without leave access", () => {
    const tabs = getProfileTabs(["NoticeBoard.View"], "employee-1");
    const leaveTab = tabs.find((tab) => tab.to === "leave");

    expect(leaveTab).toBeUndefined();
  });

  it("shows leave tab for employees with leave-management view access", () => {
    const tabs = getProfileTabs(["LeaveManagement.View"], "employee-1");
    const leaveTab = tabs.find((tab) => tab.to === "leave");

    expect(leaveTab).toBeDefined();
    expect(leaveTab?.isActive).toBe(true);
  });
});
