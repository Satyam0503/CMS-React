import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { getUserByToken, register } from "../core/_requests";
import { Link } from "react-router-dom";
import { PasswordMeterComponent } from "../../../../_themes/assets/ts/components";
import { useAuth } from "../core/Auth";
import {
  Box,
  Checkbox,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../components/CustomisedButton";
import { colors } from "../../theme/MuiTheme";
import { AccountCircle, Check } from "@mui/icons-material";
import { registrationSchema } from "../../../../utils/Schema/registrationSchema";

const initialValues = {
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  password: "",
  changePassword: "",
  acceptTerms: false,
};

export function Registration() {
  const [loading, setLoading] = useState(false);
  const { saveAuth, setCurrentUser } = useAuth();
  const intl = useIntl();
  const {
    values,
    touched,
    getFieldProps,
    isValid,
    dirty,
    handleSubmit,
    errors,
    resetForm,
    handleChange,
    handleBlur
  } = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        const { data: auth } = await register(
          values.email,
          values.firstName,
          values.lastName,
          values.password,
          values.changePassword
        );
        saveAuth(auth);
        const { data: user } = await getUserByToken(auth.api_token);
        setCurrentUser(user.methodResult);
      } catch (error) {
        console.error(error);
        saveAuth(undefined);
        setStatus("The registration details is incorrect");
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    PasswordMeterComponent.bootstrap();
  }, []);

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <Stack alignItems={"center"} mb={4}>
          <Typography variant="h3">
            {intl.formatMessage({ id: "AUTH.REGISTER.TITLE" })}
          </Typography>
          <Typography variant="body1" color={colors.alpha.primary[500]}>
            {intl.formatMessage({ id: "AUTH.REGISTER.CMS" })}
          </Typography>
        </Stack>
        <Stack spacing={1}>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.FIRST_NAME" })}
            </Typography>
            <TextField
              fullWidth
              placeholder="First Name"
              type="text"
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Check />
                  </InputAdornment>
                ),
              }}
              {...getFieldProps("firstName")}
              helperText={
                touched.firstName && errors.firstName && errors.firstName
              }
              error={touched.firstName && Boolean(errors.firstName)}
            />
          </Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.LAST_NAME" })}
            </Typography>
            <TextField
              fullWidth
              placeholder="Last Name"
              type="text"
              autoComplete="off"
              error={touched.lastName && Boolean(errors.lastName)}
              helperText={
                touched.lastName && errors.lastName && errors.lastName
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Check />
                  </InputAdornment>
                ),
              }}
              {...getFieldProps("lastName")}
            />
          </Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "COMPANY.NAME" })}
            </Typography>

            <TextField
              fullWidth
              placeholder="Company Name"
              type="text"
              autoComplete="off"
              variant="outlined"
              {...getFieldProps("companyName")}
              error={touched.companyName && Boolean(errors.companyName)}
              helperText={
                touched.companyName && errors.companyName && errors.companyName
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Check />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
            </Typography>
            <TextField
              fullWidth
              placeholder="Email Id"
              type="email"
              autoComplete="off"
              variant="outlined"
              {...getFieldProps("email")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Check />
                  </InputAdornment>
                ),
              }}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email && errors.email}
            />
          </Stack>

          <Stack>
            <Stack data-kt-password-meter="true">
              <Typography variant="body1">
                {intl.formatMessage({ id: "AUTH.INPUT.PASSWORD" })}
              </Typography>
              <Stack>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Check />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  autoComplete="off"
                  {...getFieldProps("password")}
                  error={touched.password && Boolean(errors.password)}
                  helperText={
                    touched.password && errors.password && errors.password
                  }
                />
              </Stack>

              <Grid
                container
                alignItems={"center"}
                my={1}
                data-kt-password-meter-control="highlight"
              >
                <Stack
                  flexGrow={1}
                  bgcolor={colors.alpha.secondary[500]}
                  className="bg-active-success"
                  sx={{
                    mr: 1,
                    height: "5px",
                    borderRadius: "8px",
                    "&:active": {
                      bgcolor: colors.alpha.success[500],
                    },
                  }}
                />
                <Stack
                  flexGrow={1}
                  bgcolor={colors.alpha.secondary[500]}
                  className="bg-active-success"
                  sx={{
                    mr: 1,
                    height: "5px",
                    borderRadius: "8px",
                    "&:active": {
                      bgcolor: colors.alpha.success[500],
                    },
                  }}
                />
                <Stack
                  flexGrow={1}
                  bgcolor={colors.alpha.secondary[500]}
                  className="bg-active-success"
                  sx={{
                    mr: 1,
                    height: "5px",
                    borderRadius: "8px",
                    "&:active": {
                      bgcolor: colors.alpha.success[500],
                    },
                  }}
                />
                <Stack
                  flexGrow={1}
                  bgcolor={colors.alpha.secondary[500]}
                  className="bg-active-success"
                  sx={{
                    mr: 1,
                    height: "5px",
                    borderRadius: "8px",
                    "&:active": {
                      bgcolor: colors.alpha.success[500],
                    },
                  }}
                />
              </Grid>
            </Stack>
            <Stack>
              <Typography variant="body2">
                {intl.formatMessage({ id: "PASSWORD.LENGTH" })}
              </Typography>
            </Stack>
          </Stack>

          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "PASSWORD.CONFIRMATION" })}
            </Typography>
            <TextField
              sx={{ my: 1 }}
              fullWidth
              type="password"
              placeholder="Password confirmation"
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Check />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              {...getFieldProps("changePassword")}
              error={touched.password && Boolean(errors.password)}
              helperText={
                touched.password && errors.password && errors.password
              }
            />
          </Stack>

          <Stack>
            <Typography>
              <Checkbox checked={values.acceptTerms} name="acceptTerms" onChange={handleChange} onBlur={handleBlur} />
              <Box component="span">
                I Accept the <a target="_blank">Terms</a>.
              </Box>
            </Typography>
            <FormHelperText>
              {touched.acceptTerms && errors.acceptTerms && errors.acceptTerms}
            </FormHelperText>
          </Stack>

          <Stack spacing={1}>
            <CustomisedButton label="Submit" size="large" type="submit" />
            <CustomisedButton
              handleClick={() => resetForm()}
              variant="outlined"
              label="Reset"
              size="large"
              type="button"
            />
          </Stack>
        </Stack>
      </form>
    </Container>
  );
}
