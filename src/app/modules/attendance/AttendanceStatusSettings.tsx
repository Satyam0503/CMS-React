import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Edit from "@mui/icons-material/Edit";
import Save from "@mui/icons-material/Save";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { Box, Card, Chip, FormControlLabel, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import { ResponseData } from "../../../utils/common_types";
import { usePageData } from "../../Context/PageDataProvider";
import { AppButton, AppCheckbox, AppTextField } from "../../shared/components/ui";
import { ConfirmationModal } from "../../shared/components/ConfirmModal";

export type AttendanceStatusSetting = {
  id?: string; code: string; name: string; isActive: boolean; isSystem: boolean;
  sortOrder: number; requiresTime: boolean; isAvailableForLeaveManagement: boolean; colorHex: string; paidDayFraction: number; unpaidDayFraction: number;
};

const empty: AttendanceStatusSetting = {
  code: "", name: "", isActive: true, isSystem: false, sortOrder: 99,
  requiresTime: false, isAvailableForLeaveManagement: false, colorHex: "#607D8B", paidDayFraction: 1, unpaidDayFraction: 0,
};

const cloneStatuses = (statuses: AttendanceStatusSetting[]) =>
  statuses.map((status) => ({ ...status }));

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

const sectionSx = {
  p: { xs: 2, md: 2.5 },
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 3,
  bgcolor: "background.paper",
  transition: "transform 180ms ease, box-shadow 180ms ease",
  "&:hover": { boxShadow: "0 12px 28px rgba(0,0,0,.06)" },
};

export default function AttendanceStatusSettings() {
  const { setPageTitle } = usePageData();
  const [items, setItems] = useState<AttendanceStatusSetting[]>([]);
  const [originalItems, setOriginalItems] = useState<AttendanceStatusSetting[]>([]);
  const [draft, setDraft] = useState(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusPendingDelete, setStatusPendingDelete] = useState<AttendanceStatusSetting | null>(null);

  const load = async () => {
    try {
      const result = (await getRequest<ResponseData<AttendanceStatusSetting>>("api/attendance-status-settings?activeOnly=false")).data.methodResults ?? [];
      const loaded = result.length ? result : defaultStatuses;
      setItems(cloneStatuses(loaded)); setOriginalItems(cloneStatuses(loaded));
    } catch {
      setItems(cloneStatuses(defaultStatuses)); setOriginalItems(cloneStatuses(defaultStatuses));
      toast.error("Unable to load saved settings. Showing defaults.");
    }
  };
  useEffect(() => { void load(); }, []);
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
    setItems(cloneStatuses(originalItems));
    setDraft(empty);
    setIsEditing(false);
  };

  const saveAll = async () => {
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
      await load();
      window.dispatchEvent(new CustomEvent("attendance-status-settings-updated"));
      setIsEditing(false);
      toast.success("Attendance settings saved.");
    } catch (error) {
      toast.error((error as Error).message || "Unable to save attendance settings.");
    } finally { setIsSaving(false); }
  };

  const statusTableGrid = isEditing
    ? { xs: "72px minmax(0, 1fr) auto", lg: "90px minmax(220px, 1fr) 84px 170px 120px 64px 64px 84px" }
    : { xs: "72px minmax(0, 1fr) auto", lg: "90px minmax(220px, 1fr) 170px 120px 64px 64px" };

  const statusTableHeaders = isEditing
    ? ["Code", "Status name", "Color", "Status", "Leave mapping", "Paid", "Unpaid", "Action"]
    : ["Code", "Status name", "Status", "Leave mapping", "Paid", "Unpaid"];

  return (
    <Card sx={{ p: { xs: 2, sm: 3, lg: 4 }, mb: 2, overflow: "visible" }}>
      <Stack spacing={3}>
        <Box sx={{ ...sectionSx, p: 0, border: 0, borderRadius: 0, bgcolor: "transparent", "&:hover": { boxShadow: "none" } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5} sx={{ mb: 2 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" fontWeight={750}>Status catalogue</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
              <Tooltip title="Manage each status’s display name, payroll effect, and whether a no-time status can be used in Leave Management.">
                <IconButton aria-label="About attendance status settings" size="small" sx={{ width: 36, height: 36, borderRadius: 2, border: "1px solid", borderColor: "divider", color: "text.secondary", bgcolor: "background.paper", transition: "transform 160ms ease, background-color 160ms ease, border-color 160ms ease", "&:hover": { color: "primary.main", borderColor: "primary.main", bgcolor: "action.hover", transform: "translateY(-1px)" }, "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 } }}><InfoOutlined fontSize="small" /></IconButton>
              </Tooltip>
              {isEditing && (
                <AppButton variant="outlined" disabled={isSaving} onClick={handleCancelEdit}>Cancel</AppButton>
              )}
              <Tooltip title={isEditing ? "Save changes" : "Edit settings"}>
                <AppButton aria-label={isEditing ? "Save changes" : "Edit settings"} variant="contained" startIcon={isEditing ? <Save /> : <Edit />} disabled={isSaving} onClick={() => isEditing ? void saveAll() : setIsEditing(true)} sx={!isEditing ? { minWidth: { xs: 40, sm: "auto" }, width: { xs: 40, sm: "auto" }, px: { xs: 1, sm: 1.75 }, "& .MuiButton-startIcon": { m: { xs: 0, sm: "0 8px 0 -4px" } } } : undefined}>
                  {isEditing ? (isSaving ? "Saving…" : "Save changes") : <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Edit settings</Box>}
                </AppButton>
              </Tooltip>
            </Stack>
          </Stack>
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5, overflow: "hidden" }}>
            <Box>
              <Box sx={{ display: { xs: "none", lg: "grid" }, gridTemplateColumns: statusTableGrid, columnGap: 1.5, alignItems: "center", px: 2, py: 1.25, bgcolor: "background.default", color: "text.secondary" }}>
                {statusTableHeaders.map((label) => <Typography key={label} variant="caption" fontWeight={700}>{label}</Typography>)}
              </Box>
              {items.map((item) => (
                <Box key={item.id ?? item.code} sx={{ display: "grid", gridTemplateColumns: statusTableGrid, columnGap: 1.5, alignItems: "center", borderTop: "1px solid", borderColor: "divider", px: { xs: 1.5, lg: 2 }, py: .85, transition: "background-color 160ms ease, transform 160ms ease", "&:hover": { bgcolor: "action.hover", transform: { lg: "translateX(2px)" } }, ...(isEditing ? { "& > *:nth-child(1)": { gridColumn: { xs: "1", lg: "auto" }, gridRow: { xs: "1 / 6", lg: "auto" }, alignSelf: "center" }, "& > *:nth-child(2)": { gridColumn: { xs: "2", lg: "auto" }, gridRow: { xs: "1", lg: "auto" } }, "& > *:nth-child(3)": { gridColumn: { xs: "2", lg: "auto" }, gridRow: { xs: "2", lg: "auto" } }, "& > *:nth-child(4)": { gridColumn: { xs: "2", lg: "auto" }, gridRow: { xs: "3", lg: "auto" } }, "& > *:nth-child(5)": { gridColumn: { xs: "2", lg: "auto" }, gridRow: { xs: "4", lg: "auto" } }, "& > *:nth-child(6)": { gridColumn: { xs: "2", lg: "auto" }, gridRow: { xs: "5", lg: "auto" } }, "& > *:nth-child(7)": { gridColumn: { xs: "3", lg: "auto" }, gridRow: { xs: "5", lg: "auto" } }, "& > *:nth-child(8)": { gridColumn: { xs: "3", lg: "auto" }, gridRow: { xs: "1", lg: "auto" }, alignSelf: "center" } } : { "& > *:nth-child(1)": { gridColumn: { xs: "1", lg: "auto" }, gridRow: { xs: "1 / 5", lg: "auto" }, alignSelf: "center" }, "& > *:nth-child(2)": { gridColumn: { xs: "2", lg: "auto" }, gridRow: { xs: "1", lg: "auto" } }, "& > *:nth-child(3)": { gridColumn: { xs: "2", lg: "auto" }, gridRow: { xs: "2", lg: "auto" } }, "& > *:nth-child(4)": { gridColumn: { xs: "2", lg: "auto" }, gridRow: { xs: "3", lg: "auto" } }, "& > *:nth-child(5)": { gridColumn: { xs: "2", lg: "auto" }, gridRow: { xs: "4", lg: "auto" } }, "& > *:nth-child(6)": { gridColumn: { xs: "3", lg: "auto" }, gridRow: { xs: "4", lg: "auto" } } }) }}>
                  <Chip size="small" label={item.code} sx={{ width: "fit-content", minWidth: 48, fontWeight: 800, color: item.colorHex, bgcolor: `${item.colorHex}14`, border: "1px solid", borderColor: `${item.colorHex}55` }} />
                  {isEditing
                    ? <AppTextField size="small" value={item.name} onChange={(e) => setItems((value) => value.map((x) => x.code === item.code ? { ...x, name: e.target.value } : x))} />
                    : <Typography fontWeight={700} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{item.name}</Typography>}
                  {isEditing && (
                    <AppTextField size="small" type="color" value={item.colorHex} inputProps={{ "aria-label": `${item.code} display color` }} onChange={(e) => setItems((value) => value.map((x) => x.code === item.code ? { ...x, colorHex: e.target.value } : x))} />
                  )}
                  {isEditing ? <FormControlLabel sx={{ m: 0 }} control={<AppCheckbox checked={item.isActive} onChange={(e) => setItems((value) => value.map((x) => x.code === item.code ? { ...x, isActive: e.target.checked } : x))} />} label="Active" /> : <Stack direction="row" spacing={.75} alignItems="center"><Box aria-hidden="true" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.isActive ? "success.main" : "text.disabled", boxShadow: item.isActive ? "0 0 0 4px rgba(46, 125, 50, .12)" : "none" }} /><Typography variant="body2" color={item.isActive ? "success.dark" : "text.secondary"} fontWeight={700}>{item.isActive ? "Active" : "Inactive"}</Typography></Stack>}
                  <Tooltip title={item.requiresTime ? "Clocking statuses cannot be used for leave mapping." : "Allow this status to be selected in Leave Management policies."}>
                    {isEditing ? <span><FormControlLabel sx={{ m: 0 }} control={<AppCheckbox disabled={item.requiresTime} checked={item.isAvailableForLeaveManagement} onChange={(e) => setItems((value) => value.map((x) => x.code === item.code ? { ...x, isAvailableForLeaveManagement: e.target.checked } : x))} />} label="Available" /></span> : <Typography variant="body2" color={item.isAvailableForLeaveManagement ? "primary.main" : "text.secondary"} fontWeight={item.isAvailableForLeaveManagement ? 700 : 400}>{item.isAvailableForLeaveManagement ? "Eligible" : "—"}</Typography>}
                  </Tooltip>
                  <Typography><Box component="span" sx={{ display: { xs: "inline", lg: "none" }, color: "text.secondary" }}>Paid: </Box>{item.paidDayFraction}</Typography>
                  <Typography><Box component="span" sx={{ display: { xs: "inline", lg: "none" }, color: "text.secondary" }}>Unpaid: </Box>{item.unpaidDayFraction}</Typography>
                  {isEditing && <Tooltip title={item.isSystem ? "Default statuses cannot be deleted" : `Delete ${item.code}`}><span><IconButton size="small" color="error" disabled={item.isSystem} onClick={() => requestDelete(item)} aria-label={`Delete ${item.code}`} sx={{ "&:not(:disabled):hover": { bgcolor: "rgba(211, 47, 47, .08)", transform: "scale(1.08)" }, transition: "transform 150ms ease, background-color 150ms ease" }}><DeleteOutline fontSize="small" /></IconButton></span></Tooltip>}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

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
              <FormControlLabel control={<AppCheckbox checked={draft.requiresTime} onChange={(e) => setDraft({ ...draft, requiresTime: e.target.checked, isAvailableForLeaveManagement: e.target.checked ? false : draft.isAvailableForLeaveManagement })} />} label="Requires punch in and punch out time" />
              <FormControlLabel control={<AppCheckbox checked={draft.isAvailableForLeaveManagement} disabled={draft.requiresTime} onChange={(e) => setDraft({ ...draft, isAvailableForLeaveManagement: e.target.checked })} />} label="Available for Leave" />
              <AppButton startIcon={<Add />} variant="outlined" disabled={!draft.code.trim() || !draft.name.trim()} onClick={addDraft}>Add status</AppButton>
            </Stack>
            <Typography variant="caption" color="text.secondary">Available for Leave allows this no-time status to be selected in Leave Management policies.</Typography>
          </Box>
        )}

      </Stack>
      {statusPendingDelete && <ConfirmationModal open title={`Delete ${statusPendingDelete.code}?`} content={`This permanently deletes the custom attendance status "${statusPendingDelete.name}" for this company. Default statuses cannot be deleted.`} handleClose={() => setStatusPendingDelete(null)} handleConfirmation={() => void confirmDelete()} />}
    </Card>
  );
}
