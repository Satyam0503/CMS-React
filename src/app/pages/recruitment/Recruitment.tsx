import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ApplicationsWrapper from "./ApplicationsWrapper";
import JobsWrapper from "./JobsWrapper";
import { ApplicantDetails } from "../../modules/recruitment/applications/ApplicantDetails";
import { EditApplicant } from "../../modules/recruitment/applications/EditApplicant";

const Recruitment = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/recruitment/jobs"} />} />
        <Route path="jobs" element={<JobsWrapper />} />
        <Route path="applications" element={<ApplicationsWrapper />} />
        <Route path="applicant/:applicantid" element={<ApplicantDetails/>}/>
        <Route path="editapplicant" element={<EditApplicant/>}/>
        <Route path="*" element={<Navigate to={"/error"}/>}/>
      </Route>
    </Routes>
  );
};

export default Recruitment;
