import { afterEach, describe, expect, it } from "vitest";
import {
  clearCandidateOfferResponseIdempotencyKey,
  getCandidateOfferResponseIdempotencyKey,
} from "./candidateOfferIdempotency";

describe("candidate offer response idempotency", () => {
  afterEach(() => sessionStorage.clear());

  it("reuses a random response key for a reload of the same offer version", () => {
    const first = getCandidateOfferResponseIdempotencyKey("offer-101", 4);
    const afterReload = getCandidateOfferResponseIdempotencyKey("offer-101", 4);

    expect(first).toBeTruthy();
    expect(afterReload).toBe(first);
    expect(sessionStorage.getItem("codeji.candidate-offer-response.v1")).not.toContain("valid-test-token");
  });

  it("uses a new key for revised offer terms and clears a completed response", () => {
    const original = getCandidateOfferResponseIdempotencyKey("offer-101", 4);
    const revised = getCandidateOfferResponseIdempotencyKey("offer-101", 5);

    expect(revised).not.toBe(original);
    clearCandidateOfferResponseIdempotencyKey("offer-101", 4);
    expect(getCandidateOfferResponseIdempotencyKey("offer-101", 4)).not.toBe(original);
  });

  it("keeps response keys bounded without storing bearer tokens or candidate form data", () => {
    for (let version = 1; version <= 25; version += 1) {
      getCandidateOfferResponseIdempotencyKey("offer-101", version);
    }
    const serialized = sessionStorage.getItem("codeji.candidate-offer-response.v1") || "";

    expect(Object.keys(JSON.parse(serialized))).toHaveLength(20);
    expect(serialized).not.toContain("valid-test-token");
    expect(serialized).not.toContain("candidate@example.com");
  });
});
