import { describe, expect, it, vi } from "vitest";

const { postRequest, putRequest } = vi.hoisted(() => ({
  postRequest: vi.fn().mockResolvedValue({ data: { success: true } }),
  putRequest: vi.fn().mockResolvedValue({ data: { success: true } }),
}));

vi.mock("../../../server/axios", () => ({
  deleteRequest: vi.fn(),
  getBlobRequest: vi.fn(),
  getRequest: vi.fn(),
  patchRequest: vi.fn(),
  postRequest,
  putRequest,
}));

import { saveEmployeeExitPolicy, updateEmployeeExitPolicy } from "./employeeServices";

describe("employee exit policy service", () => {
  it("uses POST for creation", async () => {
    await saveEmployeeExitPolicy({ employeeExitPolicyId: undefined } as never);
    expect(postRequest).toHaveBeenCalledWith("api/User/EmployeeExitPolicy", { employeeExitPolicyId: undefined });
  });

  it("uses PUT with the encoded policy id for edits", async () => {
    await updateEmployeeExitPolicy("policy/1", { employeeExitPolicyId: "stale" } as never);
    expect(putRequest).toHaveBeenCalledWith("api/User/EmployeeExitPolicy/policy%2F1", { employeeExitPolicyId: "stale" });
  });
});
