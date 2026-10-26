import { Alert, Card, Chip, Divider, Stack, TablePagination, Typography } from "@mui/material";
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
import { WfhClockOutModal } from "../../attendance/component/WfhClockOutModal";
import { useWfhAttendanceTiming } from "../../attendance/hooks/useWfhAttendanceTiming";
import { buildWfhHistoryUrl, wfhHistoryLastPage } from "../../attendance/wfhRequestHistory";
import { getEmployeeLifecycleSelfServicePolicies } from "../../employees/employeeServices";

type WorkFromHomeContext = {
  isEligible: boolean;
  weeklyLimit: number;
  usedThisWeek: number;
  remainingThisWeek: number;
  canSchedule: boolean;
  disabledReasonCode?: string;
  businessDate?: string;
  todayApprovedRequest?: WorkFromHomeRequest | null;
  todayRequestIssueCode?: string | null;
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
  officeConvertedDates?: string[];
};

const formatBusinessDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
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
  const [wfhLoadError, setWfhLoadError] = useState<string | null>(null);
  const [wfhRequests, setWfhRequests] = useState<WorkFromHomeRequest[]>([]);
  const [wfhRequestsTotal, setWfhRequestsTotal] = useState(0);
  const [wfhRequestsPage, setWfhRequestsPage] = useState(1);
  const [wfhRequestsPageSize, setWfhRequestsPageSize] = useState(25);
  const [wfhHistoryLoading, setWfhHistoryLoading] = useState(false);
  const [wfhHistoryError, setWfhHistoryError] = useState<string | null>(null);
  const [wfhRequestsOpen, setWfhRequestsOpen] = useState(false);
  const [clockOutModalOpen, setClockOutModalOpen] = useState(false);
  const [todayWfhRequest, setTodayWfhRequest] = useState<WorkFromHomeRequest | null>(null);
  const [todayWfhConvertedToOffice, setTodayWfhConvertedToOffice] = useState(false);
  const [hasLifecycleLeavePolicy, setHasLifecycleLeavePolicy] = useState(false);
  const { timings, timingErrors, clockingRequestId, loadTiming, clearTiming, clockIn, clockOut } = useWfhAttendanceTiming();
  const wfhTiming = todayWfhRequest ? timings[todayWfhRequest.requestId] ?? null : null;
  const wfhTimingError = todayWfhRequest ? timingErrors[todayWfhRequest.requestId] ?? null : null;
  const modulePermission =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasWfhPermission = modulePermission.some((p) => p.startsWith("Work_From_Home."));

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    if (empLeaveTypeBalance.length > 0 || (hasWfhPermission && wfhContext?.isEligible) || hasLifecycleLeavePolicy) {
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
    let mounted = true;
    getEmployeeLifecycleSelfServicePolicies()
      .then(({ data }) => {
        if (!mounted) return;
        const policies = Array.isArray(data) ? data : [];
        setHasLifecycleLeavePolicy(policies.some((policy) =>
          policy.isActive !== false && policy.leaveRequestsAllowed && Boolean(policy.leavePolicyId)
        ));
      })
      .catch(() => {
        if (mounted) setHasLifecycleLeavePolicy(false);
      });
    return () => { mounted = false; };
  }, [refresh]);

  useEffect(() => {
    let mounted = true;
    // The WFH context is identity-bound, so only load it on the employee's own
    // profile rather than while HR is viewing another employee.
    if (employeeId || !hasWfhPermission) {
      setWfhContext(null);
      setWfhLoadError(null);
      setTodayWfhRequest(null);
      setTodayWfhConvertedToOffice(false);
      clearTiming();
      return () => { mounted = false; };
    }

    setWfhLoadError(null);
    const loadTodayWfh = async () => {
      const contextResponse = await getRequest<{ success: boolean; message?: string; methodResult?: WorkFromHomeContext }>("api/wfh/context");
      if (!contextResponse.data.success) throw new Error(contextResponse.data.message || "Unable to load WFH availability.");
      if (!mounted) return;
      const wfhContext = contextResponse.data.methodResult ?? null;
      setWfhContext(wfhContext);
      const businessDate = wfhContext?.businessDate?.slice(0, 10);
      if (!businessDate) {
        setTodayWfhRequest(null);
        setTodayWfhConvertedToOffice(false);
        clearTiming();
        return;
      }
      const todayRequest = wfhContext?.todayApprovedRequest ?? null;
      setTodayWfhRequest(todayRequest);
      const converted = Boolean(todayRequest?.officeConvertedDates?.some((date) => date.slice(0, 10) === businessDate));
      setTodayWfhConvertedToOffice(converted);
      if (todayRequest && !converted) void loadTiming(todayRequest.requestId).catch(() => undefined);
      else clearTiming();
    };
    void loadTodayWfh().catch((error) => {
      if (!mounted) return;
      setWfhContext(null);
      setTodayWfhRequest(null);
      setTodayWfhConvertedToOffice(false);
      clearTiming();
      setWfhLoadError((error as Error).message || "Unable to load WFH availability and attendance.");
    });
    return () => { mounted = false; };
  }, [employeeId, refresh, hasWfhPermission, loadTiming, clearTiming]);

  useEffect(() => {
    let mounted = true;
    if (employeeId || !hasWfhPermission) {
      setWfhRequests([]);
      setWfhRequestsTotal(0);
      setWfhHistoryError(null);
      setWfhHistoryLoading(false);
      return () => { mounted = false; };
    }
    setWfhHistoryLoading(true);
    setWfhHistoryError(null);
    getRequest<{ success: boolean; message?: string; methodResults?: WorkFromHomeRequest[]; totalRecords?: number }>(
      buildWfhHistoryUrl(wfhRequestsPage, wfhRequestsPageSize)
    ).then(({ data }) => {
      if (!data.success) throw new Error(data.message || "Unable to load WFH request history.");
      if (!mounted) return;
      const items = data.methodResults ?? [];
      const total = data.totalRecords ?? 0;
      const lastPage = wfhHistoryLastPage(total, wfhRequestsPageSize);
      if (items.length === 0 && total > 0 && wfhRequestsPage > lastPage) {
        setWfhRequestsPage(lastPage);
        return;
      }
      setWfhRequests(items);
      setWfhRequestsTotal(total);
    }).catch((error) => {
      if (!mounted) return;
      setWfhRequests([]);
      setWfhRequestsTotal(0);
      setWfhHistoryError((error as Error).message || "Unable to load WFH request history.");
    }).finally(() => {
      if (mounted) setWfhHistoryLoading(false);
    });
    return () => { mounted = false; };
  }, [employeeId, refresh, hasWfhPermission, wfhRequestsPage, wfhRequestsPageSize]);

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
    if (!todayWfhRequest || clockingRequestId === todayWfhRequest.requestId) return;
    if (wfhTiming?.checkInTime) {
      setClockOutModalOpen(true);
      return;
    }
    try {
      const outcome = await clockIn(todayWfhRequest.requestId);
      if (!outcome.success) throw new Error(outcome.error || "WFH check-in could not be recorded.");
      toast.success("WFH check-in recorded.");
      handleRefresh();
    } catch (error) {
      const message = (error as Error).message || "WFH check-in could not be recorded.";
      const [, ...details] = message.split(":");
      toast.error(details.join(":").trim() || message);
      handleRefresh();
    }
  };

  const handleConfirmClockOut = async (remarks: string) => {
    if (!todayWfhRequest || clockingRequestId === todayWfhRequest.requestId) return;
    try {
      const outcome = await clockOut(todayWfhRequest.requestId, remarks);
      if (!outcome.success) throw new Error(outcome.error || "WFH check-out could not be recorded.");
      toast.success("WFH clock-out recorded successfully.");
      setClockOutModalOpen(false);
      handleRefresh();
    } catch (error) {
      const message = (error as Error).message || "WFH check-out could not be recorded.";
      const [, ...details] = message.split(":");
      toast.error(details.join(":").trim() || message);
      handleRefresh();
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
      {!employeeId && hasWfhPermission && wfhLoadError && (
        <Alert severity="error" sx={{ mt: 2 }} action={<CustomisedButton label="Retry" size="small" variant="outlined" handleClick={handleRefresh} />}>
          Unable to load your Work From Home availability or request history. {wfhLoadError}
        </Alert>
      )}
      {!employeeId && hasWfhPermission && wfhContext && (
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
              <CustomisedButton label={`View requests (${wfhRequestsTotal})`} size="small" variant="outlined" handleClick={() => setWfhRequestsOpen(true)} />
            </Stack>
          </Stack>
          {!todayWfhRequest && (
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1} sx={{ mt: 2 }}>
              <CustomisedButton
                label={wfhContext.todayRequestIssueCode ? "Clock actions unavailable" : "Clock in to WFH"}
                size="small"
                disabled
              />
              <Typography variant="body2" color="text.secondary">
                {wfhContext.todayRequestIssueCode === "WFH_MULTIPLE_APPROVED_REQUESTS_FOR_TODAY"
                  ? "More than one approved WFH request covers today. Clock actions are paused; contact HR to resolve the duplicate approvals."
                  : "Clock actions become available after an approved WFH request covers today."}
              </Typography>
            </Stack>
          )}
          {todayWfhRequest && !todayWfhConvertedToOffice && !wfhTiming && !wfhTimingError && (
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1} sx={{ mt: 2 }}>
              <CustomisedButton label="Checking WFH attendance..." size="small" disabled />
              <Typography variant="body2" color="text.secondary">
                Loading the approved request's attendance state. Refresh if this does not finish.
              </Typography>
            </Stack>
          )}
           <Typography sx={{ mt: 2 }}>
            {wfhContext.isEligible
              ? `${wfhContext.remainingThisWeek} of ${wfhContext.weeklyLimit} WFH day(s) remain this Monday–Sunday week.`
              : "Work from home is not assigned to your employee profile."}
           </Typography>
           {todayWfhRequest && todayWfhConvertedToOffice && (
             <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
               HR recorded office attendance for today. WFH clock actions are disabled for this date.
             </Typography>
           )}
           {todayWfhRequest && wfhTimingError && (
             <Alert severity="error" sx={{ mt: 2 }}>
               Unable to verify current WFH attendance timing. Refresh and try again. {wfhTimingError}
             </Alert>
           )}
           {todayWfhRequest && !todayWfhConvertedToOffice && wfhTiming && (wfhTiming.isApprovedForToday || Boolean(wfhTiming.checkOutTime)) && (
             <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1} sx={{ mt: 2 }}>
               {wfhTiming.checkOutTime ? (
                 <Chip
                    color={wfhTiming.isUnderHours ? "warning" : wfhTiming.isHalfDay ? "info" : "success"}
                    label={
                      wfhTiming.isUnderHours
                        ? "Under-hours (Pending HR review)"
                        : wfhTiming.isHalfDay
                        ? "WFH half-day completed"
                        : "WFH attendance completed"
                    }
                  />
               ) : (
                 <CustomisedButton
                   label={clockingRequestId === todayWfhRequest?.requestId ? "Saving..." : wfhTiming.checkInTime ? "Clock out from WFH" : "Clock in to WFH"}
                   color={wfhTiming.checkInTime ? "warning" : "primary"}
                   disabled={clockingRequestId === todayWfhRequest?.requestId || Boolean(wfhTimingError)}
                   handleClick={() => void toggleWfhAttendance()}
                 />
               )}
               <Typography variant="body2" color="text.secondary">
                 {wfhTiming.checkOutTime && wfhTiming.checkInTime
                   ? `Checked in at ${new Date(wfhTiming.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, checked out at ${new Date(wfhTiming.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${wfhTiming.totalHours ?? 0} hour(s) verified${wfhTiming.isHalfDay ? " · Half-Day" : ""}).`
                   : wfhTiming.checkInTime
                   ? `Checked in at ${new Date(wfhTiming.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Required: ${wfhTiming.requiredHours} hour(s) (or clock out when done for half-day).`
                   : "Clock in is available only for your approved WFH request and policy time window."}
               </Typography>
             </Stack>
           )}
           {todayWfhRequest && !todayWfhConvertedToOffice && wfhTiming && !wfhTiming.isApprovedForToday && !wfhTiming.checkOutTime && (
             <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1} sx={{ mt: 2 }}>
               <CustomisedButton
                 label={wfhTiming.checkInTime ? "Clock out from WFH" : "Clock in to WFH"}
                 size="small"
                 disabled
               />
               <Typography variant="body2" color="text.secondary">
                 This request is not eligible for WFH clock actions today. Contact HR if you believe the approval or attendance date is incorrect.
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
      {!employeeId && hasWfhPermission && (
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
            <Chip label={`${wfhRequestsTotal} request${wfhRequestsTotal === 1 ? "" : "s"}`} size="small" variant="outlined" />
          </Stack>
          <Divider sx={{ my: 2 }} />
          {wfhHistoryError && <Alert severity="error" sx={{ mb: 1.5 }}>{wfhHistoryError}</Alert>}
          <Stack spacing={1.25} sx={{ maxHeight: "55vh", overflowY: "auto", pr: 0.5 }}>
            {wfhHistoryLoading ? (
              <Typography color="text.secondary">Loading WFH request history…</Typography>
            ) : wfhRequests.length === 0 ? (
              <Typography color="text.secondary">No Work From Home requests yet.</Typography>
            ) : wfhRequests.map((request) => (
              <Stack key={request.requestId} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1.25} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Stack spacing={0.25}>
                  <Typography fontWeight={700}>{formatBusinessDate(request.fromDate)} – {formatBusinessDate(request.toDate)}</Typography>
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
          <TablePagination
            component="div"
            count={wfhRequestsTotal}
            page={wfhRequestsPage - 1}
            rowsPerPage={wfhRequestsPageSize}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageChange={(_, page) => setWfhRequestsPage(page + 1)}
            onRowsPerPageChange={(event) => {
              setWfhRequestsPage(1);
              setWfhRequestsPageSize(Number(event.target.value));
            }}
          />
          </Stack>
        </CustomisedModal>
      )}
      {todayWfhRequest && (
        <WfhClockOutModal
          open={clockOutModalOpen}
          onClose={() => setClockOutModalOpen(false)}
          onConfirm={handleConfirmClockOut}
          checkInTime={wfhTiming?.checkInTime}
          timeZoneId={wfhTiming?.timeZoneId}
          requiredHours={wfhTiming?.requiredHours}
          halfDayRequiredHours={wfhTiming?.halfDayRequiredHours}
          loading={clockingRequestId === todayWfhRequest?.requestId}
        />
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
