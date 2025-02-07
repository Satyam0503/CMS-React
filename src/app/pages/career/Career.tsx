import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ApplyNowNew from "../../modules/applynow/ApplyNowNew";

const Career = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/career"} />} />
        <Route path="applynow" element={<ApplyNowNew />} />
      </Route>
    </Routes>
  );
};

export default Career;
