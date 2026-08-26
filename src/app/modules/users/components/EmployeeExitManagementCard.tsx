import { Alert, Box, Chip, Divider, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { EmployeeExitCase, getEmployeeExitCaseForManagement, reviewEmployeeExit } from "../../employees/employeeServices";
import { AppButton } from "../../../shared/components/ui";
import { toast } from "react-toastify";

type Props = { employeeUserId: string };

export const EmployeeExitManagementCard = ({ employeeUserId }: Props) => {
  const [exitCase, setExitCase] = useState<EmployeeExitCase | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    getEmployeeExitCaseForManagement(employeeUserId)
      .then(response => { if (active && response.data.success) setExitCase(response.data.methodResult); })
      .catch(() => { if (active) setExitCase(null); });
    return () => { active = false; };
  }, [employeeUserId]);
  if (!exitCase) return null;
  const review = async (action: "Approve" | "Reject") => {
    setSaving(true);
    try {
      const response = await reviewEmployeeExit({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, action, notes: notes.trim() || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to update the offboarding case.");
      toast.success(action === "Approve" ? "Offboarding case approved." : "Offboarding case rejected.");
      const refreshed = await getEmployeeExitCaseForManagement(employeeUserId);
      setExitCase(refreshed.data.success ? refreshed.data.methodResult : null);
      setNotes("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update the offboarding case."); }
    finally { setSaving(false); }
  };
  const pending = exitCase.clearances.filter(item => item.status !== "Completed" && item.status !== "Waived");
  return <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, mt: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}><Box><Typography fontWeight={700}>Offboarding management</Typography><Typography variant="body2" color="text.secondary">Last working date: {new Date(exitCase.lastWorkingDate).toLocaleDateString()}</Typography></Box><Chip size="small" label={exitCase.status} /></Stack>
    {pending.length > 0 && <Alert severity="info" sx={{ mt: 1.5 }}>{pending.length} clearance task{pending.length === 1 ? "" : "s"} still pending.</Alert>}
    {(exitCase.permittedActions.includes("Approve") || exitCase.permittedActions.includes("Reject")) && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <TextField size="small" label="Decision note" value={notes} onChange={event => setNotes(event.target.value)} multiline minRows={2} />
      <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
        {exitCase.permittedActions.includes("Approve") && <AppButton variant="contained" color="success" disabled={saving} onClick={() => void review("Approve")}>Approve</AppButton>}
        {exitCase.permittedActions.includes("Reject") && <AppButton variant="outlined" color="error" disabled={saving} onClick={() => void review("Reject")}>Reject</AppButton>}
      </Stack>
    </Stack>}
    <Divider sx={{ my: 1.5 }} />
    <Typography variant="caption" color="text.secondary">Case history</Typography>
    <Stack spacing={0.5} sx={{ mt: 0.5 }}>{exitCase.auditHistory.slice(-5).reverse().map((event, index) => <Typography key={`${event.action}-${event.atUtc}-${index}`} variant="body2">{event.action} · {new Date(event.atUtc).toLocaleString()}</Typography>)}</Stack>
  </Box>;
};
