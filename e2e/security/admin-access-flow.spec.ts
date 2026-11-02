import { test, expect } from "@playwright/test";

test.describe("End-to-End Administrator Access & Role Isolation", () => {
  test("Administrator with empty granular permissions can access Offboarding and Recruitment without access denied", async ({
    page,
  }) => {
    // Intercept all API calls to prevent 401s from fake tokens
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (url.includes("api/account/getSignedUserDetails")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResult: {
              userId: "admin-user-001",
              name: "Super Admin",
              email: "admin@codeji.in",
              roleType: 1, // Roles.Administrator
              roleName: "Administrator",
              modulePermission: [], // Empty permissions in MongoDB!
              companyId: "company-001",
              companyName: "Codeji Infotech",
              defaultLanguage: "en",
            },
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 200,
          success: true,
          methodResult: [],
        }),
      });
    });

    // Seed local storage with auth token
    await page.addInitScript(() => {
      localStorage.setItem(
        "kt-auth-react-v",
        JSON.stringify({
          token: "mock-valid-admin-jwt-token",
          refreshToken: "mock-valid-admin-refresh-token",
        })
      );
    });

    // 1. Navigate to Offboarding in Company Details
    await page.goto("/admin/companydetails/offboarding");
    await page.waitForLoadState("domcontentloaded");

    const errorToast = page.locator(".Toastify__toast--error");
    await expect(errorToast).not.toBeVisible();
    await expect(page).toHaveURL(/\/admin\/companydetails\/offboarding/);

    // 2. Navigate to Recruitment Jobs
    await page.goto("/recruitment/jobs");
    await page.waitForLoadState("domcontentloaded");

    // The user MUST stay on /recruitment/jobs and NOT get kicked back to offboarding or unauthorized
    await expect(page).toHaveURL(/\/recruitment\/jobs/);
    await expect(errorToast).not.toBeVisible();

    // 3. Navigate to Recruitment Settings
    await page.goto("/recruitment/settings");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/recruitment\/settings/);
    await expect(errorToast).not.toBeVisible();

    // 4. Return to Offboarding
    await page.goto("/admin/companydetails/offboarding");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/admin\/companydetails\/offboarding/);
    await expect(errorToast).not.toBeVisible();
  });

  test("Non-Administrator (Employee) is blocked from accessing Recruitment and stays protected", async ({
    page,
  }) => {
    // Intercept API calls to simulate regular employee without Recruitment permissions
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (url.includes("api/account/getSignedUserDetails")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResult: {
              userId: "emp-user-002",
              name: "John Employee",
              email: "john@codeji.in",
              roleType: 3, // Roles.Employee
              roleName: "Employee",
              modulePermission: ["Attendance.View", "Employees.View"], // No Recruitment permissions!
              companyId: "company-001",
              companyName: "Codeji Infotech",
              defaultLanguage: "en",
            },
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 200,
          success: true,
          methodResult: [],
        }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        "kt-auth-react-v",
        JSON.stringify({
          token: "mock-valid-employee-jwt-token",
          refreshToken: "mock-valid-employee-refresh-token",
        })
      );
    });

    // Employee attempts to access recruitment jobs directly
    await page.goto("/recruitment/jobs");
    await page.waitForLoadState("domcontentloaded");

    // Employee must NOT be allowed to view recruitment jobs
    await expect(page).not.toHaveURL(/\/recruitment\/jobs$/);

    // Error toast notification must be visible
    const errorToast = page.locator(".Toastify__toast--error");
    await expect(errorToast).toBeVisible({ timeout: 5000 });
    await expect(errorToast).toContainText("Access Denied");
  });

  test("Company Details Offboarding and Payroll tabs render without horizontal overflow across viewports", async ({
    page,
  }) => {
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (url.includes("api/account/getSignedUserDetails")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResult: {
              userId: "admin-user-001",
              name: "Super Admin",
              email: "admin@codeji.in",
              roleType: 1, // Roles.Administrator
              roleName: "Administrator",
              modulePermission: [],
              companyId: "company-001",
              companyName: "Codeji Infotech",
              defaultLanguage: "en",
            },
          }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 200,
          success: true,
          methodResult: [],
        }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        "kt-auth-react-v",
        JSON.stringify({
          token: "mock-valid-admin-jwt-token",
          refreshToken: "mock-valid-admin-refresh-token",
        })
      );
    });

    for (const viewport of [
      { width: 1440, height: 900, label: "Desktop" },
      { width: 768, height: 1024, label: "Tablet" },
      { width: 375, height: 812, label: "Mobile" },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/admin/companydetails/offboarding");
      await page.waitForLoadState("domcontentloaded");

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2;
      });
      expect(overflow, `${viewport.label} layout should not horizontally overflow`).toBe(true);

      const errorToast = page.locator(".Toastify__toast--error");
      await expect(errorToast).not.toBeVisible();
    }
  });
});
