import { FC, useEffect, useState } from "react"
import { CustomisedModal } from "../../../shared/components/CustomisedModal"
import { Alert, Autocomplete, Avatar, Grid, Input, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Select, Stack, TextField, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { Formik } from "formik"
import { LeaveBalanceRequestModel, LeaveType } from "../model"
import { createUpdateLeaveBalance, getLeaveTypes } from "../leaveServices"
import { toast } from "react-toastify"
import CustomisedButton from "../../../shared/components/CustomisedButton"
import { getAllEmployees } from "../../employees/employeeServices"
import { GetAllEmployeeResponseModel } from "../../employees/models"
import { leaveBalanceValidationSchema } from "../../../../utils/Schema/leaveManagementValidationSchemas"
import { blockInvalidCharOnNumberField, getStatusCodeString, LeaveTypeMapper } from "../../../../utils/common"
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel"
import { LEAVE_TYPE } from "../../../../utils/enums"
import { useAppLang } from "../../../../_themes/i18n/Metronici18n"
import { useAppSelector } from "../../../Redux/hooks"

type Props = {
    isEdit: boolean,
    handleRefresh: () => void;
    open: boolean,
    handleClose: () => void,
    initialValues: LeaveBalanceRequestModel
}

export const AddLeaveBalance: FC<Props> = (props) => {
    const { formatMessage: i } = useIntl();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [employeeList, setEmployeeList] = useState<GetAllEmployeeResponseModel[]>([]);
    const { currentLanguage } = useAppLang();
    const defaultLanguage = useAppSelector(state => state.user.userData?.defaultLanguage!);

    const handleLeaveBalanceSubmission = async (values: LeaveBalanceRequestModel, setSubmitting: (isSubmitting: boolean) => void) => {
        if (values.leaveTypeBalances.length === 0) {
            toast.error(i({ id: "MESSAGE.PLEASE_ADD_LEAVE_BALANCE" }));
            setSubmitting(false);
        } else {
            try {
                const { data } = await createUpdateLeaveBalance(values);
                if (data.success) {
                    toast.success(i({ id: props.isEdit ? "TOAST.SUCCESS.UPDATE" : "TOAST.SUCCESS.CREATED" }));
                    props.handleClose();
                    props.handleRefresh();
                }
                else {
                    toast.error(i({ id: getStatusCodeString(data.statusCode), defaultMessage: "ERROR.SOMETHING_WRONG" }))
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
                const { data } = await getLeaveTypes(true);
                if (data.success) {
                    if (data.methodResults.length === 0) {
                        toast.error(i({ id: "MESSAGE.PLEASE_ADD_LEAVE_TYPES" }));
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

    const initialBalance = {
        ...props.initialValues,
        leaveTypeBalances: props.initialValues.leaveTypeBalances.filter(item => item !== null)
    }

    const getFilteredLeaveTypes = (empId: string | undefined) => {
        const emp = employeeList.find((e) => e.userId === empId);
        return leaveTypes.filter((type) => {
            if (!emp) return true;
            return emp.gender === "male"
                ? type.leaveType !== LEAVE_TYPE.MATERNITY_LEAVE
                : type.leaveType !== LEAVE_TYPE.PATERNITY_LEAVE;
        });
    };

    return (
        <CustomisedModal open={props.open} handleClose={props.handleClose}
            title={i({ id: props.isEdit ? "LEAVE.TITLES.UPDATE_LEAVE_BALANCE" : "LEAVE.TITLES.ADD_LEAVE_BALANCE" })}
        >
            <Formik initialValues={initialBalance} validationSchema={leaveBalanceValidationSchema} onSubmit={(values, { setSubmitting }) => {
                handleLeaveBalanceSubmission(values, setSubmitting);
            }}>
                {
                    ({ values, setFieldValue, setFieldTouched, handleSubmit, ...formik }) => {
                        return <form onSubmit={handleSubmit}>
                            {
                                Boolean(formik.status) &&
                                <Alert severity="warning" className="mb-4" >{formik.status}</Alert>
                            }
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
                                        disabled={props.isEdit}
                                        renderInput={(param) => (
                                            <TextField
                                                {...param}
                                                label={i({
                                                    id: "LEAVE.EMPLOYEE_NAME",
                                                })}
                                            />
                                        )}
                                        getOptionLabel={(option) => option.fullName}
                                        renderOption={(props, emp) => {
                                            return (
                                                <li {...props}>
                                                    <ListItemAvatar sx={{ minWidth: "auto", mr: 1 }}>
                                                        <Avatar src={emp.fullProfileUrl ?? ""} alt="Profile" sx={{ width: 32, height: 32 }} />
                                                    </ListItemAvatar>
                                                    <ListItemText primary={emp.fullName} secondary={emp.jobRole !== null ? emp.jobRole[currentLanguage] || emp.jobRole[defaultLanguage] : ""} />
                                                </li>
                                            );
                                        }}
                                    />
                                    {
                                        (formik.touched.employeeId && Boolean(formik.errors.employeeId)) &&
                                        <ErrorLabel errorLabel={i({ id: "MESSAGE.PLEASE_SELECT_EMPLOYEE" })} />
                                    }
                                </Grid>
                                {
                                    getFilteredLeaveTypes(values.employeeId).map((type, index) => {
                                        return <Grid item xs={12} md={6} key={index}>
                                            <TextField
                                                fullWidth
                                                label={i({ id: LeaveTypeMapper[type.leaveType] })}
                                                type="number"
                                                name="leaveTypeBalances"
                                                inputProps={{
                                                    min: 1,
                                                    max: type.maxLeaveDays
                                                }}
                                                disabled={!values.employeeId}
                                                value={values.leaveTypeBalances.find(item => item?.leaveType === type.leaveType)?.maximumLeave ?? ""}
                                                onChange={(e) => {
                                                    const balanceValue = e.target.value;
                                                    const index = values.leaveTypeBalances.findIndex(item => item?.leaveType === type.leaveType);
                                                    const updatedLeaveBalances = [...values.leaveTypeBalances];
                                                    if (Number(balanceValue) > type.maxLeaveDays) {
                                                        formik.setStatus(i({ id: "MESSAGE.LEAVE_TYPE_MAX_DAY_EXCEED_ERROR" }, { maxLeaveValue: type.maxLeaveDays, leaveType: i({ id: LeaveTypeMapper[type.leaveType] }) }))
                                                    }
                                                    else {
                                                        formik.setStatus("");
                                                    }
                                                    if (balanceValue === "") {
                                                        if (index > -1) {
                                                            updatedLeaveBalances[index] = { leaveType: type.leaveType, maximumLeave: "" as unknown as number };
                                                        }
                                                    }
                                                    else {
                                                        if (index > -1) {
                                                            updatedLeaveBalances[index] = { leaveType: type.leaveType, maximumLeave: Number(balanceValue) };
                                                        } else {
                                                            updatedLeaveBalances.push({ leaveType: type.leaveType, maximumLeave: Number(balanceValue) });
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
                                    label={i({ id: props.isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD" })}
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
