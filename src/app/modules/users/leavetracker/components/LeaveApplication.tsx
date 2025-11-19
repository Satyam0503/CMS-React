import {
  Alert,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";

import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../../../shared/components/CustomisedDatePicker";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import {
  EmployeeLeaveTypeBalance,
  RequestLeaveModel,
} from "../../../leaves/model";
import { Formik } from "formik";
import { leaveRequestValidationSchema } from "../../../../../utils/Schema/leaveManagementValidationSchemas";
import {
  getStatusCodeString,
  LeaveTypeMapper,
} from "../../../../../utils/common";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import dayjs, { Dayjs } from "dayjs";
import {
  createLeaveRequest,
  updateLeaveRequest,
} from "../../../leaves/leaveServices";
import { useAppSelector } from "../../../../Redux/hooks";
import { toast } from "react-toastify";
import { error } from "console";
import { useParams } from "react-router-dom";
import { boolean } from "yup";
import { getAllCalendarItem } from "../../../holidays/holidayServices";
import { CalendarItem, GetCalendarItemPayload } from "../../../holidays/models";

type Props = {
  edit: boolean;
  initialValues: RequestLeaveModel;
  leaveTypeBalance: EmployeeLeaveTypeBalance[];
  open: boolean;
  handleClose: () => void;
  handleRefresh?: () => void;
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
  const employeeId = useParams().employeeid;
  const currentUserId = useAppSelector((state) => state.user.userData?.userId)!;
  const [holidayList, setHolidayList] = useState<CalendarItem[]>([]);

  useEffect(() => {
    const payload: GetCalendarItemPayload = {
      type: 1,
      year: null,
    };

    const fetchedHolidayData = async () => {
      try {
        const response = await getAllCalendarItem(payload);
        const { success, methodResults } = response.data;
        if (success) {
          // console.log(methodResults);

          setHolidayList(methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    };

    fetchedHolidayData();
  }, []);

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
  function checkIfHoliday(date: Dayjs) {
    return holidayList.some((hol) => {
      const holidayDate = dayjs(hol.date);

      const sameMonthDay =
        date.date() === holidayDate.date() &&
        date.month() === holidayDate.month();

      if (hol.recurring) {
        return sameMonthDay;
      }

      return sameMonthDay && date.year() === holidayDate.year();
    });
  }

  //Checks if it is a weekend on a date
  function checkIfWeekend(date: Dayjs) {
    if (date.day() === 0 || date.day() === 6) return true;
  }

  //Checks how many days an employee will get holidays
  function countHolidayDays(
    startDate: Dayjs | null,
    endDate: Dayjs | null,
    leaveTypeId: string | null,
    halfDay: boolean | null
  ) {
    if (startDate && endDate && leaveTypeId) {
      const selectedLeave = leaveTypeBalance.find(
        (leave) => leave.leavePolicyId === leaveTypeId
      );
      const selectedDates = getDatesBetween(startDate, endDate);
      let totalDays = 0;
      selectedDates.forEach((date) => {
        const isWeekend = checkIfWeekend(date);
        const isHoliday = checkIfHoliday(date);

        if (
          (!selectedLeave?.weekendInclusive && isWeekend) ||
          (!selectedLeave?.holidayInclusive && isHoliday)
        ) {
          return;
        } else totalDays += 1;
      });

      if (selectedLeave?.halfDayAllowed && halfDay) {
        return 0.5;
      }

      return totalDays;
    }
  }

  const handleLeaveRequestSubmission = async (
    values: RequestLeaveModel,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: any) => void
  ) => {
    const minAdvanceNoticeDate =
      leaveTypeBalance.find(
        (type) => type.leavePolicyId === values.leavePolicyId
      )?.minNoticeDays ?? 0;
    const currentNoticeDays = dayjs(values.startDate).diff(
      dayjs().startOf("day"),
      "days"
    );
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
        )
      );
      setSubmitting(false);
      return;
    }

    if (
      countHolidayDays(
        values.startDate,
        values.endDate,
        values.leavePolicyId,
        values.isHalfDay
      )
    ) {
      setStatus(i({ id: "MESSAGE.LEAVE_DAYS_CANT_BE_ZERO" }));
      setSubmitting(false);
      return;
    }
    const totalDays = countHolidayDays(
      values.startDate,
      values.endDate,
      values.leavePolicyId,
      values.isHalfDay
    );
    const remainingLeaveForTypes =
      leaveTypeBalance.find(
        (type) => type.leavePolicyId === values.leavePolicyId
      )?.balance ?? 0;
    console.log(remainingLeaveForTypes);

    if (totalDays && totalDays > remainingLeaveForTypes) {
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
          toast.error(i({ id: getStatusCodeString(data.statusCode) }));
        }
      } catch (error) {
        console.error((error as Error).message);
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
          return (
            <form onSubmit={handleSubmit}>
              {status && (
                <Alert severity="error" sx={{ my: 2 }} className="mb-5">
                  {status}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="leave-policy-label">
                      {i({ id: "LEAVE.TITLES.LEAVE_POLICIES" })}
                    </InputLabel>
                    <Select
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
                          {type.name}{" "}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      className="d-flex flex-row align-items-center gap-4"
                      disabled={
                        leaveTypeBalance.find(
                          (type) =>
                            type.leavePolicyId === values.leavePolicyId &&
                            !type.halfDayAllowed
                        )
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
                          if (value == "true") {
                            setFieldValue("endDate", values.startDate);
                            setFieldValue("isHalfDay", true);
                          } else {
                            setFieldValue("endDate", null);
                            setFieldValue("isHalfDay", false);
                          }
                        }}
                      >
                        <FormControlLabel
                          value={true}
                          control={<Radio />}
                          label={i({ id: "YES" })}
                        />
                        <FormControlLabel
                          value={false}
                          control={<Radio />}
                          label={i({ id: "NO" })}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                }
                <Grid item xs={12} sm={6}>
                  <CustomisedDatePicker
                    label={i({ id: "FORM.START_DATE" })}
                    value={values.startDate}
                    setValue={(newDate: Dayjs | null) => {
                      if (values.isHalfDay) {
                        setFieldValue(
                          "startDate",
                          newDate?.startOf("day"),
                          true
                        );
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
                <Grid item xs={12} sm={6}>
                  <CustomisedDatePicker
                    label={i({ id: "FORM.END_DATE" })}
                    value={values.isHalfDay ? values.startDate : values.endDate}
                    setValue={(newDate: Dayjs | null) => {
                      setFieldTouched("endDate", true);
                      setFieldValue("endDate", newDate?.startOf("day"));
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
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      overflow: "auto",
                      maxHeight: "150px",
                      marginTop: "10px",
                      paddingRight: "10px",
                    }}
                  >
                    <>
                      {!values.isHalfDay ? (
                        getDatesBetween(values?.startDate, values?.endDate).map(
                          (leave, index) => {
                            const isWeekend = checkIfWeekend(leave);
                            const isHoliday = checkIfHoliday(leave);
                            return (
                              <Box
                                component={"div"}
                                key={index}
                                sx={{
                                  display: "flex",
                                  width: "100%",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "8px 12px",
                                  fontSize: "12px",
                                  borderBottom: "1px solid lightgray",
                                }}
                              >
                                {dayjs(leave).format("DD-MM-YYYY")}
                                <Box component={"div"}>
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={
                                      isWeekend
                                        ? i({
                                            id: "LEAVE.TITLES.LEAVE_WEEKEND",
                                          })
                                        : isHoliday
                                        ? i({
                                            id: "LEAVE.TITLES.LEAVE_HOLIDAY",
                                          })
                                        : i({
                                            id: "LEAVE.TITLES.LEAVE_FULL_DAY",
                                          })
                                    }
                                    sx={{ width: "80px" }}
                                  />
                                </Box>
                              </Box>
                            );
                          }
                        )
                      ) : (
                        <Box
                          component={"div"}
                          sx={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {dayjs(values.startDate).format("DD-MM-YYYY")}
                          <Box component={"div"}>
                            <Chip
                              label={i({ id: "LEAVE.TITLES.LEAVE_HALF_DAY" })}
                              sx={{ width: "80px" }}
                            />
                          </Box>
                        </Box>
                      )}
                    </>
                  </Grid>
                )}

                {values.startDate && values.endDate && (
                  <Grid item xs={12}>
                    <Box
                      component={"div"}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        backgroundColor: "rgb(159 159 159 / 38%)",
                        padding: "5px 8px",
                        borderRadius: "3px",
                      }}
                    >
                      <Typography variant="body1" color="initial">
                        {i({ id: "ATTENDANCE.TOTAL" })} {i({ id: "DAYS" })}
                      </Typography>
                      <Box sx={{ display: "flex", gap: "5px" }}>
                        <Typography variant="body1" color="initial">
                          {countHolidayDays(
                            values.startDate,
                            values.endDate,
                            values.leavePolicyId,
                            values.isHalfDay
                          )}
                        </Typography>
                        <Typography>{i({ id: "DAYS" })}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextInput
                    multiline={true}
                    type="text"
                    name="reason"
                    label={i({ id: "LEAVE.REASON" })}
                  />
                </Grid>
              </Grid>
              <Grid
                item
                className="d-flex gap-2 flex-row justify-content-end mt-4"
              >
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
