import React from "react";
import {
  TextField,
  Stack,
  Typography,
  Grid,
  FormHelperText,
  Select,
  MenuItem,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../modules/components/CustomisedDatePicker";
import CustomisedButton from "../../modules/components/CustomisedButton";
import { Check } from "@mui/icons-material";
import { CustomisedModal } from "../../modules/components/CustomisedModal";
import { HolidayType } from "../../../utils/common_types";
import { useFormik } from "formik";
import holidaySchema from "../../../utils/Schema/holidaySchema";
import dayjs from "dayjs";
import { HolidayTypes } from "../../../utils/constant/Constant";

type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  handleAddUpdateHoliday: (
    values: HolidayType,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
  initialValues: HolidayType;
};

const HolidayForm: React.FC<PropsTypes> = (props) => {
  const intl = useIntl();
  const { open, handleClose, handleAddUpdateHoliday, initialValues } = props;
  const {
    values,
    errors,
    touched,
    getFieldProps,
    handleSubmit,
    setFieldValue,
    isSubmitting,
    isValid,
    dirty
  } = useFormik({
    initialValues: initialValues,
    validationSchema: holidaySchema,
    onSubmit: (values, { setSubmitting }) => {
      handleAddUpdateHoliday(values, setSubmitting);
    },
  });

  const handleStartDateChange = (newDate: dayjs.Dayjs | null) => {
    touched.startDate=true;
    setFieldValue("startDate", newDate);
  };

  const handleEndDateChange = (newDate: dayjs.Dayjs | null) => {
    touched.endDate=true;
    setFieldValue("endDate", newDate);
  };
  
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack>
        <Stack>
          <Typography variant="h4" sx={{ pb: "20px" }}>
            {intl.formatMessage({ id: "MENU.HOLIDAYS" })}
          </Typography>
        </Stack>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "FORM.TITLE" })}*
              </Typography>
              <TextField
                fullWidth
                placeholder="Holiday Title"
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title && errors.title}
                {...getFieldProps("title")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "FORM.TYPE" })}*
              </Typography>
              <Select
                placeholder="Holiday Type"
                fullWidth
                error={touched.type && Boolean(errors.type)}
                {...getFieldProps("type")}
              >
                <MenuItem value={""}>None</MenuItem>
                {HolidayTypes.map((holiday) => (
                  <MenuItem key={holiday.id} value={holiday.value}>
                    {holiday.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{ color: "#d32f2f" }}>
                {touched.type && errors.type && errors.type}
              </FormHelperText>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "APPLICATION.START" })}*
              </Typography>
              <CustomisedDatePicker
                value={values.startDate}
                setValue={handleStartDateChange}
                name="startDate"
                minDate={dayjs()}
              />
              <FormHelperText sx={{ color: "#d32f2f" }}>
                {touched.startDate && errors.startDate && errors.startDate}
              </FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "APPLICATION.END" })}*
              </Typography>
              <CustomisedDatePicker
                value={values.endDate}
                setValue={handleEndDateChange}
                name="endDate"
                minDate={dayjs()}
              />
              <FormHelperText sx={{ color: "#d32f2f" }}>
                {touched.endDate && errors.endDate && errors.endDate}
              </FormHelperText>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1">
                {intl.formatMessage({
                  id: "INFO.DESCRIPTION",
                })}
                *
              </Typography>
              <TextField
                fullWidth
                placeholder="Holiday Description"
                error={touched.description && Boolean(errors.description)}
                helperText={
                  touched.description &&
                  errors.description &&
                  errors.description
                }
                {...getFieldProps("description")}
              />
            </Grid>
            <Grid item xs={12} display={"flex"} justifyContent={"end"} gap={2}>
              <CustomisedButton
                variant="outlined"
                label="Cancel"
                handleClick={handleClose}
              />
              <CustomisedButton
                type="submit"
                disabled={!(isValid || dirty) || isSubmitting }
                variant="contained"
                label="Save"
                Icon={<Check />}
              />
            </Grid>
          </Grid>
        </form>
      </Stack>
    </CustomisedModal>
  );
};

export default HolidayForm;
