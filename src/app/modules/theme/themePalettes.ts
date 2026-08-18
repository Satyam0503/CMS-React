import { ColorSystemOptions } from "@mui/material";
import { LANGUAGE } from "../../../utils/enums";
import { frFR, enUS, deDE, jaJP, esES, zhCN } from "@mui/material/locale";

export const colors = {
  primary: {
    100: "#D9F3EF",
    200: "#B7E7DF",
    300: "#86D5C8",
    400: "#57B9AC",
    500: "#2F7D78",
    600: "#286B67",
    700: "#235955",
    800: "#1D4946",
    900: "#173C39",
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
      main: colors.primary[400],
      dark: colors.primary[600],
      darker: colors.primary[800],
    },
    secondary: {
      lighter: colors.secondary[200],
      light: colors.secondary[300],
      main: colors.secondary[500],
      dark: colors.secondary[700],
      darker: colors.secondary[900],
    },
    background: {
      default: "#101318",
      paper: "#171c24",
      body: "#101318",
      header: "#161b22",
      card: "#171c24",
      box: "#1d2430",
      sidebar: "#0c111b",
    },
    text: {
      primary: "#f4f5f7",
      secondary: "#b8bfca",
      disabled: "#7e8795",
    },
    divider: "rgba(226, 232, 240, 0.18)",
    mode: "dark",
  },
};

export const lightPalette: ColorSystemOptions = {
  palette: {
    primary: {
      lighter: colors.primary[200],
      light: colors.primary[300],
      main: colors.primary[500],
      dark: colors.primary[700],
      darker: colors.primary[900],
    },
    secondary: {
      lighter: colors.secondary[200],
      light: colors.secondary[300],
      main: colors.secondary[500],
      dark: colors.secondary[700],
      darker: colors.secondary[900],
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
      body: "#f5f5f5",
      header: "#ffffff",
      card: "#ffffff",
      sidebar: "#000000",
    },
    text: {
      primary: "#20242d",
      secondary: "#606978",
      disabled: "#9299a6",
    },
    divider: "rgba(32, 36, 45, 0.14)",
    mode: "light",
  },
};

// Dawn uses clear lavender as its main accent and rose as its secondary color.
export const dawnLightPalette: ColorSystemOptions = {
  ...lightPalette,
  palette: {
    ...lightPalette.palette,
    primary: {
      lighter: "#EDE1F3",
      light: "#C9A7D4",
      main: "#87518E",
      dark: "#673B70",
      darker: "#4D2857",
    },
    secondary: {
      lighter: "#FDE5EE",
      light: "#F1ADC5",
      main: "#D56892",
      dark: "#AC426D",
      darker: "#7D264B",
    },
  },
};

export const dawnDarkPalette: ColorSystemOptions = {
  ...darkPalette,
  palette: {
    ...darkPalette.palette,
    primary: {
      lighter: "#E9D7ED",
      light: "#CFA8D5",
      main: "#B77DB8",
      dark: "#8E5A90",
      darker: "#6B426D",
    },
    secondary: {
      lighter: "#F9D9E4",
      light: "#EEA9BE",
      main: "#E38BA8",
      dark: "#B75D7A",
      darker: "#893C57",
    },
  },
};

// chart palette

const chartColorpalette: { [key: string]: string[] } = {
  light: [
    "#2F7D78", // muted teal
    "#718096", // steel blue-grey
    "#6B7280", // slate
    "#C56C5C", // soft terracotta
    "#7E8F4F", // olive
    "#B57A9C", // dusty rose
    "#667C9D", // steel blue
    "#9A7A53", // sand
  ],
  dark: [
    "#5ED0C6", // teal
    "#A8B8C8", // light steel blue-grey
    "#A8B1C1", // slate
    "#E58B78", // terracotta
    "#A8C46B", // olive
    "#DC9BBC", // rose
    "#91AACD", // steel
    "#C8A57A", // sand
  ],
};

const dawnChartColorPalette: { [key: string]: string[] } = {
  light: ["#9B669C", "#D7839C", "#6B7280", "#B56A68", "#7E8F4F", "#B87A9C", "#657A9B", "#9A7A53"],
  dark: ["#B77DB8", "#E38BA8", "#A8B1C1", "#E58B78", "#A8C46B", "#D19ABC", "#91AACD", "#C8A57A"],
};

export const getChartPalette = (
  mode: "light" | "dark" | "system" | undefined,
  systemMode: "light" | "dark" | undefined,
  appStyle?: string
) => {
  const resolvedMode = systemMode ?? (mode === "dark" ? "dark" : "light");
  return (appStyle === "dawn" ? dawnChartColorPalette : chartColorpalette)[resolvedMode];
};
