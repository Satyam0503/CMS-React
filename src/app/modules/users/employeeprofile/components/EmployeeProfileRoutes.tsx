import { Routes, Route, Navigate } from "react-router-dom";
import AboutUser from "../../about/AboutUser";
import { LeaveTracker } from "../../leavetracker/LeaveTracker";
import { UserPerformance } from "../../performance/UserPerformance";
import Setting from "../../usersetting/Setting";
import { WorkHistory } from "../../workhistory/WorkHistory";
import EmployeeProfile from "../EmployeeProfile";


const ProfileTabs = () => {
  return (
    <Routes>
      <Route element={<EmployeeProfile />}>
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