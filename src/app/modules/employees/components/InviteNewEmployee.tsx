import { FormattedMessage, useIntl } from "react-intl";
import { InviteEmployeeResponse, InviteNewEmployeeModel } from "../models";
import { InputFieldProps, TextInput } from "../../../shared/components/form-component/TextInput";
import { PersonAdd } from "@mui/icons-material";
import {
    Autocomplete,
    Box,
    Stack,
    TextField,
} from "@mui/material";
import { Formik, FormikHelpers, FormikProps } from "formik";
import { inviteEmployeeSchema, normalizeEmployeeNameFields } from "../../../../utils/Schema/employeeSchema";
import { inviteNewEmployee } from "../employeeServices";
import { toast } from "react-toastify";
import { getCustomStatusCodesErrorMessage } from "../../../../utils/common";
import { useEffect, useState } from "react";
import { getNextEmployeeId } from "../../users/userservices";
import { getAllEmployees } from "../employeeServices";
import React from "react";
import { getRequest } from "../../../../server/axios";

import { AppAlert } from "../../../shared/components/ui";
interface PropsTypes {
    handleInviteUser: (isInvited: boolean, employeeData: InviteEmployeeResponse) => void,
    formRef: React.MutableRefObject<FormikProps<InviteNewEmployeeModel> | null>,
    handleButtonLoading: (loading: boolean) => void;
}

const initialEmployeeDetails: InviteNewEmployeeModel = {
    employeeId: "",
    email: "",
    firstName: "",
    lastName: "",
    reportingManager: null,
    scheduleId: "",
}

const inviteEmployeeFormFields: InputFieldProps[] = [
    { name: "employeeId", label: "FORM.EMPID", placeholder: "FORM.EMPID", type: "text" },
    { name: "firstName", label: "FORM.FIRST_NAME", placeholder: "FORM.FIRST_NAME", type: "text" },
    { name: "lastName", label: "FORM.LAST_NAME", placeholder: "FORM.LAST_NAME", type: "text" },
    { name: "email", label: "FORM.EMAIL", placeholder: "FORM.EMAIL", type: "email" },
] as const;

export const InviteNewEmployee = (props: PropsTypes) => {
    const { handleInviteUser, formRef, handleButtonLoading } = props
    const { formatMessage: i } = useIntl();
    const [nextEmployeeId, setNextEmployeeId] = useState<string>("");
    const [managers, setManagers] = useState<Array<{ userId: string; fullName: string; employeeId: string }>>([]);
    const [schedules, setSchedules] = useState<Array<{ scheduleId: string; name: string; isDefault: boolean }>>([]);

    const InviteNewEmployee = async (values: InviteNewEmployeeModel, formikHelpers: Pick<FormikHelpers<InviteNewEmployeeModel>, "setSubmitting" | "setFieldError">) => {
        try {
            const { data } = await inviteNewEmployee(normalizeEmployeeNameFields(values));
            if (data.success) {
                toast.success(i({ id: "TOAST.SUCCESS.INVITE_EMPLOYEE" }));
                setTimeout(() => {
                    handleInviteUser(data.success, data.methodResult);
                }, 0);
            } else {
                const message = data.message || i({ id: getCustomStatusCodesErrorMessage(data.statusCode) });
                if (data.statusCode === 12) formikHelpers.setFieldError("email", message);
                if (data.statusCode === 13) formikHelpers.setFieldError("employeeId", message);
                toast.error(message);
            }
        } catch (error) {
            toast.error(i({ id: "TOAST.FAILED.INVITE_EMPLOYEE" }))
        } finally {
            formikHelpers.setSubmitting(false);
            handleButtonLoading(false);
        }
    }

    useEffect(() => {
        const fetchNextEmployeeId = async () => {
            try {
                const { data } = await getNextEmployeeId();
                if (data.success) {
                    setNextEmployeeId(data.message);
                }
            } catch (error) {
                console.error("Error fetching next employee ID:", error);
            }
        };
        fetchNextEmployeeId();
    }, []);

    useEffect(() => {
        void getRequest<any>("api/CompanyMaster/OfficeSchedules").then(({ data }) => {
            if (data.success) setSchedules((data.methodResults ?? []).filter((shift: any) => shift.isActive));
        }).catch(() => setSchedules([]));
    }, []);

    useEffect(() => {
        void getAllEmployees({ name: "", pageNo: 1, records: 1000, departmentId: [], gender: [] }).then(({ data }) => {
            if (data.success) setManagers((data.methodResults ?? []).map((employee) => ({ userId: employee.userId, fullName: employee.fullName, employeeId: employee.employeeId })));
        });
    }, []);

    return (
        <Stack spacing={2.25} sx={{ py: 0.5 }}>
            <AppAlert severity="warning" icon={<PersonAdd />} sx={{ border: "1px solid", borderColor: "warning.light", borderRadius: 2, alignItems: "center", "& .MuiAlert-message": { fontSize: 13, lineHeight: 1.5 } }}>
                {i({ id: "EMPLOYEE.INVITE_EMP.INVITE_NOTE" })}
            </AppAlert>
            <Formik
                initialValues={{ ...initialEmployeeDetails, employeeId: nextEmployeeId }}
                enableReinitialize
                validationSchema={inviteEmployeeSchema}
                onSubmit={(values, formikHelpers) => {
                    InviteNewEmployee(values, formikHelpers);
                }}
                innerRef={formRef}
            >
                {
                    (formik) => {
                        return <form onSubmit={formik.handleSubmit} className="d-flex flex-column gap-3">
                            {
                                inviteEmployeeFormFields.map(field => (
                                    <React.Fragment key={field.name}>
                                        <Box sx={{ "& .MuiFormLabel-root": { color: "text.primary", fontSize: 13, fontWeight: 700, mb: 0.75 }, "& .MuiOutlinedInput-root": { backgroundColor: "background.paper", borderRadius: 2, "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "primary.light" }, "&.Mui-focused fieldset": { borderWidth: 2 } } }}>
                                          <TextInput
                                              key={field.name}
                                              labelVarient="seperate"
                                              label={i({ id: field.label })}
                                              placeholder={i({ id: field.placeholder })}
                                              type={field.type}
                                              name={field.name}
                                              disabled={field.name === "employeeId" && Boolean(nextEmployeeId)}
                                          />
                                        </Box>
                                        {
                                            field.name === "employeeId" && nextEmployeeId &&
                                            <AppAlert severity="info" className="my-1">
                                                <FormattedMessage id="EMPLOYEE.INVITE_EMP.LAST_EMP_ID" values={{
                                                    empId: nextEmployeeId,
                                                    strong: (chunks) => <strong>{chunks}</strong>
                                                }} />
                                            </AppAlert>
                                        }
                                    </React.Fragment>
                                ))
                            }
                            <Autocomplete
                                size="small"
                                options={managers}
                                value={managers.find((manager) => manager.userId === formik.values.reportingManager) ?? null}
                                onChange={(_, manager) => formik.setFieldValue("reportingManager", manager?.userId ?? null)}
                                getOptionLabel={(manager) => `${manager.fullName} (${manager.employeeId})`}
                                renderInput={(params) => <TextField {...params} label="Reporting Manager" placeholder="Select reporting manager" sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "background.paper", borderRadius: 2, "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "primary.light" }, "&.Mui-focused fieldset": { borderWidth: 2 } }, "& .MuiInputLabel-root": { fontWeight: 700 } }} />}
                            />
                            <Autocomplete
                                size="small"
                                options={schedules}
                                value={schedules.find((shift) => shift.scheduleId === formik.values.scheduleId) ?? null}
                                onChange={(_, shift) => formik.setFieldValue("scheduleId", shift?.scheduleId ?? "")}
                                getOptionLabel={(shift) => `${shift.name}${shift.isDefault ? " (Default)" : ""}`}
                                renderInput={(params) => <TextField {...params} label="Shift" placeholder="Use company default shift" helperText="Optional. If skipped, the company default shift is applied automatically." sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "background.paper", borderRadius: 2 }, "& .MuiInputLabel-root": { fontWeight: 700 } }} />}
                            />
                        </form>
                    }
                }
            </Formik>
        </Stack >
    )
}
