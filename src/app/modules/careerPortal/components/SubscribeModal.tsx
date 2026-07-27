import { MarkEmailReadRounded, NotificationsActiveRounded } from "@mui/icons-material";
import { Box, MenuItem, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { CustomisedModal } from "../../../shared/components";
import { Btn, Txt } from "../../../shared/components/ui";
import { getCareerVisitorToken } from "../hooks/useCareerVisitor";
import { dismissSubscribePopup, subscribe } from "../services/careerPortalService";
import { CareerPreferences } from "../types/careerPortalTypes";

type Props = {
  open: boolean;
  onClose: () => void;
  companyCode?: string;
};

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
    <CustomisedModal open={open} handleClose={close} maxWidth="sm">
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <Box sx={{ width: 58, height: 58, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "primary.lighter", color: "primary.dark" }}>
          {sent ? <MarkEmailReadRounded /> : <NotificationsActiveRounded />}
        </Box>

        {sent ? (
          <>
            <Typography variant="h4" fontWeight={900} sx={{ mt: 3 }}>Check your inbox</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.7 }}>
              Use the verification link we sent before job alerts can begin.
            </Typography>
            <Btn fullWidth variant="contained" onClick={close} sx={{ mt: 3, py: 1.3 }}>
              Done
            </Btn>
          </>
        ) : (
          <>
            <Typography variant="h4" fontWeight={900} sx={{ mt: 3 }}>Let the right role find you</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.7 }}>
              Get thoughtful job recommendations without refreshing this page every day.
            </Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Txt
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <Txt
                label="How often?"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as CareerPreferences["notificationFrequency"])}
                select
              >
                <MenuItem value="Instant">As soon as a role matches</MenuItem>
                <MenuItem value="DailyDigest">Daily digest</MenuItem>
                <MenuItem value="WeeklyDigest">Weekly digest</MenuItem>
              </Txt>
              <Btn
                variant="contained"
                size="large"
                disabled={busy || !email.trim()}
                onClick={submit}
                sx={{ py: 1.35 }}
              >
                {busy ? "Sending..." : "Create job alerts"}
              </Btn>
              <Btn color="inherit" onClick={close}>Not now</Btn>
              <Btn color="inherit" size="small" onClick={doNotShowAgain}>Do not show again</Btn>
            </Stack>
          </>
        )}
      </Box>
    </CustomisedModal>
  );
};
