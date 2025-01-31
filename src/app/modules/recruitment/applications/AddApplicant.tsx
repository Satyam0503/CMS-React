import {
  Box,
  Container,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { CustomisedModal } from "../../components/CustomisedModal";
import { FC, useEffect, useState } from "react";
import { CustomIconButton } from "../../components/CustomIconButton";
import { Add, CloudUploadOutlined } from "@mui/icons-material";
import { useAppSelector } from "../../../Redux/hooks";
import { Formik } from "formik";
import { applicantSchema } from "../../../../utils/Schema/applicantSchema";
import { TextInput } from "../../components/form_component/TextInput";
import CustomisedButton from "../../components/CustomisedButton";
import { useIntl } from "react-intl";
import { SelectInput } from "../../components/form_component/SelectInput";
import { experienceCategoryList } from "../../../../utils/common";
import { addApplicant, getAllJobVacancies } from "../services";
import { ApplicantModel, JobModal } from "../../../../utils/common_types";
import { toast } from "react-toastify";
import { colors } from "../../theme/MuiTheme";

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
  vacancyName:"",
};
interface PropsTypes {
  open:boolean;
  refresh:boolean;
  setOpen:React.Dispatch<React.SetStateAction<boolean>>
  setRefresh:React.Dispatch<React.SetStateAction<boolean>>
}

export const AddApplicant:FC<PropsTypes> = ({open,setOpen,setRefresh,refresh}) => {
  const companyId = useAppSelector((state) => state.user.userData?.companyId)!;
  const [vacancyList, setVacancyList] = useState<JobModal[]>([]);
  const intl = useIntl();

  const activeVacancies = vacancyList.filter(vacancy=> vacancy.status === true);

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
    const vacancy= vacancyList.find(vacancy => vacancy.jobId === values.vacancyId);
    const payload = {
      applicantId: values.applicantId,
      companyId: companyId,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      vacancyId: values.vacancyId,
      experience: values.experience,
      vacancyName: vacancy ? vacancy.title : "",
    };    
    try {
      const { data } = await addApplicant(payload);
      if (!data.success) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      setRefresh(!refresh);
      handleClose();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
    // const formData = new FormData();
    // formData.append("resume", values.resume);
    // formData.append("applicantData", JSON.parse(values));
    // handle add applicant logic
  };

  useEffect(() => {
    const getAllVacancy = async () => {
      try {
        const { data } = await getAllJobVacancies();
        if (!data.success) {
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
      { activeVacancies && activeVacancies.length > 0 && (
        <CustomisedModal open={open} handleClose={handleClose}>
          <Stack spacing={2}>
            <Typography variant="h5">
              {intl.formatMessage({ id: "ADD.NEW_APPLICANT" })}
            </Typography>
            <Formik
              initialValues={initialValues}
              validationSchema={applicantSchema}
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
                      <Grid item xs={12} md={6}>
                        <TextInput
                          label={intl.formatMessage({ id: "USER.FIRST_NAME" })}
                          type="text"
                          placeholder="First Name"
                          name="firstName"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextInput
                          label={intl.formatMessage({ id: "USER.LAST_NAME" })}
                          type="text"
                          placeholder="Last Name"
                          name="lastName"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextInput
                          label={intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                          type="email"
                          placeholder="Email"
                          name="email"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextInput
                          label={intl.formatMessage({ id: "USER.PHONE" })}
                          type="text"
                          placeholder="Phone Number"
                          name="phone"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <SelectInput
                          name="experience"
                          label={intl.formatMessage({ id: "USER.EXPERIENCE" })}
                        >
                          {experienceCategoryList.map((experience) => (
                            <MenuItem
                              key={experience.id}
                              value={experience.value}
                            >
                              {experience.label}{" "}
                            </MenuItem>
                          ))}
                        </SelectInput>
                      </Grid>
                      <Grid item xs={12} md={6}>
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
                        <Typography
                          variant="body1"
                          mb={1}
                          color={colors.alpha.primary[500]}
                        >
                          {intl.formatMessage({ id: "UPLOAD.RESUME" })}
                        </Typography>
                        <Stack direction={"column"} spacing={1}>
                          <Box
                            component="label"
                            sx={{
                              p: 2,
                              border: "1px dashed grey",
                              borderRadius: 1,
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
                              <Grid item xs={6} textAlign={"center"}>
                                <CloudUploadOutlined fontSize="large" />
                                <input
                                  name="resume"
                                  type="file"
                                  accept=".pdf,.doc"
                                  onChange={(e) => {
                                    handleFileChange(e, formik.setFieldValue);
                                  }}
                                  onBlur={(e) => {
                                    formik.setFieldTouched("resume", true);
                                  }}
                                  hidden
                                />
                                <Typography variant="body1" flexWrap={"wrap"}>
                                  {intl.formatMessage({ id: "FILE.SELECTED" })}:
                                  {formik.values.resume?.name}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
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
                          {formik.touched.resume &&
                            formik.errors.resume &&
                            formik.errors.resume}
                        </FormHelperText>
                      </Grid>
                    </Grid>
                    <Stack
                      direction={"row"}
                      spacing={2}
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
