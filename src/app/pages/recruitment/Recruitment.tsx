import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ApplicationsWrapper from "./ApplicationsWrapper";
import JobsWrapper from "./JobsWrapper";
import { ApplicantDetails } from "../../modules/recruitment/applications/ApplicantDetails";
import { EditApplicant } from "../../modules/recruitment/applications/EditApplicant";
import { ProtectedRoute } from "../../modules/users/about/components/ProtectedRoute";
import { ModulesName } from "../../../utils/enums";

const Recruitment = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/recruitment/jobs"} />} />
        <Route
          path="jobs"
          element={
            <ProtectedRoute module={ModulesName.Jobs}>
              <JobsWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="applications"
          element={
            <ProtectedRoute module={ModulesName.Applications}>
              <ApplicationsWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="applicant/:applicantid"
          element={
            <ProtectedRoute module={ModulesName.Applications}>
              <ApplicantDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="editapplicant"
          element={
            <ProtectedRoute module={ModulesName.Applications}>
              <EditApplicant />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={"/error"} />} />
      </Route>
    </Routes>
  );
};

export default Recruitment;
