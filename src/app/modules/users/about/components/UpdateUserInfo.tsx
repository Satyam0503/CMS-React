import {
  Grid,
  Stack,
  Box,
  Typography,
  FormHelperText,
  MenuItem,
  TextField,
  Autocomplete,
} from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import CustomisedDatePicker from "../../../../shared/components/CustomisedDatePicker";
import { Formik } from "formik";
import dayjs, { Dayjs } from "dayjs";
import { bloodGroups } from "../../../../../utils/constant/Constant";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { userSchema } from "../../../../../utils/Schema/userSchema";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import { SelectInput } from "../../../../shared/components/form-component/SelectInput";
import { EmployeeModel } from "../../../../../utils/common_types";
import { getAllEmployees, updateEmployee } from "../../../employees/employeeServices";
import { useUserDetails } from "../../UserDataProvider";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { setCurrentUser } from "../../../../Redux/Reducers/userSlice";
import { useParams } from "react-router-dom";
import { checkPermissionForModulesFeatureAccess } from "../../../../../utils/common";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { DepartmentModel } from "../../../admin/models";
import { getAllDepartments } from "../../../admin/adminservices";
import { useLang } from "../../../../../_themes/i18n/Metronici18n";
import { GetAllEmployeeResponseModel } from "../../../employees/models";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userData: EmployeeModel;
}

export const UpdateUserInfo: FC<Props> = ({ userData, open, setOpen }) => {
  const intl = useIntl();
  const currentLanguage = useLang();
  const { updateUserDetails, setRefresh } = useUserDetails();
  const user = useAppSelector((state) => state.user.userData)!;
  const dispatch = useAppDispatch();
  const employeeId = useParams().employeeid;
  const userPermissions = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
  const hasEditPermission = checkPermissionForModulesFeatureAccess(`${ModulesName.Employees}.${Permission.Edit}`, userPermissions);
  const [departments, setDepartments] = useState<DepartmentModel[]>([]);
  const [employeeList, setEmployeeList] = useState<GetAllEmployeeResponseModel[]>([]);

  const initialValues = useMemo(
    () => ({
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      email: userData?.email,
      phoneNumber: userData?.phoneNumber,
      address: userData?.address,
      bloodGroup: userData?.bloodGroup,
      dateOfBirth: userData?.dateOfBirth,
      dateOfJoining: userData?.dateOfJoining,
      personalEmail: userData?.personalEmail,
      emergencyContact: userData?.emergencyContact,
      reportingManager: userData.reportingManager,
      teamLead: userData.teamLead,
      department: userData.department,
      jobRole: userData.jobRole,
    }),
    [userData]
  );

  function handleClose() {
    setOpen(false);
  }

  async function handleUpdateUserDetail(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      const response = await updateEmployee(values, userData?.userId);
      const { success, statusCode, methodResult, message } = response.data;
      if (success && statusCode === 200) {
        updateUserDetails(methodResult);
        if (!employeeId) {
          dispatch(
            setCurrentUser({
              ...user,
              firstName: methodResult.firstName,
              lastName: methodResult.lastName,
              fullName: methodResult.firstName + " " + methodResult.lastName,
            })
          );
        }
        toast.success(message);
        handleClose();
      }
    } catch (error: unknown) {
      console.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllDepartments(true);
        if (data.success) {
          setDepartments(data.methodResults);
        }
      }
      catch (error) {
        console.log(error);
      }
    })();
  }, [])

  useEffect(() => {
    const getAllEmployeesList = async () => {
      try {
        const response = await getAllEmployees();
        const { success, statusCode, methodResults } = response.data;
        if (!(success && statusCode === 200)) {
          throw new Error("Failed To fetch Data");
        }
        if (methodResults) {
          setEmployeeList(methodResults);
        }
      } catch (error) {
        console.error("error :", error instanceof Error ? error.message : error
        );
      }
    };
    getAllEmployeesList();
  }, []);

  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}>
        <Typography variant="h5" mb={2}>
          {intl.formatMessage({ id: "PROFILE.PI" })}
        </Typography>
        <Box>
          <Formik
            initialValues={initialValues}
            validationSchema={userSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleUpdateUserDetail(values, setSubmitting);
            }}
          >
            {({
              values,
              setFieldValue,
              setFieldTouched,
              isValid,
              dirty,
              isSubmitting,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label={intl.formatMessage({ id: "USER.FIRST_NAME" })}
                      type="text"
                      name="firstName"
                      placeholder={intl.formatMessage({ id: "USER.FIRST_NAME" })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label={intl.formatMessage({ id: "USER.LAST_NAME" })}
                      type="text"
                      name="lastName"
                      placeholder={intl.formatMessage({ id: "USER.LAST_NAME" })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack>
                      <CustomisedDatePicker
                        label={intl.formatMessage({ id: "USER.DOB" })}
                        name="dateOfBirth"
                        value={values?.dateOfBirth ? dayjs(values?.dateOfBirth) : null}
                        setValue={(newDate: Dayjs | null) => {
                          setFieldTouched("dateOfBirth", true);
                          setFieldValue("dateOfBirth", newDate);
                        }}
                        maxDate={dayjs()}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack>
                      <CustomisedDatePicker
                        label={intl.formatMessage({ id: "USER.DOJ" })}
                        name="dateOfJoining"
                        value={values?.dateOfJoining ? dayjs(values?.dateOfJoining) : null}
                        setValue={(newDate: Dayjs | null) => {
                          setFieldTouched("dateOfJoining", true);
                          setFieldValue("dateOfJoining", newDate);
                        }}
                        maxDate={dayjs()}
                        disabled={!hasEditPermission}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label={intl.formatMessage({ id: "FORM.EMAIL" })}
                      type="email"
                      name="email"
                      placeholder={intl.formatMessage({ id: "FORM.EMAIL" })}
                      disabled={true}
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
                      label={intl.formatMessage({ id: "FORM.JOB_ROLE" })}
                      type="text"
                      name="jobRole"
                      disabled={!hasEditPermission}
                      required={true}
                      placeholder={intl.formatMessage({ id: "FORM.JOB_ROLE" })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      id="reporting_manager"
                      size="small"
                      disabled={!hasEditPermission}
                      value={employeeList.find((emp) => emp.userId === values.reportingManager) || null}
                      options={employeeList}
                      onChange={(event, value) => {
                        setFieldTouched("reportingManager", true);
                        setFieldValue(
                          "reportingManager",
                          value ? value.userId : null
                        );
                      }}
                      renderInput={(param) => (
                        <TextField
                          {...param}
                          label={intl.formatMessage({
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
                      disabled={!hasEditPermission}
                      value={employeeList.find((emp) => emp.userId === values.teamLead) || null}
                      options={employeeList}
                      onChange={(event, value) => {
                        setFieldTouched("teamLead", true);
                        setFieldValue("teamLead", value ? value.userId : null);
                      }}
                      renderInput={(param) => (
                        <TextField
                          {...param}
                          label={intl.formatMessage({
                            id: "USER.TEAM_LEAD",
                          })}
                        />
                      )}
                      getOptionLabel={(option) => option.fullName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectInput
                      name="department"
                      label={intl.formatMessage({ id: "FORM.DEPARTMENT" })}
                      disabled={!hasEditPermission}
                    >
                      {departments.map((dep) => (
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
                    <TextInput
                      label={intl.formatMessage({
                        id: "USER.PERSONAL_EMAIL",
                      })}
                      type="email"
                      name="personalEmail"
                      placeholder={intl.formatMessage({ id: "USER.PERSONAL_EMAIL" })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextInput
                      label={intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
                      type="text"
                      name="emergencyContact"
                      placeholder={intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
                    />
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
                  spacing={1}
                  justifyContent={"flex-end"}
                  mt={2}
                >
                  <CustomisedButton
                    label={intl.formatMessage({ id: "BUTTON.CLOSE" })}
                    handleClick={handleClose}
                    variant="outlined"
                  />
                  <CustomisedButton
                    loading={isSubmitting}
                    label={intl.formatMessage({ id: "BUTTON.SAVE" })}
                    type="submit"
                    disabled={!(isValid && dirty) || isSubmitting}
                  />
                </Stack>
              </form>
            )}
          </Formik>
        </Box>
      </CustomisedModal>
    </>
  );
};
