import { useRef, useState } from "react";
import { FormikProps } from "formik";
import { alpha, Box, Chip, DialogActions, Stack, Theme, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import CustomisedButton from "../../../shared/components/C_Button";
import { UpdateEmployeeSalaryData } from "../../employees/components/UpdateEmployeeSalaryData";
import { EmployeePayrollPenaltyPolicy, EmployeePayrollPenaltyPolicyHandle } from "../../employees/components/EmployeePayrollPenaltyPolicy";
import { CreateEmployeeSalary, SalaryModel } from "../../employees/models";

interface PropsType {
  open: boolean;
  userId: string;
  employeeId: string;
  employeeName: string;
  existingSalary?: SalaryModel | null;
  handleClose: () => void;
  handlePageRefresh: () => void;
}

export const AddUpdateEmployeeSalary = ({
  open,
  userId,
  employeeId,
  employeeName,
  existingSalary,
  handleClose,
  handlePageRefresh,
}: PropsType) => {
  const { formatMessage: i } = useIntl();
  const formRef = useRef<FormikProps<CreateEmployeeSalary> | null>(null);
  const policyRef = useRef<EmployeePayrollPenaltyPolicyHandle | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUserUpdate = async (success: boolean) => {
    if (success) {
      if (!await policyRef.current?.save()) {
        toast.error("Salary was saved, but the employee payroll policy could not be saved. Correct it and save again.");
        return;
      }
      toast.success(i({ id: "PAYROLL_SETTINGS.SALARY_SAVED" }));
      handleClose();
      handlePageRefresh();
    } else {
      toast.error(i({ id: "ERROR.SOMETHING_WRONG" }));
    }
  };

  const handleSave = () => {
    setLoading(true);
    formRef.current?.handleSubmit();
  };

  const modalTitle = (
    <Stack direction="row" alignItems="center" spacing={1.75} flexWrap="wrap">
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2.5,
          bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.12),
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "1.1rem",
        }}
      >
        {employeeName ? employeeName.trim().charAt(0).toUpperCase() : "E"}
      </Box>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography variant="h6" fontWeight={800} color="text.primary">
            {employeeName}
          </Typography>
          <Chip
            size="small"
            label={employeeId}
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 650,
              bgcolor: "action.hover",
              borderRadius: 1.5,
              height: 22,
              fontSize: "0.75rem",
            }}
          />
          <Chip
            size="small"
            label="Payroll Structure"
            color="primary"
            variant="outlined"
            sx={{ height: 22, fontWeight: 650, fontSize: "0.72rem" }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Configure monthly salary components, deductions, effective schedule, and attendance penalty policy.
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <CustomisedModal
      open={open}
      handleClose={handleClose}
      title={modalTitle}
      fullWidth
      maxWidth="lg"
      allowMaximize
      paperSx={{
        width: "min(1220px, calc(100vw - 32px)) !important",
        maxWidth: "1220px !important",
        borderRadius: 3.5,
      }}
      contentSx={{
        pt: 1.5,
        pb: 2.5,
        px: { xs: 2, sm: 3 },
        bgcolor: (theme: Theme) => (theme.palette.mode === "dark" ? "background.default" : "#F8FAFC"),
      }}
    >
      <UpdateEmployeeSalaryData
        userId={userId}
        employeeId={employeeId}
        employeeName={employeeName}
        formRef={formRef}
        handleButtonLoading={setLoading}
        onUserUpdate={handleUserUpdate}
        existingSalary={existingSalary}
      />
      <EmployeePayrollPenaltyPolicy ref={policyRef} employeeUserId={userId} />
      <DialogActions sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <CustomisedButton
          label={i({ id: "BUTTON.CANCEL" })}
          variant="outlined"
          handleClick={handleClose}
        />
        <CustomisedButton
          label={i({ id: "BUTTON.SAVE" })}
          loading={loading}
          handleClick={handleSave}
        />
      </DialogActions>
    </CustomisedModal>
  );
};
