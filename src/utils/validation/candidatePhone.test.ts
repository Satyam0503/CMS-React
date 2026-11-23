import { describe, expect, it } from "vitest";
import { isValidCandidatePhone } from "./candidatePhone";

describe("candidate phone validation", () => {
  it.each([
    ["9876543210", true],
    ["+1 (415) 555-0132", true],
    ["0044 20 7946 0018", true],
    ["1234", false],
    ["not a phone number", false],
    ["+1234567890123456", false],
    ["++14155550132", false],
  ])("validates %s", (phone, expected) => {
    expect(isValidCandidatePhone(phone)).toBe(expected);
  });
});
