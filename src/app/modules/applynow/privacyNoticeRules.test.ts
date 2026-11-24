import { describe, expect, it } from "vitest";
import { acknowledgesCurrentPrivacyNotice } from "./privacyNoticeRules";

describe("candidate privacy notice acknowledgement", () => {
  it("accepts a checked acknowledgement for the current version", () => {
    expect(acknowledgesCurrentPrivacyNotice(true, "policy-2", "policy-2")).toBe(true);
  });

  it("trims surrounding whitespace but rejects a stale version", () => {
    expect(acknowledgesCurrentPrivacyNotice(true, " policy-2 ", "policy-2")).toBe(true);
    expect(acknowledgesCurrentPrivacyNotice(true, "policy-1", "policy-2")).toBe(false);
  });

  it("rejects missing acknowledgement or an unconfigured current version", () => {
    expect(acknowledgesCurrentPrivacyNotice(false, "policy-2", "policy-2")).toBe(false);
    expect(acknowledgesCurrentPrivacyNotice(true, "policy-2", " ")).toBe(false);
    expect(acknowledgesCurrentPrivacyNotice(true, null, "policy-2")).toBe(false);
  });
});
