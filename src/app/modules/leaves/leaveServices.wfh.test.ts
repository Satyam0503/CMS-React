import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  postRequest: vi.fn(),
  getKey: vi.fn(),
  clearKey: vi.fn(),
}));

vi.mock("../../../server/axios", () => ({
  postRequest: mocks.postRequest,
  deleteRequest: vi.fn(),
  getRequest: vi.fn(),
  patchRequest: vi.fn(),
  putRequest: vi.fn(),
}));

vi.mock("../attendance/hooks/wfhRequestIdempotency", () => ({
  getWfhRequestIdempotencyKey: mocks.getKey,
  clearWfhRequestIdempotencyKey: mocks.clearKey,
}));

import { canApplyForWorkFromHome, createWorkFromHomeRequest, shouldOfferWfhSelfServiceFallback } from "./leaveServices";

const payload = {
  fromDate: "2026-10-26",
  toDate: "2026-10-26",
  durationType: "FullDay" as const,
  reasonCode: "PERSONAL",
  reasonText: "appointment",
};

describe("createWorkFromHomeRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getKey.mockResolvedValue("wfh-retry-key-0123456789");
    mocks.postRequest.mockResolvedValue({ data: { success: true } });
  });

  it("sends the retry key as a header and clears it after a successful response", async () => {
    await createWorkFromHomeRequest(payload);

    expect(mocks.postRequest).toHaveBeenCalledWith("api/wfh/requests", payload, {
      headers: { "Idempotency-Key": "wfh-retry-key-0123456789" },
    });
    expect(mocks.clearKey).toHaveBeenCalledWith(payload);
  });

  it("keeps the retry key when the API does not confirm success", async () => {
    mocks.postRequest.mockResolvedValue({ data: { success: false } });

    await createWorkFromHomeRequest(payload);

    expect(mocks.clearKey).not.toHaveBeenCalled();
  });
});

describe("canApplyForWorkFromHome", () => {
  it("requires the exact self-service create permission", () => {
    expect(canApplyForWorkFromHome(["Work_From_Home.ViewOwn"])).toBe(false);
    expect(canApplyForWorkFromHome(["Work_From_Home.Create"])).toBe(true);
    expect(canApplyForWorkFromHome(["Work_From_Home.CreateOwn"])).toBe(true);
  });
});

describe("shouldOfferWfhSelfServiceFallback", () => {
  it("offers the WFH workflow when the employee is eligible but has no mapped leave policy", () => {
    expect(shouldOfferWfhSelfServiceFallback(["Work_From_Home.CreateOwn"], true, false)).toBe(true);
    expect(shouldOfferWfhSelfServiceFallback(["Work_From_Home.ViewOwn"], true, false)).toBe(false);
    expect(shouldOfferWfhSelfServiceFallback(["Work_From_Home.CreateOwn"], false, false)).toBe(false);
    expect(shouldOfferWfhSelfServiceFallback(["Work_From_Home.CreateOwn"], true, true)).toBe(false);
  });
});
