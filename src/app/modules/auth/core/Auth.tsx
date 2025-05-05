import { FC, useState, useEffect } from "react";
import { LayoutSplashScreen } from "../../../../_themes/layout/core";
import * as authHelper from "./AuthHelpers";
import { getSignedUserDetails } from "./_requests";
import { WithChildren } from "../../../../_themes/helpers";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { setAuth, logout } from "../../../Redux/Reducers/authSlice";
import {
  resetUserSlice,
  setCurrentUser,
} from "../../../Redux/Reducers/userSlice";
import { resetAllFilters } from "../../../Redux/Reducers/filterSlice";

export const useLogout = () => {
  const dispatch = useAppDispatch();
  return () => {
    dispatch(logout());
    dispatch(resetUserSlice());
    dispatch(resetAllFilters());
    authHelper.removeLocalKey();
  };
};

const AuthInit: FC<WithChildren> = ({ children }) => {
  const { token, isUserAuthenticated } = useAppSelector((state) => state.auth);
  const currentUser = useAppSelector((state) => state.user.userData);
  const dispatch = useAppDispatch();
  const logout = useLogout();
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    const requestUserDetails = async () => {
      try {
        if (!currentUser) {
          const { data } = await getSignedUserDetails();
          const { statusCode, success, methodResult } = data;
          if (!(success && statusCode === 200)) {
            throw new Error("Request Failed");
          }
          dispatch(setCurrentUser(methodResult));
          dispatch(setAuth());
        }
      } catch (error) {
        if (isUserAuthenticated) {
          logout();
        }
      } finally {
        setShowSplashScreen(false);
      }
    };
    if (token) {
      requestUserDetails();
    } else {
      logout();
      setShowSplashScreen(false);
    }
  }, [token]);

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>;
};

export { AuthInit };
