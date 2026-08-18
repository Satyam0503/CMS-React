import { FC, useState, useEffect } from "react";
import { LayoutSplashScreen } from "../../../../_themes/layout/core";
import { getSignedUserDetails } from "./_requests";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { setAuth } from "../../../Redux/Reducers/authSlice";
import { setCurrentUser } from "../../../Redux/Reducers/userSlice";
import { useNavigate } from "react-router-dom";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { LANGUAGE } from "../../../../utils/enums";
import { getCurrentAppLanguage } from "../../../../utils/common";
import { normalizeAppLanguage } from "../../../../_themes/i18n/languageUtils";
import { WithChildren } from "../../../../utils/common_types";


const AuthInit: FC<WithChildren> = ({ children }) => {
  const { changeAppLanguage } = useAppLang();
  const { token, isUserAuthenticated } = useAppSelector((state) => state.auth);
  const currentUser = useAppSelector((state) => state.user.userData);
  const dispatch = useAppDispatch();
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const requestUserDetails = async () => {
      try {
        if (!currentUser) {
          const { data } = await getSignedUserDetails();
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
          navigate("/logout")
        }
      } finally {
        setShowSplashScreen(false);
      }
    };
    if (token) {
      requestUserDetails();
    } else {
      setShowSplashScreen(false);
    }
  }, [token]);

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>;
};

export { AuthInit };
