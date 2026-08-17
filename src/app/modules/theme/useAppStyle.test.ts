import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, normalizeAppStyle, SUPPORTED_THEMES } from "./useAppStyle";

describe("useAppStyle normalization", () => {
  it("keeps supported values and falls back for invalid or legacy ones", () => {
    expect(SUPPORTED_THEMES).toEqual(["glass", "slate", "dawn"]);
    expect(normalizeAppStyle("glass")).toBe("glass");
    expect(normalizeAppStyle("aurora")).toBe(DEFAULT_THEME);
    expect(normalizeAppStyle("slate")).toBe("slate");
    expect(normalizeAppStyle("dawn")).toBe("dawn");
    expect(normalizeAppStyle("minimal")).toBe(DEFAULT_THEME);

    expect(normalizeAppStyle("cobalt")).toBe(DEFAULT_THEME);
    expect(normalizeAppStyle("classic")).toBe(DEFAULT_THEME);
    expect(normalizeAppStyle("gradient")).toBe(DEFAULT_THEME);
    expect(normalizeAppStyle("sunset")).toBe(DEFAULT_THEME);
    expect(normalizeAppStyle("executive")).toBe(DEFAULT_THEME);
    expect(normalizeAppStyle("random-invalid-value")).toBe(DEFAULT_THEME);
    expect(normalizeAppStyle(null)).toBe(DEFAULT_THEME);
    expect(normalizeAppStyle(undefined)).toBe(DEFAULT_THEME);
    expect(normalizeAppStyle("")).toBe(DEFAULT_THEME);
  });
});
