import { Alert, Box, Chip, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getOwnEmployeeExitCase, EmployeeExitCase, withdrawOwnEmployeeExit } from "../../employees/employeeServices";
import { useUserDetails } from "../UserDataProvider";
import { AppButton } from "../../../shared/components/ui";
import { toast } from "react-toastify";

export const EmployeeExitCaseCard = () => {
  const { userDetails, setRefresh } = useUserDetails();
  const [exitCase, setExitCase] = useState<EmployeeExitCase | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  useEffect(() => {
    if (!userDetails.userId) return;
    getOwnEmployeeExitCase(userDetails.userId).then(response => {
      if (response.data.success) setExitCase(response.data.methodResult);
    }).catch(() => setExitCase(null));
  }, [userDetails.userId]);
  if (!exitCase) return null;
  const withdraw = async () => {
    setWithdrawing(true);
    try {
      const response = await withdrawOwnEmployeeExit({ employeeExitId: exitCase.employeeExitId, version: exitCase.version, reason: withdrawReason.trim() || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to withdraw resignation.");
      toast.success("Your resignation has been withdrawn.");
      setExitCase(null);
      setRefresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to withdraw resignation."); }
    finally { setWithdrawing(false); }
  };
  return <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontWeight={700}>Your offboarding case</Typography><Chip size="small" label={exitCase.status} /></Stack>
    <Typography variant="body2" sx={{ mt: 1 }}>Last working date: {new Date(exitCase.lastWorkingDate).toLocaleDateString()}</Typography>
    {exitCase.clearances.length > 0 && <Alert severity="info" sx={{ mt: 1.5 }}>Clearance tasks: {exitCase.clearances.filter(x => x.status !== "Completed" && x.status !== "Waived").length} pending.</Alert>}
    {exitCase.auditHistory.length > 0 && <Stack spacing={0.5} sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary">Recent activity</Typography>
      {exitCase.auditHistory.slice(-3).reverse().map((event, index) => <Typography key={`${event.action}-${event.atUtc}-${index}`} variant="body2">{event.action} · {new Date(event.atUtc).toLocaleString()}</Typography>)}
    </Stack>}
    {exitCase.permittedActions.includes("Withdraw") && <Stack spacing={1} sx={{ mt: 1.5 }}>
      <TextField size="small" label="Withdrawal reason (optional)" value={withdrawReason} onChange={event => setWithdrawReason(event.target.value)} />
      <AppButton color="warning" variant="outlined" disabled={withdrawing} onClick={withdraw}>{withdrawing ? "Withdrawing…" : "Withdraw resignation"}</AppButton>
    </Stack>}
  </Box>;
};
