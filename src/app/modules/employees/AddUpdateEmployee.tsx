import {
  Grid,
  TextField,
  Stack,
  Typography,
  Select,
  InputLabel,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../components/CustomisedDatePicker";
import { useFormik } from "formik";
import { bloodGroups, Gender } from "../../../utils/constant/Constant";
import { getAllRoles } from "./components/employeeServices";
import {
  EmployeeModel,
  EmployeesDataTypes,
  RoleModel,
  RolesType,
} from "../../../utils/common_types";
import dayjs, { Dayjs } from "dayjs";
import CustomisedButton from "../components/CustomisedButton";
import { CustomisedModal } from "../components/CustomisedModal";
import { employeeSchema } from "../../../utils/Schema/employeeSchema";
import { useAppSelector } from "../../Redux/hooks";
import { toast } from "react-toastify";

interface PropsTypes {
  initialValues: EmployeeModel;
  isEdit: boolean;
  open: boolean;
  handleClose: () => void;
  SaveAddEditEmployee: (
    values: EmployeeModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
}

export default function AddUpdateEmployee(props: PropsTypes) {
  const token = useAppSelector((state) => state.auth.token)!;
  const { initialValues, open, SaveAddEditEmployee, handleClose, isEdit } =
    props;
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const currentUser = useAppSelector((state) => state.user.userData);
  const intl = useIntl();

  const {
    values,
    touched,
    errors,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    setFieldValue,
    isValid,
    dirty,
    setFieldTouched,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: employeeSchema,
    onSubmit: (values, { setSubmitting }) => {
      SaveAddEditEmployee(values, setSubmitting);
    },
  });

  const handleDateChange = (fieldName: string) => {
    return (newDate: Dayjs | null) => {
      setFieldTouched(fieldName, true);
      setFieldValue(fieldName, newDate);
    };
  };

  useEffect(() => {
    getAllRoles(token)
      .then((res) => {
        const { success, statusCode, methodResults } = res.data;
        if (success && statusCode === 200) {
          setRoles(methodResults);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }, []);

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack direction="column" spacing={2}>
        <Typography variant="h5">
          {isEdit
            ? intl.formatMessage({ id: "UPDATE.EMP.INFO" })
            : intl.formatMessage({ id: "ADD.EMP.INFO" })}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container rowSpacing={1} columnSpacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.FIRST_NAME" })}
              </Typography>
              <TextField
                fullWidth
                placeholder="First Name"
                id="outlined-basic"
                variant="outlined"
                type="text"
                error={touched.firstName && Boolean(errors.firstName)}
                helperText={
                  touched.firstName && errors.firstName && errors.firstName
                }
                {...getFieldProps("firstName")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.LAST_NAME" })}
              </Typography>
              <TextField
                fullWidth
                type="text"
                placeholder="Last Name"
                id="outlined-basic"
                variant="outlined"
                error={touched.lastName && Boolean(errors.lastName)}
                helperText={
                  touched.lastName && errors.lastName && errors.lastName
                }
                {...getFieldProps("lastName")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.GENDER" })}
              </Typography>
              <Select
                fullWidth
                labelId="gender"
                id="outlined-basic"
                error={touched.gender && Boolean(errors.gender)}
                {...getFieldProps("gender")}
              >
                {/* <MenuItem value={""}>None</MenuItem> */}
                {Gender.map((item) => (
                  <MenuItem key={item.id} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {touched.gender && errors.gender && errors.gender}
              </FormHelperText>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.EMP_ID" })}
              </Typography>
              <TextField
                fullWidth
                placeholder="Employee Id"
                id="outlined-basic"
                variant="outlined"
                error={touched.employeeId && Boolean(errors.employeeId)}
                helperText={
                  touched.employeeId && errors.employeeId && errors.employeeId
                }
                {...getFieldProps("employeeId")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.DOB" })}
              </Typography>
              <CustomisedDatePicker
                name={"dateOfBirth"}
                value={values.dateOfBirth}
                setValue={handleDateChange("dateOfBirth")}
                maxDate={dayjs()}
              />
              <FormHelperText>
                {touched.dateOfBirth &&
                  errors.dateOfBirth &&
                  errors.dateOfBirth}
              </FormHelperText>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
              </Typography>
              <TextField
                placeholder="Email"
                fullWidth
                id="outlined-basic"
                variant="outlined"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email && errors.email}
                {...getFieldProps("email")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              {/* <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.ROLE" })}
                </Typography> */}
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.ROLE" })}
              </Typography>
              <Select
                fullWidth
                id="outlined-basic"
                variant="outlined"
                error={touched.roleId && Boolean(errors.roleId)}
                labelId="employee_role"
                {...getFieldProps("roleId")}
              >
                <MenuItem value={""}>None</MenuItem>
                {roles.map((role) => {
                  if (role.titles !== currentUser?.role) {
                    return (
                      <MenuItem key={role.rolesId} value={role.rolesId}>
                        {role.titles}
                      </MenuItem>
                    );
                  }
                })}
              </Select>
              <FormHelperText>
                {touched.roleId && errors.roleId && errors.roleId}
              </FormHelperText>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.JOBROLE" })}
              </Typography>
              <TextField
                fullWidth
                placeholder="Job Role"
                id="outlined-basic"
                variant="outlined"
                error={touched.jobRole && Boolean(errors.jobRole)}
                helperText={touched.jobRole && errors.jobRole && errors.jobRole}
                {...getFieldProps("jobRole")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.DEPARTMENT" })}
              </Typography>
              <TextField
                fullWidth
                placeholder="Department"
                id="outlined-basic"
                variant="outlined"
                error={touched.department && Boolean(errors.department)}
                helperText={
                  touched.department && errors.department && errors.department
                }
                {...getFieldProps("department")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
              </Typography>
              <TextField
                fullWidth
                placeholder="Reporting Manager"
                id="outlined-basic"
                variant="outlined"
                error={
                  touched.reportingManager && Boolean(errors.reportingManager)
                }
                helperText={
                  touched.reportingManager &&
                  errors.reportingManager &&
                  errors.reportingManager
                }
                {...getFieldProps("reportingManager")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.TEAM_LEAD" })}
              </Typography>
              <TextField
                fullWidth
                placeholder="Team lead"
                id="outlined-basic"
                variant="outlined"
                error={touched.teamLead && Boolean(errors.teamLead)}
                helperText={
                  touched.teamLead && errors.teamLead && errors.teamLead
                }
                {...getFieldProps("teamLead")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.PHONE" })}
              </Typography>
              <TextField
                fullWidth
                placeholder="Phone Number"
                id="outlined-basic"
                variant="outlined"
                error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                helperText={
                  touched.phoneNumber &&
                  errors.phoneNumber &&
                  errors.phoneNumber
                }
                {...getFieldProps("phoneNumber")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
              </Typography>
              <Select
                fullWidth
                id="outlined-basic"
                variant="outlined"
                error={touched.bloodGroup && Boolean(errors.bloodGroup)}
                {...getFieldProps("bloodGroup")}
              >
                {bloodGroups.map((item) => (
                  <MenuItem key={item.id} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {touched.bloodGroup && errors.bloodGroup && errors.bloodGroup}
              </FormHelperText>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.PERSONAL_EMAIL" })}
              </Typography>
              <TextField
                fullWidth
                placeholder="Personal Email"
                id="outlined-basic"
                variant="outlined"
                error={touched.personalEmail && Boolean(errors.personalEmail)}
                helperText={
                  touched.personalEmail &&
                  errors.personalEmail &&
                  errors.personalEmail
                }
                {...getFieldProps("personalEmail")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
              </Typography>
              <TextField
                fullWidth
                placeholder="Emergency Contact"
                id="outlined-basic"
                variant="outlined"
                error={
                  touched.emergencyContact && Boolean(errors.emergencyContact)
                }
                helperText={
                  touched.emergencyContact &&
                  errors.emergencyContact &&
                  errors.emergencyContact
                }
                {...getFieldProps("emergencyContact")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "PROFILE.STATUS" })}
              </Typography>
              <Select
                fullWidth
                variant="outlined"
                error={touched.status && Boolean(errors.status)}
                {...getFieldProps("status")}
              >
                <MenuItem value={"Active"}>Active</MenuItem>
                <MenuItem value={"Inactive"}>Inactive</MenuItem>
              </Select>
              <FormHelperText>
                {touched.status && errors.status && errors.status}
              </FormHelperText>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.DOJ" })}
              </Typography>
              <CustomisedDatePicker
                value={values.dateOfJoining}
                setValue={handleDateChange("dateOfJoining")}
                maxDate={dayjs()}
              />
              <FormHelperText>
                {touched.dateOfJoining &&
                  errors.dateOfJoining &&
                  errors.dateOfJoining}
              </FormHelperText>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.ADDRESS" })}
              </Typography>
              <TextField
                fullWidth
                placeholder="Address"
                id="outlined-basic"
                variant="outlined"
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address && errors.address}
                {...getFieldProps("address")}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                marginBlockStart: "1rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
              gap={1}
            >
              <CustomisedButton
                variant="outlined"
                label="Cancel"
                handleClick={handleClose}
              />
              <CustomisedButton
                label={isEdit ? "Update" : "Add"}
                type="submit"
                disabled={isSubmitting || !(isValid && dirty)}
              />
            </Grid>
          </Grid>
        </form>
      </Stack>
    </CustomisedModal>
  );
}
