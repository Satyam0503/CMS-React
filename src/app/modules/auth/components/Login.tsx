import * as Yup from "yup";
import { Link } from "react-router-dom";
import { Formik } from "formik";
import { login } from "../core/_requests";
import { Alert, InputAdornment, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { Check, ErrorOutline } from "@mui/icons-material";
import { setToken } from "../../../Redux/Reducers/authSlice";
import { useAppDispatch } from "../../../Redux/hooks";
import { setLocalKey } from "../core/AuthHelpers";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { Regex } from "../../../../utils/constant/Constant";
import { getStatusCodeString } from "../../../../utils/common";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL")
    .required("VALIDATION_ERR.EMAIL_REQ"),
  password: Yup.string()
    .matches(
      Regex.Password,
      "VALIDATION_ERR.INVALID_PASSWORD"
    )
    .required("VALIDATION_ERR.PASSWORD_REQ"),
});

const initialValues = {
  email: "",
  password: "",
};

export function Login() {
  const { formatMessage: i } = useIntl();
  const dispatch = useAppDispatch();
  localStorage.removeItem("clientId");
  async function handleLogin(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: any) => void
  ) {
    try {
      const { data } = await login({ ...values });
      if (data.success) {
        dispatch(setToken({ token: data.methodResult.token }));
        setLocalKey(data.methodResult);
        setStatus("");
      } else {
        setStatus(i({ id: getStatusCodeString(data.statusCode) }));
      }
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Stack spacing={4}>
      <Stack sx={{ textAlign: "center" }} spacing={1}>
        <Typography variant="h1">
          {i({ id: "AUTH.SIGNIN" })}
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
                    label={i({ id: "FORM.EMAIL" })}
                    placeholder={i({ id: "FORM.EMAIL" })}
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
                    label={i({ id: "FORM.PASSWORD" })}
                    placeholder={i({ id: "FORM.PASSWORD" })}
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
                  {i({ id: "AUTH.FORGOT_PASSWORD" })}
                </Link>
                <Stack spacing={1}>
                  <CustomisedButton
                    type="submit"
                    label={i({ id: "BUTTON.SIGNIN" })}
                    size="large"
                    loading={isSubmitting}
                    disabled={isSubmitting || !(isValid && dirty)}
                  />
                  <Typography variant="body2" align="center">
                    {i({ id: "AUTH.NOT_REGISTERED" })}
                    <Link to="/auth/registration">
                      {i({ id: "AUTH.REGISTER" })}
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
