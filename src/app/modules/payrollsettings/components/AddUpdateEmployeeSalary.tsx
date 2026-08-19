import { useRef, useState } from "react";
import { FormikProps } from "formik";
import { DialogActions } from "@mui/material";
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

  return (
    <CustomisedModal
      open={open}
      handleClose={handleClose}
      title={employeeName}
    >
      <UpdateEmployeeSalaryData
        userId={userId}
        employeeId={employeeId}
        formRef={formRef}
        handleButtonLoading={setLoading}
        onUserUpdate={handleUserUpdate}
        existingSalary={existingSalary}
      />
      <EmployeePayrollPenaltyPolicy ref={policyRef} employeeUserId={userId} />
      <DialogActions className="mt-4">
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
