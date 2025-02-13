import { lazy, FC, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { MasterLayout } from "../../_themes/layout/MasterLayout";
import TopBarProgress from "react-topbar-progress-indicator";
import { getCSSVariableValue } from "../../_themes/assets/ts/_utils";
import { WithChildren } from "../../_themes/helpers";
import ProfilePageWrapper from "../pages/myprofile/ProfilePageWrapper";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import UserDashboard from "../pages/dashboards/UserDashboard";
import HolidaysWrapper from "../pages/holidays/HolidaysWrapper.tsx";
import NoticeBoardWrapper from "../pages/noticeboard/NoticeBoardWrapper.tsx";
import { LeaveManagementWrapper } from "../pages/leavemanagement/LeaveMangementWrapper.tsx";
import { AttendanceWrapper } from "../pages/attendance/AttendanceWrapper.tsx";
import { EditApplicant } from "../modules/recruitment/applications/EditApplicant.tsx";
import { findUserDefaultTab } from "../../utils/common.ts";
import { useAppSelector } from "../Redux/hooks.ts";

const SuperAdmin = lazy(() => import("../pages/superadmin/SuperAdmin.tsx"));
const Setting = lazy(() => import("../pages/admin/Settings"));
const Recruitment = lazy(() => import("../pages/recruitment/Recruitment"));
const EmployeePage = lazy(
  () => import("../pages/employees/EmployeesRoute.tsx")
);

const PrivateRoutes = () => {
  const userPermissions = useAppSelector((state) => state.user.userPermissions);
  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route
          path="auth/*"
          element={<Navigate to={findUserDefaultTab(userPermissions)} />}
        />
        <Route path="admindashboard" element={<AdminDashboard />} />
        <Route path="userdashboard" element={<UserDashboard />} />
        <Route path="myprofile" element={<ProfilePageWrapper />} />
        <Route path="employeeleave" element={<LeaveManagementWrapper />} />
        <Route path="attendance" element={<AttendanceWrapper />} />
        <Route path="holidays" element={<HolidaysWrapper />} />
        <Route path="noticeboard" element={<NoticeBoardWrapper />} />
        <Route path="editapplicantdetails" element={<EditApplicant />} />
        
        {/* Lazy Modules */}
        <Route
          path="employee/*"
          element={
            <SuspensedView>
              <EmployeePage />
            </SuspensedView>
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
              <Setting />
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

        {/* Page Not Found */}
        <Route path="*" element={<Navigate to="/error/404" />} />
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
