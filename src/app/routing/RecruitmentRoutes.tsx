import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ApplicantDetails } from "../modules/recruitment/applications/components/ApplicantDetails";
import { EditApplicant } from "../modules/recruitment/applications/components/EditApplicant";
import { ProtectedRoute } from "../modules/users/about/components/ProtectedRoute";
import { ModulesName, Permission } from "../../utils/enums";
import Jobs from "../modules/recruitment/jobs/Jobs";
import { Applications } from "../modules/recruitment/applications/Applications";
import ProcessLogs from "../modules/recruitment/processlog/ProcessLog";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";
import { useEffect } from "react";
import { CareerProfileAdminPage } from "../modules/careerPortal/pages/CareerProfileAdminPage";

const recruitmentBreadcrumb: Array<Breadcrumb> = [
  {
    label: "PAGE.APPLICATIONS",
    path: "/recruitment/applications",
    parent: "/",
  },
  {
    label: "PAGE.APPLICANT",
    path: "/recruitment/applicant/{applicantid}",
    parent: "/recruitment/applications",
  },
  {
    label: "PAGE.EDIT_APPLICANT",
    path: "/recruitment/applicant/edit/{applicantid}",
    parent: "/recruitment/applicant/{applicantid}",
  },
  {
    label: "PAGE.JOBS",
    path: "/recruitment/jobs",
    parent: "/",
  },
  {
    label: "PAGE.PROCESS_LOG",
    path: "/recruitment/processlog",
    parent: "/",
  },

];

const RecruitmentRoutes = () => {
  const { setBreadcrumbs } = useBreadcrumbs();
  useEffect(() => {
    setBreadcrumbs(recruitmentBreadcrumb);
  }, []);

  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/recruitment/jobs"} />} />
        <Route
          path="jobs"
          element={
            <ProtectedRoute module={ModulesName.Jobs}>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="applications"
          element={
            <ProtectedRoute module={ModulesName.Applications}>
              <Applications />
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
          path="applicant/edit/:applicantid"
          element={
            <ProtectedRoute module={ModulesName.Applications} permission={Permission.Edit}>
              <EditApplicant />
            </ProtectedRoute>
          }
        />
        <Route
          path="processlog"
          element={
            <ProtectedRoute module={ModulesName.ProcessLog}>
              <ProcessLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="career-profile"
          element={
            <ProtectedRoute module={ModulesName.CareerProfile} permission={Permission.Edit}>
              <CareerProfileAdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={"/error"} />} />
      </Route>
    </Routes>
  );
};

export default RecruitmentRoutes;
