import { FC } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { ErrorsPage } from "../modules/errors/ErrorsPage";
import { Logout, AuthPage } from "../modules/auth";
import { App } from "../App";
import { useAppSelector } from "../Redux/hooks";
import { CareerMarketplace } from "../modules/careerPortal/pages/CareerMarketplace";
import { CareerJobDetails } from "../modules/careerPortal/pages/CareerJobDetails";
import { SavedJobsPage } from "../modules/careerPortal/pages/SavedJobsPage";
import { CareerPreferencesPage } from "../modules/careerPortal/pages/CareerPreferencesPage";
import { SavedJobsProvider } from "../modules/careerPortal/context/SavedJobsContext";
import { FormerEmployeePortalPage } from "../modules/formerEmployeePortal/FormerEmployeePortalPage";

const { BASE_URL } = import.meta.env;

const AppRoutes: FC = () => {
  const { isUserAuthenticated } = useAppSelector((state) => state.auth);
  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<SavedJobsProvider><App /></SavedJobsProvider>}>
          <Route path="error/*" element={<ErrorsPage />} />
          <Route path="career" element={<Navigate to="/careers" replace />} />
          <Route path="career/:legacyValue" element={<Navigate to="/careers" replace />} />
          <Route path="careers" element={<CareerMarketplace />} />
          <Route path="careers/saved" element={<SavedJobsPage />} />
          <Route path="careers/preferences" element={<CareerPreferencesPage />} />
          <Route path="careers/:companyCode/jobs/:jobSlug" element={<CareerJobDetails />} />
          <Route path="careers/:companyCode" element={<CareerMarketplace />} />
          <Route path="former-employee" element={<FormerEmployeePortalPage />} />

          {isUserAuthenticated ? (
            <>
              <Route path="/logout" element={<Logout />} />
              <Route path="/*" element={<PrivateRoutes />} />
              <Route index element={<Navigate to={"/dashboard"} />} />
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
