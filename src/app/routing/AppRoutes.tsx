import { FC } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { ErrorsPage } from "../modules/errors/ErrorsPage";
import { Logout, AuthPage } from "../modules/auth";
import { App } from "../App";
import { useAppSelector } from "../Redux/hooks";
import { findUserDefaultTab } from "../../utils/common";
import ApplyNow from "../modules/applynow/ApplyNow";

const { BASE_URL } = import.meta.env;

const AppRoutes: FC = () => {
  const { isUserAuthenticated } = useAppSelector((state) => state.auth);
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission);
  const userModulePermission= modulePermissions ?? [];
  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path="error/*" element={<ErrorsPage />} />
          <Route path="career/*" element={<ApplyNow />} />
          <Route path="logout" element={<Logout />} />

          {isUserAuthenticated ? (
            <>
              <Route path="/*" element={<PrivateRoutes />} />
              <Route
                index
                element={<Navigate to={findUserDefaultTab(userModulePermission)} />}
              />
            </>
          ) : (
            <>
              <Route path="auth/*" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/auth" />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export { AppRoutes };
