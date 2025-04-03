import { FC } from "react";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { Stack, Typography } from "@mui/material";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useIntl } from "react-intl";
import { AddDepartmentPayloadModel } from "../../models";
import { Formik } from "formik";
import * as Yup from "yup";
import { TextInput } from "../../../../shared/components/form-component/TextInput";

interface Props {
  open: true;
  handleClose: () => void;
  handleAddEdit:(value:AddDepartmentPayloadModel,setSubmitting: (isSubmitting: boolean) => void)=>void,
  isEdit: boolean;
  initialValues:AddDepartmentPayloadModel;
}

const validationSchema = Yup.object().shape({
  departmentName: Yup.string().required(),
  departmentDescription: Yup.string().required(),
});

const AddEditDepartment: FC<Props> = ({ open, handleClose, isEdit,handleAddEdit,initialValues }) => {
  const intl = useIntl();
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Typography variant="h5" className="mb-5">
        {intl.formatMessage({ id: "COMPANY_MASTER.ADD_DEPARTMENT" })}
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values,{setSubmitting}) => {
            handleAddEdit(values,setSubmitting);
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              <TextInput
                label={intl.formatMessage({ id: "FORM.DEPARTMENT_NAME" })}
                placeholder={intl.formatMessage({ id: "FORM.DEPARTMENT_NAME" })}
                name="departmentName"
                type="text"
              />
              <TextInput
                label={intl.formatMessage({ id: "FORM.DESCRIPTION" })}
                placeholder={intl.formatMessage({ id: "FORM.DESCRIPTION" })}
                name="departmentDescription"
                type="text"
                multiline={true}
              />
            </Stack>

            <Stack
              direction={"row"}
              spacing={1}
              className="justify-content-end mt-5"
            >
              <CustomisedButton
                label={intl.formatMessage({ id: "BUTTON.CLOSE" })}
                handleClick={handleClose}
                variant="outlined"
              />
              <CustomisedButton
                label={intl.formatMessage({
                  id: isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD",
                })}
                type="submit"
                disabled={formik.isSubmitting}
                loading={formik.isSubmitting}
              />
            </Stack>
          </form>
        )}
      </Formik>
    </CustomisedModal>
  );
};
export { AddEditDepartment };
