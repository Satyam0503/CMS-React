import { LightModeOutlined } from "@mui/icons-material";
import { CustomIconButton } from "../../../../../app/shared/components/CustomIconButton";
import { useEffect, useState } from "react";
import { setColorsAsCSSVariables } from "../../../../../app/modules/theme/MuiTheme";
import { IconButton } from "@mui/material";

export default function LightDarkMode() {
  const [currentTheme, setCurrentTheme] = useState("light");

  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  useEffect(() => {
    setColorsAsCSSVariables();
  }, []);
  return (
    <>
      <CustomIconButton
        handleClick={toggleTheme}
        icon={<LightModeOutlined fontSize="large" />}
        tooltip="Light /Dark mode"
        style={{
          border: "none",
          cursor: "pointer",
          backgroundColor: currentTheme === "light" ? "#ffff" : "#333",
          color: currentTheme === "light" ? "#000" : "#fff",
        }}
      />
    </>
  );
}
