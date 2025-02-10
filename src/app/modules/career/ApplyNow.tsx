import {
  Typography,
  Grid,
  Stack,
  MenuItem,
  Container,
  Box,
  FormHelperText,
  Select,
  FormLabel,
  Card,
} from "@mui/material";
import { useIntl } from "react-intl";
import { CloudUploadOutlined } from "@mui/icons-material";
import { SingleBanner } from "./SingleBanner";
import CustomisedButton from "../components/CustomisedButton";
import { useEffect, useRef, useState } from "react";
import Footer from "./Footer";
import { colors } from "../theme/MuiTheme";
import { Formik, FormikState } from "formik";
import { ApplicantModel, JobModal } from "../../../utils/common_types";
import { TextInput } from "../components/form_component/TextInput";
import { SelectInput } from "../components/form_component/SelectInput";
import { experienceCategoryList } from "../../../utils/common";
import { getAllJobVacancies, uploadResume } from "../recruitment/services";
import { CircularLoader } from "../components/CircularLoader";
import { ApplicantStatus, ApplicationStatus } from "../../../utils/enums";
import { applyNow } from "./services";
import { toast } from "react-toastify";
import NoVacancy from "./NoVacancy";
import ApplyNowHeader from "./ApplyNowHeader";
import { applicantValidationSchema } from "../../../utils/Schema/applicantValidationSchema";
// import ApplyNowHeader from "./ApplyNowHeader";

const initialValues: ApplicantModel = {
  applicantId: "",
  companyId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  experience: 1,
  resume: null,
  vacancyId: "",
  vacancyName: "",
  status: ApplicantStatus.New,
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
  const [selectedJobPosition, setSelectedJobPosition] =
    useState<JobModal | null>();
  // const captchaRef = useRef<ReCAPTCHA | null>(null);

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
    setStatus: (status?: any) => void,
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
      setStatus("Your Application Successfully Submitted");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const getActiveVacancy = async () => {
      try {
        const response = await getAllJobVacancies({
          companyId
        });
        if (!response) {
          setError(true);
          throw new Error("Request Failed");
        }
        const { statusCode, success, message, methodResults } = response.data;
        if (!(success && statusCode === 200)) {
          setError(true);
          throw new Error(message);
        }
        setActiveJobPositionsList(
          methodResults.filter((job) => job.status === true)
        );
        if (methodResults.length > 0) {
          setSelectedJobPosition(
            methodResults.find((job) => job.status === true)
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getActiveVacancy();
  }, []);

  if (loading) {
    return <CircularLoader />;
  }

  // const handleCaptchaChange = (token: string | null) => {
  //   console.log(token);
  // };
  return (
    <>
      <Grid container display={"flex"} justifyContent={"space-between"}>
        <Grid item xs={12} textAlign={"center"}>
          <ApplyNowHeader />
          <SingleBanner title="Apply " titleorange={"Now"} />
          <Typography variant="h3" className="linear-text-gradient">
            We are hiring
          </Typography>
        </Grid>
        <Container>
          <Grid
            item
            xs={12}
            sm={8}
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
                {" "}
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
                            handleClick={() =>
                              setSelectedJobPosition(jobPosition)
                            }
                            className={
                              selectedJobPosition?.jobId === jobPosition.jobId
                                ? "vacancyselect"
                                : "vacancy_deselect"
                            }
                          />
                        ))
                      ) : (
                        <Typography variant="h5">No Jobs</Typography>
                      )}
                    </Stack>
                    <Stack spacing={2}>
                      <Typography variant="h5">Job description</Typography>
                      {selectedJobPosition ? (
                        <p
                          dangerouslySetInnerHTML={{
                            __html: selectedJobPosition.description,
                          }}
                        ></p>
                      ) : (
                        ""
                      )}
                    </Stack>
                  </Stack>
                </Grid>
                <Formik
                  initialValues={initialValues}
                  validationSchema={applicantValidationSchema}
                  onSubmit={(
                    value,
                    { setSubmitting, setStatus, resetForm }
                  ) => {
                    handleApplicationSubmission(
                      value,
                      setSubmitting,
                      setStatus,
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
                    ...formik
                  }) => (
                    <form onSubmit={handleSubmit}>
                      {/* {
                    status && 
                    (
                      <Typography>{status}</Typography>
                    )
                  } */}
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

                        <Grid item xs={12} md={6}>
                          <TextInput
                            label={intl.formatMessage({
                              id: "USER.FIRST_NAME",
                            })}
                            name="firstName"
                            placeholder="First Name"
                            type="text"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextInput
                            label={intl.formatMessage({
                              id: "USER.LAST_NAME",
                            })}
                            name="lastName"
                            placeholder="Last Name"
                            type="text"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextInput
                            label={intl.formatMessage({ id: "USER.PHONE" })}
                            name="phone"
                            placeholder="Phone Number"
                            type="text"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextInput
                            label={intl.formatMessage({
                              id: "AUTH.INPUT.EMAIL",
                            })}
                            name="email"
                            placeholder="Email"
                            type="email"
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormLabel sx={{ mb: 0.5 }}>
                            {intl.formatMessage({ id: "JOB.POSITION" })}
                          </FormLabel>
                          <Select
                            fullWidth
                            {...formik.getFieldProps("vacancyId")}
                            value={selectedJobPosition?.jobId}
                            onChange={(event) => {
                              setFieldValue("vacancyId", event.target.value);
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
                        </Grid>
                        <Grid item xs={12} md={6}>
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
                          <Box
                            component="label"
                            sx={{
                              border: "1px dashed grey",
                              borderRadius: 1,
                              cursor: "pointer",
                              width: "100%",
                            }}
                          >
                            <Container
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              <Grid item xs={6} md={6} textAlign={"center"}>
                                <CloudUploadOutlined
                                  fontSize="large"
                                  sx={{ margin: "auto" }}
                                />
                                <input
                                  name="resume"
                                  type="file"
                                  accept=".pdf,"
                                  onChange={(e) => {
                                    setFieldTouched("resume",true);
                                    handleFileChange(e, setFieldValue);
                                  }}
                                  onBlur={() => setFieldTouched("resume", true)}
                                  // style={{visibility:"hidden"}}
                                  hidden
                                />
                                <Typography variant="body1" flexWrap={"wrap"}>
                                  {intl.formatMessage({
                                    id: "FILE.SELECTED",
                                  })}
                                  :{values.resume ? values.resume.name : ""}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} md={6}>
                                <Typography variant="body2" flexWrap={"wrap"}>
                                  {intl.formatMessage({
                                    id: "RESUME.UPLOAD_INSTRUCTION",
                                  })}
                                </Typography>
                              </Grid>
                            </Container>
                          </Box>
                          <FormHelperText>
                            {touched.resume && errors.resume && errors.resume}
                          </FormHelperText>
                        </Grid>

                        <Grid item xs={12}>
                          {/* <ReCAPTCHA
                            sitekey={String(CAPTCHA_SITE_KEY)}
                            onChange={handleRecaptchaChange}
                          />
                          {formErrors.captcha && (
                            <Typography className="error-validation">
                              {formErrors.captcha}
                            </Typography>
                          )} */}
                        </Grid>
                        <Grid item xs={12} textAlign={"center"}>
                          <CustomisedButton
                            type="submit"
                            variant="contained"
                            label="Submit"
                            size="medium"
                            disabled={isSubmitting || !(isValid && dirty)}
                          />
                        </Grid>
                      </Grid>
                    </form>
                  )}
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
