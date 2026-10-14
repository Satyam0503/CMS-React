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
  defaultEffectiveFrom?: string;
  canApprove?: boolean;
  handleClose: () => void;
  handlePageRefresh: () => void;
}

export const AddUpdateEmployeeSalary = ({
  open,
  userId,
  employeeId,
  employeeName,
  existingSalary,
  defaultEffectiveFrom,
  canApprove,
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
    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "1.15rem",
          border: "1px solid",
          borderColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.2),
          flexShrink: 0,
        }}
      >
        {employeeName ? employeeName.trim().charAt(0).toUpperCase() : "E"}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ rowGap: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", fontSize: "1.1rem", lineHeight: 1.2 }}>
            {employeeName}
          </Typography>
          <Chip
            size="small"
            label={employeeId}
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#F1F5F9"),
              color: (theme) => (theme.palette.mode === "dark" ? "#F1F5F9" : "#334155"),
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              height: 22,
              fontSize: "0.74rem",
            }}
          />
          <Chip
            size="small"
            label="Payroll Structure"
            sx={{
              height: 22,
              fontWeight: 650,
              fontSize: "0.72rem",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              borderRadius: 1.5,
            }}
          />
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.78rem", mt: 0.35, display: "block" }}>
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
        width: "min(1240px, calc(100vw - 32px)) !important",
        maxWidth: "1240px !important",
        maxHeight: "92vh",
        borderRadius: 3.5,
      }}
      contentSx={{
        pt: 1.5,
        pb: 2.5,
        px: { xs: 2, sm: 3 },
        bgcolor: (theme: Theme) => (theme.palette.mode === "dark" ? "background.default" : "#F8FAFC"),
        maxHeight: "calc(92vh - 140px)",
        overflowY: "auto",
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "divider",
          borderRadius: "4px",
        },
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
        defaultEffectiveFrom={defaultEffectiveFrom}
        canApprove={canApprove}
      />
      <EmployeePayrollPenaltyPolicy ref={policyRef} employeeUserId={userId} />
      <DialogActions sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
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
