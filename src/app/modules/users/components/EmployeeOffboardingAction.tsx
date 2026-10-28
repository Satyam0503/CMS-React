import { CalendarMonth, ExitToApp, InfoOutlined, PersonOff, EventAvailable } from "@mui/icons-material";
import { Alert, Box, Divider, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { AppButton } from "../../../shared/components/ui";
import { getEmployeeExitCaseForManagement, initiateEmployeeExit, updateEmployeeContract } from "../../employees/employeeServices";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { useUserDetails } from "../UserDataProvider";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";

export const EmployeeOffboardingAction = () => {
  const { formatMessage: i } = useIntl();
  const { userDetails, setRefresh } = useUserDetails();
  const currentUserId = useAppSelector((state) => state.user.userData?.userId);
  const permissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exitType, setExitType] = useState<"Resigned" | "Terminated" | "Retired" | "ContractEnded" | "Deceased">("Resigned");
  const [lastWorkingDate, setLastWorkingDate] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState("");
  const [hasActiveExit, setHasActiveExit] = useState<boolean | null>(null);
  const hasOffboarding = permissions.some((p) => p.startsWith("Offboarding."));
  const isOwnProfile = !userDetails.userId || userDetails.userId === currentUserId;
  const canManage = hasOffboarding && !isOwnProfile && hasModuleFeaturePermission(ModulesName.Employees, Permission.Edit, permissions);
  const status = userDetails.employmentStatus ?? "Active";

  useEffect(() => {
    if (!hasOffboarding || !canManage || !userDetails.userId) { setHasActiveExit(false); return; }
    setHasActiveExit(null);
    void getEmployeeExitCaseForManagement(userDetails.userId)
      .then((response) => {
        const exitCase = response.data.success ? response.data.methodResult : null;
        setHasActiveExit(Boolean(exitCase && !["Withdrawn", "Resigned", "Terminated"].includes(exitCase.status)));
      })
      .catch(() => setHasActiveExit(false));
  }, [canManage, userDetails.userId]);

  if (!canManage || hasActiveExit !== false || ["Resigned", "Terminated", "Retired", "ContractEnded", "Deceased"].includes(status)) return null;

  const submit = async () => {
    if (!lastWorkingDate) { toast.error(i({ id: "OFFBOARDING.TOAST_SELECT_DATE", defaultMessage: "Select the last working date." })); return; }
    setSubmitting(true);
    try {
      const response = await initiateEmployeeExit({ employeeUserId: userDetails.userId, exitType, lastWorkingDate: lastWorkingDate.format("YYYY-MM-DD"), reason: reason || undefined });
      if (!response.data.success) throw new Error(response.data.message || i({ id: "OFFBOARDING.TOAST_UNABLE", defaultMessage: "Unable to start offboarding." }));
      toast.success(i({ id: "OFFBOARDING.TOAST_STARTED", defaultMessage: "Offboarding started. The employee is now in notice period." }));
      setOpen(false); setRefresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : i({ id: "OFFBOARDING.TOAST_UNABLE", defaultMessage: "Unable to start offboarding." })); }
    finally { setSubmitting(false); }
  };

  return <>
    <AppButton fullWidth variant="outlined" color="error" size="small" startIcon={<ExitToApp />} onClick={() => setOpen(true)} aria-label={i({ id: "OFFBOARDING.ACTION_BUTTON", defaultMessage: "Offboard employee" })} sx={{ width: "100%", borderRadius: 2, fontWeight: 800, minHeight: 44, px: { xs: 1, sm: 1.5 }, whiteSpace: "nowrap" }}><Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{i({ id: "OFFBOARDING.ACTION_BUTTON", defaultMessage: "Offboard employee" })}</Box><Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>{i({ id: "OFFBOARDING.ACTION_BUTTON_SHORT", defaultMessage: "Offboard" })}</Box></AppButton>
    <CustomisedModal open={open} handleClose={() => !submitting && setOpen(false)} title={<Stack direction="row" spacing={1.25} alignItems="center"><PersonOff color="error" /><Box><Typography fontWeight={800}>{i({ id: "OFFBOARDING.MODAL_TITLE", defaultMessage: "Offboard employee" })}</Typography><Typography variant="caption" color="text.secondary">{i({ id: "OFFBOARDING.MODAL_SUBTITLE", defaultMessage: "Manage a resignation or termination" })}</Typography></Box></Stack>} maxWidth="sm" fullWidth paperSx={{ borderRadius: { xs: 2.5, sm: 3 }, overflow: "hidden", width: { xs: "calc(100% - 24px)", sm: 520 }, maxWidth: "calc(100% - 24px)", m: { xs: 1.5, sm: 4 } }} contentSx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
      <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ pt: 0.5, pb: 0.5 }}>
        <>
          <Alert severity="info" icon={<InfoOutlined />} sx={{ borderRadius: 2, "& .MuiAlert-message": { minWidth: 0 } }}>{i({ id: "OFFBOARDING.ALERT_AUDITABLE", defaultMessage: "This creates an auditable offboarding record. Payroll, leave, attendance and the employee profile are kept." })}</Alert>
          <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, display: "flex", gap: 1, alignItems: "flex-start", borderColor: "primary.light" }}><CalendarMonth color="primary" sx={{ fontSize: 20, mt: 0.1, flex: "0 0 auto" }} /><Box sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={700}>{i({ id: "OFFBOARDING.BANNER_ACTIVE_UNTIL", defaultMessage: "Employee remains active until the selected date" })}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{i({ id: "OFFBOARDING.BANNER_DATA_KEPT", defaultMessage: "No employee or historical data is deleted." })}</Typography></Box></Paper>
          <Divider />
          <TextField select label={i({ id: "OFFBOARDING.EXIT_TYPE", defaultMessage: "Exit type" })} value={exitType} onChange={(e) => setExitType(e.target.value as typeof exitType)} fullWidth>
            <MenuItem value="Resigned">{i({ id: "OFFBOARDING.TYPES.RESIGNED", defaultMessage: "Resignation" })}</MenuItem>
            <MenuItem value="Terminated">{i({ id: "OFFBOARDING.TYPES.TERMINATED", defaultMessage: "Termination" })}</MenuItem>
            <MenuItem value="Retired">{i({ id: "OFFBOARDING.TYPES.RETIRED", defaultMessage: "Retirement" })}</MenuItem>
            <MenuItem value="ContractEnded">{i({ id: "OFFBOARDING.TYPES.CONTRACT_ENDED", defaultMessage: "Contract end" })}</MenuItem>
            <MenuItem value="Deceased">{i({ id: "OFFBOARDING.TYPES.DECEASED", defaultMessage: "Deceased" })}</MenuItem>       
          </TextField>
          <CustomisedDatePicker label={i({ id: "OFFBOARDING.LAST_WORKING_DATE", defaultMessage: "Last working date" })} name="lastWorkingDate" value={lastWorkingDate} setValue={setLastWorkingDate} minDate={userDetails.dateOfJoining ? dayjs(userDetails.dateOfJoining) : undefined} format="DD MMM YYYY" />
          <TextField label={i({ id: "OFFBOARDING.REASON_FOR_EXIT", defaultMessage: "Reason for exit" })} value={reason} onChange={(e) => setReason(e.target.value)} multiline minRows={3} fullWidth placeholder={i({ id: "OFFBOARDING.REASON_PLACEHOLDER", defaultMessage: "Add a short reason for the employee record" })} />
          <AppButton variant="contained" color="error" disabled={submitting} onClick={submit} sx={{ minHeight: 44, borderRadius: 2, fontWeight: 800 }}>{i({ id: "OFFBOARDING.START_OFFBOARDING", defaultMessage: "Start offboarding" })}</AppButton>
        </>
      </Stack>
    </CustomisedModal>
  </>;
};
