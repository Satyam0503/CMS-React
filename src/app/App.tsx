import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { I18nProvider } from "../_themes/i18n/i18nProvider";
import { LayoutProvider, LayoutSplashScreen } from "../_themes/layout/core";
import { MasterInit } from "../_themes/layout/MasterInit";
import { AuthInit } from "./modules/auth";
import { ThemeModeProvider } from "../_themes/partials";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { MuiTheme, setColorsAsCSSVariables } from "./modules/theme/MuiTheme";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-image-crop/dist/ReactCrop.css";
import { ThemeProvider, useThemeContext } from "./Context/ThemeContext";

const App = () => {
  const { theme} = useThemeContext();

  return (
    // <ThemeProvider>
      <MuiThemeProvider theme={theme}>
        <Suspense fallback={<LayoutSplashScreen />}>
          <I18nProvider>
            <LayoutProvider>
              {/* <ThemeModeProvider> */}
                <AuthInit>
                  <Outlet />
                  <MasterInit />
                </AuthInit>
              {/* </ThemeModeProvider> */}
            </LayoutProvider>
          </I18nProvider>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={true}
            pauseOnFocusLoss
            pauseOnHover
            stacked={true}
            theme="light"
          />
        </Suspense>
      </MuiThemeProvider>
    // </ThemeProvider>
  );
};

export { App };
