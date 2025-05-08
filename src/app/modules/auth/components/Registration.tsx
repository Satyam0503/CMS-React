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
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { colors } from "../../theme/MuiTheme";
import { Check, ErrorOutline } from "@mui/icons-material";
import { registrationSchema } from "../../../../utils/Schema/registrationSchema";
import { toast } from "react-toastify";
import { TextInput } from "../../../shared/components/form-component/TextInput";

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
  const navigate = useNavigate();
  const intl = useIntl();

  async function handleRegistration(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: any) => void
  ) {
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
        <Typography variant="body1" color={colors.primary[500]}>
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
                  <Grid className="alert-text" fontWeight={600}>
                    {status}
                  </Grid>
                </Grid>
              )}
              <Stack>
                <TextInput
                  type="text"
                  name="firstName"
                  label={intl.formatMessage({ id: "FORM.FIRST_NAME" })}
                  placeholder={intl.formatMessage({ id: "FORM.FIRST_NAME" })}
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
                  label={intl.formatMessage({ id: "FORM.LAST_NAME" })}
                  placeholder={intl.formatMessage({ id: "FORM.LAST_NAME" })}
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
                  label={intl.formatMessage({ id: "FORM.COMPANY_NAME" })}
                  placeholder={intl.formatMessage({ id: "FORM.COMPANY_NAME" })}
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
                  label={intl.formatMessage({ id: "FORM.EMAIL" })}
                  placeholder={intl.formatMessage({ id: "FORM.EMAIL" })}
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
                    label={intl.formatMessage({ id: "FORM.PASSWORD" })}
                    placeholder={intl.formatMessage({ id: "FORM.PASSWORD" })}
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
                      bgcolor={colors.secondary[500]}
                      className="bg-active-success"
                      sx={{
                        mr: 1,
                        height: "5px",
                        borderRadius: "8px",
                        "&:active": {
                          bgcolor: 'success.main',
                        },
                      }}
                    />
                    <Stack
                      flexGrow={1}
                      bgcolor={'secondary.main'}
                      className="bg-active-success"
                      sx={{
                        mr: 1,
                        height: "5px",
                        borderRadius: "8px",
                        "&:active": {
                          bgcolor: 'success.main',
                        },
                      }}
                    />
                    <Stack
                      flexGrow={1}
                      bgcolor={'secondary.main'}
                      className="bg-active-success"
                      sx={{
                        mr: 1,
                        height: "5px",
                        borderRadius: "8px",
                        "&:active": {
                          bgcolor: 'success.main',
                        },
                      }}
                    />
                    <Stack
                      flexGrow={1}
                      bgcolor={'secondary.main'}
                      className="bg-active-success"
                      sx={{
                        mr: 1,
                        height: "5px",
                        borderRadius: "8px",
                        "&:active": {
                          bgcolor: 'success.main',
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
                  label={intl.formatMessage({ id: "FORM.CONFIRM_PASSWORD" })}
                  placeholder={intl.formatMessage({ id: "FORM.CONFIRM_PASSWORD" })}
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
              </Stack>

              <Stack direction={"row"} alignItems={"center"} className="ms-n2">
                <Checkbox
                  checked={values.acceptTerms}
                  {...getFieldProps("acceptTerms")}
                />
                <Typography variant="body1">
                  <Box component="span">
                    {intl.formatMessage({ id: "TERMS.CONDITION_ACCEPT" })}
                    <Link to="#">
                      {intl.formatMessage({ id: "TERMS.CONDITION" })}
                    </Link>
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
                  label={intl.formatMessage({ id: "BUTTON.SUBMIT" })}
                  size="large"
                  type="submit"
                  loading={isSubmitting}
                />
                <CustomisedButton
                  handleClick={() => resetForm()}
                  variant="outlined"
                  label={intl.formatMessage({ id: "BUTTON.RESET" })}
                  size="large"
                  type="button"
                />
                <Typography variant="body2" align="center">
                  {intl.formatMessage({ id: "STATUS.REGISTRATION" })}
                  <Link to={"/auth/login"}>
                    {intl.formatMessage({ id: "AUTH.LOGIN.BUTTON" })}
                  </Link>
                </Typography>
              </Stack>
            </Stack>
          </form>
        )}
      </Formik>
    </Stack>
  );
}
