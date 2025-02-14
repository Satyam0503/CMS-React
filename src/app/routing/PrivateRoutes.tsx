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
import { UnAuthorizedAccess } from "../modules/components/UnAuthorizedAccess.tsx";

const SuperAdmin = lazy(() => import("../pages/superadmin/SuperAdmin.tsx"));
const Setting = lazy(() => import("../pages/admin/Settings"));
const Recruitment = lazy(() => import("../pages/recruitment/Recruitment"));
const EmployeePage = lazy(
  () => import("../pages/employees/EmployeesRoute.tsx")
);
const AdminDashboard = lazy(
  () => import("../pages/dashboards/AdminDashboard.tsx")
);
const UserDashboard = lazy(() => import("../pages/dashboards/UserDashboard"));
const ProfilePageWrapper = lazy(
  () => import("../pages/myprofile/ProfilePageWrapper")
);
const HolidaysWrapper = lazy(
  () => import("../pages/holidays/HolidaysWrapper.tsx")
);
const NoticeBoardWrapper = lazy(
  () => import("../pages/noticeboard/NoticeBoardWrapper.tsx")
);

const PrivateRoutes = () => {
  const userPermissions = useAppSelector((state) => state.user.userPermissions);
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
                <ProfilePageWrapper />
              </ProtectedRoute>
            </SuspensedView>
          }
        />

        <Route
          path="noticeboard"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.NoticeBoard}>
                <NoticeBoardWrapper />
              </ProtectedRoute>
            </SuspensedView>
          }
        />

        <Route
          path="holidays"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.Holidays}>
                <HolidaysWrapper />
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
        <Route path="/unauthorize" element={ <UnAuthorizedAccess type="unauthorise" /> }/>
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
