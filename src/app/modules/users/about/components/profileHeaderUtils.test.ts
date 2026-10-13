import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { getYearsAtCurrentCompany } from "./profileHeaderUtils";

describe("profile header years calculation", () => {
  it("returns zero for missing or invalid join dates", () => {
    expect(getYearsAtCurrentCompany(null)).toBe(0);
    expect(getYearsAtCurrentCompany("not-a-date")).toBe(0);
  });

  it("returns the rounded years for a valid joining date", () => {
    const joinDate = dayjs().subtract(2, "year").subtract(6, "month").format("YYYY-MM-DD");

    expect(getYearsAtCurrentCompany(joinDate)).toBe(2);
  });
});
