import {
  Box,
  Card,
  Container,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../components/CustomisedButton";
import { AttachFile, CloudUploadOutlined } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Applicant,
  EditApplicantModel,
  JobModal,
} from "../../../../utils/common_types";
import { useCallback, useEffect, useState } from "react";
import { CircularLoader } from "../../components/CircularLoader";
import { Formik } from "formik";
import { editApplicantValidationSchema } from "../../../../utils/Schema/applicantValidationSchema";
import { TextInput } from "../../components/form_component/TextInput";
import { SelectInput } from "../../components/form_component/SelectInput";
import {
  addComment,
  editApplicant,
  getAllJobVacancies,
  uploadResume,
} from "../services";
import { useAppSelector } from "../../../Redux/hooks";
import { toast } from "react-toastify";
import { ApplicationEvaluationStatus } from "../../../../utils/constant/Constant";
import {
  ApplicantStatusMapper,
  commentActionEncoderForApplicationStatus,
  monthsExperienceList,
} from "../../../../utils/common";
import { AddComment } from "./AddComment";
import { ErrorLabel } from "../../components/form_component/ErrorLabel";
import { colors } from "../../theme/MuiTheme";

export const EditApplicant = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.userData)!;
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isCommentModalOpen, setCommnetModalOpen] = useState(false);
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

  const handleCommentChange = useCallback((comment: string) => {
    setComment(comment);
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

  const handleAddComment = async (activityType: number) => {
    const payload = {
      applicantId: state.applicantId,
      userId: user.userId,
      description: comment,
      activityCategory: commentActionEncoderForApplicationStatus(activityType)!,
      userName: user.firstName + " " + user.lastName,
    };
    const response = await addComment(payload);
    const { success, statusCode } = response.data;
    if (!success) {
      throw new Error("Failed To Update Applicant");
    }
    toast.success("Applicant Updated Successfully");
    handleModalClose();
    window.history.back();
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
      status: ApplicantStatusMapper[values.activityType],
      activityType: values.activityType,
      companyId: companyId,
      vacancyName: vacancy ? vacancy.title : "",
      experience: totalExperienceInMonths,
    };
    try {
      const response = await editApplicant(payload);
      const { message, success } = response.data;
      if (!success) {
        throw new Error("Failed To Update Applicant");
      }
      if (values.resume) {
        const resumeUploadResponse = await uploadResume(values.email, formData);
        if (!resumeUploadResponse.data.success) {
          throw new Error("Failed To Update Applicant");
        }
      }
      handleAddComment(values.activityType);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setCommnetModalOpen(false);
    setComment("");
  };

  return (
    <Container>
      <Card sx={{ p: 2.6 }}>
        <Stack spacing={2}>
          <Typography variant="h5">
            {intl.formatMessage({ id: "UPDATE.APPLICANT.INFO" })}
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
                  <>
                    <form onSubmit={formik.handleSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextInput
                            label={intl.formatMessage({
                              id: "USER.FIRST_NAME",
                            })}
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
                            label={intl.formatMessage({
                              id: "AUTH.INPUT.EMAIL",
                            })}
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
                              <MenuItem
                                value={vacancy.jobId}
                                key={vacancy.jobId}
                              >
                                {vacancy.title}
                              </MenuItem>
                            ))}
                          </SelectInput>
                        </Grid>
                        <Grid item xs={12} sm={4}>
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
                              inputProps={{
                                min: 0,
                              }}
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
                        </Grid>
                      </Stack>

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
                                  accept=".pdf"
                                  onChange={(e) => {
                                    formik.setFieldTouched("resume", true);
                                    handleFileChange(e, formik.setFieldValue);
                                  }}
                                  // onBlur={(e) => {
                                  //   formik.setFieldTouched("resume", true);
                                  // }}
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
                                {/* {intl.formatMessage({
                                id: "FILE.SELECTED",
                              })}
                              : */}
                              </Typography>
                              <Typography variant="caption">
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

                      <Grid
                        item
                        xs={12}
                        display={"flex"}
                        justifyContent={"flex-end"}
                        mt={1}
                        gap={1}
                      >
                        <CustomisedButton
                          variant="outlined"
                          size="medium"
                          label="Reset"
                          handleClick={() => {
                            formik.handleReset();
                          }}
                        />
                        <CustomisedButton
                          variant="contained"
                          size="medium"
                          label="Update"
                          type="button"
                          disabled={formik.isSubmitting || !formik.isValid}
                          handleClick={() => setCommnetModalOpen(true)}
                        />
                      </Grid>
                    </form>

                    {isCommentModalOpen && (
                      <AddComment
                        open={isCommentModalOpen}
                        comment={comment}
                        handleCommentChange={handleCommentChange}
                        handleAddComment={() => formik.submitForm()}
                        handleClose={handleModalClose}
                      />
                    )}
                  </>
                );
              }}
            </Formik>
          </Grid>
        </Stack>
      </Card>
    </Container>
  );
};
