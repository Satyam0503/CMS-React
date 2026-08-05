import {
  Grid,
  Box,
  Autocomplete,
  Stack,
  MenuItem,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  FormLabel,
  Chip,
  Tooltip,
  CircularProgress,
  Divider,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { getCustomStatusCodesErrorMessage } from "../../../../utils/common";
import { LeavePolicyValidationSchema } from "../../../../utils/Schema/leaveManagementValidationSchemas";
import CustomisedButton from "../../../shared/components/C_Button";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { useIntl } from "react-intl";
import { LeavePolicyModel } from "../model";
import { getAllEmployees } from "../../employees/employeeServices";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { toast } from "react-toastify";
import { createLeavePolicy, updateLeavePolicy } from "../leaveServices";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { TextInput } from "../../../shared/components/form-component/TextInput";

import { AppAlert, AppCheckbox, AppSelect, AppSwitch, AppTextField } from "../../../shared/components/ui";
import { getRequest } from "../../../../server/axios";
import { ResponseData } from "../../../../utils/common_types";
type AttendanceStatusOption = { code: string; name: string; isActive: boolean; requiresTime: boolean; isAvailableForLeaveManagement: boolean; colorHex: string };
type Props = {
  open: boolean;
  handleClose: () => void;
  isEdit: boolean;
  initialValues: LeavePolicyModel | undefined;
  handleRefresh: () => void;
};

export default function AddLeavePolicy(props: Props) {
  const { formatMessage: i } = useIntl();
  const [employeeList, setEmployeeList] = useState<Array<GetAllEmployeeResponseModel>>([]);
  const [state, setState] = useState({ open: false, loading: false });
  const [leaveStatuses, setLeaveStatuses] = useState<AttendanceStatusOption[]>([]);

  const renderInfoIcon = (title: string) => (
    <Tooltip title={title} arrow enterTouchDelay={0}>
      <HelpOutlineIcon sx={{ color: "text.secondary", fontSize: 18, ml: 1, cursor: "help" }} />
    </Tooltip>
  );

  useEffect(() => {
    getRequest<ResponseData<AttendanceStatusOption>>("api/attendance-status-settings?activeOnly=true")
      .then(({ data }) => setLeaveStatuses(data.methodResults ?? []))
      .catch(() => toast.error("Unable to load leave attendance status codes."));
  }, []);

  const empOptions: Array<GetAllEmployeeResponseModel> = [
    {
      userId: "allEmployees",
      fullName: "All Employees",
      email: "",
      gender: "",
      employeeId: "",
      jobRole: null,
      department: null,
      phoneNumber: null,
      fullProfileUrl: null,
      dateOfBirth: null,
      isVerified: false
    },
    {
      userId: "noEmployee",
      fullName: "None",
      email: "",
      gender: "",
      employeeId: "",
      jobRole: null,
      department: null,
      phoneNumber: null,
      fullProfileUrl: null,
      dateOfBirth: null,
      isVerified: false
    },
  ];

  const handleCreateNewPolicy = async (
    values: LeavePolicyModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      const { data } = await createLeavePolicy(values);
      if (data.success) {
        toast.success(
          i({
            id: props.isEdit ? "TOAST.SUCCESS.UPDATE" : "TOAST.SUCCESS.CREATED",
          })
        );
        props.handleClose();
        props.handleRefresh();
      } else {
        toast.error(i({ id: getCustomStatusCodesErrorMessage(data.statusCode) })
        );
      }
    } catch (error) {
      toast.error(i({ id: "ERROR.SOMETHING_WRONG " }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLeavePolicy = async (
    values: LeavePolicyModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {

    try {
      const { data } = await updateLeavePolicy(values);
      if (data.success) {
        toast.success(i({ id: props.isEdit ? "TOAST.SUCCESS.UPDATE" : "TOAST.SUCCESS.CREATED", }));
        props.handleClose();
        props.handleRefresh();
      } else {
        toast.error(
          data.message || i({ id: getCustomStatusCodesErrorMessage(data.statusCode) })
        );
      }
    } catch (error) {
      const message = (error as Error).message;
      toast.error(message && !/^\d+$/.test(message)
        ? message
        : i({ id: "ERROR.SOMETHING_WRONG" }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleListOpen = () => {
    setState({ ...state, loading: true });
    const getAllEmployeesList = async () => {
      try {
        const { data } = await getAllEmployees();
        if (data.success) {
          setState({ ...state, open: true })
          setEmployeeList(empOptions.concat(data.methodResults));
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setState(prev => ({ ...prev, loading: false }))
      }
    };
    getAllEmployeesList();
  }
  const handleClose = () => {
    setState({ ...state, open: false })
  }
  return (
    <CustomisedModal
      open={props.open}
      handleClose={props.handleClose}
      title={i({
        id: props.isEdit
          ? "LEAVE.TITLES.UPDATE_LEAVE_BALANCE"
          : "LEAVE.TITLES.ADD_LEAVE_POLICIES",
      })}
    >
      {props.initialValues && (
        <Formik
          validationSchema={LeavePolicyValidationSchema}
          initialValues={props.initialValues}
          onSubmit={(values, { setSubmitting }) => {
            if (!props.isEdit) {
              const applicableTo = values.applicableTo ?? [];
              const policy = {
                ...values,
                // WFH is an operational policy, not a leave entitlement.  Keep the
                // shared request model valid without creating an employee balance.
                ...(values.policyType === 2 ? { accrualAmount: 1, maxBalance: 0, carryOverAllowed: false, carryOverLimit: 0, paid: true, halfDayAllowed: values.workFromHome?.allowFirstHalf || values.workFromHome?.allowSecondHalf || false } : {}),
                attendanceStatusCode: values.attendanceStatusCode?.trim().toUpperCase() || null,
                applicableTo: applicableTo.includes("allEmployees")
                  ? []
                  : applicableTo.includes("noEmployee")
                    ? null
                    : applicableTo,
              };
              handleCreateNewPolicy(policy, setSubmitting);
            } else {
              const applicableTo = values.applicableTo ?? [];
              handleUpdateLeavePolicy({
                ...values,
                // Keep updates consistent with creation: WFH is paid attendance,
                // not a leave entitlement, so it must not be rejected for a zero
                // leave accrual balance.
                ...(values.policyType === 2 ? { accrualAmount: 1, maxBalance: 0, carryOverAllowed: false, carryOverLimit: 0, paid: true, halfDayAllowed: values.workFromHome?.allowFirstHalf || values.workFromHome?.allowSecondHalf || false } : {}),
                attendanceStatusCode: values.attendanceStatusCode?.trim().toUpperCase() || null,
                applicableTo: applicableTo.includes("allEmployees") ? [] : applicableTo.includes("noEmployee") ? null : applicableTo,
              }, setSubmitting);
            }
          }}
        >
          {({
            values,
            setFieldValue,
            handleSubmit,
            ...formik
          }) => {
            return (
              <form onSubmit={handleSubmit}>
                {Boolean(formik.status) && (
                  <AppAlert severity="warning" className="mb-4">
                    {formik.status}
                  </AppAlert>
                )}
                <Box className="leave-policy-modal">
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <Box className="policy-modal-section">
                        <Typography className="policy-section-title">Basic Information</Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                              label="Leave Name"
                              name="name"
                              type="text"
                              showErrorLabel={true}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <AppTextField select fullWidth label="Policy Type" value={values.policyType}
                              onChange={(e) => {
                                const policyType = Number(e.target.value) as 1 | 2;
                                setFieldValue("policyType", policyType);
                                if (policyType === 2 && !values.workFromHome) {
                                  setFieldValue("workFromHome", { approvalRequired:true, approverStrategy:"REPORTING_MANAGER", reasonRequired:true, allowFullDay:true, allowFirstHalf:false, allowSecondHalf:false, allowMixedHalfDayLeave:false, allowOnWeeklyOff:false, allowOnHoliday:false, fullDayAttendanceStatusCode:"", halfDayAttendanceStatusCode:"", mixedAttendanceStatusCode:"", useEffectiveOfficeSchedule:true, breakMinutes:0, maxDaysPerWeek:1, maxDaysPerMonth:null, fullDayRequiredWorkingMinutes:null, halfDayRequiredWorkingMinutes:null });
                                }
                              }}>
                              <MenuItem value={1}>Leave</MenuItem>
                              <MenuItem value={2}>Work From Home</MenuItem>
                            </AppTextField>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                              label="Short Code"
                              name="code"
                              type="text"
                              showErrorLabel={true}
                            />
                          </Grid>
                          <Grid size={12}>
                            <TextInput
                              multiline
                              label="Description"
                              name="description"
                              type="text"
                              showErrorLabel={false}
                            />
                          </Grid>
                          <Grid size={12}>
                            <AppTextField
                              select
                              fullWidth
                              label="Attendance Status"
                              value={values.attendanceStatusCode ?? ""}
                              onChange={(e) => setFieldValue("attendanceStatusCode", e.target.value)}
                              helperText="Only active status codes enabled in Attendance Settings are available."
                            >
                              <MenuItem value="">No attendance mapping</MenuItem>
                              {leaveStatuses.filter(status => values.policyType === 2 ? status.requiresTime : status.isAvailableForLeaveManagement && !status.requiresTime).map((status) => (
                                <MenuItem key={status.code} value={status.code}>
                                  <Box
                                    component="span"
                                    sx={{
                                      display: "inline-block",
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      bgcolor: status.colorHex,
                                      mr: 1,
                                    }}
                                  />
                                  {status.code} — {status.name}
                                </MenuItem>
                              ))}
                            </AppTextField>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    {values.policyType === 2 && values.workFromHome && (
                      <Grid size={12}>
                        <Box className="policy-modal-section">
                          <Typography className="policy-section-title">Work From Home Rules</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>WFH does not create a leave balance. Approved requests own the existing daily attendance row and use the employee's effective schedule.</Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs:12, md:6 }}><AppTextField select fullWidth label="Full-day WFH status" value={values.workFromHome.fullDayAttendanceStatusCode} onChange={e=>setFieldValue("workFromHome.fullDayAttendanceStatusCode", e.target.value)}>{leaveStatuses.filter(x=>x.requiresTime).map(x=><MenuItem key={x.code} value={x.code}>{x.code} — {x.name}</MenuItem>)}</AppTextField></Grid>
                            <Grid size={{ xs:12, md:6 }}><AppTextField label="Maximum WFH days per week" type="number" inputProps={{min:1}} value={values.workFromHome.maxDaysPerWeek ?? ""} onChange={e=>setFieldValue("workFromHome.maxDaysPerWeek", e.target.value === "" ? null : Number(e.target.value))}/></Grid>
                            <Grid size={{ xs:12, md:6 }}><AppTextField label="Full-day required working minutes" type="number" inputProps={{min:0}} value={values.workFromHome.fullDayRequiredWorkingMinutes ?? ""} onChange={e=>setFieldValue("workFromHome.fullDayRequiredWorkingMinutes", e.target.value === "" ? null : Number(e.target.value))} helperText="Leave empty to use the effective office schedule." /></Grid>
                            <Grid size={{ xs:12, md:6 }}><AppTextField label="Break minutes" type="number" inputProps={{min:0}} value={values.workFromHome.breakMinutes} onChange={e=>setFieldValue("workFromHome.breakMinutes", Number(e.target.value))}/></Grid>
                            <Grid size={{ xs:12, md:6 }}><FormControlLabel control={<AppSwitch checked={values.workFromHome.approvalRequired} onChange={e=>setFieldValue("workFromHome.approvalRequired", e.target.checked)}/>} label="Require approval"/></Grid>
                            <Grid size={{ xs:12, md:6 }}><FormControlLabel control={<AppSwitch checked={values.workFromHome.allowFirstHalf || values.workFromHome.allowSecondHalf} onChange={e=>{ setFieldValue("workFromHome.allowFirstHalf",e.target.checked); setFieldValue("workFromHome.allowSecondHalf",e.target.checked); }}/>} label="Allow half-day WFH"/></Grid>
                            <Grid size={12}>
                              <Autocomplete
                                fullWidth
                                disableCloseOnSelect
                                multiple
                                limitTags={4}
                                open={state.open}
                                loading={state.loading}
                                value={employeeList.filter(employee => values.applicableTo?.includes(employee.userId))}
                                onOpen={handleListOpen}
                                onClose={handleClose}
                                options={employeeList}
                                isOptionEqualToValue={(option, value) => option.userId === value.userId}
                                getOptionLabel={(option) => option.fullName}
                                onChange={(_, selected) => {
                                  const ids = selected.map(employee => employee.userId);
                                  setFieldValue("applicableTo", ids.includes("allEmployees") ? ["allEmployees"] : ids.includes("noEmployee") ? ["noEmployee"] : ids);
                                }}
                                renderInput={(params) => <AppTextField {...params} label="Eligible employees" helperText="Choose individual employees or select All Employees." />}
                                getOptionDisabled={() => Boolean(values.applicableTo?.includes("allEmployees") || values.applicableTo?.includes("noEmployee"))}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    )}

                    {values.policyType === 1 && <Grid size={12}>
                      <Box className="policy-modal-section">
                        <Typography className="policy-section-title">Leave Credit Rules</Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                              <InputLabel id="accrual-period-select-label">Leave Credit Frequency</InputLabel>
                              <AppSelect
                                labelId="accrual-period-select-label"
                                id="accrual-period-select"
                                label="Leave Credit Frequency"
                                name="accrualPeriod"
                                value={values.accrualPeriod}
                                onChange={(e) => {
                                  setFieldValue("accrualPeriod", e.target.value);
                                }}
                              >
                                <MenuItem value={1}>Month</MenuItem>
                                <MenuItem value={2}>Year</MenuItem>
                                <MenuItem value={3}>None</MenuItem>
                              </AppSelect>
                              <FormHelperText>
                                Choose how often leave is automatically credited to employees.
                              </FormHelperText>
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                              label="Leaves Credited"
                              name="accrualAmount"
                              type="number"
                              helperText="Example: 12 = Employees receive 12 leave days every year. Use 0.5 for half-day accrual."
                              inputProps={{ min: 0.5, step: 0.5 }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    {renderInfoIcon(
                                      "Number of leave days automatically added during each credit cycle. Use 0.5 for a half-day credit."
                                    )}
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                              label="Maximum Leave Balance"
                              name="maxBalance"
                              type="number"
                              helperText="Must be equal to or greater than the credited leaves. Supports 0.5 increments."
                              inputProps={{ min: 0.5, step: 0.5 }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    {renderInfoIcon(
                                      "Maximum leave days an employee can hold. This value should be equal to or greater than the leaves credited. Supports half-day increments."
                                    )}
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                              label="Maximum Carry Forward"
                              name="carryOverLimit"
                              disabled={!values.carryOverAllowed}
                              type="number"
                              helperText="Only applicable if Carry Forward is enabled. Supports 0.5 increments."
                              inputProps={{ min: 0, step: 0.5 }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    {renderInfoIcon(
                                      "Maximum unused leave that can be carried forward. Supports half-day values like 0.5."
                                    )}
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, md: 6 }}>
                            <TextInput
                              label="Minimum Notice Days"
                              name="minNoticeDays"
                              type="number"
                              helperText="Minimum number of days before start date required to apply for this policy."
                              inputProps={{ min: 0 }}
                            />
                          </Grid>

                          <Grid size={12}>
                            <Box className="policy-toggle-row">
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <FormControlLabel
                                    control={
                                      <AppCheckbox sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }} />
                                    }
                                    label={`${i({ id: "LEAVE.TYPES.POLICY_CARRY_OVER_ALLOWED" })}:`}
                                    name="carryOverAllowed"
                                    labelPlacement="start"
                                    checked={values.carryOverAllowed}
                                    onChange={(e, value) => {
                                      setFieldValue("carryOverAllowed", value);
                                    }}
                                    className="leave-policy-checkbox"
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <FormControlLabel
                                    control={
                                      <AppCheckbox sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }} />
                                    }
                                    label={
                                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                                        Half-Day Allowed
                                        {renderInfoIcon("Employees can apply for half-day leave.")}
                                      </Box>
                                    }
                                    name="halfDayAllowed"
                                    labelPlacement="start"
                                    checked={values.halfDayAllowed}
                                    onChange={(e, value) => {
                                      setFieldValue("halfDayAllowed", value);
                                    }}
                                    className="leave-policy-checkbox"
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <FormControlLabel
                                    control={
                                      <AppCheckbox sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }} />
                                    }
                                    label={
                                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                                        Paid Leave
                                        {renderInfoIcon("Employees receive salary during this leave.")}
                                      </Box>
                                    }
                                    name="paid"
                                    labelPlacement="start"
                                    checked={values.paid}
                                    onChange={(e, value) => {
                                      setFieldValue("paid", value);
                                    }}
                                    className="leave-policy-checkbox"
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <FormControlLabel
                                    control={
                                      <AppCheckbox sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }} />
                                    }
                                    label={
                                      <>
                                        {i({ id: "LEAVE.TYPES.POLICY_WEEKEND_INCLUSIVE" })}
                                        <Tooltip title={i({ id: "LEAVE.TYPES.POLICY_WEEKEND_INCLUSIVE_DEFINATION" })}>
                                          <HelpOutlineIcon sx={{ color: "gray", ml: 0.5, height: "16px" }} />
                                        </Tooltip>
                                      </>
                                    }
                                    name="weekendInclusive"
                                    checked={values.weekendInclusive}
                                    onChange={(e, value) => {
                                      setFieldValue("weekendInclusive", value);
                                    }}
                                    className="leave-policy-checkbox"
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <FormControlLabel
                                    control={
                                      <AppCheckbox sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }} />
                                    }
                                    label={
                                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                                        Count Public Holidays
                                        {renderInfoIcon("If enabled, public holidays are counted as leave days.")}
                                      </Box>
                                    }
                                    name="holidayInclusive"
                                    checked={values.holidayInclusive}
                                    onChange={(e, value) => {
                                      setFieldValue("holidayInclusive", value);
                                    }}
                                    className="leave-policy-checkbox"
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <FormControlLabel
                                    control={
                                      <AppSwitch
                                        onChange={(event) => {
                                          setFieldValue("status", event.target.checked);
                                        }}
                                        name="status"
                                        checked={values.status}
                                      />
                                    }
                                    label={
                                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                                        Policy Active
                                        {renderInfoIcon("Enable this policy so employees can select it when applying for leave.")}
                                      </Box>
                                    }
                                    labelPlacement="start"
                                    className="leave-policy-checkbox"
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>

                          <Grid size={12}>
                            <Box className="policy-modal-section">
                              <Typography className="policy-section-title">Eligibility</Typography>
                              <Grid container spacing={2}>
                                <Grid size={12}>
                                  <Autocomplete
                                    fullWidth
                                    disableCloseOnSelect
                                    multiple
                                    id="applicable-emps"
                                    limitTags={4}
                                    open={state.open}
                                    size="medium"
                                    loading={state.loading}
                                    forcePopupIcon={!state.loading}
                                    value={employeeList.filter(e => values.applicableTo?.includes(e.userId))}
                                    onOpen={handleListOpen}
                                    onClose={handleClose}
                                    options={employeeList}
                                    isOptionEqualToValue={(option, value) => option.userId === value.userId}
                                    getOptionLabel={(option) => option.fullName}
                                    renderTags={(value, getTagProps) => (
                                      value.map((option, index) => (
                                        <Chip
                                          {...getTagProps({ index })}
                                          key={option.userId}
                                          label={option.fullName}
                                          size="small"
                                        />
                                      ))
                                    )}
                                    onChange={(e, value) => {
                                      const selectedOptionId = value.map(v => v.userId);
                                      const optionValues = selectedOptionId.includes("allEmployees") ? ["allEmployees"] : selectedOptionId.includes("noEmployee") ? ["noEmployee"] : selectedOptionId;
                                      setFieldValue(
                                        "applicableTo",
                                        optionValues
                                      );
                                    }}
                                    renderInput={(params) => (
                                      <AppTextField
                                        {...params}
                                        label="Eligible Employees"
                                        helperText="Select which employees can use this leave policy."
                                        slotProps={{
                                          input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                              <>
                                                {state.loading ? <CircularProgress sx={{ mr: 1 }} size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                              </>
                                            ),
                                          }
                                        }}
                                      />
                                    )}
                                    getOptionDisabled={() => {
                                      return values.applicableTo?.includes("allEmployees") || values.applicableTo?.includes("noEmployee") ? true : false
                                    }}
                                    noOptionsText={i({ id: "MESSAGE.NO_RESULT" })}
                                    className="applicable-employees-select"
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>}
                  </Grid>
                </Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ justifyContent: "flex-end", mt: 4, width: "100%" }}
                >
                  <CustomisedButton
                    variant="outlined"
                    label={i({ id: "BUTTON.CANCEL" })}
                    handleClick={props.handleClose}
                    fullWidth
                    sx={{ maxWidth: { xs: "100%", sm: "160px" } }}
                  />
                  <CustomisedButton
                    label={i({
                      id: props.isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD",
                    })}
                    type="submit"
                    loading={formik.isSubmitting}
                    disabled={
                      formik.isSubmitting || !(formik.isValid && formik.dirty)
                    }
                    fullWidth
                    sx={{ maxWidth: { xs: "100%", sm: "160px" } }}
                  />
                </Stack>
              </form>
            );
          }}
        </Formik>
      )}
    </CustomisedModal>
  );
}
