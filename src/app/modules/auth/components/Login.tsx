import * as Yup from "yup";
import {
  Link } from "react-router-dom";
import { Formik } from "formik";
import { login, resendEmailVerification } from "../core/_requests";
import {
  Box,
  FormControlLabel,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/C_Button";
import { ArrowForwardRounded, LockOutlined, MailOutlineRounded, ShieldOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { setToken } from "../../../Redux/Reducers/authSlice";
import { useAppDispatch } from "../../../Redux/hooks";
import { setLocalKey } from "../core/AuthHelpers";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { Regex } from "../../../../utils/constant/Constant";
import { getStatusCodeString } from "../../../../utils/common";

import { AppAlert, AppButton, AppCheckbox, AppIconButton } from "../../../shared/components/ui";
import { toast } from "react-toastify";
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 58,
      borderRadius: 2.5,
      bgcolor: "action.hover",
      transition: "background-color .2s ease, box-shadow .2s ease",
      "&:hover": { bgcolor: "action.selected" },
      "&.Mui-focused": {
        bgcolor: "background.paper",
        boxShadow: "0 0 0 4px rgba(151, 71, 215, .1)",
      },
    },
    "& .MuiInputAdornment-root": { color: "text.secondary" },
    "& .MuiFormHelperText-root": { minHeight: 20, mx: .5 },
  } as const;
  localStorage.removeItem("clientId");
  async function handleLogin(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: any) => void
  ) {
    try {
      const { data } = await login({ ...values, email: values.email.trim() });
      if (data.success) {
        setLocalKey(data.methodResult);
        dispatch(setToken({ token: data.methodResult.token }));
        setStatus("");
      } else {
        setUnverifiedEmail(data.statusCode === 3 ? values.email.trim() : null);
        setStatus(i({ id: getStatusCodeString(data.statusCode) }));
      }
    } catch (error) {
      console.error((error as Error).message);
      setUnverifiedEmail(null);
      setStatus(i({ id: "ERROR.SOMETHING_WRONG" }));
    } finally {
      setSubmitting(false);
    }
  }
  async function handleResendVerification(email: string) {
    setIsResendingVerification(true);
    try {
      const { data } = await resendEmailVerification(email.trim());
      if (data.success) {
        toast.success("Verification email sent. Check your inbox and spam folder.");
      } else {
        toast.error(data.message || "We could not send the verification email. Please try again.");
      }
    } catch {
      toast.error("We could not send the verification email. Please try again.");
    } finally {
      setIsResendingVerification(false);
    }
  }
  return (
    <Stack spacing={4.5}>
      <Stack spacing={1.25}>
        <Box
          sx={{
            display: { xs: "inline-flex", md: "none" }, alignSelf: "flex-start",
            px: 1.5, py: .65, borderRadius: 99, color: "primary.main", bgcolor: "rgba(155, 77, 224, .1)",
            fontWeight: 700, fontSize: 12, letterSpacing: ".04em", textTransform: "uppercase",
          }}
        >
          Welcome back
        </Box>
        <Typography variant="h3" fontWeight={800} letterSpacing="-.035em">
          Sign in to your workspace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your details to continue to CodeJi CMS.
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
          isValid,
          dirty,
          isSubmitting,
          handleSubmit,
          values,
        }) => (
          <form onSubmit={handleSubmit} noValidate id="kt_login_signin_form">
            <Stack spacing={2.25}>
              {status && (
                <Stack spacing={1} sx={{ my: 2 }} className="mb-5">
                  <AppAlert severity="error">{status}</AppAlert>
                  {unverifiedEmail && (
                    <AppButton
                      type="button"
                      variant="outlined"
                      size="small"
                      disabled={isResendingVerification}
                      onClick={() => handleResendVerification(unverifiedEmail)}
                    >
                      {isResendingVerification ? "Sending verification email…" : "Resend verification email"}
                    </AppButton>
                  )}
                </Stack>
              )}
              <Stack spacing={2}>
                <Stack>
                  <TextInput
                    type="email"
                    label={i({ id: "FORM.EMAIL" })}
                    placeholder={i({ id: "FORM.EMAIL" })}
                    name="email"
                    sx={fieldSx}
                    inputProps={{ autoComplete: "email" }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><MailOutlineRounded color="action" fontSize="small" /></InputAdornment>,
                      endAdornment: <Box sx={{ width: 40 }} />,
                    }}
                  />
                </Stack>

                <Stack>
                  <TextInput
                    type={showPassword ? "text" : "password"}
                    label={i({ id: "FORM.PASSWORD" })}
                    placeholder={i({ id: "FORM.PASSWORD" })}
                    name="password"
                    sx={fieldSx}
                    inputProps={{ autoComplete: "current-password" }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockOutlined color="action" fontSize="small" /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <AppIconButton
                            type="button"
                            size="small"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((visible) => !visible)}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </AppIconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: -1 }}>
                  <FormControlLabel
                    control={<AppCheckbox size="small" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />}
                    label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
                    sx={{ m: 0 }}
                  />
                  <Link
                    to="/auth/forgot-password"
                    state={{ email: values.email.trim(), autoSubmit: true }}
                    style={{ fontWeight: 700, fontSize: 14 }}
                  >
                    {i({ id: "AUTH.FORGOT_PASSWORD" })}
                  </Link>
                </Stack>
                <Stack
                  spacing={1}
                  sx={{
                    "& .auth-signin-button": {
                      minHeight: 52,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      textTransform: "none",
                      fontSize: 15,
                      boxShadow: "0 12px 28px rgba(142, 68, 210, .28)",
                    },
                  }}
                >
                  <CustomisedButton
                    type="submit"
                    label={i({ id: "BUTTON.SIGNIN" })}
                    size="large"
                    loading={isSubmitting}
                    disabled={isSubmitting || !(isValid && dirty)}
                    Icon={<ArrowForwardRounded />}
                    className="auth-signin-button"
                  />
                  <Typography variant="body2" align="center" color="text.secondary" sx={{ pt: 1.5 }}>
                    {i({ id: "AUTH.NOT_REGISTERED" })}
                    <Link to="/auth/registration">
                      {i({ id: "AUTH.REGISTER" })}
                    </Link>
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ color: "text.secondary", pt: .5 }}
                >
                  <ShieldOutlined sx={{ fontSize: 16, color: "success.main" }} />
                  <Typography variant="caption">Protected by secure, encrypted authentication</Typography>
                </Stack>
              </Stack>
            </Stack>
          </form>
        )}
      </Formik>
    </Stack>
  );
}
