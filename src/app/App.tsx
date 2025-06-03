import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { I18nProvider } from "../_themes/i18n/i18nProvider";
import { LayoutSplashScreen } from "../_themes/layout/core";
import { AuthInit } from "./modules/auth";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import "react-image-crop/dist/ReactCrop.css";
import { ThemeContextProvider } from "./Context/ThemeContext";
import { useAppSelector } from "./Redux/hooks";
import Connector from '../server/SignalR';
import { ToastProvider } from "../_themes/layout/core/ToastProvider";

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
            <AuthInit>
              <Outlet />
            </AuthInit>
          </I18nProvider>
          <ToastProvider />
        </Suspense>
      </ThemeContextProvider>
    </StyledEngineProvider>
  );
};

export { App };
