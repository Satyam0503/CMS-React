import * as React from "react";

import Typography from "@mui/material/Typography";
import { FormHelperText, Grid, MenuItem, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../../components/CustomisedDatePicker";
import CustomisedButton from "../../../components/CustomisedButton";
import { Formik } from "formik";
import { userCertificationSchema } from "../../../../../utils/Schema/userSchema";
import { CustomisedModal } from "../../../components/CustomisedModal";
import dayjs, { Dayjs } from "dayjs";
import { TextInput } from "../../../components/form_component/TextInput";
import { SelectInput } from "../../../components/form_component/SelectInput";
import { UserCertificationModel } from "../../../../../utils/common_types";

type PropTypes = {
  isEdit: boolean;
  open: boolean;
  handleClose: () => void;
  initialValues: UserCertificationModel;
  handleAddUpdateCertification: (
    values: UserCertificationModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
};

export default function AddUpdateCertification(props: PropTypes) {
  const intl = useIntl();

  const {
    initialValues,
    handleAddUpdateCertification,
    open,
    handleClose,
    isEdit,
  } = props;

  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}>
        <Stack spacing={2}>
          <Typography variant="h5">
            {isEdit
              ? intl.formatMessage({ id: "PROFILE.UPDATE_CERTIFICATION" })
              : intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
          </Typography>
          <Formik
            initialValues={initialValues}
            validationSchema={userCertificationSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleAddUpdateCertification(values, setSubmitting);
            }}
          >
            {({
              touched,
              errors,
              values,
              dirty,
              isValid,
              setFieldTouched,
              setFieldValue,
              isSubmitting,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={12}>
                    <TextInput
                      label={intl.formatMessage({ id: "INFO.TITLE" })}
                      placeholder="Certificate Title"
                      type="text"
                      name="certificationTitle"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack>
                      {/* <Typography variant="body1">
                        {intl.formatMessage({
                          id: "APPLICATION.START",
                        })}
                      </Typography> */}
                      <CustomisedDatePicker
                        label={intl.formatMessage({
                          id: "APPLICATION.START",
                        })}
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
                      {/* <Typography>
                        {intl.formatMessage({
                          id: "APPLICATION.END",
                        })}
                      </Typography> */}
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
                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label="Organization Name"
                      type="text"
                      placeholder="Organization Name"
                      name="organisationName"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectInput
                      name="mode"
                      label={intl.formatMessage({ id: "MENU.MODE" })}
                    >
                      <MenuItem value="Online">Online</MenuItem>
                      <MenuItem value="Offline">Offline</MenuItem>
                    </SelectInput>
                  </Grid>
                </Grid>
                <Stack
                  direction={"row"}
                  spacing={1}
                  justifyContent={"flex-end"}
                  mt={2}
                >
                  <CustomisedButton
                    label="Cancel"
                    handleClick={handleClose}
                    variant="outlined"
                  />
                  <CustomisedButton
                    label={isEdit ? "Update" : "Save"}
                    type="submit"
                    disabled={!(isValid && dirty) || isSubmitting}
                  />
                </Stack>
              </form>
            )}
          </Formik>
        </Stack>
      </CustomisedModal>
    </>
  );
}
