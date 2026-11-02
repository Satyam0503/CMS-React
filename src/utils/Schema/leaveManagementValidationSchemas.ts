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

export const LeavePolicyValidationSchema = Yup.object().shape({
  name: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  code: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  description: Yup.string().nullable(),
  status: Yup.boolean().required("VALIDATION_ERR.REQUIRED_TYPE"),
  paid: Yup.boolean().required("VALIDATION_ERR.REQUIRED_TYPE"),
  accrualPeriod: Yup.number().required("VALIDATION_ERR.REQUIRED_TYPE"),
  policyType: Yup.number().oneOf([1, 2, 3]).required(),
  accrualAmount: Yup.number().required("VALIDATION_ERR.REQUIRED_TYPE").when(["policyType", "accrualPeriod", "lifecycle"], {
    is: (policyType: number, accrualPeriod: number, lifecycle: any) =>
      policyType === 1 && accrualPeriod !== 3 && !lifecycle?.enabled,
    then: schema => schema.min(0.5, "VALIDATION_ERR.MIN_CREDITED_LEAVES"),
    otherwise: schema => schema.min(0),
  }),
  maxBalance: Yup.number()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .when(["policyType", "accrualPeriod", "lifecycle"], {
      is: (policyType: number, accrualPeriod: number, lifecycle: any) =>
        policyType === 1 && accrualPeriod !== 3 && !lifecycle?.enabled,
      then: (schema: Yup.NumberSchema<number>) =>
        schema.min(Yup.ref("accrualAmount"), "VALIDATION_ERR.MAX_BALANCE_LESS_THAN_CREDITED"),
      otherwise: (schema: Yup.NumberSchema<number>) => schema.min(0),
    }),
  carryOverAllowed: Yup.boolean().required("VALIDATION_ERR.REQUIRED_TYPE"),
  carryOverLimit: Yup.number().nullable(),
  minNoticeDays: Yup.number().min(0).required("VALIDATION_ERR.REQUIRED_TYPE"),
  halfDayAllowed: Yup.boolean().required("VALIDATION_ERR.REQUIRED_TYPE"),
  weekendInclusive: Yup.boolean().required("VALIDATION_ERR.REQUIRED_TYPE"),
  holidayInclusive: Yup.boolean().required("VALIDATION_ERR.REQUIRED_TYPE"),
  attendanceStatusCode: Yup.string()
    .trim()
    .max(20, "Attendance status code must be 20 characters or less")
    .nullable(),
  applicableTo: Yup.array().of(Yup.string()).nullable(),
  workFromHome: Yup.mixed().when("policyType", {
    is: 2,
    then: () => Yup.object({
      fullDayAttendanceStatusCode: Yup.string().trim().required("VALIDATION_ERR.REQUIRED_TYPE"),
      halfDayAttendanceStatusCode: Yup.string().trim().when(["allowFirstHalf", "allowSecondHalf"], {
        is: (first: boolean, second: boolean) => Boolean(first || second),
        then: schema => schema.required("VALIDATION_ERR.REQUIRED_TYPE"),
        otherwise: schema => schema.notRequired(),
      }),
      maxDaysPerWeek: Yup.number().nullable().min(1).max(7, "Maximum WFH days per week cannot exceed 7 days"),
      maxDaysPerMonth: Yup.number().nullable().min(1),
      fullDayRequiredWorkingMinutes: Yup.number().nullable().min(0),
      halfDayRequiredWorkingMinutes: Yup.number().nullable().min(0),
      breakMinutes: Yup.number().nullable().min(0),
      sameDayCutoffTime: Yup.string().nullable(),
      sameDayGraceMinutes: Yup.number().nullable().min(0),
      allowLateApplicationWithApproval: Yup.boolean().nullable(),
    }).required(),
    otherwise: () => Yup.mixed().nullable(),
  })
})

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
  leaveRequestId: Yup.string(),
  leavePolicyId: Yup.string().required("VALIDATION_ERR.INVALID_LEAVE_POLICY"),
  isHalfDay: Yup.bool().required("VALIDATION_ERR.INVALID_LEAVE_TYPE"),
  startDate: Yup.date()
    .min(dayjs().startOf("day"))
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  endDate: Yup.date()
    .min(Yup.ref("startDate"), "VALIDATION_ERR.END_DATE_EARLIER_ERROR")
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  // totalDays: Yup.number().required("VALIDATION_ERR.REQUIRED_TYPE"),
  reason: Yup.string().trim().min(3).required("VALIDATION_ERR.REQUIRED_TYPE"),
});

export const leaveRequestFilterValidationSchema = Yup.object().shape({
  startDate: Yup.date().notRequired(),
  endDate: Yup.date().min(Yup.ref("startDate")).notRequired(),
  status: Yup.number().oneOf([1, 2, 3, 4]).notRequired(),
});
