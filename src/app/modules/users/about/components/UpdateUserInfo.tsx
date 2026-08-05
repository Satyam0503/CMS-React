import {
  Grid,
  Stack,
  MenuItem,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import CustomisedDatePicker from "../../../../shared/components/C_DatePicker";
import { Formik } from "formik";
import dayjs, { Dayjs } from "dayjs";
import { bloodGroups, EmploymentType, Gender } from "../../../../../utils/constant/Constant";
import CustomisedButton from "../../../../shared/components/C_Button";
import { CustomisedModal } from "../../../../shared/components/C_Modal";
import { userSchema } from "../../../../../utils/Schema/userSchema";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import { SelectInput } from "../../../../shared/components/form-component/SelectInput";
import { getAllEmployees, updateEmployee, updateOwnProfile } from "../../../employees/employeeServices";
import { useUserDetails } from "../../UserDataProvider";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { setCurrentUser } from "../../../../Redux/Reducers/userSlice";
import { useParams } from "react-router-dom";
import { hasModuleFeaturePermission } from "../../../../../utils/common";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { CompanyCustomAttributeModel, CustomAttributeModel, CustomAttributeValueModel, DepartmentModel, JobTitleResponseModel } from "../../../admin/models";
import { getAllCustomAttributes, getAllDepartments, getCustomAttributeById, getJobTitles } from "../../../admin/adminservices";
import { GetAllEmployeeResponseModel } from "../../../employees/models";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";
import { EditEmployeePayloadModel, EmployeeByIdResponse, EmployeeCustomAttribute } from "../../models";
import React from "react";

import { AppTextField } from "../../../../shared/components/ui";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userData: EmployeeByIdResponse;
}

const transformCustomAttributeData = (attributeListlist: EmployeeCustomAttribute[]) => {
  const updatedAttribute: {
    customAttributeId: string;
    customAttributeValueId: string;
  }[] = [];
  if (attributeListlist.length == 0) return updatedAttribute;
  attributeListlist.forEach(attribute => (
    updatedAttribute.push({
      customAttributeId: attribute.customAttributeId,
      customAttributeValueId: attribute.customAttributeValueId
    })
  ))
  return updatedAttribute;
}

export const UpdateUserInfo: FC<Props> = ({ userData, open, setOpen }) => {
  const { formatMessage: i } = useIntl();
  const { updateUserDetails } = useUserDetails();
  const user = useAppSelector((state) => state.user.userData)!;
  const dispatch = useAppDispatch();
  const employeeId = useParams().employeeid;

  const userPermissions = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
  const hasEditPermission = hasModuleFeaturePermission(ModulesName.Employees, Permission.Edit, userPermissions);
  // Employee-management permission applies to other people.  A manager or HR
  // user must use the same restricted self-service profile flow as an employee.
  const isEditingOwnProfile = !employeeId || employeeId === user.userId;
  const canEditEmploymentDetails = hasEditPermission && !isEditingOwnProfile;
  const [departments, setDepartments] = useState<DepartmentModel[]>([]);
  const [employeeList, setEmployeeList] = useState<GetAllEmployeeResponseModel[]>([]);
  const [jobTitleList, setJobTitleList] = useState<JobTitleResponseModel[]>([]);
  const [allCustomAttributes, setAllCustomAttributes] = useState<CompanyCustomAttributeModel[]>([])
  const { currentLanguage } = useAppLang();
  const defaultLanguage = useAppSelector(state => state.user.userData?.defaultLanguage!);

  const initialValues: EditEmployeePayloadModel = useMemo(
    () => ({
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      email: userData?.email,
      phoneNumber: userData?.phoneNumber,
      address: userData?.address,
      bloodGroup: userData.bloodGroup ?? "",
      dateOfBirth: userData?.dateOfBirth,
      dateOfJoining: userData?.dateOfJoining,
      personalEmail: userData?.personalEmail,
      emergencyContact: userData?.emergencyContact,
      reportingManager: userData.reportingManager,
      department: userData.department ?? "",
      jobRole: userData.jobRole,
      employmentType: userData.employmentType,
      bankAccountNumber: userData.bankAccountNumber,
      panNumber: userData.panNumber,
      roleId: userData.roleId,
      gender: userData.gender,
      customAttributeList: [...transformCustomAttributeData(userData.customAttributes)]
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
    if (values.reportingManager === userData.userId) {
      const employeeName = `${userData.firstName} ${userData.lastName}`.trim();
      toast.error(`${employeeName || "This employee"} cannot be assigned as their own reporting manager. Please select another employee or clear the Reporting Manager field.`);
      setSubmitting(false);
      return;
    }

    try {
      // Editing your own profile (no employeeId in the route) only requires the always-editable
      // self-service fields, so it shouldn't be blocked by the Employees module's Edit permission
      // (that permission is meant for HR/Admins managing *other* employees' records).
      const response = isEditingOwnProfile
        ? await updateOwnProfile({
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth,
          phoneNumber: values.phoneNumber,
          bloodGroup: values.bloodGroup,
          personalEmail: values.personalEmail,
          emergencyContact: values.emergencyContact,
          address: values.address,
        })
        : await updateEmployee(values, userData?.userId);
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
        toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
        handleClose();
      }
      else {
        toast.error(message || i({ id: "ERROR.SOMETHING_WRONG" }));
      }
    } catch (error) {
      console.error((error as Error).message);
      toast.error(i({ id: "ERROR.SOMETHING_WRONG" }));
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
    (async () => {
      try {
        const result = await Promise.allSettled([getAllEmployees(), getJobTitles(), getAllCustomAttributes()]);
        if (result[0].status === "fulfilled") {
          const { success, methodResults } = result[0].value.data;
          if (success) setEmployeeList(methodResults);
        }
        if (result[1].status === "fulfilled") {
          const { success, methodResults } = result[1].value.data;
          if (success) setJobTitleList(methodResults);
        }
        if (result[2].status === "fulfilled") {
          const { success, methodResults } = result[2].value.data;
          if (success) setAllCustomAttributes(methodResults);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [])

  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose} title={i({ id: "PROFILE.PI.TITLE" })}>
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
          }) => {
            return (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({ id: "FORM.FIRST_NAME" })}
                      type="text"
                      name="firstName"
                      placeholder={i({ id: "FORM.FIRST_NAME" })}
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
                      placeholder={i({ id: "FORM.LAST_NAME" })}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      disabled
                      label={i({ id: "FORM.EMAIL" })}
                      type="email"
                      name="email"
                      placeholder={i({ id: "FORM.EMAIL" })}
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
                    <Autocomplete
                      id="job_title"
                      size="small"
                      disabled={!canEditEmploymentDetails}
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
                        <AppTextField
                          {...param}
                          label={i({
                            id: "FORM.JOB_ROLE",
                          })}
                        />
                      )}
                      getOptionLabel={(option) => option.titles[currentLanguage] || option.titles[defaultLanguage] || i({ id: "TRANSLATION_MISSING" })}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <SelectInput
                      name="employmentType"
                      label={i({ id: "FORM.EMPLOYEMENT_TYPE" })}
                      disabled={!canEditEmploymentDetails}
                    >
                      {EmploymentType.map((type) => (
                        <MenuItem
                          key={type.id}
                          value={type.value}
                        >
                          {i({ id: type.label })}
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
                      disabled={!canEditEmploymentDetails}
                      value={employeeList.find((emp) => emp.userId === values.reportingManager) || null}
                      options={employeeList.filter((employee) => employee.userId !== userData.userId)}
                      onChange={(event, value) => {
                        setFieldTouched("reportingManager", true);
                        setFieldValue(
                          "reportingManager",
                          value ? value.userId : null
                        );
                      }}
                      renderInput={(param) => (
                        <AppTextField
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
                    <SelectInput
                      name="department"
                      label={i({ id: "FORM.DEPARTMENT" })}
                      disabled={!canEditEmploymentDetails}
                    >
                      {departments.map((dep) => (
                        <MenuItem
                          key={dep.departmentId}
                          value={dep.departmentId}
                        >
                          {dep.titles[currentLanguage] || dep.titles[defaultLanguage] || <FormattedMessage id={"TRANSLATION_MISSING"} />}
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
                      type="email"
                      name="personalEmail"
                      placeholder={i({ id: "USER.PERSONAL_EMAIL" })}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextInput
                      label={i({ id: "USER.EMERGENCY_CONTACT" })}
                      type="text"
                      name="emergencyContact"
                      placeholder={i({ id: "USER.EMERGENCY_CONTACT" })}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
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
                    <CustomisedDatePicker
                      label={i({ id: "FORM.DOB" })}
                      name="dateOfBirth"
                      value={values?.dateOfBirth ? dayjs(values?.dateOfBirth) : null}
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("dateOfBirth", true);
                        setFieldValue("dateOfBirth", newDate?.format('YYYY-MM-DD'));
                      }}
                      maxDate={dayjs().subtract(18, 'year')}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <CustomisedDatePicker
                      label={i({ id: "FORM.DOJ" })}
                      name="dateOfJoining"
                      value={values?.dateOfJoining ? dayjs(values?.dateOfJoining) : null}
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("dateOfJoining", true);
                        setFieldValue("dateOfJoining", newDate?.format('YYYY-MM-DD'));
                      }}
                      maxDate={dayjs()}
                      disabled={!canEditEmploymentDetails}
                    />
                  </Grid>
                  {
                    canEditEmploymentDetails &&
                    <>
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
                    </>
                  }

                </Grid>
                {
                  canEditEmploymentDetails &&

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {
                      allCustomAttributes.length > 0 &&
                      allCustomAttributes.map(attribute => (
                        <UserCustomAttribute key={attribute.customAttributeId} attribute={attribute} userCustomAttribute={values.customAttributeList} setFieldValue={setFieldValue} />
                      ))
                    }
                  </Grid>
                }

                <Stack
                  direction="row"
                  className="justify-content-end mt-4 gap-2"
                >
                  <CustomisedButton
                    label={i({ id: "BUTTON.CLOSE" })}
                    handleClick={handleClose}
                    variant="outlined"
                  />
                  <CustomisedButton
                    loading={isSubmitting}
                    label={i({ id: "BUTTON.SAVE" })}
                    type="submit"
                    disabled={!(isValid && dirty) || isSubmitting}
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


type PropsType = {
  attribute: CompanyCustomAttributeModel,
  userCustomAttribute: Pick<EmployeeCustomAttribute, "customAttributeId" | "customAttributeValueId">[],
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void
}

const UserCustomAttribute = (props: PropsType) => {
  const { attribute, userCustomAttribute, setFieldValue } = props;
  const { formatMessage: i } = useIntl();
  const [state, setState] = useState({ open: false, loading: false });
  const { currentLanguage } = useAppLang();
  const [customAttributeData, setCustomAttributeData] = useState<CustomAttributeModel>({} as CustomAttributeModel);

  const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage!);

  const handleListOpen = async () => {
    setState({ ...state, loading: true })
    // fetch custom attribute data by id   
    try {
      const { data } = await getCustomAttributeById(attribute.customAttributeId, true);
      if (data.success) {
        setState({ ...state, open: true })
        setCustomAttributeData(data.methodResult);
      }
    } catch (error) {
      console.error((error as Error).message);
    }
    finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleValueChange = (event: React.SyntheticEvent<Element, Event>, value: CustomAttributeValueModel | null) => {
    const index = userCustomAttribute.findIndex(ca => ca.customAttributeId === attribute.customAttributeId);
    if (value !== null) {
      if (index !== -1) {
        const result = userCustomAttribute.map(at => {
          if (at.customAttributeId === attribute.customAttributeId) {
            return {
              customAttributeId: attribute.customAttributeId,
              customAttributeValueId: value.customAttributeValueId
            }
          } else {
            return at;
          }
        })
        setFieldValue("customAttributeList", result);
      } else {
        setFieldValue("customAttributeList", [...userCustomAttribute, {
          customAttributeId: attribute.customAttributeId,
          customAttributeValueId: value.customAttributeValueId
        }])
      }
    } else {
      if (index !== -1) {
        setFieldValue("customAttributeList", userCustomAttribute.filter(at => at.customAttributeId !== attribute.customAttributeId));
      }
    }
  }
  const handleClose = () => {
    setState({ ...state, open: false })
  }

  const getCurrentValue = (): CustomAttributeValueModel | null => {
    if (!customAttributeData || !Array.isArray(customAttributeData.customAttributeValues)) {
      return null;
    }

    const data = userCustomAttribute.find(
      ca => ca.customAttributeId === attribute.customAttributeId
    );

    if (!data) return null;

    return customAttributeData.customAttributeValues.find(
      item => item.customAttributeValueId === data.customAttributeValueId
    ) || null;
  };


  return (
    <Grid
      size={{
        xs: 12,
        sm: 6
      }}>
      <Autocomplete
        id="custom-attribute"
        size="small"
        open={state.open}
        onOpen={handleListOpen}
        onClose={handleClose}
        loading={state.loading}
        value={getCurrentValue()}
        forcePopupIcon={!state.loading}
        isOptionEqualToValue={(option, value) =>
          option.customAttributeValueId === value.customAttributeValueId
        }
        options={customAttributeData.customAttributeValues || []}
        onChange={handleValueChange}
        getOptionLabel={option => option.titles[currentLanguage] ?? option.titles[defaultLang] ?? ""}
        getOptionKey={option => option.customAttributeValueId!}
        renderInput={(param) => (
          <AppTextField
            {...param}
            label={attribute.customAttributeTitle[currentLanguage] ?? `${i({ id: "COMPANY_MASTER.CUSTOM_ATTRIBUTE.TITLE" })} ${attribute.customAttributeNumber}`}
            slotProps={{
              input: {
                ...param.InputProps,
                endAdornment: (
                  <>
                    {state.loading ? <CircularProgress sx={{ mr: 1 }} size={20} /> : null}
                    {param.InputProps.endAdornment}
                  </>
                ),
              }
            }}
          />
        )}
      />
    </Grid>
  );
}

