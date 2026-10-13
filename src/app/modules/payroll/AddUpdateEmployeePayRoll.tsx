import { useIntl } from "react-intl";
import { CustomisedModal } from "../../shared/components/C_Modal";
import { Formik } from "formik";
import { TextInput } from "../../shared/components/form-component/TextInput";
import { CurrencyInput } from "../../shared/components/form-component/CurrencyInput";
import { Box, DialogActions, Divider, Grid, InputAdornment, Stack, Typography } from "@mui/material";
import { payrollValidationSchema } from "../../../utils/Schema/payrollValidationSchema";
import CustomisedButton from "../../shared/components/C_Button";
import { PayRollDataModel } from "./models";
import { Nullable } from "../../../utils/common_types";
import CustomisedDatePicker from "../../shared/components/C_DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { DateView } from "@mui/x-date-pickers";
import { ErrorLabel } from "../../shared/components/form-component/ErrorLabel";
import { addUpdateEmployeePayRoll } from "./services";
import { toast } from "react-toastify";
import { getStatusCodeString } from "../../../utils/common";

type PayRollFormValues = Nullable<PayRollDataModel> & { payMonth: Dayjs };

interface PropsType {
    open: boolean;
    edit: boolean;
    initialValues: PayRollFormValues;
    handleClose: () => void;
    handlePageRefresh: () => void;
}

interface FormFieldProps {
    id: number;
    label: string;
    name: keyof PayRollFormValues;
    type: React.InputHTMLAttributes<unknown>['type'] | "dateTime";
    min?: number;
    max?: number;
    isCurrency?: boolean;
    views?: DateView[];
    maxDate?: Dayjs;
    section: "employee" | "earnings" | "attendance" | "deductions" | "dates";
}

const formField: FormFieldProps[] = [
    { id: 1, label: "PAYROLL.TABLE.EMP_ID", name: "employeeId", type: "text", section: "employee" },
    { id: 2, label: "PAYROLL.TABLE.BASIC_PAY", name: "basicPay", type: "number", min: 0, isCurrency: true, section: "earnings" },
    { id: 4, label: "PAYROLL.TABLE.BONUS", name: "bonus", type: "number", min: 0, isCurrency: true, section: "earnings" },
    { id: 5, label: "PAYROLL.TABLE.HRA", name: "hra", type: "number", min: 0, isCurrency: true, section: "earnings" },
    { id: 6, label: "PAYROLL.TABLE.LTA", name: "lta", type: "number", min: 0, isCurrency: true, section: "earnings" },
    { id: 7, label: "PAYROLL.TABLE.OTHER_ALLOWANCE", name: "otherAllowance", type: "number", min: 0, isCurrency: true, section: "earnings" },
    { id: 3, label: "PAYROLL.TABLE.PAID_DAYS", name: "paidDays", type: "number", min: 0, max: 31, section: "attendance" },
    { id: 8, label: "PAYROLL.TABLE.LOSS_OF_PAID_DAYS", name: "lossOfPayDays", type: "number", min: 0, max: 31, section: "attendance" },
    { id: 9, label: "PAYROLL.TABLE.LOSS_OF_PAY", name: "lossOfPay", type: "number", min: 0, isCurrency: true, section: "attendance" },
    { id: 10, label: "PAYROLL.TABLE.INCOME_TAX", name: "incomeTax", type: "number", min: 0, isCurrency: true, section: "deductions" },
    { id: 11, label: "PAYROLL.TABLE.HEALTH_INS", name: "healthInsurance", type: "number", min: 0, isCurrency: true, section: "deductions" },
    { id: 12, label: "PAYROLL.TABLE.EPF", name: "epf", type: "number", min: 0, isCurrency: true, section: "deductions" },
    { id: 13, label: "PAYROLL.TABLE.ESIC", name: "esic", type: "number", min: 0, isCurrency: true, section: "deductions" },
    { id: 14, label: "PAYROLL.TABLE.PAY_MONTH", name: "payMonth", type: "dateTime", views: ["year", "month"], maxDate: dayjs().subtract(1, "month"), section: "dates" },
    { id: 15, label: "PAYROLL.TABLE.PAID_DATE", name: "paidDate", type: "dateTime", views: ["year", "month", "day"], maxDate: dayjs(), section: "dates" },
]

const sections = [
    { key: "employee", title: "Employee", description: "Payroll is created for this employee." },
    { key: "earnings", title: "Earnings", description: "Monthly earnings before deductions." },
    { key: "attendance", title: "Attendance & loss of pay", description: "Use day fractions such as 0.5 for a half day." },
    { key: "deductions", title: "Deductions", description: "Amounts withheld from this payroll." },
    { key: "dates", title: "Payroll dates", description: "The payroll month and the payment date." },
] as const;
export const AddUpdateEmployeePayRoll = ({ open, handleClose, edit, initialValues, handlePageRefresh }: PropsType) => {
    const { formatMessage: i } = useIntl();


    const handleAddUpdate = async (values: typeof initialValues, setSubmitting: (isSubmitting: boolean) => void) => {
        try {
            // send a plain date string rather than the raw Dayjs object: serializing a Dayjs
            // value sends its full UTC ISO instant, which can shift the intended calendar
            // month backward depending on the browser's local timezone.
            const { data } = await addUpdateEmployeePayRoll({ ...values, payMonth: values.payMonth.format("YYYY-MM-DD") });
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
        <CustomisedModal
            open={open}
            handleClose={handleClose}
            title={i({ id: edit ? "PAYROLL.UPDATE_EMP_PAYROLL" : "PAYROLL.ADD_EMP_PAYROLL" })}
            fullWidth
            paperSx={{ width: "min(920px, calc(100vw - 32px))" }}
            contentSx={{ pt: 1.5, pb: 2 }}
        >
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
                            <Stack spacing={2.25}>
                                {sections.map((section, sectionIndex) => {
                                    const fields = formField.filter((field) => field.section === section.key);
                                    return (
                                        <Box key={section.key}>
                                            {sectionIndex > 0 && <Divider sx={{ mb: 2.25 }} />}
                                            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                                                {section.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                                                {section.description}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {fields.map((field) => {
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
                                                        value={formik.values[field.name] as Dayjs | null}
                                                        label={i({ id: field.label })}
                                                        views={field.views}
                                                        setValue={(date: Dayjs | null) => {
                                                            setFieldTouched(field.name, true);
                                                            setFieldValue(field.name, date);
                                                        }}
                                                        maxDate={field.maxDate}
                                                        disabled={edit && field.name === "payMonth"}
                                                    />
                                                    {
                                                        formik.touched[field.name] &&
                                                        formik.errors[field.name] &&
                                                        <ErrorLabel errorLabel={formik.errors[field.name] as string} />
                                                    }
                                                </Grid>
                                            );
                                        }
                                        return (
                                            <Grid key={field.id}
                                                size={{
                                                    xs: 12,
                                                    sm: 6
                                                }}>
                                                {field.isCurrency ? (
                                                    <CurrencyInput
                                                        name={field.name}
                                                        label={i({ id: field.label })}
                                                        inputProps={{ min: field.min, max: field.max }}
                                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        name={field.name}
                                                        type={field.type}
                                                        label={i({ id: field.label })}
                                                        disabled={edit && field.name === "employeeId"}
                                                        inputProps={{ min: field.min, max: field.max, step: field.name === "paidDays" || field.name === "lossOfPayDays" ? "0.5" : "1" }}
                                                    />
                                                )}
                                            </Grid>
                                        );
                                                })}
                                            </Grid>
                                        </Box>
                                    );
                                })}
                            </Stack>
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
