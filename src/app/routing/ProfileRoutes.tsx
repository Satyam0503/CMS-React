import { Navigate, Route, Routes, useParams } from "react-router-dom";
import UserProfile from "../modules/users/UserProfile";
import AboutUser from "../modules/users/about/AboutUser";
import { UserPerformance } from "../modules/users/performance/UserPerformance";
import { WorkHistory } from "../modules/users/workhistory/WorkHistory";
import Setting from "../modules/users/usersetting/Setting";
import { LeaveTracker } from "../modules/users/leavetracker/LeaveTracker";
import { useAppSelector } from "../Redux/hooks";
import { hasModuleFeaturePermission } from "../../utils/common";
import { ModulesName, Permission } from "../../utils/enums";

const ProfileTabs = () => {
    const empId = useParams().employeeid;
    const modulePermission = useAppSelector(state => state.user.userData?.modulePermission) ?? []
    const hasLeavePanelAccess = hasModuleFeaturePermission(ModulesName.LeaveManagement, Permission.View, modulePermission);

    return (
        <Routes>
            <Route element={<UserProfile />}>
                <Route index element={<Navigate to={"about"} />} />
                <Route path="about" element={<AboutUser />} />
                <Route path="performance" element={<UserPerformance />} />
                <Route path="workhistory" element={<WorkHistory />} />
                {
                    (!empId || hasLeavePanelAccess) &&
                    <Route path="leave" element={<LeaveTracker />} />
                }
                {
                    !empId &&
                    <Route path="setting" element={<Setting />} />
                }
            </Route>
            <Route path="*" element={<Navigate to={"/error"} />} />
        </Routes>
    );
};

export default ProfileTabs;