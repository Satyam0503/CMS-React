import { Navigate, Route, Routes, useParams } from "react-router-dom";
import UserProfile from "../modules/users/UserProfile";
import AboutUser from "../modules/users/about/AboutUser";
import { UserPerformance } from "../modules/users/performance/UserPerformance";
import { WorkHistory } from "../modules/users/workhistory/WorkHistory";
import Setting from "../modules/users/usersetting/Setting";
import { LeaveTracker } from "../modules/users/leavetracker/LeaveTracker";

const ProfileTabs = () => {
    const empId = useParams().employeeid;
    return (
        <Routes>
            <Route element={<UserProfile />}>
                <Route index element={<Navigate to={"about"} />} />
                <Route path="about" element={<AboutUser />} />
                <Route path="performance" element={<UserPerformance />} />
                <Route path="workhistory" element={<WorkHistory />} />
                {
                    !empId &&
                    <>
                        <Route path="leave" element={<LeaveTracker />} />
                        <Route path="setting" element={<Setting />} />
                    </>
                }
            </Route>
            <Route path="*" element={<Navigate to={"/error"} />} />
        </Routes>
    );
};

export default ProfileTabs;