import { CalendarTodayOutlined, EditOutlined, ScheduleOutlined } from "@mui/icons-material";
import { Box, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography, alpha } from "@mui/material";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getRequest, putRequest } from "../../../../server/axios";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { AppButton } from "../../../shared/components/ui";
import { useUserDetails } from "../UserDataProvider";

type OfficeSchedule = { scheduleId: string; name: string; standardCheckIn: string; standardCheckOut: string };
type OfficeScheduleAssignment = { scheduleId?: string; employeeOverrideScheduleId?: string; scheduleName?: string; startTime?: string; endTime?: string; workingDays?: number[]; source: string };

const formatTime = (value?: string) => {
  if (!value) return "";
  const [hours, minutes = "00"] = value.split(":");
  const hour = Number(hours);
  if (!Number.isFinite(hour)) return value;
  return `${String(((hour + 11) % 12) + 1).padStart(2, "0")}:${minutes.padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
};

const formatWorkingDays = (workingDays?: number[]) => {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (!workingDays?.length) return "Working days unavailable";
  if (workingDays.length === 5 && workingDays.every((day, index) => day === index + 1)) return "Mon – Fri";
  return workingDays.map((day) => labels[day]).filter(Boolean).join(" · ");
};

export const WorkShiftCard = ({ actionTarget }: { actionTarget?: HTMLElement | null }) => {
  const employeeId = useParams().employeeid;
  const { userDetails } = useUserDetails();
  const permissions = useAppSelector((state) => state.user.userData?.modulePermission) || [];
  const isFormerEmployee = userDetails?.employmentStatus === "Resigned" || userDetails?.employmentStatus === "Terminated";
  const canManage = Boolean(!isFormerEmployee && employeeId && hasModuleFeaturePermission(ModulesName.Employees, Permission.Edit, permissions));
  const [assignment, setAssignment] = useState<OfficeScheduleAssignment | null>();
  const [schedules, setSchedules] = useState<OfficeSchedule[]>([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    // A completed employee is not part of the current workforce roster. Do not
    // call the assignment API (or display its error) for former employees.
    if (isFormerEmployee) { setAssignment(null); setSchedules([]); return; }
    if (!userDetails?.userId) return;
    setAssignment(undefined);
    try {
      const [assignmentResponse, schedulesResponse] = await Promise.all([
        getRequest<any>(canManage
          ? `api/User/OfficeScheduleAssignment/${encodeURIComponent(userDetails.userId)}`
          : "api/User/MyOfficeScheduleAssignment"),
        canManage ? getRequest<any>("api/User/AvailableOfficeSchedules") : Promise.resolve(null),
      ]);
      if (!assignmentResponse.data.success) throw new Error(assignmentResponse.data.message || "Unable to load the employee shift.");
      setAssignment(assignmentResponse.data.methodResult ?? null);
      if (schedulesResponse?.data.success) setSchedules(schedulesResponse.data.methodResults ?? []);
    } catch {
      setAssignment(null);
      toast.error("Unable to load the employee shift assignment.");
    }
  };

  useEffect(() => { void load(); }, [employeeId, userDetails?.userId, userDetails?.employmentStatus, canManage]);

  const save = async () => {
    if (!userDetails?.userId || !assignment) return;
    setSaving(true);
    try {
      const { data } = await putRequest<{ scheduleId?: string }, any>(
        `api/User/OfficeScheduleAssignment/${encodeURIComponent(userDetails.userId)}`,
        { scheduleId: assignment.employeeOverrideScheduleId || undefined },
      );
      if (!data.success) throw new Error(data.message || "Unable to update the employee shift.");
      setAssignment(data.methodResult);
      setOpen(false);
      toast.success("Employee shift assignment updated.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Unable to update the employee shift.");
    } finally {
      setSaving(false);
    }
  };

  const timing = assignment?.startTime && assignment?.endTime
    ? `${formatTime(assignment.startTime)} – ${formatTime(assignment.endTime)}`
    : "Timing unavailable";
  const workingDays = formatWorkingDays(assignment?.workingDays);

  if (isFormerEmployee) return null;

  const scheduleButton = <AppButton fullWidth variant="outlined" size="small" startIcon={<Box sx={{ width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 1.75, color: "primary.main", bgcolor: (theme) => alpha(theme.palette.primary.main, .08) }}><ScheduleOutlined fontSize="small" /></Box>} endIcon={canManage ? <IconButton aria-label="Edit work schedule" size="small" onClick={(event) => { event.stopPropagation(); setOpen(true); }} sx={{ opacity: 0, color: "primary.main", transition: "opacity .2s ease, transform .2s ease", "&:hover": { transform: "scale(1.08)" } }}><EditOutlined fontSize="small" /></IconButton> : undefined} disabled={assignment === undefined} onClick={() => setDetailsOpen(true)} aria-label={`View work schedule: ${timing}, ${workingDays}`} sx={{ minHeight: 68, borderRadius: 2.5, px: { xs: 1.25, sm: 1.5 }, justifyContent: "flex-start", textAlign: "left", textTransform: "none", color: "text.secondary", borderColor: "divider", bgcolor: "background.paper", background: "background.paper", transition: "transform .22s ease, box-shadow .22s ease, border-color .22s ease", "& .MuiButton-startIcon": { mt: 0, alignSelf: "center", mr: 1.1 }, "& .MuiButton-endIcon": { marginLeft: "auto" }, "&:hover": { color: "primary.main", borderColor: "primary.light", bgcolor: (theme) => alpha(theme.palette.primary.main, .04), transform: "translateY(-2px)", boxShadow: "0 10px 22px rgba(15,42,58,.11)", "& .MuiButton-endIcon .MuiIconButton-root": { opacity: 1 } } }}>
    <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
      <Typography variant="body2" fontWeight={800} noWrap>Work schedule</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: .35, whiteSpace: { xs: "normal", sm: "nowrap" }, overflowWrap: "anywhere" }}>{assignment === undefined ? "Loading shift details…" : `${timing} · ${workingDays}`}</Typography>
    </Box>
  </AppButton>;

  return <>
    {actionTarget ? createPortal(scheduleButton, actionTarget) : scheduleButton}
    <CustomisedModal open={detailsOpen} handleClose={() => setDetailsOpen(false)} title={<Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 1.75, bgcolor: (theme) => alpha(theme.palette.primary.main, .1), color: "primary.main" }}><ScheduleOutlined fontSize="small" /></Box><Box><Typography color="primary.main" fontWeight={800}>Work schedule</Typography><Typography variant="caption" color="text.secondary">Assigned shift details</Typography></Box></Stack>} maxWidth="xs" fullWidth paperSx={{ borderRadius: { xs: 2.5, sm: 3 }, width: { xs: "calc(100% - 32px)", sm: 440 }, maxWidth: "calc(100% - 32px)", boxShadow: "0 24px 60px rgba(15,42,58,.2)" }} contentSx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2.5, sm: 3 } }}>
      <Stack key={detailsOpen ? "schedule-open" : "schedule-closed"} spacing={2.25} sx={{ pt: 1.25, animation: "shiftDetailsEnter .42s ease-out both", "@keyframes shiftDetailsEnter": { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } }, "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}><Box><Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing=".1em" lineHeight={1.4}>ASSIGNED SHIFT</Typography><Typography variant="h6" fontWeight={800} sx={{ mt: .35, letterSpacing: ".01em" }}>{assignment?.scheduleName || "No active shift"}</Typography></Box>{canManage && <AppButton size="small" variant="text" startIcon={<EditOutlined fontSize="small" />} onClick={() => { setDetailsOpen(false); setOpen(true); }} sx={{ minWidth: 0, px: .75, mt: -.25, textTransform: "none", fontWeight: 750, color: "primary.main", transition: "transform .2s ease", "&:hover": { transform: "translateX(2px)" } }}>Edit</AppButton>}</Stack>
        <Stack spacing={1.15}>
          <Stack direction="row" spacing={1.35} alignItems="center" sx={{ p: 1, borderRadius: 2, animation: "shiftRowEnter .45s .08s ease-out both", "@keyframes shiftRowEnter": { from: { opacity: 0, transform: "translateX(-8px)" }, to: { opacity: 1, transform: "translateX(0)" } } }}><Box sx={{ width: 36, height: 36, display: "grid", placeItems: "center", flex: "0 0 auto", borderRadius: 1.75, bgcolor: (theme) => alpha(theme.palette.primary.main, .08), color: "primary.main" }}><ScheduleOutlined fontSize="small" /></Box><Box><Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: .15 }}>Working hours</Typography><Typography variant="body2" fontWeight={750}>{timing}</Typography></Box></Stack>
          <Stack direction="row" spacing={1.35} alignItems="center" sx={{ p: 1, borderRadius: 2, animation: "shiftRowEnter .45s .18s ease-out both" }}><Box sx={{ width: 36, height: 36, display: "grid", placeItems: "center", flex: "0 0 auto", borderRadius: 1.75, bgcolor: (theme) => alpha(theme.palette.primary.main, .08), color: "primary.main" }}><CalendarTodayOutlined fontSize="small" /></Box><Box><Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: .15 }}>Working days</Typography><Typography variant="body2" fontWeight={750}>{workingDays}</Typography></Box></Stack>
        </Stack>
      </Stack>
    </CustomisedModal>
    <CustomisedModal open={open} handleClose={() => !saving && setOpen(false)} title="Employee shift assignment" maxWidth="sm">
      <Stack spacing={2} sx={{ pt: 1, width: "100%" }}>
        <Typography variant="body2" color="text.secondary">An individual shift overrides the department shift. Choose inheritance to use the department shift, then the company default if none is assigned.</Typography>
        <FormControl fullWidth>
          <InputLabel id="employee-shift-label">Shift</InputLabel>
          <Select labelId="employee-shift-label" label="Shift" value={assignment?.employeeOverrideScheduleId || ""} onChange={(event) => setAssignment((current) => ({ ...(current ?? { source: "EmployeeOverride" }), employeeOverrideScheduleId: event.target.value || undefined, source: event.target.value ? "EmployeeOverride" : "DepartmentOrCompanyDefault" }))}>
            <MenuItem value=""><em>Use department or company default</em></MenuItem>
            {schedules.map((schedule) => <MenuItem key={schedule.scheduleId} value={schedule.scheduleId}>{schedule.name} ({formatTime(schedule.standardCheckIn)} – {formatTime(schedule.standardCheckOut)})</MenuItem>)}
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}><AppButton variant="contained" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save shift"}</AppButton></Box>
      </Stack>
    </CustomisedModal>
  </>;
};
