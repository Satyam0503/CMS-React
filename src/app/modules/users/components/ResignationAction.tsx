import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import { AppButton } from "../../../shared/components/ui";
import { submitOwnResignation } from "../../employees/employeeServices";
import { useUserDetails } from "../UserDataProvider";
import { useAppSelector } from "../../../Redux/hooks";

export const ResignationAction = () => {
  const { userDetails, setRefresh } = useUserDetails();
  const currentUserId = useAppSelector(state => state.user.userData?.userId);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  if (!currentUserId || userDetails.userId !== currentUserId || userDetails.employmentStatus && userDetails.employmentStatus !== "Active") return null;
  const submit = async () => {
    if (!date) return toast.error("Select your last working date.");
    setSaving(true);
    try {
      const response = await submitOwnResignation({ employeeUserId: currentUserId, exitType: "Resigned", lastWorkingDate: date.format("YYYY-MM-DD"), reason: reason.trim() || undefined });
      if (!response.data.success) throw new Error(response.data.message || "Unable to submit resignation.");
      toast.success("Your resignation has been submitted.");
      setOpen(false);
      setRefresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to submit resignation."); }
    finally { setSaving(false); }
  };
  return <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
    <AppButton color="error" variant="outlined" onClick={() => setOpen(true)}>Resign</AppButton>
    <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Submit resignation</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Your request will be sent to your reporting manager for review.</Typography>
        <CustomisedDatePicker label="Last working date" name="lastWorkingDate" value={date} setValue={setDate} minDate={dayjs()} />
        <TextField label="Reason" value={reason} onChange={event => setReason(event.target.value)} fullWidth multiline minRows={3} sx={{ mt: 2 }} />
      </DialogContent>
      <DialogActions><AppButton variant="text" disabled={saving} onClick={() => setOpen(false)}>Cancel</AppButton><AppButton color="error" variant="contained" disabled={saving} onClick={submit}>{saving ? "Submitting…" : "Submit resignation"}</AppButton></DialogActions>
    </Dialog>
  </Box>;
};
