import { CloseRounded } from "@mui/icons-material";
import { useColorScheme } from "@mui/material";
import { Bounce, CloseButtonProps, Flip, Slide, ToastContainer, Zoom } from "react-toastify";
import { useEffect, useState } from "react";
import { readNotificationConfig, type NotificationConfig } from "../../../app/shared/notifications";
import { getRequest } from "../../../server/axios";
import { useAppSelector } from "../../../app/Redux/hooks";
// React-Toastify gives this component the exact close function for the toast
// being rendered. Calling it directly avoids document-level event handlers and
// ensures the visible button always dismisses its own notification.
const ToastCloseButton = ({ closeToast, ariaLabel }: CloseButtonProps) => (
  <button
    aria-label={ariaLabel || "Dismiss notification"}
    className="Toastify__close-button app-toast__close"
    type="button"
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      closeToast();
    }}
  >
    <CloseRounded fontSize="small" />
  </button>
);

const transitions = { slide: Slide, zoom: Zoom, flip: Flip, bounce: Bounce };

export const ToastProvider = () => {
  const { mode, systemMode } = useColorScheme();
  const { token, isUserAuthenticated } = useAppSelector((state) => state.auth);
  const currentTheme = mode === "system" ? systemMode : mode;
  const [config, setConfig] = useState<NotificationConfig>(readNotificationConfig);

  useEffect(() => {
    const refresh = () => setConfig(readNotificationConfig());
    window.addEventListener("codeji:notification-config", refresh);
    return () => window.removeEventListener("codeji:notification-config", refresh);
  }, []);

  useEffect(() => {
    if (!token || !isUserAuthenticated) return;
    let active = true;
  const loadCompanyConfig = async () => {
    try {
      const { data } = await getRequest<{
        success: boolean;
        methodResult?: {
          configuration?: Partial<NotificationConfig>;
        };
      }>("api/Company/NotificationPreferences");

      if (active && data.success && data.methodResult?.configuration) {
        setConfig((current) => ({ ...current, ...data.methodResult!.configuration }));
      }
    } catch {
      // Keep cached/default settings when the company request fails.
    }
  };

  void loadCompanyConfig();
  return () => { active = false; };
}, [isUserAuthenticated, token]);
  return (
    <ToastContainer
      position={config.position}
      autoClose={config.autoClose}
      hideProgressBar={false}
      newestOnTop={config.newestOnTop}
      // Notification content can include actions. Keep dismissal explicit so
      // a click on content cannot accidentally discard it.
      closeOnClick={config.closeOnClick}
      closeButton={config.showCloseButton ? ToastCloseButton : false}
      pauseOnFocusLoss={false}
      // Keep a notification visible while it is being read; React-Toastify
      // resumes the same countdown as soon as the pointer leaves the toast.
      pauseOnHover={config.pauseOnHover}
      draggable={false}
      limit={config.limit}
      transition={transitions[config.transition]}
      className="app-toast-container"
      toastClassName="app-toast"
      progressClassName="app-toast__progress"
      theme={config.theme === "system" ? currentTheme : config.theme}
    />
  );
};
