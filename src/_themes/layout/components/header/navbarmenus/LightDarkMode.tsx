import { Brightness4, LightModeOutlined } from "@mui/icons-material";
import { setCurrentThemeMode, useThemeContext } from "../../../../../app/Context/ThemeContext";
import { IconButton, Tooltip } from "@mui/material";
import { useIntl } from "react-intl";


export default function LightDarkMode() {
  const { theme, toggleThemeMode } = useThemeContext();
  const { formatMessage: i } = useIntl();

  const handleThemeChange = () => {
    toggleThemeMode();
    setCurrentThemeMode(theme === "light" ? "dark" : "light");
  }

  return (
    <>
      <Tooltip title={i({ id: "TOOLTIP.SWITCH_THEME" })}>
        <IconButton
          onClick={handleThemeChange}
          sx={{ border: 0, p: 0 }}
          role="button"
          aria-label="change theme"
        >
          {theme === "light" ? <Brightness4 className="fs-32" /> : <LightModeOutlined className="fs-32" />}
        </IconButton>
      </Tooltip >
    </>
  );
}