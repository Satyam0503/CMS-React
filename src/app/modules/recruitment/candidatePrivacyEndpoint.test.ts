import { describe, expect, it } from "vitest";
import { getCandidatePrivacyEndpoint } from "./candidatePrivacyEndpoint";

describe("candidate privacy route selection", () => {
  it("sends consent changes through the Applications Edit route", () => {
    expect(getCandidatePrivacyEndpoint("Grant")).toBe("api/RecruitmentCandidatePrivacy/Apply");
    expect(getCandidatePrivacyEndpoint("Revoke")).toBe("api/RecruitmentCandidatePrivacy/Apply");
  });

  it("sends erasure through the Applications Delete route", () => {
    expect(getCandidatePrivacyEndpoint("Anonymize")).toBe("api/RecruitmentCandidatePrivacy/Anonymize");
  });
});
