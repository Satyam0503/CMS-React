import { Check, FileOpenOutlined, LinkOutlined } from "@mui/icons-material";
import {
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FC, useState } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../modules/components/CustomisedModal";
import CustomisedButton from "../../../modules/components/CustomisedButton";
import TextEditor from "../../../modules/components/TextEditor";
import { useFormik } from "formik";
import jobSchema from "../../../../utils/Schema/jobSchema";
import { JobType } from "../../../../utils/constant/Constant";
import { JobModal } from "../../../../utils/common_types";
import { toast } from "react-toastify";
import Checkbox from "@mui/material/Checkbox";

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
  const [jobDescription, setJobDescription] = useState(
    initialValues.description ? initialValues.description : ""
  );
  const intl = useIntl();

  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  
  const {
    handleSubmit,
    errors,
    touched,
    getFieldProps,
    isSubmitting,
    dirty,
    isValid,
    values
  } = useFormik({
    initialValues,
    validationSchema: jobSchema,
    onSubmit: (values, { setSubmitting }) => {
      if (jobDescription.length === 0) {
        toast.error("Please provide job description");
        setSubmitting(false);
        return;
      }
      values.description = jobDescription;
      handleAddEditJob(values, setSubmitting);
    },
  });
  
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
                  error={touched.vacancies && Boolean(errors.vacancies)}
                  helperText={
                    touched.vacancies && errors.vacancies && errors.vacancies
                  }
                  {...getFieldProps("vacancies")}
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
                <FormHelperText>
                  {touched.jobType && errors.jobType && errors.jobType}
                </FormHelperText>
              </Grid>
            </Grid>

            <Grid item xs={12} display={"flex"} alignItems={"center"}>
              <Grid item xs={4} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "ECOMMERCE.COMMON.ACTIVE" })}
                </Typography>
              </Grid>
              <Checkbox {...getFieldProps("status")} checked={values.status} />

              {/* <Grid item xs={8} md={6}>
                <Select
                  fullWidth
                  variant="outlined"
                  error={touched.status && Boolean(errors.status)}
                  {...getFieldProps("status")}
                >
                  <MenuItem value={"Active"}>Active</MenuItem>
                  <MenuItem value={"Inactive"}>Inactive</MenuItem>
                </Select>
                <FormHelperText>
                  {touched.status && errors.status && errors.status}
                </FormHelperText>
              </Grid> */}
            </Grid>
          </Grid>
          <hr />
          <Stack>
            <TextEditor value={jobDescription} setValue={setJobDescription} />
          </Stack>
          <Stack direction={"row"} justifyContent={"flex-end"} mt={2} gap={1}>
            <CustomisedButton
              variant="outlined"
              label="Page URL"
              Icon={<LinkOutlined />}
              iconPosition="start"
            />
            <CustomisedButton
              variant="contained"
              label="Submissions"
              Icon={<FileOpenOutlined />}
              iconPosition="start"
            />
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
