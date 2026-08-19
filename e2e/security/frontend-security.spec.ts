import { test, expect } from "../shared/fixtures";

test.describe("Frontend Security — XSS Prevention", () => {
  test.beforeEach(async ({ page, helpers }) => {
    await helpers.login();
  });

  test("search input sanitizes XSS payloads", async ({ page }) => {
    await page.goto("/employees");
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert(1)>',
        '"><svg/onload=alert(1)>',
        "javascript:alert(1)",
      ];
      for (const payload of xssPayloads) {
        await searchInput.fill(payload);
        await page.waitForTimeout(500);
        const alertTriggered = await page
          .evaluate(() => {
            return new Promise<boolean>((resolve) => {
              const orig = window.alert;
              let triggered = false;
              window.alert = () => { triggered = true; };
              setTimeout(() => {
                window.alert = orig;
                resolve(triggered);
              }, 200);
            });
          });
        expect(alertTriggered).toBe(false);
        await searchInput.clear();
      }
    }
  });

  test("localStorage does not contain raw passwords", async ({ page }) => {
    const storage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!;
        items[key] = localStorage.getItem(key)!;
      }
      return JSON.stringify(items);
    });
    expect(storage.toLowerCase()).not.toContain('"password"');
  });
});

test.describe("Frontend Security — Auth Token Handling", () => {
  test("JWT is not exposed in URL parameters", async ({ page, helpers }) => {
    await helpers.login();
    await page.goto("/dashboard");
    await page.waitForTimeout(3000);
    expect(page.url()).not.toMatch(/token=/i);
    expect(page.url()).not.toMatch(/jwt=/i);
    expect(page.url()).not.toMatch(/auth=/i);
  });

  test("API requests use Authorization header, not query params", async ({ page, helpers }) => {
    await helpers.login();
    const requestUrls: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/")) {
        requestUrls.push(req.url());
      }
    });
    await page.goto("/dashboard");
    await page.waitForTimeout(5000);

    for (const url of requestUrls) {
      const urlObj = new URL(url);
      expect(urlObj.searchParams.has("token")).toBe(false);
      expect(urlObj.searchParams.has("jwt")).toBe(false);
    }
  });
});

test.describe("Frontend Security — Content Security", () => {
  test("no inline event handlers in rendered HTML", async ({ page, helpers }) => {
    await helpers.login();
    await page.goto("/dashboard");
    await page.waitForTimeout(3000);

    const dangerousAttrs = await page.evaluate(() => {
      const attrs = [
        "onclick", "onerror", "onload", "onmouseover",
        "onfocus", "onblur", "onsubmit",
      ];
      const found: string[] = [];
      const allElements = document.querySelectorAll("*");
      allElements.forEach((el) => {
        attrs.forEach((attr) => {
          if (el.hasAttribute(attr)) {
            found.push(`${el.tagName}.${attr}`);
          }
        });
      });
      return found;
    });
    expect(dangerousAttrs).toHaveLength(0);
  });

  test("external scripts are not loaded from untrusted sources", async ({ page, helpers }) => {
    const externalScripts: string[] = [];
    page.on("request", (req) => {
      if (req.resourceType() === "script") {
        const url = req.url();
        if (
          !url.includes("localhost") &&
          !url.includes("codeji.in") &&
          !url.includes("google.com/recaptcha")
        ) {
          externalScripts.push(url);
        }
      }
    });

    await helpers.login();
    await page.goto("/dashboard");
    await page.waitForTimeout(5000);
    expect(externalScripts).toHaveLength(0);
  });
});

test.describe("Frontend Security — CORS & Cookies", () => {
  test("cookies have secure flags in production mode", async ({ page, helpers }) => {
    await helpers.login();
    await page.goto("/dashboard");
    const cookies = await page.context().cookies();
    for (const cookie of cookies) {
      if (cookie.name.toLowerCase().includes("csrf") || cookie.name.toLowerCase().includes("token")) {
        expect(cookie.httpOnly || cookie.secure || cookie.sameSite !== "None").toBeTruthy();
      }
    }
  });
});
