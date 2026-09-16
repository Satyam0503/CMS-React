import { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
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
import { useCompanyTheme } from "./modules/theme/companyTheme";
import { AppStyle, normalizeAppStyle } from "./modules/theme/useAppStyle";
import ChatHub from "../server/ChatHub";
import { getRequest } from "../server/axios";

const App = () => {
  const { currentLanguage } = useAppLang();
  const [, setDayjsLocaleReady] = useState(false);
  const { isUserAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const token = getLocalKey()?.token ?? "";
  const instance = Connector.getInstance();
  const chatHubInstance = ChatHub.getInstance();
  const { theme: companyTheme, setTheme: setCompanyTheme } = useCompanyTheme();
  const [publicCareerTheme, setPublicCareerTheme] = useState<AppStyle | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    getRequest<{ appTheme?: string }>("api/Company/theme")
      .then(({ data }) => { if (active) setCompanyTheme(data.appTheme); })
      // Keep the last server-confirmed value during a transient failure.
      .catch(() => undefined);
    return () => { active = false; };
  }, [token, setCompanyTheme]);

  // MUI CSS variables belong to the top-level provider. A careers page must
  // therefore override that provider too; a nested page provider cannot safely
  // replace the theme left behind by an authenticated dashboard navigation.
  useEffect(() => {
    const match = location.pathname.match(/^\/careers\/(\d{6})(?:\/|$)/);
    if (!match) {
      setPublicCareerTheme(null);
      return;
    }

    let active = true;
    getRequest<{ methodResult?: { careerTheme?: string } }>(
      `api/public/career/companies/${match[1]}/profile`,
      { headers: { "Cache-Control": "no-cache" } },
    )
      .then(({ data }) => { if (active) setPublicCareerTheme(normalizeAppStyle(data.methodResult?.careerTheme)); })
      .catch(() => { if (active) setPublicCareerTheme(null); });
    return () => { active = false; };
  }, [location.pathname]);

  // The server-owned company theme is authoritative for authenticated users.
  // The client keeps no browser-persistent personal override.
  const effectiveStyle = publicCareerTheme ?? companyTheme;

  // Stamp the chosen style on <html> so SCSS can key off it for surfaces
  // outside the MUI theme (body background, header chrome, etc.).
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-app-style", effectiveStyle);
    document.body.setAttribute("data-app-style", effectiveStyle);
  }, [effectiveStyle]);

  const theme = React.useMemo(
    () => {
      const currentLocale = getCurrentLocaleForMui(currentLanguage);
      return createApplicationTheme(currentLocale, effectiveStyle);
    },
    [currentLanguage, effectiveStyle]
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
