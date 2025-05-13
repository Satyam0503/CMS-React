import { Brightness4, LightModeOutlined } from "@mui/icons-material";
import { CustomIconButton } from "../../../../../app/shared/components/CustomIconButton";
import { setCurrentThemeMode, useThemeContext } from "../../../../../app/Context/ThemeContext";


export default function LightDarkMode() {
  const { theme, toggleThemeMode } = useThemeContext();

  const handleThemeChange = () => {
    toggleThemeMode();
    setCurrentThemeMode(theme === "light" ? "dark" : "light");
  }

  return (
    <>
      <CustomIconButton
        handleClick={handleThemeChange}
        icon={theme === "light" ? <Brightness4 fontSize="large" /> : <LightModeOutlined fontSize="large" />}
        tooltip="Light /Dark mode"
        style={{
          border: "none",
          cursor: "pointer",
        }}
      />
    </>
  );
}