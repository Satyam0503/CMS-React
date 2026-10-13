import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useAppSelector } from "../Redux/hooks";
import { canAccessHrManagement, hasModuleFeaturePermission } from "../../utils/common";
import { ModulesName, Permission } from "../../utils/enums";

const UserProfile = lazy(() => import("../modules/users/UserProfile"));
const AboutUser = lazy(() => import("../modules/users/about/AboutUser"));
const UserPerformance = lazy(() =>
  import("../modules/users/performance/UserPerformance").then((module) => ({
    default: module.UserPerformance,
  }))
);
const WorkHistory = lazy(() =>
  import("../modules/users/workhistory/WorkHistory").then((module) => ({
    default: module.WorkHistory,
  }))
);
const Setting = lazy(() => import("../modules/users/usersetting/Setting"));
const LeaveTracker = lazy(() =>
  import("../modules/users/leavetracker/LeaveTracker").then((module) => ({
    default: module.LeaveTracker,
  }))
);

const SuspensedView = ({ children }: { children: JSX.Element }) => {
  return <Suspense fallback={null}>{children}</Suspense>;
};

const ProfileTabs = () => {
    const empId = useParams().employeeid;
    const roleType = useAppSelector(state => state.user.userData?.roleType);
    const modulePermission = useAppSelector(state => state.user.userData?.modulePermission) ?? []
    const hasLeavePanelAccess = hasModuleFeaturePermission(ModulesName.LeaveManagement, Permission.View, modulePermission);

    return (
        <Routes>
            <Route element={<SuspensedView><UserProfile /></SuspensedView>}>
                <Route index element={<Navigate to={"about"} />} />
                <Route path="about" element={<SuspensedView><AboutUser /></SuspensedView>} />
                <Route path="performance" element={canAccessHrManagement(roleType) ? <SuspensedView><UserPerformance /></SuspensedView> : <Navigate to="about" replace />} />
                <Route path="workhistory" element={<SuspensedView><WorkHistory /></SuspensedView>} />
                {
                    (!empId || hasLeavePanelAccess) &&
                    <Route path="leave" element={<SuspensedView><LeaveTracker /></SuspensedView>} />
                }
                {
                    !empId &&
                    <Route path="setting" element={<SuspensedView><Setting /></SuspensedView>} />
                }
            </Route>
            <Route path="*" element={<Navigate to={"/error"} />} />
        </Routes>
    );
};

export default ProfileTabs;
