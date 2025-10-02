import * as React from "react";

import Typography from "@mui/material/Typography";
import { FormHelperText, Grid, MenuItem, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../../../shared/components/CustomisedDatePicker";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { Formik } from "formik";
import { userCertificationSchema } from "../../../../../utils/Schema/userSchema";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import dayjs, { Dayjs } from "dayjs";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import { SelectInput } from "../../../../shared/components/form-component/SelectInput";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import { UserCertificationModel } from "../../models";

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
  const { formatMessage: i } = useIntl();
  const {
    initialValues,
    handleAddUpdateCertification,
    open,
    handleClose,
    isEdit,
  } = props;

  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}
        title={i({ id: isEdit ? "PROFILE.CERTIFICATION.UPDATE" : "PROFILE.CERTIFICATION.ADD" })}
      >
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
                    label={i({ id: "PROFILE.CERTIFICATION.NAME" })}
                    placeholder={i({ id: "PROFILE.CERTIFICATION.NAME" })}
                    type="text"
                    name="certificationTitle"
                  />
                </Grid>

                <Grid item xs={12} sm={6} className="pt-2">
                  <CustomisedDatePicker
                    label={i({
                      id: "FORM.START_DATE",
                    })}
                    name="startDate"
                    value={values.startDate && dayjs(values.startDate)}
                    setValue={(newDate: Dayjs | null) => {
                      setFieldTouched("startDate", true);
                      setFieldValue("startDate", newDate);
                    }}
                    maxDate={dayjs()}
                  />
                  {touched.startDate && errors.startDate &&
                    <ErrorLabel errorLabel={errors.startDate} />
                  }
                </Grid>
                <Grid item xs={12} sm={6} className="pt-2">
                  <CustomisedDatePicker
                    label={i({
                      id: "FORM.END_DATE",
                    })}
                    name="endDate"
                    value={values.endDate && dayjs(values.endDate)}
                    setValue={(newDate: Dayjs | null) => {
                      setFieldTouched("endDate", true);
                      setFieldValue("endDate", newDate);
                    }}
                    minDate={dayjs(values.startDate) || dayjs()}
                  />
                  {touched.endDate && errors.endDate &&
                    <ErrorLabel errorLabel={errors.endDate} />
                  }
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextInput
                    label={i({ id: "FORM.ORGANISATION" })}
                    type="text"
                    placeholder={i({ id: "FORM.ORGANISATION" })}
                    name="organisationName"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectInput
                    name="mode"
                    label={i({ id: "MENU.MODE" })}
                  >
                    <MenuItem value="Online">{i({ id: "ONLINE" })}</MenuItem>
                    <MenuItem value="Offline">{i({ id: "OFFLINE" })}</MenuItem>
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
                  label={i({ id: "BUTTON.CLOSE" })}
                  handleClick={handleClose}
                  variant="outlined"
                />
                <CustomisedButton
                  loading={isSubmitting}
                  label={i({
                    id: isEdit ? "BUTTON.UPDATE" : "BUTTON.SAVE",
                  })}
                  type="submit"
                  disabled={!(isValid && dirty) || isSubmitting}
                />
              </Stack>
            </form>
          )}
        </Formik>
      </CustomisedModal >
    </>
  );
}
