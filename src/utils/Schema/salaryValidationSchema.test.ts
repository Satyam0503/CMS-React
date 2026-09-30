import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import { salaryValidationSchema } from "./salaryValidationSchema";

const salary = {
  userId: "user-1",
  basicPay: 50000,
  effectiveFrom: "2026-10-01",
  effectiveTo: null,
};

describe("salary effective-date validation", () => {
  it("accepts an open-ended salary version", async () => {
    const result = await salaryValidationSchema.validate(salary);
    expect(result.userId).toBe(salary.userId);
    expect(result.effectiveFrom).toBeInstanceOf(Date);
    expect(dayjs(result.effectiveFrom as Date).format("YYYY-MM-DD")).toBe(salary.effectiveFrom);
  });

  it("rejects an end date before the start date", async () => {
    await expect(salaryValidationSchema.validate({
      ...salary,
      effectiveTo: "2026-09-30",
    })).rejects.toThrow("Effective to must be on or after Effective from.");
  });

  it("accepts a same-day start and end", async () => {
    await expect(salaryValidationSchema.validate({
      ...salary,
      effectiveTo: "2026-10-01",
    })).resolves.toBeDefined();
  });
});
