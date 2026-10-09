import { Box, Stack, Typography } from "@mui/material";
import { AppAlert, AppButton } from "../../../shared/components/ui";

export type PayrollProcessingFailure = {
  message: string;
  issues: Array<{ field: string; message: string }>;
};

export function payrollProcessingFailure(data: {
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
}): PayrollProcessingFailure {
  const message = data.message || "Payroll could not be generated. Refresh and retry.";
  const structured = (data.errors ?? []).filter((issue) => issue.message).map((issue) => ({
    field: issue.field || "Payroll",
    message: issue.message!,
  }));
  if (structured.length) return { message, issues: structured };
  // Compatibility with older servers returning all employee failures in one message.
  const prefix = "Payroll validation failed. No payroll records were changed. ";
  if (message.startsWith(prefix)) {
    const issues = message.slice(prefix.length).split("; ").filter(Boolean).map((issue) => {
      const split = issue.indexOf(": ");
      return { field: split < 0 ? "Payroll" : issue.slice(0, split), message: split < 0 ? issue : issue.slice(split + 2) };
    });
    return { message: "Payroll validation failed. No payroll records were changed.", issues };
  }
  return { message, issues: [] };
}

export function PayrollProcessingIssues({ failure, onDismiss, onPolicy, onAttendance }: {
  failure: PayrollProcessingFailure | null;
  onDismiss: () => void;
  onPolicy: () => void;
  onAttendance: () => void;
}) {
  if (!failure) return null;
  const hasPolicy = failure.issues.some((issue) => /policy/i.test(issue.message));
  const hasAttendance = failure.issues.some((issue) => /attendance/i.test(issue.message));
  return (
    <Box component="section" aria-label="Payroll processing issues" sx={{ mb: 2.5, minWidth: 0 }}>
      <AppAlert severity="error" onClose={onDismiss}>
        <Typography variant="body2" fontWeight={700}>{failure.message}</Typography>
        {failure.issues.length > 0 && <Typography variant="body2">Review {failure.issues.length} issue{failure.issues.length === 1 ? "" : "s"} below, then generate payroll again.</Typography>}
      </AppAlert>
      {failure.issues.length > 0 && (
        <Stack spacing={1} sx={{ mt: 1.5, maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
          {failure.issues.map((issue, index) => (
            <Box key={index} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.paper", overflowWrap: "anywhere" }}>
              <Typography variant="body2" fontWeight={700}>{issue.field}</Typography>
              <Typography variant="body2" color="text.secondary">{issue.message}</Typography>
            </Box>
          ))}
        </Stack>
      )}
      {(hasPolicy || hasAttendance) && (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
          {hasPolicy && <AppButton variant="outlined" size="small" onClick={onPolicy}>Review payroll policies</AppButton>}
          {hasAttendance && <AppButton variant="outlined" size="small" onClick={onAttendance}>Review attendance</AppButton>}
        </Stack>
      )}
    </Box>
  );
}
