/* eslint-disable react-refresh/only-export-components */
import { FC, useState, useEffect } from "react";
import { LayoutSplashScreen } from "../../../../_themes/layout/core";
import * as authHelper from "./AuthHelpers";
import { getSignedUserDetails } from "./_requests";
import { WithChildren } from "../../../../_themes/helpers";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { setAuth, logout } from "../../../Redux/Reducers/authSlice";
import {
  setCurrentUser,
  setUserPermissions,
} from "../../../Redux/Reducers/userSlice";
import { useDispatch } from "react-redux";

export const useLogout = () => {
  const dispatch = useDispatch();
  return () => {
    dispatch(logout());
    dispatch(setCurrentUser(undefined));
    dispatch(setUserPermissions([]));
    authHelper.removeLocalKey();
  };
};

const AuthInit: FC<WithChildren> = ({ children }) => {
  const { token, isUserAuthenticated } = useAppSelector((state) => state.auth);
  const currentUser = useAppSelector((state) => state.user.userData);
  const dispatch = useAppDispatch();
  const logout = useLogout();
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  // requesting signed in user details by authToken
  useEffect(() => {
    const requestUserDetails = async () => {
      try {
        if (!currentUser) {
          const { data } = await getSignedUserDetails();
          const { statusCode, success, message, methodResult } = data;
          if (!(success && statusCode === 200)) {
            throw new Error("Request Failed");
          }
          dispatch(
            setCurrentUser({
              userId: methodResult.userId,
              firstName: methodResult.firstName,
              lastName: methodResult.lastName,
              fullName: methodResult.fullName,
              companyId: methodResult.companyId,
              role: methodResult.role,
              roleId:methodResult.roleId
            })
          );
          dispatch(setUserPermissions(methodResult.modulePermission));
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
