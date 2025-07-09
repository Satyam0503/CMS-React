import { FC } from "react"
import { CustomisedModal } from "../../../shared/components/CustomisedModal"
import { LeaveType } from "../model"
import { FormControl, FormControlLabel, FormLabel, Grid, IconButton, MenuItem, Radio, RadioGroup, Stack, Switch, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { Close } from "@mui/icons-material"
import { Formik } from "formik"
import { SelectInput } from "../../../shared/components/form-component/SelectInput"
import { LeaveTypeConstant } from "../../../../utils/constant/Constant"
import { TextInput } from "../../../shared/components/form-component/TextInput"
import CustomisedButton from "../../../shared/components/CustomisedButton"
import { CustomIconButton } from "../../../shared/components/CustomIconButton"
import { leaveTypeValidationSchma } from "../../../../utils/Schema/leaveManagementValidationSchemas"
import { createUpdateLeaveType } from "../leaveServices"
import { toast } from "react-toastify"

type Props = {
    isEdit: boolean,
    open: boolean,
    handleClose: () => void,
    handleRefresh: () => void,
    initialLeaveTypeValue: LeaveType
}

export const AddLeaveTypes: FC<Props> = ({ isEdit, open, handleClose, initialLeaveTypeValue, handleRefresh }) => {
    const { formatMessage: i } = useIntl();
    const handleLeaveTypeSubmit = async (values: LeaveType, setSubmitting: (isSubmitting: boolean) => void) => {
        try {
            console.log(values);

            const { data } = await createUpdateLeaveType(values);
            if (data.success) {
                handleClose();
                handleRefresh();
                toast.success(i({ id: isEdit ? "SUCCESSFULLY_UPDATED" : "SUCCESSFULLY_CREATED" }))
            }
            else {
                toast.error(i({ id: isEdit ? "LEAVETYPE_UPDATE_FAILED" : "LEAVETYPE_ADD_FAILED" }))
            }
        } catch (error) {
            console.error((error as Error).message);
        }
        finally {
            setSubmitting(false);
        }
    }
    return (
        <CustomisedModal open={open} handleClose={handleClose} maxWidth="xs">
            <Stack spacing={3}>
                <Typography variant="h5">{i({ id: isEdit ? "EDIT_LEAVE_TYPE" : "ADD_LEAVE_TYPE" })}</Typography>
                <Formik
                    initialValues={initialLeaveTypeValue}
                    validationSchema={leaveTypeValidationSchma}
                    onSubmit={(value, { setSubmitting }) => {
                        handleLeaveTypeSubmit(value, setSubmitting)
                    }} >
                    {
                        ({ values, handleSubmit, setFieldValue, ...formik }) => (
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} >
                                        <SelectInput
                                            label={i({ id: "LEAVE_TYPE" })}
                                            name="leaveType"
                                        >
                                            {LeaveTypeConstant.map(type => (
                                                <MenuItem key={type.id} value={type.value}>{i({ id: type.label })} </MenuItem>
                                            ))}
                                        </SelectInput>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextInput
                                            type="number"
                                            name="minAdvanceNoticeDate"
                                            label={i({ id: "MIN_NOTICE_DAY" })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextInput
                                            type="number"
                                            name="maxLeaveDays"
                                            label={i({ id: "MAX_LEAVE_DAYS" })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth className="d-flex flex-row align-items-center gap-4" >
                                            <FormLabel id="half-day" sx={{ color: "text.primary" }}  >{i({ id: "HALF_DAY" })} :</FormLabel>
                                            <RadioGroup
                                                aria-labelledby="half-day"
                                                name="isHalfDay"
                                                row={true}
                                                value={values.isHalfDay}
                                                onChange={(e, value) => {
                                                    if (value == "true") {
                                                        setFieldValue("isHalfDay", true);
                                                    }
                                                    else {
                                                        setFieldValue("isHalfDay", false);
                                                    }
                                                }}
                                            >
                                                <FormControlLabel value={true} control={<Radio />} label={i({ id: "YES" })} />
                                                <FormControlLabel value={false} control={<Radio />} label={i({ id: "NO" })} />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} className="align-self-center">
                                        <FormLabel sx={{ color: "text.primary" }}>{i({ id: "STATUS" })}</FormLabel>
                                        <Switch
                                            className="mx-4"
                                            checked={values.isActive}
                                            onChange={(event) => {
                                                setFieldValue("isActive", event.target.checked);
                                            }}
                                            inputProps={{ "aria-label": "controlled" }}
                                        />
                                    </Grid>
                                </Grid>
                                <Stack className="flex-row justify-content-end gap-2 mt-4" >
                                    <CustomisedButton variant="outlined" label={i({ id: "BUTTON.CANCEL" })} handleClick={handleClose} />
                                    <CustomisedButton label={i({ id: "BUTTON.ADD" })} type="submit" loading={formik.isSubmitting} disabled={formik.isSubmitting || !(formik.isValid && formik.dirty)} />
                                </Stack>
                            </form>
                        )
                    }
                </Formik>
            </Stack>
        </CustomisedModal >
    )
}