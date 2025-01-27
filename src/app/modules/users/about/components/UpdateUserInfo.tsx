import {
  Grid,
  Stack,
  Box,
  Typography,
  FormHelperText,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../../components/CustomisedDatePicker";
import { Formik } from "formik";

import { useUserDetails } from "../../UserDataProvider";
import dayjs, { Dayjs } from "dayjs";
import { bloodGroups } from "../../../../../utils/constant/Constant";
import CustomisedButton from "../../../components/CustomisedButton";
import { CustomisedModal } from "../../../components/CustomisedModal";
import { userSchema } from "../../../../../utils/Schema/userSchema";
import { useAppSelector } from "../../../../Redux/hooks";
import { CustomIconButton } from "../../../components/CustomIconButton";
import { Edit } from "@mui/icons-material";
import { TextInput } from "../../../components/form_component/TextInput";
import { SelectInput } from "../../../components/form_component/SelectInput";

export const UpdateUserInfo = () => {
  const intl = useIntl();
  const token = useAppSelector((state) => state.auth.token)!;
  const {
    userDetails: { userPersonalDetails: currentUser },
  } = useUserDetails();
  const [open, setOpen] = useState(false);

  const initialValues = {
    firstName: currentUser?.firstName,
    lastName: currentUser?.lastName,
    email: currentUser?.email,
    phoneNumber: currentUser?.phoneNumber,
    dateOfBirth: currentUser?.dateOfBirth,
    personalEmail: currentUser?.personalEmail,
    emergencyContact: currentUser?.emergencyContact,
    bloodGroup: currentUser?.bloodGroup,
    address: currentUser?.address,
  };

  function handleClose() {
    setOpen(false);
  }

  function handleUserDetailUpdate(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    const payload = {
      ...values,
    };
    setTimeout(() => {
      // logic for updating user details
    }, 2000);
  }
  return (
    <>
      <CustomIconButton
        tooltip="Edit"
        icon={<Edit />}
        handleClick={() => setOpen(true)}
      />
      <CustomisedModal open={open} handleClose={handleClose}>
        <Typography variant="h5" mb={2}>
          {intl.formatMessage({ id: "PROFILE.PI" })}
        </Typography>
        <Box>
          <Formik
            initialValues={initialValues}
            validationSchema={userSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleUserDetailUpdate(values, setSubmitting);
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
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={12} md={6}>
                    <TextInput
                      label={intl.formatMessage({ id: "USER.FIRST_NAME" })}
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextInput
                      label={intl.formatMessage({ id: "USER.LAST_NAME" })}
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body1">
                        {intl.formatMessage({ id: "USER.DOB" })}
                      </Typography>
                      <CustomisedDatePicker
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
                  <Grid item xs={12} md={6}>
                    <TextInput
                      label={intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                      type="email"
                      name="email"
                      placeholder="Email"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextInput
                      label={intl.formatMessage({ id: "USER.PHONE" })}
                      type="text"
                      name="phoneNumber"
                      placeholder="Phone Number"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
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

                  <Grid item xs={12} md={6}>
                    <TextInput
                      label={intl.formatMessage({
                        id: "USER.PERSONAL_EMAIL",
                      })}
                      type="email"
                      name="personalEmail"
                      placeholder="Personal Email"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
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
                    label="Cancel"
                    handleClick={handleClose}
                    variant="outlined"
                  />
                  <CustomisedButton
                    label="Save"
                    type="submit"
                    variant="contained"
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
