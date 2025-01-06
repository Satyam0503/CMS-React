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
import { userCertificationSchema } from "../../../utils/validation_schemas";
import { UserCertificationType } from "../../../utils/common_types";
import { CustomisedModal } from "../components/CustomisedModal";

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

  const { values, errors, touched, handleSubmit, getFieldProps } = useFormik({
    initialValues: initialValues,
    validationSchema: userCertificationSchema,
    onSubmit: (values, { setSubmitting }) => {
      handleAddUpdateCertification(values, setSubmitting);
    },
  });

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Typography variant="h5" className="text-primary mb-4">
        {intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2 }}>
          <Grid item xs={12}>
            <Typography>Title</Typography>
            <TextField
              fullWidth
              variant="outlined"
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title && errors.title}
              {...getFieldProps("title")}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography>Start date</Typography>
            <CustomisedDatePicker
              name="startDate"
              value={values.endDate}
              setValue={(newDate) => (values.startDate = newDate)}
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
              setValue={(newDate) => (values.endDate = newDate)}
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
          <Grid item xs={12} sm={6}>
            <Typography>Mode</Typography>
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
          <CustomisedButton label="Save" type="submit" />
        </Stack>
      </form>
    </CustomisedModal>
  );
}
