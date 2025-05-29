import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { I18nProvider } from "../_themes/i18n/i18nProvider";
import { LayoutProvider, LayoutSplashScreen } from "../_themes/layout/core";
import { AuthInit } from "./modules/auth";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-image-crop/dist/ReactCrop.css";
import { ThemeContextProvider } from "./Context/ThemeContext";
import { useAppSelector } from "./Redux/hooks";
import Connector from '../server/SignalR';

const App = () => {
  const { token, isUserAuthenticated } = useAppSelector(state => state.auth);
  useEffect(() => {
    const instance = Connector.getInstance()
    if (isUserAuthenticated && token) {
      instance.startConnection(token);
    } else {
      instance.stopConnection();
    }
  }, [isUserAuthenticated, token]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeContextProvider>
        <CssBaseline />
        <Suspense fallback={<LayoutSplashScreen />}>
          <I18nProvider>
            <LayoutProvider>
              <AuthInit>
                <Outlet />
              </AuthInit>
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
      </ThemeContextProvider>
    </StyledEngineProvider>
  );
};

export { App };
