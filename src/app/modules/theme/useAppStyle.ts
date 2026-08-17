import { useCallback, useSyncExternalStore } from "react";

export const SUPPORTED_THEMES = ["glass", "aurora", "slate", "minimal"] as const;
export const DEFAULT_THEME = "glass" as const;
export type AppStyle = (typeof SUPPORTED_THEMES)[number];

export const APP_STYLES: { value: AppStyle; label: string; description: string }[] = [
  { value: "glass", label: "Glass", description: "Translucent surfaces with backdrop blur" },
  { value: "aurora", label: "Aurora", description: "Calm teal and violet with luminous accents" },
  { value: "slate", label: "Slate", description: "Warm off-white with calm grey-blue depth" },
  { value: "minimal", label: "Minimal", description: "Flat, light, low-contrast" },
];

const STORAGE_KEY = "appStyle";
const SAME_TAB_EVENT = "app-style-change";

export const normalizeAppStyle = (value: unknown): AppStyle => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return SUPPORTED_THEMES.includes(normalized as AppStyle) ? (normalized as AppStyle) : DEFAULT_THEME;
};

const isValidStyle = (value: unknown): value is AppStyle => normalizeAppStyle(value) === value?.toString().trim().toLowerCase();

const persistStyle = (next: AppStyle) => {
  try {
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(SAME_TAB_EVENT));
  } catch {
    // localStorage can be disabled (private mode, quota); silently ignore.
  }
};

const getStoredStyle = (): AppStyle => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const normalized = normalizeAppStyle(raw);
    if (raw && raw !== normalized) {
      persistStyle(normalized);
    }
    return normalized;
  } catch {
    return DEFAULT_THEME;
  }
};

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
    return getStoredStyle();
  } catch {
    return DEFAULT_THEME;
  }
};

// SSR-safe initial value (project is SPA, but useSyncExternalStore wants this).
const getServerSnapshot = (): AppStyle => DEFAULT_THEME;

export const useAppStyle = () => {
  const style = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setStyle = useCallback((next: AppStyle) => {
    persistStyle(normalizeAppStyle(next));
  }, []);

  return { style, setStyle };
};
