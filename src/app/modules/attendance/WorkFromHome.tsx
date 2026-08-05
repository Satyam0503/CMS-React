import { Add, Cancel, CheckCircle, Login, Logout, Save, Visibility } from "@mui/icons-material";
import { Box, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRequest, postRequest } from "../../../server/axios";
import { usePageData } from "../../Context/PageDataProvider";
import { AppButton, AppSwitch, AppTextField } from "../../shared/components/ui";
import { ApiResponse } from "../../../utils/common_types";

type Policy = { isEnabled:boolean; maxDaysPerWeek:number; minimumAdvanceNoticeHours?:number; managerApprovalRequired?:boolean; applyToAllEmployees:boolean; applicableDepartments:string[]; applicableEmployeeIds:string[]; allowHalfDay:boolean; allowMixedDay:boolean; requireReason:boolean; fullDayAttendanceStatusCode:string; halfDayAttendanceStatusCode:string; mixedAttendanceStatusCode:string };
type Request = { requestId:string; employeeId?:string; fromDate:string; toDate:string; durationType:string; reasonCode:string; reasonText?:string; status:string; version:number };
type Timing = { isApprovedForToday:boolean; checkInTime?:string; checkOutTime?:string; totalHours?:number; requiredHours:number };
type Context = { isFeatureEnabled:boolean; isEligible:boolean; weeklyLimit:number; usedThisWeek:number; remainingThisWeek:number; canSchedule:boolean; disabledReasonCode?:string; nextAvailableDate?:string; managerApprovalRequired:boolean; minimumAdvanceNoticeHours:number; officeStartTime?:string; officeEndTime?:string; checkInAvailableFrom?:string; checkInAvailableUntil?:string; checkOutAvailableFrom?:string; checkOutAvailableUntil?:string };
const defaultPolicy: Policy = { isEnabled:true, maxDaysPerWeek:1, applyToAllEmployees:true, applicableDepartments:[], applicableEmployeeIds:[], allowHalfDay:false, allowMixedDay:false, requireReason:true, fullDayAttendanceStatusCode:"WFH", halfDayAttendanceStatusCode:"WFH-HD", mixedAttendanceStatusCode:"WFH+WFO" };

export default function WorkFromHome() {
  const { setPageTitle } = usePageData();
  const [policy, setPolicy] = useState<Policy>(defaultPolicy);
  const [requests, setRequests] = useState<Request[]>([]);
  const [team, setTeam] = useState<Request[]>([]);
  const [reasonRequest, setReasonRequest] = useState<Request | null>(null);
  const [canReviewWfh, setCanReviewWfh] = useState(false);
  const [context, setContext] = useState<Context | null>(null);
  const [timings, setTimings] = useState<Record<string, Timing>>({});
  const [now, setNow] = useState(Date.now());
  // Employees submit WFH from the normal Apply for Leave form. This page keeps
  // request history and approvals without exposing a duplicate submission flow.
  const showLegacyRequestForm = false;
  // WFH policy configuration is now authoritative in Leave Policies.
  const canManagePolicy = false;
  const saving = false;
  const savePolicy = async () => undefined;
  const [form, setForm] = useState({ fromDate:"", toDate:"", durationType:"FullDay", reasonCode:"OTHER", reasonText:"" });
  const load = async () => { try { const [p, r, c] = await Promise.all([getRequest<{methodResult?:Policy}>("api/wfh/policy"), getRequest<{methodResults?:Request[]}>("api/wfh/requests/my"), getRequest<{methodResult?:Context}>("api/wfh/context")]); setPolicy(p.data.methodResult ?? defaultPolicy); setRequests(r.data.methodResults ?? []); setContext(c.data.methodResult ?? null); try { const response = await getRequest<{methodResults?:Request[]}>("api/wfh/requests/all"); setTeam(response.data.methodResults ?? []); setCanReviewWfh(true); } catch { try { const response = await getRequest<{methodResults?:Request[]}>("api/wfh/requests/team"); setTeam(response.data.methodResults ?? []); setCanReviewWfh(true); } catch { setTeam([]); setCanReviewWfh(false); } } } catch { toast.error("Unable to load WFH data."); } };
  useEffect(() => { void load(); setPageTitle("Work from home"); return () => setPageTitle(""); }, []);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const submit = async () => { if (!context?.canSchedule) return; try { const { data } = await postRequest<typeof form, ApiResponse>("api/wfh/requests", form); if (!data.success) throw new Error(data.message); toast.success(context.managerApprovalRequired ? "WFH request submitted for approval." : "WFH scheduled. HR has been notified."); setForm({ fromDate:"", toDate:"", durationType:"FullDay", reasonCode:"OTHER", reasonText:"" }); await load(); } catch (e) { toast.error((e as Error).message || "Unable to submit WFH request."); } };
  const timing = async (requestId:string) => { try { const { data } = await getRequest<{methodResult?:Timing}>(`api/wfh/requests/${requestId}/timing`); if (data.methodResult) setTimings(value => ({ ...value, [requestId]: data.methodResult! })); } catch { /* an employee can have no approved request today */ } };
  const act = async (requestId:string, action:"approve"|"reject"|"check-in"|"check-out", version?:number) => { try { const { data } = await postRequest<Record<string, unknown>, ApiResponse>(`api/wfh/requests/${requestId}/${action}`, action === "approve" || action === "reject" ? { remarksCode: action.toUpperCase(), version } : {}); if (!data.success) throw new Error(data.message); toast.success(action === "approve" ? "WFH request approved." : action.replace("-", " ") + " recorded."); await load(); await timing(requestId); } catch (e) { toast.error((e as Error).message || "Action could not be completed."); } };
  const cancelRequest = async (request:Request) => { try { const { data } = await postRequest<{ version:number; remarksCode:string }, ApiResponse>(`api/wfh/requests/${request.requestId}/cancel`, { version: request.version, remarksCode:"EMPLOYEE_CANCELLED" }); if (!data.success) throw new Error(data.message); toast.success("WFH request cancelled and its unclocked attendance has been restored."); await load(); } catch (e) { toast.error((e as Error).message || "WFH request could not be cancelled."); } };
  const today = new Date().toISOString().slice(0, 10);
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7));
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);
  const currentWeekWfh = team.filter(request => {
    const from = new Date(request.fromDate);
    const to = new Date(request.toDate);
    return request.status === "Approved" && from <= currentWeekEnd && to >= currentWeekStart;
  });
  useEffect(() => { requests.filter(r => r.status === "Approved" && r.fromDate.slice(0,10) <= today && r.toDate.slice(0,10) >= today).forEach(r => void timing(r.requestId)); }, [requests, today]);
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
    <Card sx={{ p:{ xs:2, md:3 } }}><Typography variant="h6" fontWeight={800}>My requests</Typography><Stack spacing={1.25} sx={{ mt:2 }}>{requests.length ? requests.map(r=>{ const todayApproved = r.status === "Approved" && r.fromDate.slice(0,10) <= today && r.toDate.slice(0,10) >= today; const canCancel = (r.status === "Draft" || r.status === "Pending" || r.status === "Returned" || r.status === "Approved") && r.fromDate.slice(0,10) > today; const time = timings[r.requestId]; const worked = time?.checkInTime ? ((time.checkOutTime ? new Date(time.checkOutTime).getTime() : now) - new Date(time.checkInTime).getTime()) / 3600000 : 0; const hours = `${Math.floor(worked)}h ${Math.floor((worked % 1) * 60).toString().padStart(2,"0")}m`; return <Stack key={r.requestId} direction={{xs:"column",sm:"row"}} alignItems={{sm:"center"}} justifyContent="space-between" gap={1.5} sx={{ p:1.75, border:"1px solid", borderColor:"divider", borderRadius:2.5, "&:hover":{ bgcolor:"action.hover" }}}><Box><Typography fontWeight={750}>{new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}</Typography><Typography variant="body2" color="text.secondary">{r.durationType.replace(/([A-Z])/g, " $1").trim()} · {r.reasonText || r.reasonCode}</Typography>{todayApproved && <Typography variant="caption" color="text.secondary" display="block" sx={{mt:.5}}>Office: 09:00–18:00 · Required: {time?.requiredHours ?? 8}h · Current: {hours}</Typography>}</Box><Stack direction="row" gap={1} alignItems="center"><Chip label={r.status} color={r.status === "Approved" ? "success" : r.status === "Rejected" ? "error" : "warning"}/>{todayApproved && !time?.checkOutTime && <AppButton size="small" variant={time?.checkInTime ? "contained" : "outlined"} startIcon={time?.checkInTime ? <Logout/> : <Login/>} onClick={()=>void act(r.requestId,time?.checkInTime ? "check-out" : "check-in")}>{time?.checkInTime ? "Clock out" : "Clock in"}</AppButton>}{canCancel && <AppButton size="small" color="error" variant="outlined" startIcon={<Cancel/>} onClick={()=>void cancelRequest(r)}>Cancel</AppButton>}</Stack></Stack>}) : <Typography color="text.secondary">No WFH requests yet.</Typography>}</Stack></Card>
    {team.length > 0 && <Card sx={{ p:{ xs:2, md:3 } }}><Typography variant="h6" fontWeight={800}>WFH approvals</Typography><Typography variant="body2" color="text.secondary" sx={{mb:2}}>HR/Admin can review all company requests; managers see requests assigned to them. Approval creates the protected WFH attendance row for the requested date.</Typography><Stack spacing={1}>{team.filter(r=>r.status === "Pending").map(r=><Stack key={r.requestId} direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems={{sm:"center"}} gap={1.5} sx={{p:1.5,border:"1px solid",borderColor:"divider",borderRadius:2}}><Box><Typography fontWeight={700}>{r.employeeId} · {new Date(r.fromDate).toLocaleDateString()}</Typography><Typography variant="body2" color="text.secondary">{r.durationType.replace(/([A-Z])/g, " $1").trim()} request</Typography></Box><Stack direction={{xs:"column",sm:"row"}} gap={1} sx={{ width:{xs:"100%",sm:"auto"} }}><AppButton size="small" variant="outlined" startIcon={<Visibility/>} onClick={()=>setReasonRequest(r)}>View reason</AppButton><AppButton size="small" variant="contained" color="success" startIcon={<CheckCircle/>} onClick={()=>void act(r.requestId,"approve",r.version)}>Approve</AppButton><AppButton size="small" color="error" onClick={()=>void act(r.requestId,"reject",r.version)}>Reject</AppButton></Stack></Stack>)}</Stack></Card>}
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
    {canManagePolicy ? <Card sx={{ p:{ xs:2, md:3 } }}><Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" gap={2}><Box><Typography variant="h6" fontWeight={800}>WFH policy</Typography><Typography variant="body2" color="text.secondary">HR/Admin controls eligibility and whether requests require approval.</Typography></Box><AppButton variant="contained" startIcon={<Save/>} disabled={saving} onClick={()=>void savePolicy()}>Save policy</AppButton></Stack><Divider sx={{ my:2.5 }}/><Stack spacing={2}><FormControlLabel control={<AppSwitch checked={policy.isEnabled} onChange={e=>setPolicy({...policy,isEnabled:e.target.checked})}/>} label="Enable WFH"/><FormControlLabel control={<AppSwitch checked={policy.managerApprovalRequired ?? true} onChange={e=>setPolicy({...policy,managerApprovalRequired:e.target.checked})}/>} label="Require manager approval"/><AppTextField label="Maximum WFH days per week" type="number" inputProps={{min:1,max:1}} value={policy.maxDaysPerWeek} onChange={()=>setPolicy({...policy,maxDaysPerWeek:1})} helperText="Fixed at one day per employee, Monday–Sunday."/><FormControlLabel control={<AppSwitch checked={policy.applyToAllEmployees} onChange={e=>setPolicy({...policy,applyToAllEmployees:e.target.checked})}/>} label="Apply to all employees"/>{!policy.applyToAllEmployees && <Box sx={{ display:"grid", gridTemplateColumns:{xs:"1fr",md:"1fr 1fr"}, gap:2 }}><AppTextField label="Departments" value={policy.applicableDepartments.join(", ")} onChange={e=>setPolicy({...policy,applicableDepartments:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})} helperText="Comma-separated department names."/><AppTextField label="Employee IDs" value={policy.applicableEmployeeIds.join(", ")} onChange={e=>setPolicy({...policy,applicableEmployeeIds:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})} helperText="Comma-separated employee IDs; either match grants eligibility."/></Box>}</Stack></Card> : <Typography variant="body2" color="text.secondary" sx={{px:1}}>You can use one WFH day per Monday–Sunday week. Your remaining allowance is validated when you submit.</Typography>}
    {canReviewWfh && <Card sx={{ p:{ xs:2, md:3 } }}>
      <Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems={{sm:"center"}} gap={.5}>
        <Box><Typography variant="h6" fontWeight={800}>This week’s WFH roster</Typography><Typography variant="body2" color="text.secondary">Approved WFH for {currentWeekStart.toLocaleDateString()} – {currentWeekEnd.toLocaleDateString()}. This automatically refreshes each Monday.</Typography></Box>
        <Chip label={`${currentWeekWfh.length} employee${currentWeekWfh.length === 1 ? "" : "s"}`} color="primary" size="small" />
      </Stack>
      <Box sx={{ display:"grid", gridTemplateColumns:{xs:"1fr",sm:"repeat(2, minmax(0, 1fr))",lg:"repeat(3, minmax(0, 1fr))"}, gap:1.25, mt:2 }}>
        {currentWeekWfh.length ? currentWeekWfh.map(request => <Box key={request.requestId} sx={{ p:1.5, border:"1px solid", borderColor:"divider", borderRadius:2, bgcolor:"action.hover" }}><Typography fontWeight={750}>{request.employeeId || "Employee"}</Typography><Typography variant="body2" color="text.secondary">{new Date(request.fromDate).toLocaleDateString()} – {new Date(request.toDate).toLocaleDateString()}</Typography><Typography variant="caption" color="text.secondary">{request.durationType.replace(/([A-Z])/g, " $1").trim()}</Typography></Box>) : <Typography color="text.secondary" sx={{ gridColumn:"1 / -1", py:1 }}>No approved WFH is scheduled for this week.</Typography>}
      </Box>
    </Card>}
  </Stack>;
}
