import { test, expect } from "../shared/fixtures";

test.describe("Payroll Module @smoke", () => {
  test.beforeEach(async ({ page, helpers }) => {
    await helpers.login();
    await page.goto("/payroll");
  });

  test("loads payroll page without errors", async ({ page, helpers }) => {
    const apiErrors = await helpers.interceptApiErrors();
    await page.waitForTimeout(5000);
    const criticalErrors = apiErrors.filter((e) => e.status >= 500);
    expect(criticalErrors).toHaveLength(0);
  });

  test("payroll data grid renders", async ({ page }) => {
    const grid = page.locator('[role="grid"], .MuiDataGrid-root, table');
    await expect(grid.first()).toBeVisible({ timeout: 15_000 });
  });

  test("no console errors on page load", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    await page.reload();
    await page.waitForTimeout(5000);
    const realErrors = consoleErrors.filter(
      (e) => !e.includes("favicon") && !e.includes("404")
    );
    expect(realErrors).toHaveLength(0);
  });
});

test.describe("Payroll — Access Control", () => {
  test("non-admin cannot access payroll settings", async ({ page, helpers }) => {
    const employeeEmail = process.env.QA_EMPLOYEE_EMAIL;
    const employeePassword = process.env.QA_EMPLOYEE_PASSWORD;

    test.skip(
      !employeeEmail || !employeePassword,
      "Set QA_EMPLOYEE_EMAIL and QA_EMPLOYEE_PASSWORD for the non-admin access-control test.",
    );

    await helpers.login({
      email: employeeEmail!,
      password: employeePassword!,
    });
    await page.goto("/settingspayroll");

    await expect(page).toHaveURL(/\/unauthorize$/);
    await expect(page.getByRole("heading")).toBeVisible();
  });
});
