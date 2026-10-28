import { Add, Cancel, CheckCircle, Login, Logout, Save, Visibility } from "@mui/icons-material";
import { Alert, Box, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, MenuItem, Stack, TablePagination, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getRequest, postRequest } from "../../../server/axios";
import { createWorkFromHomeRequest, type WorkFromHomeRequestPayload } from "../leaves/leaveServices";
import { usePageData } from "../../Context/PageDataProvider";
import { AppButton, AppSwitch, AppTextField } from "../../shared/components/ui";
import { ApiResponse } from "../../../utils/common_types";
import CustomisedDatePicker from "../../shared/components/C_DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { WfhClockOutModal } from "./component/WfhClockOutModal";
import { useWfhAttendanceTiming } from "./hooks/useWfhAttendanceTiming";
import { useAppSelector } from "../../Redux/hooks";
import { ModulesName } from "../../../utils/enums";
import { formatServerDate } from "../../../utils/common";
import WorkFromHomeDeadLetterPanel from "./component/WorkFromHomeDeadLetterPanel";
import { buildWfhHistoryUrl, wfhHistoryLastPage } from "./wfhRequestHistory";

type Policy = { isEnabled:boolean; maxDaysPerWeek:number; minimumAdvanceNoticeHours?:number; managerApprovalRequired?:boolean; applyToAllEmployees:boolean; applicableDepartments:string[]; applicableEmployeeIds:string[]; allowHalfDay:boolean; allowMixedDay:boolean; requireReason:boolean; fullDayAttendanceStatusCode:string; halfDayAttendanceStatusCode:string; mixedAttendanceStatusCode:string };
type Request = { requestId:string; employeeId?:string; employeeName?:string; department?:string; fromDate:string; toDate:string; durationType:string; reasonCode:string; reasonText?:string; status:string; version:number; isLateSubmission?:boolean; officeConvertedDates?:string[] };
type RequestPage = { success?: boolean; message?: string; methodResults?: Request[]; totalRecords?: number };
type RequestFilters = { employeeSearch:string; department:string; status:string; fromDate:string; toDate:string; pageNo:number; pageSize:number };
type Context = { isFeatureEnabled:boolean; isEligible:boolean; weeklyLimit:number; usedThisWeek:number; remainingThisWeek:number; canSchedule:boolean; disabledReasonCode?:string; nextAvailableDate?:string; managerApprovalRequired:boolean; minimumAdvanceNoticeHours:number; businessDate?:string; todayApprovedRequest?:Request | null; todayRequestIssueCode?:string | null; isSameDayRequestCutoffPassed?:boolean; officeStartTime?:string; officeEndTime?:string; checkInAvailableFrom?:string; checkInAvailableUntil?:string; checkOutAvailableFrom?:string; checkOutAvailableUntil?:string };
const defaultPolicy: Policy = { isEnabled:true, maxDaysPerWeek:1, applyToAllEmployees:true, applicableDepartments:[], applicableEmployeeIds:[], allowHalfDay:false, allowMixedDay:false, requireReason:true, fullDayAttendanceStatusCode:"WFH", halfDayAttendanceStatusCode:"WFH-HD", mixedAttendanceStatusCode:"WFH+WFO" };
const dateOnly = (value: string) => formatServerDate(value, "YYYY-MM-DD");
const requestErrorMessage = (error: unknown, fallback: string) => {
  const apiMessage = (error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;
  return apiMessage || (error instanceof Error ? error.message : fallback) || fallback;
};
const formatBusinessDate = (value: string) => formatServerDate(value, "DD/MM/YYYY");
const convertibleDates = (request: Request) => {
  const converted = new Set((request.officeConvertedDates ?? []).map(dateOnly));
  const dates: string[] = [];
  const end = new Date(`${dateOnly(request.toDate)}T00:00:00`);
  for (let cursor = new Date(`${dateOnly(request.fromDate)}T00:00:00`); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!converted.has(date)) dates.push(date);
  }
  return dates;
};

export default function WorkFromHome() {
  const { setPageTitle } = usePageData();
  const userData = useAppSelector((state) => state.user.userData);
  const canManageDeadLetters = (userData?.modulePermission ?? []).includes(`${ModulesName.WorkFromHome}.PolicyEdit`);
  const [policy, setPolicy] = useState<Policy>(defaultPolicy);
  const [requests, setRequests] = useState<Request[]>([]);
  const [myRequestsTotal, setMyRequestsTotal] = useState(0);
  const [myRequestsPage, setMyRequestsPage] = useState(1);
  const [myRequestsPageSize, setMyRequestsPageSize] = useState(25);
  const [myRequestsLoading, setMyRequestsLoading] = useState(false);
  const [myRequestsError, setMyRequestsError] = useState<string | null>(null);
  const myRequestsLoadId = useRef(0);
  const [team, setTeam] = useState<Request[]>([]);
  const [teamTotal, setTeamTotal] = useState(0);
  const [roster, setRoster] = useState<Request[]>([]);
  const [rosterTotal, setRosterTotal] = useState(0);
  const [filters, setFilters] = useState<RequestFilters>({ employeeSearch:"", department:"", status:"Pending", fromDate:"", toDate:"", pageNo:1, pageSize:25 });
  const [rosterPage, setRosterPage] = useState(1);
  const [reasonRequest, setReasonRequest] = useState<Request | null>(null);
  const [canReviewWfh, setCanReviewWfh] = useState(false);
  const [context, setContext] = useState<Context | null>(null);
  const { timings, timingErrors, clockingRequestId, loadTiming: timing, clockIn, clockOut } = useWfhAttendanceTiming();
  const [clockOutTarget, setClockOutTarget] = useState<{ requestId: string; checkInTime?: string; timeZoneId?: string; requiredHours?: number; halfDayRequiredHours?: number } | null>(null);
  const [regularizeTarget, setRegularizeTarget] = useState<Request | null>(null);
  const [regStatus, setRegStatus] = useState("WFH-HD");
  const [regRemarks, setRegRemarks] = useState("");
  const [regularizing, setRegularizing] = useState(false);
  const [officeConversionTarget, setOfficeConversionTarget] = useState<Request | null>(null);
  const [officeConversionDate, setOfficeConversionDate] = useState("");
  const [officeCheckIn, setOfficeCheckIn] = useState("09:00");
  const [officeCheckOut, setOfficeCheckOut] = useState("18:00");
  const [officeConversionRemarks, setOfficeConversionRemarks] = useState("");
  const [convertingToOffice, setConvertingToOffice] = useState(false);
  const [now, setNow] = useState(Date.now());
  // Employees submit WFH from the normal Apply for Leave form. This page keeps
  // request history and approvals without exposing a duplicate submission flow.
  const showLegacyRequestForm = false;
  // WFH policy configuration is now authoritative in Leave Policies.
  const canManagePolicy = false;
  const saving = false;
  const savePolicy = async () => undefined;
  const [form, setForm] = useState<WorkFromHomeRequestPayload>({ fromDate:"", toDate:"", durationType:"FullDay", reasonCode:"OTHER", reasonText:"" });
  async function loadMyRequests(pageNo = myRequestsPage, pageSize = myRequestsPageSize) {
    const loadId = ++myRequestsLoadId.current;
    setMyRequestsLoading(true);
    setMyRequestsError(null);
    try {
      const { data } = await getRequest<RequestPage>(buildWfhHistoryUrl(pageNo, pageSize));
      if (data.success === false) throw new Error(data.message || "Unable to load your WFH requests.");
      if (loadId !== myRequestsLoadId.current) return;
      const items = data.methodResults ?? [];
      const total = data.totalRecords ?? 0;
      const lastPage = wfhHistoryLastPage(total, pageSize);
      if (items.length === 0 && total > 0 && pageNo > lastPage) {
        setMyRequestsPage(lastPage);
        void loadMyRequests(lastPage, pageSize);
        return;
      }
      setRequests(items);
      setMyRequestsTotal(total);
    } catch (error) {
      if (loadId !== myRequestsLoadId.current) return;
      setRequests([]);
      setMyRequestsTotal(0);
      setMyRequestsError(requestErrorMessage(error, "Unable to load your WFH requests."));
    } finally {
      if (loadId === myRequestsLoadId.current) setMyRequestsLoading(false);
    }
  }
  const load = async (requestPage = myRequestsPage) => {
    const [policyResult, contextResult] = await Promise.allSettled([
      getRequest<{ methodResult?: Policy }>("api/wfh/policy"),
      getRequest<{ methodResult?: Context }>("api/wfh/context"),
    ]);
    if (policyResult.status === "fulfilled") setPolicy(policyResult.value.data.methodResult ?? defaultPolicy);
    if (contextResult.status === "fulfilled") setContext(contextResult.value.data.methodResult ?? null);
    await loadMyRequests(requestPage, myRequestsPageSize);
    await loadReviewRequests();
  };
  const queryString = (values: RequestFilters) => new URLSearchParams(Object.entries(values).filter(([, value]) => value !== "").map(([key, value]) => [key, String(value)])).toString();
  const loadReviewRequests = async () => {
    const weekStart = currentWeekStart.toISOString().slice(0, 10);
    const weekEnd = currentWeekEnd.toISOString().slice(0, 10);
    const rosterFilters = { ...filters, status:"Approved", fromDate: filters.fromDate || weekStart, toDate: filters.toDate || weekEnd, pageNo:rosterPage };
    try {
      const response = await getRequest<RequestPage>(`api/wfh/requests/all?${queryString(filters)}`);
      const rosterResponse = await getRequest<RequestPage>(`api/wfh/requests/all?${queryString(rosterFilters)}`);
      if (response.data.success === false) throw new Error(response.data.message || "Unable to load WFH request filters.");
      if (rosterResponse.data.success === false) throw new Error(rosterResponse.data.message || "Unable to load the WFH roster.");
      setTeam(response.data.methodResults ?? []); setTeamTotal(response.data.totalRecords ?? 0);
      setRoster(rosterResponse.data.methodResults ?? []); setRosterTotal(rosterResponse.data.totalRecords ?? 0);
      setCanReviewWfh(true);
    } catch {
      try {
        const response = await getRequest<RequestPage>(`api/wfh/requests/team?${queryString(filters)}`);
        const rosterResponse = await getRequest<RequestPage>(`api/wfh/requests/team?${queryString(rosterFilters)}`);
      if (response.data.success === false) throw new Error(response.data.message || "Unable to load WFH request filters.");
      if (rosterResponse.data.success === false) throw new Error(rosterResponse.data.message || "Unable to load the WFH roster.");
        setTeam(response.data.methodResults ?? []); setTeamTotal(response.data.totalRecords ?? 0);
        setRoster(rosterResponse.data.methodResults ?? []); setRosterTotal(rosterResponse.data.totalRecords ?? 0);
        setCanReviewWfh(true);
      } catch (error) {
        setTeam([]); setRoster([]); setTeamTotal(0); setRosterTotal(0); setCanReviewWfh(false);
        toast.error(requestErrorMessage(error, "Unable to load WFH requests. Refine the employee or department filter and retry."));
      }
    }
  };
  useEffect(() => { void load(); setPageTitle("Work from home"); return () => setPageTitle(""); }, []);
  useEffect(() => { if (canReviewWfh) void loadReviewRequests(); }, [filters, rosterPage]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const submit = async () => { if (!context?.canSchedule) return; try { const { data } = await createWorkFromHomeRequest(form); if (!data.success) throw new Error(data.message); toast.success(context.managerApprovalRequired ? "WFH request submitted for approval." : "WFH scheduled. HR has been notified."); setForm({ fromDate:"", toDate:"", durationType:"FullDay", reasonCode:"OTHER", reasonText:"" }); setMyRequestsPage(1); await load(1); } catch (e) { toast.error((e as Error).message || "Unable to submit WFH request."); } };
  const act = async (requestId:string, action:"approve"|"reject"|"return"|"check-in"|"check-out", version?:number) => {
    if (action === "check-out") {
      const time = timings[requestId];
      setClockOutTarget({ requestId, checkInTime: time?.checkInTime, timeZoneId: time?.timeZoneId, requiredHours: time?.requiredHours, halfDayRequiredHours: time?.halfDayRequiredHours });
      return;
    }
    try {
      if (action === "check-in") {
        const outcome = await clockIn(requestId);
        if (!outcome.success) throw new Error(outcome.error);
      } else {
        const { data } = await postRequest<Record<string, unknown>, ApiResponse>(`api/wfh/requests/${requestId}/${action}`, action === "approve" || action === "reject" || action === "return" ? { remarksCode: action === "return" ? "RETURNED_FOR_CORRECTION" : action.toUpperCase(), version } : {});
        if (!data.success) throw new Error(data.message);
      }
      toast.success(action === "approve" ? "WFH request approved." : action === "return" ? "WFH request returned for correction." : action.replace("-", " ") + " recorded.");
      await load();
      await timing(requestId);
    } catch (e) {
      toast.error((e as Error).message || "Action could not be completed.");
    }
  };
  const handleConfirmClockOut = async (remarks: string) => {
    if (!clockOutTarget) return;
    const reqId = clockOutTarget.requestId;
    try {
      const outcome = await clockOut(reqId, remarks);
      if (!outcome.success) throw new Error(outcome.error);
      toast.success("WFH clock-out recorded successfully.");
      setClockOutTarget(null);
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Clock out could not be completed.");
    }
  };
  const handleRegularize = async () => {
    if (!regularizeTarget || !regRemarks.trim()) {
      toast.error("Please provide remarks for regularization.");
      return;
    }
    setRegularizing(true);
    try {
      const { data } = await postRequest<{ attendanceStatus: string; remarks: string }, ApiResponse>(
        `api/wfh/requests/${regularizeTarget.requestId}/regularize`,
        { attendanceStatus: regStatus, remarks: regRemarks.trim() }
      );
      if (!data.success) throw new Error(data.message || "Unable to regularize attendance.");
      toast.success(data.message || "WFH attendance regularized successfully.");
      setRegularizeTarget(null);
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Unable to regularize attendance.");
    } finally {
      setRegularizing(false);
    }
  };
  const openOfficeConversion = (request: Request) => {
    const availableDates = convertibleDates(request);
    if (availableDates.length === 0) {
      toast.info("Every date in this WFH request is already recorded as office attendance.");
      return;
    }
    setOfficeConversionTarget(request);
    setOfficeConversionDate(availableDates[0]);
    setOfficeCheckIn("09:00");
    setOfficeCheckOut("18:00");
    setOfficeConversionRemarks("");
  };
  const handleConvertToOffice = async () => {
    if (!officeConversionTarget || !officeConversionDate) return;
    const request = officeConversionTarget;
    setConvertingToOffice(true);
    try {
      const { data } = await postRequest<{ attendanceDate: string; officeCheckInTime: string; officeCheckOutTime: string; remarks: string; version: number }, ApiResponse>(
        `api/wfh/requests/${request.requestId}/convert-to-office`,
        { attendanceDate: officeConversionDate, officeCheckInTime: `${officeCheckIn}:00`, officeCheckOutTime: `${officeCheckOut}:00`, remarks: officeConversionRemarks.trim(), version: request.version }
      );
      if (!data.success) throw new Error(data.message || "Office attendance conversion failed.");
      toast.success("WFH attendance converted to office attendance.");
      setOfficeConversionTarget(null);
      await load();
    } catch (e) {
      toast.error((e as Error).message || "Office attendance conversion failed.");
    } finally {
      setConvertingToOffice(false);
    }
  };
  const cancelRequest = async (request:Request) => { try { const { data } = await postRequest<{ version:number; remarksCode:string }, ApiResponse>(`api/wfh/requests/${request.requestId}/cancel`, { version: request.version, remarksCode:"EMPLOYEE_CANCELLED" }); if (!data.success) throw new Error(data.message); toast.success("WFH request cancelled and its unclocked attendance has been restored."); await load(); } catch (e) { toast.error((e as Error).message || "WFH request could not be cancelled."); } };
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7));
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);
  const companyBusinessDate = context?.businessDate?.slice(0, 10);
  const todayApprovedRequest = context?.todayApprovedRequest ?? null;
  const todayTiming = todayApprovedRequest ? timings[todayApprovedRequest.requestId] : undefined;
  const todayTimingError = todayApprovedRequest ? timingErrors[todayApprovedRequest.requestId] : undefined;
  const currentWeekWfh = roster;
  // The server selects today's request using the company business date and
  // time zone, independent of the currently selected history page.
  useEffect(() => {
    if (!todayApprovedRequest?.requestId) return;
    void timing(todayApprovedRequest.requestId);
  }, [todayApprovedRequest?.requestId, timing]);
  return <Stack spacing={3}>
    {context?.todayRequestIssueCode === "WFH_MULTIPLE_APPROVED_REQUESTS_FOR_TODAY" && <Alert severity="error">More than one approved WFH request covers today. Clock actions are paused until HR resolves the duplicate approvals.</Alert>}
    {todayApprovedRequest && <Card sx={{ p:{ xs:2, md:3 }, border:"1px solid", borderColor:"primary.light" }}>
      <Stack direction={{ xs:"column", sm:"row" }} alignItems={{ sm:"center" }} justifyContent="space-between" gap={1.5}>
        <Box>
          <Typography variant="h6" fontWeight={800}>Today's approved WFH</Typography>
          <Typography variant="body2" color="text.secondary">{formatBusinessDate(todayApprovedRequest.fromDate)} · {todayApprovedRequest.durationType.replace(/([A-Z])/g, " $1").trim()}</Typography>
          {todayTiming?.checkInTime && <Typography variant="body2" color="text.secondary">Clocked in at {new Date(todayTiming.checkInTime).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}{todayTiming.checkOutTime ? ` · Clocked out at ${new Date(todayTiming.checkOutTime).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}` : ""}</Typography>}
        </Box>
        {todayTimingError ? <Alert severity="error">Unable to verify today's attendance. Refresh and try again. {todayTimingError}</Alert>
          : !todayTiming ? <AppButton size="small" disabled>Checking attendance…</AppButton>
          : todayTiming.checkOutTime ? <Chip color={todayTiming.isUnderHours ? "warning" : todayTiming.isHalfDay ? "info" : "success"} icon={<CheckCircle/>} label={todayTiming.isUnderHours ? "Under-hours (Pending review)" : todayTiming.isHalfDay ? "Half day clocked out" : "Clocked out"}/>
          : todayTiming.isApprovedForToday ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <AppButton size="small" variant="contained" startIcon={todayTiming.checkInTime ? <Logout/> : <Login/>} disabled={clockingRequestId === todayApprovedRequest.requestId || (!todayTiming.checkInTime && todayTiming.isCheckInOpen === false)} onClick={() => void act(todayApprovedRequest.requestId, todayTiming.checkInTime ? "check-out" : "check-in")}>{clockingRequestId === todayApprovedRequest.requestId ? "Saving…" : todayTiming.checkInTime ? "Clock out from WFH" : todayTiming.isCheckInOpen === false ? "Clock in closed" : "Clock in to WFH"}</AppButton>
              {!todayTiming.checkInTime && (
                <AppButton size="small" variant="outlined" color="primary" onClick={() => openOfficeConversion(todayApprovedRequest)}>
                  Switch to Office Check-In
                </AppButton>
              )}
            </Stack>
          )
          : <Typography color="text.secondary">This approval does not cover today's attendance date. Contact HR to review the request dates.</Typography>}
      </Stack>
    </Card>}
    {showLegacyRequestForm && <Card sx={{ p:{ xs:2, md:3 }, overflow:"hidden", background:"linear-gradient(125deg, rgba(109,76,190,.14), rgba(38,198,218,.08))" }}>
      <Chip label="ONE DAY / WEEK" color="primary" size="small" sx={{ fontWeight:800 }} />
      <Typography variant="h4" fontWeight={850} sx={{ mt:1 }}>Work from home</Typography>
      <Typography color="text.secondary" sx={{ mt:.5 }}>{context?.canSchedule ? `${context.remainingThisWeek} of ${context.weeklyLimit} WFH day(s) remain this Monday–Sunday week.` : context?.disabledReasonCode === "WFH_WEEKLY_LIMIT_USED" ? `This week's WFH allowance has been used. Next available: ${context.nextAvailableDate ? new Date(context.nextAvailableDate).toLocaleDateString() : "next Monday"}.` : "WFH is not currently available for your employee profile."}</Typography>
      <Divider sx={{ my:2.5 }} />
      <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", sm:"repeat(2, minmax(0, 1fr))", lg:"repeat(4, minmax(0, 1fr))" }, gap:2 }}>
        <CustomisedDatePicker
          label="From date"
          clearable
          value={form.fromDate ? dayjs(form.fromDate) : null}
          setValue={(date: Dayjs | null) => setForm(f => ({ ...f, fromDate: date ? date.format("YYYY-MM-DD") : "" }))}
        />
        <CustomisedDatePicker
          label="To date"
          clearable
          value={form.toDate ? dayjs(form.toDate) : null}
          minDate={form.fromDate ? dayjs(form.fromDate) : undefined}
          setValue={(date: Dayjs | null) => setForm(f => ({ ...f, toDate: date ? date.format("YYYY-MM-DD") : "" }))}
        />
        <AppTextField select label="Duration" SelectProps={{ native:true }} value={form.durationType} onChange={e=>setForm({...form,durationType:e.target.value as WorkFromHomeRequestPayload["durationType"]})} helperText={form.durationType === "FirstHalf" ? "WFH covers the first half; the second half remains available for office attendance." : form.durationType === "SecondHalf" ? "WFH covers the second half; the first half remains available for office attendance." : undefined}><option value="FullDay">Full day</option>{policy.allowHalfDay && <option value="FirstHalf">First half</option>}{policy.allowHalfDay && <option value="SecondHalf">Second half</option>}{policy.allowMixedDay && <option value="Mixed">Mixed WFH/WFO</option>}</AppTextField>
        <AppTextField select label="Reason category" SelectProps={{ native:true }} value={form.reasonCode} onChange={e=>setForm({...form,reasonCode:e.target.value})}><option value="PERSONAL">Personal</option><option value="MEDICAL">Medical</option><option value="FAMILY">Family</option><option value="HOME_MAINTENANCE">Home maintenance</option><option value="TRAVEL_DISRUPTION">Travel disruption</option><option value="OPERATIONAL">Operational</option><option value="MANAGER_INSTRUCTION">Manager instruction</option><option value="OTHER">Other</option></AppTextField>
        <AppTextField label="Additional details" required={policy.requireReason} value={form.reasonText} onChange={e=>setForm({...form,reasonText:e.target.value})}/>
      </Box>
      <AppButton sx={{ mt:2 }} variant="contained" startIcon={<Add/>} disabled={!context?.canSchedule || !form.fromDate || !form.toDate || (policy.requireReason && !form.reasonText.trim())} onClick={()=>void submit()}>{context?.managerApprovalRequired ? "Submit for approval" : "Schedule WFH"}</AppButton>
    </Card>}
    <Card sx={{ p:{ xs:2, md:3 } }}><Typography variant="h6" fontWeight={800}>My requests</Typography>{myRequestsError && <Alert severity="error" sx={{ mt:1.5 }}>{myRequestsError}</Alert>}<Stack spacing={1.25} sx={{ mt:2 }}>{myRequestsLoading ? <Typography color="text.secondary">Loading WFH requests…</Typography> : requests.length ? requests.map(r=>{ const time = timings[r.requestId]; const todayApproved = time?.isApprovedForToday === true; const canCancel = (r.status === "Draft" || r.status === "Pending" || r.status === "Returned" || r.status === "Approved") && Boolean(companyBusinessDate && (r.fromDate.slice(0,10) > companyBusinessDate || (r.fromDate.slice(0,10) === companyBusinessDate && !context?.isSameDayRequestCutoffPassed))); const verifiedHours = time?.totalHours ?? 0; const hours = `${Math.floor(verifiedHours)}h ${Math.floor((verifiedHours % 1) * 60).toString().padStart(2,"0")}m`; return <Stack key={r.requestId} direction={{xs:"column",sm:"row"}} alignItems={{sm:"center"}} justifyContent="space-between" gap={1.5} sx={{ p:1.75, border:"1px solid", borderColor:"divider", borderRadius:2.5, "&:hover":{ bgcolor:"action.hover" }}}><Box><Typography fontWeight={750}>{formatBusinessDate(r.fromDate)} – {formatBusinessDate(r.toDate)}</Typography><Typography variant="body2" color="text.secondary">{r.durationType.replace(/([A-Z])/g, " $1").trim()} · {r.reasonText || r.reasonCode}{r.isLateSubmission && <Chip size="small" color="warning" label="Late Submission" sx={{ ml: 1, height: 20, fontSize: "0.75rem" }} />}</Typography>{r.officeConvertedDates?.length ? <Typography variant="caption" color="success.main" display="block">Office attendance recorded for: {r.officeConvertedDates.map(date=>formatBusinessDate(date)).join(", ")}</Typography> : null}{timingErrors[r.requestId] && <Typography role="alert" variant="caption" color="error" display="block">Unable to verify current WFH timing. Refresh and try again. {timingErrors[r.requestId]}</Typography>}{todayApproved && <Typography variant="caption" color="text.secondary" display="block" sx={{mt:.5}}>Required: {time.requiredHours}h · Verified: {hours}{time.isHalfDay ? " (Half Day)" : ""}</Typography>}</Box><Stack direction="row" gap={1} alignItems="center"><Chip label={r.status} color={r.status === "Approved" ? "success" : r.status === "Rejected" ? "error" : "warning"}/>{todayApproved && r.requestId !== todayApprovedRequest?.requestId && !time?.checkOutTime && <AppButton size="small" variant={time.checkInTime ? "contained" : "outlined"} startIcon={time.checkInTime ? <Logout/> : <Login/>} disabled={clockingRequestId === r.requestId || Boolean(timingErrors[r.requestId])} onClick={()=>void act(r.requestId,time.checkInTime ? "check-out" : "check-in")}>{clockingRequestId === r.requestId ? "Saving..." : time.checkInTime ? "Clock out" : "Clock in"}</AppButton>}{todayApproved && time?.checkOutTime && <Chip size="small" color={time.isUnderHours ? "warning" : time.isHalfDay ? "info" : "success"} icon={<CheckCircle/>} label={time.isUnderHours ? "Under-hours (Pending review)" : time.isHalfDay ? "Half day clocked out" : "Clocked out"}/>}{canCancel && <AppButton size="small" color="error" variant="outlined" startIcon={<Cancel/>} onClick={()=>void cancelRequest(r)}>Cancel</AppButton>}</Stack></Stack>}) : <Typography color="text.secondary">No WFH requests yet.</Typography>}</Stack><TablePagination component="div" count={myRequestsTotal} page={myRequestsPage - 1} rowsPerPage={myRequestsPageSize} rowsPerPageOptions={[10,25,50,100]} onPageChange={(_, page)=>{ const nextPage = page + 1; setMyRequestsPage(nextPage); void loadMyRequests(nextPage, myRequestsPageSize); }} onRowsPerPageChange={event=>{ const nextPageSize = Number(event.target.value); setMyRequestsPage(1); setMyRequestsPageSize(nextPageSize); void loadMyRequests(1, nextPageSize); }}/></Card>
    {canReviewWfh && <>
      <Card sx={{ p:{ xs:2, md:3 } }}>
        <Typography variant="h6" fontWeight={800}>WFH request filters</Typography>
        <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", sm:"repeat(2, minmax(0, 1fr))", lg:"repeat(5, minmax(0, 1fr))" }, gap:1.5, mt:2 }}>
          <AppTextField size="small" label="Employee" value={filters.employeeSearch} onChange={event=>setFilters(value=>({ ...value, employeeSearch:event.target.value, pageNo:1 }))} />
          <AppTextField size="small" label="Department" value={filters.department} onChange={event=>setFilters(value=>({ ...value, department:event.target.value, pageNo:1 }))} />
          <AppTextField size="small" select label="Status" value={filters.status} onChange={event=>setFilters(value=>({ ...value, status:event.target.value, pageNo:1 }))}>{["Pending","Approved","Returned","Rejected","Cancelled"].map(status=><MenuItem key={status} value={status}>{status}</MenuItem>)}</AppTextField>
          <CustomisedDatePicker
            label="From date"
            clearable
            value={filters.fromDate ? dayjs(filters.fromDate) : null}
            setValue={(date: Dayjs | null) => setFilters(value => ({ ...value, fromDate: date ? date.format("YYYY-MM-DD") : "", pageNo: 1 }))}
          />
          <CustomisedDatePicker
            label="To date"
            clearable
            value={filters.toDate ? dayjs(filters.toDate) : null}
            minDate={filters.fromDate ? dayjs(filters.fromDate) : undefined}
            setValue={(date: Dayjs | null) => setFilters(value => ({ ...value, toDate: date ? date.format("YYYY-MM-DD") : "", pageNo: 1 }))}
          />
        </Box>
      </Card>
      <Card sx={{ p:{ xs:2, md:3 } }}><Typography variant="h6" fontWeight={800}>WFH requests</Typography><Typography variant="body2" color="text.secondary" sx={{mb:2}}>HR/Admin can review company requests; managers see requests assigned to them.</Typography><Stack spacing={1}>{team.length ? team.map(r=><Stack key={r.requestId} direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems={{sm:"center"}} gap={1.5} sx={{p:1.5,border:"1px solid",borderColor:"divider",borderRadius:2}}><Box><Typography fontWeight={700}>{r.employeeName || r.employeeId} · {r.department || "No department"}</Typography><Typography variant="body2" color="text.secondary">{formatBusinessDate(r.fromDate)} · {r.durationType.replace(/([A-Z])/g, " $1").trim()} · {r.status}{r.isLateSubmission && <Chip size="small" color="warning" label="Late Submission" sx={{ ml: 1, height: 20, fontSize: "0.75rem" }} />}</Typography></Box><Stack direction={{xs:"column",sm:"row"}} gap={1} alignItems="center" sx={{ width:{xs:"100%",sm:"auto"} }}>
              <AppButton size="small" variant="outlined" startIcon={<Visibility/>} onClick={()=>setReasonRequest(r)}>View reason</AppButton>
              {r.status === "Pending" && <>
                <AppButton size="small" variant="outlined" onClick={()=>void act(r.requestId,"return",r.version)}>Return</AppButton>
                <AppButton size="small" variant="contained" color="success" startIcon={<CheckCircle/>} onClick={()=>void act(r.requestId,"approve",r.version)}>Approve</AppButton>
                <AppButton size="small" color="error" onClick={()=>void act(r.requestId,"reject",r.version)}>Reject</AppButton>
              </>}
              {r.status === "Approved" && (
                <>
                  <AppButton size="small" variant="outlined" color="primary" onClick={() => { setRegularizeTarget(r); setRegStatus("WFH-HD"); setRegRemarks(""); }}>Regularize / Mark</AppButton>
                  <AppButton size="small" variant="outlined" disabled={convertibleDates(r).length === 0} onClick={() => openOfficeConversion(r)}>Convert date to office</AppButton>
                </>
              )}
            </Stack></Stack>) : <Typography color="text.secondary">No requests match these filters.</Typography>}</Stack><TablePagination component="div" count={teamTotal} page={filters.pageNo - 1} rowsPerPage={filters.pageSize} rowsPerPageOptions={[10,25,50,100]} onPageChange={(_, page)=>setFilters(value=>({ ...value, pageNo:page + 1 }))} onRowsPerPageChange={event=>setFilters(value=>({ ...value, pageNo:1, pageSize:Number(event.target.value) }))}/></Card>
    </>}
    <Dialog open={Boolean(reasonRequest)} onClose={()=>setReasonRequest(null)} fullWidth maxWidth="sm" aria-labelledby="wfh-reason-dialog-title">
      <DialogTitle id="wfh-reason-dialog-title">Work From Home reason</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.25}>
          <Box><Typography variant="caption" color="text.secondary">Employee</Typography><Typography fontWeight={700}>{reasonRequest?.employeeId || "Employee"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Requested date</Typography><Typography>{reasonRequest ? `${formatBusinessDate(reasonRequest.fromDate)} – ${formatBusinessDate(reasonRequest.toDate)}` : ""}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Reason</Typography><Typography sx={{ mt:.5, whiteSpace:"pre-wrap", overflowWrap:"anywhere" }}>{reasonRequest?.reasonText?.trim() || reasonRequest?.reasonCode || "No reason was provided."}</Typography></Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p:2 }}><AppButton onClick={()=>setReasonRequest(null)}>Close</AppButton></DialogActions>
    </Dialog>
    <Dialog open={Boolean(officeConversionTarget)} onClose={() => !convertingToOffice && setOfficeConversionTarget(null)} fullWidth maxWidth="sm">
      <DialogTitle>Convert approved WFH to office attendance</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">Use verified office punches for the selected business date. The WFH request and original attendance values are retained in the audit history.</Typography>
          <AppTextField select label="Attendance date" value={officeConversionDate} onChange={event => setOfficeConversionDate(event.target.value)}>
            {officeConversionTarget && convertibleDates(officeConversionTarget).map(date => <MenuItem key={date} value={date}>{new Date(`${date}T00:00:00`).toLocaleDateString()}</MenuItem>)}
          </AppTextField>
          <AppTextField label="Verified office check-in" type="time" value={officeCheckIn} onChange={event => setOfficeCheckIn(event.target.value)} />
          <AppTextField label="Verified office check-out" type="time" value={officeCheckOut} onChange={event => setOfficeCheckOut(event.target.value)} />
          <AppTextField label="HR/Admin remarks" required multiline minRows={2} value={officeConversionRemarks} onChange={event => setOfficeConversionRemarks(event.target.value)} helperText="Explain how the office attendance was verified. The acting HR/Admin identity is recorded automatically." />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <AppButton variant="outlined" disabled={convertingToOffice} onClick={() => setOfficeConversionTarget(null)}>Cancel</AppButton>
        <AppButton variant="contained" disabled={convertingToOffice || !officeConversionDate || !officeCheckIn || !officeCheckOut || officeConversionRemarks.trim().length < 3} onClick={() => void handleConvertToOffice()}>
          {convertingToOffice ? "Converting..." : "Confirm conversion"}
        </AppButton>
      </DialogActions>
    </Dialog>
    {canManagePolicy ? <Card sx={{ p:{ xs:2, md:3 } }}><Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" gap={2}><Box><Typography variant="h6" fontWeight={800}>WFH policy</Typography><Typography variant="body2" color="text.secondary">HR/Admin controls eligibility and whether requests require approval.</Typography></Box><AppButton variant="contained" startIcon={<Save/>} disabled={saving} onClick={()=>void savePolicy()}>Save policy</AppButton></Stack><Divider sx={{ my:2.5 }}/><Stack spacing={2}><FormControlLabel control={<AppSwitch checked={policy.isEnabled} onChange={e=>setPolicy({...policy,isEnabled:e.target.checked})}/>} label="Enable WFH"/><FormControlLabel control={<AppSwitch checked={policy.managerApprovalRequired ?? true} onChange={e=>setPolicy({...policy,managerApprovalRequired:e.target.checked})}/>} label="Require manager approval"/><AppTextField label="Maximum WFH days per week" type="number" inputProps={{min:1,max:7}} value={policy.maxDaysPerWeek} onChange={e=>setPolicy({...policy,maxDaysPerWeek:Math.max(1,Math.min(7,Number(e.target.value)||1))})} helperText="Allowed WFH days per employee, Monday–Sunday (1–7 working days)."/><FormControlLabel control={<AppSwitch checked={policy.applyToAllEmployees} onChange={e=>setPolicy({...policy,applyToAllEmployees:e.target.checked})}/>} label="Apply to all employees"/>{!policy.applyToAllEmployees && <Box sx={{ display:"grid", gridTemplateColumns:{xs:"1fr",md:"1fr 1fr"}, gap:2 }}><AppTextField label="Departments" value={policy.applicableDepartments.join(", ")} onChange={e=>setPolicy({...policy,applicableDepartments:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})} helperText="Comma-separated department names."/><AppTextField label="Employee IDs" value={policy.applicableEmployeeIds.join(", ")} onChange={e=>setPolicy({...policy,applicableEmployeeIds:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})} helperText="Comma-separated employee IDs; either match grants eligibility."/></Box>}</Stack></Card> : <Typography variant="body2" color="text.secondary" sx={{px:1}}>Your remaining allowance is validated when you submit.</Typography>}
    {canReviewWfh && <Card sx={{ p:{ xs:2, md:3 } }}>
      <Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems={{sm:"center"}} gap={.5}>
        <Box><Typography variant="h6" fontWeight={800}>This week’s WFH roster</Typography><Typography variant="body2" color="text.secondary">Approved WFH for {currentWeekStart.toLocaleDateString()} – {currentWeekEnd.toLocaleDateString()}. This automatically refreshes each Monday.</Typography></Box>
        <Chip label={`${rosterTotal} employee${rosterTotal === 1 ? "" : "s"}`} color="primary" size="small" />
      </Stack>
      <Box sx={{ display:"grid", gridTemplateColumns:{xs:"1fr",sm:"repeat(2, minmax(0, 1fr))",lg:"repeat(3, minmax(0, 1fr))"}, gap:1.5, mt:2 }}>
        {currentWeekWfh.length ? currentWeekWfh.map(request => {
          const isGuid = Boolean(request.department && (request.department.includes("-") && request.department.length > 20));
          const deptDisplay = isGuid || !request.department ? (request.employeeId ? `Employee ID: ${request.employeeId}` : "Company Employee") : request.department;
          return (
            <Box
              key={request.requestId}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2.5,
                bgcolor: "background.paper",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 1.25,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  borderColor: "primary.light",
                },
              }}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={800} fontSize="0.95rem" noWrap>
                      {request.employeeName || request.employeeId || "Employee"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.8rem" noWrap>
                      {deptDisplay}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={request.durationType.replace(/([A-Z])/g, " $1").trim()}
                    color={request.durationType === "FullDay" ? "primary" : "info"}
                    variant="outlined"
                    sx={{ fontSize: 11, fontWeight: 700, borderRadius: 1.5, height: 24 }}
                  />
                </Stack>
              </Box>
              <Box sx={{ pt: 1, borderTop: "1px dashed", borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  📅 {formatBusinessDate(request.fromDate)} {request.fromDate !== request.toDate ? `– ${formatBusinessDate(request.toDate)}` : ""}
                </Typography>
              </Box>
            </Box>
          );
        }) : <Typography color="text.secondary" sx={{ gridColumn:"1 / -1", py:2, textAlign: "center" }}>No approved WFH is scheduled for this week.</Typography>}
      </Box>
      <TablePagination component="div" count={rosterTotal} page={rosterPage - 1} rowsPerPage={filters.pageSize} rowsPerPageOptions={[10,25,50,100]} onPageChange={(_, page)=>setRosterPage(page + 1)} onRowsPerPageChange={event=>{ setRosterPage(1); setFilters(value=>({ ...value, pageSize:Number(event.target.value) })); }}/>
    </Card>}

    {canManageDeadLetters && <WorkFromHomeDeadLetterPanel />}

    <Dialog open={Boolean(regularizeTarget)} onClose={() => !regularizing && setRegularizeTarget(null)} fullWidth maxWidth="sm">
      <DialogTitle>Regularize / Mark WFH Attendance</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={700}>{regularizeTarget?.employeeName || regularizeTarget?.employeeId} · {regularizeTarget?.department || "No department"}</Typography>
            <Typography variant="caption" color="text.secondary">Date: {regularizeTarget ? formatBusinessDate(regularizeTarget.fromDate) : ""} · {regularizeTarget?.durationType}</Typography>
          </Box>
          <AppTextField
            select
            label="Attendance Status to Mark"
            value={regStatus}
            onChange={(e) => setRegStatus(e.target.value)}
            helperText="Select the final attendance status to record for this employee's WFH day."
          >
            <MenuItem value="WFH-HD">WFH-HD · Half Day WFH (Concession)</MenuItem>
            <MenuItem value="WFH">WFH · Full Day WFH (Full Day Credit)</MenuItem>
            <MenuItem value="A">A · Absent (Loss of Pay / Under-Hours)</MenuItem>
            <MenuItem value="HD">HD · Half Day Absent</MenuItem>
            <MenuItem value="P">P · Present (Normal Shift)</MenuItem>
          </AppTextField>
          <AppTextField
            label="HR / Admin Remarks (Required)"
            placeholder="e.g., Approved half-day concession per manager discretion, medical note reviewed..."
            multiline
            minRows={2}
            value={regRemarks}
            onChange={(e) => setRegRemarks(e.target.value)}
            required
            helperText="Document the justification for attendance audit and compliance."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <AppButton variant="outlined" disabled={regularizing} onClick={() => setRegularizeTarget(null)}>Cancel</AppButton>
        <AppButton variant="contained" color="primary" disabled={regularizing || !regRemarks.trim()} onClick={() => void handleRegularize()}>
          {regularizing ? "Saving..." : "Save Regularization"}
        </AppButton>
      </DialogActions>
    </Dialog>
    <WfhClockOutModal
      open={Boolean(clockOutTarget)}
      onClose={() => setClockOutTarget(null)}
      onConfirm={handleConfirmClockOut}
      checkInTime={clockOutTarget?.checkInTime}
      timeZoneId={clockOutTarget?.timeZoneId}
      requiredHours={clockOutTarget?.requiredHours}
      halfDayRequiredHours={clockOutTarget?.halfDayRequiredHours}
      loading={clockingRequestId === clockOutTarget?.requestId}
    />
  </Stack>;
}
