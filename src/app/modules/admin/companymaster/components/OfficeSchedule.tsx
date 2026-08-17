import {
  AccessTimeRounded,
  AlarmOnRounded,
  CheckCircleRounded,
  CoffeeRounded,
  InfoOutlined,
  LoginRounded,
  LogoutRounded,
  SaveRounded,
  TimerRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getRequest, putRequest } from "../../../../../server/axios";
import { AppButton } from "../../../../shared/components/ui";

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
};

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
      p: 1.5,
      height: "100%",
      borderRadius: 2.5,
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035),
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 38,
          height: 38,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {label}
        </Typography>
        <Typography fontWeight={800} noWrap>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
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

  const set = <K extends keyof OfficeScheduleForm>(
    key: K,
    value: OfficeScheduleForm[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    getRequest<any>("api/CompanyMaster/OfficeSchedule")
      .then(({ data }) => {
        if (data.methodResult) setForm(data.methodResult);
      })
      .catch(() => toast.error("Office schedule could not be loaded."))
      .finally(() => setLoading(false));
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

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await putRequest<OfficeScheduleForm, any>(
        "api/CompanyMaster/OfficeSchedule",
        form,
      );
      if (!data.success) throw new Error(data.message);
      const saved = data.methodResult ?? form;
      setForm(saved);
      toast.success(
        `Office schedule saved. Automatic Present starts at ${formatTime(saved.standardCheckIn)} on working days.`,
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Office schedule could not be saved.",
      );
    } finally {
      setSaving(false);
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
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: (theme) => `0 10px 22px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              <AccessTimeRounded />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={850} lineHeight={1.15}>
                Office schedule
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Define attendance windows, working time, and automatic Present timing.
              </Typography>
            </Box>
          </Stack>
          <Chip
            icon={<CheckCircleRounded />}
            label="Company default schedule"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, alignSelf: { xs: "flex-start", sm: "center" } }}
          />
        </Stack>

        <Alert
          icon={<InfoOutlined fontSize="inherit" />}
          severity={schedule.isWorkTargetValid ? "info" : "warning"}
          sx={{ borderRadius: 2.5, alignItems: "center" }}
        >
          <Typography component="span" fontWeight={750}>
            Automatic Present starts at {formatTime(form.standardCheckIn)}
          </Typography>
          {" on working days for employees using this schedule. It creates only a missing record and never replaces manual, Leave, or WFH attendance."}
          {!schedule.isWorkTargetValid &&
            " The required working time is greater than the available scheduled time after breaks."}
        </Alert>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ScheduleMetric icon={<AlarmOnRounded fontSize="small" />} label="Automatic Present" value={formatTime(form.standardCheckIn)} detail="Effective office start" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ScheduleMetric icon={<TimerRounded fontSize="small" />} label="Scheduled span" value={formatMinutes(schedule.span)} detail={`${formatTime(form.standardCheckIn)} – ${formatTime(form.standardCheckOut)}`} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ScheduleMetric icon={<CoffeeRounded fontSize="small" />} label="Break allowance" value={formatMinutes(Number(form.breakMinutes))} detail={`${formatMinutes(schedule.available)} available time`} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <ScheduleMetric icon={<CheckCircleRounded fontSize="small" />} label="Required work" value={formatMinutes(schedule.required)} detail={schedule.isWorkTargetValid ? "Fits the scheduled day" : "Exceeds available time"} />
          </Grid>
        </Grid>

        <Divider />

        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Schedule name" value={form.name} onChange={(event) => set("name", event.target.value)} helperText="Shown when this company schedule is applied." />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2.5, height: "100%" }}>
              <Stack spacing={1.75}>
                <Stack direction="row" spacing={1} alignItems="center"><LoginRounded color="primary" fontSize="small" /><Typography fontWeight={800}>Check-in window</Typography></Stack>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="time" label="Allowed from" value={form.checkInAllowedFrom} onChange={(event) => set("checkInAllowedFrom", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="time" label="Allowed until" value={form.checkInAllowedUntil} onChange={(event) => set("checkInAllowedUntil", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 12 }}><TextField fullWidth type="time" label="Standard check-in / automatic Present" value={form.standardCheckIn} onChange={(event) => set("standardCheckIn", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText={`Automatic Present starts at ${formatTime(form.standardCheckIn)}.`} /></Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2.5, height: "100%" }}>
              <Stack spacing={1.75}>
                <Stack direction="row" spacing={1} alignItems="center"><LogoutRounded color="primary" fontSize="small" /><Typography fontWeight={800}>Check-out window</Typography></Stack>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="time" label="Allowed from" value={form.checkOutAllowedFrom} onChange={(event) => set("checkOutAllowedFrom", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="time" label="Allowed until" value={form.checkOutAllowedUntil} onChange={(event) => set("checkOutAllowedUntil", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                  <Grid size={{ xs: 12 }}><TextField fullWidth type="time" label="Standard check-out" value={form.standardCheckOut} onChange={(event) => set("standardCheckOut", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText={`Planned end of the ${formatMinutes(schedule.span)} scheduled day.`} /></Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="number" label="LHD / ED grace minutes" value={form.graceMinutes} onChange={(event) => set("graceMinutes", Number(event.target.value))} inputProps={{ min: 0, max: 180 }} helperText="After the allowed check-in time or before the allowed check-out time, LHD/ED is allowed for this duration; then it becomes Half Day." /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="number" label="Break minutes" value={form.breakMinutes} onChange={(event) => set("breakMinutes", Number(event.target.value))} inputProps={{ min: 0, max: 180 }} helperText={`${formatMinutes(schedule.available)} remains after the configured break.`} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="number" label="Required working minutes" value={form.requiredWorkingMinutes} onChange={(event) => set("requiredWorkingMinutes", Number(event.target.value))} inputProps={{ min: 0, max: 1440 }} helperText={`${formatMinutes(schedule.required)} required; ${formatMinutes(schedule.available)} is available.`} error={!schedule.isWorkTargetValid} /></Grid>
        </Grid>

        <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
          <Typography variant="caption" color="text.secondary">
            Changes apply to employees assigned to this effective company schedule on subsequent scheduler runs.
          </Typography>
          <AppButton variant="contained" size="large" startIcon={<SaveRounded />} onClick={save} disabled={saving || !schedule.isWorkTargetValid} sx={{ px: 2.5, alignSelf: { xs: "stretch", sm: "auto" } }}>
            {saving ? "Saving schedule..." : "Save office schedule"}
          </AppButton>
        </Stack>
      </Stack>
    </Paper>
  );
};
