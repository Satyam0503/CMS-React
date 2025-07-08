import * as Yup from "yup";
import { LEAVE_TYPE } from "../enums";

export const leaveTypeValidationSchma = Yup.object().shape({
  leaveTypes: Yup.number()
    .oneOf(
      Object.values(LEAVE_TYPE).filter((lt) => typeof lt === "number"),
      "INVALID_LEAVE_TYPE"
    )
    .required("REQUIRED_TYPE"),
  minAdvanceNoticeDate: Yup.number()
    .min(1, "MIN_ADVANCE_NOTICE_DAY")
    .required("REQUIRED_TYPE"),
  maxLeaveDays: Yup.number().min(1, "MAX_LEAVE_DAY").required("REQUIRED_TYPE"),
  isHalfDay: Yup.bool().required(),
  isActive: Yup.bool().required(),
});

export const leaveBalanceValidationSchema = Yup.object().shape({
  employeeId: Yup.string().required("REQUIRED_TYPE"),
  leaveTypeBalances: Yup.array()
    .of(
      Yup.object().shape({
        leaveType: Yup.number()
          .oneOf(
            Object.values(LEAVE_TYPE).filter((lt) => typeof lt === "number"),
            "INVALID_LEAVE_TYPE"
          )
          .required("REQUIRED_TYPE"),
        maximumLeave: Yup.number()
          .required("REQUIRED_TYPE")
          .min(1, "Leave balance cannot be negative"),
      })
    )
    .required("Leave balances are required"),
});
