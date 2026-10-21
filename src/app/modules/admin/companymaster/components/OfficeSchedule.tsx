import {
  AccessTimeRounded,
  AddRounded,
  AlarmOnRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  CoffeeRounded,
  DeleteOutlineRounded,
  ExpandMoreRounded,
  HelpOutlineRounded,
  InfoOutlined,
  LoginRounded,
  LogoutRounded,
  SaveRounded,
  ScheduleRounded,
  StarRounded,
  TimerRounded,
  WarningAmberRounded,
  WorkOutlineRounded,
} from "@mui/icons-material";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { deleteRequest, getRequest, postRequest, putRequest } from "../../../../../server/axios";
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

const MetricCard = ({
  icon,
  label,
  value,
  detail,
  isError = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  isError?: boolean;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 1.25, sm: 1.5 },
      height: "100%",
      borderRadius: "12px",
      bgcolor: (theme) =>
        isError
          ? alpha(theme.palette.error.main, 0.05)
          : alpha(theme.palette.primary.main, 0.03),
      borderColor: (theme) =>
        isError ? alpha(theme.palette.error.main, 0.3) : "divider",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        borderColor: (theme) =>
          isError ? "error.main" : alpha(theme.palette.primary.main, 0.4),
        boxShadow: (theme) =>
          `0 4px 12px ${alpha(isError ? theme.palette.error.main : theme.palette.primary.main, 0.08)}`,
      },
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 38,
          height: 38,
          borderRadius: "10px",
          bgcolor: (theme) =>
            isError
              ? alpha(theme.palette.error.main, 0.12)
              : alpha(theme.palette.primary.main, 0.1),
          color: isError ? "error.main" : "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          color={isError ? "error.main" : "text.secondary"}
          fontWeight={700}
          sx={{
            display: "block",
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            lineHeight: 1.2,
            mb: 0.25,
          }}
          noWrap
        >
          {label}
        </Typography>
        <Typography
          fontWeight={800}
          color={isError ? "error.main" : "text.primary"}
          sx={{
            fontSize: { xs: "0.95rem", sm: "1.05rem" },
            lineHeight: 1.2,
          }}
          noWrap
        >
          {value}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            fontSize: "0.7rem",
            mt: 0.25,
          }}
          noWrap
        >
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
  const [savingDepartmentAssignments, setSavingDepartmentAssignments] = useState(false);
  const [draftDepartmentIds, setDraftDepartmentIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [schedulePendingDelete, setSchedulePendingDelete] = useState<OfficeScheduleForm | null>(null);
  const [offDays, setOffDays] = useState<number[]>([0, 6]);
  const [savingOffDays, setSavingOffDays] = useState(false);

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
    if (selected) {
      setForm(selected);
      setExpanded(selected.scheduleId ?? false);
    }
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

  useEffect(() => {
    getRequest<{ offDays: number[] }>("api/attendance/weekly-offs")
      .then(({ data }) => setOffDays(data.offDays ?? [0, 6]))
      .catch(() => toast.error("Weekly off days could not be loaded."));
  }, []);

  const saveWeeklyOffs = async () => {
    if (offDays.length === 0) {
      toast.error("Select at least one weekly off day.");
      return;
    }
    setSavingOffDays(true);
    try {
      const { data } = await postRequest<{ offDays: number[] }, any>("api/attendance/weekly-offs", { offDays });
      if (!data.success) throw new Error(data.message || "Weekly off days could not be saved.");
      toast.success("Weekly off days saved successfully.");
    } catch (error) {
      toast.error((error as Error).message || "Weekly off days could not be saved.");
    } finally {
      setSavingOffDays(false);
    }
  };

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

  const assignedDepartmentIds = useMemo(
    () => form.scheduleId
      ? departmentAssignments
        .filter((assignment) => assignment.scheduleId === form.scheduleId)
        .map((assignment) => assignment.departmentId)
      : [],
    [departmentAssignments, form.scheduleId],
  );

  useEffect(() => {
    setDraftDepartmentIds(assignedDepartmentIds);
  }, [assignedDepartmentIds]);

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
      if (saved.scheduleId && !await saveScheduleDepartmentAssignments(saved.scheduleId, draftDepartmentIds)) {
        return;
      }
      await loadSchedules(saved.scheduleId);
      toast.success(
        `Shift saved successfully. Automatic present starts at ${formatTime(saved.standardCheckIn)}.`,
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

  const saveScheduleDepartmentAssignments = async (scheduleId: string, selectedDepartmentIds: string[]): Promise<boolean> => {
    const selected = new Set(selectedDepartmentIds);
    const updates = departments
      .map((department) => ({
        departmentId: department.departmentId,
        scheduleId: departmentAssignments.find((assignment) => assignment.departmentId === department.departmentId)?.scheduleId ?? "",
      }))
      .filter((assignment) => (assignment.scheduleId === scheduleId) !== selected.has(assignment.departmentId));

    if (updates.length === 0) return true;
    setSavingDepartmentAssignments(true);
    try {
      await Promise.all(updates.map(async (assignment) => {
        const { data } = await putRequest<{ scheduleId?: string }, any>(
          `api/CompanyMaster/DepartmentOfficeScheduleAssignment/${encodeURIComponent(assignment.departmentId)}`,
          { scheduleId: selected.has(assignment.departmentId) ? scheduleId : undefined },
        );
        if (!data.success) throw new Error(data.message || "Department shift assignment could not be saved.");
      }));
      setDepartmentAssignments((current) => [
        ...current.filter((item) => !updates.some((update) => update.departmentId === item.departmentId)),
        ...updates.map((assignment) => ({
          departmentId: assignment.departmentId,
          scheduleId: selected.has(assignment.departmentId) ? scheduleId : undefined,
        })),
      ]);
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Department shift assignment could not be saved.");
      return false;
    } finally {
      setSavingDepartmentAssignments(false);
    }
  };

  const getDepartmentCount = (scheduleId?: string) => {
    if (!scheduleId || scheduleId === "new") return 0;
    return departmentAssignments.filter((a) => a.scheduleId === scheduleId).length;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}>
        <CircularProgress size={36} thickness={4} />
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ width: "100%", minWidth: 0, flexGrow: 1 }}>
      {/* Shifts Section */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: { xs: 2.5, sm: 3 },
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 10px 28px rgba(24, 74, 82, .07)",
          width: "100%",
          minWidth: 0,
        }}
      >
        <Stack spacing={2.5}>
          {/* Header Row */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Box>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ScheduleRounded sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.015em" }}>
                    Work Shifts & Hours
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage shift timings, arrival/departure tolerance, and department allocations.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <AppButton
              size="medium"
              startIcon={<AddRounded />}
              disabled={!form.scheduleId}
              onClick={() => {
                setForm({
                  ...initial,
                  name: `Shift ${nextShiftNumber}`,
                  isActive: true,
                  isDefault: schedules.length === 0,
                });
                setExpanded("new");
              }}
              sx={{
                borderRadius: "10px",
                px: 2.25,
                fontWeight: 700,
                textTransform: "none",
                alignSelf: { xs: "stretch", sm: "auto" },
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              Add Shift
            </AppButton>
          </Stack>

          {/* Shift Accordion List */}
          <Stack spacing={1.5}>
            {visibleSchedules.map((item) => {
              const isItemExpanded = expanded === item.scheduleId;
              const deptCount = getDepartmentCount(item.scheduleId);

              return (
                <Accordion
                  key={item.scheduleId}
                  expanded={isItemExpanded}
                  onChange={(_, value) => {
                    setExpanded(value ? item.scheduleId ?? false : false);
                    if (value && item.scheduleId !== "new") setForm(item);
                  }}
                  disableGutters
                  sx={{
                    borderRadius: "14px !important",
                    border: "1px solid",
                    borderColor: isItemExpanded ? "primary.main" : "divider",
                    bgcolor: isItemExpanded
                      ? (theme) => alpha(theme.palette.primary.main, 0.015)
                      : "background.paper",
                    overflow: "hidden",
                    boxShadow: isItemExpanded
                      ? (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`
                      : "none",
                    transition: "all 0.22s ease-in-out",
                    "&:before": { display: "none" },
                    ...(removingScheduleId === item.scheduleId
                      ? { opacity: 0, transform: "translateX(16px)", maxHeight: 0, pointerEvents: "none" }
                      : {}),
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreRounded
                        sx={{
                          color: isItemExpanded ? "primary.main" : "text.secondary",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    }
                    sx={{
                      px: { xs: 1.5, sm: 2.25 },
                      py: 0.5,
                      "& .MuiAccordionSummary-content": { my: 1, minWidth: 0 },
                    }}
                  >
                    <Box sx={{ width: "100%", minWidth: 0 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                      >
                        {/* Title and Badges */}
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography fontWeight={750} sx={{ fontSize: "0.95rem" }}>
                            {item.name}
                          </Typography>
                          {item.isDefault && (
                            <Chip
                              size="small"
                              icon={<StarRounded sx={{ fontSize: "15px !important", color: "inherit" }} />}
                              label="Default Shift"
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
                                color: "warning.dark",
                                border: "1px solid",
                                borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
                              }}
                            />
                          )}
                          <Chip
                            size="small"
                            label={deptCount === 0 ? "All Departments" : `${deptCount} Department${deptCount === 1 ? "" : "s"}`}
                            variant="outlined"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              borderColor: "divider",
                              color: "text.secondary",
                            }}
                          />
                        </Stack>

                        {/* Timing Badge and Delete */}
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.75,
                              px: 1.25,
                              py: 0.4,
                              borderRadius: "8px",
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                              color: "primary.main",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                            }}
                          >
                            <AccessTimeRounded sx={{ fontSize: 16 }} />
                            {formatTime(item.standardCheckIn)} – {formatTime(item.standardCheckOut)}
                          </Box>

                          {!item.isDefault && item.scheduleId !== "new" && (
                            <Tooltip title="Delete shift" arrow>
                              <IconButton
                                aria-label={`Delete ${item.name}`}
                                color="error"
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSchedulePendingDelete(item);
                                }}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "8px",
                                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                  "&:hover": {
                                    bgcolor: "error.main",
                                    color: "common.white",
                                    transform: "scale(1.05)",
                                  },
                                  transition: "all 0.18s ease",
                                }}
                              >
                                <DeleteOutlineRounded sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>

                      {/* Collapsed Subtitle Preview */}
                      {!isItemExpanded && item.scheduleId !== "new" && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mt: 0.75,
                            fontSize: "0.76rem",
                          }}
                        >
                          Punch In: {formatTime(item.checkInAllowedFrom)} - {formatTime(item.checkInAllowedUntil)} · Punch Out: {formatTime(item.checkOutAllowedFrom)} - {formatTime(item.checkOutAllowedUntil)} · Break: {formatMinutes(item.breakMinutes)} · Required: {formatMinutes(item.requiredWorkingMinutes)}
                        </Typography>
                      )}
                    </Box>
                  </AccordionSummary>

                  {/* Expanded Form Details */}
                  <AccordionDetails sx={{ px: { xs: 1.5, sm: 2.5 }, pb: 2.5, pt: 1 }}>
                    <Divider sx={{ mb: 2.5 }} />
                    <Stack spacing={2.5}>
                      {/* Duplicate Timing Warning */}
                      {duplicateTimingSchedule && (
                        <Alert
                          severity="warning"
                          icon={<WarningAmberRounded />}
                          sx={{ borderRadius: "12px", border: "1px solid", borderColor: "warning.light" }}
                        >
                          <Typography variant="body2" fontWeight={750} component="span">
                            Duplicate shift timing:
                          </Typography>
                          {` ${duplicateTimingSchedule.name} already uses ${formatTime(form.standardCheckIn)} – ${formatTime(form.standardCheckOut)}. Please specify distinct standard hours.`}
                        </Alert>
                      )}

                      {/* Metrics Summary Strip */}
                      <Grid container spacing={{ xs: 1.25, sm: 1.5 }}>
                        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                          <MetricCard
                            icon={<AlarmOnRounded fontSize="small" />}
                            label="Automatic Present"
                            value={formatTime(form.standardCheckIn)}
                            detail="Effective office start"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                          <MetricCard
                            icon={<TimerRounded fontSize="small" />}
                            label="Scheduled Span"
                            value={formatMinutes(schedule.span)}
                            detail={`${formatTime(form.standardCheckIn)} – ${formatTime(form.standardCheckOut)}`}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                          <MetricCard
                            icon={<CoffeeRounded fontSize="small" />}
                            label="Break Allowance"
                            value={formatMinutes(Number(form.breakMinutes))}
                            detail={`${formatMinutes(schedule.available)} available time`}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                          <MetricCard
                            icon={
                              schedule.isWorkTargetValid ? (
                                <CheckCircleRounded fontSize="small" />
                              ) : (
                                <WarningAmberRounded fontSize="small" />
                              )
                            }
                            label="Required Work"
                            value={formatMinutes(schedule.required)}
                            detail={
                              schedule.isWorkTargetValid
                                ? "Fits the scheduled day"
                                : "Exceeds available span"
                            }
                            isError={!schedule.isWorkTargetValid}
                          />
                        </Grid>
                      </Grid>

                      {/* Basic Shift Identity */}
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Schedule / Shift Name"
                            placeholder="e.g. Morning Shift"
                            value={form.name}
                            onChange={(event) => set("name", event.target.value)}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <WorkOutlineRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                                  </InputAdornment>
                                ),
                              },
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl
                            fullWidth
                            size="small"
                            disabled={!form.scheduleId || savingDepartmentAssignments || departments.length === 0}
                          >
                            <InputLabel id="schedule-departments">Apply this shift to departments</InputLabel>
                            <Select
                              labelId="schedule-departments"
                              multiple
                              value={draftDepartmentIds}
                              label="Apply this shift to departments"
                              renderValue={(selected) =>
                                selected.length === 0
                                  ? "All Departments (Default)"
                                  : `${selected.length} department${selected.length === 1 ? "" : "s"} selected`
                              }
                              MenuProps={{
                                PaperProps: {
                                  sx: {
                                    maxHeight: 280,
                                    borderRadius: "10px",
                                    boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
                                  },
                                },
                              }}
                              onChange={(event) => {
                                const selected =
                                  typeof event.target.value === "string"
                                    ? event.target.value.split(",")
                                    : event.target.value;
                                setDraftDepartmentIds(selected);
                              }}
                            >
                              {departments.map((department) => {
                                const departmentName = Object.values(department.titles ?? {})[0] || "Department";
                                return (
                                  <MenuItem
                                    key={department.departmentId}
                                    value={department.departmentId}
                                    sx={{ minHeight: 38, py: 0.5, borderRadius: "6px", mx: 0.5 }}
                                  >
                                    <Checkbox size="small" checked={draftDepartmentIds.includes(department.departmentId)} />
                                    <ListItemText primary={departmentName} primaryTypographyProps={{ variant: "body2", noWrap: true }} />
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                          {!form.scheduleId && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                              Save this shift first before assigning specific departments.
                            </Typography>
                          )}
                        </Grid>
                      </Grid>

                      {/* Punch Windows - Side by Side */}
                      <Grid container spacing={2}>
                        {/* Punch In Card */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: { xs: 2, sm: 2.25 },
                              borderRadius: "14px",
                              height: "100%",
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                              borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                            }}
                          >
                            <Stack spacing={1.75}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "7px",
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                                    color: "primary.main",
                                    display: "grid",
                                    placeItems: "center",
                                  }}
                                >
                                  <LoginRounded sx={{ fontSize: 16 }} />
                                </Box>
                                <Box>
                                  <Typography fontWeight={750} sx={{ fontSize: "0.9rem" }}>
                                    Punch-In Window
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Allowed check-in buffer & official arrival time
                                  </Typography>
                                </Box>
                              </Stack>

                              <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    label="Allowed From"
                                    value={form.checkInAllowedFrom}
                                    onChange={(event) => set("checkInAllowedFrom", event.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    label="Allowed Until"
                                    value={form.checkInAllowedUntil}
                                    onChange={(event) => set("checkInAllowedUntil", event.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                  />
                                </Grid>
                                <Grid size={12}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    label="Standard Office Start (Auto-Present Time)"
                                    value={form.standardCheckIn}
                                    onChange={(event) => set("standardCheckIn", event.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    helperText="Employees punching in before this time are automatically marked Present."
                                  />
                                </Grid>
                              </Grid>
                            </Stack>
                          </Paper>
                        </Grid>

                        {/* Punch Out Card */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: { xs: 2, sm: 2.25 },
                              borderRadius: "14px",
                              height: "100%",
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                              borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                            }}
                          >
                            <Stack spacing={1.75}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "7px",
                                    bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.12),
                                    color: "secondary.main",
                                    display: "grid",
                                    placeItems: "center",
                                  }}
                                >
                                  <LogoutRounded sx={{ fontSize: 16 }} />
                                </Box>
                                <Box>
                                  <Typography fontWeight={750} sx={{ fontSize: "0.9rem" }}>
                                    Punch-Out Window
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Allowed check-out buffer & official departure time
                                  </Typography>
                                </Box>
                              </Stack>

                              <Grid container spacing={1.5}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    label="Allowed From"
                                    value={form.checkOutAllowedFrom}
                                    onChange={(event) => set("checkOutAllowedFrom", event.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    label="Allowed Until"
                                    value={form.checkOutAllowedUntil}
                                    onChange={(event) => set("checkOutAllowedUntil", event.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                  />
                                </Grid>
                                <Grid size={12}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="time"
                                    label="Standard Office Departure"
                                    value={form.standardCheckOut}
                                    onChange={(event) => set("standardCheckOut", event.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    helperText="Official end of working day for scheduled span calculation."
                                  />
                                </Grid>
                              </Grid>
                            </Stack>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Rules & Durations */}
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Grace Period (Late / Early)"
                            value={form.graceMinutes}
                            onChange={(event) => set("graceMinutes", Number(event.target.value))}
                            slotProps={{
                              input: {
                                endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                                inputProps: { min: 0, max: 180 },
                              },
                            }}
                            helperText="Buffer before Late Half-Day or Early Departure penalty applies."
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Break Allowance"
                            value={form.breakMinutes}
                            onChange={(event) => set("breakMinutes", Number(event.target.value))}
                            slotProps={{
                              input: {
                                endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                                inputProps: { min: 0, max: 180 },
                              },
                            }}
                            helperText="Unpaid break time deducted from daily office span."
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Required Work Duration"
                            value={form.requiredWorkingMinutes}
                            onChange={(event) => set("requiredWorkingMinutes", Number(event.target.value))}
                            error={!schedule.isWorkTargetValid}
                            slotProps={{
                              input: {
                                endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                                inputProps: { min: 0, max: 1440 },
                              },
                            }}
                            helperText={
                              schedule.isWorkTargetValid
                                ? `Minimum net work time for full-day attendance (${formatMinutes(schedule.required)}).`
                                : `Target exceeds available working span (${formatMinutes(schedule.available)}).`
                            }
                          />
                        </Grid>
                      </Grid>

                      {/* Form Actions Footer */}
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={2}
                        sx={{
                          pt: 1.5,
                          borderTop: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(form.isDefault)}
                              disabled={Boolean(form.isDefault) || saving}
                              onChange={(event) => set("isDefault", event.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                Set as Company Default Shift
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Automatically assigned to staff who don't have department shift overrides.
                              </Typography>
                            </Box>
                          }
                        />

                        <AppButton
                          variant="contained"
                          color="primary"
                          size="medium"
                          startIcon={
                            saving ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <SaveRounded />
                            )
                          }
                          disabled={saving || !schedule.isWorkTargetValid || Boolean(duplicateTimingSchedule)}
                          onClick={save}
                          sx={{
                            borderRadius: "10px",
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            textTransform: "none",
                            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.28)}`,
                            alignSelf: { xs: "stretch", sm: "auto" },
                          }}
                        >
                          {saving ? "Saving..." : "Save Shift"}
                        </AppButton>
                      </Stack>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        </Stack>
      </Card>

      {/* Weekly Off Days Card */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: { xs: 2.5, sm: 3 },
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 10px 28px rgba(24, 74, 82, .07)",
          width: "100%",
          minWidth: 0,
        }}
      >
        <Stack spacing={2.5}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CalendarMonthRounded sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.015em" }}>
                  Weekly Off Days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Designate company-wide non-working days. Attendance ignores absence on these days.
                </Typography>
              </Box>
            </Stack>

            <AppButton
              variant="contained"
              color="primary"
              size="medium"
              startIcon={
                savingOffDays ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SaveRounded />
                )
              }
              disabled={savingOffDays}
              onClick={() => void saveWeeklyOffs()}
              sx={{
                borderRadius: "10px",
                px: 2.5,
                fontWeight: 700,
                textTransform: "none",
                alignSelf: { xs: "stretch", sm: "auto" },
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              {savingOffDays ? "Saving..." : "Save Weekly Offs"}
            </AppButton>
          </Stack>

          {/* 7-Day Pill Selector Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(4, 1fr)",
                md: "repeat(7, 1fr)",
              },
              gap: 1.25,
            }}
          >
            {[
              { name: "Sunday", isWeekend: true },
              { name: "Monday", isWeekend: false },
              { name: "Tuesday", isWeekend: false },
              { name: "Wednesday", isWeekend: false },
              { name: "Thursday", isWeekend: false },
              { name: "Friday", isWeekend: false },
              { name: "Saturday", isWeekend: true },
            ].map(({ name, isWeekend }, index) => {
              const isSelected = offDays.includes(index);

              return (
                <Paper
                  key={name}
                  onClick={() =>
                    setOffDays((current) =>
                      isSelected
                        ? current.filter((day) => day !== index)
                        : [...current, index]
                    )
                  }
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    cursor: "pointer",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                    minHeight: 64,
                    userSelect: "none",
                    border: isSelected ? "2px solid" : "1px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    bgcolor: (theme) =>
                      isSelected
                        ? alpha(theme.palette.primary.main, 0.08)
                        : "background.paper",
                    color: isSelected ? "primary.main" : "text.primary",
                    transition: "all 0.18s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: (theme) =>
                        isSelected
                          ? alpha(theme.palette.primary.main, 0.12)
                          : alpha(theme.palette.action.hover, 0.06),
                      transform: "translateY(-2px)",
                      boxShadow: (theme) =>
                        `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`,
                    },
                  }}
                >
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Typography fontWeight={isSelected ? 800 : 600} sx={{ fontSize: "0.85rem" }}>
                      {name}
                    </Typography>
                    {isSelected && (
                      <CheckCircleRounded sx={{ fontSize: 16, color: "primary.main" }} />
                    )}
                  </Stack>
                  {isWeekend && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 650,
                        color: isSelected ? "primary.main" : "text.secondary",
                        opacity: 0.85,
                      }}
                    >
                      Weekend
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <InfoOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              Company gazetted holidays and optional holidays are configured separately under the <strong>Calendar</strong> module.
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* Delete Confirmation Modal */}
      {schedulePendingDelete && (
        <ConfirmationModal
          open
          confirming={deleting}
          title={`Delete ${schedulePendingDelete.name}?`}
          content="This shift will be permanently removed. Employees assigned to this shift should be reassigned to another shift. Default shifts cannot be deleted."
          handleClose={() => !deleting && setSchedulePendingDelete(null)}
          handleConfirmation={() => void deleteSchedule()}
        />
      )}
    </Stack>
  );
};
