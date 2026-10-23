import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";

import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../../../shared/components/C_DatePicker";
import CustomisedButton from "../../../../shared/components/C_Button";
import { CustomisedModal } from "../../../../shared/components/C_Modal";
import {
  EmployeeLeaveTypeBalance,
  LeavePolicyModel,
  RequestLeaveModel,
} from "../../../leaves/model";
import { Formik } from "formik";
import { leaveRequestValidationSchema } from "../../../../../utils/Schema/leaveManagementValidationSchemas";
import { getCustomStatusCodesErrorMessage } from "../../../../../utils/common";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import dayjs, { Dayjs } from "dayjs";
import { createEmployeeLeaveRequest, createMyProfileLeaveRequest, createMyProfileLeaveRequestWithEvidence, createWorkFromHomeRequest, getLeavePolicies, getMySelfServiceLeavePolicies, updateLeaveRequest, updateMyProfileLeaveRequest, } from "../../../leaves/leaveServices";
import { useAppSelector } from "../../../../Redux/hooks";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { getHolidays } from "../../../holidays/calendarServices";
import { HolidayModel, HolidayPayload } from "../../../holidays/models";
import { useEffect, useState } from "react";
import { getRequest } from "../../../../../server/axios";

import { AppAlert, AppRadio, AppSelect } from "../../../../shared/components/ui";
import { EmployeeLifecyclePolicy, getEmployeeLifecycleSelfServicePolicies } from "../../../employees/employeeServices";

type SelectableLeaveType = EmployeeLeaveTypeBalance & {
  policyType?: 1 | 2 | 3 | 4;
};
type Props = {
  edit: boolean;
  initialValues: RequestLeaveModel;
  leaveTypeBalance: EmployeeLeaveTypeBalance[];
  open: boolean;
  handleClose: () => void;
  handleRefresh?: () => void;
  targetEmployeeId?: string;
};

const getWorkFromHomeErrorMessage = (errorMessage?: string) => {
  const [rawCode, ...rawDetails] = (errorMessage ?? "").split(":");
  const code = rawCode.trim();
  const details = rawDetails.join(":").trim();

  const messages: Record<string, string> = {
    WFH_WEEKLY_QUOTA_EXCEED: "You have already used this week's Work From Home allowance. You can apply again next Monday.",
    WFH_WEEKLY_QUOTA_EXCEEDED: "You have already used this week's Work From Home allowance. You can apply again next Monday.",
    WFH_OVERLAPPING_REQUEST: "You already have a Work From Home request for one or more of the selected dates.",
    WFH_BACKDATED_NOT_ALLOWED: "Work From Home can only be requested for today or a future working day.",
    WFH_ADVANCE_NOTICE_REQUIRED: "This request does not meet the required advance notice period.",
    WFH_SAME_DAY_OFFICE_STARTED: details || "Work From Home for today must be requested before your office cutoff time.",
    WFH_LATE_REASON_REQUIRED: details || "A reason is required when applying for Work From Home after the cutoff time.",
    WFH_WEEKLY_OFF_NOT_ALLOWED: "Work From Home cannot be requested on a weekly off day.",
    WFH_HOLIDAY_NOT_ALLOWED: "Work From Home cannot be requested on a holiday.",
    WFH_POLICY_NOT_ASSIGNED: "Work From Home is not available for your current profile. Please contact HR.",
    WFH_POLICY_DISABLED: "Work From Home is not currently enabled for your company. Please contact HR.",
    WFH_DATE_LOCKED: "The attendance period for the selected date is locked. Please contact HR.",
  };

  return messages[code] || details || errorMessage || "We could not submit your Work From Home request. Please try again.";
};

const getLeaveRequestErrorMessage = (errorMessage?: string) => {
  const [rawCode, ...rawDetails] = (errorMessage ?? "").split(":");
  const code = rawCode.trim();
  const details = rawDetails.join(":").trim();
  const messages: Record<string, string> = {
    LEAVE_AFTER_EXIT: "Leave cannot be applied after the employee’s exit date.",
    LEAVE_FORMER_EMPLOYEE: "Leave is unavailable because this employee is no longer active.",
    LEAVE_EMPLOYEE_NOT_ACTIVE: "Leave is available only for active employees.",
    LEAVE_WFH_OVERLAP: "Leave overlaps an active Work From Home request. Withdraw the WFH request first.",
    LEAVE_OVERLAPPING_REQUEST: "A leave request already exists for one or more selected dates.",
    LEAVE_DATE_LOCKED: "The selected attendance period is locked. Please contact HR.",
    LEAVE_INSUFFICIENT_BALANCE: "You do not have enough leave balance for these dates.",
  };
  return messages[code] || details || errorMessage || "We could not submit the leave request. Please try again.";
};

type WorkFromHomeContext = {
  isEligible?: boolean;
  weeklyLimit?: number;
  remainingThisWeek?: number;
  businessDate?: string;
  isSameDayRequestCutoffPassed?: boolean;
  effectiveOfficeStartTime?: string | null;
  effectiveCutoffTime?: string | null;
  secondHalfCutoffTime?: string | null;
  sameDayGraceMinutes?: number;
  allowLateApplicationWithApproval?: boolean;
};

const formatOfficeTime = (value?: string | null) => {
  if (!value) return null;
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

export const LeaveApplication = (props: Props) => {
  const {
    edit,
    initialValues,
    leaveTypeBalance,
    open,
    handleClose,
    handleRefresh,
  } = props;
  const { formatMessage: i } = useIntl();
  const routeEmployeeId = useParams().employeeid;
  const employeeId = props.targetEmployeeId ?? routeEmployeeId;
  const currentUserId = useAppSelector((state) => state.user.userData?.userId)!;
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasWfhPermission = modulePermissions.some((p) => p.startsWith("Work_From_Home."));
  const [holidayList, setHolidayList] = useState<HolidayModel[]>([]);
  const [workFromHomeTypes, setWorkFromHomeTypes] = useState<SelectableLeaveType[]>([]);
  const [wfhEligibility, setWfhEligibility] = useState<WorkFromHomeContext | null>(null);
  const [unpaidLeaveTypes, setUnpaidLeaveTypes] = useState<SelectableLeaveType[]>([]);
  const [lifecycleLeaveTypes, setLifecycleLeaveTypes] = useState<SelectableLeaveType[]>([]);
  const [lifecyclePolicies, setLifecyclePolicies] = useState<EmployeeLifecyclePolicy[]>([]);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<HolidayPayload>({
    fromDate: null,
    toDate: null,
  })

  useEffect(() => {
    getEmployeeLifecycleSelfServicePolicies().then(({ data }) => setLifecyclePolicies(Array.isArray(data) ? data : [])).catch(() => setLifecyclePolicies([]));
  }, []);

  useEffect(() => {
    if (props.targetEmployeeId || routeEmployeeId || !hasWfhPermission) {
      setWfhEligibility(null);
      return;
    }

    const loadWfhEligibility = async () => {
      try {
        const { data } = await getRequest<{ methodResult?: WorkFromHomeContext }>("api/wfh/context");
        setWfhEligibility(data.methodResult ?? null);
      } catch {
        // Do not offer WFH until the authoritative eligibility check succeeds.
        setWfhEligibility(null);
      }
    };

    void loadWfhEligibility();
    window.addEventListener("wfh-allocation-changed", loadWfhEligibility);
    return () => window.removeEventListener("wfh-allocation-changed", loadWfhEligibility);
  }, [props.targetEmployeeId, routeEmployeeId, hasWfhPermission]);

  useEffect(() => {
    const fetchedHolidayData = async () => {
      try {
        const response = await getHolidays(filter);
        const { success, methodResults } = response.data;
        if (success) {
          // console.log(methodResults);

          setHolidayList(methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    };
    if (filter.fromDate && filter.toDate) {
      fetchedHolidayData();
    }
  }, [filter]);

  useEffect(() => {
    const loadNonBalancePolicies = async () => {
      try {
        const { data } = props.targetEmployeeId
          ? await getLeavePolicies(true)
          : await getMySelfServiceLeavePolicies();
        const policies = (data.methodResults ?? []) as LeavePolicyModel[];
        const targetUserId = props.targetEmployeeId ?? currentUserId;
        const appliesToEmployee = (policy: LeavePolicyModel) =>
          !policy.applicableTo || policy.applicableTo.length === 0 || policy.applicableTo.includes(targetUserId);
        setWorkFromHomeTypes(
          hasWfhPermission
            ? policies
                .filter((policy) => !props.targetEmployeeId && policy.policyType === 2 && policy.id && appliesToEmployee(policy))
            .map((policy) => ({
              leaveBalanceId: `wfh-${policy.id}`,
              leavePolicyId: policy.id!,
              totalAllocated: 0,
              taken: 0,
              remaining: 0,
              name: policy.name,
              code: policy.code,
              description: policy.description ?? "",
              paid: policy.paid,
              minNoticeDays: 0,
              halfDayAllowed: Boolean(policy.workFromHome?.allowFirstHalf || policy.workFromHome?.allowSecondHalf),
              weekendInclusive: Boolean(policy.workFromHome?.allowOnWeeklyOff),
              holidayInclusive: Boolean(policy.workFromHome?.allowOnHoliday),
              attendanceStatusCode: policy.attendanceStatusCode,
              policyType: 2,
            }))
            : []
        );
        setUnpaidLeaveTypes(
          policies
            // UL is approval-based and deliberately has no balance/credit record.
            // It remains selectable only when it is assigned to the employee.
            .filter((policy) => policy.policyType === 3 && policy.id && appliesToEmployee(policy))
            .map((policy) => ({
              leaveBalanceId: `ul-${policy.id}`,
              leavePolicyId: policy.id!, totalAllocated: 0, taken: 0, remaining: 0,
              name: policy.name, code: policy.code, description: policy.description ?? "",
              paid: false, minNoticeDays: policy.minNoticeDays,
              halfDayAllowed: policy.halfDayAllowed, weekendInclusive: policy.weekendInclusive,
              holidayInclusive: policy.holidayInclusive, attendanceStatusCode: policy.attendanceStatusCode,
              policyType: 3,
            }))
        );
        const lifecycleIds = new Set(lifecyclePolicies.map((item) => item.leavePolicyId).filter(Boolean));
        setLifecycleLeaveTypes(
          policies
            .filter((policy) => policy.policyType === 1 && policy.id && lifecycleIds.has(policy.id) && appliesToEmployee(policy))
            .map((policy) => ({
              leaveBalanceId: `lifecycle-${policy.id}`, leavePolicyId: policy.id!, totalAllocated: 0, taken: 0, remaining: 0,
              name: policy.name, code: policy.code, description: policy.description ?? "", paid: policy.paid,
              minNoticeDays: policy.minNoticeDays, halfDayAllowed: policy.halfDayAllowed,
              weekendInclusive: policy.weekendInclusive, holidayInclusive: policy.holidayInclusive,
              attendanceStatusCode: policy.attendanceStatusCode, policyType: 4,
            }))
        );
      } catch (error) {
        console.error("Unable to load non-balance leave policies.", error);
      }
    };

    loadNonBalancePolicies();
  }, [currentUserId, employeeId, props.targetEmployeeId, lifecyclePolicies]);

  const selectableLeaveTypes: SelectableLeaveType[] = [
    ...leaveTypeBalance.filter((leave) => !workFromHomeTypes.some((w) => w.leavePolicyId === leave.leavePolicyId) && !unpaidLeaveTypes.some((u) => u.leavePolicyId === leave.leavePolicyId)).map((leave) => ({ ...leave, policyType: 1 as const })),
    ...workFromHomeTypes.filter((wfh) => wfhEligibility?.isEligible &&
      !leaveTypeBalance.some((leave) => leave.leavePolicyId === wfh.leavePolicyId)
    ),
    ...unpaidLeaveTypes.filter((unpaid) =>
      !leaveTypeBalance.some((leave) => leave.leavePolicyId === unpaid.leavePolicyId)
    ),
    ...lifecycleLeaveTypes.filter((special) =>
      !leaveTypeBalance.some((leave) => leave.leavePolicyId === special.leavePolicyId)
    ),
  ];

  //Gets the dates between two dates
  const getDatesBetween = (startDate: Dayjs, endDate: Dayjs) => {
    const dates: Dayjs[] = [];

    if (startDate && endDate) {
      let current = startDate;
      while (current.isBefore(endDate) || current.isSame(endDate)) {
        dates.push(current);
        current = current.add(1, "day");
      }
    }
    return dates;
  };

  //Checks if there is a oliday on a given date
  const checkIfHoliday = (date: Dayjs) => {
    return holidayList.some((hol) => date.isSame(dayjs(hol.date), "day"));
  };

  //Checks if it is a weekend on a date
  function checkIfWeekend(date: Dayjs) {
    return date.day() === 0 || date.day() === 6;
  }

  //Checks how many days an employee will get holidays

  function countHolidayDays(
    startDate: Dayjs | null,
    endDate: Dayjs | null,
    leaveTypeId: string | null,
    halfDay: boolean | null
  ) {
    if (!startDate || !endDate || !leaveTypeId) return 0;

    const selectedLeave = selectableLeaveTypes.find(
      (leave) => leave.leavePolicyId === leaveTypeId
    );
    if (!selectedLeave) return 0;

    // FIX: half-day logic must respect holiday and weekend rules
    if (halfDay) {
      const weekend = checkIfWeekend(startDate);
      const holiday = checkIfHoliday(startDate);

      if ((!selectedLeave.weekendInclusive && weekend) ||
        (!selectedLeave.holidayInclusive && holiday)) {
        return 0;
      }
      return 0.5;
    }

    let total = 0;
    const days = getDatesBetween(startDate, endDate);

    days.forEach((d) => {
      const weekend = checkIfWeekend(d);
      const holiday = checkIfHoliday(d);

      if ((!selectedLeave.weekendInclusive && weekend) ||
        (!selectedLeave.holidayInclusive && holiday)) {
        return;
      }
      total += 1;
    });

    return total;
  }

  const handleLeaveRequestSubmission = async (
    values: RequestLeaveModel,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: unknown) => void
  ) => {
    const selectedLeaveType = selectableLeaveTypes.find(
      (type) => type.leavePolicyId === values.leavePolicyId
    );
    const lifecyclePolicy = lifecyclePolicies.find((policy) => policy.leavePolicyId === values.leavePolicyId);
    if (!edit && lifecyclePolicy?.requiresDocument && !evidenceFile) {
      setStatus("Supporting evidence is required for this special leave request.");
      setSubmitting(false);
      return;
    }

    if (selectedLeaveType?.policyType === 2) {
      if (edit) {
        setStatus("Work From Home requests cannot be edited here. Please cancel the request and submit a new one.");
        setSubmitting(false);
        return;
      }

      if (values.isHalfDay && !selectedLeaveType.halfDayAllowed) {
        setStatus("Half-day Work From Home is not enabled in the current policy.");
        setSubmitting(false);
        return;
      }

      try {
        // This only gives immediate feedback. The service repeats this check so a
        // stale page, an altered request, or a boundary-time race cannot bypass it.
        try {
          const { data: contextResponse } = await getRequest<{ methodResult?: WorkFromHomeContext }>("api/wfh/context");
          const context = contextResponse.methodResult;
          const requestedToday = context?.businessDate && getDatesBetween(dayjs(values.startDate), dayjs(values.endDate))
            .some((date) => date.isSame(dayjs(context.businessDate), "day"));
          if (requestedToday && context?.effectiveCutoffTime) {
            const isSecondHalf = values.isHalfDay && values.halfDayPeriod === "SECOND_HALF";
            let isCutoffPassed = context?.isSameDayRequestCutoffPassed;
            let displayCutoff = formatOfficeTime(context.effectiveCutoffTime);

            if (isSecondHalf && context?.secondHalfCutoffTime) {
              displayCutoff = formatOfficeTime(context.secondHalfCutoffTime);
              const [shH, shM] = context.secondHalfCutoffTime.split(":").map(Number);
              const now = dayjs();
              isCutoffPassed = now.hour() > shH || (now.hour() === shH && now.minute() >= shM);
            }

            if (isCutoffPassed) {
              if (context?.allowLateApplicationWithApproval ?? true) {
                if (!values.reason?.trim()) {
                  setStatus(`The same-day cutoff time (${displayCutoff}) has passed. You may submit an emergency/late request for manager approval, but a reason is required.`);
                  setSubmitting(false);
                  return;
                }
              } else {
                setStatus(`Work From Home for today must be requested before your cutoff time (${displayCutoff}). Late requests are not enabled.`);
                setSubmitting(false);
                return;
              }
            }
          }
        } catch {
          // Continue to the authoritative server-side validation if context cannot be refreshed.
        }

        const wfhDuration = values.isHalfDay
          ? values.halfDayPeriod === "SECOND_HALF" ? "SecondHalf" : "FirstHalf"
          : "FullDay";
        const { data } = await createWorkFromHomeRequest({
          fromDate: dayjs(values.startDate).startOf("day").format("YYYY-MM-DD"),
          toDate: dayjs(values.endDate).startOf("day").format("YYYY-MM-DD"),
          durationType: wfhDuration,
          reasonCode: "OTHER",
          reasonText: values.reason.trim(),
        });

        if (!data.success) {
          throw new Error(data.message || data.statusCode.toString());
        }

        toast.success("Work From Home request submitted successfully.");
        handleClose();
        props.handleRefresh?.();
      } catch (error) {
        const message = (error as Error).message;
        toast.error(message && !/^\d+$/.test(message)
          ? getWorkFromHomeErrorMessage(message)
          : i({ id: getCustomStatusCodesErrorMessage(+message) }));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const minAdvanceNoticeDate =
      selectableLeaveTypes.find(
        (type) => type.leavePolicyId === values.leavePolicyId
      )?.minNoticeDays ?? 0;
    const currentNoticeDays = dayjs(values.startDate).diff(dayjs().startOf("day"), "days");
    if (selectedLeaveType?.policyType === 1 && currentNoticeDays < minAdvanceNoticeDate) {
      setStatus(
        i(
          { id: "MESSAGE.ADVANCE_LEAVE_NOTICE_ERROR" },
          {
            leaveType: selectableLeaveTypes.find(
              (leave) => leave.leavePolicyId === values.leavePolicyId
            )?.name,
            days: minAdvanceNoticeDate,
          }
        ) as string
      );
      setSubmitting(false);
      return;
    }
    const totalHolidayDays = countHolidayDays(values.startDate, values.endDate, values.leavePolicyId, values.isHalfDay);
    if (totalHolidayDays === 0) {
      setStatus(i({ id: "MESSAGE.LEAVE_DAYS_CANT_BE_ZERO" }) as string);
      setSubmitting(false);
      return;
    }
    const selectedLeaveForBalance = selectableLeaveTypes.find(
      (type) => type.leavePolicyId === values.leavePolicyId
    );
    const remainingLeaveForTypes = selectedLeaveForBalance?.remaining ?? 0;

    // UL has no credit or balance. It remains a pending request and the backend
    // performs the final tenant-scoped policy validation before approval.
    if (![3, 4].includes(selectedLeaveForBalance?.policyType ?? 1) && totalHolidayDays > remainingLeaveForTypes) {
      setStatus(
        i(
          { id: "MESSAGE.INSUFFICIENT_LEAVE_ERROR" },
          {
            remainingLeave: remainingLeaveForTypes,
            leaveType: selectableLeaveTypes.find(
              (leave) => leave.leavePolicyId === values.leavePolicyId
            )?.name,
          }
        )
      );
      setSubmitting(false);
      return;
    } else {
      setStatus("");
      const payload: RequestLeaveModel = {
        ...values,
        userId: employeeId ?? currentUserId,
      };
      try {
        const { data } = props.edit
          ? employeeId
            ? await updateLeaveRequest(payload)
            : await updateMyProfileLeaveRequest(payload)
          : !employeeId && lifecyclePolicy?.requiresDocument && evidenceFile
            ? await createMyProfileLeaveRequestWithEvidence(payload, evidenceFile)
          : employeeId
            ? await createEmployeeLeaveRequest(employeeId, payload)
            : await createMyProfileLeaveRequest(payload);
        if (data.success) {
          toast.success(
            i({
              id: edit
                ? "TOAST.SUCCESS.LEAVE_REQ_UPDATE"
                : "TOAST.SUCCESS.REQUEST_LEAVE",
            })
          );
          handleClose();
          if (edit) {
            handleRefresh?.();
          }
        } else {
          throw new Error(data.message || data.statusCode.toString());
        }
      } catch (error) {
        const message = (error as Error).message;
        toast.error(message && !/^\d+$/.test(message)
          ? getLeaveRequestErrorMessage(message)
          : i({ id: getCustomStatusCodesErrorMessage(+message) }));
      } finally {
        setSubmitting(false);
        setStatus("");
        if (props.handleRefresh) {
          props.handleRefresh();
        }
      }
    }
  };

  return (
    <CustomisedModal
      open={open}
      handleClose={handleClose}
      title={i({ id: "LEAVE.LEAVE_APPLICATION" })}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={leaveRequestValidationSchema}
        onSubmit={(values, { setSubmitting, setStatus }) => {
          handleLeaveRequestSubmission(values, setSubmitting, setStatus);
        }}
      >
        {({
          values,
          status,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
          ...formik
        }) => {

          const updateHolidayFilter = (start: Dayjs | null, end: Dayjs | null) => {
            if (start && end) {
              setFilter({
                fromDate: start,
                toDate: end,
              });
            }
          };

          return (
            <form onSubmit={handleSubmit}>
              {status && (
                <AppAlert severity="error" sx={{ mb: 2 }}>
                  {status}
                </AppAlert>
              )}
              <Stack sx={{ maxHeight: "min(62vh, 560px)", overflowY: "auto", overflowX: "hidden", pt: 1.5, pb: 0.5, px: 0.5, pr: 1.5 }}>
              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid size={12}>
                  <FormControl fullWidth sx={{ mt: 0.5 }}>
                    <InputLabel id="leave-policy-label">
                      {i({ id: "LEAVE.TITLES.LEAVE_POLICIES" })}
                    </InputLabel>
                    <AppSelect
                      {...formik.getFieldProps("leavePolicyId")}
                      labelId="leave-policy-label"
                      label={i({ id: "LEAVE.TITLES.LEAVE_POLICIES" })}
                      value={values.leavePolicyId}
                      onChange={(e) => {
                        formik.resetForm();
                        setEvidenceFile(null);
                        setFieldValue("leavePolicyId", e.target.value);
                      }}
                    >
                      {selectableLeaveTypes.map((type) => (
                        <MenuItem
                          key={type.leaveBalanceId}
                          value={type.leavePolicyId}
                        >
                          {type.name}
                        </MenuItem>
                      ))}
                    </AppSelect>
                  </FormControl>
                  {(() => { const lifecycle = lifecyclePolicies.find(policy => policy.leavePolicyId === values.leavePolicyId); return lifecycle ? <AppAlert severity="info" sx={{ mt: 1 }}>This request may create a {lifecycle.eventType.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()} employment case after approval. {lifecycle.requiresDocument ? "Supporting evidence will be required." : ""} {lifecycle.requiresExpectedReturnDate ? "An expected return date is required." : ""}</AppAlert> : null; })()}
                </Grid>
                {
                  <Grid size={12}>
                    <FormControl
                      fullWidth
                      className="d-flex flex-row align-items-center gap-4"
                      disabled={
                        selectableLeaveTypes.find((type) => type.leavePolicyId === values.leavePolicyId && !type.halfDayAllowed)
                          ? true
                          : false
                      }
                    >
                      <FormLabel id="half-day" sx={{ color: "text.primary" }}>
                        {i({ id: "LEAVE.HALF_DAY" })} :
                      </FormLabel>
                      <RadioGroup
                        aria-labelledby="half-day"
                        name="isHalfDay"
                        row={true}
                        value={values.isHalfDay}
                        onChange={(e, value) => {
                          const half = value === "true";
                          setFieldValue("isHalfDay", half);
                          setFieldValue("halfDayPeriod", half ? values.halfDayPeriod ?? "FIRST_HALF" : undefined);

                          if (half && values.startDate) {
                            setFieldValue("endDate", values.startDate);
                            updateHolidayFilter(values.startDate, values.startDate);
                          } else {
                            setFieldValue("endDate", null);
                          }
                        }}
                      >
                        <FormControlLabel
                          value={true}
                          control={<AppRadio />}
                          label={i({ id: "YES" })}
                        />
                        <FormControlLabel
                          value={false}
                          control={<AppRadio />}
                          label={i({ id: "NO" })}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                }
                {values.isHalfDay && (
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel id="half-day-period-label">Leave half</InputLabel>
                      <AppSelect
                        labelId="half-day-period-label"
                        label="Leave half"
                        value={values.halfDayPeriod ?? "FIRST_HALF"}
                        onChange={(event) => setFieldValue("halfDayPeriod", event.target.value)}
                      >
                        <MenuItem value="FIRST_HALF">First half</MenuItem>
                        <MenuItem value="SECOND_HALF">Second half</MenuItem>
                      </AppSelect>
                    </FormControl>
                  </Grid>
                )}
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <CustomisedDatePicker
                    label={i({ id: "FORM.START_DATE" })}
                    value={values.startDate}
                    setValue={(newDate: Dayjs | null) => {
                      // setFieldTouched("startDate", true);
                      if (values.isHalfDay) {
                        setFieldValue("startDate", newDate?.startOf("day"), true);
                        setFieldValue("endDate", newDate?.startOf("day"), true);
                      }
                      setFieldTouched("startDate", true);
                      setFieldValue("startDate", newDate?.startOf("day"));
                    }}
                    name="startDate"
                    minDate={dayjs()}
                  />
                  {formik.touched.startDate && formik.errors.startDate && (
                    <ErrorLabel errorLabel={formik.errors.startDate} />
                  )}
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <CustomisedDatePicker
                    label={i({ id: "FORM.END_DATE" })}
                    value={values.isHalfDay ? values.startDate : values.endDate}
                    setValue={(date: Dayjs | null) => {
                      setFieldTouched("endDate", true);
                      setFieldValue("endDate", date?.startOf("day"));
                      updateHolidayFilter(values.startDate, date);
                    }}
                    name="endDate"
                    disabled={values.isHalfDay}
                    minDate={
                      values.startDate
                        ? dayjs(values.startDate)
                        : dayjs().startOf("day")
                    }
                  />
                  {formik.touched.endDate && formik.errors.endDate && (
                    <ErrorLabel errorLabel={formik.errors.endDate} />
                  )}
                </Grid>
                {values.startDate && values.endDate && (
                  <Stack
                    direction="column"
                    sx={{
                      width: "100%",
                      overflow: "auto",
                      maxHeight: "150px",
                      paddingRight: "8px",
                      marginBlock: "8px"
                    }}
                  >
                    <>
                      {!values.isHalfDay ? (
                        getDatesBetween(values?.startDate, values?.endDate).map(
                          (leave, index) => {
                            const isWeekend = checkIfWeekend(leave);
                            const isHoliday = checkIfHoliday(leave);
                            const selectedPolicy = selectableLeaveTypes.find(lb => lb.leavePolicyId === values.leavePolicyId);

                            const label = (!selectedPolicy?.weekendInclusive && isWeekend) ? "LEAVE.TITLES.LEAVE_WEEKEND" : (!selectedPolicy?.holidayInclusive && isHoliday) ? "LEAVE.TITLES.LEAVE_HOLIDAY" : "LEAVE.TITLES.LEAVE_FULL_DAY";
                            return (
                              <Stack
                                direction="row"
                                key={index}
                                sx={{
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "8px 12px",
                                  fontSize: "12px",
                                  borderBottom: "1px solid lightgray",
                                }}
                              >
                                {dayjs(leave).format("DD-MM-YYYY")}
                                <Box component="div">
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    // label={
                                    //   i({ id: isWeekend ? "LEAVE.TITLES.LEAVE_WEEKEND" : isHoliday ? "LEAVE.TITLES.LEAVE_HOLIDAY" : "LEAVE.TITLES.LEAVE_FULL_DAY" })
                                    // }
                                    label={
                                      i({ id: label })
                                    }
                                    sx={{ width: "80px" }}
                                  />
                                </Box>
                              </Stack>
                            );
                          }
                        )
                      ) : (
                        <Stack
                          direction="row"
                          sx={{
                            paddingInlineStart: 1,
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {dayjs(values.startDate).format("DD-MM-YYYY")}
                          <Chip
                            variant="outlined"
                            label={i({ id: "LEAVE.TITLES.LEAVE_HALF_DAY" })}
                          />
                        </Stack>
                      )}
                    </>
                  </Stack>
                )}

                {values.startDate && values.endDate && (
                  <Grid size={12} sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    backgroundColor: "background.body",
                    padding: "4px 8px",
                  }}>
                    <Typography variant="body1">
                      {i({ id: "ATTENDANCE.TOTAL" })} {i({ id: "DAYS" })}
                    </Typography>
                    <Typography>{i({ id: "PLURAL.DAY" }, {
                      days: countHolidayDays(
                        values.startDate,
                        values.endDate,
                        values.leavePolicyId,
                        values.isHalfDay
                      )
                    })}</Typography>
                  </Grid>
                )}
                <Grid size={12}>
                  <TextInput
                    multiline={true}
                    type="text"
                    name="reason"
                    label={i({ id: "LEAVE.REASON" })}
                  />
                </Grid>
                {(() => {
                  const lifecycle = lifecyclePolicies.find((policy) => policy.leavePolicyId === values.leavePolicyId);
                  return lifecycle?.requiresDocument ? (
                    <Grid size={12}>
                      <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                        <Typography variant="subtitle2">Supporting evidence required</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>Upload one PDF, JPG, or PNG file (maximum 10 MB). HR can review it with this leave request.</Typography>
                        <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setEvidenceFile(event.target.files?.[0] ?? null)} />
                        {evidenceFile && <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>{evidenceFile.name}</Typography>}
                      </Box>
                    </Grid>
                  ) : null;
                })()}
              </Grid>
              </Stack>
              <Grid className="d-flex gap-2 flex-row justify-content-end mt-4">
                <CustomisedButton
                  variant="outlined"
                  label={i({ id: "BUTTON.CANCEL" })}
                  handleClick={handleClose}
                />
                <CustomisedButton
                  label={i({ id: edit ? "BUTTON.UPDATE" : "BUTTON.APPLY" })}
                  disabled={
                    formik.isSubmitting || !(formik.isValid && formik.dirty)
                  }
                  type="submit"
                  loading={formik.isSubmitting}
                />
              </Grid>
            </form>
          );
        }}
      </Formik>
    </CustomisedModal>
  );
};
