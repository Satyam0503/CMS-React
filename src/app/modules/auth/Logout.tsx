import { useEffect, useState } from "react";
import { useLogout } from "./core/Auth";
import { CircularLoader } from "../../shared/components/CircularLoader";
import { Navigate } from "react-router-dom";

export function Logout() {
  const logout = useLogout();
  const [redirect, setRedirect] = useState(false);
  useEffect(() => {
    const logOutUser = async () => {
      await logout();
      setRedirect(true);
    }
    logOutUser();
  }, [logout]);

  if (redirect) {
    return <Navigate to="/auth/login" />
  }
  return <CircularLoader />
}
