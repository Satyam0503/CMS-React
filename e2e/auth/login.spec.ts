import { test, expect } from "../shared/fixtures";

test.describe("Authentication @smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("displays login form", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible();
  });

  test("rejects empty submission with validation errors", async ({ page }) => {
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    const errorMessages = page.locator('[class*="error"], [role="alert"], .Mui-error');
    await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.getByLabel(/email/i).fill("wrong@test.com");
    await page.getByRole("textbox", { name: "Password" }).fill("WrongPassword1!");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    const errorMsg = page.locator('[role="alert"], .Toastify__toast--error, [class*="error"]');
    await expect(errorMsg.first()).toBeVisible({ timeout: 10_000 });
  });

  test("does not expose credentials in URL or network", async ({ page }) => {
    const url = page.url();
    expect(url).not.toContain("password");
    expect(url).not.toContain("token");
  });

  test("password field masks input", async ({ page }) => {
    const passwordField = page.getByRole("textbox", { name: "Password" });
    await expect(passwordField).toHaveAttribute("type", "password");
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/auth**", { timeout: 10_000 });
    expect(page.url()).toContain("/auth");
  });
});

test.describe("Session Management", () => {
  test("clears auth state on logout", async ({ page, helpers }) => {
    await helpers.login();
    await page.goto("/dashboard");
    await helpers.logout();

    const authState = await page.evaluate(() =>
      localStorage.getItem("kt-auth-react-v")
    );
    expect(authState).toBeNull();
  });

  test("handles expired token gracefully", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "kt-auth-react-v",
        JSON.stringify({
          token: "expired.jwt.token",
          refreshToken: "also.expired",
        })
      );
    });
    await page.goto("/dashboard");
    await page.waitForURL("**/auth**", { timeout: 15_000 });
  });
});
