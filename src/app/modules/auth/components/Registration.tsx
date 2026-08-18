import { useState } from "react";
import { Formik } from "formik";
import { registerCompany } from "../core/_requests";
import { Link,
  useNavigate } from "react-router-dom";
import {
  Box,
  FormHelperText,
  Grid,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/C_Button";
import { Check, ErrorOutline, Visibility, VisibilityOff } from "@mui/icons-material";
import { registrationSchema } from "../../../../utils/Schema/registrationSchema";
import { toast } from "react-toastify";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { getStatusCodeString } from "../../../../utils/common";
import { PasswordStrenghtMeter } from "../../../shared/components/form-component/PasswordStrengthMeter";

import { AppAlert, AppCheckbox, AppIconButton } from "../../../shared/components/ui";
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
  const { formatMessage: i } = useIntl();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      if (data.success) {
        toast.success(i({ id: "TOAST.SUCCESS.REGISTRATION" }));
        setStatus("");
        navigate("/auth/login", { replace: true });
      } else {
        setStatus(i({ id: getStatusCodeString(data.statusCode) }))
      }
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Stack spacing={4}>
      <Stack sx={{ alignItems: "center" }} spacing={1}>
        <Typography variant="h1" className="text-wrap-balance text-center">
          {i({ id: "AUTH.REGISTRATION_TITLE" })}
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
                <AppAlert severity="error" className="mb-4">
                  {status}
                </AppAlert>
              )}

              <TextInput
                type="text"
                name="firstName"
                label={i({ id: "FORM.FIRST_NAME" })}
                placeholder={i({ id: "FORM.FIRST_NAME" })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {touched.firstName && errors.firstName ? (
                        <ErrorOutline color="error" />
                      ) : touched.firstName && !errors.firstName ? (
                        <Check color="success" />
                      ) : null}
                    </InputAdornment>
                  ),
                }}
              />

              <TextInput
                type="text"
                name="lastName"
                label={i({ id: "FORM.LAST_NAME" })}
                placeholder={i({ id: "FORM.LAST_NAME" })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {touched.lastName && errors.lastName ? (
                        <ErrorOutline color="error" />
                      ) : touched.lastName && !errors.lastName ? (
                        <Check color="success" />
                      ) : null}
                    </InputAdornment>
                  ),
                }}
              />

              <TextInput
                type="text"
                name="companyName"
                label={i({ id: "FORM.COMPANY_NAME" })}
                placeholder={i({ id: "FORM.COMPANY_NAME" })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {touched.companyName && errors.companyName ? (
                        <ErrorOutline color="error" />
                      ) : touched.companyName && !errors.companyName ? (
                        <Check color="success" />
                      ) : null}
                    </InputAdornment>
                  ),
                }}
              />
              <TextInput
                type="email"
                name="email"
                label={i({ id: "FORM.EMAIL" })}
                placeholder={i({ id: "FORM.EMAIL" })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {touched.email && errors.email ? (
                        <ErrorOutline color="error" />
                      ) : touched.email && !errors.email ? (
                        <Check color="success" />
                      ) : null}
                    </InputAdornment>
                  ),
                }}
              />

              <Stack spacing={1}>
                <Typography variant="body2" className="fs-10">
                  {i({ id: "AUTH.PASSWORD_NOTE" })}
                </Typography>
                <TextInput
                  type={showPassword ? "text" : "password"}
                  name="password"
                  label={i({ id: "FORM.PASSWORD" })}
                  placeholder={i({ id: "FORM.PASSWORD" })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <AppIconButton
                          type="button"
                          size="small"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => setShowPassword((visible) => !visible)}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </AppIconButton>
                        {touched.password && errors.password ? (
                          <ErrorOutline color="error" />
                        ) : touched.password && !errors.password ? (
                          <Check color="success" />
                        ) : null}
                      </InputAdornment>
                    ),
                  }}
                />
                <PasswordStrenghtMeter password={values.password} />
              </Stack>

              <Stack>
                <TextInput
                  type={showConfirmPassword ? "text" : "password"}
                  name="changePassword"
                  label={i({ id: "FORM.CONFIRM_PASSWORD" })}
                  placeholder={i({
                    id: "FORM.CONFIRM_PASSWORD",
                  })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <AppIconButton
                          type="button"
                          size="small"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => setShowConfirmPassword((visible) => !visible)}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </AppIconButton>
                        {touched.changePassword && errors.changePassword ? (
                          <ErrorOutline color="error" />
                        ) : touched.changePassword && !errors.changePassword ? (
                          <Check color="success" />
                        ) : null}
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <Stack direction={"row"} className="ms-n2" sx={{
                alignItems: "center"
              }}>
                <AppCheckbox
                  checked={values.acceptTerms}
                  {...getFieldProps("acceptTerms")}
                />
                <Link to="#">
                  {i({ id: "AUTH.T&C" })}
                </Link>
              </Stack>

              <Stack spacing={1}>
                <CustomisedButton
                  disabled={!(dirty && isValid) || isSubmitting}
                  label={i({ id: "BUTTON.SUBMIT" })}
                  size="large"
                  type="submit"
                  loading={isSubmitting}
                />
                <CustomisedButton
                  handleClick={() => resetForm()}
                  variant="outlined"
                  label={i({ id: "BUTTON.RESET" })}
                  size="large"
                  type="button"
                />
                <Typography variant="body2" align="center">
                  {i({ id: "AUTH.ALREADY_REGISTERED" })}
                  <Link to={"/auth/login"}>
                    {i({ id: "AUTH.SIGNIN" })}
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
