import { useIntl } from "react-intl";
import { InviteEmployeeResponse, InviteNewEmployeeModel } from "../models";
import { InputFieldProps, TextInput } from "../../../shared/components/form-component/TextInput";
import { PersonAdd } from "@mui/icons-material";
import { Alert, Stack } from "@mui/material";
import { Formik, FormikProps } from "formik";
import { inviteEmployeeSchema } from "../../../../utils/Schema/employeeSchema";
import { inviteNewEmployee } from "../employeeServices";
import { toast } from "react-toastify";
import { getCustomStatusCodesErrorMessage } from "../../../../utils/common";

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

    const InviteNewEmployee = async (values: InviteNewEmployeeModel, setSubmitting: (isSubmitting: boolean) => void) => {
        try {
            const { data } = await inviteNewEmployee(values);
            if (data.success) {
                toast.success(i({ id: "TOAST.SUCCESS.INVITE_EMPLOYEE" }));
                setTimeout(() => {
                    handleInviteUser(data.success, data.methodResult);
                }, 0);
            } else {
                toast.error(i({ id: getCustomStatusCodesErrorMessage(data.statusCode) }))
            }
        } catch (error) {
            toast.error(i({ id: "TOAST.FAILED.INVITE_EMPLOYEE" }))
        } finally {
            setSubmitting(false);
            handleButtonLoading(false);
        }
    }
    return (
        <Stack spacing={2} sx={{ p: 1 }}>
            <Alert severity="warning" icon={<PersonAdd />}>
                {i({ id: "EMPLOYEE.INVITE_EMP.INVITE_NOTE" })}
            </Alert>
            <Formik
                initialValues={initialEmployeeDetails}
                validationSchema={inviteEmployeeSchema}
                onSubmit={(values, { setSubmitting }) => {
                    InviteNewEmployee(values, setSubmitting);
                }}
                innerRef={formRef}
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
                        </form>
                    }
                }
            </Formik>
        </Stack >
    )
}