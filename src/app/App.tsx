import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { I18nProvider } from "../_themes/i18n/i18nProvider";
import { LayoutSplashScreen } from "../_themes/layout/core";
import { AuthInit, getLocalKey } from "./modules/auth";
import { CssBaseline, StyledEngineProvider, ThemeProvider } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import "react-image-crop/dist/ReactCrop.css";

import { useAppSelector } from "./Redux/hooks";
import Connector from "../server/SignalR";
import { ToastProvider } from "../_themes/layout/core/ToastProvider";
import { setDayJsLocale } from "../utils/common";
import { useAppLang } from "../_themes/i18n/Metronici18n";
import React from "react";
import { getCurrentLocaleForMui } from "./modules/theme/themePalettes";
import { createApplicationTheme } from "./modules/theme/MuiTheme";
import ChatHub from "../server/ChatHub";
import { OnlineUsersListener } from "./modules/employees/components/OnlineUsersListener";

const App = () => {
  const { currentLanguage } = useAppLang();
  const [, setDayjsLocaleReady] = useState(false);
  const { isUserAuthenticated } = useAppSelector((state) => state.auth);
  const token = getLocalKey()?.token ?? "";
  const instance = Connector.getInstance();
  const chatHubInstance = ChatHub.getInstance();

  const theme = React.useMemo(
    () => {
      const currentLocale = getCurrentLocaleForMui(currentLanguage);
      return createApplicationTheme(currentLocale);
    },
    [currentLanguage]
  );

  // set dayjs locale to current locale
  useEffect(() => {
    (async () => {
      await setDayJsLocale();
      setDayjsLocaleReady((prev) => !prev);
    })();
  }, [currentLanguage]);


  useEffect(() => {
    if (isUserAuthenticated && token) {
      instance.startConnection(token);
      chatHubInstance.startConnection(token);
    } else {
      instance.stopConnection();
      chatHubInstance.stopConnection();
    }

    return () => {
      instance.stopConnection();
      chatHubInstance.stopConnection();
    };
  }, [isUserAuthenticated, token]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<LayoutSplashScreen />}>
          <I18nProvider>
            <AuthInit>
              <OnlineUsersListener />
              <Outlet />
              <ToastProvider />
            </AuthInit>
          </I18nProvider>
        </Suspense>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export { App };
