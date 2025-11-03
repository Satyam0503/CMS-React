import {
  Grid,
  Stack,
} from "@mui/material";
import { useIntl } from "react-intl";

import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { WorkHistoryModel } from "../../models";
import { Formik } from "formik";
import { workHistoryValidationSchema } from "../../../../../utils/Schema/workHistoryValidationSchema";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import CustomisedDatePicker from "../../../../shared/components/CustomisedDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { Check } from "@mui/icons-material";
import { FC } from "react";
import { addUpdateWorkHistory } from "../../userservices";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";

type Props = {
  isEdit: boolean,
  open: boolean,
  handleClose: () => void;
  initialValues: WorkHistoryModel,
  refresh: () => void;
}

export const AddUpdateWorkHistory: FC<Props> = ({ isEdit, initialValues, open, handleClose, refresh }) => {
  const { formatMessage } = useIntl();
  const employeeId = useParams().employeeid;

  const handleAddUpdateWorkHistory = async (values: WorkHistoryModel, setSubmitting: (isSubmitting: boolean) => void) => {
    try {
      const payload: WorkHistoryModel = {
        ...values,
        userId: employeeId ?? ""
      }
      const { data } = await addUpdateWorkHistory(payload);
      if (data.success) {
        toast.success(formatMessage({ id: isEdit ? "TOAST.SUCCESS.UPDATE_WORK_HISTORY" : "TOAST.SUCCESS.ADD_WORK_HISTORY" }));
        handleClose();
        refresh();
      } else {
        toast.success(formatMessage({ id: isEdit ? "TOAST.FAILED.UPDATE_WORK_HISTORY" : "TOAST.FAILED.ADD_WORK_HISTORY" }));
      }
    } catch (error) {
      console.error("Failed to fetch employee work history")
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}
        title={
          isEdit ?
            formatMessage({ id: "WORKHISTORY.UPDATE" }) :
            formatMessage({ id: "WORKHISTORY.ADD" })
        }
      >
        <Formik
          initialValues={initialValues}
          onSubmit={(values, { setSubmitting }) => {
            handleAddUpdateWorkHistory(values, setSubmitting)
          }}
          validationSchema={workHistoryValidationSchema}
        >
          {
            ({ values, errors, handleSubmit, touched, setFieldValue, setFieldTouched, ...formik }) => (
              <form onSubmit={handleSubmit}>
                <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2 }}>
                  <Grid size={12}>
                    <TextInput
                      label={formatMessage({ id: "FORM.JOB_ROLE" })}
                      placeholder={formatMessage({ id: "FORM.JOB_ROLE" })}
                      type="text"
                      name="jobRole"
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <CustomisedDatePicker
                      label={formatMessage({ id: "FORM.START_DATE" })}
                      name="startDate"
                      value={values.startDate && dayjs(values.startDate)}
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("startDate", true);
                        setFieldValue("startDate", newDate);
                      }}
                      maxDate={dayjs()}
                    />
                    {touched.startDate &&
                      errors.startDate &&
                      <ErrorLabel errorLabel={errors.startDate} />
                    }
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <CustomisedDatePicker
                      label={formatMessage({
                        id: "FORM.END_DATE",
                      })}
                      name="endDate"
                      value={values.endDate && dayjs(values.endDate)}
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("endDate", true);
                        setFieldValue("endDate", newDate);
                      }}
                      minDate={dayjs(values.startDate) || dayjs()}
                      maxDate={dayjs()}
                    />
                    {touched.endDate &&
                      errors.endDate &&
                      <ErrorLabel errorLabel={errors.endDate} />
                    }
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6
                    }}>
                    <TextInput
                      label={formatMessage({ id: "FORM.ORGANISATION" })}
                      placeholder={formatMessage({ id: "FORM.ORGANISATION" })}
                      type="text"
                      name="organisationName"
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      md: 6
                    }}>
                    <TextInput
                      label={formatMessage({ id: "FORM.LOCATION" })}
                      placeholder={formatMessage({ id: "FORM.LOCATION" })}
                      type="text"
                      name="jobLocation"
                    />
                  </Grid>
                </Grid>
                <Stack
                  direction={"row"}
                  spacing={1}
                  sx={{
                    justifyContent: "flex-end",
                    mt: 2
                  }}>
                  <CustomisedButton
                    label={formatMessage({ id: "BUTTON.CANCEL" })}
                    handleClick={handleClose}
                    variant="outlined"
                  />
                  <CustomisedButton loading={formik.isSubmitting} Icon={<Check />} label={formatMessage({ id: isEdit ? "BUTTON.UPDATE" : "BUTTON.SAVE" })} type="submit" />
                </Stack>
              </form>
            )
          }
        </Formik>

      </CustomisedModal>
    </>
  );
}
