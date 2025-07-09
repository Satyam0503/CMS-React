import { Navigate, Route, Routes } from "react-router-dom"
import { LeaveManagementTabs } from "./LeaveManagementTabs"
import { LeaveRequest } from "./LeaveRequest";
import { LeaveBalance } from "./LeaveBalance";
import { LeaveTypes } from "./LeaveTypes";

export const LeaveManagementRoutes = () => {
    return (
        <Routes>
            <Route element={<LeaveManagementTabs />} >
                <Route index element={<Navigate to="leaverequest" />} />
                <Route path="leaverequest" element={<LeaveRequest />} />
                <Route path="leavebalance" element={<LeaveBalance />} />
                <Route path="leavetypes" element={<LeaveTypes />} />
                <Route path="*" element={<Navigate to="/error" />} />
            </Route>
        </Routes>
    )
}
