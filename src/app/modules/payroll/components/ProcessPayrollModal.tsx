import {
  Box,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { AppButton, AppCheckbox } from "../../../shared/components/ui";
import { PayRollResponseModel } from "../models";

type Props = {
  open: boolean;
  monthLabel: string;
  employees: PayRollResponseModel[];
  processing: boolean;
  onClose: () => void;
  onConfirm: (employeeIds: string[]) => void;
};

export const ProcessPayrollModal = ({
  open,
  monthLabel,
  employees,
  processing,
  onClose,
  onConfirm,
}: Props) => {
  const availableIds = useMemo(
    () => employees.map((employee) => employee.employeeId),
    [employees],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) setSelectedIds(availableIds);
  }, [open, availableIds]);

  const allSelected =
    availableIds.length > 0 && selectedIds.length === availableIds.length;
  const partiallySelected =
    selectedIds.length > 0 && selectedIds.length < availableIds.length;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? availableIds : []);
  };

  const toggleEmployee = (employeeId: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked
        ? [...current, employeeId]
        : current.filter((id) => id !== employeeId),
    );
  };

  return (
    <CustomisedModal
      open={open}
      handleClose={processing ? () => undefined : onClose}
      title="Process salary"
      maxWidth="sm"
    >
      <Stack spacing={2.5}>
        <Typography color="text.secondary">
          Confirm the employees whose salary should be processed for{" "}
          <strong>{monthLabel}</strong>. Processed salaries become locked and
          visible to the selected employees.
        </Typography>

        <FormControlLabel
          sx={{ m: 0 }}
          control={
            <AppCheckbox
              checked={allSelected}
              indeterminate={partiallySelected}
              disabled={processing}
              onChange={(event) => toggleAll(event.target.checked)}
            />
          }
          label={`Select all employees (${availableIds.length})`}
        />

        <Divider />

        <Box
          sx={{
            maxHeight: 320,
            overflowY: "auto",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          {employees.map((employee) => (
            <FormControlLabel
              key={employee.employeeId}
              sx={{
                display: "flex",
                m: 0,
                px: 1.5,
                py: 0.75,
                borderBottom: 1,
                borderColor: "divider",
                "&:last-child": { borderBottom: 0 },
              }}
              control={
                <AppCheckbox
                  checked={selectedIds.includes(employee.employeeId)}
                  disabled={processing}
                  onChange={(event) =>
                    toggleEmployee(employee.employeeId, event.target.checked)
                  }
                />
              }
              label={
                <Stack>
                  <Typography fontWeight={600}>{employee.employeeName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {employee.employeeId}
                  </Typography>
                </Stack>
              }
            />
          ))}
        </Box>

        <Typography variant="body2" color="text.secondary">
          {selectedIds.length} of {availableIds.length} employees selected
        </Typography>

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <AppButton variant="outlined" disabled={processing} onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton
            disabled={processing || selectedIds.length === 0}
            onClick={() => onConfirm(selectedIds)}
            startIcon={processing ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {processing ? "Processing..." : "Confirm and process"}
          </AppButton>
        </Stack>
      </Stack>
    </CustomisedModal>
  );
};
