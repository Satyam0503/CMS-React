import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { registerCompany } from "../core/_requests";
import { Link, useNavigate } from "react-router-dom";
import { PasswordMeterComponent } from "../../../../_themes/assets/ts/components";
import {
  Box,
  Checkbox,
  FormHelperText,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../components/CustomisedButton";
import { colors } from "../../theme/MuiTheme";
import { Check, ErrorOutline } from "@mui/icons-material";
import { registrationSchema } from "../../../../utils/Schema/registrationSchema";
import { toast } from "react-toastify";

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
  const navigate = useNavigate();
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
    isSubmitting,
    status,
  } = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        companyName: values.companyName,
        email: values.email,
        password: values.password,
      };
      try {
        const { data } = await registerCompany(payload);
        if (!data.success) {
          throw new Error(data.message);
        }
        toast.success("Successfully registered");
        setSubmitting(false);
        setLoading(false);
        setStatus("");
        navigate("/auth/login", { replace: true });
      } catch (error: any) {
        setStatus(error.message);
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    PasswordMeterComponent.bootstrap();
  }, []);
  return (
    <Stack spacing={4}>
      <Stack sx={{ alignItems: "center" }}>
        <Typography variant="h3">
          {intl.formatMessage({ id: "AUTH.REGISTER.TITLE" })}
        </Typography>
        <Typography variant="body1" color={colors.alpha.primary[500]}>
          {intl.formatMessage({ id: "AUTH.REGISTER.CMS" })}
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {status && (
            <Grid className="mb-lg-15 alert alert-danger">
              <Grid className="alert-text font-weight-bold">{status}</Grid>
            </Grid>
          )}
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
                    {touched.firstName && errors.firstName ? (
                      <ErrorOutline color="warning" />
                    ) : touched.firstName && !errors.firstName ? (
                      <Check color="success" />
                    ) : null}
                  </InputAdornment>
                ),
              }}
              {...getFieldProps("firstName")}
              error={touched.firstName && Boolean(errors.firstName)}
              helperText={
                touched.firstName && errors.firstName && errors.firstName
              }
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
                    {touched.lastName && errors.lastName ? (
                      <ErrorOutline color="warning" />
                    ) : touched.lastName && !errors.lastName ? (
                      <Check color="success" />
                    ) : null}
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
                    {touched.companyName && errors.companyName ? (
                      <ErrorOutline color="warning" />
                    ) : touched.companyName && !errors.companyName ? (
                      <Check color="success" />
                    ) : null}
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
                    {touched.email && errors.email ? (
                      <ErrorOutline color="warning" />
                    ) : touched.email && !errors.email ? (
                      <Check color="success" />
                    ) : null}
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
              <TextField
                fullWidth
                type="password"
                placeholder="Password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {touched.password && errors.password ? (
                        <ErrorOutline color="warning" />
                      ) : touched.password && !errors.password ? (
                        <Check color="success" />
                      ) : null}
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
              fullWidth
              type="password"
              placeholder="Password confirmation"
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {touched.changePassword && errors.changePassword ? (
                      <ErrorOutline color="warning" />
                    ) : touched.changePassword && !errors.changePassword ? (
                      <Check color="success" />
                    ) : null}
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              {...getFieldProps("changePassword")}
              error={touched.changePassword && Boolean(errors.changePassword)}
              helperText={
                touched.changePassword &&
                errors.changePassword &&
                errors.changePassword
              }
            />
          </Stack>

          <Stack>
            <Typography>
              <Checkbox
                checked={values.acceptTerms}
                {...getFieldProps("acceptTerms")}
              />
              <Box component="span">
                I Accept the
                <Link to="#"> Terms and Conditions</Link>
              </Box>
            </Typography>
            <FormHelperText>
              {touched.acceptTerms && errors.acceptTerms && errors.acceptTerms}
            </FormHelperText>
          </Stack>

          <Stack spacing={1}>
            <CustomisedButton
              disabled={!(dirty && isValid) || isSubmitting}
              label="Submit"
              size="large"
              type="submit"
              loading={loading}
            />
            <CustomisedButton
              handleClick={() => resetForm()}
              variant="outlined"
              label="Reset"
              size="large"
              type="button"
            />
            <Typography variant="body2" align="center">
              Already Register ?<Link to={"/auth/login"}> Sign In</Link>
            </Typography>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}
