import { test, expect } from "@playwright/test";

test.describe("End-to-End Office Schedule Master Data & Security Isolation", () => {
  test("Administrator can view default shift master data in Company Details Office Schedule", async ({
    page,
  }) => {
    // Intercept backend API requests with authentic admin role context
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

      if (url.includes("api/CompanyMaster/OfficeSchedules")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResults: [
              {
                scheduleId: "default-master-shift-001",
                name: "Default shift",
                standardCheckIn: "09:00",
                standardCheckOut: "18:00",
                checkInAllowedFrom: "08:30",
                checkInAllowedUntil: "10:00",
                checkOutAllowedFrom: "17:30",
                checkOutAllowedUntil: "19:00",
                graceMinutes: 15,
                breakMinutes: 60,
                requiredWorkingMinutes: 480,
                isDefault: true,
                isActive: true,
              },
            ],
          }),
        });
      }

      if (url.includes("api/CompanyMaster/DepartmentOfficeScheduleAssignments")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResults: [],
          }),
        });
      }

      if (url.includes("api/CompanyMaster/GetDepartmentList")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResults: [
              { departmentId: "dept-1", name: "Engineering", isDefault: false },
            ],
          }),
        });
      }

      if (url.includes("api/attendance/weekly-offs")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            offDays: [0, 6],
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

    // Seed authenticated admin session
    await page.addInitScript(() => {
      localStorage.setItem(
        "kt-auth-react-v",
        JSON.stringify({
          token: "mock-valid-admin-jwt-token",
          refreshToken: "mock-valid-admin-refresh-token",
        })
      );
    });

    // Navigate to Office Schedule tab in Company Details
    await page.goto("/admin/companydetails/office-schedule");
    await page.waitForLoadState("domcontentloaded");

    // Verify page stays on office-schedule URL
    await expect(page).toHaveURL(/\/admin\/companydetails\/office-schedule/);

    // Verify master default shift name appears in the DOM
    const defaultShiftText = page.locator("text=/Default shift/i").first();
    await expect(defaultShiftText).toBeVisible({ timeout: 15_000 });

    // Verify the delete button for default shift is either absent or disabled
    // System protection: default shift cannot be deleted
    const deleteButton = page.locator('button[aria-label="Delete schedule"], button:has-text("Delete")');
    if (await deleteButton.isVisible()) {
      await expect(deleteButton).toBeDisabled();
    }
  });

  test("Non-Administrator (Employee) is blocked from accessing Company Details and Office Schedule", async ({
    page,
  }) => {
    // Intercept with an Employee role (roleType: 3)
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
              modulePermission: ["Attendance.View", "Employees.View"],
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

    // Seed authenticated employee session
    await page.addInitScript(() => {
      localStorage.setItem(
        "kt-auth-react-v",
        JSON.stringify({
          token: "mock-valid-employee-jwt-token",
          refreshToken: "mock-valid-employee-refresh-token",
        })
      );
    });

    // Employee attempts to access admin company details office schedule directly
    await page.goto("/admin/companydetails/office-schedule");
    await page.waitForLoadState("domcontentloaded");

    // Employee must NOT be allowed to view admin company details (redirected or stays off admin)
    await expect(page).not.toHaveURL(/\/admin\/companydetails\/office-schedule$/);

    // Access Denied notification is shown
    const errorToast = page.locator(".Toastify__toast--error");
    await expect(errorToast).toBeVisible({ timeout: 5000 });
    await expect(errorToast).toContainText("Access Denied");
  });

  test("Administrator can successfully delete a custom shift and fallback occurs cleanly", async ({
    page,
  }) => {
    let customDeleted = false;

    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      const method = route.request().method();

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

      if (url.includes("api/CompanyMaster/OfficeSchedule/shift-custom-1") && method === "DELETE") {
        customDeleted = true;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            message: "Office schedule deleted.",
          }),
        });
      }

      if (url.includes("api/CompanyMaster/OfficeSchedules")) {
        const schedules = [
          {
            scheduleId: "default-master-shift-001",
            name: "Default shift",
            standardCheckIn: "09:00",
            standardCheckOut: "18:00",
            checkInAllowedFrom: "08:30",
            checkInAllowedUntil: "10:00",
            checkOutAllowedFrom: "17:30",
            checkOutAllowedUntil: "19:00",
            graceMinutes: 15,
            breakMinutes: 60,
            requiredWorkingMinutes: 480,
            isDefault: true,
            isActive: true,
          },
        ];
        if (!customDeleted) {
          schedules.push({
            scheduleId: "shift-custom-1",
            name: "Shift 1",
            standardCheckIn: "10:00",
            standardCheckOut: "19:00",
            checkInAllowedFrom: "09:30",
            checkInAllowedUntil: "10:30",
            checkOutAllowedFrom: "18:30",
            checkOutAllowedUntil: "19:30",
            graceMinutes: 15,
            breakMinutes: 60,
            requiredWorkingMinutes: 480,
            isDefault: false,
            isActive: true,
          });
        }
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResults: schedules,
          }),
        });
      }

      if (url.includes("api/CompanyMaster/DepartmentOfficeScheduleAssignments")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResults: customDeleted ? [] : [{ departmentId: "dept-1", scheduleId: "shift-custom-1" }],
          }),
        });
      }

      if (url.includes("api/CompanyMaster/GetDepartmentList")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResults: [
              { departmentId: "dept-1", name: "Engineering", isDefault: false },
            ],
          }),
        });
      }

      if (url.includes("api/attendance/weekly-offs")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            offDays: [0, 6],
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

    await page.goto("/admin/companydetails/office-schedule");
    await page.waitForLoadState("domcontentloaded");

    // Verify both shifts are shown initially
    await expect(page.locator("text=/Default shift/i").first()).toBeVisible({ timeout: 15_000 });
    const customShiftHeader = page.locator("text=Shift 1").first();
    await expect(customShiftHeader).toBeVisible({ timeout: 15_000 });

    // Click delete icon for Shift 1
    const deleteShift1Button = page.locator('button[aria-label="Delete Shift 1"]');
    await expect(deleteShift1Button).toBeVisible();
    await deleteShift1Button.click();

    // Verify confirmation modal opens with informative fallback message
    const modalTitle = page.locator("text=Delete Shift 1?");
    await expect(modalTitle).toBeVisible();
    const modalContent = page.locator("text=/fall back to the default shift/i");
    await expect(modalContent).toBeVisible();

    // Confirm deletion
    const confirmButton = page.locator('button:has-text("Delete")').last();
    await confirmButton.click();

    // Verify success toast appears and custom shift is removed
    const successToast = page.locator(".Toastify__toast--success");
    await expect(successToast).toBeVisible({ timeout: 10_000 });
    await expect(successToast).toContainText("Office schedule deleted.");

    // Verify Shift 1 is no longer in the list
    await expect(page.locator('button[aria-label="Delete Shift 1"]')).toHaveCount(0);
  });


  test("Administrator can create and save a new custom shift", async ({ page }) => {
    let customShiftCreated = false;

    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      const method = route.request().method();

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
              roleType: 1,
              roleName: "Administrator",
              modulePermission: [],
              companyId: "company-001",
              companyName: "Codeji Infotech",
              defaultLanguage: "en",
            },
          }),
        });
      }

      if (url.includes("api/CompanyMaster/OfficeSchedule") && method === "PUT") {
        customShiftCreated = true;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResult: {
              scheduleId: "shift-custom-evening",
              name: "Evening Shift",
              standardCheckIn: "14:00",
              standardCheckOut: "23:00",
              checkInAllowedFrom: "13:30",
              checkInAllowedUntil: "14:30",
              checkOutAllowedFrom: "22:30",
              checkOutAllowedUntil: "23:30",
              graceMinutes: 15,
              breakMinutes: 60,
              requiredWorkingMinutes: 480,
              isDefault: false,
              isActive: true,
            },
          }),
        });
      }

      if (url.includes("api/CompanyMaster/OfficeSchedules")) {
        const schedules = [
          {
            scheduleId: "default-master-shift-001",
            name: "Default shift",
            standardCheckIn: "09:00",
            standardCheckOut: "18:00",
            checkInAllowedFrom: "08:30",
            checkInAllowedUntil: "10:00",
            checkOutAllowedFrom: "17:30",
            checkOutAllowedUntil: "19:00",
            graceMinutes: 15,
            breakMinutes: 60,
            requiredWorkingMinutes: 480,
            isDefault: true,
            isActive: true,
          },
        ];
        if (customShiftCreated) {
          schedules.push({
            scheduleId: "shift-custom-evening",
            name: "Evening Shift",
            standardCheckIn: "14:00",
            standardCheckOut: "23:00",
            checkInAllowedFrom: "13:30",
            checkInAllowedUntil: "14:30",
            checkOutAllowedFrom: "22:30",
            checkOutAllowedUntil: "23:30",
            graceMinutes: 15,
            breakMinutes: 60,
            requiredWorkingMinutes: 480,
            isDefault: false,
            isActive: true,
          });
        }
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResults: schedules,
          }),
        });
      }

      if (url.includes("api/CompanyMaster/DepartmentOfficeScheduleAssignments")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResults: [],
          }),
        });
      }

      if (url.includes("api/CompanyMaster/GetDepartmentList")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            methodResults: [
              { departmentId: "dept-1", name: "Engineering", isDefault: false },
            ],
          }),
        });
      }

      if (url.includes("api/attendance/weekly-offs")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            statusCode: 200,
            success: true,
            offDays: [0, 6],
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

    await page.goto("/admin/companydetails/office-schedule");
    await page.waitForLoadState("domcontentloaded");

    // Click "Add Shift" button
    const addShiftButton = page.locator('button:has-text("Add Shift")');
    await expect(addShiftButton).toBeVisible({ timeout: 15_000 });
    await addShiftButton.click();

    // Verify duplicate timing warning shows initially because default form has 09:00 - 18:00
    const duplicateWarning = page.locator("text=/Duplicate shift timing/i").first();
    await expect(duplicateWarning).toBeVisible({ timeout: 5_000 });

    // Set distinct shift hours to resolve duplicate timing conflict
    const startInput = page.getByLabel("Standard Office Start (Auto-Present Time)").last();
    await startInput.fill("14:00");
    const departureInput = page.getByLabel("Standard Office Departure").last();
    await departureInput.fill("23:00");

    // Once timings are distinct, duplicate warning is gone and save button is enabled
    await expect(page.locator("text=/Duplicate shift timing/i")).toHaveCount(0);
    const saveShiftButton = page.locator('button:has-text("Save Shift")').last();
    await expect(saveShiftButton).toBeEnabled({ timeout: 5_000 });
    await saveShiftButton.click();

    // Verify success toast
    const successToast = page.locator(".Toastify__toast--success");
    await expect(successToast).toBeVisible({ timeout: 10_000 });
    await expect(successToast).toContainText("Shift saved successfully");
  });
});
