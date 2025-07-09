import React from "react";
import {
  Typography,
  Grid,
  FormHelperText,
  MenuItem,
  Stack,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Check } from "@mui/icons-material";
import { Formik } from "formik";
import dayjs, { Dayjs } from "dayjs";
import { HolidayType } from "../../../../utils/common_types";
import holidaySchema from "../../../../utils/Schema/holidaySchema";
import { HolidayTypes } from "../../../../utils/constant/Constant";
import SelectInput from "@mui/material/Select/SelectInput";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import CustomisedButton from "../../../shared/components/CustomisedButton";

type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  handleAddUpdateHoliday: (
    values: HolidayType,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
  initialValues: HolidayType;
  isEdit: boolean; /* Line added by Rajdeep */
};

const HolidayForm: React.FC<PropsTypes> = (props) => {
  const intl = useIntl();
  const { open, handleClose, handleAddUpdateHoliday, initialValues, isEdit } = props; // isEdit added by Rajdeep in object destructuring

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={holidaySchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddUpdateHoliday(values, setSubmitting);
        }}
      >
        {({
          values,
          handleSubmit,
          touched,
          errors,
          setFieldTouched,
          setFieldValue,
          isValid,
          dirty,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <Typography variant="h5" mb={2}>
              {/* {intl.formatMessage({ id: "MENU.ADD_HOLIDAYS" })} */}                                                         {/* Original code */}
              {isEdit ? intl.formatMessage({ id: "MENU.EDIT_HOLIDAYS" }) : intl.formatMessage({ id: "MENU.ADD_HOLIDAYS" })}    {/* By Rajdeep */}

            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextInput
                  label={intl.formatMessage({ id: "FORM.TITLE" })}
                  type="text"
                  name="title"
                  placeholder="Holiday Title"
                />
              </Grid>
              {/* <Grid item xs={12} sm={6}>
                <SelectInput
                  label={intl.formatMessage({ id: "FORM.TYPE" })}
                  name="type"
                >
                  {HolidayTypes.map((holiday) => (
                    <MenuItem key={holiday.id} value={holiday.value}>
                      {holiday.label}
                    </MenuItem>
                  ))}
                </SelectInput>
              </Grid> */}

              <Grid item xs={12} sm={6}>
                <CustomisedDatePicker
                  label={intl.formatMessage({ id: "START_DATE" })}
                  value={values.startDate}
                  setValue={(newDate: Dayjs | null) => {
                    setFieldTouched("startDate", true);
                    setFieldValue("startDate", newDate);
                  }}
                  name="startDate"
                  minDate={dayjs()}
                />
                <FormHelperText>
                  {touched.startDate && errors.startDate && errors.startDate}
                </FormHelperText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomisedDatePicker
                  label={intl.formatMessage({ id: "END_DATE" })}
                  value={values.endDate}
                  setValue={(newDate: Dayjs | null) => {
                    setFieldTouched("endDate", true);
                    setFieldValue("endDate", newDate);
                  }}
                  name="endDate"
                  minDate={values.startDate || dayjs()}
                />
                <FormHelperText>
                  {touched.endDate && errors.endDate && errors.endDate}
                </FormHelperText>
              </Grid>

              <Grid item xs={12}>
                <TextInput
                  label={intl.formatMessage({
                    id: "INFO.DESCRIPTION",
                  })}
                  placeholder="Holiday Description"
                  name="description"
                  type="text"
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
                variant="outlined"
                label="Cancel"
                handleClick={handleClose}
              />
              <CustomisedButton
                type="submit"
                disabled={!(isValid && dirty) || isSubmitting}
                variant="contained"
                label="Save"
                Icon={<Check />}
              />
            </Stack>
          </form>
        )}
      </Formik>
    </CustomisedModal>
  );
};

export default HolidayForm;
