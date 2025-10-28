import * as Yup from "yup";
import dayjs from "dayjs";

export const leaveTypeValidationSchma = Yup.object().shape({
  leaveType: Yup.number()
    .oneOf([1, 2, 3, 4, 5], "VALIDATION_ERR.INVALID_LEAVE_TYPE")
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  minAdvanceNoticeDate: Yup.number()
    .min(0, "VALIDATION_ERR.MIN_ADVANCE_NOTICE_DAY")
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  maxLeaveDays: Yup.number()
    .min(1, "VALIDATION_ERR.MAX_LEAVE_DAY")
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  isHalfDay: Yup.bool().required(),
  isActive: Yup.bool().required(),
});

export const leaveBalanceValidationSchema = Yup.object().shape({
  employeeId: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  leaveTypeBalances: Yup.array()
    .of(
      Yup.object().shape({
        leaveType: Yup.number()
          .oneOf([1, 2, 3, 4, 5], "VALIDATION_ERR.INVALID_LEAVE_TYPE")
          .required("VALIDATION_ERR.REQUIRED_TYPE"),
        maximumLeave: Yup.number()
          .required("VALIDATION_ERR.REQUIRED_TYPE")
          .min(0, "VALIDATION_ERR.NEGATIVE_LEAVE_BAL"),
      })
    )
    .required(),
});

export const leaveRequestValidationSchema = Yup.object().shape({
  leaveType: Yup.number()
    .oneOf([1, 2, 3, 4, 5], "INVALID_LEAVE_TYPE")
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  isHalfDay: Yup.bool().required("VALIDATION_ERR.INVALID_LEAVE_TYPE"),
  startDate: Yup.date()
    .min(dayjs().startOf("day"))
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  endDate: Yup.date()
    .min(Yup.ref("startDate"), "VALIDATION_ERR.END_DATE_EARLIER_ERROR")
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  totalDays: Yup.number().required("VALIDATION_ERR.REQUIRED_TYPE"),
  reason: Yup.string().trim().min(3).required("VALIDATION_ERR.REQUIRED_TYPE"),
});

export const leaveRequestFilterValidationSchema = Yup.object().shape({
  leaveType: Yup.number()
    .oneOf([1, 2, 3, 4, 5], "INVALID_LEAVE_TYPE")
    .notRequired(),
  startDate: Yup.date().notRequired(),
  endDate: Yup.date().min(Yup.ref("startDate")).notRequired(),
  status: Yup.number().oneOf([1, 2, 3]).notRequired(),
});
