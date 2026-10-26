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

import { createWorkFromHomeRequest } from "./leaveServices";

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
