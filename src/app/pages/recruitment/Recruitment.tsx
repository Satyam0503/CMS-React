import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ApplicationsWrapper from "./ApplicationsWrapper";
import JobsWrapper from "./JobsWrapper";
import { ApplicantDetails } from "../../modules/recruitment/applications/ApplicantDetails";

const Recruitment = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/recruitment/jobs"} />} />
        <Route path="jobs" element={<JobsWrapper />} />
        <Route path="applications" element={<ApplicationsWrapper />} />
        <Route path="editapplicant/:applicantid" element={<ApplicantDetails/>}/>
        <Route path="*" element={<Navigate to={"/error"}/>}/>
      </Route>
    </Routes>
  );
};

export default Recruitment;
