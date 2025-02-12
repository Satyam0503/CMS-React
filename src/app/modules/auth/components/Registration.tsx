import { useState, useEffect } from "react";
import { Formik, useFormik } from "formik";
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
import { TextInput } from "../../components/form_component/TextInput";

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

  async function handleRegistration(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: any) => void
  ) {
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
      toast.success("Successfully Registered");
      setStatus("");
      navigate("/auth/login", { replace: true });
    } catch (error: any) {
      setStatus(error.message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }

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
      <Formik
        initialValues={initialValues}
        validationSchema={registrationSchema}
        onSubmit={(values, { setSubmitting, setStatus }) => {
          handleRegistration(values, setSubmitting, setStatus);
        }}
      >
        {({
          values,
          status,
          isValid,
          dirty,
          isSubmitting,
          touched,
          errors,
          handleSubmit,
          getFieldProps,
          resetForm,
        }) => (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {status && (
                <Grid className="mb-lg-15 alert alert-danger">
                  <Grid className="alert-text font-weight-bold">{status}</Grid>
                </Grid>
              )}
              <Stack>
                <TextInput
                  type="text"
                  name="firstName"
                  label={intl.formatMessage({ id: "USER.FIRST_NAME" })}
                  placeholder="First Name"
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
                />
              </Stack>

              <Stack>
                <TextInput
                  type="text"
                  name="lastName"
                  label={intl.formatMessage({ id: "USER.LAST_NAME" })}
                  placeholder="Last Name"
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
                />
              </Stack>

              <Stack>
                <TextInput
                  type="text"
                  name="companyName"
                  label={intl.formatMessage({ id: "COMPANY.NAME" })}
                  placeholder="Company Name"
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
                <TextInput
                  type="email"
                  name="email"
                  label={intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                  placeholder="Email"
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
                />
              </Stack>

              <Stack>
                <Stack data-kt-password-meter="true">
                  <TextInput
                    type="password"
                    name="password"
                    label={intl.formatMessage({ id: "AUTH.INPUT.PASSWORD" })}
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
                <TextInput
                  type="password"
                  name="changePassword"
                  label={intl.formatMessage({ id: "PASSWORD.CONFIRMATION" })}
                  placeholder="Password Confirmation"
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
                />
                <Typography variant="body1"></Typography>
              </Stack>

              <Stack direction={"row"} alignItems={"center"} className="ms-n2">
                <Checkbox
                  checked={values.acceptTerms}
                  {...getFieldProps("acceptTerms")}
                />
                <Typography variant="body1">
                  <Box component="span">
                    I Accept the
                    <Link to="#"> Terms and Conditions</Link>
                  </Box>
                </Typography>

                <FormHelperText>
                  {touched.acceptTerms &&
                    errors.acceptTerms &&
                    errors.acceptTerms}
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
        )}
      </Formik>
    </Stack>
  );
}
