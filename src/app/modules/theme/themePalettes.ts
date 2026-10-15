import { ColorSystemOptions } from "@mui/material";
import { LANGUAGE } from "../../../utils/enums";
import { frFR, enUS, deDE, jaJP, esES, zhCN } from "@mui/material/locale";

export const colors = {
  primary: {
    100: "#EBF3FA",
    200: "#C5DDF2",
    300: "#8ABCE6",
    400: "#3888D0",
    500: "#0B5CAB",
    600: "#084987",
    700: "#063766",
    800: "#042648",
    900: "#02162B",
  },
  secondary: {
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },
};

declare module "@mui/material/styles" {
  interface PaletteColor {
    lighter?: string;
    darker?: string;
  }

  interface TypeBackground {
    header?: string;
    body?: string;
    card?: string;
    box?: string;
    sidebar?: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }
}

export const getCurrentLocaleForMui = (lang: LANGUAGE) => {
  switch (lang) {
    case LANGUAGE.FRENCH:
      return frFR;
    case LANGUAGE.ENGLISH:
      return enUS;
    case LANGUAGE.GERMAN:
      return deDE;
    case LANGUAGE.JAPANESE:
      return jaJP;
    case LANGUAGE.SPANISH:
      return esES;
    case LANGUAGE.MANDARIN:
      return zhCN;
    default:
      return enUS;
  }
};

export const darkPalette: ColorSystemOptions = {
  palette: {
    primary: {
      lighter: colors.primary[200],
      light: colors.primary[300],
      main: "#3888D0",
      dark: colors.primary[500],
      darker: colors.primary[700],
    },
    secondary: {
      lighter: colors.secondary[200],
      light: colors.secondary[300],
      main: colors.secondary[500],
      dark: colors.secondary[700],
      darker: colors.secondary[900],
    },
    background: {
      default: "#0B0F19",
      paper: "#111827",
      body: "#0B0F19",
      header: "rgba(17, 24, 39, 0.85)",
      card: "rgba(17, 24, 39, 0.82)",
      box: "#1E293B",
      sidebar: "#0F172A",
    },
    text: {
      primary: "#F8FAFC",
      secondary: "#CBD5E1",
      disabled: "#64748B",
    },
    divider: "rgba(226, 232, 240, 0.14)",
    mode: "dark",
  },
};

export const lightPalette: ColorSystemOptions = {
  palette: {
    primary: {
      lighter: colors.primary[100],
      light: colors.primary[300],
      main: colors.primary[500],
      dark: colors.primary[600],
      darker: colors.primary[800],
    },
    secondary: {
      lighter: colors.secondary[100],
      light: colors.secondary[300],
      main: colors.secondary[600],
      dark: colors.secondary[700],
      darker: colors.secondary[900],
    },
    background: {
      default: "#F4F6F9",
      paper: "#FFFFFF",
      body: "#F4F6F9",
      header: "rgba(255, 255, 255, 0.95)",
      card: "#FFFFFF",
      box: "#F8FAFC",
      sidebar: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#334155",
      disabled: "#64748B",
    },
    divider: "#E2E8F0",
    mode: "light",
  },
};

// Dawn uses Corporate Teal & Cobalt instead of purple/lavender.
export const dawnLightPalette: ColorSystemOptions = {
  ...lightPalette,
  palette: {
    ...lightPalette.palette,
    primary: {
      lighter: "#E0F2FE",
      light: "#7DD3FC",
      main: "#0284C7",
      dark: "#0369A1",
      darker: "#075985",
    },
    secondary: {
      lighter: "#CCFBF1",
      light: "#5EEAD4",
      main: "#0D9488",
      dark: "#0F766E",
      darker: "#115E59",
    },
  },
};

export const dawnDarkPalette: ColorSystemOptions = {
  ...darkPalette,
  palette: {
    ...darkPalette.palette,
    primary: {
      lighter: "#E0F2FE",
      light: "#7DD3FC",
      main: "#38BDF8",
      dark: "#0284C7",
      darker: "#0369A1",
    },
    secondary: {
      lighter: "#CCFBF1",
      light: "#5EEAD4",
      main: "#2DD4BF",
      dark: "#0D9488",
      darker: "#115E59",
    },
  },
};

// Enterprise Corporate Analytics Palette (Zero Purple/Violet)
const chartColorpalette: { [key: string]: string[] } = {
  light: [
    "#0B5CAB", // corporate cobalt blue (Workday / Salesforce anchor)
    "#0D9488", // deep ocean teal (Gusto Kale)
    "#0284C7", // cerulean sky blue
    "#D97706", // executive warm amber
    "#16A34A", // emerald forest green
    "#EA580C", // warm terracotta coral
    "#334155", // deep slate navy
    "#64748B", // cool steel gray
  ],
  dark: [
    "#38BDF8", // sky blue
    "#2DD4BF", // teal
    "#60A5FA", // cobalt light
    "#FBBF24", // amber
    "#34D399", // emerald
    "#FB923C", // coral
    "#94A3B8", // slate
    "#CBD5E1", // light steel
  ],
};

const dawnChartColorPalette: { [key: string]: string[] } = {
  light: ["#0284C7", "#0D9488", "#0B5CAB", "#D97706", "#16A34A", "#EA580C", "#334155", "#64748B"],
  dark: ["#38BDF8", "#2DD4BF", "#60A5FA", "#FBBF24", "#34D399", "#FB923C", "#94A3B8", "#CBD5E1"],
};

export const getChartPalette = (
  mode: "light" | "dark" | "system" | undefined,
  systemMode: "light" | "dark" | undefined,
  appStyle?: string,
) => {
  const effective = mode === "system" ? systemMode : mode;
  const resolvedMode = effective === "dark" ? "dark" : "light";
  return (appStyle === "dawn" ? dawnChartColorPalette : chartColorpalette)[resolvedMode];
};
