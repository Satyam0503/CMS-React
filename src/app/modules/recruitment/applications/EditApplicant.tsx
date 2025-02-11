import {
  Box,
  Card,
  Container,
  FormHelperText,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../components/CustomisedButton";
import { AttachFile, CloudUploadOutlined } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Applicant,
  ApplicantModel,
  EditApplicantModel,
  JobModal,
} from "../../../../utils/common_types";
import { useEffect, useState } from "react";
import { CircularLoader } from "../../components/CircularLoader";
import { Formik } from "formik";
import { editApplicantValidationSchema } from "../../../../utils/Schema/applicantValidationSchema";
import { TextInput } from "../../components/form_component/TextInput";
import { SelectInput } from "../../components/form_component/SelectInput";
import { editApplicant, getAllJobVacancies, uploadResume } from "../services";
import { useAppSelector } from "../../../Redux/hooks";
import { toast } from "react-toastify";
import { ApplicationEvaluationStatus } from "../../../../utils/constant/Constant";
import { monthsExperienceList } from "../../../../utils/common";

export const EditApplicant = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeVacancyList, setActiveVacancyList] = useState<JobModal[]>([]);
  const companyId = useAppSelector((state) => state.user.userData?.companyId)!;
  const state = useLocation().state as Applicant;

  useEffect(() => {
    if (!state || Object.keys(state).length === 0) {
      navigate("/error", { replace: true });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const getAllVacancy = async () => {
      try {
        const response = await getAllJobVacancies();
        const { success, methodResults } = response.data;
        if (success) {
          setActiveVacancyList(
            methodResults.filter((vacancy) => vacancy.status === true)
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    getAllVacancy();
  }, []);

  if (loading) {
    return <CircularLoader />;
  }

  const initialValues: EditApplicantModel = {
    applicantId: state.applicantId,
    companyId: "",
    firstName: state.firstName,
    lastName: state.lastName,
    email: state.email,
    phone: state.phone,
    vacancyId: state.vacancyId,
    vacancyName: state.vacancyName,
    resume: null,
    status: state.status,
    activityType: state.activityType,
    experienceInYears: Math.floor(state.experience / 12),
    experienceInMonths: state.experience % 12,
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFieldValue("resume", selectedFile);
    }
  };

  const handleEditApplicant = async (
    values: EditApplicantModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    const formData = new FormData();
    formData.append("File", values.resume as File);
    const vacancy = activeVacancyList.find(
      (vacancy) => vacancy.jobId === values.vacancyId
    );
    const totalExperienceInMonths =
      values.experienceInYears * 12 + values.experienceInMonths;

    const payload = {
      applicantId: values.applicantId,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      vacancyId: values.vacancyId,
      resumeUrl: "",
      status: 0,
      activityType: 0,
      companyId: companyId,
      vacancyName: vacancy ? vacancy.title : "",
      experience: totalExperienceInMonths,
    };

    try {
      const response = await editApplicant(payload);
      const { statusCode, success } = response.data;
      if (success) {
        const resumeUploadResponse = await uploadResume(values.email, formData);
        const responseData = resumeUploadResponse.data;
        if (responseData.success) {
          toast.success("Applicant Updated Successfully");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card sx={{ p: 2.6 }}>
      <Stack spacing={2}>
        <Typography variant="h5">
          {intl.formatMessage({ id: "UPDATE.EMP.INFO" })}
        </Typography>
        <Grid container display={"flex"} direction={"column"} gap={1}>
          <Formik
            initialValues={initialValues}
            validationSchema={editApplicantValidationSchema}
            onSubmit={(value, { setSubmitting }) => {
              handleEditApplicant(value, setSubmitting);
            }}
          >
            {({ values, errors, touched, ...formik }) => {
              return (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.FIRST_NAME" })}
                        type="text"
                        name="firstName"
                        placeholder="FirstName"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.LAST_NAME" })}
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.PHONE" })}
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextInput
                        label={intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                        type="email"
                        name="email"
                        placeholder="Email"
                        disabled={true}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <SelectInput
                        label={intl.formatMessage({ id: "JOB.POSITION" })}
                        name="vacancyId"
                      >
                        {activeVacancyList.map((vacancy) => (
                          <MenuItem value={vacancy.jobId} key={vacancy.jobId}>
                            {vacancy.title}
                          </MenuItem>
                        ))}
                      </SelectInput>
                    </Grid>
                  </Grid>

                  <Stack mt={2} spacing={1}>
                    <Typography variant="h6" fontWeight={600}>
                      {intl.formatMessage({ id: "CUSTOMISED.EXPERIENCE" })}
                    </Typography>
                    <Grid container gap={2}>
                      <Grid item xs={12} sm={4} md={4}>
                        <TextInput
                          label={intl.formatMessage({
                            id: "USER.EXPERIENCE.YEARS",
                          })}
                          type="number"
                          name="experienceInYears"
                          placeholder="Experience in Years"
                        />
                      </Grid>
                      <Grid item xs={12} sm={3} md={2}>
                        <SelectInput
                          label={intl.formatMessage({
                            id: "USER.EXPERIENCE.MONTHS",
                          })}
                          name="experienceInMonths"
                        >
                          {monthsExperienceList.map((month) => (
                            <MenuItem key={month.id} value={month.value}>
                              {month.label}
                            </MenuItem>
                          ))}
                        </SelectInput>
                      </Grid>
                      <Grid item xs={12} sm={3} md={2}>
                        <SelectInput
                          label={intl.formatMessage({ id: "PROFILE.STATUS" })}
                          name="activityType"
                        >
                          {ApplicationEvaluationStatus.map((status) => (
                            <MenuItem key={status.id} value={status.value}>
                              {status.label}
                            </MenuItem>
                          ))}
                        </SelectInput>
                      </Grid>
                    </Grid>
                  </Stack>

                  <Box my={3}>
                    <Stack direction={"column"} spacing={1}>
                      <Box
                        component="label"
                        sx={{
                          border: "1px dashed grey",

                          cursor: "pointer",
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
                              accept=".pdf"
                              onChange={(event) => {
                                formik.setFieldTouched("resume", true);
                                handleFileChange(event, formik.setFieldValue);
                              }}
                              hidden
                            />
                            <Typography variant="body1" flexWrap={"wrap"}>
                              {intl.formatMessage({ id: "FILE.SELECTED" })}:
                              {values.resume ? values.resume.name : ""}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={6}>
                            <Typography variant="body2" flexWrap={"wrap"}>
                              {intl.formatMessage({
                                id: "FILE.UPLOAD_INSTRUCTION",
                              })}
                            </Typography>
                          </Grid>
                        </Container>
                      </Box>
                    </Stack>
                    <FormHelperText>
                      {touched.resume && errors.resume && errors.resume}
                    </FormHelperText>
                  </Box>

                  <Grid
                    item
                    xs={12}
                    display={"flex"}
                    justifyContent={"flex-end"}
                    mt={1}
                    gap={1}
                  >
                    {" "}
                    <CustomisedButton
                      variant="outlined"
                      size="medium"
                      label="Cancel"
                    />
                    <CustomisedButton
                      variant="contained"
                      size="medium"
                      label="Update"
                      type="submit"
                      disabled={formik.isSubmitting || !formik.isValid}
                    />
                  </Grid>
                </form>
              );
            }}
          </Formik>
        </Grid>
      </Stack>
    </Card>
  );
};
