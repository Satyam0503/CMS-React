import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ApplyNowNew from "../../modules/applynow/ApplyNowNew";
import ApplyNow from "../../modules/career/ApplyNow";

const Career = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/career"} />} />
        {/* <Route path="applynow" element={<ApplyNow />} /> */}
      </Route>
    </Routes>
  );
};

export default Career;
