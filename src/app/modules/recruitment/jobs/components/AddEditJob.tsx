import { DeleteOutline } from "@mui/icons-material";
import {
  Divider,
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
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import TextEditor from "../../../../shared/components/TextEditor";
import { useFormik } from "formik";
import jobSchema from "../../../../../utils/Schema/jobSchema";
import { JobType } from "../../../../../utils/constant/Constant";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import { blockInvalidCharOnNumberField } from "../../../../../utils/common";
import { JobModal } from "../../models";

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

export const AddEditJob: FC<PropsTypes> = ({
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
                  onKeyDown={(e) => {
                    blockInvalidCharOnNumberField(e);
                  }}
                  onWheel={(e) => {
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
                  {intl.formatMessage({ id: "ACTIVE" })}
                </Typography>
              </Grid>

              <Grid item xs={8} md={6} pl={0.8}>
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
          <Divider sx={{ bgcolor: "grey", my: 1.5 }} />
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
            {isEdit && (
              <CustomisedButton
                label="Delete"
                Icon={<DeleteOutline />}
                iconPosition="start"
                className="delete-button"
              />
            )}
            <CustomisedButton
              variant="outlined"
              label={intl.formatMessage({ id: "BUTTON.CLOSE" })}
              handleClick={handleClose}
            />
            <CustomisedButton
              loading={isSubmitting}
              label={intl.formatMessage({
                id: isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD",
              })}
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
