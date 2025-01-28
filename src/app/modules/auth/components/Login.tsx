import { useState } from "react";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { Formik, useFormik } from "formik";
import { login } from "../core/_requests";

import {
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { colors } from "../../theme/MuiTheme";
import { useIntl } from "react-intl";
import CustomisedButton from "../../components/CustomisedButton";
import { Check, ErrorOutline } from "@mui/icons-material";
import { setAuth, setToken } from "../../../Redux/Reducers/authSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { setLocalKey } from "../core/AuthHelpers";
import { TextInput } from "../../components/form_component/TextInput";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(
      /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be a valid email"
    )
    .required("Email is required"),
  password: Yup.string()
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Use 8 or more characters with a mix of letters, numbers & symbols"
    )
    .required("Password is required"),
});

const initialValues = {
  email: "",
  password: "",
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const intl = useIntl();
  const dispatch = useAppDispatch();

  async function handleLogin(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: any) => void
  ) {
    setLoading(true);
    try {
      const { data } = await login({ ...values });
      if (!data.success) {
        throw new Error(data.message);
      }
      dispatch(setToken({ token: data.message }));
      setLocalKey(data.message);
      setStatus("");
    } catch (error: any) {
      setStatus(error.message);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }
  return (
    <Stack spacing={4}>
      <Stack sx={{ textAlign: "center" }}>
        <Typography variant="h3">Sign In</Typography>
        <Typography variant="body1" color={colors.alpha.primary[500]}>
          {intl.formatMessage({ id: "AUTH.REGISTER.CMS" })}
        </Typography>
      </Stack>
      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={(values, { setSubmitting, setStatus }) => {
          handleLogin(values, setSubmitting, setStatus);
        }}
      >
        {({
          status,
          touched,
          errors,
          isValid,
          dirty,
          isSubmitting,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit} noValidate id="kt_login_signin_form">
            <Stack spacing={2}>
              {status && (
                <Grid className="mb-lg-15 alert alert-danger">
                  <Grid className="alert-text font-weight-bold">{status}</Grid>
                </Grid>
              )}
              <Stack spacing={2}>
                <Stack>
                  <TextInput
                    type="email"
                    label={intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                    placeholder="Email"
                    name="email"
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
                  <TextInput
                    type="password"
                    label={intl.formatMessage({ id: "AUTH.INPUT.PASSWORD" })}
                    placeholder="Password"
                    name="password"
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
                </Stack>

                <Typography>
                  <Link to="/auth/forgot-password">Forgot Password ?</Link>
                </Typography>

                <Stack spacing={1}>
                  <CustomisedButton
                    type="submit"
                    label="Sign In"
                    size="large"
                    loading={loading}
                    disabled={isSubmitting || !(isValid && dirty)}
                  />
                  <Typography variant="body2" align="center">
                    Not a Member yet ?{" "}
                    <Link to="/auth/registration">Sign up</Link>
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </form>
        )}
      </Formik>
    </Stack>
  );
}
