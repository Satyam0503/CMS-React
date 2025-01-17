import { lazy, FC, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { MasterLayout } from "../../_themes/layout/MasterLayout";
import TopBarProgress from "react-topbar-progress-indicator";
import { MenuTestPage } from "../pages/MenuTestPage";
import { getCSSVariableValue } from "../../_themes/assets/ts/_utils";
import { WithChildren } from "../../_themes/helpers";
import ProfilePageWrapper from "../pages/myprofile/ProfilePageWrapper";

import AdminDashboard from "../pages/dashboards/AdminDashboard";
import UserDashboard from "../pages/dashboards/UserDashboard";
import { DashboardWrapper } from "../pages/dashboard/DashboardWrapper";
import BuilderPageWrapper from "../pages/layout-builder/BuilderPageWrapper";
import HolidaysWrapper from "../pages/holidays/HolidaysWrapper.tsx";
import NoticeBoardWrapper from "../pages/noticeboard/NoticeBoardWrapper.tsx";
import { LeaveManagementWrapper } from "../pages/leavemanagement/LeaveMangementWrapper.tsx";
import { AttendanceWrapper } from "../pages/attendance/AttendanceWrapper.tsx";
import { EmployeePageWrapper } from "../pages/employees/EmployeeWrapper.tsx";

const PrivateRoutes = () => {
  const ProfilePage = lazy(() => import("../modulesOld/profile/ProfilePage"));
  const AccountPage = lazy(() => import("../modulesOld/accounts/AccountPage"));
  const Setting = lazy(() => import("../pages/admin/Settings"));
  const Recruitment = lazy(() => import("../pages/recruitment/Recruitment"));
  // const WizardsPage = lazy(() => import("../modules/wizards/WizardsPage"));
  // const WidgetsPage = lazy(() => import("../modules/widgets/WidgetsPage"));
  // const ChatPage = lazy(() => import("../modules/apps/chat/ChatPage"));
  const UsersPage = lazy(
    () => import("../modulesOld/apps/user-management/UsersPage")
  );

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route path="auth/*" element={<Navigate to="/dashboard" />} />
        {/* Pages */}
        <Route path="dashboard" element={<DashboardWrapper />} />
        <Route path="builder" element={<BuilderPageWrapper />} />
        <Route path="menu-test" element={<MenuTestPage />} />
        <Route path="admindashboard" element={<AdminDashboard />} />
        <Route path="userdashboard" element={<UserDashboard />} />
        <Route path="myprofile" element={<ProfilePageWrapper />} />
        <Route path="employeeleave" element={<LeaveManagementWrapper />} />
        <Route path="attendance" element={<AttendanceWrapper />} />
        <Route path="employees" element={<EmployeePageWrapper />} />
        <Route path="holidays" element={<HolidaysWrapper />} />
        <Route path="noticeboard" element={<NoticeBoardWrapper />} />
        {/* Lazy Modules */}
        <Route
          path="recruitment/*"
          element={
            <SuspensedView>
              <Recruitment />
            </SuspensedView>
          }
        />
        <Route
          path="setting/*"
          element={
            <SuspensedView>
              <Setting />
            </SuspensedView>
          }
        />
        <Route
          path="crafted/pages/profile/*"
          element={
            <SuspensedView>
              <ProfilePage />
            </SuspensedView>
          }
        />
        {/* <Route
          path='crafted/pages/wizards/*'
          element={
            <SuspensedView>
              <WizardsPage />
            </SuspensedView>
          }
        />
        <Route
          path='crafted/widgets/*'
          element={
            <SuspensedView>
              <WidgetsPage />
            </SuspensedView>
          }
        /> */}
        <Route
          path="crafted/account/*"
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        {/* <Route
          path="apps/chat/*"
          element={
            <SuspensedView>
              <ChatPage />
            </SuspensedView>
          }
        /> */}
        <Route
          path="apps/user-management/*"
          element={
            <SuspensedView>
              <UsersPage />
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
    barThickness: 1,
    shadowBlur: 5,
  });
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

export { PrivateRoutes };
