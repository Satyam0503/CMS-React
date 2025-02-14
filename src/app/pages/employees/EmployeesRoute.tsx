import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { EmployeePageWrapper } from "./EmployeePageWrapper";
import { LeaveManagementWrapper } from "../leavemanagement/LeaveMangementWrapper";
import { AttendanceWrapper } from "../attendance/AttendanceWrapper";
import { ProtectedRoute } from "../../modules/users/about/components/ProtectedRoute";
import { ModulesName } from "../../../utils/enums";
const EmployeesRoute = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/employee/employees"} />} />
        <Route
          path="/employees"
          element={
            <ProtectedRoute module={ModulesName.Employees}>
              <EmployeePageWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employeeleave"
          element={
            <ProtectedRoute module={ModulesName.LeaveManagement}>
              <LeaveManagementWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute module={ModulesName.Attendance}>
              <AttendanceWrapper />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default EmployeesRoute;
