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
    100: "#FFF3E0",
    200: "#FFE2B8",
    300: "#FFD090",
    400: "#FFBE78",
    500: "#FEBB68",
    600: "#E5A359",
    700: "#CC8C4A",
    800: "#B3743B",
    900: "#995D2D",
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

// chart palette

const chartColorpalette: { [key: string]: string[] } = {
  light: [
    "#2F7D78", // muted teal
    "#D49A45", // warm amber
    "#6B7280", // slate
    "#C56C5C", // soft terracotta
    "#7E8F4F", // olive
    "#B57A9C", // dusty rose
    "#667C9D", // steel blue
    "#9A7A53", // sand
  ],
  dark: [
    "#5ED0C6", // teal
    "#F0B35B", // amber
    "#A8B1C1", // slate
    "#E58B78", // terracotta
    "#A8C46B", // olive
    "#DC9BBC", // rose
    "#91AACD", // steel
    "#C8A57A", // sand
  ],
};

export const getChartPalette = (
  mode: "light" | "dark" | "system" | undefined,
  systemMode: "light" | "dark" | undefined
) => {
  if (systemMode) return chartColorpalette[systemMode];
  else if (mode) return chartColorpalette[mode];
  else return chartColorpalette["light"];
};
