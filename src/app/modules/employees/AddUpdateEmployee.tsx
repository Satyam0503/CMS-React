import {
  Grid,
  TextField,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogContent,
  Select,
  InputLabel,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../components/CustomisedDatePicker";
import { useFormik } from "formik";
import { bloodGroups, Gender } from "../../../Constant";
import { employeeSchema } from "./employeeFormSchema";
import { getAllRoles } from "./employeeServices";
import { EmployeesDataTypes, RolesType } from "../../../utils/common_types";
import dayjs, { Dayjs } from "dayjs";

interface PropsTypes {
  initialValues: EmployeesDataTypes;
  isEdit: boolean
  open: boolean;
  handleClose: () => void;
  SaveAddEditEmployee: (value: EmployeesDataTypes) => void;
}

const { token } = JSON.parse(localStorage.getItem('kt-auth-react-v') || "{}");

export default function AddUpdateEmployee(props: PropsTypes) {

  const { initialValues, open, SaveAddEditEmployee, handleClose, isEdit } = props;
  const [roles, setRoles] = useState<RolesType[]>([]);
  const intl = useIntl();

  const { values, touched, errors, isSubmitting, handleSubmit, getFieldProps } = useFormik({
    initialValues: initialValues,
    validationSchema: employeeSchema,
    onSubmit: (values, { setSubmitting }) => {
      SaveAddEditEmployee(values);
      setSubmitting(false)
    },
  });
  function handleDateofJoiningChange(newDate: Dayjs | null) {
    values.dateOfJoining = newDate
  }
  function handleDOBChange(newDate: Dayjs | null) {
    values.dateOfBirth = newDate;
  }

  useEffect(() => {
    getAllRoles(token)
      .then((res) => {
        const { methodResult } = res.data;
        setRoles(methodResult);
      })
      .catch((error) => {
        console.log(error);
      })
  }, [])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={false}
      maxWidth={"md"}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="overflow-auto"
    >
      <DialogContent>
        <Stack direction="column">
          <Typography variant="h4" className="text-primary mb-6">
            {isEdit
              ? intl.formatMessage({ id: "UPDATE.EMP.INFO" })
              : intl.formatMessage({ id: "ADD.EMP.INFO" })
            }
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={{ xs: 1, md: 2 }} columnSpacing={3} >
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
                  helperText={touched.firstName && errors.firstName && errors.firstName}
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
                  helperText={(touched.lastName && errors.lastName) && errors.lastName}
                  {...getFieldProps("lastName")}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <InputLabel id="gender">{intl.formatMessage({ id: "USER.GENDER" })}</InputLabel>
                <Select
                  fullWidth
                  labelId="gender"
                  id="outlined-basic"
                  error={touched.gender && Boolean(errors.gender)}
                  {...getFieldProps("gender")}
                >
                  <MenuItem value={""}>None</MenuItem>
                  {
                    Gender.map(item => (
                      <MenuItem key={item.id} value={item.value}>{item.label}</MenuItem>
                    ))
                  }
                </Select>
                <FormHelperText sx={{ color: "#d32f2f" }}>{(touched.gender && errors.gender) && errors.gender}</FormHelperText>
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
                  helperText={(touched.employeeId && errors.employeeId) && errors.employeeId}
                  {...getFieldProps("employeeId")}
                />
              </Grid>

              <Grid item xs={12} md={6} >
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.DOB" })}
                </Typography>
                <CustomisedDatePicker
                  value={values.dateOfBirth}
                  setValue={handleDOBChange}
                  maxDate={dayjs()}
                />
                <FormHelperText sx={{ color: '#d32f2f' }}>{(touched.dateOfBirth && errors.dateOfBirth) && errors.dateOfBirth}</FormHelperText>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" >
                  {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                </Typography>
                <TextField
                  sx={{ paddingTop: "9px" }}
                  placeholder="Email"
                  fullWidth
                  id="outlined-basic"
                  variant="outlined"
                  error={touched.email && Boolean(errors.email)}
                  helperText={(touched.email && errors.email) && errors.email}
                  {...getFieldProps("email")}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {/* <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.ROLE" })}
                </Typography> */}
                <InputLabel id="employee_role">{intl.formatMessage({ id: "USER.ROLE" })}</InputLabel>
                <Select
                  fullWidth
                  id="outlined-basic"
                  variant="outlined"
                  error={touched.role && Boolean(errors.role)}
                  labelId="employee_role"
                  {...getFieldProps("role")}
                >
                  <MenuItem value={""}>None</MenuItem>
                  {
                    roles.map(role => (
                      <MenuItem key={role.id} value={role.id}>{role.roleName}</MenuItem>
                    ))
                  }
                </Select>
                <FormHelperText sx={{ color: "#d32f2f" }}>{(touched.role && errors.role) && errors.role}</FormHelperText>
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
                  helperText={(touched.jobRole && errors.jobRole) && errors.jobRole}
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
                  helperText={(touched.department && errors.department) && errors.department}
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
                  error={touched.reportingManager && Boolean(errors.reportingManager)}
                  helperText={(touched.reportingManager && errors.reportingManager) && errors.reportingManager}
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
                  helperText={(touched.teamLead && errors.teamLead) && errors.teamLead}
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
                  helperText={(touched.phoneNumber && errors.phoneNumber) && errors.phoneNumber}
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
                  {
                    bloodGroups.map(item => (
                      <MenuItem key={item.id} value={item.value}>{item.label}</MenuItem>
                    ))
                  }
                </Select>
                <FormHelperText sx={{ color: "#d32f2f" }}>{(touched.bloodGroup && errors.bloodGroup) && errors.bloodGroup}</FormHelperText>
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
                  helperText={(touched.personalEmail && errors.personalEmail) && errors.personalEmail}
                  {...getFieldProps("personalEmail")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
                </Typography>
                <TextField
                  sx={{ paddingTop: "9px" }}
                  fullWidth
                  placeholder="Emergency Contact"
                  id="outlined-basic"
                  variant="outlined"
                  error={touched.emergencyContact && Boolean(errors.emergencyContact)}
                  helperText={(touched.emergencyContact && errors.emergencyContact) && errors.emergencyContact}
                  {...getFieldProps("emergencyContact")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.DOJ" })}
                </Typography>
                <CustomisedDatePicker
                  value={values.dateOfJoining}
                  setValue={handleDateofJoiningChange}
                  maxDate={dayjs()}
                />
                <FormHelperText sx={{ color: "#d32f2f" }}>{(touched.dateOfJoining && errors.dateOfJoining) && errors.dateOfJoining}</FormHelperText>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.ADDRESS" })}
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Address"
                  id="outlined-basic"
                  variant="outlined"
                  error={touched.address && Boolean(errors.address)}
                  helperText={(touched.address && errors.address) && errors.address}
                  {...getFieldProps("address")}
                />
              </Grid>
              <Grid item xs={12} md={6} >
                <Typography variant="body1">
                  {intl.formatMessage({ id: "PROFILE.STATUS" })}
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Status"
                  id="outlined-basic"
                  variant="outlined"
                  error={touched.status && Boolean(errors.status)}
                  helperText={(touched.status && errors.status) && errors.status}
                  {...getFieldProps("status")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.PROFILE_PICTURE" })}
                </Typography>
                <TextField
                  fullWidth
                  type="file"
                  id="outlined-basic"
                  name="profilePicture"
                  variant="outlined"
                  error={touched.profilePicture && Boolean(errors.profilePicture)}
                  helperText={(touched.profilePicture && errors.profilePicture) && errors.profilePicture}
                // onChange={handleFileChange}
                />
              </Grid>
              <FormHelperText>{(touched.profilePicture && errors.profilePicture) && errors.profilePicture}</FormHelperText>
              <Grid
                item
                xs={12}
                sx={{ marginBlockStart: "1rem", display: "flex", justifyContent: "flex-end" }}
              >
                <Button variant="contained" className="me-4 bg-primary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting}
                  variant="contained"
                  className="bg-primary" 
                  type="submit" 
                  endIcon={ isSubmitting && <span className='spinner-border spinner-border-sm align-middle ms-2'></span>}
                >
                  {
                    isEdit ? "Save" : "Add"
                  }
                </Button>
              </Grid>
            </Grid>
          </form>
        </Stack>
      </DialogContent>
    </Dialog >
  );
}
