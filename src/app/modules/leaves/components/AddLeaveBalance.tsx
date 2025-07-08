import { FC, useEffect, useState } from "react"
import { CustomisedModal } from "../../../shared/components/CustomisedModal"
import { Autocomplete, Avatar, Grid, Input, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Select, Stack, TextField, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { Formik } from "formik"
import { LeaveBalanceRequestModel, LeaveType } from "../model"
import { createUpdateLeaveBalance, getLeaveTypes } from "../leaveServices"
import { toast } from "react-toastify"
import CustomisedButton from "../../../shared/components/CustomisedButton"
import { getAllEmployees } from "../../employees/employeeServices"
import { GetAllEmployeeResponseModel } from "../../employees/models"
import { leaveBalanceValidationSchema } from "../../../../utils/Schema/leaveManagementValidationSchemas"
import { blockInvalidCharOnNumberField, LeaveTypeMapper } from "../../../../utils/common"
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel"

type Props = {
    open: boolean,
    handleClose: () => void,
    initialValues: LeaveBalanceRequestModel
}

export const AddLeaveBalance: FC<Props> = (props) => {
    const { formatMessage: i } = useIntl();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [employeeList, setEmployeeList] = useState<GetAllEmployeeResponseModel[]>([]);

    const handleClick = (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void, empId: string) => {
        setFieldValue("employeeId", empId);
    };

    const handleLeaveBalanceSubmission = async (values: LeaveBalanceRequestModel, setSubmitting: (isSubmitting: boolean) => void) => {
        if (values.leaveTypeBalances.length === 0) {
            toast.error(i({ id: "PLEASE_ADD_LEAVE_BALANCE" }));
            setSubmitting(false);
        } else {
            try {
                const { data } = await createUpdateLeaveBalance(values);
                if (data.success) {
                    props.handleClose();
                    toast.success(i({ id: "SUCCESSFULLY_CREATED" }));
                }
            } catch (error) {
                console.error((error as Error).message);
            } finally {
                setSubmitting(false);
            }
        }
    }

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
                handleLeaveBalanceSubmission(values, setSubmitting);
            }}>
                {
                    ({ values, setFieldValue, setFieldTouched, handleSubmit, ...formik }) => {
                        return <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        id="employee_id"
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
                                                <ListItemButton key={emp.userId} onClick={() => handleClick(setFieldValue, emp.userId)} >
                                                    <ListItemAvatar sx={{ minWidth: "auto", mr: 1 }}>
                                                        <Avatar src={emp.fullProfileUrl ?? ""} alt="Profile" sx={{ width: 32, height: 32 }} />
                                                    </ListItemAvatar>
                                                    <ListItemText primary={emp.fullName} secondary={emp.jobRole} />
                                                </ListItemButton>
                                            );
                                        }}
                                    />
                                    {
                                        (formik.touched.employeeId && Boolean(formik.errors.employeeId)) &&
                                        <ErrorLabel>{i({ id: "PLEASE_SELECT_EMPLOYEE" })}</ErrorLabel>
                                    }
                                </Grid>
                                {
                                    leaveTypes.map((type, index) => {
                                        return <Grid item xs={12} md={6} key={index}>
                                            <TextField
                                                fullWidth
                                                label={i({ id: LeaveTypeMapper[type.leaveTypes] })}
                                                type="number"
                                                name="leaveTypeBalances"
                                                inputProps={{
                                                    min: 1,
                                                    max: type.maxLeaveDays
                                                }}
                                                disabled={!values.employeeId}
                                                value={values.leaveTypeBalances.find(item => item.leaveType === type.leaveTypes)?.maximumLeave ?? null}
                                                onChange={(e) => {
                                                    const index = values.leaveTypeBalances.findIndex(item => item.leaveType === type.leaveTypes);
                                                    const updatedLeaveBalances = [...values.leaveTypeBalances];
                                                    if (e.target.value === "") {
                                                        if (index > -1) {
                                                            updatedLeaveBalances.splice(index, 1);
                                                        }
                                                    }
                                                    else {
                                                        if (index > -1) {
                                                            updatedLeaveBalances[index] = { leaveType: type.leaveTypes, maximumLeave: Number(e.target.value) };
                                                        } else {
                                                            updatedLeaveBalances.push({ leaveType: type.leaveTypes, maximumLeave: Number(e.target.value) });
                                                        }
                                                    }
                                                    setFieldValue("leaveTypeBalances", updatedLeaveBalances);
                                                }}
                                                onKeyDown={(e) => {
                                                    blockInvalidCharOnNumberField(e)
                                                }}
                                                onWheel={(e) => {
                                                    (e.target as HTMLInputElement).blur();
                                                }}
                                            />
                                        </Grid>
                                    })
                                }
                            </Grid>
                            <Stack className="flex-row gap-2 justify-content-end mt-4">
                                <CustomisedButton variant="outlined" label={i({ id: "BUTTON.CANCEL" })} handleClick={props.handleClose} />
                                <CustomisedButton
                                    type="submit"
                                    label={i({ id: "BUTTON.ADD" })}
                                    disabled={formik.isSubmitting || !(formik.isValid && formik.dirty)}
                                    loading={formik.isSubmitting}
                                />

                            </Stack>
                        </form>
                    }
                }
            </Formik>

        </CustomisedModal >
    )
}
