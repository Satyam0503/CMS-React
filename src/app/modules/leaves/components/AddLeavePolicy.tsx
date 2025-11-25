import {
  Alert,
  Grid,
  Autocomplete,
  // TextInput,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  FormLabel,
  Radio,
  Box,
  Chip,
  Tooltip,
  TextField,
} from "@mui/material";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { getStatusCodeString } from "../../../../utils/common";
import { LeavePolicyValidationSchema } from "../../../../utils/Schema/leaveManagementValidationSchemas";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { useIntl } from "react-intl";
import { LeavePolicyModel } from "../model";
import { getAllEmployees } from "../../employees/employeeServices";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { toast } from "react-toastify";
import {
  createLeavePolicy,
  createUpdateLeaveBalance,
  createUpdateLeaveType,
  updateLeavePolicy,
} from "../leaveServices";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { error } from "console";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [employeeList, setEmployeeList] = useState<
    Array<GetAllEmployeeResponseModel>
  >([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  let empOptions: Array<GetAllEmployeeResponseModel> = [
    {
      userId: "1",
      fullName: "All Employees",
      email: "all@gmail.com",
      gender: "none",
      employeeId: "checkId",
      jobRole: null,
      department: null,
      phoneNumber: null,
      fullProfileUrl: null,
      dateOfBirth: null,
    },
    {
      userId: "0",
      fullName: "None",
      email: "all@gmail.com",
      gender: "none",
      employeeId: "checkId",
      jobRole: null,
      department: null,
      phoneNumber: null,
      fullProfileUrl: null,
      dateOfBirth: null,
    },
  ];

  useEffect(() => {
    setLoading(true);
    const getAllEmployeesList = async () => {
      try {
        const response = await getAllEmployees();
        const { success, methodResults } = response.data;
        if (success) {
          const allEmpOptions = empOptions;
          methodResults.forEach((emp) => {
            allEmpOptions.push(emp);
          });
          setEmployeeList(allEmpOptions);
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    getAllEmployeesList();
  }, []);

  const handleCreateNewPolicy = async (
    values: LeavePolicyModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
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
      toast.error(
        i({
          id: getStatusCodeString(data.statusCode),
          defaultMessage: "ERROR.SOMETHING_WRONG",
        })
      );
    }
    setSubmitting(false);
  };

  const handleUpdateLeavePolicy = async (
    values: LeavePolicyModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    const { data } = await updateLeavePolicy(values);
    if (data.success) {
      toast.success(
        i({
          id: props.isEdit ? "TOAST.SUCCESS.UPDATE" : "TOAST.SUCCESS.CREATED",
        })
      );
      props.handleClose();
      props.handleRefresh();
    } else {
      toast.error(
        i({
          id: getStatusCodeString(data.statusCode),
          defaultMessage: "ERROR.SOMETHING_WRONG",
        })
      );
    }
    setSubmitting(false);
  };

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
                if (values.applicableTo.includes("1")) {
                  values.applicableTo = [];
                } else if (values.applicableTo.includes("0")) {
                  values.applicableTo = null;
                }
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
            setFieldTouched,
            handleSubmit,
            ...formik
          }) => {
            // console.log(formik.errors);
            // console.log(values);
            // console.log(formik.dirty);
            // console.log(formik.errors);
            // console.log(formik.isValid);

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
                            sx={{ position: "relative" }}
                            endAdornment={
                              <Tooltip
                                title={i({
                                  id: "LEAVE.TYPES.POLICY_ACCRUAL_DEFINATION",
                                })}
                              >
                                <HelpOutlineIcon
                                  sx={{
                                    color: "gray",
                                    position: "absolute",
                                    right: "30px",
                                    height: "18px",
                                  }}
                                />
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
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: "15px",
                        }}
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <TextInput
                          label={i({ id: "LEAVE.TYPES.POLICY_ACCURAL_AMOUNT" })}
                          name="accrualAmount"
                          type="number"
                        />
                        <Tooltip
                          title={i({
                            id: "LEAVE.TYPES.POLICY_ACCRUAL_AMOUNT_DEFINATION",
                          })}
                          sx={{}}
                        >
                          <HelpOutlineIcon
                            sx={{
                              position: "absolute",
                              right: "30px",
                              color: "gray",
                              height: "18px",
                            }}
                          />
                        </Tooltip>
                      </Grid>

                      <Grid
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: "15px",
                        }}
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
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: "15px",
                        }}
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
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: "15px",
                        }}
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
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: "15px",
                        }}
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
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: "15px",
                        }}
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
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                        }}
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
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: "15px",
                        }}
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
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          gap: "15px",
                        }}
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
                            alignItems: "start",
                            display: "flex",
                            gap: "15px",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                          size={12}
                        >
                          {/* <Autocomplete /> */}
                          <FormLabel
                            sx={{ color: "text.primary", textWrap: "nowrap" }}
                          >
                            {i({ id: "LEAVE.TYPES.POLICY_APPLICABLE_TO" })}:
                          </FormLabel>
                          <Autocomplete
                            noOptionsText={i({ id: "MESSAGE.NO_RESULT" })}
                            className="applicable-employees-select"
                            fullWidth
                            id="applicable-emps"
                            limitTags={3}
                            sx={{ padding: "0" }}
                            options={employeeList}
                            getOptionLabel={(option) => option.fullName}
                            multiple
                            renderOption={({ key, ...props }, option) => (
                              <li key={key} {...props}>
                                {option.fullName}
                              </li>
                            )}
                            renderValue={(value, getTagProps) => {
                              if (
                                value.some(
                                  (emp) => emp.userId === empOptions[1].userId
                                )
                              ) {
                                return (
                                  <Chip
                                    label="None"
                                    sx={{ margin: "5px" }}
                                    key={"1"}
                                  />
                                );
                              } else if (
                                value.some(
                                  (emp) => emp.userId === empOptions[0].userId
                                )
                              ) {
                                return (
                                  <Chip
                                    label="All Employees"
                                    sx={{ margin: "5px" }}
                                    key={0}
                                  />
                                );
                              } else
                                return value.map((option, index) => (
                                  <Chip
                                    {...getTagProps({ index })}
                                    key={option.userId}
                                    label={option.fullName}
                                    sx={{ margin: "5px" }}
                                  />
                                ));
                            }}
                            // open={open}
                            onChange={(e, value) => {
                              setFieldValue(
                                "applicableTo",
                                value.map((emp) => emp.userId)
                              );
                              if (values.applicableTo) {
                                if (values.applicableTo.includes("1")) {
                                  values.applicableTo = ["1"];
                                } else if (values.applicableTo.includes("0")) {
                                  values.applicableTo = ["0"];
                                }
                              }
                            }}
                            getOptionDisabled={
                              values.applicableTo &&
                              (values.applicableTo.includes("1") ||
                                values.applicableTo.includes("0"))
                                ? (option) => true
                                : (option) => false
                            }
                            // open={values.applicableTo.includes('1') || values.applicableTo.includes('0') ? false : undefined}
                            // disabled={values.applicableTo.includes('1') || values.applicableTo.includes('0')}
                            disablePortal
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={i({ id: "PAGE.EMPLOYEES" })}
                              />
                            )}
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
      )}
    </CustomisedModal>
  );
}
