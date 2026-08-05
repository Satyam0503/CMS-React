import { AccessTimeRounded, SaveRounded } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRequest, putRequest } from "../../../../../server/axios";

type OfficeSchedule = {
  scheduleId?: string; name: string; standardCheckIn: string; standardCheckOut: string;
  checkInAllowedFrom: string; checkInAllowedUntil: string; checkOutAllowedFrom: string; checkOutAllowedUntil: string;
  breakMinutes: number; requiredWorkingMinutes: number;
};

const initial: OfficeSchedule = { name: "Standard Office Schedule", standardCheckIn: "09:00", standardCheckOut: "18:00", checkInAllowedFrom: "08:30", checkInAllowedUntil: "10:00", checkOutAllowedFrom: "17:30", checkOutAllowedUntil: "19:00", breakMinutes: 60, requiredWorkingMinutes: 480 };

export const OfficeSchedule = () => {
  const [form, setForm] = useState<OfficeSchedule>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof OfficeSchedule>(key: K, value: OfficeSchedule[K]) => setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => { getRequest<any>("api/CompanyMaster/OfficeSchedule").then(({ data }) => { if (data.methodResult) setForm(data.methodResult); }).catch(() => toast.error("Office schedule could not be loaded.")).finally(() => setLoading(false)); }, []);
  const save = async () => { setSaving(true); try { const { data } = await putRequest<OfficeSchedule, any>("api/CompanyMaster/OfficeSchedule", form); if (!data.success) throw new Error(data.message); setForm(data.methodResult ?? form); toast.success("Office schedule saved. Automatic Present will use these timings."); } catch (error: any) { toast.error(error?.response?.data?.message || error.message || "Office schedule could not be saved."); } finally { setSaving(false); } };
  if (loading) return <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  return <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, maxWidth: 980 }}>
    <Stack spacing={2.5}><Box><Stack direction="row" spacing={1} alignItems="center"><AccessTimeRounded color="primary" /><Typography variant="h6" fontWeight={800}>Office schedule</Typography></Stack><Typography variant="body2" color="text.secondary">Controls attendance timing and the automatic Present entry after 6:00 PM.</Typography></Box>
      <Alert severity="info">Employees may check in from 8:30 AM to 10:00 AM and check out from 5:30 PM to 7:00 PM. Present requires at least 8 working hours after breaks.</Alert>
      <Grid container spacing={2}><Grid size={{ xs: 12 }}><TextField fullWidth label="Schedule name" value={form.name} onChange={(e) => set("name", e.target.value)} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="time" label="Standard check-in (automatic Present)" value={form.standardCheckIn} onChange={(e) => set("standardCheckIn", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="time" label="Standard check-out (automatic Present)" value={form.standardCheckOut} onChange={(e) => set("standardCheckOut", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="time" label="Check-in allowed from" value={form.checkInAllowedFrom} onChange={(e) => set("checkInAllowedFrom", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="time" label="Check-in allowed until" value={form.checkInAllowedUntil} onChange={(e) => set("checkInAllowedUntil", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="time" label="Check-out allowed from" value={form.checkOutAllowedFrom} onChange={(e) => set("checkOutAllowedFrom", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="time" label="Check-out allowed until" value={form.checkOutAllowedUntil} onChange={(e) => set("checkOutAllowedUntil", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Break minutes" value={form.breakMinutes} onChange={(e) => set("breakMinutes", Number(e.target.value))} inputProps={{ min: 0, max: 180 }} /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Required working minutes" value={form.requiredWorkingMinutes} onChange={(e) => set("requiredWorkingMinutes", Number(e.target.value))} inputProps={{ min: 480, max: 1440 }} helperText="480 minutes = 8 hours" /></Grid></Grid>
      <Box><Button variant="contained" startIcon={<SaveRounded />} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save office schedule"}</Button></Box>
    </Stack></Paper>;
};
