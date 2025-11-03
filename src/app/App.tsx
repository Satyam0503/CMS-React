import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { I18nProvider } from "../_themes/i18n/i18nProvider";
import { LayoutSplashScreen } from "../_themes/layout/core";
import { AuthInit, getLocalKey } from "./modules/auth";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import "react-image-crop/dist/ReactCrop.css";
import { ThemeContextProvider } from "./Context/ThemeContext";
import { useAppSelector } from "./Redux/hooks";
import Connector from "../server/SignalR";
import { ToastProvider } from "../_themes/layout/core/ToastProvider";
import { setDayJsLocale } from "../utils/common";
import { useAppLang } from "../_themes/i18n/Metronici18n";

const App = () => {
  const { currentLanguage } = useAppLang();
  const [, setDayjsLocaleReady] = useState(false);
  const { isUserAuthenticated } = useAppSelector((state) => state.auth);
  const token = getLocalKey()?.token ?? "";
  const instance = Connector.getInstance();

  // set dayjs locale to current locale
  useEffect(() => {
    (async () => {
      await setDayJsLocale();
      setDayjsLocaleReady((prev) => !prev);
    })();
  }, [currentLanguage]);

  if (isUserAuthenticated && token) {
    instance.startConnection(token);
  } else {
    instance.stopConnection();
  }
  return (
    <StyledEngineProvider injectFirst>
      <ThemeContextProvider>
        <CssBaseline />
        <Suspense fallback={<LayoutSplashScreen />}>
          <I18nProvider>
            <AuthInit>
              <Outlet />
              <ToastProvider />
            </AuthInit>
          </I18nProvider>
        </Suspense>
      </ThemeContextProvider>
    </StyledEngineProvider>
  );
};

export { App };
