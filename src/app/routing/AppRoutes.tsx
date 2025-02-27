import { FC } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { ErrorsPage } from "../modulesOld/errors/ErrorsPage";
import { Logout, AuthPage } from "../modules/auth";
import { App } from "../App";
import { useAppSelector } from "../Redux/hooks";
import ApplyNow from "../modules/career/ApplyNow";
import ApplyNowNew from "../modules/applynow/ApplyNowNew";
import { findUserDefaultTab } from "../../utils/common";

const { BASE_URL } = import.meta.env;

const AppRoutes: FC = () => {
  const { isUserAuthenticated } = useAppSelector((state) => state.auth);
  const userPermissions = useAppSelector(state=> state.user.userPermissions);
  
  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path="error/*" element={<ErrorsPage />} />
          <Route path="career/*" element={<ApplyNow />} />
          <Route path="logout" element={<Logout />} />
          <Route path="applynow/*" element={<ApplyNowNew />} />
 
          {isUserAuthenticated ? (
            <>
              <Route path="/*" element={<PrivateRoutes />} />
              <Route index element={<Navigate to={findUserDefaultTab(userPermissions)} />} />
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
