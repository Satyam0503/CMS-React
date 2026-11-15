import { describe, expect, it } from "vitest";
import { enUS } from "@mui/material/locale";
import type { Palette } from "@mui/material";
import { createApplicationTheme } from "./MuiTheme";
import { getChartPalette } from "./themePalettes";

// createTheme({ cssVariables }) returns colour schemes at runtime that `Theme` does not declare.
const schemes = (theme: ReturnType<typeof createApplicationTheme>) =>
  (theme as unknown as { colorSchemes: Record<"light" | "dark", { palette: Palette }> }).colorSchemes;

describe("createApplicationTheme", () => {
  it("exposes the rendered style and uses the violet palettes by default", () => {
    const theme = createApplicationTheme(enUS);
    expect(theme.appStyle).toBe("violet");
    expect(schemes(theme).light.palette.primary.main).toBe("#6D3FE6");
    expect(schemes(theme).dark.palette.primary.main).toBe("#8B6CFF");
    expect(schemes(theme).light.palette.success.lighter).toBe("#E7F8EE");
  });

  it("keeps the other styles on their own palettes", () => {
    const theme = createApplicationTheme(enUS, "glass");
    expect(theme.appStyle).toBe("glass");
    expect(schemes(theme).light.palette.primary.main).toBe("#0B5CAB");
  });

  it("returns the violet chart palette for violet", () => {
    expect(getChartPalette("light", undefined, "violet")[0]).toBe("#6D3FE6");
    expect(getChartPalette("system", "dark", "violet")[0]).toBe("#8B6CFF");
    expect(getChartPalette("light", undefined, "glass")[0]).toBe("#0B5CAB");
  });
});
