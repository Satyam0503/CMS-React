import {
  Autocomplete,
  Box,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { FC, useEffect, useState } from "react";
import { CloudUploadOutlined, Style } from "@mui/icons-material";
import { useAppSelector } from "../../../../Redux/hooks";
import { Formik } from "formik";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useIntl } from "react-intl";
import { SelectInput } from "../../../../shared/components/form-component/SelectInput";
import { addApplicant, getAllJobVacancies, uploadResume } from "../../services";
import { toast } from "react-toastify";
import { colors } from "../../../theme/MuiTheme";
import { ApplicantStatus, ApplicationStatus } from "../../../../../utils/enums";
import { applicantValidationSchema } from "../../../../../utils/Schema/applicantValidationSchema";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import { ApplicantModel, JobModal } from "../../models";
import { experienceCategoryList, indianStates } from "../../../../../utils/constant/Constant";

const initialValues: ApplicantModel = {
  applicantId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  experience: 1,
  state:"",
  resume: null,
  vacancyId: "",
  vacancyName: "",
  status: ApplicantStatus.Active,
  activityType: ApplicationStatus.New,
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
      vacancyName: vacancy ? vacancy.title : "",
      activityType: ApplicationStatus.New,
      experience: values.experience * 12,
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
                      rowSpacing={2}
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
                      <Grid item xs={12}>
                          <Autocomplete 
                            id="state-dropdown"
                            size="small"
                            value={indianStates.find(state=>state.value === formik.values.state)}
                            options={indianStates}
                            onChange={(event,value)=>{
                              formik.setFieldValue("state",value?.value);
                            }}
                            renderInput={(param)=>(
                              <TextField  {...param}  label={"Select State"}/>
                            )}
                            getOptionLabel={option=> option.label}
                          />
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
                                accept=".pdf"
                                onChange={(e) => {
                                  formik.setFieldTouched("resume", true);
                                  handleFileChange(e, formik.setFieldValue);
                                }}
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

                    <ErrorLabel>
                      {formik.touched.resume &&
                        formik.errors.resume &&
                        formik.errors.resume}
                    </ErrorLabel>

                    <Stack
                      direction={"row"}
                      spacing={1}
                      justifyContent={"flex-end"}
                      mt={2}
                    >
                      <CustomisedButton
                        variant="outlined"
                        label={intl.formatMessage({id:"BUTTON.CLOSE"})}
                        handleClick={handleClose}
                      />
                      <CustomisedButton
                        variant="outlined"
                        label={intl.formatMessage({id:"BUTTON.RESET"})}
                        handleClick={() => formik.resetForm()}
                      />
                      <CustomisedButton
                        loading={formik.isSubmitting}
                        label={intl.formatMessage({id:"BUTTON.ADD"})}
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
