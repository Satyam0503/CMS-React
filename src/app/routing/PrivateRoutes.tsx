import { lazy, FC, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { MasterLayout } from "../../_themes/layout/MasterLayout";
import TopBarProgress from "react-topbar-progress-indicator";
import { getCSSVariableValue } from "../../_themes/assets/ts/_utils";
import { WithChildren } from "../../_themes/helpers";
import { findUserDefaultTab } from "../../utils/common.ts";
import { useAppSelector } from "../Redux/hooks.ts";
import { ProtectedRoute } from "../modules/users/about/components/ProtectedRoute.tsx";
import { ModulesName } from "../../utils/enums.ts";
import { UnAuthorizedAccess } from "../shared/components/UnAuthorizedAccess.tsx";

const SuperAdmin = lazy(() => import("../modules/superadmin/SuperAdmin.tsx"));
const Admin = lazy(() => import("../modules/admin/adminRoutes.tsx"));
const Recruitment = lazy(
  () => import("../modules/recruitment/RecruitmentRoutes.tsx")
);
const Employees = lazy(
  () => import("../modules/employees/Employees.tsx")
);
const EmployeeProfile = lazy(()=> import("../modules/users/employeeprofile/EmployeeProfile.tsx"));
const Dashboard = lazy(() => import("../modules/dashboard/Dashboard.tsx"));

const ProfilePage = lazy(
  () => import("../modules/users/ProfilePageWrapper.tsx")
);
const Holidays = lazy(() => import("../modules/holidays/Holidays.tsx"));
const NoticeBoard = lazy(
  () => import("../modules/noticeboard/NoticeBoard.tsx")
);

const Attendance = lazy(()=> import("../modules/attendance/EmployeeAttendance.tsx"));
const EmployeeLeaves = lazy(()=> import("../modules/leaves/EmployeeLeaves.tsx"));

const PrivateRoutes = () => {
  const modulePermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  return (
    <Routes>
      <Route element={<MasterLayout />}>
        <Route
          path="auth/*"
          element={<Navigate to={findUserDefaultTab(modulePermissions)} />}
        />

        <Route
          path="dashboard"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.Dashboard}>
                <Dashboard />
              </ProtectedRoute>
            </SuspensedView>
          }
        />

        <Route
          path="myprofile"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.MyProfile}>
                <ProfilePage />
              </ProtectedRoute>
            </SuspensedView>
          }
        />

        <Route
          path="noticeboard"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.NoticeBoard}>
                <NoticeBoard />
              </ProtectedRoute>
            </SuspensedView>
          }
        />

        <Route
          path="holidays"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.Holidays}>
                <Holidays />
              </ProtectedRoute>
            </SuspensedView>
          }
        />

        <Route
          path="employees"
          element={
            <ProtectedRoute module={ModulesName.Employees}>
              <SuspensedView>
                <Employees />
              </SuspensedView>
            </ProtectedRoute>
          }
        />

        <Route
          path="employees/:employeeid"
          element={
            <ProtectedRoute module={ModulesName.Employees}>
              <SuspensedView>
                <EmployeeProfile />
              </SuspensedView>
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <ProtectedRoute module={ModulesName.Attendance}>
              <SuspensedView>
                < Attendance/>
              </SuspensedView>
            </ProtectedRoute>
          }
        />
        <Route
          path="leavemanagement"
          element={
            <ProtectedRoute module={ModulesName.LeaveManagement}>
              <SuspensedView>
                <EmployeeLeaves />
              </SuspensedView>
            </ProtectedRoute>
          }
        />

        <Route
          path="recruitment/*"
          element={
            <SuspensedView>
              <Recruitment />
            </SuspensedView>
          }
        />
        <Route
          path="admin/*"
          element={
            <SuspensedView>
              <Admin />
            </SuspensedView>
          }
        />

        <Route
          path="superadmin/*"
          element={
            <SuspensedView>
              <SuperAdmin />
            </SuspensedView>
          }
        />
        <Route
          path="/unauthorize"
          element={<UnAuthorizedAccess type="unauthorise" />}
        />

        <Route path="*" element={<Navigate to={"/error/404"} />} />
      </Route>
    </Routes>
  );
};

const SuspensedView: FC<WithChildren> = ({ children }) => {
  const baseColor = getCSSVariableValue("--bs-primary");
  TopBarProgress.config({
    barColors: {
      "0": baseColor,
    },
    barThickness: 5,
    shadowBlur: 3,
  });
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

export { PrivateRoutes };
