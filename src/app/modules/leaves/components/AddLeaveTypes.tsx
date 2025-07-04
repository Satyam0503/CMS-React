import { FC } from "react"
import { CustomisedModal } from "../../../shared/components/CustomisedModal"
import { LeaveType } from "../model"
import { Checkbox, FormControlLabel, FormLabel, Grid, IconButton, MenuItem, Stack, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { CheckBox, Close } from "@mui/icons-material"
import { Formik, FormikHelpers, FormikValues } from "formik"
import { SelectInput } from "../../../shared/components/form-component/SelectInput"
import { LeaveTypeConstant } from "../../../../utils/constant/Constant"
import { TextInput } from "../../../shared/components/form-component/TextInput"

type Props = {
    isEdit: boolean,
    open: boolean,
    handleClose: () => void,
    initialLeaveTypeValue: LeaveType
}

export const AddLeaveTypes: FC<Props> = ({ isEdit, open, handleClose, initialLeaveTypeValue }) => {
    const { formatMessage: i } = useIntl();
    return (
        <CustomisedModal open={true} handleClose={handleClose}>
            <Stack spacing={2}>
                <Stack className="flex-row justify-content-between">
                    <Typography variant="h5">{i({ id: isEdit ? "EDIT_LEAVE_TYPE" : "ADD_LEAVE_TYPE" })}</Typography>
                    <IconButton onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Stack>
                <Formik initialValues={initialLeaveTypeValue} onSubmit={function (values: FormikValues, formikHelpers: FormikHelpers<FormikValues>): void | Promise<any> {
                    throw new Error("Function not implemented.")
                }}>
                    {
                        ({ values, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <SelectInput
                                            label={i({ id: "LEAVE_TYPE" })}
                                            name="leaveTypes"
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
                                        <FormControlLabel control={<Checkbox defaultChecked />} label={i({ id: "IS_HALF_DAY_LABEL" })} />
                                    </Grid>
                                </Grid>
                            </form>
                        )
                    }
                </Formik>

            </Stack>
        </CustomisedModal>
    )
}