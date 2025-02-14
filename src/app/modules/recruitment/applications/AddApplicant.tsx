import {
  Box,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { CustomisedModal } from "../../components/CustomisedModal";
import { FC, useEffect, useState } from "react";
import { CloudUploadOutlined, Style } from "@mui/icons-material";
import { useAppSelector } from "../../../Redux/hooks";
import { Formik } from "formik";
import { TextInput } from "../../components/form_component/TextInput";
import CustomisedButton from "../../components/CustomisedButton";
import { useIntl } from "react-intl";
import { SelectInput } from "../../components/form_component/SelectInput";
import { experienceCategoryList } from "../../../../utils/common";
import { addApplicant, getAllJobVacancies, uploadResume } from "../services";
import { ApplicantModel, JobModal } from "../../../../utils/common_types";
import { toast } from "react-toastify";
import { colors } from "../../theme/MuiTheme";
import { ApplicantStatus, ApplicationStatus } from "../../../../utils/enums";
import { applicantValidationSchema } from "../../../../utils/Schema/applicantValidationSchema";

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
  activityType: ApplicationStatus.Rejected,
};
interface PropsTypes {
  open: boolean;
  refresh: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddApplicant: FC<PropsTypes> = ({
  open,
  setOpen,
  setRefresh,
  refresh,
}) => {
  const companyId = useAppSelector((state) => state.user.userData?.companyId)!;
  const [vacancyList, setVacancyList] = useState<JobModal[]>([]);
  const intl = useIntl();

  const activeVacancies = vacancyList.filter(
    (vacancy) => vacancy.status === true
  );

  const handleClose = () => {
    setOpen(false);
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

  const handleAddApplicant = async (
    values: ApplicantModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    const formData = new FormData();
    formData.append("File", values.resume as File);
    const vacancy = vacancyList.find(
      (vacancy) => vacancy.jobId === values.vacancyId
    );
    const payload = {
      ...values,
      companyId: companyId,
      vacancyName: vacancy ? vacancy.title : "",
      status: ApplicantStatus.New,
      activityType: ApplicationStatus.InProgress,
      experience: values.experience * 12, // convert to months
    };
    try {
      const { data } = await addApplicant(payload);
      if (!data.success) {
        throw new Error(data.message);
      }
      const uploadResumeResponse = await uploadResume(values.email, formData);
      const responseData = uploadResumeResponse.data;
      if (!responseData.success) {
        throw new Error(responseData.message);
      }
      toast.success(data.message);
      setRefresh(!refresh);
      handleClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const getAllVacancy = async () => {
      try {
        const { data } = await getAllJobVacancies();
        if (!(data.success && data.statusCode === 200)) {
          throw new Error(data.message);
        }
        setVacancyList(data.methodResults);
      } catch (error) {
        console.error(error);
      }
    };
    getAllVacancy();
  }, []);
  return (
    <>
      {activeVacancies && activeVacancies.length > 0 && (
        <CustomisedModal open={open} handleClose={handleClose}>
          <Stack spacing={2}>
            <Typography variant="h5">
              {intl.formatMessage({ id: "ADD.NEW_APPLICANT" })}
            </Typography>
            <Formik
              initialValues={initialValues}
              validationSchema={applicantValidationSchema}
              onSubmit={(values, { setSubmitting }) => {
                handleAddApplicant(values, setSubmitting);
              }}
            >
              {(formik) => {
                return (
                  <form onSubmit={formik.handleSubmit}>
                    <Grid
                      container
                      rowSpacing={1}
                      columnSpacing={{ xs: 1, sm: 2 }}
                    >
                      <Grid item xs={12} sm={6}>
                        <TextInput
                          label={intl.formatMessage({ id: "USER.FIRST_NAME" })}
                          type="text"
                          placeholder="First Name"
                          name="firstName"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextInput
                          label={intl.formatMessage({ id: "USER.LAST_NAME" })}
                          type="text"
                          placeholder="Last Name"
                          name="lastName"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextInput
                          label={intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                          type="email"
                          placeholder="Email"
                          name="email"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextInput
                          label={intl.formatMessage({ id: "USER.PHONE" })}
                          type="text"
                          placeholder="Phone Number"
                          name="phone"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <SelectInput
                          name="experience"
                          label={intl.formatMessage({ id: "USER.EXPERIENCE" })}
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
                      <Grid item xs={12} sm={6}>
                        <SelectInput
                          name="vacancyId"
                          label={intl.formatMessage({ id: "USER.DESIGNATION" })}
                        >
                          {activeVacancies.map((vacancy) => (
                            <MenuItem key={vacancy.jobId} value={vacancy.jobId}>
                              {vacancy.title}
                            </MenuItem>
                          ))}
                        </SelectInput>
                      </Grid>
                    </Grid>
                    <Stack mt={2}>
                      {" "}
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
                              {formik.values.resume?.name}
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

                    <FormHelperText>
                      {formik.touched.resume &&
                        formik.errors.resume &&
                        formik.errors.resume}
                    </FormHelperText>

                    <Stack
                      direction={"row"}
                      spacing={1}
                      justifyContent={"flex-end"}
                      mt={2}
                    >
                      <CustomisedButton
                        variant="outlined"
                        label="Close"
                        handleClick={handleClose}
                      />
                      <CustomisedButton
                        variant="outlined"
                        label="Reset"
                        handleClick={() => formik.resetForm()}
                      />
                      <CustomisedButton
                        label="Add"
                        type="submit"
                        disabled={
                          formik.isSubmitting ||
                          !(formik.dirty && formik.isValid)
                        }
                      />
                    </Stack>
                  </form>
                );
              }}
            </Formik>
          </Stack>
        </CustomisedModal>
      )}
    </>
  );
};
