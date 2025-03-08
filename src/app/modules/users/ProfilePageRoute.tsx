import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AboutUser from "./about/AboutUser";
import { LeaveTracker } from "./leavetracker/LeaveTracker";

export const SuperAdmin = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/profilepage/about"} />} />
        <Route path="about" element={<AboutUser />} />
        <Route path="leavetracker" element={<LeaveTracker />} />
      </Route>
    </Routes>
  );
};
