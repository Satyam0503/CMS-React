import { useEffect } from "react";
import { Navigate, Routes } from "react-router-dom";
import { useLogout } from "./core/Auth";

export function Logout() {
  const logout = useLogout();
  useEffect(() => {
    logout();
    document.location.reload();
  }, [logout]);

  return (
    // <Routes>
    <Navigate to="/auth/login" />
    // </Routes>
  );
}
