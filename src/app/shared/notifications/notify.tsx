import { toast, type Id, type ToastOptions } from "react-toastify";
import { readNotificationConfig } from "./notificationConfig";

export type NoticeLevel = "success" | "error" | "warning" | "info" | "notification";
export type NoticeAction = { label: string; onClick: () => void };
export type NoticeOptions = ToastOptions & { dedupeKey?: string; action?: NoticeAction; persistent?: boolean };
const visible = new Map<string, Id>();
const duration: Record<NoticeLevel, number> = { success: 3500, info: 4000, warning: 5500, error: 7000, notification: 5500 };

const content = (message: React.ReactNode, action?: NoticeAction) => action ? (
  <div><div>{message}</div><button type="button" className="Toastify__action-button" onClick={action.onClick}>{action.label}</button></div>
) : message;

export function notify(level: NoticeLevel, message: React.ReactNode, options: NoticeOptions = {}): Id {
  const key = options.dedupeKey || (typeof message === "string" ? `${level}:${message}` : undefined);
  const existing = key && visible.get(key);
  if (existing && toast.isActive(existing)) return existing;
  const config = readNotificationConfig();
  const id = toast(content(message, options.action), {
    type: level === "notification" ? "info" : level,
    autoClose: options.persistent ? false : options.autoClose ?? duration[level] ?? config.autoClose,
    ...options,
    onClose: (...args) => { if (key) visible.delete(key); options.onClose?.(...args); },
  });
  if (key) visible.set(key, id);
  return id;
}

export const notifications = {
  success: (message: React.ReactNode, options?: NoticeOptions) => notify("success", message, options),
  error: (message: React.ReactNode, options?: NoticeOptions) => notify("error", message, options),
  warning: (message: React.ReactNode, options?: NoticeOptions) => notify("warning", message, options),
  info: (message: React.ReactNode, options?: NoticeOptions) => notify("info", message, options),
  notification: (message: React.ReactNode, options?: NoticeOptions) => notify("notification", message, options),
  loading: (message: React.ReactNode, options: NoticeOptions = {}) => toast.loading(message, { ...options, autoClose: false, closeOnClick: false }),
  resolve: (id: Id, level: Exclude<NoticeLevel, "notification">, message: React.ReactNode, options: NoticeOptions = {}) =>
    toast.update(id, { render: content(message, options.action), type: level, isLoading: false, autoClose: options.persistent ? false : options.autoClose ?? duration[level], ...options }),
};
