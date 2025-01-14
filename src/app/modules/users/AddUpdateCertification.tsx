import * as React from "react";

import Typography from "@mui/material/Typography";
import {
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../components/CustomisedDatePicker";
import CustomisedButton from "../components/CustomisedButton";
import { useFormik } from "formik";
import { UserCertificationType } from "../../../utils/common_types";
import { userCertificationSchema } from "../../../utils/Schema/userSchema";
import { CustomisedModal } from "../components/CustomisedModal";
import dayjs, { Dayjs } from "dayjs";

type PropTypes = {
  open: boolean;
  initialValues: UserCertificationType;
  handleAddUpdateCertification: (
    values: UserCertificationType,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
  handleClose: () => void;
};

export default function AddUpdateCertification(props: PropTypes) {
  const intl = useIntl();
  const { open, initialValues, handleAddUpdateCertification, handleClose } =
    props;

  const {
    values,
    errors,
    touched,
    handleSubmit,
    getFieldProps,
    isValid,
    dirty,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: userCertificationSchema,
    onSubmit: (values, { setSubmitting }) => {
      handleAddUpdateCertification(values, setSubmitting);
    },
  });

  const handleDateChange = (fieldName: string) => {
    return (newDate: Dayjs | null) => {
      setFieldTouched(fieldName, true);
      setFieldValue(fieldName, newDate);
    };
  };
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Typography variant="h5" className="text-primary mb-4">
        {intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "INFO.TITLE" })}
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title && errors.title}
              {...getFieldProps("title")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "APPLICATION.START",
              })}
            </Typography>
            <CustomisedDatePicker
              name="startDate"
              value={values.startDate}
              setValue={handleDateChange("startDate")}
              maxDate={dayjs()}
            />
            <FormHelperText sx={{ color: "#d32f2f" }}>
              {touched.startDate && errors.startDate && errors.startDate}
            </FormHelperText>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>End date</Typography>
            <CustomisedDatePicker
              name="endDate"
              value={values.endDate}
              setValue={handleDateChange("endDate")}
              minDate={values.startDate || dayjs()}
            />
            <FormHelperText sx={{ color: "#d32f2f" }}>
              {touched.endDate && errors.endDate && errors.endDate}
            </FormHelperText>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>Organization Name</Typography>
            <TextField
              fullWidth
              error={
                touched.organizationName && Boolean(errors.organizationName)
              }
              helperText={
                touched.organizationName &&
                errors.organizationName &&
                errors.organizationName
              }
              {...getFieldProps("organizationName")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.MODE" })}
            </Typography>
            <Select
              fullWidth
              variant="outlined"
              error={touched.type && Boolean(errors.type)}
              {...getFieldProps("type")}
            >
              <MenuItem value="Online">Online</MenuItem>
              <MenuItem value="Offline">Offline</MenuItem>
            </Select>
            <FormHelperText sx={{ color: "#d32f2f" }}>
              {touched.type && errors.type && errors.type}
            </FormHelperText>
          </Grid>
        </Grid>
        <Stack
          direction={"row"}
          spacing={1}
          className="justify-content-end mt-4"
        >
          <CustomisedButton
            label="Cancel"
            handleClick={handleClose}
            variant="outlined"
          />
          <CustomisedButton
            label="Save"
            type="submit"
            disabled={!(isValid && dirty) || isSubmitting}
          />
        </Stack>
      </form>
    </CustomisedModal>
  );
}
