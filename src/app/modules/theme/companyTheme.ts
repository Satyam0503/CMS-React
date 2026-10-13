import { useCallback, useSyncExternalStore } from "react";
import { AppStyle, DEFAULT_THEME, normalizeAppStyle } from "./useAppStyle";

const SAME_TAB_EVENT = "company-theme-change";
let currentTheme: AppStyle = DEFAULT_THEME;

const readStoredCompanyTheme = (): AppStyle => {
  return currentTheme;
};

export const setCompanyTheme = (theme: unknown) => {
  currentTheme = normalizeAppStyle(theme);
  window.dispatchEvent(new Event(SAME_TAB_EVENT));
};

const subscribe = (callback: () => void) => {
  window.addEventListener(SAME_TAB_EVENT, callback);
  return () => {
    window.removeEventListener(SAME_TAB_EVENT, callback);
  };
};

export const useCompanyTheme = () => {
  const theme = useSyncExternalStore(subscribe, readStoredCompanyTheme, () => DEFAULT_THEME);
  const updateTheme = useCallback((next: unknown) => setCompanyTheme(next), []);
  return { theme, setTheme: updateTheme };
};
