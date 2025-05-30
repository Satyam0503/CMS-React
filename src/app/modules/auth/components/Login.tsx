import * as Yup from "yup";
import { Link } from "react-router-dom";
import { Formik } from "formik";
import { login } from "../core/_requests";
import { Alert, Grid, InputAdornment, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { Check, ErrorOutline } from "@mui/icons-material";
import { setToken } from "../../../Redux/Reducers/authSlice";
import { useAppDispatch } from "../../../Redux/hooks";
import { setLocalKey } from "../core/AuthHelpers";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { Regex } from "../../../../utils/constant/Constant";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(Regex.Email, "Email must be a valid email")
    .required("Email is required"),
  password: Yup.string()
    .matches(
      Regex.Password,
      "Use 8 or more characters with a mix of letters, numbers & symbols"
    )
    .required("Password is required"),
});

const initialValues = {
  email: "",
  password: "",
};

export function Login() {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  localStorage.removeItem("clientId");
  async function handleLogin(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: any) => void
  ) {
    try {
      const response = await login({ ...values });
      const data = response.data;
      if (!data.success) {
        throw new Error(data.message);
      }
      dispatch(setToken({ token: data.message }));
      setLocalKey(data.message);
      setStatus("");
    } catch (error: any) {
      console.error("Error :" + error.message);
      setStatus(error.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Stack spacing={4}>
      <Stack sx={{ textAlign: "center" }} spacing={1}>
        <Typography variant="h1">
          {intl.formatMessage({ id: "BUTTON.SIGNIN" })}
        </Typography>
        <Typography variant="h4">
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
                <Alert severity="error" sx={{ my: 2 }} className="mb-5">{status}</Alert>
              )}
              <Stack spacing={2}>
                <Stack>
                  <TextInput
                    type="email"
                    label={intl.formatMessage({ id: "FORM.EMAIL" })}
                    placeholder={intl.formatMessage({ id: "FORM.EMAIL" })}
                    name="email"
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
                </Stack>

                <Stack>
                  <TextInput
                    type="password"
                    label={intl.formatMessage({ id: "FORM.PASSWORD" })}
                    placeholder={intl.formatMessage({ id: "FORM.PASSWORD" })}
                    name="password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {touched.password && errors.password ? (
                            <ErrorOutline color="error" />
                          ) : touched.password && !errors.password ? (
                            <Check color="success" />
                          ) : null}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
                <Link to="/auth/forgot-password">
                  {intl.formatMessage({ id: "AUTH.INPUT.FORGOT_PASSWORD" })}
                </Link>
                <Stack spacing={1}>
                  <CustomisedButton
                    type="submit"
                    label={intl.formatMessage({ id: "BUTTON.SIGNIN" })}
                    size="large"
                    loading={isSubmitting}
                    disabled={isSubmitting || !(isValid && dirty)}
                  />
                  <Typography variant="body2" align="center">
                    {intl.formatMessage({ id: "AUTH.MEMBER.REGISTER" })}
                    <Link to="/auth/registration">
                      {intl.formatMessage({ id: "AUTH.REGISTER" })}
                    </Link>
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
