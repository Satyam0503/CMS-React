import { useIntl } from "react-intl";
import { CustomisedModal } from "../../shared/components/CustomisedModal";
import { Formik } from "formik";
import { TextInput } from "../../shared/components/form-component/TextInput";
import { DialogActions, Grid } from "@mui/material";
import { payrollValidationSchema } from "../../../utils/Schema/payrollValidationSchema";
import CustomisedButton from "../../shared/components/CustomisedButton";
import { PayRollDataModel } from "./models";
import { Nullable } from "../../../utils/common_types";
import CustomisedDatePicker from "../../shared/components/CustomisedDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { ErrorLabel } from "../../shared/components/form-component/ErrorLabel";
import { addUpdateEmployeePayRoll } from "./services";
import { toast } from "react-toastify";
import { getStatusCodeString } from "../../../utils/common";

interface PropsType {
    open: boolean;
    edit: boolean;
    initialValues: Nullable<PayRollDataModel> & { payMonth: Dayjs };
    handleClose: () => void;
    handlePageRefresh: () => void;
}

interface FormFieldProps {
    id: number;
    label: string;
    name: string;
    type: React.InputHTMLAttributes<unknown>['type'] | "dateTime";
    min?: number;
    max?: number;
}

const formField: FormFieldProps[] = [
    { id: 1, label: "PAYROLL.TABLE.EMP_ID", name: "employeeId", type: "text" },
    { id: 2, label: "PAYROLL.TABLE.BASIC_PAY", name: "basicPay", type: "number", min: 0 },
    { id: 3, label: "PAYROLL.TABLE.PAID_DAYS", name: "paidDays", type: "number", min: 0, max: 31 },
    { id: 4, label: "PAYROLL.TABLE.BONUS", name: "bonus", type: "number", min: 0 },
    { id: 5, label: "PAYROLL.TABLE.HRA", name: "hra", type: "number", min: 0 },
    { id: 6, label: "PAYROLL.TABLE.LTA", name: "lta", type: "number", min: 0 },
    { id: 7, label: "PAYROLL.TABLE.OTHER_ALLOWANCE", name: "otherAllowance", type: "number", min: 0 },
    { id: 8, label: "PAYROLL.TABLE.LOSS_OF_PAID_DAYS", name: "lossOfPayDays", type: "number", min: 0, max: 31 },
    { id: 9, label: "PAYROLL.TABLE.LOSS_OF_PAY", name: "lossOfPay", type: "number", min: 0 },
    { id: 10, label: "PAYROLL.TABLE.INCOME_TAX", name: "incomeTax", type: "number", min: 0 },
    { id: 11, label: "PAYROLL.TABLE.HEALTH_INS", name: "healthInsurance", type: "number", min: 0 },
    { id: 12, label: "PAYROLL.TABLE.PAY_MONTH", name: "payMonth", type: "dateTime" },
]
export const AddUpdateEmployeePayRoll = ({ open, handleClose, edit, initialValues, handlePageRefresh }: PropsType) => {
    const { formatMessage: i } = useIntl();


    const handleAddUpdate = async (values: typeof initialValues, setSubmitting: (isSubmitting: boolean) => void) => {
        try {
            const { data } = await addUpdateEmployeePayRoll(values);
            if (data.success) {
                toast.success(i({ id: edit ? "TOAST.SUCCESS.PAYROLL_UPDATED" : "TOAST.SUCCESS.PAYROLL_ADDED" }));
                handleClose();
                handlePageRefresh();
            }
            else {
                toast.error(i({ id: getStatusCodeString(data.statusCode), defaultMessage: i({ id: "ERROR.SOMETHING_WRONG" }) }))
            }
        } catch (error) {
            console.error((error as Error).message);
        }
        finally {
            setSubmitting(false);
        }
    }

    return (
        <CustomisedModal open={open} handleClose={handleClose} title={i({ id: edit ? "PAYROLL.UPDATE_EMP_PAYROLL" : "PAYROLL.ADD_EMP_PAYROLL" })}>
            <Formik
                initialValues={initialValues}
                validationSchema={payrollValidationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    handleAddUpdate(values, setSubmitting);
                }}
            >
                {
                    ({ handleSubmit, setFieldValue, setFieldTouched, ...formik }) => (
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                {
                                    formField.map((field) => {
                                        if (field.type == "dateTime") {
                                            return (
                                                <Grid
                                                    key={field.id}
                                                    className="pt-2"
                                                    size={{
                                                        xs: 12,
                                                        sm: 6
                                                    }}>
                                                    <CustomisedDatePicker
                                                        name={field.name}
                                                        value={initialValues.payMonth}
                                                        label={i({ id: field.label })}
                                                        views={['year', 'month']}
                                                        setValue={(date: Dayjs | null) => {
                                                            setFieldTouched("payMonth", true);
                                                            setFieldValue("payMonth", date);
                                                        }}
                                                        maxDate={dayjs().subtract(1, "month")}
                                                    />
                                                    {
                                                        formik.touched.payMonth &&
                                                        formik.errors.payMonth &&
                                                        <ErrorLabel errorLabel={formik.errors.payMonth as string} />
                                                    }
                                                </Grid>
                                            );
                                        }
                                        return (
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 6
                                                }}>
                                                <TextInput
                                                    name={field.name}
                                                    type={field.type}
                                                    label={i({ id: field.label })}
                                                    inputProps={{
                                                        min: field.min,
                                                        max: field.max,
                                                        step: "0.0001"
                                                    }}
                                                />
                                            </Grid>
                                        );
                                    })
                                }
                            </Grid>
                            <DialogActions className="mt-4" >
                                <CustomisedButton label={i({ id: "BUTTON.CANCEL" })} variant="outlined" handleClick={handleClose} />
                                <CustomisedButton loading={formik.isSubmitting} label={i({ id: edit ? "BUTTON.UPDATE" : "BUTTON.ADD" })} type="submit" />
                            </DialogActions>
                        </form>
                    )
                }
            </Formik>
        </CustomisedModal>
    );
}