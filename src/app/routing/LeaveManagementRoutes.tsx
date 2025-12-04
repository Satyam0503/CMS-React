import { Navigate, Route, Routes } from "react-router-dom"
import { LeaveManagementTabs } from "../modules/leaves/components/LeaveManagementTabs"
import { LeaveRequest } from "../modules/leaves/components/LeaveRequest";
import { EmployeesLeaveBalance } from "../modules/leaves/components/EmployeesLeaveBalance";
import LeavePolicies from "../modules/leaves/components/LeavePolicies";

export const LeaveManagementRoutes = () => {
    return (
        <Routes>
            <Route element={<LeaveManagementTabs />} >
                <Route index element={<Navigate to="leaverequest" />} />
                <Route path="leaverequest" element={<LeaveRequest />} />
                <Route path="leavebalance" element={<EmployeesLeaveBalance />} />
                <Route path="leavepolicies" element={<LeavePolicies />} />
                <Route path="*" element={<Navigate to="/error" />} />
            </Route>
        </Routes>
    )
}
