import { FC } from "react"
import { CustomisedModal } from "../../../shared/components/CustomisedModal"
import { LeaveType } from "../model"
import { FormControl, FormControlLabel, FormLabel, Grid, IconButton, MenuItem, Radio, RadioGroup, Stack, Switch, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { Formik } from "formik"
import { SelectInput } from "../../../shared/components/form-component/SelectInput"
import { LeaveTypeConstant } from "../../../../utils/constant/Constant"
import { TextInput } from "../../../shared/components/form-component/TextInput"
import CustomisedButton from "../../../shared/components/CustomisedButton"
import { leaveTypeValidationSchma } from "../../../../utils/Schema/leaveManagementValidationSchemas"
import { createUpdateLeaveType } from "../leaveServices"
import { toast } from "react-toastify"
import { getStatusCodeString } from "../../../../utils/common"

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
            const { data } = await createUpdateLeaveType(values);
            if (data.success) {
                handleClose();
                handleRefresh();
                toast.success(i({ id: isEdit ? "TOAST.SUCCESS.UPDATE" : "TOAST.SUCCESS.CREATED" }))
            }
            else {
                toast.error(i({ id: getStatusCodeString(data.statusCode) }))
            }
        } catch (error) {
            console.error((error as Error).message);
        }
        finally {
            setSubmitting(false);
        }
    }

    return (
        <CustomisedModal open={open} handleClose={handleClose} maxWidth="xs"
            title={i({ id: isEdit ? "LEAVE.TITLES.EDIT_LEAVE_TYPE" : "LEAVE.TITLES.ADD_LEAVE_TYPE" })}
        >
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
                                <Grid item xs={12}>
                                    <SelectInput
                                        label={i({ id: "LEAVE.LEAVE_TYPE" })}
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
                                        label={i({ id: "LEAVE.MIN_NOTICE_DAY" })}
                                        inputProps={{
                                            min: 0
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextInput
                                        type="number"
                                        name="maxLeaveDays"
                                        label={i({ id: "LEAVE.MAX_LEAVE_DAYS" })}
                                        inputProps={{
                                            min: 1,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth className="d-flex flex-row align-items-center gap-4" >
                                        <FormLabel id="half-day" sx={{ color: "text.primary" }}  >{i({ id: "LEAVE.HALF_DAY" })} :</FormLabel>
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
                                <CustomisedButton label={i({ id: isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD" })} type="submit" loading={formik.isSubmitting} disabled={formik.isSubmitting || !(formik.isValid && formik.dirty)} />
                            </Stack>
                        </form>
                    )
                }
            </Formik>
        </CustomisedModal >
    )
}