import { test, expect } from "@playwright/test";

/**
 * Synthetic dashboard smoke coverage. All auth and HR data is generated here;
 * these tests do not require credentials or write to a backend.
 */
const user = {
  userId: "e2e-dashboard-admin",
  roleType: 1,
  companyName: "Synthetic Test Company",
  firstName: "Test",
  lastName: "Administrator",
  fullName: "Test Administrator",
  profileImage: null,
  companyLogo: null,
  defaultLanguage: "en",
  applicationLanguage: ["en"],
  modulePermission: ["Employees.View", "Jobs.View", "Jobs.Create", "NoticeBoard.View", "Calendar.View", "PayRoll.View", "Leave_Management.View"],
};

const overview = {
  definitionVersion: "dashboard-overview.v3",
  asOfDate: "2026-11-17",
  timeZone: "Asia/Kolkata",
  generatedAtUtc: "2026-11-17T08:00:00Z",
  totalEmployees: 6,
  totalEmployeesChangePercent: 2.5,
  presentToday: 4,
  onLeaveToday: 2,
  absentToday: 1,
  attendanceBreakdown: {
    definitionVersion: "attendance-breakdown.v1",
    expectedEmployees: 6,
    presentOnly: 3,
    leaveOnly: 1,
    presentAndOnLeave: 1,
    explicitlyAbsent: 1,
    otherStatus: 0,
    unreported: 0,
  },
  isWorkingDay: true,
  openPositions: 2,
  headcountTrend: [
    { month: "2025-12", count: 4 },
    { month: "2026-01", count: 4 },
    { month: "2026-02", count: 4 },
    { month: "2026-03", count: 5 },
    { month: "2026-04", count: 5 },
    { month: "2026-05", count: 5 },
    { month: "2026-06", count: 5 },
    { month: "2026-07", count: 5 },
    { month: "2026-08", count: 6 },
    { month: "2026-09", count: 6 },
    { month: "2026-10", count: 6 },
    { month: "2026-11", count: 6 },
  ],
  recentActivities: [],
};

test("synthetic analytics render without horizontal overflow at each device size", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("kt-auth-react-v", JSON.stringify({ token: "synthetic-e2e-token", refreshToken: "synthetic-refresh-token" }));
    localStorage.setItem("codeji:offboarding-reminder:last-shown", String(Date.now()));
  });

  await page.route("**/api/**", async (route) => {
    const url = route.request().url().toLowerCase();
    let methodResult: unknown = {};
    let extra: Record<string, unknown> = {};
    if (url.includes("getsigneduserdetails")) methodResult = user;
    else if (url.includes("getdashboardoverview")) methodResult = overview;
    else if (url.includes("getalldepartmentdetails")) extra = { methodResults: [{ departmentId: "engineering", label: { en: "Engineering" }, employeeCount: 6 }] };
    else if (url.includes("getallnotifications")) methodResult = { notificationList: [] };
    else if (url.includes("getupcomingholidayandevents")) methodResult = { holiday: [], event: [] };
    else if (url.includes("getupcomingcelebrations")) methodResult = { birthday: [], workAnniversary: [] };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, statusCode: 200, methodResult, ...extra }),
    });
  });

  await page.goto("/dashboard");
  await expect(page.getByText("Test Administrator").first()).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("#attendance-overview")).toBeVisible();
  await expect(page.locator("#employee-trend")).toBeVisible();
  await expect(page.getByText("Current month is partial through Nov 17, 2026.", { exact: true })).toBeVisible();
  await expect(page.getByText("Expected today: 6", { exact: false })).toBeAttached();

  for (const width of [375, 768, 899, 900, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator("#attendance-overview")).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow, `horizontal overflow at ${width}px`).toBe(false);
  }

  const captureSidebarAlignment = async () => page.evaluate(async () => {
    const rail = document.querySelector<HTMLElement>(".sidebar-paper");
    const header = document.querySelector<HTMLElement>(".app-header");
    const main = document.querySelector<HTMLElement>(".app-main-viewport");
    if (!rail || !header || !main) return [];

    const frames: Array<{ railWidth: number; headerLeft: number; contentInset: number }> = [];
    for (let frame = 0; frame < 24; frame += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      frames.push({
        railWidth: rail.getBoundingClientRect().width,
        headerLeft: header.getBoundingClientRect().left,
        contentInset: Number.parseFloat(getComputedStyle(main).paddingLeft),
      });
    }
    return frames;
  });
  const expectNoSidebarGap = (frames: Array<{ railWidth: number; headerLeft: number; contentInset: number }>) => {
    expect(frames.length).toBeGreaterThan(0);
    for (const frame of frames) {
      expect(Math.abs(frame.railWidth - frame.headerLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.railWidth - frame.contentInset)).toBeLessThanOrEqual(1);
    }
  };

  await page.mouse.move(700, 500);
  await expect(page.locator(".sidebar-paper")).toHaveCSS("width", "68px");
  await page.mouse.move(24, 180);
  expectNoSidebarGap(await captureSidebarAlignment());
  await expect(page.locator(".sidebar-paper")).toHaveCSS("width", "250px");
  await page.mouse.move(700, 500);
  await expect(page.locator(".sidebar-paper")).toHaveCSS("width", "68px");
  await expect(page.locator(".sidebar-brand-logo")).toBeVisible();
  const collapsedRail = await page.evaluate(() => {
    const rail = document.querySelector<HTMLElement>(".sidebar-paper");
    const menu = document.querySelector<HTMLElement>(".sidebar-menu-main");
    const items = [...document.querySelectorAll<HTMLElement>(".sidebar-menu-main > .MuiStack-root > .sidebar-menu-item")];
    const logo = document.querySelector<HTMLImageElement>(".sidebar-brand-logo");
    if (!rail || !menu || !logo || items.length < 2) return null;
    const gaps = items.slice(1).map((item, index) =>
      item.getBoundingClientRect().top - items[index].getBoundingClientRect().bottom,
    );
    const logoRect = logo.getBoundingClientRect();
    const railRect = rail.getBoundingClientRect();
    return {
      navigationGapMin: Math.min(...gaps),
      navigationGapMax: Math.max(...gaps),
      logoFits: logoRect.left >= railRect.left && logoRect.right <= railRect.right,
      logoLoaded: logo.complete && logo.naturalWidth > 0,
    };
  });
  expect(collapsedRail?.navigationGapMin).toBeGreaterThanOrEqual(6);
  expect(collapsedRail?.navigationGapMax).toBeLessThanOrEqual(10);
  expect(collapsedRail?.logoFits).toBe(true);
  expect(collapsedRail?.logoLoaded).toBe(true);
  const desktopLayout = await page.evaluate(() => {
    const sidebar = document.querySelector<HTMLElement>(".sidebar-paper");
    const header = document.querySelector<HTMLElement>(".app-header");
    if (!sidebar || !header) return null;
    const sidebarRect = sidebar.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    return {
      sidebarLeft: sidebarRect.left,
      sidebarTop: sidebarRect.top,
      sidebarWidth: sidebarRect.width,
      sidebarHeight: sidebarRect.height,
      headerLeft: headerRect.left,
      headerWidth: headerRect.width,
    };
  });
  expect(desktopLayout).toEqual({
    sidebarLeft: 0,
    sidebarTop: 0,
    sidebarWidth: 68,
    sidebarHeight: 900,
    headerLeft: 68,
    headerWidth: 1212,
  });

  await page.locator(".sidebar-edge-toggle").click();
  await expect(page.locator(".sidebar-paper")).toHaveCSS("width", "250px");
  const expandedLayout = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".app-header");
    const main = document.querySelector<HTMLElement>(".app-main-viewport");
    if (!header || !main) return null;
    return {
      headerLeft: header.getBoundingClientRect().left,
      headerWidth: header.getBoundingClientRect().width,
      contentInset: getComputedStyle(main).paddingLeft,
    };
  });
  expect(expandedLayout).toEqual({
    headerLeft: 250,
    headerWidth: 1030,
    contentInset: "250px",
  });

  await page.setViewportSize({ width: 1280, height: 400 });
  const navigation = page.locator(".sidebar-menu-main");
  const navigationOverflow = await navigation.evaluate(
    (element) => element.scrollHeight > element.clientHeight,
  );
  expect(navigationOverflow).toBe(true);
  await page.mouse.move(120, 200);
  await page.mouse.wheel(0, 420);
  await expect.poll(() => navigation.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  await page.locator(".sidebar-edge-toggle").click();
  await page.mouse.move(700, 500);
  expectNoSidebarGap(await captureSidebarAlignment());
  await expect(page.locator(".sidebar-paper")).toHaveCSS("width", "68px");

  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.locator(".sidebar-paper")).toBeVisible();
  await expect(page.locator(".sidebar-paper")).toHaveCSS("width", "290px");
  await expect(page.locator(".sidebar-paper")).toHaveCSS("top", "0px");
  await expect(page.locator(".sidebar-paper")).toHaveCSS("height", "812px");
});
