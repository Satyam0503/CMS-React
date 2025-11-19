import { Brightness4, LightModeOutlined } from "@mui/icons-material";
import { IconButton, Tooltip, useColorScheme } from "@mui/material";
import { useIntl } from "react-intl";


export default function LightDarkMode() {
  const { mode, systemMode, setMode } = useColorScheme();
  const { formatMessage: i } = useIntl();

  const handleThemeChange = () => {
    if (systemMode) {
      setMode(systemMode === "dark" ? "light" : "dark");
    }
    setMode(mode === "dark" ? "light" : "dark")
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
          {mode === "light" ? <Brightness4 className="fs-32" /> : <LightModeOutlined className="fs-32" />}
        </IconButton>
      </Tooltip >
    </>
  );
}