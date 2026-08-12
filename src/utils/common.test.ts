import { describe, expect, it } from "vitest";
import { formatServerDate } from "./common";

describe("formatServerDate", () => {
  it("keeps the business date in IST for UTC timestamps", () => {
    expect(formatServerDate("2026-08-12T18:30:00.000Z", "YYYY-MM-DD")).toBe("2026-08-13");
  });

  it("preserves date-only values as the calendar date instead of shifting them", () => {
    expect(formatServerDate("2026-08-12", "YYYY-MM-DD")).toBe("2026-08-12");
  });

  it("preserves midnight business-date strings without timezone conversion", () => {
    expect(formatServerDate("2026-08-13T00:00:00", "YYYY-MM-DD")).toBe("2026-08-13");
  });
});
