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
const Setting = lazy(() => import("../modules/admin/Settings.tsx"));
const Recruitment = lazy(
  () => import("../modules/recruitment/RecruitmentRoutes.tsx")
);
const EmployeePage = lazy(
  () => import("../modules/employees/EmployeesRoute.tsx")
);
const AdminDashboard = lazy(
  () => import("../modules/dashboard/AdminDashboard/DashboardAdmin.tsx")
);
const UserDashboard = lazy(
  () => import("../modules/dashboard/UserDashboard/DashboardUser.tsx")
);
const ProfilePage = lazy(
  () => import("../modules/users/ProfilePageWrapper.tsx")
);
const Holidays = lazy(() => import("../modules/holidays/Holidays.tsx"));
const NoticeBoard = lazy(
  () => import("../modules/noticeboard/NoticeBoard.tsx")
);
const ProcessLog = lazy(()=>import("../modules/processlog/ProcessLog.tsx"));

const PrivateRoutes = () => {
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission);
  const userPermissions = modulePermissions ?? [];
  return (
    <Routes>
      <Route element={<MasterLayout />}>
        <Route
          path="auth/*"
          element={<Navigate to={findUserDefaultTab(userPermissions)} />}
        />

        <Route
          path="admindashboard"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.Dashboard}>
                <AdminDashboard />
              </ProtectedRoute>
            </SuspensedView>
          }
        />

        <Route
          path="userdashboard"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.UserDashboard}>
                <UserDashboard />
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
        <Route
          path="/processlog"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.ProcessLog}>
                <ProcessLog/>
              </ProtectedRoute>
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
