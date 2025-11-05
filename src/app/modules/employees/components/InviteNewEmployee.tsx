import { useIntl } from "react-intl";
import { InviteEmployeeResponse, InviteNewEmployeeModel } from "../models";
import { InputFieldProps, TextInput } from "../../../shared/components/form-component/TextInput";
import { PersonAdd } from "@mui/icons-material";
import { Alert, Button, Stack } from "@mui/material";
import { Formik } from "formik";
import { inviteEmployeeSchema } from "../../../../utils/Schema/employeeSchema";
import { inviteNewEmployee } from "../employeeServices";
import { toast } from "react-toastify";
import { getStatusCodeString } from "../../../../utils/common";

interface PropsTypes {
    handleInviteUser: (isInvited: boolean, employeeData: InviteEmployeeResponse) => void
}

const initialEmployeeDetails: InviteNewEmployeeModel = {
    employeeId: "",
    email: "",
    firstName: "",
    lastName: "",
}

const inviteEmployeeFormFields: InputFieldProps[] = [
    { name: "employeeId", label: "FORM.EMPID", placeholder: "FORM.EMPID", type: "text" },
    { name: "firstName", label: "FORM.FIRST_NAME", placeholder: "FORM.FIRST_NAME", type: "text" },
    { name: "lastName", label: "FORM.LAST_NAME", placeholder: "FORM.LAST_NAME", type: "text" },
    { name: "email", label: "FORM.EMAIL", placeholder: "FORM.EMAIL", type: "email" },
] as const;

export const InviteNewEmployee = (props: PropsTypes) => {
    const { handleInviteUser } = props
    const { formatMessage: i } = useIntl();

    const InviteNewEmployee = async (values: InviteNewEmployeeModel, setSubmitting: (isSubmitting: boolean) => void) => {
        try {
            const { data } = await inviteNewEmployee(values);
            if (data.success) {
                toast.success(i({ id: "TOAST.SUCCESS.INVITE_EMPLOYEE" }))
                handleInviteUser(data.success, data.methodResult);
            } else {
                toast.error(i({ id: getStatusCodeString(data.statusCode) }))
            }
        } catch (error) {
            console.log((error as Error).message);
            toast.error(i({ id: "TOAST.FAILED.INVITE_EMPLOYEE" }))
        } finally {
            setSubmitting(false);
        }

    }
    return (
        <Stack spacing={2} sx={{ p: 1, marginBlockStart: 2 }}>
            <Alert color="warning" severity="warning" icon={<PersonAdd />}>
                {i({ id: "EMPLOYEE.INVITE_EMP.INVITE_NOTE" })}
            </Alert>
            <Formik
                initialValues={initialEmployeeDetails}
                validationSchema={inviteEmployeeSchema}
                onSubmit={(values, { setSubmitting }) => {
                    InviteNewEmployee(values, setSubmitting);
                }}
            >
                {
                    (formik) => {
                        return <form onSubmit={formik.handleSubmit} className="d-flex flex-column gap-3">
                            {
                                inviteEmployeeFormFields.map(field => (
                                    <TextInput
                                        key={field.name}
                                        labelVarient="seperate"
                                        label={i({ id: field.label })}
                                        placeholder={i({ id: field.placeholder })}
                                        type={field.type}
                                        name={field.name}
                                        showErrorLabel={false}
                                    />
                                ))
                            }
                            <Stack sx={{ mt: 4 }}>
                                <Button variant="contained" type="submit" className="align-self-start" loading={formik.isSubmitting}>
                                    {i({ id: "BUTTON.INVITE" })}
                                </Button>
                            </Stack>
                        </form>
                    }
                }

            </Formik>
        </Stack >
    )
}