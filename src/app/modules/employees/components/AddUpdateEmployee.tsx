import { Grid, Stack, Typography, MenuItem } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { EmployeeModel } from "../../../../utils/common_types";
import {
  Gender,
  DepartmentList,
  bloodGroups,
} from "../../../../utils/constant/Constant";
import { Roles } from "../../../../utils/enums";
import { employeeSchema } from "../../../../utils/Schema/employeeSchema";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { SelectInput } from "../../../shared/components/form-component/SelectInput";
import { RoleModel } from "../../admin/models";
import { getAllRoles } from "../../admin/adminservices";

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
  const { initialValues, open, SaveAddEditEmployee, handleClose, isEdit } =
    props;
  const [roles, setRoles] = useState<RoleModel[] | undefined>();
  const intl = useIntl();

  useEffect(() => {
    getAllRoles()
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

  const filteredRoles = roles?.filter(
    (role) => role.titles !== Roles.Administrator
  );

  return (
    <>
      {filteredRoles && filteredRoles?.length > 0 && (
        <CustomisedModal open={open} handleClose={handleClose}>
          <Stack direction="column" spacing={2}>
            <Typography variant="h5">
              {isEdit
                ? intl.formatMessage({ id: "UPDATE.EMP.INFO" })
                : intl.formatMessage({ id: "ADD.EMP.INFO" })}
            </Typography>
            <Formik
              initialValues={initialValues}
              validationSchema={employeeSchema}
              onSubmit={(values, { setSubmitting }) => {
                delete values.fullProfileUrl;
                delete values.profileUrl;
                SaveAddEditEmployee(values, setSubmitting);
              }}
            >
              {({
                isSubmitting,
                values,
                setFieldTouched,
                setFieldValue,
                isValid,
                touched,
                errors,
                dirty,
                handleSubmit,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Grid
                    container
                    rowSpacing={1.5}
                    columnSpacing={{ xs: 1, sm: 2 }}
                  >
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.FIRST_NAME" })}
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.LAST_NAME" })}
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="gender"
                        label={intl.formatMessage({ id: "USER.GENDER" })}
                      >
                        {Gender.map((item) => (
                          <MenuItem key={item.id} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </SelectInput>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.EMP_ID" })}
                        type="text"
                        name="employeeId"
                        placeholder="Employee Id"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomisedDatePicker
                        label={intl.formatMessage({ id: "USER.DOB" })}
                        name={"dateOfBirth"}
                        value={values.dateOfBirth}
                        setValue={(newDate: Dayjs | null) => {
                          setFieldTouched("dateOfBirth", true);
                          setFieldValue("dateOfBirth", newDate);
                        }}
                        maxDate={dayjs()}
                      />
                      <ErrorLabel>
                        {touched.dateOfBirth &&
                          errors.dateOfBirth &&
                          errors.dateOfBirth}
                      </ErrorLabel>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomisedDatePicker
                        label={intl.formatMessage({ id: "USER.DOJ" })}
                        value={values.dateOfJoining}
                        setValue={(newDate: Dayjs | null) => {
                          setFieldTouched("dateOfJoining", true);
                          setFieldValue("dateOfJoining", newDate);
                        }}
                        maxDate={dayjs()}
                      />
                      <ErrorLabel>
                        {touched.dateOfJoining &&
                          errors.dateOfJoining &&
                          errors.dateOfJoining}
                      </ErrorLabel>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                        type="email"
                        name="email"
                        placeholder="Email"
                        disabled={isEdit}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="roleId"
                        label={intl.formatMessage({ id: "USER.ROLE" })}
                      >
                        <MenuItem value={""}>None</MenuItem>
                        {filteredRoles.map((role) => {
                          return (
                            <MenuItem key={role.rolesId} value={role.rolesId}>
                              {role.titles}
                            </MenuItem>
                          );
                        })}
                      </SelectInput>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.JOBROLE" })}
                        type="text"
                        name="jobRole"
                        placeholder="Job Role"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <SelectInput
                        name="department"
                        label={intl.formatMessage({ id: "USER.DEPARTMENT" })}
                      >
                        {DepartmentList.map((dep) => (
                          <MenuItem key={dep.id} value={dep.value}>
                            {dep.label}
                          </MenuItem>
                        ))}
                      </SelectInput>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({
                          id: "USER.REPORTING_MANAGER",
                        })}
                        type="text"
                        name="reportingManager"
                        placeholder="Reporting Manager"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.TEAM_LEAD" })}
                        type="text"
                        name="teamLead"
                        placeholder="Team lead"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.PHONE" })}
                        type="text"
                        name="phoneNumber"
                        placeholder="Phone Number"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="bloodGroup"
                        label={intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
                      >
                        {bloodGroups.map((item) => (
                          <MenuItem key={item.id} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </SelectInput>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({
                          id: "USER.PERSONAL_EMAIL",
                        })}
                        type="text"
                        name="personalEmail"
                        placeholder="Personal Email"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({
                          id: "USER.EMERGENCY_CONTACT",
                        })}
                        type="text"
                        name="emergencyContact"
                        placeholder="Emergency Contact"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="status"
                        label={intl.formatMessage({ id: "PROFILE.STATUS" })}
                      >
                        <MenuItem value={"Active"}>Active</MenuItem>
                        <MenuItem value={"Inactive"}>Inactive</MenuItem>
                      </SelectInput>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.ADDRESS" })}
                        type="text"
                        name="address"
                        placeholder="Address"
                      />
                    </Grid>
                  </Grid>
                  <Stack
                    direction={"row"}
                    sx={{
                      marginBlockStart: 2,
                      justifyContent: "flex-end",
                    }}
                    spacing={1}
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
                  </Stack>
                </form>
              )}
            </Formik>
          </Stack>
        </CustomisedModal>
      )}
    </>
  );
}
