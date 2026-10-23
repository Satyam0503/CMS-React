import {
  alpha,
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import TuneRounded from "@mui/icons-material/TuneRounded";
import SpeedRounded from "@mui/icons-material/SpeedRounded";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import RuleOutlined from "@mui/icons-material/RuleOutlined";
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
import { JobModal, RecruitmentEnterpriseConfig } from "../../models";
import { getRecruitmentEnterpriseConfig } from "../../services";

import { AppSelect, AppSwitch, AppTextField } from "../../../../shared/components/ui";
import { getAllDepartments } from "../../../admin/adminservices";
import { DepartmentModel } from "../../../admin/models";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../../Redux/hooks";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useIsDark } from "../../../theme/useIsDark";
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

const commaSeparatedJobFields = [
  "requiredSkills",
  "preferredSkills",
  "responsibilities",
  "benefits",
  "keywords",
  "screeningCriteria",
] as const;

type CommaSeparatedJobField = typeof commaSeparatedJobFields[number];

const serializeCommaSeparatedList = (items?: string[]) => (items ?? []).join(", ");
const parseCommaSeparatedList = (value: string) =>
  value.split(",").map((item) => item.trim()).filter(Boolean);

const FormSwitch = ({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={2}
    sx={{
      p: 1.75,
      height: "100%",
      minHeight: 84,
      boxSizing: "border-box",
      border: "1px solid",
      borderColor: checked ? "primary.main" : "divider",
      borderRadius: "12px",
      bgcolor: checked ? (t) => alpha(t.palette.primary.main, 0.05) : "transparent",
      opacity: disabled ? 0.6 : 1,
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        borderColor: "primary.main",
        transform: "translateY(-1px)",
      },
    }}
  >
    <Stack spacing={0.35} sx={{ minWidth: 0, flex: 1, pr: 1 }}>
      <Typography variant="body2" fontWeight={750} sx={{ fontSize: "0.86rem" }}>{label}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.76rem", lineHeight: 1.4 }}>{description}</Typography>
    </Stack>
    <AppSwitch disabled={disabled} checked={checked} onChange={(event) => onChange(event.target.checked)} sx={{ flexShrink: 0 }} />
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
  const isDark = useIsDark();
  const theme = useTheme();
  const { currentLanguage } = useAppLang();
  const defaultLanguage = useAppSelector((state) => state.user.userData?.defaultLanguage) || "en";
  const [departments, setDepartments] = useState<DepartmentModel[]>([]);
  const [enterpriseConfig, setEnterpriseConfig] = useState<RecruitmentEnterpriseConfig | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState(
    initialValues.description ? initialValues.description : ""
  );
  const [listDrafts, setListDrafts] = useState<Record<CommaSeparatedJobField, string>>(() =>
    Object.fromEntries(commaSeparatedJobFields.map((field) => [field, serializeCommaSeparatedList(initialValues[field])])) as Record<CommaSeparatedJobField, string>,
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

  const setListValue = (field: CommaSeparatedJobField, value: string) => {
    setListDrafts((current) => ({ ...current, [field]: value }));
    formik.setFieldValue(field, parseCommaSeparatedList(value));
  };

  useEffect(() => {
    if (!open) return;
    setListDrafts(Object.fromEntries(
      commaSeparatedJobFields.map((field) => [field, serializeCommaSeparatedList(initialValues[field])]),
    ) as Record<CommaSeparatedJobField, string>);
    getAllDepartments(true)
      .then(({ data }) => data.success && setDepartments(data.methodResults ?? []))
      .catch(() => setDepartments([]));
    getRecruitmentEnterpriseConfig()
      .then(({ data }) => data.success && setEnterpriseConfig(data.methodResult ?? null))
      .catch(() => setEnterpriseConfig(null));
  }, [open]);

  const departmentName = (department: DepartmentModel) =>
    department.titles[currentLanguage] ||
    department.titles[defaultLanguage] ||
    Object.values(department.titles)[0] ||
    "Unnamed department";

  const showWorkflowCustomization = Boolean(enterpriseConfig?.allowJobWorkflowCustomization);

  return (
    <CustomisedModal open={open} handleClose={handleClose} maxWidth="lg" allowMaximize
      title={<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
        <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit" }}>{isEdit ? i({ id: "JOB.DESCRIPTION_EDIT" }) : i({ id: "JOB.DESCRIPTION" })}</Typography>
        <Tooltip title="Field guidance">
          <IconButton size="small" aria-label="Show field guidance" onClick={() => setHelpOpen(true)} sx={{ color: "primary.main", border: 0, p: 0.5, "&:hover": { border: 0, bgcolor: "action.hover" } }}>
            <InfoOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {/* Section 1: Core Role Overview & Status */}
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5, color: "text.primary" }}>
              Role Overview & Status
            </Typography>

            <Grid container spacing={1.75}>
              {/* Job Title */}
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  label={i({ id: "JOB.JOB_TITLE" })}
                  placeholder="e.g. Full Stack Developer - .NET & React"
                  variant="outlined"
                  type="text"
                  error={touched.title && Boolean(errors.title)}
                  helperText="Public role title displayed on career portal and candidate searches."
                  {...getFieldProps("title")}
                />
                {touched.title && errors.title && <ErrorLabel errorLabel={errors.title} />}
              </Grid>

              {/* Vacancies */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AppTextField
                  fullWidth
                  label={i({ id: "JOB.VACANCIES" })}
                  placeholder="e.g. 4"
                  variant="outlined"
                  type="number"
                  error={touched.vacancies && Boolean(errors.vacancies)}
                  helperText="Number of open positions."
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
                    },
                  }}
                />
                {touched.vacancies && errors.vacancies && <ErrorLabel errorLabel={errors.vacancies} />}
              </Grid>

              {/* Job Type (Work Mode) */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth error={touched.jobType && Boolean(errors.jobType)}>
                  <InputLabel id="job-type-select-label">{i({ id: "JOB.TYPE" })}</InputLabel>
                  <AppSelect
                    labelId="job-type-select-label"
                    label={i({ id: "JOB.TYPE" })}
                    {...getFieldProps("jobType")}
                    onChange={(event) => {
                      const jobType = Number(event.target.value);
                      formik.setFieldValue("jobType", jobType);
                      formik.setFieldValue(
                        "workplaceType",
                        jobType === 3 ? "Remote" : jobType === 2 ? "Hybrid" : "On-site"
                      );
                    }}
                  >
                    {JobType.map((job) => (
                      <MenuItem key={job.id} value={job.value}>
                        {i({ id: job.label })}
                      </MenuItem>
                    ))}
                  </AppSelect>
                  <FormHelperText>Work mode: Onsite, Hybrid, or Remote.</FormHelperText>
                  {touched.jobType && errors.jobType && <ErrorLabel errorLabel={errors.jobType} />}
                </FormControl>
              </Grid>

              {/* Status Toggle Card - Clean, full-width, aligned */}
              <Grid size={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                    p: { xs: 1.25, sm: 1.5 },
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: values.status
                      ? isDark ? "rgba(46, 125, 50, 0.4)" : "success.light"
                      : isDark ? "rgba(255, 255, 255, 0.12)" : "divider",
                    bgcolor: values.status
                      ? (t) => alpha(t.palette.success.main, isDark ? 0.08 : 0.04)
                      : (t) => alpha(t.palette.action.hover, isDark ? 0.05 : 0.4),
                    transition: "all 0.2s ease",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <AppSwitch
                      checked={values.status}
                      onChange={(event) => {
                        formik.setFieldValue("status", event.target.checked);
                      }}
                      inputProps={{ "aria-label": "controlled" }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={750}
                        color={values.status ? (isDark ? "success.light" : "success.dark") : "text.secondary"}
                      >
                        {values.status ? "Active Vacancy" : "Draft Vacancy (Inactive)"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {values.status
                          ? "This role is published as active and can be viewed publicly and receive candidate applications."
                          : "Inactive roles are saved as drafts and hidden from career portals."}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    size="small"
                    label={values.status ? "Accepting Applications" : "Draft"}
                    color={values.status ? "success" : "default"}
                    sx={{ fontWeight: 750, height: 24, fontSize: "0.72rem", flexShrink: 0 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Section 2: Career Portal Details */}
          <Box>
            <Box sx={{ mb: 1.75 }}>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                Career portal details
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, display: "block", mt: 0.25 }}>
                These details are maintained by the HR or admin user posting the vacancy and are shown to candidates.
              </Typography>
            </Box>

            <Grid container spacing={1.75}>
              {/* Row 1: Short summary (6) & Location (6) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  label="Short summary"
                  helperText="One or two candidate-friendly lines shown on job cards."
                  placeholder="e.g. Full Stack Developer with 2–4 years of experience..."
                  {...getFieldProps("summary")}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  label="Location"
                  placeholder="e.g. Dehradun, Uttarakhand"
                  helperText="Physical office or hiring location. For remote roles, enter eligible region."
                  {...getFieldProps("location")}
                />
              </Grid>

              {/* Row 2: Employment type (6) & Experience (3 + 3 = 6) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="employment-type-label">Employment type</InputLabel>
                  <AppSelect
                    labelId="employment-type-label"
                    label="Employment type"
                    {...getFieldProps("employmentType")}
                  >
                    <MenuItem value=""><em>Select employment type</em></MenuItem>
                    <MenuItem value="Full-time">Full-time</MenuItem>
                    <MenuItem value="Part-time">Part-time</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                  </AppSelect>
                  <FormHelperText>Contract relationship: Full-time, Part-time, Contract, Internship.</FormHelperText>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <AppTextField
                  fullWidth
                  type="number"
                  label="Min experience (years)"
                  helperText="Minimum years expected."
                  {...getFieldProps("experienceMin")}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <AppTextField
                  fullWidth
                  type="number"
                  label="Max experience (years)"
                  helperText="Maximum target range."
                  {...getFieldProps("experienceMax")}
                />
              </Grid>

              {/* Row 3: Department (6) & Industry (6) - balanced columns */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="department-select-label">Department</InputLabel>
                  <AppSelect
                    labelId="department-select-label"
                    label="Department"
                    {...getFieldProps("department")}
                  >
                    <MenuItem value=""><em>Select company department</em></MenuItem>
                    {values.department && !departments.some((d) => departmentName(d) === values.department) && (
                      <MenuItem value={values.department}>{values.department}</MenuItem>
                    )}
                    {departments.map((department) => {
                      const name = departmentName(department);
                      return <MenuItem key={department.departmentId} value={name}>{name}</MenuItem>;
                    })}
                  </AppSelect>
                  <FormHelperText>Loaded from company Department master. Shown publicly.</FormHelperText>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  label="Industry"
                  helperText="Business sector used for discovery filters."
                  placeholder="e.g. Information Technology & Services"
                  {...getFieldProps("industry")}
                />
              </Grid>

              {/* Row 4: Functional area (6) & Role category (6) - balanced columns */}
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  label="Functional area"
                  helperText="Broad function, such as Software Engineering or Sales."
                  placeholder="e.g. Software Engineering"
                  {...getFieldProps("functionalArea")}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  label="Role category"
                  helperText="Specialization within the functional area."
                  placeholder="e.g. Full Stack Development"
                  {...getFieldProps("roleCategory")}
                />
              </Grid>

              {/* Row 5: Education requirement (12) */}
              <Grid size={{ xs: 12 }}>
                <AppTextField
                  fullWidth
                  label="Education requirement"
                  helperText="Required degree, certification, or equivalent qualification."
                  placeholder="e.g. B.Tech/B.E. in Computer Science, Information Technology, or equivalent qualification"
                  {...getFieldProps("educationRequirement")}
                />
              </Grid>

              {/* Row 6: Required skills (6) & Preferred skills (6) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  label="Required skills"
                  helperText="Mandatory skills, separated by commas."
                  placeholder="React, TypeScript, C#, .NET Core, SQL"
                  value={listDrafts.requiredSkills}
                  onChange={(e) => setListValue("requiredSkills", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  label="Preferred skills"
                  helperText="Helpful but optional skills, separated by commas."
                  placeholder="Azure, Docker, MongoDB, CI/CD, Microservices"
                  value={listDrafts.preferredSkills}
                  onChange={(e) => setListValue("preferredSkills", e.target.value)}
                />
              </Grid>

              {/* Row 7: Responsibilities (6) & Benefits (6) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Responsibilities"
                  helperText="Core duties, separated by commas."
                  placeholder="Design scalable web applications, implement frontend components, participate in code reviews"
                  value={listDrafts.responsibilities}
                  onChange={(e) => setListValue("responsibilities", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Benefits"
                  helperText="Candidate benefits & perks, separated by commas."
                  placeholder="Health insurance, Paid leaves, Flexible working hours, Career growth opportunities"
                  value={listDrafts.benefits}
                  onChange={(e) => setListValue("benefits", e.target.value)}
                />
              </Grid>

              {/* Row 8: Keywords (12) - full width for long keyword tags */}
              <Grid size={{ xs: 12 }}>
                <AppTextField
                  fullWidth
                  label="Keywords"
                  helperText="Extra search keywords & tags, separated by commas."
                  placeholder="Full Stack Developer, .NET Developer, React Developer, Web Applications"
                  value={listDrafts.keywords}
                  onChange={(e) => setListValue("keywords", e.target.value)}
                />
              </Grid>

              {/* Row 9: Shift type (6) & Working days (6) - with clean select labels */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="shift-type-label">Shift type</InputLabel>
                  <AppSelect
                    labelId="shift-type-label"
                    label="Shift type"
                    {...getFieldProps("shiftType")}
                  >
                    <MenuItem value=""><em>Select shift</em></MenuItem>
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Morning">Morning</MenuItem>
                    <MenuItem value="Evening">Evening</MenuItem>
                    <MenuItem value="Night">Night</MenuItem>
                    <MenuItem value="Rotational">Rotational</MenuItem>
                  </AppSelect>
                  <FormHelperText>Expected daily working shift.</FormHelperText>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="working-days-label">Working days</InputLabel>
                  <AppSelect
                    labelId="working-days-label"
                    label="Working days"
                    {...getFieldProps("workingDays")}
                  >
                    <MenuItem value=""><em>Select working days</em></MenuItem>
                    <MenuItem value="Monday–Friday">Monday–Friday</MenuItem>
                    <MenuItem value="Monday–Saturday">Monday–Saturday</MenuItem>
                    <MenuItem value="Rotational week">Rotational week</MenuItem>
                    <MenuItem value="Flexible">Flexible</MenuItem>
                  </AppSelect>
                  <FormHelperText>Normal weekly schedule.</FormHelperText>
                </FormControl>
              </Grid>

              {/* Row 10: Recruiter contact email (6) & Application deadline (6) */}
              <Grid size={{ xs: 12, md: 6 }}>
                <AppTextField
                  fullWidth
                  type="email"
                  label="Recruiter contact email"
                  helperText="Candidate-facing contact for questions about this role."
                  placeholder="recruiter@example.com"
                  {...getFieldProps("recruiterContactEmail")}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Application deadline"
                    value={values.applicationDeadline ? dayjs(values.applicationDeadline) : null}
                    onChange={(value) => formik.setFieldValue("applicationDeadline", value?.toISOString() ?? null)}
                    minDateTime={dayjs()}
                    ampm
                    timeSteps={{ minutes: 15 }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: "Final local date and time when applications are accepted.",
                        sx: {
                          "& .MuiInputAdornment-root .MuiIconButton-root": {
                            border: 0,
                            boxShadow: "none",
                            borderRadius: 1,
                            p: 0.5,
                            "&:hover": { bgcolor: "action.hover" },
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Row 11: Visibility and promotion - responsive 2x2 grid */}
              <Grid size={12}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 1, mb: 1 }}>
                  Visibility and promotion
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 1.5,
                  }}
                >
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
                    description="Also lists it on /careers. Requires company-career visibility and company setting."
                    disabled={!values.publishToCareerPortal}
                    checked={!!values.publishToCareerPortal && !!values.publishToMasterPortal}
                    onChange={(checked) => formik.setFieldValue("publishToMasterPortal", checked)}
                  />
                  <FormSwitch
                    label="Featured role"
                    description="Adds a Featured badge and allows the featured-role filter. Does not publish a hidden role."
                    checked={!!values.isFeatured}
                    onChange={(checked) => formik.setFieldValue("isFeatured", checked)}
                  />
                  <FormSwitch
                    label="Urgent hiring"
                    description="Adds an Urgent hiring badge and filter. Does not bypass status or deadline rules."
                    checked={!!values.isUrgentHiring}
                    onChange={(checked) => formik.setFieldValue("isUrgentHiring", checked)}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {showWorkflowCustomization && (
            <Box
              sx={{
                p: { xs: 2.25, sm: 3 },
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                borderRadius: "14px",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.25)" : "background.paper",
                boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              {/* Header with Title, Description, and Active Badge */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5} sx={{ mb: 2.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  >
                    <TuneRounded sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={850} sx={{ fontSize: "1rem", color: "text.primary" }}>
                      Hiring Workflow & Governance
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.8rem", mt: 0.25 }}>
                      Tailor the recruitment process for this specific vacancy. Fast-track junior or urgent positions with fewer steps, or enforce multi-round panel interviews, scorecards, and verification for senior/compliance roles.
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  size="small"
                  label={
                    values.workflowMode === "Direct"
                      ? "Fast-Track / Direct Hire"
                      : values.workflowMode === "Enterprise"
                      ? "Enterprise Governance"
                      : values.workflowMode === "Standard"
                      ? "Standard Workflow"
                      : "Company Default (Inherit)"
                  }
                  color={
                    values.workflowMode === "Direct"
                      ? "success"
                      : values.workflowMode === "Enterprise"
                      ? "warning"
                      : values.workflowMode === "Standard"
                      ? "primary"
                      : "default"
                  }
                  icon={
                    values.workflowMode === "Direct" ? (
                      <SpeedRounded sx={{ fontSize: "14px !important" }} />
                    ) : values.workflowMode === "Enterprise" ? (
                      <ShieldOutlined sx={{ fontSize: "14px !important" }} />
                    ) : values.workflowMode === "Standard" ? (
                      <AssignmentTurnedInOutlined sx={{ fontSize: "14px !important" }} />
                    ) : (
                      <BusinessOutlined sx={{ fontSize: "14px !important" }} />
                    )
                  }
                  sx={{ fontWeight: 750, height: 26, fontSize: "0.72rem" }}
                />
              </Stack>

              {/* Mode Visual Selector Cards */}
              <Box sx={{ mb: 1.25 }}>
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ fontSize: "0.76rem" }}>
                  Hiring Workflow Mode
                </Typography>
              </Box>
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {[
                  {
                    mode: "Inherit",
                    title: "Company Default",
                    subtitle: "Inherit standard company settings",
                    icon: <BusinessOutlined sx={{ fontSize: 18 }} />,
                  },
                  {
                    mode: "Direct",
                    title: "Fast-Track / Direct Hire",
                    subtitle: "Screening → Direct Offer / Hire",
                    icon: <SpeedRounded sx={{ fontSize: 18 }} />,
                  },
                  {
                    mode: "Standard",
                    title: "Standard",
                    subtitle: "Screening → Interview & Scorecards → Offer",
                    icon: <AssignmentTurnedInOutlined sx={{ fontSize: 18 }} />,
                  },
                  {
                    mode: "Enterprise",
                    title: "Enterprise Governance",
                    subtitle: "Panel Debrief Quorum & Strict Gates",
                    icon: <ShieldOutlined sx={{ fontSize: 18 }} />,
                  },
                ].map((item) => {
                  const active = (values.workflowMode ?? "Inherit") === item.mode;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.mode}>
                      <Box
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          formik.setFieldValue("workflowMode", item.mode);
                          if (item.mode === "Direct") {
                            formik.setFieldValue("requireInterview", false);
                            formik.setFieldValue("requirePreboarding", false);
                          } else if (item.mode === "Enterprise") {
                            formik.setFieldValue("requireInterview", true);
                            formik.setFieldValue("requirePreboarding", true);
                          } else if (item.mode === "Inherit") {
                            formik.setFieldValue("requireInterview", null);
                            formik.setFieldValue("requirePreboarding", null);
                          }
                        }}
                        sx={{
                          p: 2,
                          borderRadius: "12px",
                          border: active ? "2px solid" : "1px solid",
                          borderColor: active
                            ? theme.palette.primary.main
                            : isDark
                            ? "rgba(255, 255, 255, 0.08)"
                            : "#E2E8F0",
                          bgcolor: active
                            ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.05)
                            : isDark
                            ? "rgba(15, 23, 42, 0.3)"
                            : "#FFFFFF",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          height: "100%",
                          minHeight: 88,
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                          <Box sx={{ color: active ? "primary.main" : "text.secondary" }}>{item.icon}</Box>
                          <Typography variant="body2" fontWeight={active ? 850 : 700} color={active ? "primary.main" : "text.primary"}>
                            {item.title}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.74rem", lineHeight: 1.35 }}>
                          {item.subtitle}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Active Pipeline Flow Strip */}
              <Box
                sx={{
                  p: 1.75,
                  mb: 2.5,
                  borderRadius: "12px",
                  border: "1px dashed",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
                  bgcolor: isDark ? "rgba(15, 23, 42, 0.2)" : alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ mr: 0.5, fontSize: "0.76rem" }}>
                    Candidate Flow:
                  </Typography>
                  {(values.workflowMode === "Direct"
                    ? ["1. Apply", "2. Screening Pass", "3. Fast-Track Offer", "4. Hire"]
                    : values.workflowMode === "Enterprise"
                    ? ["1. Requisition", "2. Screening Review", "3. Panel Debrief Quorum", "4. Multi-tier Offer Approval", "5. Preboard & Hire"]
                    : values.workflowMode === "Standard"
                    ? ["1. Apply", "2. Screening Review", "3. Interview Rounds + Scorecards", "4. Offer Approval", "5. Preboard & Hire"]
                    : ["1. Apply", "2. Screening", "3. Company Baseline Flow", "4. Offer", "5. Hire"]
                  ).map((step, idx, arr) => (
                    <Stack direction="row" spacing={0.75} alignItems="center" key={step}>
                      <Chip
                        label={step}
                        size="small"
                        color={idx === arr.length - 1 ? "primary" : "default"}
                        variant={idx === arr.length - 1 ? "filled" : "outlined"}
                        sx={{ height: 24, fontSize: "0.72rem", fontWeight: 750, borderRadius: "6px" }}
                      />
                      {idx < arr.length - 1 && <ArrowForwardRounded sx={{ fontSize: 13, color: "text.disabled" }} />}
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Screening Pass Threshold & Evaluation Criteria Section */}
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.5 }}>
                  <RuleOutlined sx={{ fontSize: 20, color: "primary.main" }} />
                  <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.94rem" }}>
                    Screening Pass Threshold & Evaluation Criteria
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, fontSize: "0.78rem" }}>
                  Define the minimum score needed to pass screening for this specific role, and list customized criteria evaluated during recruiter review.
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <AppTextField
                      fullWidth
                      name="screeningPassScore"
                      label="Minimum Screening Pass Score (%)"
                      type="number"
                      placeholder="E.g. 70"
                      value={values.screeningPassScore ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : Math.max(0, Math.min(100, Number(e.target.value)));
                        formik.setFieldValue("screeningPassScore", val);
                      }}
                      inputProps={{ min: 0, max: 100 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      helperText="Score required to pass candidate screening."
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 8 }}>
                    <AppTextField
                      fullWidth
                      label="Role Screening Criteria (comma-separated)"
                      placeholder="E.g. Relevant experience, Test automation, API testing, Communication"
                      value={listDrafts.screeningCriteria ?? ""}
                      onChange={(e) => setListValue("screeningCriteria", e.target.value)}
                      helperText="Criteria rated by recruiters when screening applicants for this JD."
                    />
                  </Grid>
                </Grid>

                {values.screeningCriteria && values.screeningCriteria.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.85} sx={{ mt: 1.5, alignItems: "center" }}>
                    <Typography variant="caption" fontWeight={750} color="text.secondary" sx={{ fontSize: "0.74rem" }}>
                      Active Criteria:
                    </Typography>
                    {values.screeningCriteria.map((crit, idx) => (
                      <Chip
                        key={idx}
                        size="small"
                        label={crit}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 650, fontSize: "0.72rem", height: 24, borderRadius: "6px" }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Granular Governance Overrides */}
              <Box>
                <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.92rem", mb: 0.35 }}>
                  Granular Stage Gates & Governance Overrides
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, fontSize: "0.78rem" }}>
                  Fine-tune round gates for this opening. When disabled, fast-track transitions are enabled without blocking approvals.
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSwitch
                      label="Require interview rounds before hiring decision"
                      description="When disabled, allows approving candidate for an offer directly from screening."
                      checked={values.requireInterview ?? (values.workflowMode === "Direct" ? false : values.workflowMode === "Enterprise" ? true : false)}
                      onChange={(checked) => formik.setFieldValue("requireInterview", checked)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSwitch
                      label="Require preboarding checklist before employee conversion"
                      description="When disabled, enables 1-click employee creation and fast-track preboarding."
                      checked={values.requirePreboarding ?? (values.workflowMode === "Direct" ? false : values.workflowMode === "Enterprise" ? true : false)}
                      onChange={(checked) => formik.setFieldValue("requirePreboarding", checked)}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </Stack>
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
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Job form guidance</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1} sx={{ "& strong": { color: "text.primary" } }}>
            <Typography variant="body2"><strong>Job title:</strong> Public role name shown in searches and applications.</Typography>
            <Typography variant="body2"><strong>Vacancies:</strong> Number of openings for this role.</Typography>
            <Typography variant="body2"><strong>Job type:</strong> Controls onsite, hybrid, or remote work mode.</Typography>
            <Typography variant="body2"><strong>Career details:</strong> Candidate-facing summary, location, employment type, experience, department, industry, and role information.</Typography>
            <Typography variant="body2"><strong>Skills and lists:</strong> Enter multiple values separated by commas. Spaces inside a skill are allowed.</Typography>
            <Typography variant="body2"><strong>Application deadline:</strong> Final local date and time when applications are accepted.</Typography>
            <Typography variant="body2"><strong>Visibility:</strong> Controls whether the active role appears on company or master career portals.</Typography>
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setHelpOpen(false)}>Close</Button></DialogActions>
      </Dialog>
    </CustomisedModal>
  );
};
