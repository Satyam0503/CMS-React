import { describe, expect, it } from "vitest";
import { configurationWindowIssue, coversConfigurationWindow, currentComponentVersions, isApprovedConfigurationForWindow } from "./payrollConfigurationSelection";

const meal = { code: "MEAL", effectiveFrom: "2026-10-01", isActive: true, version: 1 };
describe("payroll configuration eligibility", () => {
  it("offers one revision per normalized component code, preferring the highest same-day version", () => {
    const versions = [meal, { ...meal, code: "meal", version: 2 }, { ...meal, version: 3, effectiveFrom: "2026-11-01" }];
    expect(currentComponentVersions(versions, "2026-10-08")).toEqual([versions[1]]);
  });
  it("does not fall back to an older active revision when the latest is disabled", () => {
    const disabled = { ...meal, version: 2, isActive: false };
    expect(currentComponentVersions([meal, disabled], "2026-10-08")).toEqual([disabled]);
  });
  it("does not resurrect older revisions after the newest expires", () => {
    expect(currentComponentVersions([meal, { ...meal, version: 2, effectiveTo: "2026-10-07" }], "2026-10-08")).toEqual([]);
  });
  it("allows only approved active profiles covering the complete assignment window", () => {
    const approved = { ...meal, approvalStatus: "APPROVED" };
    expect(isApprovedConfigurationForWindow(approved, "2026-10-01")).toBe(true);
    expect(isApprovedConfigurationForWindow({ ...approved, approvalStatus: "SUBMITTED" }, "2026-10-01")).toBe(false);
    expect(isApprovedConfigurationForWindow({ ...approved, isActive: false }, "2026-10-01")).toBe(false);
    expect(isApprovedConfigurationForWindow({ ...approved, effectiveTo: "2026-10-31" }, "2026-10-01")).toBe(false);
    expect(isApprovedConfigurationForWindow({ ...approved, effectiveTo: "2026-10-31" }, "2026-10-01", "2026-10-31")).toBe(true);
  });
  it("requires a finite group/profile to cover the full requested interval", () => {
    const record = { ...meal, effectiveTo: "2026-10-31" };
    expect(coversConfigurationWindow(record, "2026-10-01")).toBe(false);
    expect(coversConfigurationWindow(record, "2026-10-01", "2026-11-01")).toBe(false);
    expect(coversConfigurationWindow(record, "2026-10-01", "2026-10-31")).toBe(true);
  });
  it("identifies why a statutory profile cannot cover a pay-group date range", () => {
    expect(configurationWindowIssue({ ...meal, effectiveFrom: "2026-11-01" }, "2026-10-01")).toBe("starts-after");
    expect(configurationWindowIssue({ ...meal, effectiveTo: "2026-10-31" }, "2026-10-01")).toBe("ends-before");
    expect(configurationWindowIssue({ ...meal, isActive: false }, "2026-10-01")).toBe("inactive");
    expect(configurationWindowIssue(meal, "2026-10-02", "2026-10-01")).toBe("invalid-window");
  });
  it("rejects inactive, future-starting and reversed windows", () => {
    expect(coversConfigurationWindow({ ...meal, isActive: false }, "2026-10-08")).toBe(false);
    expect(coversConfigurationWindow(meal, "2026-09-30")).toBe(false);
    expect(coversConfigurationWindow(meal, "2026-10-08", "2026-10-07")).toBe(false);
  });
});
