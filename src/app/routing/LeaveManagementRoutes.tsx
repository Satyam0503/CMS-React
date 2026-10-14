import { Navigate, Route, Routes } from "react-router-dom"
import { LeaveManagementTabs } from "../modules/leaves/components/LeaveManagementTabs"
import { LeaveRequest } from "../modules/leaves/components/LeaveRequest";
import { EmployeesLeaveBalance } from "../modules/leaves/components/EmployeesLeaveBalance";
import LeavePolicies from "../modules/leaves/components/LeavePolicies";
import WorkFromHome from "../modules/attendance/WorkFromHome";
import { ProtectedRoute } from "../modules/users/about/components/ProtectedRoute";
import { ModulesName } from "../../utils/enums";

export const LeaveManagementRoutes = () => {
    return (
        <Routes>
            <Route element={<LeaveManagementTabs />} >
                <Route index element={<Navigate to="leaverequest" />} />
                <Route path="leaverequest" element={<LeaveRequest />} />
                <Route path="leavebalance" element={<EmployeesLeaveBalance />} />
                <Route path="leavepolicies" element={<LeavePolicies />} />
                <Route
                    path="work-from-home"
                    element={
                        <ProtectedRoute module={ModulesName.WorkFromHome}>
                            <WorkFromHome />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/error" />} />
            </Route>
        </Routes>
    )
}
