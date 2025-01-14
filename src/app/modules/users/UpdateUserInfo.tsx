import {
  Grid,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  FormHelperText,
  Select,
  MenuItem,
} from "@mui/material";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../components/CustomisedDatePicker";
import { useFormik } from "formik";

import { useUserDetails } from "./UserDataProvider";
import dayjs, { Dayjs } from "dayjs";
import { bloodGroups, Gender } from "../../../utils/constant/Constant";
import { updateUserDetails } from "./userservices";
import { toast } from "react-toastify";
import CustomisedButton from "../components/CustomisedButton";
import { CustomisedModal } from "../components/CustomisedModal";
import { userSchema } from "../../../utils/Schema/userSchema";

type PropsType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

//  get the token and user id from store
const token = JSON.parse(localStorage.getItem("kt-auth-react-v") || "{}");
const id = "92fb9794-31c8-4b55-a4b4-dfa74c6cb007";

export default function UserInfo(props: PropsType) {
  const intl = useIntl();
  const { userDetails: currentUser, setRefresh, isRefresh } = useUserDetails();
  const { open, setOpen } = props;

  const initialValues = {
    firstName: currentUser?.firstName,
    lastName: currentUser?.lastName,
    email: currentUser?.email,
    phoneNumber: currentUser?.phoneNumber,
    dateOfBirth: currentUser?.dateOfBirth,
    // gender: currentUser?.gender,
    // languagesKnown: currentUser?.languagesKnown,
    personalEmail: currentUser?.personalEmail,
    emergencyContact: currentUser?.emergencyContact,
    bloodGroup: currentUser?.bloodGroup,
    address: currentUser?.address,
  };

  function handleClose() {
    setOpen(false);
  }

  const {
    values,
    touched,
    errors,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    setFieldTouched,
    setFieldValue,
    isValid,
    dirty,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: userSchema,
    onSubmit: (values, { setSubmitting }) => {
      handleUserDataUpdate(values, setSubmitting);
    },
  });

  const handleDateChange = (fieldName: string) => {
    return (newDate: Dayjs | null) => {
      setFieldTouched(fieldName, true);
      setFieldValue(fieldName, newDate);
    };
  };

  function handleUserDataUpdate(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    const payload = {
      ...values,
    };
    setTimeout(() => {
      updateUserDetails(id, payload, token)
        .then((res) => {
          const { success, message } = res.data;
          if (success) {
            setRefresh(!isRefresh);
            setSubmitting(false);
            handleClose();
            toast.success(message);
          }
        })
        .catch((error) => {
          console.log(error);
          handleClose();
          setSubmitting(false);
          toast.error("Failed To Update User Details.");
        });
    }, 2000);
  }
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Box>
        <form onSubmit={handleSubmit}>
          <Grid container display={"flex"}>
            <Grid item xs={12}>
              <Typography variant="h5">
                {intl.formatMessage({ id: "PROFILE.PI" })}
              </Typography>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {" "}
                  {intl.formatMessage({ id: "USER.FIRST_NAME" })}
                </Typography>
                <TextField
                  fullWidth
                  placeholder="First Name"
                  variant="outlined"
                  error={touched.firstName && Boolean(errors.firstName)}
                  {...getFieldProps("firstName")}
                  helperText={
                    touched.firstName && errors.firstName && errors.firstName
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {" "}
                  {intl.formatMessage({ id: "USER.LAST_NAME" })}
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Last Name"
                  variant="outlined"
                  error={touched.lastName && Boolean(errors.lastName)}
                  {...getFieldProps("lastName")}
                  helperText={
                    touched.lastName && errors.lastName && errors.lastName
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {" "}
                  {intl.formatMessage({ id: "USER.DOB" })}
                </Typography>
                <CustomisedDatePicker
                  name="dateOfBirth"
                  value={dayjs(values?.dateOfBirth)}
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
                  {" "}
                  {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Email"
                  variant="outlined"
                  error={touched.email && Boolean(errors.email)}
                  {...getFieldProps("email")}
                  helperText={touched.email && errors.email && errors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {" "}
                  {intl.formatMessage({ id: "USER.PHONE" })}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                  {...getFieldProps("phoneNumber")}
                  helperText={
                    touched.phoneNumber &&
                    errors.phoneNumber &&
                    errors.phoneNumber
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {" "}
                  {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
                </Typography>
                <Select
                  fullWidth
                  error={touched.bloodGroup && Boolean(errors.bloodGroup)}
                  {...getFieldProps("bloodGroup")}
                >
                  <MenuItem value={""}>None</MenuItem>
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
                  {" "}
                  {intl.formatMessage({ id: "USER.PERSONAL.EMAIL" })}
                </Typography>
                <TextField
                  fullWidth
                  error={touched.personalEmail && Boolean(errors.personalEmail)}
                  variant="outlined"
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
                  {" "}
                  {intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Emergency Contact"
                  error={
                    touched.emergencyContact && Boolean(errors.emergencyContact)
                  }
                  helperText={
                    touched.emergencyContact &&
                    errors.emergencyContact &&
                    errors.emergencyContact
                  }
                  variant="outlined"
                  {...getFieldProps("emergencyContact")}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1">
                  {" "}
                  {intl.formatMessage({ id: "USER.ADDRESS" })}
                </Typography>
                <TextField
                  fullWidth
                  error={touched.address && Boolean(errors.address)}
                  helperText={
                    touched.address && errors.address && errors.address
                  }
                  {...getFieldProps("address")}
                />
              </Grid>
              <Grid item xs={12} display={"flex"} justifyContent={"flex-end"}>
                <Stack
                  spacing={1}
                  direction={"row"}
                  justifyContent={"flex-end"}
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
                    disabled={ !(isValid && dirty) || isSubmitting}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>
    </CustomisedModal>
  );
}
