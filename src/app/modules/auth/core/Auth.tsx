import { FC, useState, useEffect } from "react";
import { LayoutSplashScreen } from "../../../../_themes/layout/core";
import * as authHelper from "./AuthHelpers";
import { getSignedUserDetails, logoutUser } from "./_requests";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { setAuth, logout } from "../../../Redux/Reducers/authSlice";
import {
  resetUserSlice,
  setCurrentUser,
} from "../../../Redux/Reducers/userSlice";
import { useNavigate } from "react-router-dom";
import { RefreshTokenPayload } from "./_models";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { LANGUAGE } from "../../../../utils/enums";
import { WithChildren } from "../../../../utils/common_types";

export const useLogout = () => {
  const dispatch = useAppDispatch();
  return async () => {
    try {
      const refreshToken = authHelper.getLocalKey()?.refreshToken ?? "";
      if (!refreshToken) {
        throw new Error();
      }
      const payload: RefreshTokenPayload = {
        refreshToken,
      };
      const { data } = await logoutUser(payload);
      if (data.success) {
        dispatch(logout());
        dispatch(resetUserSlice());
        authHelper.removeLocalKey();
        localStorage.clear();
      }
      else {
        throw new Error();
      }
    } catch (error) {
      // localStorage.clear();
      console.log("Logout Error", error);
    }
  }
}


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
          changeAppLanguage?.(methodResult.defaultLanguage as LANGUAGE);
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
