import React from "react";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";

type Props = {
  open: boolean;
  handleClose: () => void;
};

export default function AddEditPayrollSettings(props: Props) {
  return (
    <CustomisedModal
      open={props.open}
      handleClose={props.handleClose}
      title="Add Payroll Settings"
    >
      AddEditPayrollSettings
    </CustomisedModal>
  );
}
