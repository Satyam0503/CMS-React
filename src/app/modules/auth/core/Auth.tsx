import { FC, useEffect } from "react";
import { getSignedUserDetails } from "./_requests";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { logout, setAuth } from "../../../Redux/Reducers/authSlice";
import { setCurrentUser } from "../../../Redux/Reducers/userSlice";
import { useNavigate } from "react-router-dom";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { LANGUAGE } from "../../../../utils/enums";
import { getCurrentAppLanguage } from "../../../../utils/common";
import { normalizeAppLanguage } from "../../../../_themes/i18n/languageUtils";
import { WithChildren } from "../../../../utils/common_types";
import { removeLocalKey } from "./AuthHelpers";


const AuthInit: FC<WithChildren> = ({ children }) => {
  const { changeAppLanguage } = useAppLang();
  const { token, isUserAuthenticated } = useAppSelector((state) => state.auth);
  const currentUser = useAppSelector((state) => state.user.userData);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const dismissStartupSplash = () => {
    // Auth routes do not render MasterLayout/LayoutProvider, so the static
    // splash injected by index.html must be dismissed here.
    document.body.classList.remove("page-loading");
  };

  const getUserDetailsWithTimeout = async () => {
    let timer: number | undefined;
    try {
      return await Promise.race([
        getSignedUserDetails(),
        new Promise<never>((_, reject) => {
          timer = window.setTimeout(() => reject(new Error("AUTH_VALIDATION_TIMEOUT")), 8000);
        }),
      ]);
    } finally {
      if (timer !== undefined) window.clearTimeout(timer);
    }
  };

  useEffect(() => {
    // Never block the route tree while session validation is pending. The
    // previous null render caused a blank page in every browser.
    dismissStartupSplash();
    const requestUserDetails = async () => {
      try {
        if (!currentUser) {
          const { data } = await getUserDetailsWithTimeout();
          const { statusCode, success, methodResult } = data;
          if (!(success && statusCode === 200)) {
            throw new Error();
          }
          dispatch(setCurrentUser(methodResult));
          dispatch(setAuth());

          const savedLanguage = getCurrentAppLanguage();
          const defaultLanguage = normalizeAppLanguage(methodResult.defaultLanguage) ?? LANGUAGE.ENGLISH;
          // UI locale is a user preference, not a company-content filter. Keep
          // the choice made on auth pages even when a legacy company has only
          // one configured content language.
          changeAppLanguage?.(savedLanguage ?? defaultLanguage);
        }
      } catch (error) {
        if (isUserAuthenticated) {
          // Do not route through the API logout page when validation failed;
          // that can create another hanging request or redirect loop.
          dispatch(logout());
          removeLocalKey();
          navigate("/auth/login", { replace: true });
        }
      } finally {
        dismissStartupSplash();
      }
    };
    if (token) {
      requestUserDetails();
    } else {
      dismissStartupSplash();
    }
  }, [token]);

  return <>{children}</>;
};

export { AuthInit };
