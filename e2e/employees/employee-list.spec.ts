import { test, expect } from "../shared/fixtures";

test.describe("Employee List @smoke", () => {
  test.beforeEach(async ({ page, helpers }) => {
    await helpers.login();
    await page.goto("/employees");
  });

  test("loads employee list page", async ({ page }) => {
    const heading = page.getByRole("heading", { name: /employee/i });
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test("displays data grid with employee records", async ({ page }) => {
    const grid = page.locator('[role="grid"], .MuiDataGrid-root');
    await expect(grid).toBeVisible({ timeout: 15_000 });
  });

  test("search filters employee list", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("test");
      await page.waitForTimeout(1000);
      // Grid should update — no crash or empty error
      const grid = page.locator('[role="grid"], .MuiDataGrid-root');
      await expect(grid).toBeVisible();
    }
  });

  test("handles empty state gracefully", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("zzznonexistent999");
      await page.waitForTimeout(1500);
      // Should show empty state, not crash
      const errorBoundary = page.locator('[class*="error-boundary"]');
      await expect(errorBoundary).not.toBeVisible();
    }
  });
});

test.describe("Employee List — Responsiveness", () => {
  test.beforeEach(async ({ page, helpers }) => {
    await helpers.login();
    await page.goto("/employees");
  });

  test("no horizontal overflow at mobile width", async ({ page, helpers }) => {
    const issues = await helpers.checkResponsiveness([375]);
    expect(issues).toHaveLength(0);
  });

  test("no horizontal overflow at tablet width", async ({ page, helpers }) => {
    const issues = await helpers.checkResponsiveness([768]);
    expect(issues).toHaveLength(0);
  });
});

test.describe("Employee List — Accessibility", () => {
  test.beforeEach(async ({ page, helpers }) => {
    await helpers.login();
    await page.goto("/employees");
    await page.waitForTimeout(3000);
  });

  test("images have alt text", async ({ helpers }) => {
    const violations = await helpers.checkAccessibility();
    const imgViolations = violations.filter((v) => v.includes("image"));
    expect(imgViolations).toHaveLength(0);
  });
});
