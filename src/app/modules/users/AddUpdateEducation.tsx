import { Add, Check } from "@mui/icons-material";
import {
    FormHelperText,
    Grid,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../components/CustomisedDatePicker";
import { CustomisedModal } from "../components/CustomizedModal";
import CustomisedButton from "../components/CustomisedButton";
import { useFormik } from "formik";
import dayjs, { Dayjs } from "dayjs";
import { userEducationSchema } from "../../../utils/validation_schemas";
import { EducationType } from "../../../Constant";
import { UserEducationType } from "../../../utils/common_types";

type PropTypes = {
    open: boolean;
    handleAddUpdateEducation:(value: UserEducationType, setSubmitting: (isSubmitting: boolean) => void)=>void
    initialValues: UserEducationType,
    handleClose:()=>void;
}


export default function AddUpdateEducation(props: PropTypes) {
    const intl = useIntl();
    const { open, initialValues,handleClose, handleAddUpdateEducation} = props;
    const { values, handleSubmit, getFieldProps, touched, errors, isSubmitting } = useFormik({
        initialValues: initialValues,
        validationSchema: userEducationSchema,
        onSubmit: (values, { setSubmitting }) => {
            handleAddUpdateEducation(values, setSubmitting);
        }
    })

    return (
        <CustomisedModal open={open} handleClose={handleClose}>
            <Stack>
                <Typography variant="h5" className="text-primary mb-4">
                    {intl.formatMessage({ id: "PROFILE.EDUCATION" })}
                </Typography>
            </Stack>
            <form onSubmit={handleSubmit}>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2 }}>
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            {intl.formatMessage({ id: "INFO.TITLE" })}
                        </Typography>
                        <TextField
                            fullWidth
                            id="outlined-basic"
                            variant="outlined"
                            error={touched.title && Boolean(errors.title)}
                            helperText={(touched.title && errors.title) && errors.title}
                            {...getFieldProps('title')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                            {intl.formatMessage({
                                id: "APPLICATION.START",
                            })}
                        </Typography>
                        <CustomisedDatePicker
                            name="startDate"
                            value={values.startDate}
                            setValue={(newDate) => values.startDate = newDate}
                        />
                        <FormHelperText sx={{ color: '#d32f2f' }}>{(touched.startDate && errors.startDate) && errors.startDate}</FormHelperText>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                            {intl.formatMessage({
                                id: "APPLICATION.END",
                            })}
                        </Typography>
                        <CustomisedDatePicker
                            name="endDate"
                            value={values.endDate}
                            minDate={dayjs(values.startDate)}
                            setValue={(newDate) => values.endDate = newDate}
                        />
                        <FormHelperText sx={{ color: '#d32f2f' }}>{(touched.endDate && errors.endDate) && errors.endDate}</FormHelperText>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                            {intl.formatMessage({
                                id: "MENU.COLLEGE.NAME",
                            })}
                        </Typography>
                        <TextField
                            fullWidth
                            id="outlined-basic"
                            variant="outlined"
                            error={touched.collegeName && Boolean(errors.collegeName)}
                            helperText={touched.collegeName && errors.collegeName && errors.collegeName}
                            {...getFieldProps('collegeName')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                            {intl.formatMessage({ id: "MENU.MODE" })}
                        </Typography>
                        <Select
                            fullWidth
                            id="outlined-basic"
                            variant="outlined"
                            error={touched.type && Boolean(errors.type)}
                            {...getFieldProps('type')}
                        >
                            <MenuItem value={""}>None</MenuItem>
                            {
                                EducationType.map(item => (
                                    <MenuItem key={item.id} value={item.value}>{item.label}</MenuItem>
                                ))
                            }
                        </Select>
                        <FormHelperText sx={{ color: "#d32f2f" }}>{(touched.type && errors.type) && errors.type}</FormHelperText>
                    </Grid>
                </Grid>
                <Stack direction={"row"} spacing={1} className='justify-content-end mt-4'>
                    <CustomisedButton
                        variant="outlined"
                        size="medium"
                        label="Cancel"
                        handleClick={handleClose}
                    />
                    <CustomisedButton
                        variant="outlined"
                        size="medium"
                        label="Add New"
                        Icon={<Add />}
                    />
                    <CustomisedButton
                        variant="contained"
                        size="medium"
                        label="Save"
                        type="submit"
                        disabled={isSubmitting}
                        Icon={<Check />}
                    />
                </Stack>
            </form>
        </CustomisedModal>
    );
}