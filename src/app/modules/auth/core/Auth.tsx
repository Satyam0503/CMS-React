/* eslint-disable react-refresh/only-export-components */
import {
  FC,
  useState,
  useEffect,
} from "react";
import { LayoutSplashScreen } from "../../../../_themes/layout/core";
import * as authHelper from "./AuthHelpers";
import { getSignedUserDetails } from "./_requests";
import { WithChildren } from "../../../../_themes/helpers";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { setAuth, logout } from "../../../Redux/Reducers/authSlice";
import { setCurrentUser } from "../../../Redux/Reducers/userSlice";
import { useDispatch } from "react-redux";

export const useLogout = ()=>{
  const dispatch= useDispatch();
  return () =>{
    dispatch(logout());
    dispatch(setCurrentUser(undefined));
    authHelper.removeLocalKey();
  }
}

const AuthInit: FC<WithChildren> = ({ children }) => {
  const {token,isUserAuthenticated} = useAppSelector(state=>state.auth);
  const currentUser = useAppSelector(state=>state.user.userData);
  const dispatch = useAppDispatch();
  const logout = useLogout();
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  
  // requesting signed in user details by authToken 
  useEffect(() => {
    const requestUserDetails = async (token: string) => {
      try {
        if (!currentUser) {               
          const { data } = await getSignedUserDetails(token);
          if (!data.success) {
            throw new Error("Request Failed");
          }
          dispatch(setCurrentUser(data.methodResult));
          dispatch(setAuth());
        }
      } catch (error) {
        console.error(error);
        if (isUserAuthenticated) {
            logout();
        }
      } finally {
        setShowSplashScreen(false);
      }
    }; 
    if (token) { 
      requestUserDetails(token);
    } else {
      logout();
      setShowSplashScreen(false);
    }
  }, [token]);

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>;
};

export { AuthInit };
