import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const API_URL = process.env.API_URL ?? "http://localhost:5036";
const isLive = !BASE_URL.includes("localhost");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "../qa/reports/playwright" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "tablet",
      use: {
        viewport: { width: 768, height: 1024 },
        userAgent: devices["Desktop Chrome"].userAgent,
      },
    },
  ],
  ...(isLive
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          url: BASE_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        },
      }),
});
