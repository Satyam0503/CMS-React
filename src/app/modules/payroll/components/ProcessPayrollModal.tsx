import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { AppButton } from "../../../shared/components/ui";
import { PayRollResponseModel } from "../models";

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
    title="Process salary"
    maxWidth="sm"
  >
    <Stack spacing={2.5}>
      <Typography color="text.secondary">
        Confirm processing payroll for the complete <strong>{monthLabel}</strong> payroll month. All generated employee salaries will be locked together and payslips will become available after successful processing.
      </Typography>
      <Box
        sx={{
          maxHeight: 320,
          overflowY: "auto",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          p: 1.5,
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          {employees.length} generated employee{employees.length === 1 ? "" : "s"} will be processed.
        </Typography>
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {employees.map((employee) => (
            <Typography key={employee.employeeId} variant="body2" color="text.secondary">
              {employee.employeeName} ({employee.employeeId})
            </Typography>
          ))}
        </Stack>
      </Box>
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <AppButton variant="outlined" disabled={processing} onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton
          disabled={processing || employees.length === 0}
          onClick={onConfirm}
          startIcon={processing ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {processing ? "Processing..." : "Confirm and process month"}
        </AppButton>
      </Stack>
    </Stack>
  </CustomisedModal>
);