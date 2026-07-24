import {
  CloseRounded,
  MarkEmailReadRounded,
  NotificationsActiveRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { getCareerVisitorToken } from "../hooks/useCareerVisitor";
import { dismissSubscribePopup, subscribe } from "../services/careerPortalService";
import { CareerPreferences } from "../types/careerPortalTypes";

type Props = { open: boolean; onClose: () => void; companyCode?: string };

export const SubscribeModal = ({ open, onClose, companyCode }: Props) => {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] =
    useState<CareerPreferences["notificationFrequency"]>("DailyDigest");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const close = () => {
    dismissSubscribePopup(getCareerVisitorToken(), companyCode, 7).catch(() => undefined);
    onClose();
  };
  const doNotShowAgain = () => {
    dismissSubscribePopup(getCareerVisitorToken(), companyCode, 180).catch(() => undefined);
    onClose();
  };
  const submit = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      await subscribe(email.trim(), frequency);
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 5, overflow: "hidden" } }}>
      <DialogContent sx={{ p: { xs: 3, sm: 5 }, position: "relative" }}>
        <IconButton onClick={close} sx={{ position: "absolute", right: 16, top: 16 }}><CloseRounded /></IconButton>
        <Box sx={{ width: 58, height: 58, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "primary.lighter", color: "primary.dark" }}>
          {sent ? <MarkEmailReadRounded /> : <NotificationsActiveRounded />}
        </Box>
        {sent ? (
          <>
            <Typography variant="h4" fontWeight={900} sx={{ mt: 3 }}>Check your inbox</Typography>
            <Alert severity="success" sx={{ mt: 2.5, borderRadius: 3 }}>
              Use the verification link we sent before job alerts can begin.
            </Alert>
            <Button fullWidth variant="contained" onClick={close} sx={{ mt: 3, py: 1.3 }}>Done</Button>
          </>
        ) : (
          <>
            <Typography variant="h4" fontWeight={900} sx={{ mt: 3 }}>Let the right role find you</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.7 }}>
              Get thoughtful job recommendations without refreshing this page every day.
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <TextField label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField select label="How often?" value={frequency} onChange={(e) => setFrequency(e.target.value as CareerPreferences["notificationFrequency"])}>
                <MenuItem value="Instant">As soon as a role matches</MenuItem>
                <MenuItem value="DailyDigest">Daily digest</MenuItem>
                <MenuItem value="WeeklyDigest">Weekly digest</MenuItem>
              </TextField>
              <Button variant="contained" size="large" disabled={busy || !email.trim()} onClick={submit} sx={{ py: 1.35 }}>
                {busy ? "Sending…" : "Create job alerts"}
              </Button>
              <Button color="inherit" onClick={close}>Not now</Button>
              <Button color="inherit" size="small" onClick={doNotShowAgain}>Do not show again</Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 2 }}>
              Double opt-in is required. You can unsubscribe at any time.
            </Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
