import { ColorSystemOptions } from "@mui/material";
import { LANGUAGE } from "../../../utils/enums";
import { frFR, enUS, deDE, jaJP, esES, zhCN, hiIN } from "@mui/material/locale";

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
    case LANGUAGE.HINDI:
      return hiIN;
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

// Violet: indigo navigation, lavender canvas, white cards. `lighter` on every
// colour is the pastel tile/chip tint used behind icons and status chips.
export const violetLightPalette: ColorSystemOptions = {
  palette: {
    primary: { lighter: "#EFEAFE", light: "#A78BFA", main: "#6D3FE6", dark: "#5A2FD0", darker: "#3F1FA0" },
    secondary: { lighter: "#F1EFF8", light: "#C9C5DA", main: "#6B6880", dark: "#4A4763", darker: "#2A2840" },
    success: { lighter: "#E7F8EE", light: "#4ADE80", main: "#16A34A", dark: "#15803D", darker: "#14532D" },
    warning: { lighter: "#FFF1E6", light: "#FDBA74", main: "#F97316", dark: "#C2410C", darker: "#7C2D12" },
    error: { lighter: "#FDEBEF", light: "#F9A8B8", main: "#E5484D", dark: "#C62A2F", darker: "#7F1D1D" },
    info: { lighter: "#E8F0FE", light: "#93C5FD", main: "#3B82F6", dark: "#1D4ED8", darker: "#1E3A8A" },
    background: {
      default: "#F6F5FB",
      paper: "#FFFFFF",
      body: "#F6F5FB",
      header: "rgba(246, 245, 251, 0.92)",
      card: "#FFFFFF",
      box: "#F8F7FC",
      sidebar: "#211E52",
    },
    text: { primary: "#1B1A2E", secondary: "#6B6880", disabled: "#A19EB3" },
    divider: "#ECE9F5",
    mode: "light",
  },
};

export const violetDarkPalette: ColorSystemOptions = {
  palette: {
    primary: { lighter: "rgba(139, 108, 255, 0.18)", light: "#B9A6FF", main: "#8B6CFF", dark: "#6D3FE6", darker: "#4C2BB5" },
    secondary: { lighter: "rgba(176, 172, 204, 0.14)", light: "#D6D3E8", main: "#B0ACCC", dark: "#8A86A8", darker: "#5E5A7D" },
    success: { lighter: "rgba(52, 211, 153, 0.16)", light: "#6EE7B7", main: "#34D399", dark: "#10B981", darker: "#065F46" },
    warning: { lighter: "rgba(251, 146, 60, 0.16)", light: "#FDBA74", main: "#FB923C", dark: "#F97316", darker: "#9A3412" },
    error: { lighter: "rgba(251, 113, 133, 0.16)", light: "#FDA4AF", main: "#FB7185", dark: "#E5484D", darker: "#9F1239" },
    info: { lighter: "rgba(96, 165, 250, 0.16)", light: "#93C5FD", main: "#60A5FA", dark: "#3B82F6", darker: "#1E40AF" },
    background: {
      default: "#12112A",
      paper: "#1C1A3A",
      body: "#12112A",
      header: "rgba(18, 17, 42, 0.92)",
      card: "#1C1A3A",
      box: "#24224A",
      sidebar: "#16143A",
    },
    text: { primary: "#F4F2FF", secondary: "#B0ACCC", disabled: "#6F6B8E" },
    divider: "rgba(176, 172, 204, 0.16)",
    mode: "dark",
  },
};

const violetChartColorPalette: { [key: string]: string[] } = {
  light: ["#6D3FE6", "#A78BFA", "#F9A8D4", "#34D399", "#FBBF24", "#60A5FA", "#F97316", "#94A3B8"],
  dark: ["#8B6CFF", "#C4B5FD", "#F9A8D4", "#34D399", "#FBBF24", "#60A5FA", "#FB923C", "#B0ACCC"],
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
  const palette =
    appStyle === "violet" ? violetChartColorPalette : appStyle === "dawn" ? dawnChartColorPalette : chartColorpalette;
  return palette[resolvedMode];
};
