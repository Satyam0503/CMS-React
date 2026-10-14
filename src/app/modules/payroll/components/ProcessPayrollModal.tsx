import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { AppButton } from "../../../shared/components/ui";
import { PayRollResponseModel } from "../models";
import LockOutlined from "@mui/icons-material/LockOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";

type Props = {
  open: boolean;
  monthLabel: string;
  employees: PayRollResponseModel[];
  processing: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ProcessPayrollModal = ({
  open,
  monthLabel,
  employees,
  processing,
  onClose,
  onConfirm,
}: Props) => (
  <CustomisedModal
    open={open}
    handleClose={processing ? () => undefined : onClose}
    title={`Process & Lock Payroll · ${monthLabel}`}
    maxWidth="sm"
  >
    <Stack spacing={2}>
      <Alert severity="info" sx={{ "& .MuiAlert-message": { width: "100%" } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          What does processing this month do?
        </Typography>
        <Stack spacing={0.5} sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LockOutlined sx={{ fontSize: 16, color: "primary.main" }} />
            <span><strong>Locks salary figures:</strong> Freezes basic pay, allowances, and deductions against accidental edits.</span>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <ReceiptLongOutlined sx={{ fontSize: 16, color: "success.main" }} />
            <span><strong>Publishes payslips:</strong> Unlocks official payslip downloads for all included employees.</span>
          </Stack>
        </Stack>
      </Alert>

      <Typography variant="body2" color="text.secondary">
        You are about to process payroll for <strong>{monthLabel}</strong> across <strong>{employees.length}</strong> employee records.
      </Typography>

      <Box
        sx={{
          maxHeight: 240,
          overflowY: "auto",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          p: 1.5,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          {employees.length} employee{employees.length === 1 ? "" : "s"} ready to process:
        </Typography>
        <Stack spacing={0.5}>
          {employees.map((employee) => (
            <Typography key={employee.employeeId} variant="body2" color="text.secondary">
              • {employee.employeeName} ({employee.employeeId})
            </Typography>
          ))}
        </Stack>
      </Box>

      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ pt: 1 }}>
        <AppButton variant="outlined" disabled={processing} onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton
          color="primary"
          disabled={processing || employees.length === 0}
          onClick={onConfirm}
          startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <LockOutlined fontSize="small" />}
        >
          {processing ? "Processing..." : "Confirm & Process Month"}
        </AppButton>
      </Stack>
    </Stack>
  </CustomisedModal>
);