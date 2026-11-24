import { describe, expect, it } from "vitest";
import { isPanelistOptionDisabled } from "./panelistSelection";

describe("panelist selection company setting", () => {
  it("allows one panelist and prevents adding another when panels are disabled", () => {
    expect(isPanelistOptionDisabled("interviewer-1", [], false)).toBe(false);
    expect(isPanelistOptionDisabled("interviewer-2", ["interviewer-1"], false)).toBe(true);
  });

  it("keeps already-selected panelists enabled so they can be removed", () => {
    expect(isPanelistOptionDisabled("interviewer-1", ["interviewer-1", "interviewer-2"], false)).toBe(false);
  });

  it("allows multiple panelists when the company enables panel interviews", () => {
    expect(isPanelistOptionDisabled("interviewer-3", ["interviewer-1", "interviewer-2"], true)).toBe(false);
  });
});
