import {
  Typography,
  Grid,
  Stack,
  MenuItem,
  Container,
  Box,
  Select,
  Tooltip,
  FormControl,
  InputLabel,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useIntl } from "react-intl";
import { CloudUploadOutlined } from "@mui/icons-material";
import { SingleBanner } from "./Component/SingleBanner";
import CustomisedButton from "../../shared/components/CustomisedButton";
import { useEffect, useRef, useState } from "react";
import Footer from "./Component/Footer";
import { colors } from "../theme/MuiTheme";
import { Formik, FormikState } from "formik";
import { SelectInput } from "../../shared/components/form-component/SelectInput";
import { getAllJobVacancies, uploadResume } from "../recruitment/services";

import { ApplicantStatus, ApplicationStatus } from "../../../utils/enums";
import { applyNow } from "./services";
import { toast } from "react-toastify";
import NoVacancy from "./Component/NoVacancy";
import ApplyNowHeader from "./Component/ApplyNowHeader";
import { applicantValidationSchema } from "../../../utils/Schema/applicantValidationSchema";
import { ErrorLabel } from "../../shared/components/form-component/ErrorLabel";
import ReCAPTCHA from "react-google-recaptcha";
import { CircularLoader } from "../../shared/components/CircularLoader";
import { ApplicantModel, JobModal } from "../recruitment/models";
import { experienceCategoryList, indianStates } from "../../../utils/constant/Constant";

const initialValues: ApplicantModel = {
  applicantId: "",
  companyId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  state: "",
  experience: 1,
  resume: null,
  vacancyId: "",
  vacancyName: "",
  status: ApplicantStatus.InActive,
  activityType: ApplicationStatus.New,
};

export default function ApplyNow() {
  const intl = useIntl();
  const companyId = import.meta.env.VITE_COMPANY_KEY;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeJobPositionsList, setActiveJobPositionsList] = useState<
    JobModal[]
  >([]);
  const [selectedJobPosition, setSelectedJobPosition] = useState<
    JobModal | undefined
  >();
  const [formValues, setFromValues] = useState(initialValues);
  const captchaRef = useRef<ReCAPTCHA>(null);
  const captachaKey = import.meta.env.VITE_CAPTCHA_SITE_KEY;

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFieldValue("resume", selectedFile);
    }
  };

  const handleApplicationSubmission = async (
    values: ApplicantModel,
    setSubmitting: (isSubmitting: boolean) => void,
    resetForm: (
      nextState?: Partial<FormikState<ApplicantModel>> | undefined
    ) => void
  ) => {
      const formData = new FormData();
    formData.append("File", values.resume as File);
    const vacancy = activeJobPositionsList.find(
      (job) => job.jobId === values.vacancyId
    );
    const payload = {
      ...values,
      companyId: companyId,
      vacancyName: vacancy ? vacancy.title : "",
      experience: values.experience * 12,
    };
    try {
      const { data } = await applyNow(payload);
      if (!data.success) {
        throw new Error(data.message);
      }
      const uploadResumeResponse = await uploadResume(values.email, formData);
      const responseData = uploadResumeResponse.data;
      if (!responseData.success) {
        throw new Error(responseData.message);
      }
      toast.success(data.message);
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const getActiveVacancy = async () => {
      try {
        const response = await getAllJobVacancies({ companyId });
        const { statusCode, success, message, methodResults } = response.data;
        if (!(success && statusCode === 200)) {
          setError(true);
          throw new Error(message);
        }
        setActiveJobPositionsList(
          methodResults.filter((job) => job.status === true)
        );

        const selectedJob = methodResults.find((job) => job.status === true);
        if (selectedJob) {
          setSelectedJobPosition(selectedJob);
          setFromValues({
            ...formValues,
            vacancyId: selectedJob.jobId,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getActiveVacancy();
  }, []);

  const handleCaptchaValueChange = (token: string | null) => {
    console.log(token);
  };

  if (loading) {
    return <CircularLoader />;
  }

  return (
    <>
      <Grid container display={"flex"} justifyContent={"space-between"}>
        <Grid
          item
          xs={12}
          textAlign={"center"}
          position={"sticky"}
          top={0}
          zIndex={1}
        >
          <ApplyNowHeader />
        </Grid>
        <Grid item xs={12}>
          <SingleBanner title="Apply " titleorange={"Now"} />
        </Grid>
        <Container>
          <Typography variant="h3" className="linear-text-gradient">
            {intl.formatMessage({ id: "ALERT.HIRING" })}
          </Typography>
          <Grid
            item
            xs={12}
            md={9}
            xl={8}
            p={{ xs: 2, md: 5 }}
            borderRadius={2}
            display={"flex"}
            flexDirection={"column"}
            gap={2}
            margin={"auto"}
            sx={{
              boxShadow: "4px 5px 28px -6px #b4a7c9",
              marginBottom: "1.25rem",
            }}
          >
            {error || activeJobPositionsList.length === 0 ? (
              <NoVacancy />
            ) : (
              <>
                <Grid item xs={12}>
                  <Stack mb={2} spacing={1}>
                    <Typography
                      variant="h3"
                      color={colors.alpha.secondary[500]}
                    >
                      {intl.formatMessage({ id: "VACANCY.TEXT4" })}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={600}
                      color={colors.alpha.primary[500]}
                    >
                      {intl.formatMessage({ id: "VACANCY.TEXT5" })}
                    </Typography>
                  </Stack>

                  <Stack spacing={2}>
                    <Stack
                      direction={"row"}
                      display={"flex"}
                      flexWrap={"wrap"}
                      gap={0.5}
                    >
                      {activeJobPositionsList.length > 0 ? (
                        activeJobPositionsList.map((jobPosition) => (
                          <CustomisedButton
                            key={jobPosition.jobId}
                            variant="contained"
                            label={jobPosition.title}
                            handleClick={() => {
                              setSelectedJobPosition(jobPosition);
                              setFromValues({
                                ...formValues,
                                vacancyId: jobPosition.jobId,
                              });
                            }}
                            className={
                              selectedJobPosition?.jobId === jobPosition.jobId
                                ? "vacancyselect"
                                : "vacancy_deselect"
                            }
                          />
                        ))
                      ) : (
                        <Typography variant="h5">
                          {" "}
                          {intl.formatMessage({ id: "NO.VACANCY" })}
                        </Typography>
                      )}
                    </Stack>
                    <Stack spacing={2}>
                      <Typography variant="h5">
                        {" "}
                        {intl.formatMessage({ id: "JOB.DESCRIPTION" })}
                      </Typography>
                      <Stack maxHeight={"400px"} overflow={"auto"}>
                        {selectedJobPosition ? (
                          <Typography
                            variant="body1"
                            fontWeight={400}
                            color={colors.alpha.neutral[600]}
                            dangerouslySetInnerHTML={{
                              __html: selectedJobPosition.description,
                            }}
                          />
                        ) : (
                          ""
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </Grid>
                <Formik
                  enableReinitialize
                  initialValues={formValues}
                  validationSchema={applicantValidationSchema}
                  onSubmit={(value, { setSubmitting, resetForm }) => {
                    handleApplicationSubmission(
                      value,
                      setSubmitting,
                      resetForm
                    );
                  }}
                >
                  {({
                    status,
                    values,
                    touched,
                    errors,
                    isValid,
                    dirty,
                    isSubmitting,
                    setFieldValue,
                    setFieldTouched,
                    handleSubmit,
                    getFieldProps,
                    ...formik
                  }) => {
                    return (
                      <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="h5">
                              {intl.formatMessage({ id: "JOB.APPLICATION" })}
                            </Typography>
                            <Typography variant="body2">
                              {intl.formatMessage({
                                id: "JOB.APPLICATION_CAPTION",
                              })}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label={intl.formatMessage({
                                id: "USER.FIRST_NAME",
                              })}
                              type="text"
                              error={
                                touched.firstName && Boolean(errors.firstName)
                              }
                              {...getFieldProps("firstName")}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label={intl.formatMessage({
                                id: "USER.LAST_NAME",
                              })}
                              error={
                                touched.lastName && Boolean(errors.lastName)
                              }
                              type="text"
                              {...getFieldProps("lastName")}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label={intl.formatMessage({ id: "USER.PHONE" })}
                              error={touched.phone && Boolean(errors.phone)}
                              type="text"
                              {...getFieldProps("phone")}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label={intl.formatMessage({
                                id: "AUTH.INPUT.EMAIL",
                              })}
                              error={touched.email && Boolean(errors.email)}
                              type="email"
                              {...getFieldProps("email")}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel id="demo-simple-select-label">
                                {intl.formatMessage({ id: "JOB.POSITION" })}
                              </InputLabel>

                              <Select
                                label={intl.formatMessage({
                                  id: "JOB.POSITION",
                                })}
                                fullWidth
                                {...getFieldProps("vacancyId")}
                                // value={selectedJobPosition?.jobId}
                                error={
                                  touched.vacancyId && Boolean(errors.vacancyId)
                                }
                                onChange={(event) => {
                                  setFieldValue(
                                    "vacancyId",
                                    event.target.value
                                  );
                                  setSelectedJobPosition(
                                    activeJobPositionsList.find(
                                      (job) => job.jobId === event.target.value
                                    )
                                  );
                                }}
                                onBlur={(event) => {
                                  setFieldTouched("vacancyId", true);
                                }}
                              >
                                {activeJobPositionsList.map((jobPosition) => (
                                  <MenuItem
                                    key={jobPosition.jobId}
                                    value={jobPosition.jobId}
                                  >
                                    {jobPosition.title}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <ErrorLabel>
                              {touched.vacancyId &&
                                errors.vacancyId &&
                                errors.vacancyId}
                            </ErrorLabel>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <SelectInput
                              name={"experience"}
                              label={intl.formatMessage({
                                id: "USER.EXPERIENCE",
                              })}
                            >
                              {experienceCategoryList.map((experience) => (
                                <MenuItem
                                  key={experience.id}
                                  value={experience.value}
                                >
                                  {experience.label}
                                </MenuItem>
                              ))}
                            </SelectInput>
                          </Grid>
                          <Grid item xs={12}>
                            <Autocomplete
                              id="state-dropdown"
                              size="small"
                              value={indianStates.find(
                                (state) => state.value === values.state
                              )}
                              options={indianStates}
                              onChange={(event, value) => {
                                setFieldTouched("state",true)
                                setFieldValue("state", value?.value);
                              }}
                              renderInput={(param) => (
                                <TextField {...param} label={"Select State"} />
                              )}
                              getOptionLabel={(option) => option.label}
                            />
                            <ErrorLabel>
                              {touched.state && errors.state && errors.state}
                            </ErrorLabel>
                          </Grid>
                        </Grid>
                        <Stack mt={2}>
                          <Typography
                            variant="body1"
                            mb={1}
                            color={colors.alpha.primary[500]}
                          >
                            {intl.formatMessage({ id: "UPLOAD.RESUME" })}
                          </Typography>
                        </Stack>

                        <Grid
                          container
                          direction={"column"}
                          p={3}
                          sx={{
                            border: "1px dashed grey",
                            cursor: "pointer",
                            borderRadius: 0.5,
                          }}
                        >
                          <Stack
                            spacing={2}
                            direction={"row"}
                            display={"flex"}
                            justifyContent={"center"}
                            alignItems={"center"}
                          >
                            <Stack alignItems={"center"}>
                              <Tooltip title="Upload file here" placement="top">
                                <Box
                                  component="label"
                                  bgcolor={colors.alpha.primary[100]}
                                  px={2}
                                  py={0.5}
                                  borderRadius={1}
                                >
                                  <CloudUploadOutlined
                                    fontSize="large"
                                    className="text-primary"
                                  />
                                  <input
                                    name="resume"
                                    type="file"
                                    accept=".pdf,"
                                    onChange={(e) => {
                                      setFieldTouched("resume", true);
                                      handleFileChange(e, setFieldValue);
                                    }}
                                    // onBlur={() => setFieldTouched("resume", true)}
                                    hidden
                                  />
                                </Box>
                              </Tooltip>
                              <Stack>
                                <Typography
                                  variant="caption"
                                  flexWrap={"wrap"}
                                  textAlign={"center"}
                                >
                                  {values.resume ? values.resume.name : ""}
                                </Typography>
                              </Stack>
                            </Stack>

                            <Stack>
                              <Typography variant="body2">
                                {intl.formatMessage({
                                  id: "RESUME.UPLOAD_INSTRUCTION",
                                })}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <ErrorLabel>
                          {touched.resume && errors.resume && errors.resume}
                        </ErrorLabel>

                        {/* adding captacha */}
                        <Stack sx={{ marginBlock: 2 }}>
                          <ReCAPTCHA
                            sitekey={captachaKey}
                            ref={captchaRef}
                            onChange={handleCaptchaValueChange}
                          />
                        </Stack>

                        <Grid item xs={12} textAlign={"center"} mt={2}>
                          <CustomisedButton
                            type="submit"
                            variant="contained"
                            label="Submit"
                            size="medium"
                            disabled={isSubmitting || !dirty}
                            style={{ fontSize: "14px" }}
                          />
                        </Grid>
                      </form>
                    );
                  }}
                </Formik>
              </>
            )}
          </Grid>
        </Container>
        <Grid item xs={12} width={"100%"}>
          <Footer />
        </Grid>
      </Grid>
    </>
  );
}
