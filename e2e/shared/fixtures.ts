import { test as base, expect, Page } from "@playwright/test";

const API_URL = process.env.API_URL ?? "http://localhost:5036";

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthState {
  token: string;
  refreshToken: string;
  user: Record<string, unknown>;
}

export class TestHelpers {
  constructor(private page: Page) {}

  async login(
    creds: AuthCredentials = {
      email: "admin@test.codeji.in",
      password: "Test@1234",
    }
  ): Promise<AuthState> {
    const response = await this.page.request.post(`${API_URL}/api/account/login`, {
      data: creds,
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBeTruthy();

    const auth: AuthState = body.methodResult;
    await this.page.evaluate((authData) => {
      localStorage.setItem("kt-auth-react-v", JSON.stringify(authData));
    }, auth);

    return auth;
  }

  async loginViaUI(email: string, password: string) {
    await this.page.goto("/auth");
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole("button", { name: /sign in|log in/i }).click();
    await this.page.waitForURL("**/dashboard**", { timeout: 15_000 });
  }

  async logout() {
    await this.page.evaluate(() => localStorage.clear());
    await this.page.goto("/auth");
  }

  async waitForApi(urlPattern: string | RegExp) {
    return this.page.waitForResponse(
      (res) =>
        (typeof urlPattern === "string"
          ? res.url().includes(urlPattern)
          : urlPattern.test(res.url())) && res.status() < 400
    );
  }

  async checkAccessibility() {
    const violations: string[] = [];

    const images = await this.page.locator("img:not([alt])").all();
    if (images.length > 0) {
      violations.push(`${images.length} image(s) missing alt text`);
    }

    const buttons = await this.page
      .locator("button:not([aria-label]):not(:has-text(/.+/))")
      .all();
    if (buttons.length > 0) {
      violations.push(`${buttons.length} button(s) with no label or text`);
    }

    const inputs = await this.page
      .locator("input:not([aria-label]):not([id])")
      .all();
    if (inputs.length > 0) {
      violations.push(`${inputs.length} input(s) missing label association`);
    }

    return violations;
  }

  async checkResponsiveness(breakpoints: number[] = [375, 768, 1280]) {
    const issues: string[] = [];
    for (const width of breakpoints) {
      await this.page.setViewportSize({ width, height: 900 });
      const hasHorizontalScroll = await this.page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      if (hasHorizontalScroll) {
        issues.push(`Horizontal scroll detected at ${width}px viewport`);
      }
    }
    return issues;
  }

  async interceptApiErrors(): Promise<Array<{ url: string; status: number; body: string }>> {
    const errors: Array<{ url: string; status: number; body: string }> = [];
    this.page.on("response", async (response) => {
      if (response.status() >= 400 && response.url().includes("/api/")) {
        try {
          errors.push({
            url: response.url(),
            status: response.status(),
            body: await response.text(),
          });
        } catch {
          errors.push({ url: response.url(), status: response.status(), body: "(unreadable)" });
        }
      }
    });
    return errors;
  }
}

export const test = base.extend<{ helpers: TestHelpers }>({
  helpers: async ({ page }, use) => {
    await use(new TestHelpers(page));
  },
});

export { expect };
