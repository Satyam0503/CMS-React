import {
  Autocomplete,
  Box,
  Card,
  Container,
  Grid,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/C_Button";
import { CloudUploadOutlined } from "@mui/icons-material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import { Formik } from "formik";
import { editApplicantValidationSchema } from "../../../../../utils/Schema/applicantValidationSchema";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import { SelectInput } from "../../../../shared/components/form-component/SelectInput";
import {
  addComment,
  editApplicant,
  getAllJobVacancies,
  getApplicantById,
  uploadResumeForApplicant,
} from "../../services";
import { useAppSelector } from "../../../../Redux/hooks";
import { toast } from "react-toastify";
import {
  ApplicationEvaluationStatus,
  indianStates,
  monthsExperienceList,
} from "../../../../../utils/constant/Constant";
import { commentActionEncoderForApplicationStatus, getCustomStatusCodesErrorMessage } from "../../../../../utils/common";
import { AddComment } from "./AddComment";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import { CircularLoader } from "../../../../shared/components/CircularLoader";
import { Applicant, EditApplicantModel, JobModal } from "../../models";
import { CommentAction } from "../../../../../utils/enums";
import { getVacancyPayload } from "../../jobs/Jobs";
import { usePageData } from "../../../../Context/PageDataProvider";
import { AxiosError } from "axios";

import { AppTextField } from "../../../../shared/components/ui";
export const EditApplicant = () => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.userData)!;
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isCommentModalOpen, setCommnetModalOpen] = useState(false);
  const [activeVacancyList, setActiveVacancyList] = useState<JobModal[]>([]);
  const [applicantDetails, setApplicantDetails] = useState<Applicant>(
    {} as Applicant
  );
  const { setPageTitle } = usePageData();
  const param = useParams();

  if (Object.keys(param).length === 0 || !param.applicantid) {
    navigate("/error", { replace: true });
  }
  const applicantId = param.applicantid ?? "";

  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.EDIT_APPLICANT" }));
    setLoading(true);
    getApplicantById(applicantId)
      .then(({ data }) => {
        if (data.success) {
          setApplicantDetails(data.methodResult);
        }
      })
      .catch((err) => {
        console.log(err.message);
        navigate("/error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const getAllVacancy = async () => {
      try {
        const response = await getAllJobVacancies(getVacancyPayload);
        const { success, methodResults } = response.data;
        if (success) {
          setActiveVacancyList(methodResults);
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
    applicantId: applicantDetails?.applicantId,
    firstName: applicantDetails.firstName,
    lastName: applicantDetails.lastName,
    email: applicantDetails.email,
    phone: applicantDetails.phone,
    vacancyId: applicantDetails.vacancyId,
    state: applicantDetails.state,
    resume: null,
    status: applicantDetails.status,
    activityType: applicantDetails.activityType,
    experienceInYears: Math.floor(applicantDetails.experience / 12),
    experienceInMonths: applicantDetails.experience % 12,
  };

  const handleAddComment = async (activityType: number, jobTitle?: string) => {
    const actionCategory =
      activityType === applicantDetails.activityType
        ? CommentAction.Edit
        : commentActionEncoderForApplicationStatus(activityType)!;
    const payload = {
      applicantId: applicantDetails.applicantId,
      userId: user.userId,
      description: comment,
      activityCategory: actionCategory,
      userName: user.firstName + " " + user.lastName,
      jobTitle: jobTitle ?? applicantDetails.vacancyName,
    };
    const response = await addComment(payload);
    const { success } = response.data;
    if (success) {
      toast.success(formatMessage({ id: "TOAST.SUCCESS.APPLICANT_UPDATE" }));
      handleModalClose();
      navigate(`/recruitment/applicant/${applicantId}`, { replace: true });
    }
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
      state: values.state,
      resumeUrl: "",
      status: values.status,
      activityType: values.activityType,
      experience: totalExperienceInMonths,
    };
    try {
      const { data } = await editApplicant(payload);
      if (!data.success) throw new Error(String(data.statusCode));
      if (values.resume) {
        const resumeUploadResponse = await uploadResumeForApplicant(values.applicantId, formData);
        if (!resumeUploadResponse.data.success) {
          throw new Error(String(resumeUploadResponse.data.statusCode));
        }
      }
      handleAddComment(values.activityType, vacancy?.title);
    } catch (error) {
      toast.error(formatMessage({ id: getCustomStatusCodesErrorMessage(+(error as AxiosError).message) }))
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setCommnetModalOpen(false);
    setComment("");
  };

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 12px 32px rgba(46, 38, 69, 0.08)",
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          gap={1}
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {formatMessage({ id: "APPLICATION.UPDATE_APPLICANT" })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Update candidate contact details, experience, or resume. Stage transitions are managed via the Next Step workflow drawer.
            </Typography>
          </Box>
        </Stack>
        <Grid container direction={"column"} sx={{
          gap: 1
        }}>
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
                      <Grid
                        size={{
                          xs: 12,
                          sm: 4
                        }}>
                        <TextInput
                          label={formatMessage({
                            id: "FORM.FIRST_NAME",
                          })}
                          type="text"
                          name="firstName"
                          placeholder={formatMessage({
                            id: "FORM.FIRST_NAME",
                          })}
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 4
                        }}>
                        <TextInput
                          label={formatMessage({ id: "FORM.LAST_NAME" })}
                          type="text"
                          name="lastName"
                          placeholder={formatMessage({
                            id: "FORM.LAST_NAME",
                          })}
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 4
                        }}>
                        <TextInput
                          label={formatMessage({ id: "FORM.PHONE" })}
                          type="text"
                          name="phone"
                          placeholder={formatMessage({ id: "FORM.PHONE" })}
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 4
                        }}>
                        <TextInput
                          label={formatMessage({
                            id: "FORM.EMAIL",
                          })}
                          type="email"
                          name="email"
                          placeholder={formatMessage({
                            id: "FORM.EMAIL",
                          })}
                          disabled={true}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 4
                        }}>
                        <SelectInput
                          label={formatMessage({ id: "JOB.POSITION" })}
                          name="vacancyId"
                        >
                          {activeVacancyList.map((vacancy) => (
                            <MenuItem value={vacancy.jobId} key={vacancy.jobId}>
                              {vacancy.title}
                            </MenuItem>
                          ))}
                        </SelectInput>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 4
                        }}>
                        <Autocomplete
                          id="state-dropdown"
                          size="small"
                          value={indianStates.find(
                            (state) => state.value === values.state
                          )}
                          options={indianStates}
                          onChange={(event, value) => {
                            formik.setFieldValue("state", value?.value);
                          }}
                          renderInput={(param) => (
                            <AppTextField {...param} label={formatMessage({ id: "APPLICATION.SELECT_STATE" })} />
                          )}
                          getOptionLabel={(option) => option.label}
                        />
                        {
                          touched.state && errors.state &&
                          <ErrorLabel errorLabel={errors.state} />
                        }
                      </Grid>
                    </Grid>

                    <Stack spacing={2} sx={{
                      mt: 2
                    }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 600
                      }}>
                        {formatMessage({ id: "APPLICATION.CUSTOMISE_EXPERIENCE" })}
                      </Typography>
                      <Grid container sx={{
                        gap: 2
                      }}>
                        <Grid
                          size={{
                            xs: 12,
                            sm: 4,
                            md: 4
                          }}>
                          <TextInput
                            label={formatMessage({
                              id: "DATETIME.YEARS",
                            })}
                            type="number"
                            name="experienceInYears"
                            placeholder={formatMessage({ id: "APPLICATION.EXP_IN_YEAR" })}
                            inputProps={{
                              min: 0,
                            }}
                          />
                        </Grid>
                        <Grid
                          size={{
                            xs: 12,
                            sm: 3,
                            md: 2
                          }}>
                          <SelectInput
                            label={formatMessage({
                              id: "DATETIME.MONTHS",
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

                    <Stack sx={{
                      mt: 2
                    }}>
                      <Typography variant="body1" color="primary" sx={{
                        mb: 1
                      }}>
                        {formatMessage({ id: "APPLICATION.UPLOAD_RESUME" })}
                      </Typography>
                    </Stack>

                    <Grid
                      container
                      direction={"column"}
                      sx={{
                        p: 3,
                        border: "1px dashed grey",
                        cursor: "pointer",
                        borderRadius: 0.5
                      }}>
                      <Stack
                        spacing={2}
                        direction={"row"}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center"
                        }}>
                        <Stack sx={{
                          alignItems: "center"
                        }}>

                          <Box
                            component="label"
                            sx={{
                              bgcolor: "primary.lighter",
                              px: 2,
                              py: 0.5,
                              borderRadius: 1
                            }}>
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
                              hidden
                            />
                          </Box>
                          <Typography variant="caption">
                            {values.resume ? values.resume.name : ""}
                          </Typography>
                        </Stack>

                        <Stack>
                          <Typography variant="body2">
                            {formatMessage({
                              id: "APPLICATION.RESUME_INSTRUCTION",
                            })}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>

                    {touched.resume && errors.resume &&
                      <ErrorLabel errorLabel={errors.resume} />
                    }
                    <Grid
                      size={12}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1,
                        gap: 1
                      }}>
                      <CustomisedButton
                        variant="outlined"
                        size="medium"
                        label={formatMessage({ id: "BUTTON.CANCEL" })}
                        handleClick={() => navigate(`/recruitment/applicant/${applicantId}`)}
                      />
                      <CustomisedButton
                        variant="contained"
                        size="medium"
                        label={formatMessage({ id: "BUTTON.UPDATE" })}
                        type="button"
                        disabled={formik.isSubmitting || !formik.isValid}
                        handleClick={() => setCommnetModalOpen(true)}
                      />
                    </Grid>
                  </form>
                  {isCommentModalOpen && (
                    <AddComment
                      loading={formik.isSubmitting}
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
  );
};

