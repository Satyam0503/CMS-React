import {
  Alert,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
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
import { EmployeeLeaveTypeBalance, RequestLeaveModel } from "../../../leaves/model";
import { Formik } from "formik";
import { leaveRequestValidationSchema } from "../../../../../utils/Schema/leaveManagementValidationSchemas";
import { getStatusCodeString, LeaveTypeMapper } from "../../../../../utils/common";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import dayjs, { Dayjs } from "dayjs";
import { createLeaveRequest } from "../../../leaves/leaveServices";
import { useAppSelector } from "../../../../Redux/hooks";
import { toast } from "react-toastify";

type Props = {
  edit: boolean,
  initialValues: RequestLeaveModel,
  leaveTypeBalance: EmployeeLeaveTypeBalance[],
  open: boolean;
  handleClose: () => void;
  handleRefresh?: () => void,
}

export const LeaveApplication = (props: Props) => {
  const { edit, initialValues, leaveTypeBalance, open, handleClose, handleRefresh } = props;
  const { formatMessage: i } = useIntl();
  const currentUserId = useAppSelector(state => state.user.userData?.userId)!;

  const handleLeaveRequestSubmission = async (values: RequestLeaveModel, setSubmitting: (isSubmitting: boolean) => void, setStatus: (status?: any) => void) => {
    const minAdvanceNoticeDate = leaveTypeBalance.find(type => type.leaveType === values.leaveType)?.minAdvanceNoticeDate ?? 0;
    const currentNoticeDays = dayjs(values.startDate).diff(dayjs().startOf("day"), "days");
    if (currentNoticeDays < minAdvanceNoticeDate) {
      setStatus(i({ id: "MESSAGE.ADVANCE_LEAVE_NOTICE_ERROR" }, { leaveType: i({ id: LeaveTypeMapper[values.leaveType] }), days: minAdvanceNoticeDate }));
      setSubmitting(false);
      return;
    }
    values.totalDays = values.isHalfDay ? (dayjs(values.endDate).diff(values.startDate, "days") + 1) / 2 : (dayjs(values.endDate).diff(values.startDate, "days") + 1);
    const remainingLeaveForTypes = leaveTypeBalance.find(type => type.leaveType === values.leaveType)?.remainingLeave ?? 0;
    if (values.totalDays > remainingLeaveForTypes) {
      setStatus(i({ id: "MESSAGE.INSUFFICIENT_LEAVE_ERROR" }, { remainingLeave: remainingLeaveForTypes, leaveType: i({ id: LeaveTypeMapper[values.leaveType] }) }));
      setSubmitting(false);
      return;
    } else {
      setStatus("");
      const payload: RequestLeaveModel = {
        ...values,
        employeeId: currentUserId,
      }
      try {
        const { data } = await createLeaveRequest(payload);
        if (data.success) {
          toast.success(i({ id: edit ? "TOAST.SUCCESS.LEAVE_REQ_UPDATE" : "TOAST.SUCCESS.REQUEST_LEAVE" }));
          handleClose();
          if (edit) {
            handleRefresh?.();
          }
        } else {
          toast.error(i({ id: getStatusCodeString(data.statusCode) }));
        }
      } catch (error) {
        console.error((error as Error).message);
      }
      finally {
        setSubmitting(false);
        setStatus("");
      }
    }
  }

  return (
    <CustomisedModal open={open} handleClose={handleClose}
      title={i({ id: "LEAVE.LEAVE_APPLICATION" })}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={leaveRequestValidationSchema}
        onSubmit={(values, { setSubmitting, setStatus }) => {
          handleLeaveRequestSubmission(values, setSubmitting, setStatus);
        }}
      >
        {
          ({ values, status, handleSubmit, setFieldValue, setFieldTouched, ...formik }) => {
            return <form onSubmit={handleSubmit} >
              {status && <Alert severity="error" sx={{ my: 2 }} className="mb-5">{status}</Alert>
              }
              <Grid container spacing={2}>
                <Grid item xs={12} >
                  <Select {...formik.getFieldProps("leaveType")} fullWidth onChange={(e) => {
                    formik.resetForm()
                    setFieldValue("leaveType", e.target.value);
                  }}>
                    {leaveTypeBalance.map(type => (
                      <MenuItem key={type.leaveType} value={type.leaveType}>{i({ id: LeaveTypeMapper[type.leaveType] })} </MenuItem>
                    ))}
                  </Select>
                </Grid>
                {
                  leaveTypeBalance.find(type => type.leaveType === values.leaveType && type.isHalfDay) &&
                  <Grid item xs={12} >
                    <FormControl fullWidth className="d-flex flex-row align-items-center gap-4" >
                      <FormLabel id="half-day" sx={{ color: "text.primary" }}  >{i({ id: "LEAVE.HALF_DAY" })} :</FormLabel>
                      <RadioGroup
                        aria-labelledby="half-day"
                        name="isHalfDay"
                        row={true}
                        value={values.isHalfDay}
                        onChange={(e, value) => {
                          if (value == "true") {
                            setFieldValue("endDate", values.startDate);
                            setFieldValue("isHalfDay", true,);
                          }
                          else {
                            setFieldValue("endDate", null)
                            setFieldValue("isHalfDay", false);
                          }
                        }}
                      >
                        <FormControlLabel value={true} control={<Radio />} label={i({ id: "YES" })} />
                        <FormControlLabel value={false} control={<Radio />} label={i({ id: "NO" })} />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                }
                <Grid item xs={12} sm={6} >
                  <CustomisedDatePicker
                    label={i({ id: "FORM.START_DATE" })}
                    value={values.startDate}
                    setValue={(newDate: Dayjs | null) => {
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
                  {
                    formik.touched.startDate &&
                    formik.errors.startDate &&
                    <ErrorLabel errorLabel={formik.errors.startDate} />
                  }
                </Grid>
                <Grid item xs={12} sm={6} >
                  <CustomisedDatePicker
                    label={i({ id: "FORM.END_DATE" })}
                    value={values.isHalfDay ? values.startDate : values.endDate}
                    setValue={(newDate: Dayjs | null) => {
                      setFieldTouched("endDate", true);
                      setFieldValue("endDate", newDate?.startOf("day"));
                    }}
                    name="endDate"
                    disabled={values.isHalfDay}
                    minDate={values.startDate ? dayjs(values.startDate) : dayjs().startOf("day")}
                  />
                  {
                    formik.touched.endDate &&
                    formik.errors.endDate &&
                    <ErrorLabel errorLabel={formik.errors.endDate} />
                  }
                </Grid>
                <Grid item xs={12} >
                  <TextField
                    fullWidth
                    inputProps={{
                      readOnly: true
                    }}
                    name="totalDays"
                    type="number"
                    label={i({ id: "LEAVE.TOTAL_DAYS" })}
                    value={values.isHalfDay ? (dayjs(values.endDate).diff(values.startDate, "days") + 1) / 2 : dayjs(values.endDate).diff(values.startDate, "days") + 1}
                  />
                </Grid>
                <Grid item xs={12} >
                  <TextInput multiline={true} type="text" name="reason" label={i({ id: "LEAVE.REASON" })} />
                </Grid>
              </Grid>
              <Grid item className="d-flex gap-2 flex-row justify-content-end mt-4">
                <CustomisedButton variant="outlined" label={i({ id: "BUTTON.CANCEL" })} handleClick={handleClose} />
                <CustomisedButton label={i({ id: edit ? "BUTTON.UPDATE" : "BUTTON.APPLY" })} type="submit" loading={formik.isSubmitting} />
              </Grid>
            </form>
          }
        }
      </Formik>

    </CustomisedModal >
  );
};
