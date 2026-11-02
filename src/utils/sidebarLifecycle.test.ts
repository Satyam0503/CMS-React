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
  it("completely removes Recruitment even if Career_Profile permission is lingering when recruitment is disabled", () => {
    const permissionsWithOnlyCareerProfile = [
      `${ModulesName.Employees}.View`,
      `${ModulesName.CareerProfile}.View`,
      `${ModulesName.CareerProfile}.Edit`,
      `${ModulesName.Calendar}.View`,
    ];
    const tabs = filterSideBarTabs(permissionsWithOnlyCareerProfile, Roles.Administrator);
    const tabConstants = tabs.map((t) => t.constant);

    expect(tabConstants).not.toContain(ModulesName.Recruitment);

    const adminTab = tabs.find((t) => t.constant === ModulesName.Admin);
    const adminSubTabRoutes = (adminTab?.subTabs ?? []).map((s) => s.route);
    expect(adminSubTabRoutes).not.toContain("/recruitment-settings");
  });

  it("completely removes Work From Home from Attendance tabs when Work_From_Home is disabled", () => {
    const permissionsWithoutWfh = allPermissions.filter(
      (p) => !p.startsWith(`${ModulesName.WorkFromHome}.`)
    );
    const tabs = filterSideBarTabs(permissionsWithoutWfh, Roles.Administrator);
    const tabConstants = tabs.map((t) => t.constant);

    expect(tabConstants).not.toContain(ModulesName.WorkFromHome);

    const attendanceTab = tabs.find((t) => t.constant === ModulesName.PayRoll);
    const attendanceSubRoutes = (attendanceTab?.subTabs ?? []).map((s) => s.route);
    expect(attendanceSubRoutes).not.toContain("/attendance/work-from-home");
  });

  it("completely removes Offboarding controls when Offboarding module is uninstalled", () => {
    const permissionsWithoutOffboarding = allPermissions.filter(
      (p) => !p.startsWith("Offboarding.")
    );
    const hasOffboarding = permissionsWithoutOffboarding.some((p) =>
      p.startsWith("Offboarding.")
    );
    expect(hasOffboarding).toBe(false);

    const tabs = filterSideBarTabs(permissionsWithoutOffboarding, Roles.Administrator);
    const allRoutes = tabs.flatMap((t) => [t.route, ...(t.subTabs ?? []).map((s) => s.route)]);
    expect(allRoutes).not.toContain("/offboarding");
  });

  it("categorizes Career Profile into recruitment suite so it never renders as an isolated card", () => {
    const normalizeConstant = (str?: string) => (str ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const PAYROLL_CONSTANTS = new Set([
      "payroll",
      "payrollsettings",
      "leavemanagement",
      "attendance",
    ]);
    const RECRUITMENT_CONSTANTS = new Set([
      "jobs",
      "applications",
      "processlog",
      "careerprofile",
    ]);

    const mockModules = [
      { moduleConstant: "Employees", isAccessible: true },
      { moduleConstant: "Calendar", isAccessible: true },
      { moduleConstant: "Notice_Board", isAccessible: true },
      { moduleConstant: "Policy", isAccessible: true },
      { moduleConstant: "Work_From_Home", isAccessible: true },
      { moduleConstant: "Offboarding", isAccessible: true },
      { moduleConstant: "Jobs", isAccessible: false },
      { moduleConstant: "Applications", isAccessible: false },
      { moduleConstant: "Process_Log", isAccessible: false },
      { moduleConstant: "Career_Profile", isAccessible: false },
      { moduleConstant: "PayRoll", isAccessible: false },
      { moduleConstant: "Payroll_Settings", isAccessible: false },
      { moduleConstant: "Leave_Management", isAccessible: false },
      { moduleConstant: "Attendance", isAccessible: false },
    ];

    const recruitment = mockModules.filter((m) =>
      RECRUITMENT_CONSTANTS.has(normalizeConstant(m.moduleConstant))
    );
    const payroll = mockModules.filter((m) =>
      PAYROLL_CONSTANTS.has(normalizeConstant(m.moduleConstant))
    );
    const remaining = mockModules.filter(
      (m) =>
        !PAYROLL_CONSTANTS.has(normalizeConstant(m.moduleConstant)) &&
        !RECRUITMENT_CONSTANTS.has(normalizeConstant(m.moduleConstant))
    );

    // Career Profile must be in recruitment suite and never in remaining (otherModules)
    expect(recruitment.map((m) => m.moduleConstant)).toContain("Career_Profile");
    expect(payroll.map((m) => m.moduleConstant)).toContain("Payroll_Settings");
    expect(payroll.map((m) => m.moduleConstant)).toContain("Leave_Management");
    expect(payroll.map((m) => m.moduleConstant)).toContain("Attendance");

    const remainingConstants = remaining.map((m) => m.moduleConstant);
    expect(remainingConstants).not.toContain("Career_Profile");
    expect(remainingConstants).not.toContain("Payroll_Settings");
    expect(remainingConstants).not.toContain("Leave_Management");
    expect(remainingConstants).not.toContain("Attendance");
    expect(remainingConstants).toEqual([
      "Employees",
      "Calendar",
      "Notice_Board",
      "Policy",
      "Work_From_Home",
      "Offboarding",
    ]);
  });

  describe("Non-Administrator Role Isolation in sidebar", () => {
    it("never shows Admin tab to an Employee even if permissions are provided", () => {
      const employeePermissions = [
        `${ModulesName.Employees}.View`,
        `${ModulesName.Attendance}.View`,
      ];
      const tabs = filterSideBarTabs(employeePermissions, Roles.Employee);
      const tabConstants = tabs.map((t) => t.constant);

      expect(tabConstants).not.toContain(ModulesName.Admin);
    });

    it("never shows Payroll management or Payroll settings to regular employees", () => {
      const employeePermissions = [
        `${ModulesName.Employees}.View`,
        `${ModulesName.Attendance}.View`,
        `${ModulesName.PayRoll}.View`,
        `${ModulesName.PayrollSettings}.View`,
      ];
      const tabs = filterSideBarTabs(employeePermissions, Roles.Employee);
      const tabConstants = tabs.map((t) => t.constant);

      const payrollTab = tabs.find((t) => t.constant === ModulesName.PayRoll);
      const payrollSubRoutes = (payrollTab?.subTabs ?? []).map((s) => s.route);

      expect(payrollSubRoutes).not.toContain("/payroll");
      expect(payrollSubRoutes).not.toContain("/settingspayroll");
    });
  });
});
