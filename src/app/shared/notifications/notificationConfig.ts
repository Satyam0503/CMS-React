import type { ToastPosition } from "react-toastify";

export type NotificationTheme = "system" | "light" | "dark";
export type NotificationTransition = "slide" | "zoom" | "flip" | "bounce";
export type NotificationConfig = {
  position: ToastPosition;
  autoClose: number;
  limit: number;
  newestOnTop: boolean;
  pauseOnHover: boolean;
  showCloseButton: boolean;
  closeOnClick: boolean;
  transition: NotificationTransition;
  theme: NotificationTheme;
};

export const NOTIFICATION_CONFIG_STORAGE_KEY = "codeji.notification.config.v1";
export const defaultNotificationConfig: NotificationConfig = {
  position: "top-right", autoClose: 3500, limit: 2, newestOnTop: true,
  pauseOnHover: true, showCloseButton: true, closeOnClick: false,
  transition: "slide", theme: "system",
};

export function readNotificationConfig(): NotificationConfig {
  try {
    const value = localStorage.getItem(NOTIFICATION_CONFIG_STORAGE_KEY);
    return value ? { ...defaultNotificationConfig, ...JSON.parse(value) } : defaultNotificationConfig;
  } catch { return defaultNotificationConfig; }
}

export function saveNotificationConfig(config: NotificationConfig) {
  localStorage.setItem(NOTIFICATION_CONFIG_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("codeji:notification-config"));
}
