import {
  Grid,
  Stack,
  Typography,
  MenuItem,
  Autocomplete,
  TextField,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "react-toastify";
import { EmployeeModel } from "../../../../utils/common_types";
import { Gender, bloodGroups } from "../../../../utils/constant/Constant";
import { Roles } from "../../../../utils/enums";
import { employeeSchema } from "../../../../utils/Schema/employeeSchema";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { SelectInput } from "../../../shared/components/form-component/SelectInput";
import { DepartmentModel, RoleModel } from "../../admin/models";
import { getAllDepartments, getAllRoles } from "../../admin/adminservices";
import { GetAllEmployeeResponseModel } from "../models";
import { statusEncoder } from "../../../../utils/common";
import { addEmployee } from "../employeeServices";
import { useLang } from "../../../../_themes/i18n/Metronici18n";

const employeeInitialValue: EmployeeModel = {
  userId: "",
  employeeId: "",
  roleId: "",
  companyId: "",
  firstName: "",
  lastName: "",
  gender: "",
  email: "",
  dateOfBirth: null,
  department: "",
  reportingManager: null,
  teamLead: null,
  phoneNumber: "",
  bloodGroup: "",
  address: "",
  jobRole: "",
  status: "Active",
  isEmailVerified: false,
  dateOfJoining: null,
  personalEmail: "",
  emergencyContact: "",
  password: null,
};

interface PropsTypes {
  open: boolean;
  handleClose: () => void;
  employeeList: GetAllEmployeeResponseModel[];
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export const AddEmployee = (props: PropsTypes) => {
  const currentLanguage = useLang();
  const { open, handleClose, employeeList, refresh, setRefresh } = props;
  const [roles, setRoles] = useState<RoleModel[] | undefined>();
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);
  const { formatMessage } = useIntl();

  async function SaveAddEditEmployee(
    values: EmployeeModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    const payload = {
      ...values,
      status: statusEncoder(values.status as string),
    };
    try {
      const response = await addEmployee(payload);
      const { success, message } = response.data;
      if (success) {
        toast.success(message);
        setSubmitting(false);
        handleClose();
        setRefresh(!refresh);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    Promise.all([getAllRoles(), getAllDepartments()])
      .then((res) => {
        setRoles(res[0].data.methodResults);
        if (res[1].data.totalRecords === 0) {
          toast.error(formatMessage({ id: "MESSAGE.DEPARTMENT.NO_DEPARTMENTS" }));
          handleClose();
        } else {
          setDepartmentList(res[1].data.methodResults.filter(dep => dep.isActive));
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  const filteredRoles = roles?.filter(
    (role) => role.titles !== Roles.Administrator
  );

  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}>
        <Stack direction="column" spacing={2}>
          <Typography variant="h5">
            {formatMessage({ id: "ADD.EMP.INFO" })}
          </Typography>
          <Formik
            initialValues={employeeInitialValue}
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
              touched,
              errors,
              handleSubmit,
            }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <Grid
                    container
                    rowSpacing={1.5}
                    columnSpacing={{ xs: 1, sm: 2 }}
                  >
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={formatMessage({ id: "FORM.FIRST_NAME" })}
                        type="text"
                        name="firstName"
                        required={true}
                        placeholder={formatMessage({
                          id: "FORM.FIRST_NAME",
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={formatMessage({ id: "FORM.LAST_NAME" })}
                        type="text"
                        name="lastName"
                        required={true}
                        placeholder={formatMessage({
                          id: "FORM.LAST_NAME",
                        })}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="gender"
                        label={formatMessage({ id: "FORM.GENDER" })}
                      >
                        {Gender.map((item) => (
                          <MenuItem key={item.id} value={item.value}>
                            {formatMessage({ id: item.label })}
                          </MenuItem>
                        ))}
                      </SelectInput>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={formatMessage({ id: "FORM.EMPID" })}
                        type="text"
                        name="employeeId"
                        required={true}
                        placeholder={formatMessage({
                          id: "FORM.EMPID",
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomisedDatePicker
                        label={formatMessage({ id: "FORM.DOB" })}
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
                        label={formatMessage({ id: "FORM.DOJ" })}
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
                        label={formatMessage({ id: "FORM.EMAIL" })}
                        type="email"
                        name="email"
                        required={true}
                        placeholder={formatMessage({
                          id: "FORM.EMAIL",
                        })}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="roleId"
                        label={formatMessage({ id: "FORM.ROLE" })}
                      >
                        {filteredRoles && filteredRoles.map((role) => {
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
                        label={formatMessage({ id: "FORM.JOB_ROLE" })}
                        type="text"
                        name="jobRole"
                        required={true}
                        placeholder={formatMessage({ id: "FORM.JOB_ROLE" })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="department"
                        label={formatMessage({ id: "FORM.DEPARTMENT" })}
                      >
                        {departmentList.map((dep) => (
                          <MenuItem
                            key={dep.departmentId}
                            value={dep.departmentId}
                          >
                            {dep.titles.find(title => title.language === currentLanguage)?.label ?? <FormattedMessage id={"TRANSLATION_MISSING"} />}
                          </MenuItem>
                        ))}
                      </SelectInput>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        id="reporting_manager"
                        size="small"
                        value={employeeList.find(
                          (emp) => emp.userId === values.reportingManager
                        )}
                        options={employeeList}
                        onChange={(event, value) => {
                          setFieldTouched("reportingManager", true);
                          setFieldValue(
                            "reportingManager",
                            value ? value.userId : ""
                          );
                        }}
                        renderInput={(param) => (
                          <TextField
                            {...param}
                            label={formatMessage({
                              id: "USER.REPORTING_MANAGER",
                            })}
                          />
                        )}
                        getOptionLabel={(option) => option.fullName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        id="teamlead"
                        size="small"
                        value={employeeList.find(
                          (emp) => emp.userId === values.teamLead
                        )}
                        options={employeeList}
                        onChange={(event, value) => {
                          setFieldTouched("teamLead", true);
                          setFieldValue("teamLead", value ? value.userId : "");
                        }}
                        renderInput={(param) => (
                          <TextField
                            {...param}
                            label={formatMessage({
                              id: "USER.TEAM_LEAD",
                            })}
                          />
                        )}
                        getOptionLabel={(option) => option.fullName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={formatMessage({ id: "USER.PHONE" })}
                        type="text"
                        name="phoneNumber"
                        required={true}
                        placeholder={formatMessage({ id: "USER.PHONE" })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="bloodGroup"
                        label={formatMessage({ id: "USER.BLOOD_GROUP" })}
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
                        label={formatMessage({
                          id: "USER.PERSONAL_EMAIL",
                        })}
                        type="text"
                        name="personalEmail"
                        placeholder={formatMessage({
                          id: "USER.PERSONAL_EMAIL",
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={formatMessage({
                          id: "USER.EMERGENCY_CONTACT",
                        })}
                        type="text"
                        name="emergencyContact"
                        placeholder={formatMessage({
                          id: "USER.EMERGENCY_CONTACT",
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="status"
                        label={formatMessage({ id: "PROFILE.STATUS" })}
                      >
                        <MenuItem value={"Active"}>
                          {formatMessage({ id: "STATUS.ACTIVE" })}
                        </MenuItem>
                        <MenuItem value={"Inactive"}>
                          {formatMessage({ id: "STATUS.INACTIVE" })}
                        </MenuItem>
                      </SelectInput>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={formatMessage({ id: "USER.ADDRESS" })}
                        type="text"
                        name="address"
                        required={true}
                        placeholder={formatMessage({ id: "USER.ADDRESS" })}
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
                      label={formatMessage({ id: "BUTTON.CLOSE" })}
                      handleClick={handleClose}
                    />
                    <CustomisedButton
                      loading={isSubmitting}
                      label={formatMessage({ id: "BUTTON.ADD" })}
                      type="submit"
                      disabled={isSubmitting}
                    />
                  </Stack>
                </form>
              );
            }}
          </Formik>
        </Stack>
      </CustomisedModal>
    </>
  );
};
