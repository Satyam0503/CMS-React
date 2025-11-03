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
import { EmploymentType, Gender, bloodGroups } from "../../../../utils/constant/Constant";
import { employeeSchema } from "../../../../utils/Schema/employeeSchema";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { SelectInput } from "../../../shared/components/form-component/SelectInput";
import { DepartmentModel, JobTitleResponseModel, RoleModel } from "../../admin/models";
import { getAllDepartments, getAllRoles, getJobTitles } from "../../admin/adminservices";
import { EmployeeModel, GetAllEmployeeResponseModel } from "../models";
import { getStatusCodeString, statusEncoder } from "../../../../utils/common";
import { addEmployee, getAllEmployees } from "../employeeServices";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";
import { EmployeeByIdResponse } from "../../users/models";

const employeeInitialValue: EmployeeModel & Pick<EmployeeByIdResponse, "bankAccountNumber" | "panNumber"> = {
  userId: "",
  employeeId: "",
  roleId: "",
  firstName: "",
  lastName: "",
  gender: "",
  email: "",
  dateOfBirth: null,
  department: "",
  reportingManager: null,
  phoneNumber: null,
  bloodGroup: null,
  address: null,
  jobRole: null,
  status: "Active",
  dateOfJoining: null,
  personalEmail: null,
  emergencyContact: null,
  employmentType: null,
  bankAccountNumber: null,
  panNumber: null
};

interface PropsTypes {
  open: boolean;
  handleClose: () => void;
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export const AddEmployee = (props: PropsTypes) => {
  const { open, handleClose, refresh, setRefresh } = props;
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);
  const [employeeList, setEmployeeList] = useState<GetAllEmployeeResponseModel[]>([]);
  const [jobTitleList, setJobTitleList] = useState<JobTitleResponseModel[]>([]);
  const { formatMessage: i } = useIntl();
  const { currentLanguage } = useAppLang();
  const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage!);

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
      const { success, statusCode } = response.data;
      if (success) {
        toast.success(i({ id: "TOAST.SUCCESS.ADD_EMPLOYEE" }));
        setSubmitting(false);
        handleClose();
        setRefresh(!refresh);
      } else {
        toast.error(i({ id: getStatusCodeString(statusCode) }));
      }
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    Promise.all([getAllRoles(true), getAllDepartments(true)])
      .then((res) => {
        setRoles(res[0].data.methodResults);
        if (res[1].data.totalRecords === 0) {
          toast.error(i({ id: "MESSAGE.NO_DEPARTMENTS" }));
          handleClose();
        }
        else {
          setDepartmentList(res[1].data.methodResults);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await Promise.allSettled([getAllEmployees(), getJobTitles()]);
        if (result[0].status === "fulfilled") {
          const { success, methodResults } = result[0].value.data;
          if (success) setEmployeeList(methodResults);
        }
        if (result[1].status === "fulfilled") {
          const { success, methodResults } = result[1].value.data;
          if (success) setJobTitleList(methodResults);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [])

  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}
        title={i({ id: "EMPLOYEE.ADD_NEW_EMP" })}
      >
        <Formik
          initialValues={employeeInitialValue}
          validationSchema={employeeSchema}
          onSubmit={(values, { setSubmitting }) => {
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
                  rowSpacing={2}
                  columnSpacing={{ xs: 1, sm: 2 }}
                >
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({ id: "FORM.FIRST_NAME" })}
                      type="text"
                      name="firstName"
                      required={true}
                      placeholder={i({
                        id: "FORM.FIRST_NAME",
                      })}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({ id: "FORM.LAST_NAME" })}
                      type="text"
                      name="lastName"
                      required={true}
                      placeholder={i({
                        id: "FORM.LAST_NAME",
                      })}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <SelectInput
                      name="gender"
                      label={i({ id: "FORM.GENDER" })}
                      required={true}
                    >
                      {Gender.map((item) => (
                        <MenuItem key={item.id} value={item.value}>
                          {i({ id: item.label })}
                        </MenuItem>
                      ))}
                    </SelectInput>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({ id: "FORM.EMPID" })}
                      type="text"
                      name="employeeId"
                      required={true}
                      placeholder={i({
                        id: "FORM.EMPID",
                      })}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({ id: "FORM.EMAIL" })}
                      type="email"
                      name="email"
                      required={true}
                      placeholder={i({
                        id: "FORM.EMAIL",
                      })}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <SelectInput
                      name="roleId"
                      label={i({ id: "FORM.ROLE" })}
                      required={true}
                    >
                      {roles.map((role) => {
                        return (
                          <MenuItem key={role.rolesId} value={role.rolesId}>
                            {role.titles}
                          </MenuItem>
                        );
                      })}
                    </SelectInput>
                  </Grid>

                  <Grid
                    className="pt-2"
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <CustomisedDatePicker
                      label={i({ id: "FORM.DOB" })}
                      name={"dateOfBirth"}
                      value={values.dateOfBirth ? dayjs(values.dateOfBirth) : null}
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("dateOfBirth", true);
                        setFieldValue("dateOfBirth", newDate?.format('YYYY-MM-DD'));
                      }}
                      maxDate={dayjs().subtract(18, 'year')}
                    />
                    {
                      touched.dateOfBirth &&
                      errors.dateOfBirth &&
                      <ErrorLabel errorLabel={errors.dateOfBirth} />
                    }
                  </Grid>
                  <Grid
                    className="pt-2"
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <CustomisedDatePicker
                      label={i({ id: "FORM.DOJ" })}
                      value={values.dateOfJoining ? dayjs(values.dateOfJoining) : null}
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("dateOfJoining", true);
                        setFieldValue("dateOfJoining", newDate?.format('YYYY-MM-DD'));
                      }}
                      maxDate={dayjs()}
                    />

                    {touched.dateOfJoining &&
                      errors.dateOfJoining &&
                      <ErrorLabel errorLabel={errors.dateOfJoining} />
                    }
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <SelectInput
                      name="employmentType"
                      label={i({ id: "FORM.EMPLOYEMENT_TYPE" })}
                    >
                      {EmploymentType.map((type) => {
                        return (
                          <MenuItem key={type.id} value={type.value}>
                            {i({ id: type.label })}
                          </MenuItem>
                        );
                      })}
                    </SelectInput>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <Autocomplete
                      id="job_title"
                      size="small"
                      value={jobTitleList.find(
                        (jt) => jt.jobTitleId === values.jobRole
                      ) || null}
                      options={jobTitleList}
                      onChange={(event, value) => {
                        setFieldTouched("jobRole", true);
                        setFieldValue(
                          "jobRole",
                          value ? value.jobTitleId : ""
                        );
                      }}
                      renderInput={(param) => (
                        <TextField
                          {...param}
                          label={i({
                            id: "FORM.JOB_ROLE",
                          })}
                        />
                      )}
                      getOptionLabel={(option) => option.titles[currentLanguage] || option.titles[defaultLang] || i({ id: "TRANSLATION_MISSING" })}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <SelectInput
                      name="department"
                      label={i({ id: "FORM.DEPARTMENT" })}
                      required={true}
                    >
                      {departmentList.map((dep) => (
                        <MenuItem
                          key={dep.departmentId}
                          value={dep.departmentId}
                        >
                          {dep.titles[currentLanguage] || dep.titles[defaultLang] || <FormattedMessage id={"TRANSLATION_MISSING"} />}
                        </MenuItem>
                      ))}
                    </SelectInput>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <Autocomplete
                      id="reporting_manager"
                      size="small"
                      value={employeeList.find(
                        (emp) => emp.userId === values.reportingManager
                      ) || null}
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
                          label={i({
                            id: "USER.REPORTING_MANAGER",
                          })}
                        />
                      )}
                      getOptionLabel={(option) => option.fullName}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({ id: "FORM.PHONE" })}
                      type="text"
                      name="phoneNumber"
                      placeholder={i({ id: "FORM.PHONE" })}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <SelectInput
                      name="bloodGroup"
                      label={i({ id: "FORM.BLOOD_GROUP" })}
                    >
                      {bloodGroups.map((item) => (
                        <MenuItem key={item.id} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </SelectInput>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({
                        id: "USER.PERSONAL_EMAIL",
                      })}
                      type="text"
                      name="personalEmail"
                      placeholder={i({
                        id: "USER.PERSONAL_EMAIL",
                      })}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({
                        id: "USER.EMERGENCY_CONTACT",
                      })}
                      type="text"
                      name="emergencyContact"
                      placeholder={i({
                        id: "USER.EMERGENCY_CONTACT",
                      })}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <SelectInput
                      name="status"
                      label={i({ id: "STATUS" })}
                    >
                      <MenuItem value={"Active"}>
                        {i({ id: "EMPLOYEE.STATUS.ACTIVE" })}
                      </MenuItem>
                      <MenuItem value={"Inactive"}>
                        {i({ id: "EMPLOYEE.STATUS.INACTIVE" })}
                      </MenuItem>
                    </SelectInput>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({ id: "USER.ADDRESS" })}
                      type="text"
                      name="address"
                      placeholder={i({ id: "USER.ADDRESS" })}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({ id: "USER.BANK_ACCOUNT_NO" })}
                      type="number"
                      name="bankAccountNumber"
                      placeholder={i({ id: "USER.BANK_ACCOUNT_NO" })}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({ id: "USER.PAN_NUMBER" })}
                      type="text"
                      name="panNumber"
                      placeholder={i({ id: "USER.PAN_NUMBER" })}
                    />
                  </Grid>
                </Grid>
                <Stack className="flex-row justify-content-end mt-4 gap-2">
                  <CustomisedButton
                    variant="outlined"
                    label={i({ id: "BUTTON.CLOSE" })}
                    handleClick={handleClose}
                  />
                  <CustomisedButton
                    loading={isSubmitting}
                    label={i({ id: "BUTTON.ADD" })}
                    type="submit"
                    disabled={isSubmitting}
                  />
                </Stack>
              </form>
            );
          }}
        </Formik>
      </CustomisedModal >
    </>
  );
};
