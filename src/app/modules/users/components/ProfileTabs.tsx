import { Navigate, Route, Routes } from "react-router-dom";
import UserProfile from "../UserProfile";
import AboutUser from "../about/AboutUser";
import { UserPerformance } from "../performance/UserPerformance";
import { LeaveTracker } from "../leavetracker/LeaveTracker";
import Setting from "../usersetting/Setting";
import { WorkHistory } from "../workhistory/WorkHistory";

const ProfileTabs = () => {
  return (
    <Routes>
      <Route element={<UserProfile />}>
        <Route index element={<Navigate to={"about"} />} />
        <Route path="about" element={<AboutUser />} />
        <Route path="leave" element={<LeaveTracker />} />
        <Route path="performance" element={<UserPerformance />} />
        <Route path="workhistory" element={<WorkHistory />} />
        <Route path="setting" element={<Setting />} />
      </Route>
      <Route path="*" element={<Navigate to={"/error"} />} />
    </Routes>
  );
};

export default ProfileTabs;