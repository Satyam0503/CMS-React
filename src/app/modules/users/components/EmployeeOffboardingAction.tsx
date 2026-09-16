import { CalendarMonth, ExitToApp, InfoOutlined, PersonOff } from "@mui/icons-material";
import { Alert, Box, Divider, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { AppButton } from "../../../shared/components/ui";
import { getEmployeeExitCaseForManagement, initiateEmployeeExit } from "../../employees/employeeServices";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { useUserDetails } from "../UserDataProvider";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";

export const EmployeeOffboardingAction = () => {
  const { userDetails, setRefresh } = useUserDetails();
  const currentUserId = useAppSelector((state) => state.user.userData?.userId);
  const permissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exitType, setExitType] = useState<"Resigned" | "Terminated">("Resigned");
  const [lastWorkingDate, setLastWorkingDate] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState("");
  const [hasActiveExit, setHasActiveExit] = useState<boolean | null>(null);
  const isOwnProfile = !userDetails.userId || userDetails.userId === currentUserId;
  const canManage = !isOwnProfile && hasModuleFeaturePermission(ModulesName.Employees, Permission.Edit, permissions);
  const status = userDetails.employmentStatus ?? "Active";
  useEffect(() => {
    if (!canManage || !userDetails.userId) { setHasActiveExit(false); return; }
    setHasActiveExit(null);
    void getEmployeeExitCaseForManagement(userDetails.userId)
      .then((response) => {
        const exitCase = response.data.success ? response.data.methodResult : null;
        setHasActiveExit(Boolean(exitCase && !["Withdrawn", "Resigned", "Terminated"].includes(exitCase.status)));
      })
      .catch(() => setHasActiveExit(false));
  }, [canManage, userDetails.userId]);

  if (!canManage || hasActiveExit !== false || status === "Resigned" || status === "Terminated") return null;

  const submit = async () => {
    if (!lastWorkingDate) { toast.error("Select the last working date."); return; }
    setSubmitting(true);
    try {
      const response = await initiateEmployeeExit({ employeeUserId: userDetails.userId, exitType, lastWorkingDate: lastWorkingDate.format("YYYY-MM-DD"), reason: reason || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to start offboarding.");
      toast.success("Offboarding started. The employee is now in notice period.");
      setOpen(false); setRefresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to start offboarding."); }
    finally { setSubmitting(false); }
  };

  return <>
    <AppButton fullWidth variant="outlined" color="error" size="small" startIcon={<ExitToApp />} onClick={() => setOpen(true)} aria-label="Offboard employee" sx={{ width: "100%", borderRadius: 2, fontWeight: 800, minHeight: 44, px: { xs: 1, sm: 1.5 }, whiteSpace: "nowrap" }}><Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Offboard employee</Box><Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>Offboard</Box></AppButton>
    <CustomisedModal open={open} handleClose={() => !submitting && setOpen(false)} title={<Stack direction="row" spacing={1.25} alignItems="center"><PersonOff color="error" /><Box><Typography fontWeight={800}>Offboard employee</Typography><Typography variant="caption" color="text.secondary">Manage a resignation or termination</Typography></Box></Stack>} maxWidth="sm" fullWidth paperSx={{ borderRadius: { xs: 2.5, sm: 3 }, overflow: "hidden", width: { xs: "calc(100% - 24px)", sm: 520 }, maxWidth: "calc(100% - 24px)", m: { xs: 1.5, sm: 4 } }} contentSx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
      <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ pt: 0.5, pb: 0.5 }}>
        <>
          <Alert severity="info" icon={<InfoOutlined />} sx={{ borderRadius: 2, "& .MuiAlert-message": { minWidth: 0 } }}>This creates an auditable offboarding record. Payroll, leave, attendance and the employee profile are kept.</Alert>
          <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, display: "flex", gap: 1, alignItems: "flex-start", borderColor: "primary.light" }}><CalendarMonth color="primary" sx={{ fontSize: 20, mt: 0.1, flex: "0 0 auto" }} /><Box sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={700}>Employee remains active until the selected date</Typography><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>No employee or historical data is deleted.</Typography></Box></Paper>
          <Divider />
          <TextField select label="Exit type" value={exitType} onChange={(e) => setExitType(e.target.value as "Resigned" | "Terminated")} fullWidth>
            <MenuItem value="Resigned">Resignation</MenuItem><MenuItem value="Terminated">Termination</MenuItem>
          </TextField>
          <CustomisedDatePicker label="Last working date" name="lastWorkingDate" value={lastWorkingDate} setValue={setLastWorkingDate} minDate={userDetails.dateOfJoining ? dayjs(userDetails.dateOfJoining) : undefined} format="DD MMM YYYY" />
          <TextField label="Reason for exit" value={reason} onChange={(e) => setReason(e.target.value)} multiline minRows={3} fullWidth placeholder="Add a short reason for the employee record" />
          <AppButton variant="contained" color="error" disabled={submitting} onClick={submit} sx={{ minHeight: 44, borderRadius: 2, fontWeight: 800 }}>Start offboarding</AppButton>
        </>
      </Stack>
    </CustomisedModal>
  </>;
};
