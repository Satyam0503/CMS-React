import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { PersonOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import { AppButton, CustomisedModal } from "../../../shared/components";
import { getOwnEmployeeExitCase, submitOwnResignation } from "../../employees/employeeServices";
import { useUserDetails } from "../UserDataProvider";
import { useAppSelector } from "../../../Redux/hooks";

export const ResignationAction = () => {
  const { userDetails, setRefresh } = useUserDetails();
  const currentUserId = useAppSelector(state => state.user.userData?.userId);
  const permissions = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
  const hasOffboarding = permissions.some((p) => p.startsWith("Offboarding."));
  const [date, setDate] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasActiveExitCase, setHasActiveExitCase] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!hasOffboarding || !currentUserId || userDetails.userId !== currentUserId) {
      setHasActiveExitCase(undefined);
      return;
    }
    let isCurrent = true;
    getOwnEmployeeExitCase(currentUserId)
      .then((response) => {
        if (isCurrent) setHasActiveExitCase(Boolean(response.data.success && response.data.methodResult && response.data.methodResult.status !== "Withdrawn"));
      })
      .catch(() => {
        // The resignation endpoint remains the authority; do not leave the
        // profile action permanently unavailable after a transient lookup error.
        if (isCurrent) setHasActiveExitCase(false);
      });
    return () => { isCurrent = false; };
  }, [hasOffboarding, currentUserId, userDetails.userId, userDetails.employmentStatus]);

  if (!hasOffboarding || !currentUserId || userDetails.userId !== currentUserId || userDetails.employmentStatus && userDetails.employmentStatus !== "Active" || hasActiveExitCase !== false) return null;
  const submit = async () => {
    if (!date) return toast.error("Select your last working date.");
    setSaving(true);
    try {
      const response = await submitOwnResignation({ employeeUserId: currentUserId, exitType: "Resigned", lastWorkingDate: date.format("YYYY-MM-DD"), reason: reason.trim() || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to submit resignation.");
      toast.success("Your resignation has been submitted.");
      setHasActiveExitCase(true);
      setOpen(false);
      setRefresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to submit resignation."); }
    finally { setSaving(false); }
  };
  return <Box sx={{ width: "100%" }}>
    <AppButton fullWidth color="error" variant="outlined" startIcon={<PersonOff />} onClick={() => setOpen(true)} sx={{ minHeight: 46, borderRadius: 2, transition: "transform .2s ease, box-shadow .2s ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 20px rgba(211, 47, 47, .16)" } }}>Start resignation</AppButton>
    <CustomisedModal open={open} handleClose={() => !saving && setOpen(false)} maxWidth="sm" fullWidth paperSx={{ width: { xs: "calc(100% - 24px)", sm: 560 }, maxWidth: "calc(100% - 24px)", borderRadius: 3 }} contentSx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }} title="Submit resignation">
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">Your request will be sent to your reporting manager for review. You can withdraw it before the exit is completed.</Typography>
        <CustomisedDatePicker label="Last working date" name="lastWorkingDate" value={date} setValue={setDate} minDate={dayjs()} />
        <TextField label="Reason" value={reason} onChange={event => setReason(event.target.value)} fullWidth multiline minRows={3} />
        <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent="flex-end" gap={1}><AppButton variant="text" disabled={saving} onClick={() => setOpen(false)}>Cancel</AppButton><AppButton color="error" variant="contained" disabled={saving} onClick={submit}>{saving ? "Submitting…" : "Submit resignation"}</AppButton></Stack>
      </Stack>
    </CustomisedModal>
  </Box>;
};
