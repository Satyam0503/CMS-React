import { useRef, useState } from "react";
import { FormikProps } from "formik";
import { DialogActions } from "@mui/material";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import CustomisedButton from "../../../shared/components/C_Button";
import { UpdateEmployeeSalaryData } from "../../employees/components/UpdateEmployeeSalaryData";
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
  const [loading, setLoading] = useState(false);

  const handleUserUpdate = (success: boolean) => {
    if (success) {
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
