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
  const { formatMessage: i } = useIntl();
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
    <CustomisedModal open={open} handleClose={handleClose}
      title={isEdit
        ? i({ id: "JOB.DESCRIPTION_EDIT" })
        : i({ id: "JOB.DESCRIPTION" })}
    >
      <form onSubmit={handleSubmit}>
        <Grid container direction={"column"} sx={{
          gap: 1
        }}>
          <Grid
            size={12}
            sx={{
              display: "flex",
              gap: 1
            }}>
            <Grid
              size={{
                xs: 4,
                md: 6
              }}>
              <Typography variant="body1">
                {i({ id: "JOB.JOB_TITLE" })}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 8,
                md: 6
              }}>
              <TextField
                fullWidth
                placeholder={i({ id: "JOB.JOB_TITLE" })}
                variant="outlined"
                type="text"
                error={touched.title && Boolean(errors.title)}
                {...getFieldProps("title")}
              />
              {touched.title && errors.title && <ErrorLabel errorLabel={errors.title} />}
            </Grid>
          </Grid>

          <Grid
            size={12}
            sx={{
              display: "flex",
              gap: 1
            }}>
            <Grid
              size={{
                xs: 4,
                md: 6
              }}>
              <Typography variant="body1">
                {i({ id: "JOB.VACANCIES" })}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 8,
                md: 6
              }}>
              <TextField
                fullWidth
                placeholder={i({ id: "JOB.VACANCIES" })}
                variant="outlined"
                type="number"
                error={touched.vacancies && Boolean(errors.vacancies)}
                {...getFieldProps("vacancies")}
                onKeyDown={(e) => {
                  blockInvalidCharOnNumberField(e);
                }}
                onWheel={(e) => {
                  (e.target as HTMLInputElement).blur();
                }}
                slotProps={{
                  htmlInput: {
                    min: 1,
                  }
                }} />
              {touched.vacancies && errors.vacancies && <ErrorLabel errorLabel={errors.vacancies} />}
            </Grid>
          </Grid>

          <Grid
            size={12}
            sx={{
              display: "flex",
              gap: 1
            }}>
            <Grid
              size={{
                xs: 4,
                md: 6
              }}>
              <Typography variant="body1">
                {i({ id: "JOB.TYPE" })}
              </Typography>
            </Grid>
            <Grid
              size={{
                xs: 8,
                md: 6
              }}>
              <Select
                fullWidth
                error={touched.jobType && Boolean(errors.jobType)}
                {...getFieldProps("jobType")}
              >
                {JobType.map((job) => (
                  <MenuItem key={job.id} value={job.value}>
                    {i({ id: job.label })}
                  </MenuItem>
                ))}
              </Select>
              {touched.jobType && errors.jobType &&
                <ErrorLabel errorLabel={errors.jobType} />
              }
            </Grid>
          </Grid>

          <Grid
            size={12}
            sx={{
              display: "flex",
              alignItems: "center"
            }}>
            <Grid
              size={{
                xs: 4,
                md: 6
              }}>
              <Typography variant="body1">
                {i({ id: "STATUS" })}
              </Typography>
            </Grid>

            <Grid
              size={{
                xs: 8,
                md: 6
              }}
              sx={{
                pl: 0.8
              }}>
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
          {touched.description && errors.description &&
            <ErrorLabel errorLabel={errors.description} />
          }
        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "flex-end",
            mt: 2,
            gap: 1
          }}>
          <CustomisedButton
            variant="outlined"
            label={i({ id: "BUTTON.CLOSE" })}
            handleClick={handleClose}
          />
          <CustomisedButton
            loading={isSubmitting}
            label={i({
              id: isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD",
            })}
            type="submit"
            disabled={isSubmitting || !(dirty && isValid)}
          />
        </Stack>
      </form>
    </CustomisedModal>
  );
};
