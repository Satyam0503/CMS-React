import { beforeEach, describe, expect, it } from "vitest";
import {
  clearWfhRequestIdempotencyKey,
  getWfhRequestIdempotencyKey,
  WfhRequestPayload,
} from "./wfhRequestIdempotency";

const payload: WfhRequestPayload = {
  fromDate: "2026-10-26",
  toDate: "2026-10-26",
  durationType: "FullDay",
  reasonCode: "PERSONAL",
  reasonText: "appointment",
};

describe("WFH request idempotency key", () => {
  beforeEach(() => localStorage.clear());

  it("reuses the persisted retry key for the same request body", async () => {
    const first = await getWfhRequestIdempotencyKey(payload);
    const retry = await getWfhRequestIdempotencyKey({ ...payload });

    expect(retry).toBe(first);
    expect(first.length).toBeGreaterThanOrEqual(16);
  });

  it("uses a different key when request fields change and clears it after success", async () => {
    const first = await getWfhRequestIdempotencyKey(payload);
    const changed = await getWfhRequestIdempotencyKey({ ...payload, toDate: "2026-10-27" });

    expect(changed).not.toBe(first);
    await clearWfhRequestIdempotencyKey(payload);
    expect(await getWfhRequestIdempotencyKey(payload)).not.toBe(first);
  });
});
