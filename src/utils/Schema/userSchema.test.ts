import { describe, expect, it } from "vitest";
import { userSchema } from "./userSchema";

describe("userSchema employeeId validation and editing logic", () => {
  const baseValidUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
  };

  it("accepts a valid employeeId format", async () => {
    const validIds = ["CD-0001", "EMP-2026-001", "E2E2026-001", "EMP-42"];
    for (const employeeId of validIds) {
      const result = await userSchema.validate({
        ...baseValidUser,
        employeeId,
      });
      expect(result.employeeId).toBe(employeeId);
    }
  });

  it("trims whitespace from employeeId", async () => {
    const result = await userSchema.validate({
      ...baseValidUser,
      employeeId: "   CD-0099   ",
    });
    expect(result.employeeId).toBe("CD-0099");
  });

  it("allows null, undefined, or empty string for employeeId", async () => {
    const emptyValues = [null, undefined, ""];
    for (const employeeId of emptyValues) {
      const result = await userSchema.validate({
        ...baseValidUser,
        employeeId,
      });
      expect(result.employeeId ? result.employeeId.trim() : "").toBe("");
    }
  });

  it("correctly models the role-based edit permission for employeeId", () => {
    const canEditEmploymentDetails = (hasEditPermission: boolean, isEditingOwnProfile: boolean) =>
      hasEditPermission && !isEditingOwnProfile;

    // Case 1: HR/Admin editing another employee's profile
    expect(canEditEmploymentDetails(true, false)).toBe(true);

    // Case 2: Employee editing their own personal profile
    expect(canEditEmploymentDetails(true, true)).toBe(false);
    expect(canEditEmploymentDetails(false, true)).toBe(false);

    // Case 3: Employee without edit permission viewing another profile
    expect(canEditEmploymentDetails(false, false)).toBe(false);
  });
});

