import { describe, expect, it } from "vitest";
import { formatDashboardMonth } from "./formatDashboardMonth";

describe("formatDashboardMonth", () => {
  it("formats a canonical month in the requested locale", () => {
    expect(formatDashboardMonth("2026-10", "en-US")).toBe("October 2026");
    expect(formatDashboardMonth("2026-10", "de-DE")).toBe("Oktober 2026");
    expect(formatDashboardMonth("2026-10", "en-US", "short")).toBe("Oct");
  });

  it("does not shift the displayed month by the browser timezone", () => {
    expect(formatDashboardMonth("2026-01", "en-US")).toBe("January 2026");
  });

  it("preserves invalid values instead of creating an incorrect date label", () => {
    expect(formatDashboardMonth("2026-13", "en-US")).toBe("2026-13");
    expect(formatDashboardMonth("invalid", "en-US")).toBe("invalid");
  });
});
