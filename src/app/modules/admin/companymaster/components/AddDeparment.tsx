import { FC } from "react";
import { Stack, Typography } from "@mui/material";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useIntl } from "react-intl";
import { Formik } from "formik";
import * as Yup from "yup";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import { DepartmentModel } from "../../models";
import { addDepartment } from "../../adminservices";
import { toast } from "react-toastify";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";

interface Props {
  open: true;
  handleClose: () => void;
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialValues: DepartmentModel = {
  departmentName: "",
  departmentDescription: "",
};

const validationSchema = Yup.object().shape({
  departmentName: Yup.string().required("department name is required"),
  departmentDescription: Yup.string().required("description is required"),
});

const AddDepartment: FC<Props> = ({
  open,
  handleClose,
  refresh,
  setRefresh,
}) => {
  const intl = useIntl();

  const handleAdd = async (
    value: DepartmentModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      const response = await addDepartment(value);
      if (response.data.success) {
        toast.success(response.data.message);
        setRefresh(!refresh);
        handleClose();
      }
    } catch (error) {
      console.log(error instanceof Error ? error.message : error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Typography variant="h5" className="mb-5">
        {intl.formatMessage({ id: "COMPANY_MASTER.ADD_DEPARTMENT" })}
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAdd(values, setSubmitting);
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
                  id: "BUTTON.ADD",
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
export { AddDepartment };
