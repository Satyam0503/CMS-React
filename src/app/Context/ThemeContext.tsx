import { PaletteMode, ThemeProvider, useMediaQuery } from "@mui/material"
import React, { FC, useContext, useEffect, useMemo, useState } from "react"
import { createApplicationTheme } from "../modules/theme/MuiTheme"

type ThemeContextType = {
    theme: PaletteMode,
    toggleThemeMode: () => void,
}
type Props = {
    children: React.ReactNode,
}

const APP_THEME_MODE = 'theme-mode';
const ThemeContext = React.createContext<ThemeContextType>({
    theme: "light",
    toggleThemeMode: () => { },
})

const getCurrentThemeMode = (): string | undefined => {
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

export const ThemeContextProvider: FC<Props> = ({ children }) => {
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
        () => createApplicationTheme(mode),
        [mode],
    );

    useEffect(() => {
        if (mode === "dark") {
            document.documentElement.classList.add("dark-mode");
        }
    }, [])
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