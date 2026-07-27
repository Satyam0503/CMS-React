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
  RequestLeaveModel,
} from "../../../leaves/model";
import { Formik } from "formik";
import { leaveRequestValidationSchema } from "../../../../../utils/Schema/leaveManagementValidationSchemas";
import { getCustomStatusCodesErrorMessage } from "../../../../../utils/common";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import dayjs, { Dayjs } from "dayjs";
import { createEmployeeLeaveRequest, createLeaveRequest, updateLeaveRequest, } from "../../../leaves/leaveServices";
import { useAppSelector } from "../../../../Redux/hooks";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { getHolidays } from "../../../holidays/calendarServices";
import { HolidayModel, HolidayPayload } from "../../../holidays/models";
import { useEffect, useState } from "react";

import { AppAlert, AppRadio, AppSelect } from "../../../../shared/components/ui";
type Props = {
  edit: boolean;
  initialValues: RequestLeaveModel;
  leaveTypeBalance: EmployeeLeaveTypeBalance[];
  open: boolean;
  handleClose: () => void;
  handleRefresh?: () => void;
  targetEmployeeId?: string;
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
  const [holidayList, setHolidayList] = useState<HolidayModel[]>([]);
  const [filter, setFilter] = useState<HolidayPayload>({
    fromDate: null,
    toDate: null,
  })

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

    const selectedLeave = leaveTypeBalance.find(
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
    const minAdvanceNoticeDate =
      leaveTypeBalance.find(
        (type) => type.leavePolicyId === values.leavePolicyId
      )?.minNoticeDays ?? 0;
    const currentNoticeDays = dayjs(values.startDate).diff(dayjs().startOf("day"), "days");
    if (currentNoticeDays < minAdvanceNoticeDate) {
      setStatus(
        i(
          { id: "MESSAGE.ADVANCE_LEAVE_NOTICE_ERROR" },
          {
            leaveType: leaveTypeBalance.find(
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
    const remainingLeaveForTypes =
      leaveTypeBalance.find(
        (type) => type.leavePolicyId === values.leavePolicyId
      )?.balance ?? 0;

    if (totalHolidayDays > remainingLeaveForTypes) {
      setStatus(
        i(
          { id: "MESSAGE.INSUFFICIENT_LEAVE_ERROR" },
          {
            remainingLeave: remainingLeaveForTypes,
            leaveType: leaveTypeBalance.find(
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
          ? await updateLeaveRequest(payload)
          : employeeId
            ? await createEmployeeLeaveRequest(employeeId, payload)
            : await createLeaveRequest(payload);
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
          throw new Error(data.statusCode.toString());
        }
      } catch (error) {
        toast.error(i({ id: getCustomStatusCodesErrorMessage(+(error as Error).message) }));
      } finally {
        setSubmitting(false);
        setStatus("");
        props.handleRefresh && props.handleRefresh();
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
              <Grid container spacing={2}>
                <Grid size={12}>
                  <FormControl fullWidth>
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
                        setFieldValue("leavePolicyId", e.target.value);
                      }}
                    >
                      {leaveTypeBalance.map((type) => (
                        <MenuItem
                          key={type.leaveBalanceId}
                          value={type.leavePolicyId}
                        >
                          {type.name}
                        </MenuItem>
                      ))}
                    </AppSelect>
                  </FormControl>
                </Grid>
                {
                  <Grid size={12}>
                    <FormControl
                      fullWidth
                      className="d-flex flex-row align-items-center gap-4"
                      disabled={
                        leaveTypeBalance.find((type) => type.leavePolicyId === values.leavePolicyId && !type.halfDayAllowed)
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
                            const selectedPolicy = leaveTypeBalance.find(lb => lb.leavePolicyId === values.leavePolicyId);

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
              </Grid>
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
