import { Alert, AlertTitle, Button } from "@mui/material";

interface RecruitmentCapabilityNoticeProps {
  feature: string;
  settingsArea: string;
  disabled?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export default function RecruitmentCapabilityNotice({
  feature,
  settingsArea,
  disabled = true,
  errorMessage,
  onRetry,
  retrying = false,
}: RecruitmentCapabilityNoticeProps) {
  return (
    <Alert
      severity={disabled ? "info" : "error"}
      role="status"
      action={onRetry ? (
        <Button color="inherit" size="small" onClick={onRetry} disabled={retrying}>
          {retrying ? "Checking…" : "Check again"}
        </Button>
      ) : undefined}
      sx={{ borderRadius: 2, alignItems: "center" }}
    >
      <AlertTitle>{disabled ? `${feature} is turned off for this company` : `${feature} is unavailable`}</AlertTitle>
      {disabled
        ? `A recruitment administrator can enable it in Recruitment Settings → ${settingsArea}.`
        : errorMessage || `The ${feature.toLowerCase()} data could not be loaded. Try again shortly.`}
    </Alert>
  );
}
