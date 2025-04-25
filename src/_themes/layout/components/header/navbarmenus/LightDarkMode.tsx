import { LightModeOutlined } from "@mui/icons-material";
import { CustomIconButton } from "../../../../../app/shared/components/CustomIconButton";
import { useEffect, useState } from "react";
import { setColorsAsCSSVariables } from "../../../../../app/modules/theme/MuiTheme";
import { IconButton } from "@mui/material";
import { useThemeContext } from "../../../../../app/Context/ThemeContext";


export default function LightDarkMode() {
  const [theme, setTheme] = useState("light");
  const { toggleTheme, mode } = useThemeContext();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // const toggleTheme = () => {
  //   setTheme((prev) => (prev === "light" ? "dark" : "light"));                                   
  // };

  return (
    <>
      <CustomIconButton
        handleClick={toggleTheme}
        icon={<LightModeOutlined fontSize="large" />}
        tooltip="Light /Dark mode"
        style={{
          border: "none",
          cursor: "pointer",
          backgroundColor:  mode === "light" ? "#ffff" : "#333",
          color: mode === "light" ? "#000" : "#fff",
        }}
      />
    </>
  );
}