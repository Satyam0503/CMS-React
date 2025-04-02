import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ApplicantDetails } from "./applications/components/ApplicantDetails";
import { EditApplicant } from "./applications/components/EditApplicant";
import { ProtectedRoute } from "../users/about/components/ProtectedRoute";
import { ModulesName } from "../../../utils/enums";
import Jobs from "./jobs/Jobs";
import { Applications } from "./applications/Applications";
import ProcessLogs from "./processlog/ProcessLog";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";

const applicationBreadcrumb: Array<Breadcrumb> = [
  {
    label: "Application",
    path: "/recruitment/applications",
    parent: "/",
  },
  {
    label: "Applicant",
    path: "/recruitment/applicant/{id}",
    parent: "/recruitment/applications",
  },
  {
    label: "Edit",
    path: "/recruitment/editapplicant",
    parent: "/recruitment/applicant/{id}",
  },
  {
    label: "Jobs",
    path: "/recruitment/jobs",
    parent: "/",
  },
  {
    label: "Process log",
    path: "/recruitment/processlog",
    parent: "/",
  },
 
];

const Recruitment = () => {
  const { setBreadcrumbs } = useBreadcrumbs();
  setBreadcrumbs(applicationBreadcrumb);

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
          path="editapplicant"
          element={
            <ProtectedRoute module={ModulesName.Applications}>
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

        <Route path="*" element={<Navigate to={"/error"} />} />
      </Route>
    </Routes>
  );
};

export default Recruitment;
