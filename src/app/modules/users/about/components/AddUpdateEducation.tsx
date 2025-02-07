import { Add, Check } from "@mui/icons-material";
import {
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";

import { Formik } from "formik";
import dayjs, { Dayjs } from "dayjs";
import { UserEducationModel } from "../../../../../utils/common_types";
import { CustomisedModal } from "../../../components/CustomisedModal";
import { userEducationSchema } from "../../../../../utils/Schema/userSchema";
import { TextInput } from "../../../components/form_component/TextInput";
import CustomisedDatePicker from "../../../components/CustomisedDatePicker";
import CustomisedButton from "../../../components/CustomisedButton";

import { SelectInput } from "../../../components/form_component/SelectInput";
import { EducationType } from "../../../../../utils/constant/Constant";

type PropTypes = {
  isEdit: boolean;
  open: boolean;
  handleAddUpdateEducation: (
    value: UserEducationModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
  initialValues: UserEducationModel;
  handleClose: () => void;
};

export default function AddUpdateEducation(props: PropTypes) {
  const intl = useIntl();
  const { open, initialValues, handleClose, handleAddUpdateEducation, isEdit } =
    props;
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack>
        <Typography variant="h5" mb={2}>
          {isEdit
            ? intl.formatMessage({ id: "PROFILE.UPDATE_EDUCATION" })
            : intl.formatMessage({ id: "PROFILE.EDUCATION" })}
        </Typography>
      </Stack>

      <Formik
        initialValues={initialValues}
        validationSchema={userEducationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddUpdateEducation(values, setSubmitting);
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
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12}>
                <TextInput
                  label={intl.formatMessage({ id: "INFO.TITLE" })}
                  placeholder="Title"
                  type="text"
                  name="educationTitle"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={0.5}>
                  <Typography variant="body1">
                    {intl.formatMessage({
                      id: "APPLICATION.START",
                    })}
                  </Typography>
                  <CustomisedDatePicker
                    name="startDate"
                    value={values.startDate}
                    setValue={(newDate: Dayjs | null) => {
                      setFieldTouched("startDate", true);
                      setFieldValue("startDate", newDate);
                    }}
                    maxDate={dayjs()}
                  />
                  <FormHelperText>
                    {touched.startDate && errors.startDate && errors.startDate}
                  </FormHelperText>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={0.5}>
                  <Typography variant="body1">
                    {intl.formatMessage({
                      id: "APPLICATION.END",
                    })}
                  </Typography>
                  <CustomisedDatePicker
                    name="endDate"
                    value={values.endDate}
                    setValue={(newDate: Dayjs | null) => {
                      setFieldTouched("endDate", true);
                      setFieldValue("endDate", newDate);
                    }}
                    minDate={dayjs(values.startDate)}
                  />
                  <FormHelperText>
                    {touched.endDate && errors.endDate && errors.endDate}
                  </FormHelperText>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextInput
                  label={intl.formatMessage({
                    id: "MENU.COLLEGE.NAME",
                  })}
                  type="text"
                  placeholder="College Name"
                  name="collegeName"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SelectInput
                  label={intl.formatMessage({ id: "FORM.TYPE" })}
                  name="type"
                >
                  {EducationType.map((item) => (
                    <MenuItem key={item.id} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </SelectInput>
              </Grid>
            </Grid>
            <Stack direction={"row"} spacing={1} justifyContent={"end"} mt={2}>
              <CustomisedButton
                variant="outlined"
                size="medium"
                label="Cancel"
                handleClick={handleClose}
              />
              <CustomisedButton
                variant="outlined"
                size="medium"
                label="Add New"
                Icon={<Add />}
              />
              <CustomisedButton
                variant="contained"
                size="medium"
                label="Save"
                type="submit"
                disabled={!(isValid && dirty) || isSubmitting}
                Icon={<Check />}
              />
            </Stack>
          </form>
        )}
      </Formik>
    </CustomisedModal>
  );
}
