import { useEffect, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";
import { getLeavePolicies } from "../../leaves/leaveServices";
import { LeavePolicyModel } from "../../leaves/model";
import { EmployeeLifecyclePolicy, createSpecialLeave, deleteSpecialLeave, getSpecialLeaves, linkSpecialLeave, unlinkSpecialLeave, updateSpecialLeave } from "../employeeServices";
import {notifications}from "../../../shared/notifications";
import { NotificationsNone } from "@mui/icons-material";
const dateText = (v?: string) => v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not specified";

export const EmployeeLifecyclePolicyConfig = ({ canEdit = false, showHeader = true }: { canEdit?: boolean; showHeader?: boolean }) => {
  const [specialLeaves, setSpecialLeaves] = useState<EmployeeLifecyclePolicy[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicyModel[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEventType, setCreateEventType] = useState("MedicalLeave");
  const [editItem, setEditItem] = useState<EmployeeLifecyclePolicy | null>(null);
  const [editName, setEditName] = useState("");
  const [editEventType, setEditEventType] = useState("MedicalLeave");
  const [linkItem, setLinkItem] = useState<EmployeeLifecyclePolicy | null>(null);
  const [linkPolicyId, setLinkPolicyId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [special, policies] = await Promise.all([getSpecialLeaves(), getLeavePolicies(true)]);
      const result = policies.data as unknown as { methodResults?: LeavePolicyModel[] };
      setSpecialLeaves(Array.isArray(special.data) ? special.data : []);
      setLeavePolicies(result.methodResults ?? []);
    } catch { setMessage("Unable to load special leaves."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadData(); }, []);

  const deleteCard = async () => {
    if (!deleteId) return;
    setBusy(true);
    try {
      const response = await deleteSpecialLeave(deleteId);
      if (!response.data?.success) { setMessage(response.data?.message ?? "Unable to delete special leave."); return; }
      setDeleteId(null); notifications.success("Special leave deleted successfully.");
       await loadData();
    } catch { notifications.error
      ("Unable to delete special leave."); }
    finally { setBusy(false); }
  };

  const unlinkCard = async (id: string) => {
    setBusy(true);
    try {
      const response = await unlinkSpecialLeave(id);
      if (!response.data?.success) { notifications.warning
        (response.data?.message ?? "Unable to unlink leave."); return; }
      notifications.success
      ("Leave unlinked successfully."); await loadData();
    } catch { notifications.error("Unable to unlink leave."); }
    finally { setBusy(false); }
  };

  const createCard = async () => {
    const name = createName.trim();
    if (!name) { notifications.warning
      ("Special leave name is required."); return; }
    setBusy(true);
    try {
      const response = await createSpecialLeave({
        name,
        eventType: createEventType,
        requiresHrApproval: false,
        requiresReason: true,
        requiresExpectedReturnDate: false,
        requiresDocument: false,
        attendanceExpected: false,
        leaveRequestsAllowed: true,
        workFromHomeRequestsAllowed: false,
      });
      if (!response.data?.success) { notifications.warning
        (response.data?.message ?? "Unable to create special leave."); return; }
      setCreateOpen(false); setCreateName(""); notifications.success("Special leave added successfully."); await loadData();
    } catch { notifications.error("Unable to create special leave."); }
    finally { setBusy(false); }
  };

  const openEdit = (item: EmployeeLifecyclePolicy) => {
    setEditItem(item); setEditName(item.name ?? ""); setEditEventType(item.eventType);
  };

  const saveEdit = async () => {
    if (!editItem?.id || !editName.trim()) { notifications.warning
      ("Special leave name is required."); return; }
    setBusy(true);
    try {
      const response = await updateSpecialLeave(editItem.id, { ...editItem, name: editName.trim(), eventType: editEventType });
      if (!response.data?.success) { notifications.warning
        (response.data?.message ?? "Unable to edit special leave."); return; }
      setEditItem(null); notifications.success
      ("Special leave updated successfully."); await loadData();
    } catch { notifications.error
      ("Unable to edit special leave."); }
    finally { setBusy(false); }
  };

  const saveLink = async () => {
    if (!linkItem?.id || !linkPolicyId) { notifications.warning("Select a Leave Policy first."); return; }
    setBusy(true);
    try {
      const response = await linkSpecialLeave(linkItem.id, linkPolicyId);
      if (!response.data?.success) { notifications.error(response.data?.message ?? "Unable to link leave."); return; }
      setLinkItem(null); setLinkPolicyId(""); notifications.success("Leave linked successfully."); await loadData();
    } catch { notifications.error("Unable to link leave."); }
    finally { setBusy(false); }
  };

  return <>
    <Card sx={{ mb: showHeader ? 2 : 0 }}><CardContent>
      <Stack spacing={1.5}>
        {showHeader && <Stack direction="row" justifyContent="space-between" alignItems="center"><BoxTitle /><Button size="small" variant="contained" startIcon={<AddRounded />} onClick={() => setCreateOpen(true)}>Add special leave</Button></Stack>}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
          <Alert severity="info" sx={{ flex: 1 }}>Only lifecycle special leaves appear here. Normal Leave Policies remain managed in Leave Management.</Alert>
          {canEdit && <Button size="small" variant="contained" startIcon={<AddRounded />} onClick={() => setCreateOpen(true)}>Add special leave</Button>}
        </Stack>
        {/* {message && <Alert severity={message.startsWith("Unable") ? "error" : "success"}>{message}</Alert>} */}
        {loading ? <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack> : specialLeaves.length === 0 ? <Alert severity="warning">No special leaves are configured.</Alert> : specialLeaves.map((item, index) => {
          const policy = leavePolicies.find(p => p.id === item.leavePolicyId);
          const linked = Boolean(item.leavePolicyId);
          return <Accordion key={item.id ?? `${item.eventType}-${index}`}><AccordionSummary expandIcon={<ExpandMoreRounded />}><Typography sx={{ fontWeight: 800, flex: 1 }}>{item.name || policy?.name || item.eventType || "Special leave"}</Typography><Chip size="small" label={linked ? "Linked" : "Not linked"} color={linked ? "success" : "default"} /></AccordionSummary><AccordionDetails><Stack spacing={1}><Typography variant="body2">Leave Policy: {policy?.name ?? "No Leave Policy linked"}</Typography><Typography variant="body2">Event: {item.eventType} · Effective: {dateText(item.effectiveFromUtc)}</Typography><Stack direction="row" justifyContent="flex-end" spacing={1}>{canEdit && !linked && <Button size="small" variant="outlined" startIcon={<LinkRounded />} disabled={busy} onClick={() => { setLinkItem(item); setLinkPolicyId(""); }}>Link</Button>}{canEdit && <Button size="small" variant="outlined" startIcon={<EditRounded />} disabled={busy} onClick={() => openEdit(item)}>Edit</Button>}{canEdit && linked && <Button size="small" variant="outlined" disabled={busy} onClick={() => void unlinkCard(item.id!)}>Unlink</Button>}{canEdit && <Button size="small" color="error" variant="outlined" disabled={busy} startIcon={<DeleteOutlineRounded />} onClick={() => setDeleteId(item.id ?? null)}>Delete</Button>}</Stack></Stack></AccordionDetails></Accordion>;
        })}
      </Stack>
    </CardContent></Card>
    <Dialog open={Boolean(linkItem)} onClose={() => !busy && setLinkItem(null)} fullWidth maxWidth="sm"><DialogTitle>Link Leave Policy</DialogTitle><DialogContent><TextField select fullWidth label="Leave Policy" value={linkPolicyId} onChange={event => setLinkPolicyId(event.target.value)} sx={{ mt: 1 }}><MenuItem value="" disabled>Select a Leave Policy</MenuItem>{leavePolicies.filter(policy => policy.status && !policy.lifecycle?.enabled).map(policy => <MenuItem key={policy.id} value={policy.id ?? ""}>{policy.name}</MenuItem>)}</TextField></DialogContent><DialogActions><Button onClick={() => setLinkItem(null)} disabled={busy}>Cancel</Button><Button variant="contained" onClick={() => void saveLink()} disabled={busy}>Link</Button></DialogActions></Dialog>
    <Dialog open={Boolean(editItem)} onClose={() => !busy && setEditItem(null)} fullWidth maxWidth="sm"><DialogTitle>Edit special leave</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField label="Special leave name" value={editName} onChange={event => setEditName(event.target.value)} fullWidth required /><TextField select label="Lifecycle event" value={editEventType} onChange={event => setEditEventType(event.target.value)} fullWidth><MenuItem value="MedicalLeave">Medical Leave</MenuItem><MenuItem value="MaternityLeave">Maternity Leave</MenuItem><MenuItem value="PaternityLeave">Paternity Leave</MenuItem><MenuItem value="LongTermLeave">Long-term Leave</MenuItem><MenuItem value="Sabbatical">Sabbatical</MenuItem></TextField></Stack></DialogContent><DialogActions><Button onClick={() => setEditItem(null)} disabled={busy}>Cancel</Button><Button variant="contained" onClick={() => void saveEdit()} disabled={busy}>Save</Button></DialogActions></Dialog>
    <Dialog open={createOpen} onClose={() => !busy && setCreateOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Add special leave</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Special leave name" value={createName} onChange={event => setCreateName(event.target.value)} fullWidth autoFocus required />
          <TextField select label="Lifecycle event" value={createEventType} onChange={event => setCreateEventType(event.target.value)} fullWidth>
            <MenuItem value="MedicalLeave">Medical Leave</MenuItem>
            <MenuItem value="MaternityLeave">Maternity Leave</MenuItem>
            <MenuItem value="PaternityLeave">Paternity Leave</MenuItem>
            <MenuItem value="LongTermLeave">Long-term Leave</MenuItem>
            <MenuItem value="Sabbatical">Sabbatical</MenuItem>
            <MenuItem value="AdministrativeLeave">Administrative Leave</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={() => setCreateOpen(false)} disabled={busy}>Cancel</Button><Button variant="contained" onClick={() => void createCard()} disabled={busy}>Save</Button></DialogActions>
    </Dialog>
    <ConfirmationModal open={Boolean(deleteId)} title="Delete special leave" content="This removes only the special-leave card and unlinks its Leave Policy. The Leave Policy is preserved." handleClose={() => setDeleteId(null)} handleConfirmation={deleteCard} confirming={busy} />
  </>;
};

const BoxTitle = () => <Typography variant="h6" sx={{ fontWeight: 800 }}>Lifecycle special leaves</Typography>;
