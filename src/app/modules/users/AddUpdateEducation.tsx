import { Add, Check } from "@mui/icons-material";
import {
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../components/CustomisedDatePicker";
import CustomisedButton from "../components/CustomisedButton";
import { Formik, useFormik } from "formik";
import dayjs, { Dayjs } from "dayjs";
import { EducationType } from "../../../utils/constant/Constant";
import { UserEducationType } from "../../../utils/common_types";
import { CustomisedModal } from "../components/CustomisedModal";
import { userEducationSchema } from "../../../utils/Schema/userSchema";
import { TextInput } from "../components/form_component/TextInput";
import { SelectInput } from "../components/form_component/SelectInput";

type PropTypes = {
  open: boolean;
  handleAddUpdateEducation: (
    value: UserEducationType,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
  initialValues: UserEducationType;
  handleClose: () => void;
};

export default function AddUpdateEducation(props: PropTypes) {
  const intl = useIntl();
  const { open, initialValues, handleClose, handleAddUpdateEducation } = props;
   return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack>
        <Typography variant="h5" mb={2}>
          {intl.formatMessage({ id: "PROFILE.EDUCATION" })}
        </Typography>
      </Stack>

      <Formik
        initialValues={initialValues}
        validationSchema={userEducationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddUpdateEducation(values, setSubmitting);
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12}>
                <TextInput
                  label={intl.formatMessage({ id: "INFO.TITLE" })}
                  placeholder="Title"
                  type="text"
                  name="title"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  {intl.formatMessage({
                    id: "APPLICATION.START",
                  })}
                </Typography>
                <CustomisedDatePicker
                  name="startDate"
                  value={formik.values.startDate}
                  setValue={(newDate: Dayjs | null) => {
                    formik.setFieldTouched("startDate", true);
                   formik.setFieldValue("startDate", newDate);
                  }}
                  maxDate={dayjs()}
                />
                <FormHelperText>
                  {formik.touched.startDate && formik.errors.startDate && formik.errors.startDate}
                </FormHelperText>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  {intl.formatMessage({
                    id: "APPLICATION.END",
                  })}
                </Typography>
                <CustomisedDatePicker
                  name="endDate"
                  value={formik.values.endDate}
                  setValue={(newDate:Dayjs | null)=>{
                    formik.setFieldTouched("endDate", true);
                    formik.setFieldValue("endDate", newDate);
                  }}
                  minDate={dayjs(formik.values.startDate)}
                />
                <FormHelperText>
                  {formik.touched.endDate && formik.errors.endDate &&formik.errors.endDate}
                </FormHelperText>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextInput
                  label={intl.formatMessage({
                    id: "MENU.COLLEGE.NAME",
                  })}
                  type="text"
                  placeholder="College Name"
                  name="collegeName"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectInput
                  label={intl.formatMessage({ id: "MENU.MODE" })}
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
            <Stack
              direction={"row"}
              spacing={1}
              justifyContent={"end"}
              mt={2}
            >
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
                disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                Icon={<Check />}
              />
            </Stack>
          </form>
        )}
      </Formik>
    </CustomisedModal>
  );
}

