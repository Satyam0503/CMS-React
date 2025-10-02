import { PaletteMode, ThemeProvider, useMediaQuery } from "@mui/material"
import React, { FC, useContext, useMemo, useState } from "react"
import { createApplicationTheme } from "../modules/theme/MuiTheme"
import { frFR, enUS, deDE, jaJP, esES, zhCN } from "@mui/material/locale"
import { useAppLang } from "../../_themes/i18n/Metronici18n"
import { LANGUAGE } from "../../utils/enums"
import { APP_THEME_MODE } from "../../utils/constant/Constant"

type ThemeContextType = {
    theme: PaletteMode,
    toggleThemeMode: () => void,
}
type Props = {
    children: React.ReactNode,
}

const ThemeContext = React.createContext<ThemeContextType>({
    theme: "light",
    toggleThemeMode: () => { },
})

export const getCurrentThemeMode = (): string | undefined => {
    if (!localStorage) {
        return;
    }
    const themeMode = localStorage.getItem(APP_THEME_MODE);
    if (!themeMode) {
        return;
    }
    return themeMode;
}

export const setCurrentThemeMode = (key: PaletteMode) => {
    if (!localStorage) {
        return;
    }
    try {
        localStorage.setItem(APP_THEME_MODE, key);
    } catch (error) {
        console.error("AUTH LOCAL STORAGE SAVE ERROR", error);
    }
};

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
}

export const ThemeContextProvider: FC<Props> = ({ children }) => {
    const { currentLanguage } = useAppLang();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [mode, setMode] = useState<PaletteMode>((getCurrentThemeMode() as PaletteMode) ?? (prefersDarkMode ? "dark" : "light"));
    const themeMode = useMemo(
        () => ({
            theme: mode,
            toggleThemeMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [mode],
    );
    const theme = React.useMemo(
        () => {
            const currentLocale = getCurrentLocaleForMui(currentLanguage);
            return createApplicationTheme(mode, currentLocale);
        },
        [mode, currentLanguage]
    );

    return (
        <ThemeContext.Provider value={themeMode}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    )
}

export const useThemeContext = () => {
    return useContext(ThemeContext);
}