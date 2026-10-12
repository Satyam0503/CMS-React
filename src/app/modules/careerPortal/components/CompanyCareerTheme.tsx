import { ThemeProvider } from "@mui/material";
import { ReactNode, useMemo } from "react";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { createApplicationTheme } from "../../theme/MuiTheme";
import { AppStyle, DEFAULT_THEME, normalizeAppStyle } from "../../theme/useAppStyle";
import { getCurrentLocaleForMui } from "../../theme/themePalettes";

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

  return (
    <ThemeProvider theme={muiTheme}>
      <div data-app-style={companyTheme || DEFAULT_THEME}>{children}</div>
    </ThemeProvider>
  );
};
