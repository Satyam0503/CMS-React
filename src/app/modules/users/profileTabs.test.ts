import { describe, expect, it } from "vitest";
import { getProfileTabs, isLeaveTabEnabled } from "./profileTabs";
import { Roles } from "../../../utils/enums";

describe("profile tabs visibility", () => {
  it("uses leave-management permission for leave tab visibility", () => {
    expect(isLeaveTabEnabled(["NoticeBoard.View"])).toBe(false);
    expect(isLeaveTabEnabled(["LeaveManagement.View"])).toBe(true);
  });

  it("shows the self-service leave tab to employees without admin leave-module permission", () => {
    const tabs = getProfileTabs(["NoticeBoard.View"]);
    const leaveTab = tabs.find((tab) => tab.to === "leave");

    expect(leaveTab).toBeDefined();
    expect(leaveTab?.isActive).toBe(true);
  });

  it("keeps another employee's leave tab hidden without leave access", () => {
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

  it("shows the performance tab only to HR and administrators", () => {
    expect(getProfileTabs([], "employee-1", Roles.Employee).find((tab) => tab.to === "performance")).toBeUndefined();
    expect(getProfileTabs([], "employee-1", Roles.HRManager).find((tab) => tab.to === "performance")).toBeDefined();
    expect(getProfileTabs([], "employee-1", Roles.HRExecutive).find((tab) => tab.to === "performance")).toBeDefined();
    expect(getProfileTabs([], "employee-1", Roles.Administrator).find((tab) => tab.to === "performance")).toBeDefined();
  });
});
