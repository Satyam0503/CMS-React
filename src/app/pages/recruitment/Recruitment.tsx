import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Jobs from "../../modules/recruitment/jobs/Jobs";
import Applications from "../../modules/recruitment/applications/Applications";
import { Container } from "@mui/material";
import ApplicationsWrapper from "./ApplicationsWrapper";
import JobsWrapper from "./JobsWrapper";

const Recruitment = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/recruitment/jobs"} />} />
        <Route path="jobs" element={<JobsWrapper />} />
        <Route path="applications" element={<ApplicationsWrapper />} />
      </Route>
    </Routes>
  );
};

export default Recruitment;
