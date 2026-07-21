import { Add } from "@mui/icons-material";
import { Button, Card, Checkbox, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRequest, postRequest } from "../../../server/axios";
import { ResponseData } from "../../../utils/common_types";

export type AttendanceStatusSetting = { id?: string; code:string; name:string; isActive:boolean; isSystem:boolean; sortOrder:number; requiresTime:boolean; paidDayFraction:number; unpaidDayFraction:number };
const empty: AttendanceStatusSetting = { code:"", name:"", isActive:true, isSystem:false, sortOrder:99, requiresTime:false, paidDayFraction:1, unpaidDayFraction:0 };
const defaultStatuses: AttendanceStatusSetting[] = [
  ["P","Present",true,1,0], ["A","Absent",false,0,1], ["SL","Sick Leave",false,1,0],
  ["CL","Casual Leave",false,1,0], ["EL","Earned Leave",false,1,0], ["WFH","Work From Home",true,1,0],
  ["HD","Half Day",true,.5,.5], ["ED","Early Departure",true,1,0], ["LHD","Late Arrival-Half Day",true,.5,.5],
  ["WFH+WFO","Half WFH and Half WFO",true,1,0], ["COMP-OFF","Compensatory Off",false,1,0],
  ["CL-HALF","Casual Leave (Half Day)",false,1,0], ["SL-HALF","Sick Leave (Half Day)",false,1,0],
  ["WFH-HD","WFH with Half Day",true,.5,.5],
].map(([code,name,requiresTime,paid,unpaid], index) => ({ code:code as string, name:name as string, requiresTime:requiresTime as boolean, paidDayFraction:paid as number, unpaidDayFraction:unpaid as number, isActive:true, isSystem:true, sortOrder:index }));
type PenaltyPolicy={id?:string;name:string;combinedLhdEdMonthlyLimit:number;isEnabled:boolean;requiresHrApproval:boolean;defaultDecision:string;effectiveFrom:string;effectiveTo?:string;version:number};

export default function AttendanceStatusSettings() {
  const [items,setItems]=useState<AttendanceStatusSetting[]>([]); const [draft,setDraft]=useState(empty);
  const [policy,setPolicy]=useState<PenaltyPolicy>({name:"Combined LHD + ED monthly limit",combinedLhdEdMonthlyLimit:2,isEnabled:true,requiresHrApproval:true,defaultDecision:"REVIEW_REQUIRED",effectiveFrom:new Date().toISOString().slice(0,10),version:1});
  const [offDays,setOffDays]=useState<number[]>([0,6]);
  const load=async()=>{ try { const result=(await getRequest<ResponseData<AttendanceStatusSetting>>("api/attendance-status-settings?activeOnly=false")).data.methodResults ?? []; setItems(result.length ? result : defaultStatuses); } catch { setItems(defaultStatuses); toast.error("Unable to load saved settings. Showing defaults."); } };
  const loadPolicy=async()=>{try{const {data}=await getRequest<PenaltyPolicy>("api/attendance/penalty/policy");setPolicy({...data,effectiveFrom:data.effectiveFrom.slice(0,10)});}catch{toast.error("Unable to load attendance penalty policy.");}};
  const loadWeeklyOffs=async()=>{try{const {data}=await getRequest<{offDays:number[]}>("api/attendance/weekly-offs");setOffDays(data.offDays);}catch{setOffDays([0,6]);}};
  useEffect(()=>{ void load(); void loadPolicy(); void loadWeeklyOffs(); },[]);
  const save=async(item:AttendanceStatusSetting)=>{ const {data}=await postRequest<AttendanceStatusSetting,{success:boolean}>("api/attendance-status-settings",item); if(data.success){toast.success("Attendance status saved."); setDraft(empty); await load();} };
  const savePolicy=async()=>{const {data}=await postRequest<PenaltyPolicy,{success:boolean;message:string}>("api/attendance/penalty/policy",policy);data.success?toast.success("Policy saved."):toast.error(data.message);};
  const saveWeeklyOffs=async()=>{const {data}=await postRequest<{offDays:number[]},{success:boolean;message:string}>("api/attendance/weekly-offs",{offDays});data.success?toast.success("Weekly offs saved."):toast.error(data.message);};
  return <Card className="p-6"><Stack spacing={3}><Typography variant="h4">Attendance Status Settings</Typography>
    <Stack direction="row" spacing={2} flexWrap="wrap"><TextField label="Code" value={draft.code} onChange={e=>setDraft({...draft,code:e.target.value.toUpperCase()})}/><TextField label="Name" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/><TextField label="Paid day" type="number" inputProps={{min:0,max:1,step:.5}} value={draft.paidDayFraction} onChange={e=>setDraft({...draft,paidDayFraction:+e.target.value})}/><TextField label="Unpaid day" type="number" inputProps={{min:0,max:1,step:.5}} value={draft.unpaidDayFraction} onChange={e=>setDraft({...draft,unpaidDayFraction:+e.target.value})}/><FormControlLabel control={<Checkbox checked={draft.requiresTime} onChange={e=>setDraft({...draft,requiresTime:e.target.checked})}/>} label="Requires time"/><Button startIcon={<Add/>} variant="contained" disabled={!draft.code.trim()||!draft.name.trim()} onClick={()=>void save(draft)}>Add</Button></Stack>
    {items.map(item=><Stack key={item.id??item.code} direction="row" spacing={2} alignItems="center" sx={{borderBottom:1,borderColor:"divider",py:1}}><Typography sx={{width:130}}>{item.code}</Typography><TextField size="small" value={item.name} onChange={e=>setItems(v=>v.map(x=>x.code===item.code?{...x,name:e.target.value}:x))}/><FormControlLabel control={<Switch checked={item.isActive} onChange={e=>void save({...item,isActive:e.target.checked})}/>} label={item.isActive?"Active":"Inactive"}/><Typography>Paid: {item.paidDayFraction}</Typography><Typography>Unpaid: {item.unpaidDayFraction}</Typography><Button onClick={()=>void save(item)}>Save</Button></Stack>)}
    <Typography variant="h5">Weekly Off Days</Typography><Typography color="text.secondary">These days appear as Off in the attendance calendar. Add emergency or company holidays from the Calendar page.</Typography><Stack direction="row" spacing={1} flexWrap="wrap">{["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((name,index)=><FormControlLabel key={name} control={<Checkbox checked={offDays.includes(index)} onChange={e=>setOffDays(v=>e.target.checked?[...v,index]:v.filter(x=>x!==index))}/>} label={name}/>)}<Button variant="contained" disabled={offDays.length===0} onClick={()=>void saveWeeklyOffs()}>Save Weekly Offs</Button></Stack>
    <Typography variant="h5">Payroll Penalty Policy</Typography><Typography color="text.secondary">Exceeded-limit penalties always require an audited HR/Admin decision before payroll.</Typography><Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center"><TextField label="Combined LHD + ED monthly limit" type="number" value={policy.combinedLhdEdMonthlyLimit} onChange={e=>setPolicy({...policy,combinedLhdEdMonthlyLimit:+e.target.value})}/><TextField label="Effective from" type="date" InputLabelProps={{shrink:true}} value={policy.effectiveFrom} onChange={e=>setPolicy({...policy,effectiveFrom:e.target.value})}/><FormControlLabel control={<Switch checked={policy.isEnabled} onChange={e=>setPolicy({...policy,isEnabled:e.target.checked})}/>} label="Enabled"/><Button variant="contained" onClick={()=>void savePolicy()}>Save Policy</Button></Stack>
  </Stack></Card>;
}
