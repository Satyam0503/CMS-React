import { describe, expect, it } from "vitest";
import { filterSideBarTabs } from "./common";
import { ModulesName, Roles } from "./enums";

const lifecycleRoute = "/lifecycle-management";

const lifecycleIsVisible = (permissions: string[]) =>
  filterSideBarTabs(permissions, Roles.HRManager)
    .flatMap((tab) => tab.subTabs ?? [])
    .some((tab) => tab.route === lifecycleRoute);

describe("lifecycle management navigation", () => {
  it("shows the payroll lifecycle tab to an HR manager with Employees.Edit", () => {
    expect(lifecycleIsVisible([`${ModulesName.Employees}.Edit`])).toBe(true);
  });

  it("does not expose lifecycle controls with view-only employee access", () => {
    expect(lifecycleIsVisible([`${ModulesName.Employees}.View`])).toBe(false);
  });
});

describe("Administrator module filtering in sidebar", () => {
  const allPermissions = [
    `${ModulesName.Employees}.View`,
    `${ModulesName.Attendance}.View`,
    `${ModulesName.LeaveManagement}.View`,
    `${ModulesName.PayRoll}.View`,
    `${ModulesName.PayrollSettings}.View`,
    `${ModulesName.Jobs}.View`,
    `${ModulesName.Applications}.View`,
    `${ModulesName.ProcessLog}.View`,
    `${ModulesName.Calendar}.View`,
    `${ModulesName.NoticeBoard}.View`,
    `${ModulesName.Policy}.View`,
  ];

  it("shows all module tabs to an Administrator when all modules are enabled", () => {
    const tabs = filterSideBarTabs(allPermissions, Roles.Administrator);
    const tabConstants = tabs.map((t) => t.constant);

    expect(tabConstants).toContain(ModulesName.Dashboard);
    expect(tabConstants).toContain(ModulesName.Employees);
    expect(tabConstants).toContain(ModulesName.PayRoll);
    expect(tabConstants).toContain(ModulesName.Recruitment);
    expect(tabConstants).toContain(ModulesName.Admin);
    expect(tabConstants).toContain(ModulesName.Calendar);
    expect(tabConstants).toContain(ModulesName.NoticeBoard);
    expect(tabConstants).toContain(ModulesName.Policy);
  });

  it("completely removes NoticeBoard from Administrator sidebar when Notice_Board is disabled", () => {
    const permissionsWithoutNoticeBoard = allPermissions.filter(
      (p) => !p.startsWith(`${ModulesName.NoticeBoard}.`)
    );
    const tabs = filterSideBarTabs(permissionsWithoutNoticeBoard, Roles.Administrator);
    const tabConstants = tabs.map((t) => t.constant);

    expect(tabConstants).not.toContain(ModulesName.NoticeBoard);
  });

  it("completely removes Policies from Administrator sidebar when Policy is disabled", () => {
    const permissionsWithoutPolicy = allPermissions.filter(
      (p) => !p.startsWith(`${ModulesName.Policy}.`)
    );
    const tabs = filterSideBarTabs(permissionsWithoutPolicy, Roles.Administrator);
    const tabConstants = tabs.map((t) => t.constant);

    expect(tabConstants).not.toContain(ModulesName.Policy);
  });

  it("completely removes PayRoll and AttendanceSettings when payroll suite is disabled", () => {
    const permissionsWithoutPayroll = allPermissions.filter(
      (p) =>
        !p.startsWith("PayRoll.") &&
        !p.startsWith("Leave_Management.") &&
        !p.startsWith("Attendance.") &&
        !p.startsWith("Payroll_Settings.")
    );
    const tabs = filterSideBarTabs(permissionsWithoutPayroll, Roles.Administrator);
    const tabConstants = tabs.map((t) => t.constant);

    expect(tabConstants).not.toContain(ModulesName.PayRoll);

    const adminTab = tabs.find((t) => t.constant === ModulesName.Admin);
    const adminSubTabRoutes = (adminTab?.subTabs ?? []).map((s) => s.route);
    expect(adminSubTabRoutes).not.toContain("/attendance-settings");
    expect(adminSubTabRoutes).toContain("/admin/companydetails");
  });

  it("completely removes Recruitment and RecruitmentSettings when recruitment is disabled", () => {
    const permissionsWithoutRecruitment = allPermissions.filter(
      (p) =>
        !p.startsWith("Jobs.") &&
        !p.startsWith("Applications.") &&
        !p.startsWith("Process_Log.")
    );
    const tabs = filterSideBarTabs(permissionsWithoutRecruitment, Roles.Administrator);
    const tabConstants = tabs.map((t) => t.constant);

    expect(tabConstants).not.toContain(ModulesName.Recruitment);

    const adminTab = tabs.find((t) => t.constant === ModulesName.Admin);
    const adminSubTabRoutes = (adminTab?.subTabs ?? []).map((s) => s.route);
    expect(adminSubTabRoutes).not.toContain("/recruitment-settings");
    expect(adminSubTabRoutes).toContain("/admin/roles");
  });
});
