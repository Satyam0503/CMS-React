import React, {
  createContext,
  useMemo,
  useContext,
  useState,
  ReactNode,
} from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { MuiTheme } from "../modules/theme/MuiTheme";
import { DarkTheme } from "../modules/theme/DarkTheme";
import { Theme } from '@mui/material/styles';

interface ThemeContextType {
  mode: string;
  toggleTheme: () => void;
  theme: Theme
}

const defaultValue: ThemeContextType = {
  mode: "light",
  toggleTheme: () => {},
  theme: MuiTheme
};

const ThemeContext = createContext<ThemeContextType>(defaultValue);

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {

  const [mode, setMode] = useState(()=> localStorage.getItem('themeMode') || 'light');

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = (prev == "light" ? "dark" : "light");
      localStorage.setItem('themeMode',newMode);
      return newMode;
    });
  };

  const theme: Theme = useMemo(() => (mode == "light" ? MuiTheme : DarkTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
