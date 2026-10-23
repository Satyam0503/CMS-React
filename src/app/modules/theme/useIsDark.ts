import { useColorScheme } from "@mui/material";

/**
 * Hook to determine if the application is currently rendered in dark mode.
 * 
 * In MUI v6/v7 with CSS variables (`cssVariables: { colorSchemeSelector: "class" }`),
 * `theme.palette.mode` in JS remains static ("light") while CSS variables and
 * the `.dark` class on <html> are dynamically switched.
 * 
 * Components that need conditional styling in JS/TSX MUST use `useIsDark()`
 * instead of checking `theme.palette.mode === "dark"`.
 */
export const useIsDark = (): boolean => {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { mode, systemMode } = useColorScheme();
    const resolvedMode = (mode === "system" ? systemMode : mode) ?? "light";
    if (resolvedMode === "dark") {
      return true;
    }
  } catch {
    // If called outside CssVarsProvider context
  }

  if (typeof document !== "undefined" && document.documentElement) {
    return document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-bs-theme") === "dark";
  }

  return false;
};

