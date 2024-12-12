import React from "react";

import { Theme } from "@mui/material";
import { MuiTheme } from "./MuiTheme";

export function themeCreator(theme: string): Theme {
  return themeMap[theme];
}

declare module "@mui/material/styles" {
  interface Theme {
    colors: {
      shadows: {
        primary: string;
      };

      secondary: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      primary: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      success: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      warning: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      error: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      info: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
    };
    general: {
      reactFrameworkColor: React.CSSProperties["color"];
      borderRadiusSm: string;
      borderRadius: string;
      borderRadiusLg: string;
      borderRadiusXl: string;
    };
    sidebar: {
      background: React.CSSProperties["color"];
      boxShadow: React.CSSProperties["color"];
      width: string;
      textColor: React.CSSProperties["color"];
      dividerBg: React.CSSProperties["color"];
      menuItemColor: React.CSSProperties["color"];
      menuItemColorActive: React.CSSProperties["color"];
      menuItemBg: React.CSSProperties["color"];
      menuItemBgActive: React.CSSProperties["color"];
      menuItemIconColor: React.CSSProperties["color"];
      menuItemIconColorActive: React.CSSProperties["color"];
      menuItemHeadingColor: React.CSSProperties["color"];
    };
    header: {
      height: string;
      background: React.CSSProperties["color"];
      boxShadow: React.CSSProperties["color"];
      textColor: React.CSSProperties["color"];
    };
  }

  interface ThemeOptions {
    colors: {
      shadows: {
        medium: string;
      };
    };

    general: {
      reactFrameworkColor: React.CSSProperties["color"];
      borderRadiusSm: string;
      borderRadius: string;
      borderRadiusLg: string;
      borderRadiusXl: string;
    };
    sidebar: {
      background: React.CSSProperties["color"];
      boxShadow: React.CSSProperties["color"];
      width: string;
      textColor: React.CSSProperties["color"];
      dividerBg: React.CSSProperties["color"];
      menuItemColor: React.CSSProperties["color"];
      menuItemColorActive: React.CSSProperties["color"];
      menuItemBg: React.CSSProperties["color"];
      menuItemBgActive: React.CSSProperties["color"];
      menuItemIconColor: React.CSSProperties["color"];
      menuItemIconColorActive: React.CSSProperties["color"];
      menuItemHeadingColor: React.CSSProperties["color"];
    };
  }
}

const themeMap: { [key: string]: Theme } = {
  MuiTheme,
};

export interface SiteThemeColor {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ColorScale {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface AplhaValueType {
  primary: ColorScale;
  secondary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}
