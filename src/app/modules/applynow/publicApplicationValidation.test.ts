import { describe, expect, it } from "vitest";
import { validatePublicApplicationCandidateFields } from "./publicApplicationValidation";

const validFields = {
  phone: "+1 (415) 555-0132",
  state: "California",
  experience: 4.5,
  noticePeriodDays: "30",
};

describe("public application candidate validation", () => {
  it("accepts international contact and bounded experience details", () => {
    expect(validatePublicApplicationCandidateFields(validFields)).toBeNull();
  });

  it.each([
    [{ ...validFields, state: " " }, "Please enter your state, province, or region."],
    [{ ...validFields, phone: "1234" }, "Enter a valid phone number with 7 to 15 digits. Include a country code when needed."],
    [{ ...validFields, experience: "" }, "Enter your experience in years."],
    [{ ...validFields, experience: -1 }, "Enter experience between 0 and 80 years."],
    [{ ...validFields, experience: 81 }, "Enter experience between 0 and 80 years."],
    [{ ...validFields, noticePeriodDays: -1 }, "Enter a notice period between 0 and 3650 days."],
    [{ ...validFields, noticePeriodDays: 3651 }, "Enter a notice period between 0 and 3650 days."],
  ])("rejects invalid candidate input", (fields, expectedMessage) => {
    expect(validatePublicApplicationCandidateFields(fields)).toBe(expectedMessage);
  });
});
