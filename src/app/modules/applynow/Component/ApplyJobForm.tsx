import React from "react";
import {
  CustomisedModal } from "../../../shared/components/CustomisedModal";
import { CloudUpload } from "@mui/icons-material";
import {
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { Grid, Stack } from "@mui/system";
import { Formik } from "formik";
import {
  experienceCategoryList,
  indianStates,
} from "../../../../utils/constant/Constant";
import { applicantValidationSchema } from "../../../../utils/Schema/applicantValidationSchema";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel";
import { SelectInput } from "../../../shared/components/form-component/SelectInput";
import { toast } from "react-toastify";
import { ApplicantModel, JobModal } from "../../recruitment/models";
import { uploadResume } from "../../recruitment/services";
import { applyNow } from "../services";
import { ApplicantStatus, ApplicationStatus } from "../../../../utils/enums";
import { useIntl } from "react-intl";
import { VisuallyHiddenInput } from "../../../shared/components/form-component/VisuallyHiddenInput";
import { AxiosError } from "axios";
import { getCustomStatusCodesErrorMessage } from "../../../../utils/common";

import { AppButton, AppSelect, AppTextField } from "../../../shared/components/ui";
const initialValues: ApplicantModel = {
  applicantId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  state: "",
  experience: 1,
  resume: null,
  vacancyId: "",
  status: ApplicantStatus.Active,
  activityType: ApplicationStatus.New,
};

type Props = {
  selectedJob: JobModal | undefined;
  activeJobPositionsList: Array<JobModal>;
  handleChangePostion: (job: JobModal | undefined) => void;
  open: boolean;
  handleClose: () => void;
};

export default function ApplyJobForm(props: Props) {
  const { formatMessage: i } = useIntl();

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
  ) => {
    const formData = new FormData();
    formData.append("File", values.resume as File);
    const payload: ApplicantModel = {
      ...values,
      experience: values.experience * 12,
    };
    try {
      const { data } = await applyNow(payload);
      if (!data.success) throw new Error(String(data.statusCode));
      const uploadResumeResponse = await uploadResume(values.email, formData);
      const responseData = uploadResumeResponse.data;
      if (!responseData.success) throw new Error(String(responseData.statusCode));
      toast.success(i({ id: "TOAST.SUCCESS.APPLICATION_SUBMITTED" }));
      props.handleClose();
    } catch (error) {
      toast.error(i({ id: getCustomStatusCodesErrorMessage(+(error as AxiosError).message) }));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <CustomisedModal
      open={props.open}
      handleClose={props.handleClose}
      title={i({ id: "TITLES.APPLY_HERE" })}
    >
      <Formik
        enableReinitialize
        initialValues={{
          ...initialValues,
          vacancyId: props.selectedJob!.jobId,
        }}
        validationSchema={applicantValidationSchema}
        onSubmit={(value, { setSubmitting }) => {
          handleApplicationSubmission(value, setSubmitting);
        }}
      >
        {({
          values,
          touched,
          errors,
          dirty,
          isSubmitting,
          setFieldValue,
          setFieldTouched,
          handleSubmit,
          getFieldProps,
        }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="body2">
                    {i({
                      id: "MESSAGE.PLEASE_FILL_FORM",
                    })}
                  </Typography>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <AppTextField
                    fullWidth
                    label={i({
                      id: "FORM.FIRST_NAME",
                    })}
                    type="text"
                    error={touched.firstName && Boolean(errors.firstName)}
                    {...getFieldProps("firstName")}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <AppTextField
                    fullWidth
                    label={i({
                      id: "FORM.LAST_NAME",
                    })}
                    error={touched.lastName && Boolean(errors.lastName)}
                    type="text"
                    {...getFieldProps("lastName")}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <AppTextField
                    fullWidth
                    label={i({ id: "FORM.PHONE" })}
                    error={touched.phone && Boolean(errors.phone)}
                    type="text"
                    {...getFieldProps("phone")}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <AppTextField
                    fullWidth
                    label={i({
                      id: "FORM.EMAIL",
                    })}
                    error={touched.email && Boolean(errors.email)}
                    type="email"
                    {...getFieldProps("email")}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      {i({ id: "JOB.POSITION" })}
                    </InputLabel>

                    <AppSelect
                      label={i({
                        id: "JOB.POSITION",
                      })}
                      fullWidth
                      {...getFieldProps("vacancyId")}
                      value={props.selectedJob?.jobId}
                      error={touched.vacancyId && Boolean(errors.vacancyId)}
                      onChange={(event) => {
                        setFieldValue("vacancyId", event.target.value);

                        const check = props.activeJobPositionsList.find(
                          (job) => job.jobId === event.target.value
                        );
                        props.handleChangePostion(check);
                      }}
                      onBlur={() => {
                        setFieldTouched("vacancyId", true);
                      }}
                    >
                      {props.activeJobPositionsList.map((jobPosition) => (
                        <MenuItem
                          key={jobPosition.jobId}
                          value={jobPosition.jobId}
                        >
                          {jobPosition.title}
                        </MenuItem>
                      ))}
                    </AppSelect>
                  </FormControl>
                  {touched.vacancyId && errors.vacancyId && (
                    <ErrorLabel errorLabel={errors.vacancyId} />
                  )}
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <SelectInput
                    name={"experience"}
                    label={i({
                      id: "USER.EXPERIENCE",
                    })}
                  >
                    {experienceCategoryList.map((experience) => (
                      <MenuItem key={experience.id} value={experience.value}>
                        {experience.label}
                      </MenuItem>
                    ))}
                  </SelectInput>
                </Grid>
                <Grid size={12}>
                  <Autocomplete
                    id="state-dropdown"
                    size="small"
                    value={indianStates.find(
                      (state) => state.value === values.state
                    )}
                    options={indianStates}
                    onChange={(event, value) => {
                      setFieldTouched("state", true);
                      setFieldValue("state", value?.value);
                    }}
                    renderInput={(param) => (
                      <AppTextField {...param} label={"Select State"} />
                    )}
                    getOptionLabel={(option) => option.label}
                  />
                  {touched.state && errors.state && (
                    <ErrorLabel errorLabel={errors.state} />
                  )}
                </Grid>
              </Grid>

              <Typography sx={{ mt: 2 }} >
                {i({ id: "APPLICATION.UPLOAD_RESUME" })}
              </Typography>

              <Stack className="p-6  align-items-center gap-1 rounded" sx={{ border: "1px dashed grey" }} >
                <AppButton
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
                      setFieldTouched("resume", true);
                      handleFileChange(e, setFieldValue);
                    }}
                  />
                </AppButton>

                <Typography variant="caption">
                  {`${i({ id: "PROFILE.IMAGE.SELECTED_IMAGE" })} : ${values.resume?.name ?? ""}`}
                </Typography>
                <Typography variant="body2" className="text-center ">
                  {i({ id: "APPLICATION.RESUME_INSTRUCTION", })}
                </Typography>
              </Stack>

              {touched.resume && errors.resume && (
                <ErrorLabel errorLabel={errors.resume} />
              )}

              <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", mt: 2 }}>
                <CustomisedButton
                  variant="outlined"
                  label={i({ id: "BUTTON.CLOSE" })}
                  handleClick={props.handleClose}
                />
                <CustomisedButton
                  type="submit"
                  variant="contained"
                  label={i({ id: "BUTTON.SUBMIT" })}
                  disabled={isSubmitting || !dirty}
                />
              </Stack>
            </form>
          );
        }}
      </Formik>
    </CustomisedModal>
  );
}
