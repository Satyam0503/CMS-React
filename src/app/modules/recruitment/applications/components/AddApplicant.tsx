import {
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { FC, useEffect, useState } from "react";
import { CloudUpload, } from "@mui/icons-material";
import { Formik } from "formik";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useIntl } from "react-intl";
import { SelectInput } from "../../../../shared/components/form-component/SelectInput";
import { addApplicant, getAllJobVacancies, uploadResume } from "../../services";
import { toast } from "react-toastify";
import { ApplicantStatus, ApplicationStatus } from "../../../../../utils/enums";
import { applicantValidationSchema } from "../../../../../utils/Schema/applicantValidationSchema";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import { ApplicantModel, JobModal } from "../../models";
import {
  experienceCategoryList,
  indianStates,
} from "../../../../../utils/constant/Constant";
import { getVacancyPayload } from "../../jobs/Jobs";
import { getStatusCodeString } from "../../../../../utils/common";
import { VisuallyHiddenInput } from "../../../../shared/components/form-component/VisuallyHiddenInput";

const initialValues: ApplicantModel = {
  applicantId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  experience: 1,
  state: "",
  resume: null,
  vacancyId: "",
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
  const { formatMessage: i } = useIntl();
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
    const payload = {
      ...values,
      activityType: ApplicationStatus.New,
      experience: values.experience * 12,
    };
    try {
      const { data } = await addApplicant(payload);
      if (data.success) {
        const uploadResumeResponse = await uploadResume(values.email, formData);
        const responseData = uploadResumeResponse.data;
        if (responseData.success) {
          toast.success(
            i({ id: "TOAST.SUCCESS.ADD_APPLICANT" })
          );
          setRefresh(!refresh);
          handleClose();
        }
      } else {
        toast.error(i({ id: getStatusCodeString(data.statusCode) }));
      }
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const getAllVacancy = async () => {
      try {
        const { data } = await getAllJobVacancies(getVacancyPayload);
        if (!(data.success && data.statusCode === 200)) {
          throw new Error(data.message);
        }
        if (data.methodResults.length < 1) {
          toast.error(i({ id: "TOAST.FAILED.NO_VACANCY" }));
          handleClose();
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
      {vacancyList.length > 0 && (
        <CustomisedModal open={open} handleClose={handleClose}
          title={i({ id: "APPLICANT.ADD_APPLICANT" })}
        >
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
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6
                      }}>
                      <TextInput
                        label={i({ id: "FORM.FIRST_NAME" })}
                        type="text"
                        placeholder={i({
                          id: "FORM.FIRST_NAME",
                        })}
                        name="firstName"
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6
                      }}>
                      <TextInput
                        label={i({ id: "FORM.LAST_NAME" })}
                        type="text"
                        placeholder={i({
                          id: "FORM.LAST_NAME",
                        })}
                        name="lastName"
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6
                      }}>
                      <TextInput
                        label={i({ id: "FORM.EMAIL" })}
                        type="email"
                        placeholder={i({ id: "FORM.EMAIL" })}
                        name="email"
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6
                      }}>
                      <TextInput
                        label={i({ id: "FORM.PHONE" })}
                        type="text"
                        placeholder={i({ id: "FORM.PHONE" })}
                        name="phone"
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6
                      }}>
                      <SelectInput
                        name="experience"
                        label={i({ id: "FORM.EXPERIENCE" })}
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
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6
                      }}>
                      <SelectInput
                        name="vacancyId"
                        label={i({ id: "FORM.DESIGNATION" })}
                      >
                        {vacancyList.map((vacancy) => (
                          <MenuItem key={vacancy.jobId} value={vacancy.jobId}>
                            {vacancy.title}
                          </MenuItem>
                        ))}
                      </SelectInput>
                    </Grid>
                    <Grid size={12}>
                      <Autocomplete
                        id="state-dropdown"
                        size="small"
                        value={indianStates.find(
                          (state) => state.value === formik.values.state
                        )}
                        options={indianStates}
                        onChange={(event, value) => {
                          formik.setFieldTouched("state", true);
                          formik.setFieldValue("state", value?.value);
                        }}
                        renderInput={(param) => (
                          <TextField {...param} label={i({ id: "APPLICATION.SELECT_STATE" })} />
                        )}
                        getOptionLabel={(option) => option.label}
                      />
                      {
                        formik.touched.state && formik.errors.state &&
                        <ErrorLabel errorLabel={formik.errors.state} />
                      }
                    </Grid>
                  </Grid>
                  <Stack className="p-6 mt-4 align-items-center gap-1 rounded" sx={{ border: "1px dashed grey" }} >
                    <Button
                      component="label"
                      role={undefined}
                      variant="contained"
                      tabIndex={-1}
                      startIcon={<CloudUpload />}
                    >
                      {i({ id: "APPLICATION.UPLOAD_RESUME" })}
                      <VisuallyHiddenInput
                        name="resume"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          formik.setFieldTouched("resume", true);
                          handleFileChange(e, formik.setFieldValue);
                        }}
                      />
                    </Button>

                    <Typography variant="caption">
                      {`${i({ id: "PROFILE.IMAGE.SELECTED_IMAGE" })} : ${formik.values.resume?.name ?? ""}`}
                    </Typography>
                    <Typography variant="body2" className="text-center ">
                      {i({ id: "APPLICATION.RESUME_INSTRUCTION", })}
                    </Typography>
                  </Stack>
                  {formik.touched.resume &&
                    formik.errors.resume &&
                    <ErrorLabel errorLabel={formik.errors.resume} />
                  }
                  <Stack className="flex-row justify-content-end mt-4 gap-2">
                    <CustomisedButton
                      variant="outlined"
                      label={i({ id: "BUTTON.CLOSE" })}
                      handleClick={handleClose}
                    />
                    <CustomisedButton
                      variant="outlined"
                      label={i({ id: "BUTTON.RESET" })}
                      handleClick={() => formik.resetForm()}
                    />
                    <CustomisedButton
                      loading={formik.isSubmitting}
                      label={i({ id: "BUTTON.ADD" })}
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
        </CustomisedModal>
      )}
    </>
  );
};
