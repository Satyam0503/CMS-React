import { Add, Cancel, CheckCircle, Login, Logout, Save, Visibility } from "@mui/icons-material";
import { Box, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, MenuItem, Stack, TablePagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRequest, postRequest } from "../../../server/axios";
import { usePageData } from "../../Context/PageDataProvider";
import { AppButton, AppSwitch, AppTextField } from "../../shared/components/ui";
import { ApiResponse } from "../../../utils/common_types";

type Policy = { isEnabled:boolean; maxDaysPerWeek:number; minimumAdvanceNoticeHours?:number; managerApprovalRequired?:boolean; applyToAllEmployees:boolean; applicableDepartments:string[]; applicableEmployeeIds:string[]; allowHalfDay:boolean; allowMixedDay:boolean; requireReason:boolean; fullDayAttendanceStatusCode:string; halfDayAttendanceStatusCode:string; mixedAttendanceStatusCode:string };
type Request = { requestId:string; employeeId?:string; employeeName?:string; department?:string; fromDate:string; toDate:string; durationType:string; reasonCode:string; reasonText?:string; status:string; version:number };
type RequestPage = { methodResults?: Request[]; totalRecords?: number };
type RequestFilters = { employeeSearch:string; department:string; status:string; fromDate:string; toDate:string; pageNo:number; pageSize:number };
type Timing = { isApprovedForToday:boolean; checkInTime?:string; checkOutTime?:string; totalHours?:number; requiredHours:number };
type Context = { isFeatureEnabled:boolean; isEligible:boolean; weeklyLimit:number; usedThisWeek:number; remainingThisWeek:number; canSchedule:boolean; disabledReasonCode?:string; nextAvailableDate?:string; managerApprovalRequired:boolean; minimumAdvanceNoticeHours:number; businessDate?:string; isSameDayRequestCutoffPassed?:boolean; officeStartTime?:string; officeEndTime?:string; checkInAvailableFrom?:string; checkInAvailableUntil?:string; checkOutAvailableFrom?:string; checkOutAvailableUntil?:string };
const defaultPolicy: Policy = { isEnabled:true, maxDaysPerWeek:1, applyToAllEmployees:true, applicableDepartments:[], applicableEmployeeIds:[], allowHalfDay:false, allowMixedDay:false, requireReason:true, fullDayAttendanceStatusCode:"WFH", halfDayAttendanceStatusCode:"WFH-HD", mixedAttendanceStatusCode:"WFH+WFO" };

export default function WorkFromHome() {
  const { setPageTitle } = usePageData();
  const [policy, setPolicy] = useState<Policy>(defaultPolicy);
  const [requests, setRequests] = useState<Request[]>([]);
  const [team, setTeam] = useState<Request[]>([]);
  const [teamTotal, setTeamTotal] = useState(0);
  const [roster, setRoster] = useState<Request[]>([]);
  const [rosterTotal, setRosterTotal] = useState(0);
  const [filters, setFilters] = useState<RequestFilters>({ employeeSearch:"", department:"", status:"Pending", fromDate:"", toDate:"", pageNo:1, pageSize:25 });
  const [rosterPage, setRosterPage] = useState(1);
  const [reasonRequest, setReasonRequest] = useState<Request | null>(null);
  const [canReviewWfh, setCanReviewWfh] = useState(false);
  const [context, setContext] = useState<Context | null>(null);
  const [timings, setTimings] = useState<Record<string, Timing>>({});
  const [clockingRequestId, setClockingRequestId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  // Employees submit WFH from the normal Apply for Leave form. This page keeps
  // request history and approvals without exposing a duplicate submission flow.
  const showLegacyRequestForm = false;
  // WFH policy configuration is now authoritative in Leave Policies.
  const canManagePolicy = false;
  const saving = false;
  const savePolicy = async () => undefined;
  const [form, setForm] = useState({ fromDate:"", toDate:"", durationType:"FullDay", reasonCode:"OTHER", reasonText:"" });
  const load = async () => {
    const [policyResult, myRequestsResult, contextResult] = await Promise.allSettled([
      getRequest<{ methodResult?: Policy }>("api/wfh/policy"),
      getRequest<{ methodResults?: Request[] }>("api/wfh/requests/my"),
      getRequest<{ methodResult?: Context }>("api/wfh/context"),
    ]);
    if (policyResult.status === "fulfilled") setPolicy(policyResult.value.data.methodResult ?? defaultPolicy);
    if (myRequestsResult.status === "fulfilled") setRequests(myRequestsResult.value.data.methodResults ?? []);
    if (contextResult.status === "fulfilled") setContext(contextResult.value.data.methodResult ?? null);
    if (myRequestsResult.status === "rejected") toast.error("Unable to load your WFH requests.");

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
      setTeam(response.data.methodResults ?? []); setTeamTotal(response.data.totalRecords ?? 0);
      setRoster(rosterResponse.data.methodResults ?? []); setRosterTotal(rosterResponse.data.totalRecords ?? 0);
      setCanReviewWfh(true);
    } catch {
      try {
        const response = await getRequest<RequestPage>(`api/wfh/requests/team?${queryString(filters)}`);
        const rosterResponse = await getRequest<RequestPage>(`api/wfh/requests/team?${queryString(rosterFilters)}`);
        setTeam(response.data.methodResults ?? []); setTeamTotal(response.data.totalRecords ?? 0);
        setRoster(rosterResponse.data.methodResults ?? []); setRosterTotal(rosterResponse.data.totalRecords ?? 0);
        setCanReviewWfh(true);
      } catch { setTeam([]); setRoster([]); setTeamTotal(0); setRosterTotal(0); setCanReviewWfh(false); }
    }
  };
  useEffect(() => { void load(); setPageTitle("Work from home"); return () => setPageTitle(""); }, []);
  useEffect(() => { if (canReviewWfh) void loadReviewRequests(); }, [filters, rosterPage]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const submit = async () => { if (!context?.canSchedule) return; try { const { data } = await postRequest<typeof form, ApiResponse>("api/wfh/requests", form); if (!data.success) throw new Error(data.message); toast.success(context.managerApprovalRequired ? "WFH request submitted for approval." : "WFH scheduled. HR has been notified."); setForm({ fromDate:"", toDate:"", durationType:"FullDay", reasonCode:"OTHER", reasonText:"" }); await load(); } catch (e) { toast.error((e as Error).message || "Unable to submit WFH request."); } };
  const timing = async (requestId:string) => { try { const { data } = await getRequest<{methodResult?:Timing}>(`api/wfh/requests/${requestId}/timing`); if (data.methodResult) setTimings(value => ({ ...value, [requestId]: data.methodResult! })); } catch { /* an employee can have no approved request today */ } };
  const act = async (requestId:string, action:"approve"|"reject"|"return"|"check-in"|"check-out", version?:number) => { const isClockAction = action === "check-in" || action === "check-out"; if (isClockAction) setClockingRequestId(requestId); try { const { data } = await postRequest<Record<string, unknown>, ApiResponse>(`api/wfh/requests/${requestId}/${action}`, action === "approve" || action === "reject" || action === "return" ? { remarksCode: action === "return" ? "RETURNED_FOR_CORRECTION" : action.toUpperCase(), version } : {}); if (!data.success) throw new Error(data.message); toast.success(action === "approve" ? "WFH request approved." : action === "return" ? "WFH request returned for correction." : action.replace("-", " ") + " recorded."); await load(); await timing(requestId); } catch (e) { toast.error((e as Error).message || "Action could not be completed."); } finally { if (isClockAction) setClockingRequestId(null); } };
  const cancelRequest = async (request:Request) => { try { const { data } = await postRequest<{ version:number; remarksCode:string }, ApiResponse>(`api/wfh/requests/${request.requestId}/cancel`, { version: request.version, remarksCode:"EMPLOYEE_CANCELLED" }); if (!data.success) throw new Error(data.message); toast.success("WFH request cancelled and its unclocked attendance has been restored."); await load(); } catch (e) { toast.error((e as Error).message || "WFH request could not be cancelled."); } };
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7));
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);
  const companyBusinessDate = context?.businessDate?.slice(0, 10);
  const currentWeekWfh = roster;
  // Eligibility comes from the server's company business date and time zone,
  // not the browser's UTC date.
  useEffect(() => { requests.filter(r => r.status === "Approved").forEach(r => void timing(r.requestId)); }, [requests]);
  return <Stack spacing={3}>
    {showLegacyRequestForm && <Card sx={{ p:{ xs:2, md:3 }, overflow:"hidden", background:"linear-gradient(125deg, rgba(109,76,190,.14), rgba(38,198,218,.08))" }}>
      <Chip label="ONE DAY / WEEK" color="primary" size="small" sx={{ fontWeight:800 }} />
      <Typography variant="h4" fontWeight={850} sx={{ mt:1 }}>Work from home</Typography>
      <Typography color="text.secondary" sx={{ mt:.5 }}>{context?.canSchedule ? `${context.remainingThisWeek} of ${context.weeklyLimit} WFH day(s) remain this Monday–Sunday week.` : context?.disabledReasonCode === "WFH_WEEKLY_LIMIT_USED" ? `This week's WFH allowance has been used. Next available: ${context.nextAvailableDate ? new Date(context.nextAvailableDate).toLocaleDateString() : "next Monday"}.` : "WFH is not currently available for your employee profile."}</Typography>
      <Divider sx={{ my:2.5 }} />
      <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", sm:"repeat(2, minmax(0, 1fr))", lg:"repeat(4, minmax(0, 1fr))" }, gap:2 }}>
        <AppTextField label="From date" type="date" InputLabelProps={{ shrink:true }} value={form.fromDate} onChange={e=>setForm({...form,fromDate:e.target.value})}/>
        <AppTextField label="To date" type="date" InputLabelProps={{ shrink:true }} value={form.toDate} onChange={e=>setForm({...form,toDate:e.target.value})}/>
        <AppTextField select label="Duration" SelectProps={{ native:true }} value={form.durationType} onChange={e=>setForm({...form,durationType:e.target.value})} helperText={form.durationType === "FirstHalf" ? "WFH covers the first half; the second half remains available for office attendance." : form.durationType === "SecondHalf" ? "WFH covers the second half; the first half remains available for office attendance." : undefined}><option value="FullDay">Full day</option>{policy.allowHalfDay && <option value="FirstHalf">First half</option>}{policy.allowHalfDay && <option value="SecondHalf">Second half</option>}{policy.allowMixedDay && <option value="Mixed">Mixed WFH/WFO</option>}</AppTextField>
        <AppTextField select label="Reason category" SelectProps={{ native:true }} value={form.reasonCode} onChange={e=>setForm({...form,reasonCode:e.target.value})}><option value="PERSONAL">Personal</option><option value="MEDICAL">Medical</option><option value="FAMILY">Family</option><option value="HOME_MAINTENANCE">Home maintenance</option><option value="TRAVEL_DISRUPTION">Travel disruption</option><option value="OPERATIONAL">Operational</option><option value="MANAGER_INSTRUCTION">Manager instruction</option><option value="OTHER">Other</option></AppTextField>
        <AppTextField label="Additional details" required={policy.requireReason} value={form.reasonText} onChange={e=>setForm({...form,reasonText:e.target.value})}/>
      </Box>
      <AppButton sx={{ mt:2 }} variant="contained" startIcon={<Add/>} disabled={!context?.canSchedule || !form.fromDate || !form.toDate || (policy.requireReason && !form.reasonText.trim())} onClick={()=>void submit()}>{context?.managerApprovalRequired ? "Submit for approval" : "Schedule WFH"}</AppButton>
    </Card>}
    <Card sx={{ p:{ xs:2, md:3 } }}><Typography variant="h6" fontWeight={800}>My requests</Typography><Stack spacing={1.25} sx={{ mt:2 }}>{requests.length ? requests.map(r=>{ const time = timings[r.requestId]; const todayApproved = time?.isApprovedForToday === true; const canCancel = (r.status === "Draft" || r.status === "Pending" || r.status === "Returned" || r.status === "Approved") && Boolean(companyBusinessDate && (r.fromDate.slice(0,10) > companyBusinessDate || (r.fromDate.slice(0,10) === companyBusinessDate && !context?.isSameDayRequestCutoffPassed))); const verifiedHours = time?.totalHours ?? 0; const hours = `${Math.floor(verifiedHours)}h ${Math.floor((verifiedHours % 1) * 60).toString().padStart(2,"0")}m`; return <Stack key={r.requestId} direction={{xs:"column",sm:"row"}} alignItems={{sm:"center"}} justifyContent="space-between" gap={1.5} sx={{ p:1.75, border:"1px solid", borderColor:"divider", borderRadius:2.5, "&:hover":{ bgcolor:"action.hover" }}}><Box><Typography fontWeight={750}>{new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}</Typography><Typography variant="body2" color="text.secondary">{r.durationType.replace(/([A-Z])/g, " $1").trim()} · {r.reasonText || r.reasonCode}</Typography>{todayApproved && <Typography variant="caption" color="text.secondary" display="block" sx={{mt:.5}}>Required: {time.requiredHours}h · Verified: {hours}</Typography>}</Box><Stack direction="row" gap={1} alignItems="center"><Chip label={r.status} color={r.status === "Approved" ? "success" : r.status === "Rejected" ? "error" : "warning"}/>{todayApproved && !time?.checkOutTime && <AppButton size="small" variant={time.checkInTime ? "contained" : "outlined"} startIcon={time.checkInTime ? <Logout/> : <Login/>} disabled={clockingRequestId === r.requestId} onClick={()=>void act(r.requestId,time.checkInTime ? "check-out" : "check-in")}>{clockingRequestId === r.requestId ? "Saving..." : time.checkInTime ? "Clock out" : "Clock in"}</AppButton>}{todayApproved && time?.checkOutTime && <Chip size="small" color="success" icon={<CheckCircle/>} label="Clocked out"/>}{canCancel && <AppButton size="small" color="error" variant="outlined" startIcon={<Cancel/>} onClick={()=>void cancelRequest(r)}>Cancel</AppButton>}</Stack></Stack>}) : <Typography color="text.secondary">No WFH requests yet.</Typography>}</Stack></Card>
    {canReviewWfh && <>
      <Card sx={{ p:{ xs:2, md:3 } }}>
        <Typography variant="h6" fontWeight={800}>WFH request filters</Typography>
        <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", sm:"repeat(2, minmax(0, 1fr))", lg:"repeat(5, minmax(0, 1fr))" }, gap:1.5, mt:2 }}>
          <AppTextField label="Employee" value={filters.employeeSearch} onChange={event=>setFilters(value=>({ ...value, employeeSearch:event.target.value, pageNo:1 }))} />
          <AppTextField label="Department" value={filters.department} onChange={event=>setFilters(value=>({ ...value, department:event.target.value, pageNo:1 }))} />
          <AppTextField select label="Status" value={filters.status} onChange={event=>setFilters(value=>({ ...value, status:event.target.value, pageNo:1 }))}>{["Pending","Approved","Returned","Rejected","Cancelled"].map(status=><MenuItem key={status} value={status}>{status}</MenuItem>)}</AppTextField>
          <AppTextField label="From date" type="date" InputLabelProps={{ shrink:true }} value={filters.fromDate} onChange={event=>setFilters(value=>({ ...value, fromDate:event.target.value, pageNo:1 }))} />
          <AppTextField label="To date" type="date" InputLabelProps={{ shrink:true }} value={filters.toDate} onChange={event=>setFilters(value=>({ ...value, toDate:event.target.value, pageNo:1 }))} />
        </Box>
      </Card>
      <Card sx={{ p:{ xs:2, md:3 } }}><Typography variant="h6" fontWeight={800}>WFH requests</Typography><Typography variant="body2" color="text.secondary" sx={{mb:2}}>HR/Admin can review company requests; managers see requests assigned to them.</Typography><Stack spacing={1}>{team.length ? team.map(r=><Stack key={r.requestId} direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems={{sm:"center"}} gap={1.5} sx={{p:1.5,border:"1px solid",borderColor:"divider",borderRadius:2}}><Box><Typography fontWeight={700}>{r.employeeName || r.employeeId} · {r.department || "No department"}</Typography><Typography variant="body2" color="text.secondary">{new Date(r.fromDate).toLocaleDateString()} · {r.durationType.replace(/([A-Z])/g, " $1").trim()} · {r.status}</Typography></Box>{r.status === "Pending" && <Stack direction={{xs:"column",sm:"row"}} gap={1} sx={{ width:{xs:"100%",sm:"auto"} }}><AppButton size="small" variant="outlined" startIcon={<Visibility/>} onClick={()=>setReasonRequest(r)}>View reason</AppButton><AppButton size="small" variant="outlined" onClick={()=>void act(r.requestId,"return",r.version)}>Return</AppButton><AppButton size="small" variant="contained" color="success" startIcon={<CheckCircle/>} onClick={()=>void act(r.requestId,"approve",r.version)}>Approve</AppButton><AppButton size="small" color="error" onClick={()=>void act(r.requestId,"reject",r.version)}>Reject</AppButton></Stack>}</Stack>) : <Typography color="text.secondary">No requests match these filters.</Typography>}</Stack><TablePagination component="div" count={teamTotal} page={filters.pageNo - 1} rowsPerPage={filters.pageSize} rowsPerPageOptions={[10,25,50,100]} onPageChange={(_, page)=>setFilters(value=>({ ...value, pageNo:page + 1 }))} onRowsPerPageChange={event=>setFilters(value=>({ ...value, pageNo:1, pageSize:Number(event.target.value) }))}/></Card>
    </>}
    <Dialog open={Boolean(reasonRequest)} onClose={()=>setReasonRequest(null)} fullWidth maxWidth="sm" aria-labelledby="wfh-reason-dialog-title">
      <DialogTitle id="wfh-reason-dialog-title">Work From Home reason</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.25}>
          <Box><Typography variant="caption" color="text.secondary">Employee</Typography><Typography fontWeight={700}>{reasonRequest?.employeeId || "Employee"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Requested date</Typography><Typography>{reasonRequest ? `${new Date(reasonRequest.fromDate).toLocaleDateString()} – ${new Date(reasonRequest.toDate).toLocaleDateString()}` : ""}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Reason</Typography><Typography sx={{ mt:.5, whiteSpace:"pre-wrap", overflowWrap:"anywhere" }}>{reasonRequest?.reasonText?.trim() || reasonRequest?.reasonCode || "No reason was provided."}</Typography></Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p:2 }}><AppButton onClick={()=>setReasonRequest(null)}>Close</AppButton></DialogActions>
    </Dialog>
    {canManagePolicy ? <Card sx={{ p:{ xs:2, md:3 } }}><Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" gap={2}><Box><Typography variant="h6" fontWeight={800}>WFH policy</Typography><Typography variant="body2" color="text.secondary">HR/Admin controls eligibility and whether requests require approval.</Typography></Box><AppButton variant="contained" startIcon={<Save/>} disabled={saving} onClick={()=>void savePolicy()}>Save policy</AppButton></Stack><Divider sx={{ my:2.5 }}/><Stack spacing={2}><FormControlLabel control={<AppSwitch checked={policy.isEnabled} onChange={e=>setPolicy({...policy,isEnabled:e.target.checked})}/>} label="Enable WFH"/><FormControlLabel control={<AppSwitch checked={policy.managerApprovalRequired ?? true} onChange={e=>setPolicy({...policy,managerApprovalRequired:e.target.checked})}/>} label="Require manager approval"/><AppTextField label="Maximum WFH days per week" type="number" inputProps={{min:1,max:31}} value={policy.maxDaysPerWeek} onChange={e=>setPolicy({...policy,maxDaysPerWeek:Math.max(1,Math.min(31,Number(e.target.value)||1))})} helperText="Allowed WFH days per employee, Monday–Sunday (1–31)."/><FormControlLabel control={<AppSwitch checked={policy.applyToAllEmployees} onChange={e=>setPolicy({...policy,applyToAllEmployees:e.target.checked})}/>} label="Apply to all employees"/>{!policy.applyToAllEmployees && <Box sx={{ display:"grid", gridTemplateColumns:{xs:"1fr",md:"1fr 1fr"}, gap:2 }}><AppTextField label="Departments" value={policy.applicableDepartments.join(", ")} onChange={e=>setPolicy({...policy,applicableDepartments:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})} helperText="Comma-separated department names."/><AppTextField label="Employee IDs" value={policy.applicableEmployeeIds.join(", ")} onChange={e=>setPolicy({...policy,applicableEmployeeIds:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})} helperText="Comma-separated employee IDs; either match grants eligibility."/></Box>}</Stack></Card> : <Typography variant="body2" color="text.secondary" sx={{px:1}}>Your remaining allowance is validated when you submit.</Typography>}
    {canReviewWfh && <Card sx={{ p:{ xs:2, md:3 } }}>
      <Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems={{sm:"center"}} gap={.5}>
        <Box><Typography variant="h6" fontWeight={800}>This week’s WFH roster</Typography><Typography variant="body2" color="text.secondary">Approved WFH for {currentWeekStart.toLocaleDateString()} – {currentWeekEnd.toLocaleDateString()}. This automatically refreshes each Monday.</Typography></Box>
        <Chip label={`${rosterTotal} employee${rosterTotal === 1 ? "" : "s"}`} color="primary" size="small" />
      </Stack>
      <Box sx={{ display:"grid", gridTemplateColumns:{xs:"1fr",sm:"repeat(2, minmax(0, 1fr))",lg:"repeat(3, minmax(0, 1fr))"}, gap:1.25, mt:2 }}>
        {currentWeekWfh.length ? currentWeekWfh.map(request => <Box key={request.requestId} sx={{ p:1.5, border:"1px solid", borderColor:"divider", borderRadius:2, bgcolor:"action.hover" }}><Typography fontWeight={750}>{request.employeeName || request.employeeId || "Employee"}</Typography><Typography variant="body2" color="text.secondary">{request.department || "No department"} · {new Date(request.fromDate).toLocaleDateString()} – {new Date(request.toDate).toLocaleDateString()}</Typography><Typography variant="caption" color="text.secondary">{request.durationType.replace(/([A-Z])/g, " $1").trim()}</Typography></Box>) : <Typography color="text.secondary" sx={{ gridColumn:"1 / -1", py:1 }}>No approved WFH is scheduled for this week.</Typography>}
      </Box>
      <TablePagination component="div" count={rosterTotal} page={rosterPage - 1} rowsPerPage={filters.pageSize} rowsPerPageOptions={[10,25,50,100]} onPageChange={(_, page)=>setRosterPage(page + 1)} onRowsPerPageChange={event=>{ setRosterPage(1); setFilters(value=>({ ...value, pageSize:Number(event.target.value) })); }}/>
    </Card>}
  </Stack>;
}
