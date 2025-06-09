import { Brightness4, LightModeOutlined } from "@mui/icons-material";
import { setCurrentThemeMode, useThemeContext } from "../../../../../app/Context/ThemeContext";
import { IconButton, Tooltip } from "@mui/material";


export default function LightDarkMode() {
  const { theme, toggleThemeMode } = useThemeContext();

  const handleThemeChange = () => {
    toggleThemeMode();
    setCurrentThemeMode(theme === "light" ? "dark" : "light");
  }

  return (
    <>
      <Tooltip title="Light /Dark mode">
        <IconButton
          onClick={handleThemeChange}
        >
          {theme === "light" ? <Brightness4 /> : <LightModeOutlined />}
        </IconButton>
      </Tooltip >
    </>
  );
}