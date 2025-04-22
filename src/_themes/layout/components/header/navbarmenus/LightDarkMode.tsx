import { LightModeOutlined } from "@mui/icons-material";
import { CustomIconButton } from "../../../../../app/shared/components/CustomIconButton";
import { useEffect, useState } from "react";
import { setColorsAsCSSVariables } from "../../../../../app/modules/theme/MuiTheme";
import { IconButton } from "@mui/material";

export default function LightDarkMode() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));                                   
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