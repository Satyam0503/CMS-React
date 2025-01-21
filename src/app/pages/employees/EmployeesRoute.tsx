import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { EmployeePageWrapper } from "./EmployeePageWrapper"
import { LeaveManagementWrapper } from "../leavemanagement/LeaveMangementWrapper"
import { AttendanceWrapper } from "../attendance/AttendanceWrapper"
const EmployeesRoute = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/employee/employees"} />} />
        <Route path="/employees" element={<EmployeePageWrapper />} />
        <Route path="/employeeleave" element={<LeaveManagementWrapper />} />
        <Route path="/attendance" element={<AttendanceWrapper />} />
      </Route>
    </Routes>
  );
};

export default EmployeesRoute;