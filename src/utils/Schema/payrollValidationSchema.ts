import dayjs from "dayjs";
import * as Yup from "yup";

export const payrollValidationSchema = Yup.object().shape({
  basicPay: Yup.number()
    .min(0, "VALIDATION_ERR.NEGATIVE_BALANCE")
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  bonus: Yup.number().min(0, "VALIDATION_ERR.NEGATIVE_BALANCE").notRequired(),
  hra: Yup.number().min(0, "VALIDATION_ERR.NEGATIVE_BALANCE").notRequired(),
  lta: Yup.number().min(0, "VALIDATION_ERR.NEGATIVE_BALANCE").notRequired(),
  otherAllowance: Yup.number()
    .min(0, "VALIDATION_ERR.NEGATIVE_BALANCE")
    .notRequired(),
  paidDays: Yup.number()
    .min(0)
    .max(31, "VALIDATION_ERR.INVALID_PAID_DAYS")
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  lossOfPayDays: Yup.number()
    .min(0)
    .max(31, "VALIDATION_ERR.INVALID_PAID_DAYS")
    .notRequired(),
  lossOfPay: Yup.number()
    .min(0, "VALIDATION_ERR.NEGATIVE_BALANCE")
    .notRequired(),
  incomeTax: Yup.number()
    .min(0, "VALIDATION_ERR.NEGATIVE_BALANCE")
    .notRequired(),
  healthInsurance: Yup.number()
    .min(0, "VALIDATION_ERR.NEGATIVE_BALANCE")
    .notRequired(),
  employeeId: Yup.string().required("VALIDATION_ERR.EMP_ID_REQ"),
  payMonth: Yup.date()
    .max(dayjs().subtract(1, "month"))
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  paidDate: Yup.date()
    .max(dayjs())
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
});
