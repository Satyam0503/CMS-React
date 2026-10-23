import { ThemeProvider } from "@mui/material";
import { ReactNode, useLayoutEffect, useMemo } from "react";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { createApplicationTheme } from "../../theme/MuiTheme";
import { AppStyle, DEFAULT_THEME, normalizeAppStyle } from "../../theme/useAppStyle";
import { getCurrentLocaleForMui } from "../../theme/themePalettes";
import { DarkModeSynchronizer } from "../../../App";

type Props = { theme?: string | null; children: ReactNode };

// Public company branding must never inherit a visitor's localStorage choice.
// The theme arrives in the tenant-scoped public profile response and is applied
// only to this company careers surface.
export const CompanyCareerTheme = ({ theme, children }: Props) => {
  const { currentLanguage } = useAppLang();
  const companyTheme = normalizeAppStyle(theme) as AppStyle;
  const muiTheme = useMemo(
    () => createApplicationTheme(getCurrentLocaleForMui(currentLanguage), companyTheme),
    [companyTheme, currentLanguage],
  );

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-app-style", companyTheme || DEFAULT_THEME);
    document.body.setAttribute("data-app-style", companyTheme || DEFAULT_THEME);
  }, [companyTheme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <DarkModeSynchronizer />
      <div data-app-style={companyTheme || DEFAULT_THEME}>{children}</div>
    </ThemeProvider>
  );
};
