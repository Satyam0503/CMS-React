import { describe, expect, it } from "vitest";
import { capturePublicApplicationAttribution } from "./publicApplicationAttribution";

describe("public application attribution", () => {
  it("captures campaign tags and only the external referrer host", () => {
    expect(capturePublicApplicationAttribution(
      "job-attribution-1",
      "?utm_source=linkedin&utm_medium=social&utm_campaign=engineer-q4",
      "https://news.example/jobs?id=private",
      "careers.codeji.in",
    )).toEqual({
      attributionSource: "linkedin",
      attributionMedium: "social",
      attributionCampaign: "engineer-q4",
      attributionContent: "",
      attributionTerm: "",
      referrerHost: "news.example",
    });
  });

  it("ignores same-site and malformed referrers and bounds campaign values", () => {
    const longTag = "x".repeat(240);
    expect(capturePublicApplicationAttribution("job-attribution-2", `?utm_campaign=${longTag}`, "not a url", "careers.codeji.in")).toMatchObject({
      attributionCampaign: "x".repeat(200),
      referrerHost: "",
    });
    expect(capturePublicApplicationAttribution("job-attribution-3", "", "https://careers.codeji.in/careers", "careers.codeji.in").referrerHost).toBe("");
  });

  it("keeps attribution stable for the same job so retries retain their original payload", () => {
    const first = capturePublicApplicationAttribution("job-attribution-retry", "", "https://partner.example/jobs", "careers.codeji.in");
    const retry = capturePublicApplicationAttribution("job-attribution-retry", "?utm_source=changed", "https://careers.codeji.in/job", "careers.codeji.in");
    expect(retry).toEqual(first);
  });
});
