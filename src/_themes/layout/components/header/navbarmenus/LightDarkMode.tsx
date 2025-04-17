import { LightModeOutlined } from "@mui/icons-material";
import { CustomIconButton } from "../../../../../app/shared/components/CustomIconButton";
import { useEffect, useState } from "react";
import { setColorsAsCSSVariables } from "../../../../../app/modules/theme/MuiTheme";
import { IconButton } from "@mui/material";

export default function LightDarkMode() {
  const [theme, setTheme] = useState("light");
  // Original code: Commented by Rajdeep
  // useEffect(() => {
  //   document.body.className = theme;
  // }, [theme]);

  const toggleTheme = () => {
    // setTheme((prev) => (prev === "light" ? "dark" : "light")); // Original code

    // By Rajdeep
    var themeMode: string = 'system'
    const stored_theme = localStorage.getItem('kt_theme_mode_value')

    if (stored_theme !== null) {
      themeMode = stored_theme === "light" ? "dark" : "light";
      console.log("Curr value : ", themeMode)
    }

    if (themeMode === 'system') {
      themeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    localStorage.setItem('kt_theme_mode_value',themeMode);

    // document.documentElement.setAttribute('kt_theme_mode_value', themeMode); // Not working
    document.documentElement.setAttribute('data-bs-theme', themeMode)
                                        
  };

  return (
    <>
      <CustomIconButton
        handleClick={toggleTheme}
        icon={<LightModeOutlined fontSize="large" />}
        tooltip="Light /Dark mode"
        style={{
          border: "none",
          cursor: "pointer",
          backgroundColor: theme === "light" ? "#ffff" : "#333",
          color: theme === "light" ? "#000" : "#fff",
        }}
      />
    </>
  );
}
