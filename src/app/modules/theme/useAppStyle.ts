import { useCallback, useSyncExternalStore } from "react";

export type AppStyle = "classic" | "glass" | "gradient" | "minimal";

export const APP_STYLES: { value: AppStyle; label: string; description: string }[] = [
  { value: "classic",  label: "Classic",  description: "The original look" },
  { value: "glass",    label: "Glass",    description: "Translucent surfaces with backdrop blur" },
  { value: "gradient", label: "Gradient", description: "Vibrant primary→secondary gradient" },
  { value: "minimal",  label: "Minimal",  description: "Flat, light, low-contrast" },
];

const STORAGE_KEY = "appStyle";
const DEFAULT_STYLE: AppStyle = "classic";
// Same-tab broadcast event — the native `storage` event only fires for OTHER tabs.
const SAME_TAB_EVENT = "app-style-change";

const isValidStyle = (value: unknown): value is AppStyle =>
  typeof value === "string" && APP_STYLES.some((s) => s.value === value);

// Subscriber registry for useSyncExternalStore. Listens for both the native
// cross-tab `storage` event and our same-tab custom event so every component
// using useAppStyle() re-renders when ANY of them calls setStyle().
const subscribe = (callback: () => void) => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  const onSameTab = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener(SAME_TAB_EVENT, onSameTab);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SAME_TAB_EVENT, onSameTab);
  };
};

const getSnapshot = (): AppStyle => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isValidStyle(raw) ? raw : DEFAULT_STYLE;
  } catch {
    return DEFAULT_STYLE;
  }
};

// SSR-safe initial value (project is SPA, but useSyncExternalStore wants this).
const getServerSnapshot = (): AppStyle => DEFAULT_STYLE;

export const useAppStyle = () => {
  const style = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setStyle = useCallback((next: AppStyle) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event(SAME_TAB_EVENT));
    } catch {
      // localStorage can be disabled (private mode, quota); silently ignore.
    }
  }, []);

  return { style, setStyle };
};
