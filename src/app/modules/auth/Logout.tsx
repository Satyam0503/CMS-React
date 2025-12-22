import { useEffect, useState } from "react";
import { CircularLoader } from "../../shared/components/CircularLoader";
import { Navigate } from "react-router-dom";
import { useAppDispatch } from "../../Redux/hooks";
import Connector from "../../../server/SignalR";
import { getLocalKey } from "./core/AuthHelpers";
import { RefreshTokenPayload } from "./core/_models";
import { logoutUser } from "./core/_requests";
import { logout } from "../../Redux/Reducers/authSlice";
import { resetUserSlice } from "../../Redux/Reducers/userSlice";
import ChatHub from "../../../server/ChatHub";
import { resetOnlineUsers } from "../../Redux/Reducers/onlineUsersSlice";

export const Logout = () => {
  const dispatch = useAppDispatch();
  const signalRInstance = Connector.getInstance();
  const chatHubInstance = ChatHub.getInstance();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const logOutUser = async () => {
      try {
        const refreshToken = getLocalKey()?.refreshToken ?? "";
        if (!refreshToken) {
          throw new Error();
        }
        const payload: RefreshTokenPayload = {
          refreshToken,
        };
        const { data } = await logoutUser(payload);
        if (!data.success) {
          throw new Error();
        }
        dispatch(logout());
        dispatch(resetUserSlice());
        dispatch(resetOnlineUsers());
        localStorage.clear();
        signalRInstance.stopConnection();
        chatHubInstance.stopConnection();
        setRedirect(true);
      } catch (error) {
        // navigate("/auth");
        // localStorage.clear();
        console.log("Logout Error", error);
      }
      finally {
        setRedirect(true);
      }
    }
    logOutUser();
  }, []);

  if (redirect) {
    return <Navigate to="/auth/login" />
  }
  return <CircularLoader />
}

