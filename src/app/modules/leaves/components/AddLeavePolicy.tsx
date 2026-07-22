import {
  Alert,
  Grid,
  Autocomplete,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Checkbox,
  FormLabel,
  Chip,
  Tooltip,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Formik } from "formik";
import { useState } from "react";
import { getCustomStatusCodesErrorMessage } from "../../../../utils/common";
import { LeavePolicyValidationSchema } from "../../../../utils/Schema/leaveManagementValidationSchemas";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { useIntl } from "react-intl";
import { LeavePolicyModel } from "../model";
import { getAllEmployees } from "../../employees/employeeServices";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { toast } from "react-toastify";
import { createLeavePolicy, updateLeavePolicy } from "../leaveServices";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { TextInput } from "../../../shared/components/form-component/TextInput";

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
        toast.error(i({ id: getCustomStatusCodesErrorMessage(data.statusCode) }));
      }
    } catch (error) {
      toast.error(i({ id: "ERROR.SOMETHING_WRONG" }));
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
              if (values.applicableTo) {
                const applicableValue = values.applicableTo;
                values.applicableTo = applicableValue.includes("allEmployees") ? [] : applicableValue.includes("noEmployee") ? null : applicableValue;
                handleCreateNewPolicy(values, setSubmitting);
              }
            } else {
              handleUpdateLeavePolicy(values, setSubmitting);
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
                  <Alert severity="warning" className="mb-4">
                    {formik.status}
                  </Alert>
                )}
                <Grid container spacing={2}>
                  {
                    <>
                      <Grid size={12}>
                        <TextInput
                          label={i({ id: "LEAVE.TYPES.POLICY_NAME" })}
                          name="name"
                          type="text"
                          showErrorLabel={false}
                        />
                      </Grid>

                      <Grid size={12}>
                        <TextInput
                          multiline
                          label={i({ id: "LEAVE.TYPES.POLICY_DESCRIPTION" })}
                          name="description"
                          type="text"
                          showErrorLabel={false}
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <TextInput
                          label={i({ id: "LEAVE.TYPES.POLICY_CODE" })}
                          name="code"
                          type="text"
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextInput
                          label="Attendance status code"
                          name="attendanceStatusCode"
                          type="text"
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <TextInput
                          label={i({
                            id: "LEAVE.TYPES.POLICY_MIN_NOTICE_DAYS",
                          })}
                          name="minNoticeDays"
                          type="number"
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel id="accrual-period-select-label">
                            {i({ id: "LEAVE.TYPES.POLICY_ACCURAL_PERIOD" })}
                          </InputLabel>
                          <Select
                            labelId="accrual-period-select-label"
                            id="accrual-period-select"
                            label={i({
                              id: "LEAVE.TYPES.POLICY_ACCURAL_PERIOD",
                            })}
                            name="accrualPeriod"
                            value={values.accrualPeriod}
                            onChange={(e) => {
                              setFieldValue("accrualPeriod", e.target.value);
                            }}
                            endAdornment={
                              <Tooltip
                                title={i({
                                  id: "LEAVE.TYPES.POLICY_ACCRUAL_DEFINATION",
                                })}
                              >
                                <HelpOutlineIcon sx={{ color: "text.secondary", fontSize: 18, mr: 3 }} />
                              </Tooltip>
                            }
                          >
                            <MenuItem value={1}>Month</MenuItem>
                            <MenuItem value={2}>Year</MenuItem>
                            <MenuItem value={3}>None</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                        className="accural-amount-container"
                      >
                        <TextInput
                          label={i({ id: "LEAVE.TYPES.POLICY_ACCURAL_AMOUNT" })}
                          name="accrualAmount"
                          type="number"
                          showErrorLabel={false}
                          InputProps={{
                            endAdornment: <Tooltip
                              title={i({
                                id: "LEAVE.TYPES.POLICY_ACCRUAL_AMOUNT_DEFINATION",
                              })}
                            >
                              <HelpOutlineIcon sx={{ color: "text.secondary", fontSize: 18, mr: 1 }} />
                            </Tooltip>
                          }}
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }}
                            />
                          }
                          label={`${i({
                            id: "LEAVE.TYPES.POLICY_CARRY_OVER_ALLOWED",
                          })}:`}
                          name="carryOverAllowed"
                          labelPlacement="start"
                          checked={values.carryOverAllowed}
                          onChange={(e, value) => {
                            setFieldValue("carryOverAllowed", value);
                          }}
                          className="leave-policy-checkbox"
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <TextInput
                          label={i({ id: "LEAVE.TYPES.POLICY_CARRY_LIMIT" })}
                          name="carryOverLimit"
                          disabled={!values.carryOverAllowed && true}
                          type="number"
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }}
                            />
                          }
                          label={`${i({ id: "LEAVE.HALF_DAY" })}: `}
                          name="isHalfDay"
                          labelPlacement="start"
                          checked={values.halfDayAllowed}
                          onChange={(e, value) => {
                            setFieldValue("halfDayAllowed", value);
                          }}
                          className="leave-policy-checkbox"
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <TextInput
                          label={i({ id: "LEAVE.TYPES.POLICY_MAX_BALANCE" })}
                          name="maxBalance"
                          type="number"
                          showErrorLabel={true}
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }}
                            />
                          }
                          label={i({ id: "LEAVE.TYPES.POLICY_PAID" })}
                          name="paid"
                          labelPlacement="start"
                          checked={values.paid}
                          onChange={(e, value) => {
                            setFieldValue("paid", value);
                          }}
                          className="leave-policy-checkbox"
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <FormLabel sx={{ color: "text.primary" }}>
                          {i({ id: "STATUS" })}
                        </FormLabel>
                        <Switch
                          className="mx-4"
                          onChange={(event) => {
                            setFieldValue("status", event.target.checked);
                          }}
                          name="status"
                          checked={values.status}
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <FormControlLabel
                          labelPlacement="start"
                          control={
                            <Checkbox
                              sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }}
                            />
                          }
                          label={
                            <>
                              {i({
                                id: "LEAVE.TYPES.POLICY_WEEKEND_INCLUSIVE",
                              })}
                              <Tooltip
                                title={i({
                                  id: "LEAVE.TYPES.POLICY_WEEKEND_INCLUSIVE_DEFINATION",
                                })}
                              >
                                <HelpOutlineIcon
                                  sx={{
                                    color: "gray",
                                    marginLeft: "0px",
                                    height: "16px",
                                  }}
                                />
                              </Tooltip>
                              :
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

                      <Grid
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }}
                            />
                          }
                          labelPlacement="start"
                          label={
                            <>
                              {i({
                                id: "LEAVE.TYPES.POLICY_HOLIDAY_INCLUSIVE",
                              })}
                              <Tooltip
                                title={i({
                                  id: "LEAVE.TYPES.POLICY_HOLIDAY_INCLUSIVE_DEFINATION",
                                })}
                              >
                                <HelpOutlineIcon
                                  sx={{
                                    color: "gray",
                                    marginLeft: "0px",
                                    height: "16px",
                                  }}
                                />
                              </Tooltip>
                              :
                            </>
                          }
                          name="holidayInclusive"
                          checked={values.holidayInclusive}
                          onChange={(e, value) => {
                            setFieldValue("holidayInclusive", value);
                          }}
                          className="leave-policy-checkbox"
                        />
                      </Grid>

                      {!props.isEdit && (
                        <Grid
                          className="w-full"
                          sx={{
                            gap: 1,
                            alignItems: "start",
                            display: "flex",
                            flexDirection: "column",
                          }}
                          size={12}
                        >
                          <FormLabel
                            sx={{ textWrap: "nowrap" }}
                          >
                            {i({ id: "LEAVE.TYPES.POLICY_APPLICABLE_TO" })}:
                          </FormLabel>
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
                            getOptionLabel={(option) => option.fullName}
                            getOptionKey={option => option.userId}
                            renderValue={(value, getTagProps) => (
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
                              <TextField
                                {...params}
                                label={i({ id: "PAGE.EMPLOYEES" })}
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
                            getOptionDisabled={
                              () => {
                                return values.applicableTo?.includes("allEmployees") || values.applicableTo?.includes("noEmployee") ? true : false
                              }
                            }
                            noOptionsText={i({ id: "MESSAGE.NO_RESULT" })}
                            className="applicable-employees-select"
                          />
                        </Grid>
                      )}
                    </>
                  }
                </Grid>
                <Stack className="flex-row justify-content-end gap-2 mt-4">
                  <CustomisedButton
                    variant="outlined"
                    label={i({ id: "BUTTON.CANCEL" })}
                    handleClick={props.handleClose}
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
                  />
                </Stack>
              </form>
            );
          }}
        </Formik>
      )
      }
    </CustomisedModal >
  );
}
