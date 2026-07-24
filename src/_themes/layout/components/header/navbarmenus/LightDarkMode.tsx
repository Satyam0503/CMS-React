import { Brightness4, LightModeOutlined } from "@mui/icons-material";
import {
  Tooltip,
  useColorScheme,
} from "@mui/material";
import { useIntl } from "react-intl";


import { AppIconButton } from "../../../../../app/shared/components/ui";
export default function LightDarkMode() {
  const { mode, systemMode, setMode } = useColorScheme();
  const { formatMessage: i } = useIntl();
  const effectiveMode = mode === "system" ? systemMode : mode;

  const handleThemeChange = () => {
    setMode(effectiveMode === "dark" ? "light" : "dark");
  }

  return (
    <>
      <Tooltip title={i({ id: "TOOLTIP.SWITCH_THEME" })}>
        <AppIconButton
          onClick={handleThemeChange}
          sx={{ border: 0, p: 0 }}
          role="button"
          aria-label="change theme"
        >
          {effectiveMode === "light" ? <Brightness4 className="fs-32" /> : <LightModeOutlined className="fs-32" />}
        </AppIconButton>
      </Tooltip >
    </>
  );
}
