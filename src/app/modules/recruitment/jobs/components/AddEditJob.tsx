import {
  DeleteOutline } from "@mui/icons-material";
import {
  Divider,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../../shared/components/C_Modal";
import CustomisedButton from "../../../../shared/components/C_Button";
import TextEditor from "../../../../shared/components/TextEditor";
import { useFormik } from "formik";
import jobSchema from "../../../../../utils/Schema/jobSchema";
import { JobType } from "../../../../../utils/constant/Constant";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import { blockInvalidCharOnNumberField } from "../../../../../utils/common";
import { JobModal } from "../../models";

import { AppSelect, AppSwitch, AppTextField } from "../../../../shared/components/ui";
import { getAllDepartments } from "../../../admin/adminservices";
import { DepartmentModel } from "../../../admin/models";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../../Redux/hooks";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
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

const FormSwitch = ({ label, description, checked, disabled = false, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2, minWidth: 240, flex: 1 }}>
    <AppSwitch disabled={disabled} checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <Stack>
      <Typography variant="body2" fontWeight={750}>{label}</Typography>
      <Typography variant="caption" color="text.secondary">{description}</Typography>
    </Stack>
  </Stack>
);

export const AddEditJob: FC<PropsTypes> = ({
  initialValues,
  isEdit,
  open,
  handleClose,
  handleAddEditJob,
}) => {
  const { formatMessage: i } = useIntl();
  const { currentLanguage } = useAppLang();
  const defaultLanguage = useAppSelector((state) => state.user.userData?.defaultLanguage) || "en";
  const [departments, setDepartments] = useState<DepartmentModel[]>([]);
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

  const listValue = (field: keyof JobModal) =>
    ((values[field] as string[] | undefined) ?? []).join(", ");
  const setListValue = (field: keyof JobModal, value: string) =>
    formik.setFieldValue(field, value.split(",").map((item) => item.trim()).filter(Boolean));

  useEffect(() => {
    if (!open) return;
    getAllDepartments(true)
      .then(({ data }) => data.success && setDepartments(data.methodResults ?? []))
      .catch(() => setDepartments([]));
  }, [open]);

  const departmentName = (department: DepartmentModel) =>
    department.titles[currentLanguage] ||
    department.titles[defaultLanguage] ||
    Object.values(department.titles)[0] ||
    "Unnamed department";

  return (
    <CustomisedModal open={open} handleClose={handleClose} maxWidth="lg" allowMaximize
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
              <AppTextField
                fullWidth
                placeholder={i({ id: "JOB.JOB_TITLE" })}
                variant="outlined"
                type="text"
                error={touched.title && Boolean(errors.title)}
                {...getFieldProps("title")}
              />
              <FormHelperText>Public role name used in search results and applications.</FormHelperText>
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
              <AppTextField
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
              <FormHelperText>Number of openings for this role.</FormHelperText>
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
              <AppSelect
                fullWidth
                error={touched.jobType && Boolean(errors.jobType)}
                {...getFieldProps("jobType")}
                onChange={(event) => {
                  const jobType = Number(event.target.value);
                  formik.setFieldValue("jobType", jobType);
                  formik.setFieldValue("workplaceType",
                    jobType === 3 ? "Remote" : jobType === 2 ? "Hybrid" : "On-site");
                }}
              >
                {JobType.map((job) => (
                  <MenuItem key={job.id} value={job.value}>
                    {i({ id: job.label })}
                  </MenuItem>
                ))}
              </AppSelect>
              <FormHelperText>Controls where the employee works: Onsite, Hybrid, or Remote. The public work-mode filter uses this value.</FormHelperText>
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
              <AppSwitch
                checked={values.status}
                onChange={(event) => {
                  formik.setFieldValue("status", event.target.checked);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
              <FormHelperText>Only active jobs can appear publicly or accept applications.</FormHelperText>
            </Grid>
          </Grid>

          <Divider sx={{ my: 1.5 }} />
          <Typography variant="h6" fontWeight={800}>Career portal details</Typography>
          <Typography variant="body2" color="text.secondary">
            These details are maintained by the HR or admin user posting the vacancy and are shown to candidates.
          </Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}><AppTextField fullWidth label="Short summary" helperText="One or two candidate-friendly lines shown on job cards." {...getFieldProps("summary")} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><AppTextField fullWidth label="Location" placeholder="City, State" helperText="Physical office or hiring location. For remote roles, enter the eligible region." {...getFieldProps("location")} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AppSelect fullWidth displayEmpty {...getFieldProps("employmentType")}>
                <MenuItem value="">Employment type</MenuItem><MenuItem value="Full-time">Full-time</MenuItem><MenuItem value="Part-time">Part-time</MenuItem><MenuItem value="Contract">Contract</MenuItem><MenuItem value="Internship">Internship</MenuItem>
              </AppSelect>
              <FormHelperText>Contract relationship, separate from the Onsite/Hybrid/Remote work mode above.</FormHelperText>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}><AppTextField fullWidth type="number" label="Min experience" helperText="Minimum years expected." {...getFieldProps("experienceMin")} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><AppTextField fullWidth type="number" label="Max experience" helperText="Maximum target range." {...getFieldProps("experienceMax")} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AppSelect fullWidth displayEmpty {...getFieldProps("department")}>
                <MenuItem value="">Select company department</MenuItem>
                {departments.map((department) => {
                  const name = departmentName(department);
                  return <MenuItem key={department.departmentId} value={name}>{name}</MenuItem>;
                })}
              </AppSelect>
              <FormHelperText>Loaded from this company’s active Department master. The selected name is shown publicly.</FormHelperText>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}><AppTextField fullWidth label="Industry" helperText="Business sector used for discovery filters." {...getFieldProps("industry")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><AppTextField fullWidth label="Functional area" helperText="Broad function, such as Engineering or Sales." {...getFieldProps("functionalArea")} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><AppTextField fullWidth label="Role category" helperText="Specialization within the function." {...getFieldProps("roleCategory")} /></Grid>
            <Grid size={{ xs: 12 }}><AppTextField fullWidth label="Education requirement" helperText="Required degree, certification, or equivalent experience." {...getFieldProps("educationRequirement")} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><AppTextField fullWidth label="Required skills" helperText="Mandatory skills, separated by commas." placeholder="React, TypeScript, API design" value={listValue("requiredSkills")} onChange={(e) => setListValue("requiredSkills", e.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><AppTextField fullWidth label="Preferred skills" helperText="Helpful but optional skills, separated by commas." placeholder="AWS, MongoDB" value={listValue("preferredSkills")} onChange={(e) => setListValue("preferredSkills", e.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><AppTextField fullWidth multiline minRows={2} label="Responsibilities" helperText="Core duties, separated by commas." placeholder="Design APIs, Review code" value={listValue("responsibilities")} onChange={(e) => setListValue("responsibilities", e.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><AppTextField fullWidth multiline minRows={2} label="Benefits" helperText="Candidate benefits, separated by commas." placeholder="Health cover, Flexible hours" value={listValue("benefits")} onChange={(e) => setListValue("benefits", e.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><AppTextField fullWidth label="Keywords" helperText="Extra search terms, separated by commas." placeholder="MERN, SaaS" value={listValue("keywords")} onChange={(e) => setListValue("keywords", e.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <AppSelect fullWidth displayEmpty {...getFieldProps("shiftType")}>
                <MenuItem value="">Select shift</MenuItem><MenuItem value="General">General</MenuItem><MenuItem value="Morning">Morning</MenuItem><MenuItem value="Evening">Evening</MenuItem><MenuItem value="Night">Night</MenuItem><MenuItem value="Rotational">Rotational</MenuItem>
              </AppSelect>
              <FormHelperText>Expected working shift.</FormHelperText>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <AppSelect fullWidth displayEmpty {...getFieldProps("workingDays")}>
                <MenuItem value="">Select working days</MenuItem><MenuItem value="Monday–Friday">Monday–Friday</MenuItem><MenuItem value="Monday–Saturday">Monday–Saturday</MenuItem><MenuItem value="Rotational week">Rotational week</MenuItem><MenuItem value="Flexible">Flexible</MenuItem>
              </AppSelect>
              <FormHelperText>Normal weekly schedule.</FormHelperText>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}><AppTextField fullWidth type="email" label="Recruiter contact email" helperText="Candidate-facing contact for questions about this role." {...getFieldProps("recruiterContactEmail")} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Application deadline"
                  value={values.applicationDeadline ? dayjs(values.applicationDeadline) : null}
                  onChange={(value) => formik.setFieldValue("applicationDeadline", value?.toISOString() ?? null)}
                  minDateTime={dayjs()}
                  ampm
                  timeSteps={{ minutes: 15 }}
                  slotProps={{ textField: { fullWidth: true, helperText: "Final local date and time when applications are accepted." } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Visibility and promotion</Typography>
              <Stack direction={{ xs: "column", lg: "row" }} gap={1.5} flexWrap="wrap">
                <FormSwitch
                  label="Show on company careers"
                  description="Publishes this active role on the company’s six-digit career page."
                  checked={!!values.publishToCareerPortal}
                  onChange={(checked) => {
                    formik.setFieldValue("publishToCareerPortal", checked);
                    if (!checked) formik.setFieldValue("publishToMasterPortal", false);
                  }}
                />
                <FormSwitch
                  label="Show on all-company careers"
                  description="Also lists it on /careers. Requires company-career visibility and the company master setting."
                  disabled={!values.publishToCareerPortal}
                  checked={!!values.publishToCareerPortal && !!values.publishToMasterPortal}
                  onChange={(checked) => formik.setFieldValue("publishToMasterPortal", checked)}
                />
                <FormSwitch
                  label="Featured role"
                  description="Adds a Featured badge and allows the featured-role filter. It does not publish a hidden role."
                  checked={!!values.isFeatured}
                  onChange={(checked) => formik.setFieldValue("isFeatured", checked)}
                />
                <FormSwitch
                  label="Urgent hiring"
                  description="Adds an Urgent hiring badge and filter. It does not bypass status or deadline rules."
                  checked={!!values.isUrgentHiring}
                  onChange={(checked) => formik.setFieldValue("isUrgentHiring", checked)}
                />
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: "grey", my: 1.5 }} />
        <Stack>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Full job description</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Rich candidate-facing overview. Use headings and lists for the role, requirements, and hiring context.
          </Typography>
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
