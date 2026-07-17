import { ColorSystemOptions } from "@mui/material";
import { LANGUAGE } from "../../../utils/enums";
import { frFR, enUS, deDE, jaJP, esES, zhCN } from "@mui/material/locale";

export const colors = {
  primary: {
    100: "#E6D9F5",
    200: "#E6D9F5",
    300: "#c0a4ebff",
    400: "#ad5ef2ff",
    500: "#9A56D3",
    600: "#8B4CBB",
    700: "#7C41A3",
    800: "#6D378B",
    900: "#5E2D73",
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
    mode: "light",
  },
};

// chart palette

const chartColorpalette: { [key: string]: string[] } = {
  light: [
    "#9A56D3", // purple
    "#FFA52F", // orange
    "#6d6d6dff",
    "#E0468F", // magenta
    "#F45D48", // coral
    "#FFC107", // amber
    "#3949AB", // deep blue
  ],
  dark: [
    "#9A56D3", // purple
    "#FFA52F", // orange
    "#E0468F", // magenta
    "#F45D48", // coral
    "#FFC107", // amber
    "#3949AB", // deep blue
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
