import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Jobs from "../../modules/recruitment/jobs/Jobs";
import Applications from "../../modules/recruitment/applications/Applications";

const Recruitment = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/recruitment/jobs"} />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="applications" element={<Applications />} />
      </Route>
    </Routes>
  );
};

export default Recruitment;
