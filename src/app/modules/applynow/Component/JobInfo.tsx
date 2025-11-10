import React from 'react'
import { ApplicantModel, JobModal } from '../../recruitment/models'
import { Autocomplete, Box, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { useIntl } from 'react-intl'
import { CloudUploadOutlined } from '@mui/icons-material'
import { Formik, FormikState } from 'formik'
import { experienceCategoryList, indianStates } from '../../../../utils/constant/Constant'
import { applicantValidationSchema } from '../../../../utils/Schema/applicantValidationSchema'
import CustomisedButton from '../../../shared/components/CustomisedButton'
import { ErrorLabel } from '../../../shared/components/form-component/ErrorLabel'
import { toast } from 'react-toastify'
import { uploadResume } from '../../recruitment/services'
import { applyNow } from '../services'
import { ApplicantStatus, ApplicationStatus } from '../../../../utils/enums'
import { SelectInput } from "../../../shared/components/form-component/SelectInput";

type Props = {
    selectedJob: JobModal | undefined,
    activeJobPositionsList: Array<JobModal>,
    handleChangePostion: (job: JobModal | undefined) => void
}

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
    status: ApplicantStatus.InActive,
    activityType: ApplicationStatus.New,
};


export default function JobInfo(props: Props) {
    const intl = useIntl();

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
        const payload: ApplicantModel = {
            ...values,
            experience: values.experience * 12,
        };
        try {
            const { data } = await applyNow(payload);
            if (!data.success) throw new Error(data.message);
            const uploadResumeResponse = await uploadResume(values.email, formData);
            const responseData = uploadResumeResponse.data;
            if (!responseData.success) throw new Error(responseData.message);
            toast.success(data.message);
            resetForm();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <Stack spacing={2}>
            <Typography variant="h5" sx={{
                fontWeight: '600'
            }}>
                {intl.formatMessage({ id: "JOB.DESCRIPTION" })}
            </Typography>
            <Stack >
                {props.selectedJob && (
                    <Stack><Typography
                        variant="body1"
                        dangerouslySetInnerHTML={{
                            __html: props.selectedJob.description,
                        }}
                        sx={{
                            fontWeight: 400
                        }} />
                        <Divider sx={{ borderColor: 'black', borderWidth: '1px', marginBottom: '20px' }} />
                        <Formik
                            enableReinitialize
                            initialValues={{ ...initialValues, vacancyId: props.selectedJob.jobId }}
                            validationSchema={applicantValidationSchema}
                            onSubmit={(value, { setSubmitting, resetForm }) => {
                                handleApplicationSubmission(
                                    value,
                                    setSubmitting,
                                    resetForm
                                )
                            }}
                        >
                            {({
                                status, values, touched, errors, isValid, dirty, isSubmitting, setFieldValue, setFieldTouched, handleSubmit, getFieldProps, ...formik
                            }) => {
                                return (
                                    <form onSubmit={handleSubmit}>
                                        <Grid container spacing={2}>
                                            <Grid size={12}>
                                                <Typography variant="h5" sx={{ fontWeight: '600' }}>
                                                    {intl.formatMessage({ id: "TITLES.APPLY_HERE" })}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {intl.formatMessage({
                                                        id: "MESSAGE.PLEASE_FILL_FORM",
                                                    })}
                                                </Typography>
                                            </Grid>

                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 6
                                                }}>
                                                <TextField
                                                    fullWidth
                                                    label={intl.formatMessage({
                                                        id: "FORM.FIRST_NAME",
                                                    })}
                                                    type="text"
                                                    error={touched.firstName && Boolean(errors.firstName)}
                                                    {...getFieldProps("firstName")} />
                                            </Grid>
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 6
                                                }}>
                                                <TextField
                                                    fullWidth
                                                    label={intl.formatMessage({
                                                        id: "FORM.LAST_NAME",
                                                    })}
                                                    error={touched.lastName && Boolean(errors.lastName)}
                                                    type="text"
                                                    {...getFieldProps("lastName")} />
                                            </Grid>
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 6
                                                }}>
                                                <TextField
                                                    fullWidth
                                                    label={intl.formatMessage({ id: "FORM.PHONE" })}
                                                    error={touched.phone && Boolean(errors.phone)}
                                                    type="text"
                                                    {...getFieldProps("phone")} />
                                            </Grid>
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 6
                                                }}>
                                                <TextField
                                                    fullWidth
                                                    label={intl.formatMessage({
                                                        id: "FORM.EMAIL",
                                                    })}
                                                    error={touched.email && Boolean(errors.email)}
                                                    type="email"
                                                    {...getFieldProps("email")} />
                                            </Grid>

                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 6
                                                }}>
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
                                                        value={props.selectedJob?.jobId}
                                                        error={touched.vacancyId && Boolean(errors.vacancyId)}
                                                        onChange={(event) => {
                                                            setFieldValue(
                                                                "vacancyId",
                                                                event.target.value
                                                            )

                                                            const check = props.activeJobPositionsList.find((job) => job.jobId === event.target.value)
                                                            props.handleChangePostion(check)
                                                        }}
                                                        onBlur={() => {
                                                            setFieldTouched("vacancyId", true)
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
                                                    </Select>
                                                </FormControl>
                                                {touched.vacancyId &&
                                                    errors.vacancyId &&
                                                    <ErrorLabel errorLabel={errors.vacancyId} />}
                                            </Grid>
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 6
                                                }}>
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
                                            <Grid size={12}>
                                                <Autocomplete
                                                    id="state-dropdown"
                                                    size="small"
                                                    value={indianStates.find(
                                                        (state) => state.value === values.state
                                                    )}
                                                    options={indianStates}
                                                    onChange={(event, value) => {
                                                        setFieldTouched("state", true)
                                                        setFieldValue("state", value?.value)
                                                    }}
                                                    renderInput={(param) => (
                                                        <TextField {...param} label={"Select State"} />
                                                    )}
                                                    getOptionLabel={(option) => option.label} />
                                                {touched.state && errors.state &&
                                                    <ErrorLabel errorLabel={errors.state} />}
                                            </Grid>
                                        </Grid>
                                        <Stack sx={{
                                            mt: 2
                                        }}>
                                            <Typography variant="body1" sx={{
                                                mb: 1
                                            }}>
                                                {intl.formatMessage({ id: "APPLICATION.UPLOAD_RESUME" })}
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
                                                    <Tooltip title="" placement="top">
                                                        <Box
                                                            component="label"
                                                            sx={{
                                                                px: 2,
                                                                py: 0.5,
                                                                borderRadius: 1
                                                            }}>
                                                            <CloudUploadOutlined
                                                                fontSize="large"
                                                                className="text-primary" />
                                                            <input
                                                                name="resume"
                                                                type="file"
                                                                accept=".pdf,"
                                                                onChange={(e) => {
                                                                    setFieldTouched("resume", true)
                                                                    handleFileChange(e, setFieldValue)
                                                                }}
                                                                // onBlur={() => setFieldTouched("resume", true)}
                                                                hidden />
                                                        </Box>
                                                    </Tooltip>
                                                    <Stack>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                flexWrap: "wrap",
                                                                textAlign: "center"
                                                            }}>
                                                            {values.resume ? values.resume.name : ""}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>

                                                <Stack>
                                                    <Typography variant="body2">
                                                        {intl.formatMessage({
                                                            id: "APPLICATION.RESUME_INSTRUCTION",
                                                        })}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </Grid>
                                        {touched.resume && errors.resume &&
                                            <ErrorLabel errorLabel={errors.resume} />}
                                        <Grid
                                            size={12}
                                            sx={{
                                                textAlign: "center",
                                                mt: 2
                                            }}>
                                            <CustomisedButton
                                                type="submit"
                                                variant="contained"
                                                label="Submit"
                                                size="medium"
                                                disabled={isSubmitting || !dirty} />
                                        </Grid>
                                    </form>
                                );
                            }}
                        </Formik>
                    </Stack>
                )}
            </Stack>
        </Stack>
    );
}
