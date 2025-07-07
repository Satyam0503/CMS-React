import { FC, useEffect, useState } from "react"
import { CustomisedModal } from "../../../shared/components/CustomisedModal"
import { Autocomplete, Avatar, Grid, ListItemAvatar, ListItemButton, ListItemText, Stack, TextField, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { Formik } from "formik"
import { LeaveBalanceInitialValueModel, LeaveType } from "../model"
import { getLeaveTypes } from "../leaveServices"
import { toast } from "react-toastify"
import CustomisedButton from "../../../shared/components/CustomisedButton"
import { getAllEmployees } from "../../employees/employeeServices"
import { GetAllEmployeeResponseModel } from "../../employees/models"
import { leaveBalanceValidationSchema } from "../../../../utils/Schema/leaveManagementValidationSchemas"



type Props = {
    open: boolean,
    handleClose: () => void,
    initialValues: LeaveBalanceInitialValueModel
}

export const AddLeaveBalance: FC<Props> = (props) => {
    const { formatMessage: i } = useIntl();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [employeeList, setEmployeeList] = useState<GetAllEmployeeResponseModel[]>([]);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getAllEmployees();
                if (data.success) {
                    setEmployeeList(data.methodResults);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [])

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getLeaveTypes();
                if (data.success) {
                    if (data.methodResults.length === 0) {
                        toast.error(i({ id: "PLEASE_ADD_LEAVE_TYPES" }));
                        props.handleClose();
                    }
                    else {
                        setLeaveTypes(data.methodResults);
                    }
                }
            } catch (error: any) {
                console.error(error.message);
            }
        })();
    }, [])
    return (
        <CustomisedModal open={props.open} handleClose={props.handleClose}>
            <Typography variant="h5" className="mb-4">{i({ id: "ADD_LEAVE_BALANCE" })}</Typography>
            <Formik initialValues={props.initialValues} validationSchema={leaveBalanceValidationSchema} onSubmit={(values, { setSubmitting }) => {
                console.log(values);
            }}>
                {
                    ({ values, setFieldValue, setFieldTouched, handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <Grid>
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        id="reporting_manager"
                                        size="small"
                                        value={employeeList.find(
                                            (emp) => emp.userId === values.employeeId
                                        ) || null}
                                        options={employeeList}
                                        onChange={(event, value) => {
                                            setFieldTouched("employeeId", true);
                                            setFieldValue(
                                                "employeeId",
                                                value ? value.userId : ""
                                            );
                                        }}
                                        renderInput={(param) => (
                                            <TextField
                                                {...param}
                                                label={i({
                                                    id: "EMPLOYEE",
                                                })}
                                            />
                                        )}
                                        getOptionLabel={(option) => option.fullName}
                                        renderOption={(props, emp, state) => {
                                            return (
                                                <ListItemButton key={emp.userId}  >
                                                    <ListItemAvatar sx={{ minWidth: "auto", mr: 1 }}>
                                                        <Avatar src={emp.fullProfileUrl} alt="Profile" sx={{ width: 32, height: 32 }} />
                                                    </ListItemAvatar>
                                                    <ListItemText primary={emp.fullName} secondary={emp.jobRole} />
                                                </ListItemButton>
                                            );
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Stack className="flex-row gap-2 justify-content-end mt-4">
                                <CustomisedButton variant="outlined" label={i({ id: "BUTTON.CANCEL" })} />
                                <CustomisedButton type="submit" label={i({ id: "BUTTON.ADD" })} />
                            </Stack>
                        </form>
                    )
                }
            </Formik>

        </CustomisedModal >
    )
}