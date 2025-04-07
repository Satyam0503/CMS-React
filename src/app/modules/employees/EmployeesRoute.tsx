import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../../modules/users/about/components/ProtectedRoute";
import { ModulesName } from "../../../utils/enums";
import { EmployeeAttendance } from "../attendance/EmployeeAttendance";
import { EmployeeLeaves } from "../leaves/EmployeeLeaves";
import Employees from "./Employees";
import { EmployeeProfile } from "../users/employeeprofile/EmployeeProfile";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";
import { useEffect } from "react";

const employeeBreadCrumbs: Array<Breadcrumb> = [
  {
    label: "PAGE.EMPLOYEES",
    path: "/employee/employees",
    parent: "/",
  },
  {
    label: "PAGE.LEAVE_MANAGEMENT",
    path: "/employee/employeeleave",
    parent: "/",
  },
  {
    label: "PAGE.ATTENDANCE",
    path: "/employee/attendance",
    parent: "/",
  }, 
  {
    label: "PAGE.PROFILE",
    path: "/employee/{employeeid}",
    parent: "/employee/employees",
  }, 
];

const EmployeesRoute = () => {
  const {setBreadcrumbs} = useBreadcrumbs();

  useEffect(()=>{
    setBreadcrumbs(employeeBreadCrumbs);
  },[])

  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route index element={<Navigate to={"/employee/employees"} />} />
        <Route
          path="/employees"
          element={
            <ProtectedRoute module={ModulesName.Employees}>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employeeleave"
          element={
            <ProtectedRoute module={ModulesName.LeaveManagement}>
              <EmployeeLeaves />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute module={ModulesName.Attendance}>
              <EmployeeAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:employeeid"
          element={
            <ProtectedRoute module={ModulesName.Employees}>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={"/error"} />} />
      </Route>
    </Routes>
  );
};

export default EmployeesRoute;
