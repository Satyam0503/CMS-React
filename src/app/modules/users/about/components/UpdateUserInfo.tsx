import {
  Grid,
  Stack,
  Box,
  Typography,
  FormHelperText,
  MenuItem,
} from "@mui/material";
import { FC, useMemo } from "react";
import { useIntl } from "react-intl";
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
import { updateEmployee } from "../../../employees/employeeServices";
import { useUserDetails } from "../../UserDataProvider";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { setCurrentUser } from "../../../../Redux/Reducers/userSlice";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userData: EmployeeModel;
}

export const UpdateUserInfo: FC<Props> = ({ userData, open, setOpen }) => {
  const intl = useIntl();
  const { updateUserDetails } = useUserDetails();
  const user = useAppSelector((state) => state.user.userData)!;
  const dispatch = useAppDispatch();

  const initialValues = useMemo(
    () => ({
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      email: userData?.email,
      phoneNumber: userData?.phoneNumber,
      dateOfBirth: userData?.dateOfBirth,
      personalEmail: userData?.personalEmail,
      emergencyContact: userData?.emergencyContact,
      bloodGroup: userData?.bloodGroup,
      address: userData?.address,
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
    const payload = {
      ...userData,
      ...values,
    };
    delete payload.fullProfileUrl;
    delete payload.profileUrl;

    try {
      const response = await updateEmployee(payload, userData.userId);
      const { success, statusCode, methodResult, message } = response.data;
      if (success && statusCode === 200) {
        updateUserDetails(methodResult);
        dispatch(
          setCurrentUser({
            ...user,
            firstName: methodResult.firstName,
            lastName: methodResult.lastName,
            fullName: methodResult.firstName + " " + methodResult.lastName,
          })
        );
        toast.success(message);
        handleClose();
      }
    } catch (error: unknown) {
      console.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

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
              errors,
              touched,
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
                    <Stack>
                      <CustomisedDatePicker
                        label="Date of birth"
                        name="dateOfBirth"
                        value={dayjs(values?.dateOfBirth)}
                        setValue={(newDate: Dayjs | null) => {
                          setFieldTouched("dateOfBirth", true);
                          setFieldValue("dateOfBirth", newDate);
                        }}
                        maxDate={dayjs()}
                      />
                    </Stack>
                    <FormHelperText>
                      {touched.dateOfBirth &&
                        errors.dateOfBirth &&
                        errors.dateOfBirth}
                    </FormHelperText>
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
                      type="email"
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

                  <Grid item xs={12}>
                    <TextInput
                      label={intl.formatMessage({ id: "USER.ADDRESS" })}
                      type="text"
                      name="address"
                      placeholder="Address "
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
