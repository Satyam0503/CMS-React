import * as React from "react";

import Typography from "@mui/material/Typography";
import {
  Button,
  FormHelperText,
  Grid,
  Stack,
  TextField,
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

type Props = {
  isEdit: boolean,
  open: boolean,
  handleClose: () => void;
  initialValues: WorkHistoryModel,
  refresh: () => void;
}

export const AddUpdateWorkHistory: React.FC<Props> = ({ isEdit, initialValues, open, handleClose, refresh }) => {
  const intl = useIntl();
  const handleAddUpdateWorkHistory = (values: WorkHistoryModel, setSubmitting: (isSubmitting: boolean) => void) => {
    console.log(values);
  }
  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}>
        <Typography variant="h5" mb={2}>
          {
            isEdit ?
              intl.formatMessage({ id: "PROFILE.EMPLOYMENT" }) :
              intl.formatMessage({ id: "PROFILE.EMPLOYMENT" })
          }
        </Typography>
        <Formik initialValues={initialValues} onSubmit={(values, { setSubmitting }) => {
          handleAddUpdateWorkHistory(values, setSubmitting)
        }}
          validationSchema={workHistoryValidationSchema}
        >
          {
            ({ values, errors, touched, setFieldValue, setFieldTouched }) => (
              <form>
                <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={12}>
                    <TextInput
                      label={intl.formatMessage({ id: "FORM.JOB_ROLE" })}
                      placeholder={intl.formatMessage({ id: "FORM.JOB_ROLE" })}
                      type="text"
                      name="jobRole"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack>
                      <CustomisedDatePicker
                        label={intl.formatMessage({ id: "APPLICATION.START" })}
                        name="startDate"
                        value={values.startDate && dayjs(values.startDate)}
                        setValue={(newDate: Dayjs | null) => {
                          setFieldTouched("startDate", true);
                          setFieldValue("startDate", newDate);
                        }}
                        maxDate={dayjs()}
                      />
                      <FormHelperText>
                        {touched.startDate &&
                          errors.startDate &&
                          errors.startDate}
                      </FormHelperText>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack>
                      <CustomisedDatePicker
                        label={intl.formatMessage({
                          id: "APPLICATION.END",
                        })}
                        name="endDate"
                        value={values.endDate && dayjs(values.endDate)}
                        setValue={(newDate: Dayjs | null) => {
                          setFieldTouched("endDate", true);
                          setFieldValue("endDate", newDate);
                        }}
                        minDate={dayjs(values.startDate) || dayjs()}
                      />
                      <FormHelperText>
                        {touched.endDate && errors.endDate && errors.endDate}
                      </FormHelperText>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextInput
                      label={intl.formatMessage({ id: "FORM.ORGANISATION" })}
                      placeholder={intl.formatMessage({ id: "FORM.ORGANISATION" })}
                      type="text"
                      name="organisationName"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextInput
                      label={intl.formatMessage({ id: "FORM.LOCATION" })}
                      placeholder={intl.formatMessage({ id: "FORM.LOCATION" })}
                      type="text"
                      name="jobLocation"
                    />
                  </Grid>
                </Grid>
                <Stack
                  direction={"row"}
                  spacing={1}
                  justifyContent={"flex-end"}
                  mt={2}
                >
                  <CustomisedButton
                    label={intl.formatMessage({ id: "BUTTON.CANCEL" })}
                    handleClick={handleClose}
                    variant="outlined"
                  />
                  <CustomisedButton label={intl.formatMessage({ id: "BUTTON.SUBMIT" })} type="submit" />
                </Stack>
              </form>
            )
          }
        </Formik>

      </CustomisedModal>
    </>
  );
}
