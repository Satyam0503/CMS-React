import { lazy, Suspense, ReactNode } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { MasterLayout } from "../../_themes/layout/MasterLayout";
import TopBarProgress from "react-topbar-progress-indicator";
import { ProtectedRoute } from "../modules/users/about/components/ProtectedRoute.tsx";
import { ModulesName, Permission } from "../../utils/enums.ts";
import { UnAuthorizedAccess } from "../shared/components/UnAuthorizedAccess.tsx";
import { useTheme } from "@mui/material";

const Admin = lazy(() => import("../modules/admin/adminRoutes.tsx"));
const Recruitment = lazy(() => import("./RecruitmentRoutes.tsx"));
const Employees = lazy(() => import("../modules/employees/Employees.tsx"));
const Dashboard = lazy(() => import("../modules/dashboard/Dashboard.tsx"));
const Profile = lazy(() => import("./ProfileRoutes.tsx"));
const Calendar = lazy(() => import("../modules/holidays/Calendar.tsx"));
const NoticeBoard = lazy(() => import("./NoticeBoardRoutes.tsx"));
const Policies = lazy(() => import("./PoliciesRoutes.tsx"));
const Attendance = lazy(
  () => import("../modules/attendance/EmployeeAttendance.tsx"),
);
const LeaveManagement = lazy(
  () => import("../modules/leaves/LeaveManagement.tsx"),
);
const PayRollManagement = lazy(
  () => import("../modules/payroll/PayRollManagement.tsx"),
);
const PayrollSettings = lazy(
  () => import("../modules/payrollsettings/PayrollSettings.tsx"),
);
const EmployeeLifecycleManagement = lazy(
  () => import("../modules/employees/EmployeeLifecycleManagement.tsx"),
);
const AttendanceStatusSettings = lazy(() => import("../modules/attendance/AttendanceStatusSettings.tsx"));
const RecruitmentSettings = lazy(() => import("../modules/recruitment/RecruitmentSettings.tsx"));

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route element={<MasterLayout />}>
        <Route path="auth/*" element={<Navigate to={"/dashboard"} />} />

        <Route
          path="dashboard"
          element={
            <SuspensedView>
              <Dashboard />
            </SuspensedView>
          }
        />

        <Route
          path="profile/*"
          element={
            <SuspensedView>
              <Profile />
            </SuspensedView>
          }
        />

        <Route
          path="noticeboard/*"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.NoticeBoard}>
                <NoticeBoard />
              </ProtectedRoute>
            </SuspensedView>
          }
        />
        <Route
          path="companypolicy/*"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.Policy}>
                <Policies />
              </ProtectedRoute>
            </SuspensedView>
          }
        />

        <Route
          path="calendar"
          element={
            <SuspensedView>
              <ProtectedRoute module={ModulesName.Calendar}>
                <Calendar />
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
          path="employees/:employeeid/*"
          element={
            <ProtectedRoute module={ModulesName.Employees}>
              <SuspensedView>
                <Profile />
              </SuspensedView>
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <ProtectedRoute module={ModulesName.Attendance}>
              <SuspensedView>
                <Attendance />
              </SuspensedView>
            </ProtectedRoute>
          }
        />
        <Route path="attendance-settings" element={<ProtectedRoute adminOnly={true} module={ModulesName.Attendance}><SuspensedView><AttendanceStatusSettings /></SuspensedView></ProtectedRoute>} />
        <Route path="recruitment-settings" element={<ProtectedRoute adminOnly={true} module={ModulesName.Jobs}><SuspensedView><RecruitmentSettings /></SuspensedView></ProtectedRoute>} />
        <Route
          path="leavemanagement/*"
          element={
            <ProtectedRoute module={ModulesName.LeaveManagement}>
              <SuspensedView>
                <LeaveManagement />
              </SuspensedView>
            </ProtectedRoute>
          }
        />
        <Route
          path="payroll"
          element={
            <ProtectedRoute module={ModulesName.PayRoll}>
              <SuspensedView>
                <PayRollManagement />
              </SuspensedView>
            </ProtectedRoute>
          }
        />
        <Route
          path="settingspayroll"
          element={
            <ProtectedRoute module={ModulesName.PayrollSettings}>
              <SuspensedView>
                <PayrollSettings />
              </SuspensedView>
            </ProtectedRoute>
          }
        />
        <Route
          path="lifecycle-management"
          element={
            <ProtectedRoute module={ModulesName.Employees} permission={Permission.View}>
              <SuspensedView>
                <EmployeeLifecycleManagement />
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
            <ProtectedRoute adminOnly={true}>
              <SuspensedView>
                <Admin />
              </SuspensedView>
            </ProtectedRoute>
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

type PropsType = {
  children: ReactNode;
};

const SuspensedView = ({ children }: PropsType) => {
  const theme = useTheme();
  TopBarProgress.config({
    barColors: {
      "0": theme.palette.primary.main,
    },
    barThickness: 5,
    shadowBlur: 3,
  });
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

export { PrivateRoutes };

