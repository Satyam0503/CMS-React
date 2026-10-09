import { test } from "../shared/fixtures";
import path from "path";
import fs from "fs";

test.describe("Capture UI Previews", () => {
  const outputDir = path.resolve("../docs/ui-previews");

  test.beforeAll(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  test("captures login and registration pages", async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;

    // 1. Login Page
    await page.goto("/auth/login");
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(outputDir, `login-${projectName}.png`),
      fullPage: false,
    });

    // 2. Registration Page
    await page.goto("/auth/registration");
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(outputDir, `registration-empty-${projectName}.png`),
      fullPage: false,
    });

    // 3. Registration Page with partial password to show interactive strength meter
    const passwordInput = page.getByRole("textbox", { name: "Password", exact: true });
    if (await passwordInput.isVisible()) {
      await passwordInput.fill("SecurePass1!");
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(outputDir, `registration-interactive-${projectName}.png`),
        fullPage: false,
      });
    }
  });
});
