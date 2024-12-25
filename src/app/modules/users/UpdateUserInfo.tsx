import { Edit } from "@mui/icons-material";
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
import { employeeSchema } from "../employees/employeeFormSchema";
import { useUserDetails } from "./UserDataProvider";
import { CustomisedModal } from "../components/CustomizedModal";
import dayjs, { Dayjs } from "dayjs";
import { bloodGroups, Gender } from "../../../Constant";
const style = {
  width: 800,
  boxShadow: 24,
  borderRadius: 2,
};

type PropsType = {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function UserInfo(props: PropsType) {
  const intl = useIntl();
  const { open, setOpen } = props;
  const userData = useUserDetails();
  const currentUser = userData?.userDetails;

  const initialValues = {
    email: currentUser?.email,
    phoneNumber: currentUser?.phoneNumber,
    dateOfBirth: currentUser?.dateOfBirth,
    gender: currentUser?.gender,
    languagesKnown: currentUser?.languagesKnown,
    personalEmail: currentUser?.personalEmail,
    emergencyContact: currentUser?.emergencyContact,
    bloodGroup: currentUser?.bloodGroup,
    address: currentUser?.address
  }

  function handleUserDataUpdate(values: typeof initialValues) {
    console.log(values);
  }

  const { values, touched, errors, isSubmitting, handleSubmit, getFieldProps } = useFormik({
    initialValues: initialValues,
    validationSchema: employeeSchema,
    onSubmit: (values, { setSubmitting }) => {
      handleUserDataUpdate(values);
      setSubmitting(false)
    },
  });

  function handleClose() {
    setOpen(false);
  }

  function setNewDob(newDate: Dayjs | null) {
    values.dateOfBirth = newDate;
  }

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Box sx={style}>
        <form onSubmit={handleSubmit}>
          <Grid container className="d-flex mt-2">
            <Stack>
              <Typography variant="h5" className="text-primary mb-2">
                {intl.formatMessage({ id: "PROFILE.PI" })}
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">Email address</Typography>
                <TextField
                  fullWidth
                  placeholder="Email"
                  variant="outlined"
                  error={touched.email && Boolean(errors.email)}
                  {...getFieldProps('email')}
                  helperText={(touched.email && errors.email) && errors.email}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Phone number</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                  {...getFieldProps("phoneNumber")}
                  helperText={(touched.phoneNumber && errors.phoneNumber) && errors.phoneNumber}
                />
              </Grid>
              <Grid item xs={6} className="pt-2">
                <Typography variant="body1">Date of birth</Typography>
                <CustomisedDatePicker
                  name="dateOfBirth"
                  value={dayjs(currentUser?.dateOfBirth)}
                  setValue={setNewDob}
                  maxDate={dayjs()}
                />
                <FormHelperText sx={{ color: '#d32f2f' }}>{(touched.dateOfBirth && errors.dateOfBirth) && errors.dateOfBirth}</FormHelperText>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Gender</Typography>
                <Select
                  fullWidth
                  error={touched.gender && Boolean(errors.gender)}
                  {...getFieldProps('gender')}
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

              <Grid item xs={6}>
                <Typography variant="body1">Languages Known</Typography>
                <TextField
                  fullWidth
                  placeholder="Please write languages seperated by comma."
                  variant="outlined"
                  {...getFieldProps("languagesKnown")}
                />
                <FormHelperText sx={{ color: "#d32f2f" }}>{(touched.languagesKnown && errors.languagesKnown) && errors.languagesKnown}</FormHelperText>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Personal Email</Typography>
                <TextField
                  fullWidth
                  error={touched.personalEmail && Boolean(errors.personalEmail)}
                  variant="outlined"
                  helperText={touched.personalEmail && errors.personalEmail && errors.personalEmail}
                  {...getFieldProps('personalEmail')}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1">Emergency contact</Typography>
                <TextField
                  fullWidth
                  placeholder="Emergency Contact"
                  error={touched.emergencyContact && Boolean(errors.emergencyContact)}
                  helperText={(touched.emergencyContact && errors.emergencyContact) && errors.emergencyContact}
                  variant="outlined"
                  {...getFieldProps('emergencyContact')}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">Blood Group</Typography>
                <Select
                  fullWidth
                  error={touched.bloodGroup && Boolean(errors.bloodGroup)}
                  {...getFieldProps('bloodGroup')}
                >
                  <MenuItem value={""}>None</MenuItem>
                  {
                    bloodGroups.map(item => (
                      <MenuItem key={item.id} value={item.value}>{item.label}</MenuItem>
                    ))
                  }
                </Select>
                <FormHelperText sx={{ color: "#d32f2f" }}>{(touched.bloodGroup && errors.bloodGroup) && errors.bloodGroup}</FormHelperText>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">Address</Typography>
                <TextField
                  fullWidth
                  error={touched.address && Boolean(errors.address)}
                  helperText={(touched.address && errors.address) && errors.address}
                  {...getFieldProps('address')}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button variant="contained" className="me-4 bg-primary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" className="bg-primary" disabled={isSubmitting}>
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>
    </CustomisedModal>
  );
}
