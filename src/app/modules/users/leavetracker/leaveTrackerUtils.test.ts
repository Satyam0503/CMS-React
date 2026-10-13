import { describe, expect, it } from "vitest";
import { resolveLeaveBalanceTargetUserId } from "./leaveTrackerUtils";

describe("leave tracker request target", () => {
  it("prefers the employee id when browsing another profile", () => {
    expect(resolveLeaveBalanceTargetUserId("employee-2", "user-1")).toBe("employee-2");
  });

  it("falls back to the current user id when no employee profile is selected", () => {
    expect(resolveLeaveBalanceTargetUserId(undefined, "user-1")).toBe("user-1");
  });
});
