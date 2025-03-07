import { Check, FileOpenOutlined } from "@mui/icons-material";
import {
  Grid,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { FC, useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../modules/components/CustomisedModal";
import CustomisedButton from "../../../modules/components/CustomisedButton";
import TextEditor from "../../../modules/components/TextEditor";
import { useFormik } from "formik";
import jobSchema from "../../../../utils/Schema/jobSchema";
import { JobType } from "../../../../utils/constant/Constant";
import { JobModal } from "../../../../utils/common_types";
import { ErrorLabel } from "../../components/form_component/ErrorLabel";
import { blockInvalidCharOnNumberField } from "../../../../utils/common";

interface PropsTypes {
  initialValues: JobModal;
  isEdit: boolean;
  open: boolean;
  handleClose: () => void;
  handleAddEditJob: (
    values: JobModal,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
}

const JobDescription: FC<PropsTypes> = ({
  initialValues,
  isEdit,
  open,
  handleClose,
  handleAddEditJob,
}) => {
  const intl = useIntl();

  const [jobDescription, setJobDescription] = useState(
    initialValues.description ? initialValues.description : ""
  );

  const {
    handleSubmit,
    errors,
    touched,
    getFieldProps,
    isSubmitting,
    dirty,
    isValid,
    values,
    ...formik
  } = useFormik({
    initialValues,
    validationSchema: jobSchema,
    onSubmit: (values, { setSubmitting }) => {
      handleAddEditJob(values, setSubmitting);
    },
  });

  const handleJobDescriptionChange = useCallback((description: string) => {
    setJobDescription(description);
    formik.setFieldValue("description", description.replace("<p><br></p>", ""));
  }, []);

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack spacing={2}>
        <Typography variant="h5">
          {isEdit
            ? intl.formatMessage({ id: "JOB.DESCRIPTION_EDIT" })
            : intl.formatMessage({ id: "JOB.DESCRIPTION" })}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container direction={"column"} gap={1}>
            <Grid item xs={12} display={"flex"} gap={1}>
              <Grid item xs={4} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "FORM.TITLE" })}
                </Typography>
              </Grid>
              <Grid item xs={8} md={6}>
                <TextField
                  fullWidth
                  placeholder="Job Title"
                  variant="outlined"
                  type="text"
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title && errors.title}
                  {...getFieldProps("title")}
                />
              </Grid>
            </Grid>

            <Grid item xs={12} display={"flex"} gap={1}>
              <Grid item xs={4} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "JOB.VACANCIES" })}
                </Typography>
              </Grid>
              <Grid item xs={8} md={6}>
                <TextField
                  fullWidth
                  placeholder="Vacancies"
                  variant="outlined"
                  type="number"
                  inputProps={{
                    min: 1,
                  }}
                  error={touched.vacancies && Boolean(errors.vacancies)}
                  helperText={
                    touched.vacancies && errors.vacancies && errors.vacancies
                  }
                  {...getFieldProps("vacancies")}
                  onKeyDown={(e)=>{
                    blockInvalidCharOnNumberField(e);
                  }}
                  onWheel={(e)=>{
                    (e.target as HTMLInputElement).blur();
                  }}
                />
              </Grid>
            </Grid>

            <Grid item xs={12} display={"flex"} gap={1}>
              <Grid item xs={4} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "JOB.TYPE" })}
                </Typography>
              </Grid>
              <Grid item xs={8} md={6}>
                <Select
                  fullWidth
                  error={touched.jobType && Boolean(errors.jobType)}
                  {...getFieldProps("jobType")}
                >
                  {JobType.map((job) => (
                    <MenuItem key={job.id} value={job.value}>
                      {job.label}
                    </MenuItem>
                  ))}
                </Select>
                <ErrorLabel>
                  {touched.jobType && errors.jobType && errors.jobType}
                </ErrorLabel>
              </Grid>
            </Grid>

            <Grid item xs={12} display={"flex"} alignItems={"center"}>
              <Grid item xs={4} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "ECOMMERCE.COMMON.ACTIVE" })}
                </Typography>
              </Grid>

              <Grid item xs={8} md={6}>
                <Switch
                  checked={values.status}
                  onChange={(event) => {
                    formik.setFieldValue("status", event.target.checked);
                  }}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </Grid>
            </Grid>
          </Grid>
          <hr />
          <Stack>
            <TextEditor
              value={jobDescription}
              setValue={handleJobDescriptionChange}
            />
            <ErrorLabel>{touched.description && errors.description}</ErrorLabel>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent={"flex-end"}
            mt={2}
            gap={1}
          >
            {/* <CustomisedButton
              variant="contained"
              label="Submissions"
              Icon={<FileOpenOutlined />}
              iconPosition="start"
            /> */}

            <CustomisedButton
              variant="outlined"
              label="Close"
              handleClick={handleClose}
            />
            <CustomisedButton
              label={isEdit ? "Update" : "Publish"}
              Icon={<Check />}
              type="submit"
              iconPosition="start"
              disabled={isSubmitting || !(dirty && isValid)}
            />
          </Stack>
        </form>
      </Stack>
    </CustomisedModal>
  );
};

export default JobDescription;
