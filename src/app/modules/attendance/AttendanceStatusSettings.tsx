import { Add, DeleteOutline, Edit, Save } from "@mui/icons-material";
import { Box, Card, Chip, Divider, FormControlLabel, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import { ResponseData } from "../../../utils/common_types";
import { usePageData } from "../../Context/PageDataProvider";
import { AppButton, AppCheckbox, AppSwitch, AppTextField } from "../../shared/components/ui";
import { ConfirmationModal } from "../../shared/components/ConfirmModal";

export type AttendanceStatusSetting = {
  id?: string; code: string; name: string; isActive: boolean; isSystem: boolean;
  sortOrder: number; requiresTime: boolean; isAvailableForLeaveManagement: boolean; colorHex: string; paidDayFraction: number; unpaidDayFraction: number;
};

const empty: AttendanceStatusSetting = {
  code: "", name: "", isActive: true, isSystem: false, sortOrder: 99,
  requiresTime: false, isAvailableForLeaveManagement: false, colorHex: "#607D8B", paidDayFraction: 1, unpaidDayFraction: 0,
};

const defaultStatuses: AttendanceStatusSetting[] = [
  ["P", "Present", true, 1, 0], ["A", "Absent", false, 0, 1], ["SL", "Sick Leave", false, 1, 0],
  ["CL", "Casual Leave", false, 1, 0], ["EL", "Earned Leave", false, 1, 0], ["WFH", "Work From Home", true, 1, 0],
  ["HD", "Half Day", false, .5, .5], ["ED", "Early Departure", true, 1, 0], ["LHD", "Late Arrival-Half Day", true, .5, .5],
  ["LHD+ED", "Late Arrival-Half Day + Early Departure", true, .5, .5],
  ["WFH+WFO", "Half WFH and Half WFO", true, 1, 0], ["COMP-OFF", "Compensatory Off", false, 1, 0],
  ["CL-HALF", "Casual Leave (Half Day)", false, 1, 0], ["SL-HALF", "Sick Leave (Half Day)", false, 1, 0],
  ["WFH-HD", "WFH with Half Day", true, .5, .5],
].map(([code, name, requiresTime, paid, unpaid], index) => ({
  code: code as string, name: name as string, requiresTime: requiresTime as boolean,
  paidDayFraction: paid as number, unpaidDayFraction: unpaid as number,
  isActive: true, isSystem: true, isAvailableForLeaveManagement: ["SL", "CL", "EL", "COMP-OFF", "CL-HALF", "SL-HALF"].includes(code as string), colorHex: "#607D8B", sortOrder: index,
}));

type PenaltyPolicy = {
  id?: string; name: string; combinedLhdEdMonthlyLimit: number; isEnabled: boolean;
  requiresHrApproval: boolean; defaultDecision: string; effectiveFrom: string;
  effectiveTo?: string; version: number;
};

const sectionSx = {
  p: { xs: 2, md: 2.5 },
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 3,
  bgcolor: "background.paper",
};

export default function AttendanceStatusSettings() {
  const { setPageTitle } = usePageData();
  const [items, setItems] = useState<AttendanceStatusSetting[]>([]);
  const [originalItems, setOriginalItems] = useState<AttendanceStatusSetting[]>([]);
  const [draft, setDraft] = useState(empty);
  const [policy, setPolicy] = useState<PenaltyPolicy>({
    name: "Combined LHD + ED monthly limit", combinedLhdEdMonthlyLimit: 2,
    isEnabled: true, requiresHrApproval: true, defaultDecision: "REVIEW_REQUIRED",
    effectiveFrom: new Date().toISOString().slice(0, 10), version: 1,
  });
  const [originalPolicy, setOriginalPolicy] = useState<PenaltyPolicy | null>(null);
  const [offDays, setOffDays] = useState<number[]>([0, 6]);
  const [originalOffDays, setOriginalOffDays] = useState<number[]>([0, 6]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusPendingDelete, setStatusPendingDelete] = useState<AttendanceStatusSetting | null>(null);

  const load = async () => {
    try {
      const result = (await getRequest<ResponseData<AttendanceStatusSetting>>("api/attendance-status-settings?activeOnly=false")).data.methodResults ?? [];
      const loaded = result.length ? result : defaultStatuses;
      setItems(loaded); setOriginalItems(loaded);
    } catch {
      setItems(defaultStatuses); setOriginalItems(defaultStatuses);
      toast.error("Unable to load saved settings. Showing defaults.");
    }
  };
  const loadPolicy = async () => {
    try {
      const { data } = await getRequest<PenaltyPolicy>("api/attendance/penalty/policy");
      const loaded = { ...data, effectiveFrom: data.effectiveFrom.slice(0, 10) };
      setPolicy(loaded); setOriginalPolicy(loaded);
    } catch { toast.error("Unable to load attendance penalty policy."); }
  };
  const loadWeeklyOffs = async () => {
    try {
      const { data } = await getRequest<{ offDays: number[] }>("api/attendance/weekly-offs");
      setOffDays(data.offDays); setOriginalOffDays(data.offDays);
    } catch { setOffDays([0, 6]); setOriginalOffDays([0, 6]); }
  };

  useEffect(() => { void load(); void loadPolicy(); void loadWeeklyOffs(); }, []);
  useEffect(() => { setPageTitle("Attendance Settings"); return () => setPageTitle(""); }, [setPageTitle]);

  const addDraft = () => {
    if (items.some((x) => x.code.toUpperCase() === draft.code.trim().toUpperCase())) {
      toast.error("Attendance status code already exists."); return;
    }
    setItems((value) => [...value, { ...draft, code: draft.code.trim().toUpperCase(), name: draft.name.trim() }]);
    setDraft(empty);
  };

  const requestDelete = (item: AttendanceStatusSetting) => {
    if (item.isSystem) return;
    setStatusPendingDelete(item);
  };

  const confirmDelete = async () => {
    const item = statusPendingDelete;
    if (!item) return;
    try {
      if (item.id) {
        const { data } = await deleteRequest<{ success: boolean; message?: string }>(`api/attendance-status-settings/${encodeURIComponent(item.id)}`);
        if (!data.success) throw new Error(data.message || `Unable to delete ${item.code}.`);
        await load();
      } else {
        setItems((current) => current.filter((x) => x.code !== item.code));
      }
      toast.success(`${item.code} was deleted.`);
      setStatusPendingDelete(null);
    } catch (error) {
      toast.error((error as Error).message || `Unable to delete ${item.code}.`);
    }
  };

  const handleCancelEdit = () => {
    setItems(originalItems);
    setOffDays(originalOffDays);
    setPolicy(originalPolicy ?? policy);
    setDraft(empty);
    setIsEditing(false);
  };

  const saveAll = async () => {
    if (offDays.length === 0) { toast.error("Select at least one weekly off day."); return; }
    setIsSaving(true);
    try {
      const changedItems = items.filter((item) => {
        const original = originalItems.find((x) => (x.id && x.id === item.id) || x.code === item.code);
        return !original || JSON.stringify(original) !== JSON.stringify(item);
      });
      for (const item of changedItems) {
        const { data } = await postRequest<AttendanceStatusSetting, { success: boolean; message?: string }>("api/attendance-status-settings", item);
        if (!data.success) throw new Error(data.message || `Unable to save ${item.code}.`);
      }
      if (JSON.stringify([...offDays].sort()) !== JSON.stringify([...originalOffDays].sort())) {
        const { data } = await postRequest<{ offDays: number[] }, { success: boolean; message: string }>("api/attendance/weekly-offs", { offDays });
        if (!data.success) throw new Error(data.message || "Unable to save weekly offs.");
      }
      if (originalPolicy && JSON.stringify(policy) !== JSON.stringify(originalPolicy)) {
        const { data } = await postRequest<PenaltyPolicy, { success: boolean; message: string }>("api/attendance/penalty/policy", policy);
        if (!data.success) throw new Error(data.message || "Unable to save policy.");
      }
      await Promise.all([load(), loadPolicy(), loadWeeklyOffs()]);
      window.dispatchEvent(new CustomEvent("attendance-status-settings-updated"));
      setIsEditing(false);
      toast.success("Attendance settings saved.");
    } catch (error) {
      toast.error((error as Error).message || "Unable to save attendance settings.");
    } finally { setIsSaving(false); }
  };

  const statusTableGrid = isEditing
    ? "90px minmax(220px, 1fr) 84px 170px 120px 64px 64px 84px"
    : "90px minmax(220px, 1fr) 170px 120px 64px 64px 84px";

  const statusTableHeaders = isEditing
    ? ["Code", "Status name", "Color", "Leave mapping", "Status", "Paid", "Unpaid", "Action"]
    : ["Code", "Status name", "Leave mapping", "Status", "Paid", "Unpaid", "Action"];

  return (
    <Card sx={{ p: { xs: 2, sm: 3, lg: 4 }, mb: 2, overflow: "visible" }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Attendance status settings</Typography>
            <Typography color="text.secondary" sx={{ mt: .5 }}>Configure attendance codes, weekly offs, and payroll penalty rules.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {isEditing && (
              <AppButton variant="outlined" disabled={isSaving} onClick={handleCancelEdit}>Cancel</AppButton>
            )}
            <AppButton variant="contained" startIcon={isEditing ? <Save /> : <Edit />} disabled={isSaving} onClick={() => isEditing ? void saveAll() : setIsEditing(true)}>
              {isEditing ? (isSaving ? "Saving…" : "Save changes") : "Edit settings"}
            </AppButton>
          </Stack>
        </Stack>

        {isEditing && (
          <Box sx={{ ...sectionSx, bgcolor: "background.default" }}>
            <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 2 }}>Add a custom status</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "120px minmax(180px, 1fr) 140px 140px" }, gap: 2 }}>
              <AppTextField label="Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} />
              <AppTextField label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <AppTextField label="Paid day" type="number" inputProps={{ min: 0, max: 1, step: .5 }} value={draft.paidDayFraction} onChange={(e) => setDraft({ ...draft, paidDayFraction: +e.target.value })} />
              <AppTextField label="Unpaid day" type="number" inputProps={{ min: 0, max: 1, step: .5 }} value={draft.unpaidDayFraction} onChange={(e) => setDraft({ ...draft, unpaidDayFraction: +e.target.value })} />
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1.5} sx={{ mt: 2 }}>
              <FormControlLabel control={<AppCheckbox checked={draft.requiresTime} onChange={(e) => setDraft({ ...draft, requiresTime: e.target.checked, isAvailableForLeaveManagement: e.target.checked ? false : draft.isAvailableForLeaveManagement })} />} label="Requires check-in and check-out time" />
              <FormControlLabel control={<AppCheckbox checked={draft.isAvailableForLeaveManagement} disabled={draft.requiresTime} onChange={(e) => setDraft({ ...draft, isAvailableForLeaveManagement: e.target.checked })} />} label="Available for Leave" />
              <AppButton startIcon={<Add />} variant="outlined" disabled={!draft.code.trim() || !draft.name.trim()} onClick={addDraft}>Add status</AppButton>
            </Stack>
            <Typography variant="caption" color="text.secondary">Available for Leave allows this no-time status to be selected in Leave Management policies.</Typography>
          </Box>
        )}

        <Box sx={sectionSx}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={750}>Status catalogue</Typography>
              <Typography variant="body2" color="text.secondary">Manage display, payroll effect, and whether a no-time status can be mapped to Leave Management.</Typography>
            </Box>
            <Chip size="small" color="primary" variant="outlined" label={`${items.filter((item) => item.isActive).length} active statuses`} />
          </Stack>
          <Box sx={{ overflowX: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
            <Box sx={{ minWidth: 1060 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: statusTableGrid, columnGap: 1.5, alignItems: "center", px: 2, py: 1.25, bgcolor: "background.default", color: "text.secondary" }}>
                {statusTableHeaders.map((label) => <Typography key={label} variant="caption" fontWeight={700}>{label}</Typography>)}
              </Box>
              {items.map((item) => (
                <Box key={item.id ?? item.code} sx={{ display: "grid", gridTemplateColumns: statusTableGrid, columnGap: 1.5, alignItems: "center", borderTop: "1px solid", borderColor: "divider", px: 2, py: .85, "&:hover": { bgcolor: "action.hover" } }}>
                  <Chip size="small" label={item.code} sx={{ width: "fit-content", minWidth: 48, fontWeight: 800, color: item.colorHex, bgcolor: `${item.colorHex}14`, border: "1px solid", borderColor: `${item.colorHex}55` }} />
                  <AppTextField size="small" disabled={!isEditing} value={item.name} onChange={(e) => setItems((value) => value.map((x) => x.code === item.code ? { ...x, name: e.target.value } : x))} />
                  {isEditing && (
                    <AppTextField size="small" type="color" disabled={!isEditing} value={item.colorHex} inputProps={{ "aria-label": `${item.code} display color` }} onChange={(e) => setItems((value) => value.map((x) => x.code === item.code ? { ...x, colorHex: e.target.value } : x))} />
                  )}
                  <Tooltip title={item.requiresTime ? "Clocking statuses cannot be used for leave mapping." : "Allow this status to be selected in Leave Management policies."}>
                    <span><FormControlLabel sx={{ m: 0 }} control={<AppCheckbox disabled={!isEditing || item.requiresTime} checked={item.isAvailableForLeaveManagement} onChange={(e) => setItems((value) => value.map((x) => x.code === item.code ? { ...x, isAvailableForLeaveManagement: e.target.checked } : x))} />} label="Available" /></span>
                  </Tooltip>
                  <FormControlLabel sx={{ m: 0 }} control={<AppCheckbox disabled={!isEditing} checked={item.isActive} onChange={(e) => setItems((value) => value.map((x) => x.code === item.code ? { ...x, isActive: e.target.checked } : x))} />} label={item.isActive ? "Active" : "Inactive"} />
                  <Typography>{item.paidDayFraction}</Typography>
                  <Typography>{item.unpaidDayFraction}</Typography>
                  {item.isSystem ? <Chip size="small" label="Default" variant="outlined" /> : <Tooltip title={isEditing ? `Delete ${item.code}` : "Edit settings to delete this custom status"}><span><IconButton size="small" color="error" disabled={!isEditing} onClick={() => requestDelete(item)} aria-label={`Delete ${item.code}`}><DeleteOutline fontSize="small" /></IconButton></span></Tooltip>}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={sectionSx}>
          <Typography variant="h6" fontWeight={750}>Weekly off days</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: .5, mb: 1.5 }}>These days appear as Off in the attendance calendar. Company holidays are managed from Calendar.</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((name, index) => (
              <FormControlLabel key={name} sx={{ m: 0, px: 1.2, py: .4, border: "1px solid", borderColor: offDays.includes(index) ? "primary.main" : "divider", borderRadius: 2 }} control={<AppCheckbox disabled={!isEditing} checked={offDays.includes(index)} onChange={(e) => setOffDays((value) => e.target.checked ? [...value, index] : value.filter((x) => x !== index))} />} label={name} />
            ))}
          </Stack>
        </Box>

        <Box sx={sectionSx}>
          <Typography variant="h6" fontWeight={750}>Payroll penalty policy</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: .5, mb: 2 }}>Exceeded-limit penalties require an audited HR/Admin decision before payroll.</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(240px, 1fr) minmax(220px, 1fr) auto" }, gap: 2, alignItems: "center" }}>
            <AppTextField disabled={!isEditing} label="Combined LHD + ED monthly limit" type="number" value={policy.combinedLhdEdMonthlyLimit} onChange={(e) => setPolicy({ ...policy, combinedLhdEdMonthlyLimit: +e.target.value })} />
            <AppTextField disabled={!isEditing} label="Effective from" type="date" InputLabelProps={{ shrink: true }} value={policy.effectiveFrom} onChange={(e) => setPolicy({ ...policy, effectiveFrom: e.target.value })} />
            <FormControlLabel sx={{ m: 0, minWidth: 110 }} control={<AppSwitch disabled={!isEditing} checked={policy.isEnabled} onChange={(e) => setPolicy({ ...policy, isEnabled: e.target.checked })} />} label="Enabled" />
          </Box>
        </Box>
      </Stack>
      {statusPendingDelete && <ConfirmationModal open title={`Delete ${statusPendingDelete.code}?`} content={`This permanently deletes the custom attendance status "${statusPendingDelete.name}" for this company. Default statuses cannot be deleted.`} handleClose={() => setStatusPendingDelete(null)} handleConfirmation={() => void confirmDelete()} />}
    </Card>
  );
}
