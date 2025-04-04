import { Grid, Stack, Typography, MenuItem, Autocomplete, TextField } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { EmployeeModel } from "../../../../utils/common_types";
import {
  Gender,
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
import { DepartmentModel, RoleModel } from "../../admin/models";
import { getAllDepartments, getAllRoles } from "../../admin/adminservices";

interface PropsTypes {
  initialValues: EmployeeModel;
  isEdit: boolean;
  open: boolean;
  handleClose: () => void;
  SaveAddEditEmployee: (
    values: EmployeeModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => void;
  employeeList:EmployeeModel[]
}

export default function AddUpdateEmployee(props: PropsTypes) {
  const { initialValues, open, SaveAddEditEmployee, handleClose, isEdit , employeeList } =
    props;
  const [roles, setRoles] = useState<RoleModel[] | undefined>();
  const [departmentList,setDepartmentList]= useState<DepartmentModel[]>([]);
  const intl = useIntl();

  useEffect(() => {
    Promise.all([getAllRoles(),getAllDepartments()])
    .then(res=>{
      setRoles(res[0].data.methodResults);
      if(res[1].data.totalRecords ===0){
        toast.error(intl.formatMessage({id:"MESSAGE.DEPARTMENT.ADD"}));
        handleClose();
      }
      else{
        setDepartmentList(res[1].data.methodResults);
      }
    }).catch(err=>{
      console.log(err.message);
    })
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
              }) => {
                return <form onSubmit={handleSubmit}>
                  <Grid
                    container
                    rowSpacing={1.5}
                    columnSpacing={{ xs: 1, sm: 2 }}
                  >
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "FORM.FIRST_NAME" })}
                        type="text"
                        name="firstName"
                        placeholder={intl.formatMessage({
                          id: "FORM.FIRST_NAME",
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "FORM.LAST_NAME" })}
                        type="text"
                        name="lastName"
                        placeholder={intl.formatMessage({
                          id: "FORM.LAST_NAME",
                        })}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="gender"
                        label={intl.formatMessage({ id: "FORM.GENDER" })}
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
                        label={intl.formatMessage({ id: "FORM.EMPID" })}
                        type="text"
                        name="employeeId"
                        placeholder={intl.formatMessage({
                          id: "FORM.EMPID",
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <CustomisedDatePicker
                        label={intl.formatMessage({ id: "FORM.DOB" })}
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
                        label={intl.formatMessage({ id: "FORM.DOJ" })}
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
                        label={intl.formatMessage({ id: "FORM.EMAIL" })}
                        type="email"
                        name="email"
                        placeholder={intl.formatMessage({
                          id: "FORM.EMAIL",
                        })}
                        disabled={isEdit}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="roleId"
                        label={intl.formatMessage({ id: "FORM.ROLE" })}
                      >
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
                        label={intl.formatMessage({ id: "FORM.JOB_ROLE" })}
                        type="text"
                        name="jobRole"
                        placeholder={intl.formatMessage({ id: "FORM.JOB_ROLE" })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="department"
                        label={intl.formatMessage({ id: "FORM.DEPARTMENT" })}
                      >
                        {departmentList.map((dep) => (
                          <MenuItem key={dep.departmentId} value={dep.departmentId}>
                            {dep.departmentName}
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
                          setFieldTouched("reportingManager",true);
                          setFieldValue("reportingManager", value ? value.userId :"");
                        }}
                        renderInput={(param) => (
                          <TextField {...param} label={intl.formatMessage({
                            id: "USER.REPORTING_MANAGER",
                          })} />
                        )}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
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
                          setFieldTouched("teamLead",true);
                          setFieldValue("teamLead", value ? value.userId : "");
                        }}
                        renderInput={(param) => (
                          <TextField {...param} label={intl.formatMessage({
                            id: "USER.TEAM_LEAD",
                          })} />
                        )}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.PHONE" })}
                        type="text"
                        name="phoneNumber"
                        placeholder={intl.formatMessage({ id: "USER.PHONE" })}
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
                        placeholder={intl.formatMessage({
                          id: "USER.PERSONAL_EMAIL",
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({
                          id: "USER.EMERGENCY_CONTACT",
                        })}
                        type="text"
                        name="emergencyContact"
                        placeholder={intl.formatMessage({
                          id: "USER.EMERGENCY_CONTACT",
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <SelectInput
                        name="status"
                        label={intl.formatMessage({ id: "PROFILE.STATUS" })}
                      >
                        <MenuItem value={"Active"}>
                          {intl.formatMessage({ id: "STATUS.ACTIVE" })}
                        </MenuItem>
                        <MenuItem value={"Inactive"}>
                          {intl.formatMessage({ id: "STATUS.INACTIVE" })}
                        </MenuItem>
                      </SelectInput>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextInput
                        label={intl.formatMessage({ id: "USER.ADDRESS" })}
                        type="text"
                        name="address"
                        placeholder={intl.formatMessage({ id: "USER.ADDRESS" })}
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
                      label={intl.formatMessage({ id: "BUTTON.CLOSE" })}
                      handleClick={handleClose}
                    />
                    <CustomisedButton
                      loading={isSubmitting}
                      label={intl.formatMessage({
                        id: isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD",
                      })}
                      type="submit"
                      disabled={isSubmitting }
                    />
                  </Stack>
                </form>
}}
            </Formik>
          </Stack>
        </CustomisedModal>
      )}
    </>
  );
}
