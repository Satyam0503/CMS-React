import * as Yup from "yup";
import dayjs from "dayjs";

export const salaryValidationSchema =  Yup.object().shape({
    userId: Yup.string()
        .required("VALIDATION_ERR.REQUIRED_TYPE"),
    basicPay: Yup.number()
        .required("VALIDATION_ERR.REQUIRED_TYPE"),
    hra: Yup.number(),
    otherAllowance: Yup.number(),
    lta: Yup.number(),
    bonus: Yup.number(),
    healthInsurance: Yup.number(),
    totalDeductions: Yup.number(),
    effectiveFrom: Yup.date()
  .transform((value, originalValue) =>
    dayjs(originalValue).isValid()
      ? dayjs(originalValue).toDate()
      : null
  )
  .required("VALIDATION_ERR.REQUIRED_TYPE"),
    effectiveTo: Yup.date().nullable().test(
        "effective-date-order",
        "Effective to must be on or after Effective from.",
        function (effectiveTo) {
            const effectiveFrom = this.parent.effectiveFrom;
            return !effectiveTo || !effectiveFrom || !dayjs(effectiveTo).isBefore(dayjs(effectiveFrom), "day");
        },
    ),
    paymentFrequency: Yup.string(),
    status: Yup.boolean(),
})
