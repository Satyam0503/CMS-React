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
import CustomisedDatePicker from "../components/CustomisedDatePicker";
import CustomisedButton from "../components/CustomisedButton";
import { Check } from "@mui/icons-material";
import { CustomisedModal } from "../components/CustomisedModal";
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
    setFieldTouched,
    isSubmitting,
    isValid,
    dirty,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: holidaySchema,
    onSubmit: (values, { setSubmitting }) => {
      handleAddUpdateHoliday(values, setSubmitting);
    },
  });

  const handleDateChange = (fieldName: string) => {
    return (newDate: dayjs.Dayjs | null) => {
      setFieldTouched(fieldName, true);
      setFieldValue(fieldName, newDate);
    };
  };
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h5">
          {intl.formatMessage({ id: "MENU.POST_NOTICE" })}
        </Typography>
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
            <FormHelperText>
              {touched.type && errors.type && errors.type}
            </FormHelperText>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "APPLICATION.START" })}*
            </Typography>
            <CustomisedDatePicker
              value={values.startDate}
              setValue={handleDateChange("startDate")}
              name="startDate"
              minDate={dayjs()}
            />
            <FormHelperText>
              {touched.startDate && errors.startDate && errors.startDate}
            </FormHelperText>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "APPLICATION.END" })}*
            </Typography>
            <CustomisedDatePicker
              value={values.endDate}
              setValue={handleDateChange("endDate")}
              name="endDate"
              minDate={values.startDate || dayjs()}
            />
            <FormHelperText>
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
                touched.description && errors.description && errors.description
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
              disabled={!(isValid && dirty) || isSubmitting}
              variant="contained"
              label="Save"
              Icon={<Check />}
            />
          </Grid>
        </Grid>
      </form>
    </CustomisedModal>
  );
};

export default HolidayForm;
