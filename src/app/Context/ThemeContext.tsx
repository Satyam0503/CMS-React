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
  const [mode, setMode] = useState("light");
//   const [mode, setMode] = useState(()=> localStorage.getItem('themMode') || 'light');

  const toggleTheme = () => {
    setMode((prev) => (prev == "light" ? "dark" : "light"));
  };

  const theme: Theme = useMemo(() => (mode == "light" ? MuiTheme : DarkTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
