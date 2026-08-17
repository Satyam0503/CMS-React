import { Brightness4, LightModeOutlined } from "@mui/icons-material";
import {
  SxProps,
  Theme,
  Tooltip,
  useColorScheme,
} from "@mui/material";
import { useIntl } from "react-intl";


import { AppIconButton } from "../../../../../app/shared/components/ui";
type LightDarkModeProps = {
  sx?: SxProps<Theme>;
};

export default function LightDarkMode({ sx }: LightDarkModeProps) {
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
          sx={[
            { border: 0, p: 0 },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
          role="button"
          aria-label="change theme"
        >
          {effectiveMode === "light" ? <Brightness4 className="fs-32" /> : <LightModeOutlined className="fs-32" />}
        </AppIconButton>
      </Tooltip >
    </>
  );
}
