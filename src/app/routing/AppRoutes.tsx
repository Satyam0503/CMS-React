import { FC } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { ErrorsPage } from "../modules/errors/ErrorsPage";
import { Logout, AuthPage } from "../modules/auth";
import { App } from "../App";
import { useAppSelector } from "../Redux/hooks";
import { Career } from "../modules/applynow/Career";

const { BASE_URL } = import.meta.env;

const AppRoutes: FC = () => {
  const { isUserAuthenticated } = useAppSelector((state) => state.auth);
  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path="error/*" element={<ErrorsPage />} />
          <Route path="career/:id" element={<Career />} />

          {isUserAuthenticated ? (
            <>
              <Route path="/logout" element={<Logout />} />
              <Route path="/*" element={<PrivateRoutes />} />
              <Route
                index
                element={
                  <Navigate to={"/dashboard"} />
                }
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
