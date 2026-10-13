import { useEffect, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Button, Card, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
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
    } catch { notifications.error("Unable to delete special leave."); }
    finally { setBusy(false); }
  };

  const unlinkCard = async (id: string) => {
    setBusy(true);
    try {
      const response = await unlinkSpecialLeave(id);
      if (!response.data?.success) { notifications.warning(response.data?.message ?? "Unable to unlink leave."); return; }
      notifications.success("Leave unlinked successfully."); await loadData();
    } catch { notifications.error("Unable to unlink leave."); }
    finally { setBusy(false); }
  };

  const createCard = async () => {
    const name = createName.trim();
    if (!name) { notifications.warning("Special leave name is required."); return; }
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
      if (!response.data?.success) { notifications.warning(response.data?.message ?? "Unable to create special leave."); return; }
      setCreateOpen(false); setCreateName(""); notifications.success("Special leave added successfully."); await loadData();
    } catch { notifications.error("Unable to create special leave."); }
    finally { setBusy(false); }
  };

  const openEdit = (item: EmployeeLifecyclePolicy) => {
    setEditItem(item); setEditName(item.name ?? ""); setEditEventType(item.eventType);
  };

  const saveEdit = async () => {
    if (!editItem?.id || !editName.trim()) { notifications.warning("Special leave name is required."); return; }
    setBusy(true);
    try {
      const response = await updateSpecialLeave(editItem.id, { ...editItem, name: editName.trim(), eventType: editEventType });
      if (!response.data?.success) { notifications.warning(response.data?.message ?? "Unable to edit special leave."); return; }
      setEditItem(null); notifications.success("Special leave updated successfully."); await loadData();
    } catch { notifications.error("Unable to edit special leave."); }
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
    <Card
      sx={{
        mb: showHeader ? 2 : 0,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2}>
        {showHeader && (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <BoxTitle />
            <Button
              size="small"
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setCreateOpen(true)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              Add special leave
            </Button>
          </Stack>
        )}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Alert severity="info" sx={{ flex: 1, borderRadius: 2 }}>
            Only lifecycle special leaves appear here. Normal Leave Policies remain managed in Leave Management.
          </Alert>
          {canEdit && (
            <Button
              size="small"
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setCreateOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
                height: 40,
                px: 2,
              }}
            >
              Add special leave
            </Button>
          )}
        </Stack>
        {/* {message && <Alert severity={message.startsWith("Unable") ? "error" : "success"}>{message}</Alert>} */}
        {loading ? <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack> : specialLeaves.length === 0 ? <Alert severity="warning">No special leaves are configured.</Alert> : specialLeaves.map((item, index) => {
          const policy = leavePolicies.find(p => p.id === item.leavePolicyId);
          const linked = Boolean(item.leavePolicyId);
          const displayName = item.name || policy?.name || item.eventType?.replace(/([a-z])([A-Z])/g, "$1 $2") || "Special leave";
          return (
            <Accordion
              key={item.id ?? `${item.eventType}-${index}`}
              disableGutters
              sx={{
                mb: 1.5,
                borderRadius: "12px !important",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                "&:before": { display: "none" },
                overflow: "hidden",
                bgcolor: "background.paper",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRounded />} sx={{ px: 2.5, py: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%", pr: 1 }}>
                  <Typography sx={{ fontWeight: 750, flex: 1, fontSize: "0.95rem" }}>
                    {displayName}
                  </Typography>
                  <Chip
                    size="small"
                    label={linked ? "Linked" : "Not linked"}
                    color={linked ? "success" : "default"}
                    variant={linked ? "filled" : "outlined"}
                    sx={{ fontWeight: 650, height: 24 }}
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0, borderTop: "1px solid", borderColor: "divider" }}>
                <Stack spacing={1.75} sx={{ pt: 1.5 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                    <div>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Leave Policy:</strong> {policy?.name ?? "No Leave Policy linked"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <strong>Event Type:</strong> {item.eventType?.replace(/([a-z])([A-Z])/g, "$1 $2")} · <strong>Effective:</strong> {dateText(item.effectiveFromUtc)}
                      </Typography>
                    </div>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      {canEdit && !linked && (
                        <Button size="small" variant="outlined" startIcon={<LinkRounded />} disabled={busy} onClick={() => { setLinkItem(item); setLinkPolicyId(""); }} sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 650 }}>
                          Link
                        </Button>
                      )}
                      {canEdit && (
                        <Button size="small" variant="outlined" startIcon={<EditRounded />} disabled={busy} onClick={() => openEdit(item)} sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 650 }}>
                          Edit
                        </Button>
                      )}
                      {canEdit && linked && (
                        <Button size="small" variant="outlined" disabled={busy} onClick={() => void unlinkCard(item.id!)} sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 650 }}>
                          Unlink
                        </Button>
                      )}
                      {canEdit && (
                        <Button size="small" color="error" variant="outlined" disabled={busy} startIcon={<DeleteOutlineRounded />} onClick={() => setDeleteId(item.id ?? null)} sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 650 }}>
                          Delete
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Card>
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


