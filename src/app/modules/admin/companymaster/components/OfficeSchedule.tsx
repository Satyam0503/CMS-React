import {
  AccessTimeRounded,
  AlarmOnRounded,
  CheckCircleRounded,
  CoffeeRounded,
  DeleteOutlineRounded,
  InfoOutlined,
  LoginRounded,
  LogoutRounded,
  SaveRounded,
  TimerRounded,
} from "@mui/icons-material";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Stack,
  Select,
  TextField,
  Typography,
  Tooltip,
  alpha,
} from "@mui/material";
import { AddRounded, ExpandMoreRounded } from "@mui/icons-material";
import { createPortal } from "react-dom";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { deleteRequest, getRequest, putRequest } from "../../../../../server/axios";
import { AppButton } from "../../../../shared/components/ui";
import { ConfirmationModal } from "../../../../shared/components/ConfirmModal";

type OfficeScheduleForm = {
  scheduleId?: string;
  name: string;
  standardCheckIn: string;
  standardCheckOut: string;
  checkInAllowedFrom: string;
  checkInAllowedUntil: string;
  checkOutAllowedFrom: string;
  checkOutAllowedUntil: string;
  graceMinutes: number;
  breakMinutes: number;
  requiredWorkingMinutes: number;
  isDefault?: boolean;
  isActive?: boolean;
};

type DepartmentOption = { departmentId: string; titles: Record<string, string> };
type DepartmentShiftAssignment = { departmentId: string; scheduleId?: string };

const initial: OfficeScheduleForm = {
  name: "Standard Office Schedule",
  standardCheckIn: "09:00",
  standardCheckOut: "18:00",
  checkInAllowedFrom: "08:30",
  checkInAllowedUntil: "10:00",
  checkOutAllowedFrom: "17:30",
  checkOutAllowedUntil: "19:00",
  graceMinutes: 0,
  breakMinutes: 60,
  requiredWorkingMinutes: 480,
};

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes)
    ? hours * 60 + minutes
    : 0;
};

const formatTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12;
  return `${twelveHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const formatMinutes = (minutes: number) => {
  const safeMinutes = Math.max(0, minutes || 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainder = safeMinutes % 60;
  return `${hours}h${remainder ? ` ${remainder}m` : ""}`;
};

const ScheduleMetric = ({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 1, sm: 1.25 },
      height: "100%",
      borderRadius: 2,
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035),
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 32,
          height: 32,
          borderRadius: 1.5,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700} noWrap>
          {label}
        </Typography>
        <Typography fontWeight={800} noWrap>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: "none", sm: "block" } }}>
          {detail}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

export const OfficeSchedule = () => {
  const [form, setForm] = useState<OfficeScheduleForm>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingScheduleId, setRemovingScheduleId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<OfficeScheduleForm[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [departmentAssignments, setDepartmentAssignments] = useState<DepartmentShiftAssignment[]>([]);
  const [savingDepartmentId, setSavingDepartmentId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [editorHost, setEditorHost] = useState<HTMLDivElement | null>(null);
  const [schedulePendingDelete, setSchedulePendingDelete] = useState<OfficeScheduleForm | null>(null);
  const visibleSchedules = form.scheduleId
    ? schedules
    : [...schedules, { ...form, scheduleId: "new" }];
  const nextShiftNumber = useMemo(
    () => Math.max(0, ...schedules.map((item) => Number(/^Shift\s+(\d+)$/i.exec(item.name)?.[1]) || 0)) + 1,
    [schedules],
  );

  const set = <K extends keyof OfficeScheduleForm>(
    key: K,
    value: OfficeScheduleForm[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const loadSchedules = useCallback(async (selectedScheduleId?: string) => {
    const { data } = await getRequest<any>("api/CompanyMaster/OfficeSchedules");
    if (!data.success) throw new Error(data.message || "Office schedules could not be loaded.");
    const items = data.methodResults ?? [];
    setSchedules(items);
    const selected = items.find((item: OfficeScheduleForm) => item.scheduleId === selectedScheduleId)
      ?? items.find((item: OfficeScheduleForm) => item.isDefault)
      ?? items[0];
    if (selected) { setForm(selected); setExpanded(selected.scheduleId ?? false); }
  }, []);

  useEffect(() => {
    loadSchedules()
      .catch(() => toast.error("Office schedule could not be loaded."))
      .finally(() => setLoading(false));
  }, [loadSchedules]);

  useEffect(() => {
    Promise.all([
      getRequest<any>("api/CompanyMaster/GetDepartmentList?isActive=true"),
      getRequest<any>("api/CompanyMaster/DepartmentOfficeScheduleAssignments"),
    ])
      .then(([departmentsResponse, assignmentsResponse]) => {
        if (departmentsResponse.data.success) setDepartments(departmentsResponse.data.methodResults ?? []);
        if (assignmentsResponse.data.success) setDepartmentAssignments(assignmentsResponse.data.methodResults ?? []);
      })
      .catch(() => toast.error("Department shift assignments could not be loaded."));
  }, []);

  const schedule = useMemo(() => {
    const start = toMinutes(form.standardCheckIn);
    let end = toMinutes(form.standardCheckOut);
    if (end < start) end += 24 * 60;
    const span = end - start;
    const available = Math.max(0, span - Number(form.breakMinutes || 0));
    const required = Number(form.requiredWorkingMinutes || 0);
    return {
      span,
      available,
      required,
      isWorkTargetValid: required <= available,
    };
  }, [form.breakMinutes, form.requiredWorkingMinutes, form.standardCheckIn, form.standardCheckOut]);

  const duplicateTimingSchedule = useMemo(
    () => schedules.find((item) =>
      item.scheduleId !== form.scheduleId &&
      item.standardCheckIn === form.standardCheckIn &&
      item.standardCheckOut === form.standardCheckOut,
    ),
    [form.scheduleId, form.standardCheckIn, form.standardCheckOut, schedules],
  );

  const save = async () => {
    if (duplicateTimingSchedule) {
      toast.error(`This timing is already used by ${duplicateTimingSchedule.name}. Choose a different punch-in or punch-out time.`);
      return;
    }
    setSaving(true);
    try {
      const { data } = await putRequest<OfficeScheduleForm, any>(
        "api/CompanyMaster/OfficeSchedule",
        form,
      );
      if (!data.success) throw new Error(data.message);
      const saved = data.methodResult ?? form;
      await loadSchedules(saved.scheduleId);
      toast.success(
        `Office schedule saved. Automatic Present starts at ${formatTime(saved.standardCheckIn)} on working days.`,
      );
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message;
      toast.error(message === "OFFICE_SCHEDULE_TIMING_EXISTS"
        ? "Another shift already uses this punch-in and punch-out timing."
        : message || "Office schedule could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async () => {
    const selected = schedulePendingDelete;
    if (!selected?.scheduleId || selected.scheduleId === "new" || selected.isDefault) return;

    setDeleting(true);
    setRemovingScheduleId(selected.scheduleId);
    try {
      const { data } = await deleteRequest<{ success: boolean; message?: string }>(
        `api/CompanyMaster/OfficeSchedule/${encodeURIComponent(selected.scheduleId)}`,
      );
      if (!data.success) throw new Error(data.message || "Office schedule could not be deleted.");
      setSchedulePendingDelete(null);
      setExpanded(false);
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      setSchedules((current) => current.filter((schedule) => schedule.scheduleId !== selected.scheduleId));
      await loadSchedules();
      toast.success("Office schedule deleted.");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message;
      toast.error(
        message === "OFFICE_SCHEDULE_IN_USE"
          ? "This shift is assigned to employees or departments. Reassign it before deleting."
          : message || "Office schedule could not be deleted.",
      );
    } finally {
      setDeleting(false);
      setRemovingScheduleId(null);
    }
  };

  const saveDepartmentAssignment = async (departmentId: string, scheduleId: string) => {
    setSavingDepartmentId(departmentId);
    try {
      const { data } = await putRequest<{ scheduleId?: string }, any>(
        `api/CompanyMaster/DepartmentOfficeScheduleAssignment/${encodeURIComponent(departmentId)}`,
        { scheduleId: scheduleId || undefined },
      );
      if (!data.success) throw new Error(data.message || "Department shift assignment could not be saved.");
      setDepartmentAssignments((current) => [
        ...current.filter((item) => item.departmentId !== departmentId),
        { departmentId, scheduleId: scheduleId || undefined },
      ]);
      toast.success("Department shift assignment updated.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Department shift assignment could not be saved.");
    } finally {
      setSavingDepartmentId(null);
    }
  };

  if (loading)
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5, md: 3.5 },
        borderRadius: { xs: 2.5, md: 3.5 },
        width: "100%",
        overflow: "hidden",
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${theme.palette.background.paper} 38%)`,
      }}
    >
      <Stack spacing={{ xs: 2.25, md: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1.25}>
          <Typography variant="h6" fontWeight={800}>Shifts</Typography>
          <AppButton size="small" startIcon={<AddRounded />} disabled={!form.scheduleId} sx={{ alignSelf: { xs: "stretch", sm: "auto" } }} onClick={() => { setForm({ ...initial, name: `Shift ${nextShiftNumber}`, isActive: true, isDefault: schedules.length === 0 }); setExpanded("new"); }}>Add shift</AppButton>
        </Stack>
        <Stack spacing={1}>
          {visibleSchedules.map((item) => (
            <Accordion key={item.scheduleId} expanded={expanded === item.scheduleId} onChange={(_, value) => { setExpanded(value ? item.scheduleId ?? false : false); if (value && item.scheduleId !== "new") setForm(item); }} sx={{ overflow: "hidden", transition: "opacity 220ms ease, transform 220ms ease, max-height 220ms ease, margin 220ms ease", ...(removingScheduleId === item.scheduleId ? { opacity: 0, transform: "translateX(16px) scale(0.98)", maxHeight: 0, mb: -1, pointerEvents: "none" } : {}), "& .MuiAccordionSummary-content": { minWidth: 0, my: 1.25 } }}>
              <AccordionSummary expandIcon={<ExpandMoreRounded />} sx={{ px: { xs: 1.5, sm: 2 }, "& .MuiAccordionSummary-content": { mr: 0 } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", alignItems: "center", columnGap: { xs: 0.75, sm: 1.25 }, width: "100%", minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flexWrap: "wrap" }}>
                    <Typography fontWeight={750} noWrap>{item.name}</Typography>
                    {item.isDefault && <Chip size="small" color="primary" label="Default" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: { xs: 12, sm: 14 } }}>{formatTime(item.standardCheckIn)} - {formatTime(item.standardCheckOut)}</Typography>
                  <Box sx={{ width: 32, height: 32, display: "grid", placeItems: "center" }}>
                    {!item.isDefault && item.scheduleId !== "new" && <Tooltip title="Delete shift"><IconButton aria-label={`Delete ${item.name}`} color="error" size="small" onClick={(event) => { event.stopPropagation(); setSchedulePendingDelete(item); }} sx={{ width: 32, height: 32, p: 0.5, border: 0, bgcolor: "transparent", transition: "transform 160ms ease, background-color 160ms ease", "&:hover": { bgcolor: (theme) => alpha(theme.palette.error.main, 0.1), transform: "rotate(-10deg) scale(1.12)" } }}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">{item.scheduleId === "new" ? "Configure this new shift using the same attendance fields below, then save it." : `Punch in: ${formatTime(item.checkInAllowedFrom)} - ${formatTime(item.checkInAllowedUntil)} · Punch out: ${formatTime(item.checkOutAllowedFrom)} - ${formatTime(item.checkOutAllowedUntil)} · Break: ${formatMinutes(item.breakMinutes)} · Required work: ${formatMinutes(item.requiredWorkingMinutes)}`}</Typography>
                {expanded === item.scheduleId && <Box ref={setEditorHost} sx={{ mt: 2 }} />}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
        {departments.length > 0 && (
          <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.78) }}>
            <Stack spacing={0.5} sx={{ mb: 1.5 }}>
              <Typography fontWeight={800}>Department shift allocation</Typography>
              <Typography variant="body2" color="text.secondary">Applies to department employees unless an individual employee override is set.</Typography>
            </Stack>
            <Grid container spacing={1.25}>
              {departments.map((department) => {
                const selectedScheduleId = departmentAssignments.find((item) => item.departmentId === department.departmentId)?.scheduleId ?? "";
                const departmentName = Object.values(department.titles ?? {})[0] || "Department";
                return <Grid key={department.departmentId} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <FormControl fullWidth size="small" disabled={savingDepartmentId === department.departmentId}>
                    <InputLabel id={`department-shift-${department.departmentId}`}>{departmentName}</InputLabel>
                    <Select labelId={`department-shift-${department.departmentId}`} label={departmentName} value={selectedScheduleId} onChange={(event) => void saveDepartmentAssignment(department.departmentId, event.target.value)}>
                      <MenuItem value=""><em>Use company default</em></MenuItem>
                      {schedules.map((schedule) => <MenuItem key={schedule.scheduleId} value={schedule.scheduleId}>{schedule.name} ({formatTime(schedule.standardCheckIn)} - {formatTime(schedule.standardCheckOut)})</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>;
              })}
            </Grid>
          </Paper>
        )}
        {expanded && editorHost && createPortal(
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2.25, md: 3 },
              borderRadius: 2.5,
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.common.black, 0.06)}`,
              containerType: "inline-size",
            }}
          >
            <Stack spacing={{ xs: 1.5, md: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "flex-start" }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: (theme) => `0 10px 22px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              <AccessTimeRounded />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={850} lineHeight={1.15}>
                Office schedule
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Attendance timing and work rules.
              </Typography>
            </Box>
          </Stack>
          <FormControlLabel
            label={form.isDefault ? "Company default" : "Make default"}
            control={<Checkbox checked={Boolean(form.isDefault)} disabled={Boolean(form.isDefault)} onChange={(event) => set("isDefault", event.target.checked)} />}
            sx={{ m: 0, "& .MuiFormControlLabel-label": { fontSize: 13, fontWeight: 750 } }}
          />
        </Stack>

        <Alert
          icon={<InfoOutlined fontSize="inherit" />}
          severity={schedule.isWorkTargetValid ? "info" : "warning"}
          sx={{ borderRadius: 2, alignItems: "center", py: 0.25, "& .MuiAlert-message": { py: 0.5, fontSize: 13 } }}
        >
          <Typography component="span" fontWeight={750}>
            Automatic Present starts at {formatTime(form.standardCheckIn)}
          </Typography>
          {" on working days. Existing manual, Leave and WFH records are unchanged."}
          {!schedule.isWorkTargetValid &&
            " The required working time is greater than the available scheduled time after breaks."}
        </Alert>

        {duplicateTimingSchedule && (
          <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
            <Typography component="span" fontWeight={750}>Duplicate office timing.</Typography>
            {` ${duplicateTimingSchedule.name} already uses ${formatTime(form.standardCheckIn)} - ${formatTime(form.standardCheckOut)}. Change either standard time before saving.`}
          </Alert>
        )}

        <Grid container spacing={1}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <ScheduleMetric icon={<AlarmOnRounded fontSize="small" />} label="Automatic Present" value={formatTime(form.standardCheckIn)} detail="Effective office start" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <ScheduleMetric icon={<TimerRounded fontSize="small" />} label="Scheduled span" value={formatMinutes(schedule.span)} detail={`${formatTime(form.standardCheckIn)} – ${formatTime(form.standardCheckOut)}`} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <ScheduleMetric icon={<CoffeeRounded fontSize="small" />} label="Break allowance" value={formatMinutes(Number(form.breakMinutes))} detail={`${formatMinutes(schedule.available)} available time`} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <ScheduleMetric icon={<CheckCircleRounded fontSize="small" />} label="Required work" value={formatMinutes(schedule.required)} detail={schedule.isWorkTargetValid ? "Fits the scheduled day" : "Exceeds available time"} />
          </Grid>
        </Grid>

        <Divider />

        <Grid container spacing={{ xs: 1.25, md: 1.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth size="small" label="Schedule name" value={form.name} onChange={(event) => set("name", event.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2.5, height: "100%" }}>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} alignItems="center"><LoginRounded color="primary" fontSize="small" /><Typography fontWeight={800}>Punch-in window</Typography></Stack>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" type="time" label="Allowed from" value={form.checkInAllowedFrom} onChange={(event) => set("checkInAllowedFrom", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" type="time" label="Allowed until" value={form.checkInAllowedUntil} onChange={(event) => set("checkInAllowedUntil", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 12 }}><TextField fullWidth size="small" type="time" label="Automatic present punch-in" value={form.standardCheckIn} onChange={(event) => set("standardCheckIn", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2.5, height: "100%" }}>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} alignItems="center"><LogoutRounded color="primary" fontSize="small" /><Typography fontWeight={800}>Punch-out window</Typography></Stack>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" type="time" label="Allowed from" value={form.checkOutAllowedFrom} onChange={(event) => set("checkOutAllowedFrom", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" type="time" label="Allowed until" value={form.checkOutAllowedUntil} onChange={(event) => set("checkOutAllowedUntil", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 12 }}><TextField fullWidth size="small" type="time" label="Standard punch-out" value={form.standardCheckOut} onChange={(event) => set("standardCheckOut", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth size="small" type="number" label="LHD/ED grace (min)" value={form.graceMinutes} onChange={(event) => set("graceMinutes", Number(event.target.value))} inputProps={{ min: 0, max: 180 }} /></Grid>
          <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth size="small" type="number" label="Break (min)" value={form.breakMinutes} onChange={(event) => set("breakMinutes", Number(event.target.value))} inputProps={{ min: 0, max: 180 }} /></Grid>
          <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth size="small" type="number" label="Required work (min)" value={form.requiredWorkingMinutes} onChange={(event) => set("requiredWorkingMinutes", Number(event.target.value))} inputProps={{ min: 0, max: 1440 }} error={!schedule.isWorkTargetValid} /></Grid>
        </Grid>

        <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
          <Typography variant="caption" color="text.secondary">
            Applies on the next scheduler run.
          </Typography>
          <AppButton variant="contained" size="small" startIcon={<SaveRounded />} onClick={save} disabled={saving || !schedule.isWorkTargetValid || Boolean(duplicateTimingSchedule)} sx={{ px: 1.5, minHeight: 36, alignSelf: { xs: "stretch", sm: "auto" } }}>
            {saving ? "Saving..." : "Save schedule"}
          </AppButton>
        </Stack>
            </Stack>
          </Paper>,
          editorHost,
        )}
      </Stack>
      {schedulePendingDelete && <ConfirmationModal open confirming={deleting} title={`Delete ${schedulePendingDelete.name}?`} content="This shift will no longer be available for future attendance scheduling. Default shifts cannot be deleted." handleClose={() => !deleting && setSchedulePendingDelete(null)} handleConfirmation={() => void deleteSchedule()} />}
    </Paper>
  );
};
