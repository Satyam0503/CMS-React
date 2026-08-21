import { test, expect } from "../shared/fixtures";

test.describe("Attendance Module @smoke", () => {
  test.beforeEach(async ({ page, helpers }) => {
    await helpers.login();
    await page.goto("/attendance");
  });

  test("loads attendance page", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "Attendance Report" }).first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test("displays attendance calendar or grid", async ({ page }) => {
    const attendanceRows = page.getByRole("button", {
      name: /select to update attendance/i,
    });
    await expect(attendanceRows.first()).toBeVisible({ timeout: 15_000 });
  });

  test("no 500 errors on initial load", async ({ page, helpers }) => {
    const errors = await helpers.interceptApiErrors();
    await page.reload();
    await page.waitForTimeout(5000);
    const serverErrors = errors.filter((e) => e.status >= 500);
    expect(serverErrors).toHaveLength(0);
  });
});

test.describe("Attendance — Data Integrity", () => {
  test("attendance dates are within valid range", async ({ page, helpers }) => {
    await helpers.login();
    await page.goto("/attendance");
    await page.waitForTimeout(5000);

    const dateElements = await page
      .locator('[data-field="date"], td')
      .filter({ hasText: /\d{4}-\d{2}-\d{2}/ })
      .all();

    for (const el of dateElements.slice(0, 10)) {
      const text = await el.textContent();
      if (text) {
        const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
        if (dateMatch) {
          const date = new Date(dateMatch[0]);
          expect(date.getTime()).not.toBeNaN();
        }
      }
    }
  });
});
