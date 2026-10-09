import { test, expect } from '../shared/fixtures';

// Run ONLY against tools/PayrollReadOnlyValidation, never the normal writable API.
const api = process.env.API_URL ?? 'http://localhost:5036';
test.use({ trace: 'off', video: 'off' });

test.describe('Payroll configuration read-only UAT', () => {
  test('inspects real configuration and responsive tabs without changing records', async ({ page, helpers }) => {
    // The guard must be present before attempting authentication or page navigation.
    const guard = await page.request.get(`${api}/readonly-validation-probe`);
    expect(guard.status()).toBe(403);
    expect((await guard.json()).errorCode).toBe('READ_ONLY_VALIDATION_BLOCKED');
    const auth = await helpers.login();
    const headers = { Authorization: `Bearer ${auth.token}` };
    for (const path of ['components', 'pay-groups', 'policies', 'salary-templates', 'assignments']) {
      const response = await page.request.get(`${api}/api/payroll/configuration/${path}`, { headers });
      expect(response.status(), `Read ${path}`).toBe(200);
      const rows = await response.json();
      expect(Array.isArray(rows), `${path} returns a list`).toBe(true);
      if (path === 'salary-templates') {
        for (const row of rows.filter((item: { isRetired?: boolean }) => item.isRetired)) expect(row.isActive).toBe(false);
      }
    }
    await page.goto('/admin/companydetails/payroll-configuration');
    const labels = [/Salary Import/i, /Statutory.*Calculation/i, /Salary Components/i, /Pay Groups/i, /Salary Templates/i, /Employee Assignments/i];
    for (const name of labels) {
      const tab = page.getByRole('tab', { name });
      await expect(tab).toBeVisible({ timeout: 20_000 });
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
    }
    await page.getByRole('tab', { name: /Salary Templates/i }).click();
    await expect(page.getByText('Templates are reusable starting points.', { exact: false })).toBeVisible();
    for (const width of [1440, 768, 360]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByRole('button', { name: 'Save template', exact: true })).toBeVisible();
      const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
      expect(dimensions.scrollWidth, `No outer horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.width + 1);
    }
    await test.info().attach('read-only-uat-summary', { body: 'Five authenticated configuration lists read; six tabs opened; three viewport widths checked; no payroll write actions.', contentType: 'text/plain' });
  });
});
