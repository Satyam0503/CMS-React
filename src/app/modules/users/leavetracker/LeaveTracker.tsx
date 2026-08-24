import { Card, Chip, Divider, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { LeaveApplication } from "./components/LeaveApplication";
import { Add } from "@mui/icons-material";
import CustomisedButton from "../../../shared/components/C_Button";
import { useParams } from "react-router-dom";
import { EmployeeLeaveTypesCharts } from "./components/LeaveTypesChart";
import { MyLeaveRequests } from "./components/MyLeaveRequest";
import { ModulesName, Permission } from "../../../../utils/enums";
import {
  EmployeeLeaveTypeBalance,
  RequestLeaveModel,
} from "../../leaves/model";
import { useAppSelector } from "../../../Redux/hooks";
import { getEmployeeLeaveBalance, getMyProfileLeaveBalance } from "../../leaves/leaveServices";
import { toast } from "react-toastify";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { resolveLeaveBalanceTargetUserId } from "./leaveTrackerUtils";
import { getRequest, postRequest } from "../../../../server/axios";
import { CustomisedModal } from "../../../shared/components/C_Modal";

type WorkFromHomeContext = {
  isEligible: boolean;
  weeklyLimit: number;
  usedThisWeek: number;
  remainingThisWeek: number;
  canSchedule: boolean;
  disabledReasonCode?: string;
  businessDate?: string;
  isSameDayRequestCutoffPassed?: boolean;
  effectiveOfficeStartTime?: string | null;
};

type WorkFromHomeRequest = {
  requestId: string;
  fromDate: string;
  toDate: string;
  durationType: string;
  reasonText?: string;
  status: string;
  version: number;
  createdDate?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
};

type WorkFromHomeTiming = {
  isApprovedForToday: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  requiredHours: number;
};

const initialLeaveRequestValue: RequestLeaveModel = {
  isHalfDay: false,
  startDate: null,
  endDate: null,
  reason: "",
  userId: "",
  leavePolicyId: "",
};

export const LeaveTracker: FC = () => {
  const { formatMessage: i } = useIntl();
  const [empLeaveTypeBalance, setEmployeeLeaveTypeBalance] = useState<
    EmployeeLeaveTypeBalance[]
  >([]);
  const [open, setOpen] = useState(false);
  const employeeId = useParams().employeeid;
  const currentUserId = useAppSelector((state) => state.user.userData?.userId)!;
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [wfhContext, setWfhContext] = useState<WorkFromHomeContext | null>(null);
  const [wfhRequests, setWfhRequests] = useState<WorkFromHomeRequest[]>([]);
  const [wfhRequestsOpen, setWfhRequestsOpen] = useState(false);
  const [todayWfhRequest, setTodayWfhRequest] = useState<WorkFromHomeRequest | null>(null);
  const [wfhTiming, setWfhTiming] = useState<WorkFromHomeTiming | null>(null);
  const [clocking, setClocking] = useState(false);
  const modulePermission =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    if (empLeaveTypeBalance.length > 0 || wfhContext?.isEligible) {
      setOpen(true);
    } else {
      toast.error(i({ id: "VALIDATION_ERR.LEAVE_TYPES_NOT_AVAILABLE" }));
    }
  };

  const handleRefresh = () => {
    setRefresh((current) => !current);
  };

  useEffect(() => {
    window.addEventListener("leave-allocation-changed", handleRefresh);
    window.addEventListener("wfh-allocation-changed", handleRefresh);
    return () => {
      window.removeEventListener("leave-allocation-changed", handleRefresh);
      window.removeEventListener("wfh-allocation-changed", handleRefresh);
    };
  }, []);

  useEffect(() => {
    const fetchEmployeeLeaveTypeBalance = async () => {
      try {
        const { data } = employeeId
          ? await getEmployeeLeaveBalance(
              resolveLeaveBalanceTargetUserId(employeeId, currentUserId)
            )
          : await getMyProfileLeaveBalance();
        if (data.success) setEmployeeLeaveTypeBalance(data.methodResults ?? []);
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeLeaveTypeBalance();
  }, [currentUserId, employeeId, refresh]);

  useEffect(() => {
    // The WFH context is identity-bound, so only load it on the employee's own
    // profile rather than while HR is viewing another employee.
    if (employeeId) {
      setWfhContext(null);
      return;
    }

    Promise.all([
      getRequest<{ methodResult?: WorkFromHomeContext }>("api/wfh/context"),
      getRequest<{ methodResults?: WorkFromHomeRequest[] }>("api/wfh/requests/my"),
    ])
      .then(([context, requests]) => {
        const wfhContext = context.data.methodResult ?? null;
        const wfhRequests = requests.data.methodResults ?? [];
        setWfhContext(wfhContext);
        setWfhRequests(wfhRequests);

        const businessDate = wfhContext?.businessDate?.slice(0, 10);
        const todayRequest = businessDate
          ? wfhRequests.find((request) => request.status === "Approved" && request.fromDate.slice(0, 10) <= businessDate && request.toDate.slice(0, 10) >= businessDate) ?? null
          : null;
        setTodayWfhRequest(todayRequest);
        setWfhTiming(null);
        if (todayRequest) {
          void getRequest<{ methodResult?: WorkFromHomeTiming }>(`api/wfh/requests/${todayRequest.requestId}/timing`)
            .then((timing) => setWfhTiming(timing.data.methodResult ?? null))
            .catch(() => setWfhTiming(null));
        }
      })
      .catch((error) => console.error("Unable to load WFH allowance.", error));
  }, [employeeId, refresh]);

  const withdrawWfhRequest = async (request: WorkFromHomeRequest) => {
    try {
      const { data } = await postRequest<{ version: number; remarksCode: string }, { success: boolean; message?: string }>(
        `api/wfh/requests/${request.requestId}/cancel`,
        { version: request.version, remarksCode: "EMPLOYEE_WITHDRAWN" }
      );
      if (!data.success) throw new Error(data.message || "Work From Home request could not be withdrawn.");
      toast.success("Work From Home request withdrawn successfully.");
      handleRefresh();
    } catch (error) {
      const message = (error as Error).message || "Work From Home request could not be withdrawn.";
      const [, ...details] = message.split(":");
      toast.error(details.join(":").trim() || message);
    }
  };

  const canWithdrawWfhRequest = (request: WorkFromHomeRequest) => {
    if (!wfhContext?.businessDate || !["Pending", "Returned", "Approved"].includes(request.status)) return false;
    const requestDate = request.fromDate.slice(0, 10);
    const businessDate = wfhContext.businessDate.slice(0, 10);
    return requestDate > businessDate || (requestDate === businessDate && !wfhContext.isSameDayRequestCutoffPassed);
  };

  const toggleWfhAttendance = async () => {
    if (!todayWfhRequest || clocking) return;
    const action = wfhTiming?.checkInTime ? "check-out" : "check-in";
    setClocking(true);
    try {
      const { data } = await postRequest<Record<string, never>, { success: boolean; message?: string }>(
        `api/wfh/requests/${todayWfhRequest.requestId}/${action}`,
        {}
      );
      if (!data.success) throw new Error(data.message || `WFH ${action} could not be recorded.`);
      toast.success(action === "check-in" ? "WFH check-in recorded." : "WFH check-out recorded.");
      handleRefresh();
    } catch (error) {
      const message = (error as Error).message || `WFH ${action} could not be recorded.`;
      const [, ...details] = message.split(":");
      toast.error(details.join(":").trim() || message);
    } finally {
      setClocking(false);
    }
  };

  return (
    <Stack sx={{ gap: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
      <Card sx={{ p: { xs: 1.5, sm: 2.5 }, minWidth: 0 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1.5}>
        <Typography className="fs-20" variant="h6">
          {i({ id: "LEAVE.TITLE" })}
        </Typography>
        {(!employeeId ||
          hasModuleFeaturePermission(
            ModulesName.LeaveManagement,
            Permission.Create,
            modulePermission
          )) && (
            <CustomisedButton
              Icon={<Add />}
              label={i({ id: "LEAVE.APPLY_FOR_LEAVE" })}
              handleClick={handleOpen}
              sx={{ width: { xs: "100%", sm: "auto" }, whiteSpace: "nowrap" }}
            />
          )}
        </Stack>
      </Card>
      {open && (
        <LeaveApplication
          initialValues={initialLeaveRequestValue}
          leaveTypeBalance={empLeaveTypeBalance}
          handleRefresh={handleRefresh}
          edit={false}
          open={true}
          handleClose={handleClose}
        />
      )}
      {!employeeId && wfhContext && (
        <Card sx={{ p: { xs: 1.5, sm: 2.5 }, minWidth: 0 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2}>
            <Stack spacing={0.5}>
              <Typography variant="h6">Work from home</Typography>
              <Typography variant="body2" color="text.secondary">
                Weekly allowance resets every Monday. WFH is tracked separately from monthly leave balances.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`${wfhContext.usedThisWeek} used`} color="secondary" size="small" />
              <Chip label={`${wfhContext.remainingThisWeek} remaining`} color={wfhContext.canSchedule ? "success" : "default"} size="small" />
              <CustomisedButton label={`View requests (${wfhRequests.length})`} size="small" variant="outlined" handleClick={() => setWfhRequestsOpen(true)} />
            </Stack>
          </Stack>
           <Typography sx={{ mt: 2 }}>
            {wfhContext.isEligible
              ? `${wfhContext.remainingThisWeek} of ${wfhContext.weeklyLimit} WFH day(s) remain this Monday–Sunday week.`
              : "Work from home is not assigned to your employee profile."}
           </Typography>
           {todayWfhRequest && wfhTiming?.isApprovedForToday && (
             <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1} sx={{ mt: 2 }}>
               {wfhTiming.checkOutTime ? (
                 <Chip color="success" label="WFH attendance completed" />
               ) : (
                 <CustomisedButton
                   label={clocking ? "Saving..." : wfhTiming.checkInTime ? "Clock out from WFH" : "Clock in to WFH"}
                   color={wfhTiming.checkInTime ? "warning" : "primary"}
                   disabled={clocking}
                   handleClick={() => void toggleWfhAttendance()}
                 />
               )}
               <Typography variant="body2" color="text.secondary">
                 {wfhTiming.checkInTime
                   ? `Checked in at ${new Date(wfhTiming.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Required: ${wfhTiming.requiredHours} hour(s).`
                   : "Clock in is available only for your approved WFH request and policy time window."}
               </Typography>
             </Stack>
           )}
           {!wfhContext.canSchedule && wfhContext.isEligible && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {wfhContext.disabledReasonCode === "WFH_WEEKLY_LIMIT_USED"
                ? "This week’s WFH allowance has been used."
                : "WFH is currently unavailable for the selected dates or policy rules."}
            </Typography>
          )}
        </Card>
      )}
      {!employeeId && (
        <CustomisedModal
          open={wfhRequestsOpen}
          handleClose={() => setWfhRequestsOpen(false)}
          title="Work from home requests"
          maxWidth="sm"
        >
          <Stack sx={{ minWidth: { sm: 500 }, pb: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
            <Stack spacing={0.25}>
              <Typography variant="body2" color="text.secondary">Your pending, approved, rejected, and cancelled WFH history.</Typography>
            </Stack>
            <Chip label={`${wfhRequests.length} request${wfhRequests.length === 1 ? "" : "s"}`} size="small" variant="outlined" />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.25} sx={{ maxHeight: "55vh", overflowY: "auto", pr: 0.5 }}>
            {wfhRequests.length === 0 ? (
              <Typography color="text.secondary">No Work From Home requests yet.</Typography>
            ) : wfhRequests.map((request) => (
              <Stack key={request.requestId} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1.25} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Stack spacing={0.25}>
                  <Typography fontWeight={700}>{new Date(request.fromDate).toLocaleDateString()} – {new Date(request.toDate).toLocaleDateString()}</Typography>
                  <Typography variant="body2" color="text.secondary">{request.durationType.replace(/([A-Z])/g, " $1").trim()}{request.createdDate ? ` · Requested ${new Date(request.createdDate).toLocaleDateString()}` : ""}</Typography>
                  {request.reasonText && <Typography variant="body2" color="text.secondary">{request.reasonText}</Typography>}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={request.status} color={request.status === "Approved" ? "success" : request.status === "Rejected" ? "error" : request.status === "Cancelled" ? "default" : "warning"} size="small" />
                  {canWithdrawWfhRequest(request) && <CustomisedButton label="Withdraw" size="small" color="error" variant="outlined" handleClick={() => void withdrawWfhRequest(request)} />}
                </Stack>
              </Stack>
            ))}
          </Stack>
          </Stack>
        </CustomisedModal>
      )}
      <EmployeeLeaveTypesCharts
        isLoading={loading}
        leaveBalance={empLeaveTypeBalance}
      />
      {(!employeeId || hasModuleFeaturePermission(
        ModulesName.LeaveManagement,
        Permission.View,
        modulePermission
      )) && (
          <MyLeaveRequests
            leaveBalance={empLeaveTypeBalance}
            refresh={refresh}
            handleRefresh={handleRefresh}
          />
        )}
    </Stack>
  );
};
