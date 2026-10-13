import * as Yup from "yup";
import { Link } from "react-router-dom";
import { Formik } from "formik";
import { login, resendEmailVerification } from "../core/_requests";
import {
  FormControlLabel,
  InputAdornment,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/C_Button";
import {
  ArrowForwardRounded,
  LockOutlined,
  MailOutlineRounded,
  ShieldOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useState } from "react";
import { setToken } from "../../../Redux/Reducers/authSlice";
import { useAppDispatch } from "../../../Redux/hooks";
import { setLocalKey } from "../core/AuthHelpers";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { Regex } from "../../../../utils/constant/Constant";
import { getStatusCodeString } from "../../../../utils/common";
import {
  AppAlert,
  AppButton,
  AppCheckbox,
  AppIconButton,
  passwordVisibilityButtonSx,
} from "../../../shared/components/ui";
import { toast } from "react-toastify";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL")
    .required("VALIDATION_ERR.EMAIL_REQ"),
  password: Yup.string()
    .matches(Regex.Password, "VALIDATION_ERR.INVALID_PASSWORD")
    .required("VALIDATION_ERR.PASSWORD_REQ"),
});

const initialValues = {
  email: "",
  password: "",
};

export function Login() {
  const { formatMessage: i } = useIntl();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  localStorage.removeItem("clientId");

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 48,
      borderRadius: 2,
      bgcolor: alpha(theme.palette.background.paper, 0.8),
      transition: "all 0.2s ease",
      "&:hover": {
        bgcolor: alpha(theme.palette.background.paper, 1),
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: alpha(theme.palette.primary.main, 0.4),
        },
      },
      "&.Mui-focused": {
        bgcolor: alpha(theme.palette.background.paper, 1),
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main,
          borderWidth: "1.5px",
        },
      },
    },
    "& .MuiInputAdornment-root": {
      color: "text.secondary",
      mr: 1,
    },
    "& .MuiFormHelperText-root": {
      minHeight: 18,
      mx: 0.5,
      mt: 0.5,
      fontSize: "0.78rem",
    },
  } as const;

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
    <Stack spacing={3} sx={{ width: "100%" }}>
      {/* Header Block */}
      <Stack spacing={0.75}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.025em",
            fontSize: { xs: "1.5rem", sm: "1.75rem" },
            color: "text.primary",
          }}
        >
          Sign in to your workspace
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.875rem",
            lineHeight: 1.5,
          }}
        >
          Enter your credentials to continue to CodeJi CMS.
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
          isSubmitting,
          handleSubmit,
          values,
        }) => (
          <form onSubmit={handleSubmit} noValidate id="kt_login_signin_form">
            <Stack spacing={2}>
              {status && (
                <Stack spacing={1} role="alert">
                  <AppAlert severity="error">{status}</AppAlert>
                  {unverifiedEmail && (
                    <AppButton
                      type="button"
                      variant="outlined"
                      size="small"
                      disabled={isResendingVerification}
                      onClick={() => handleResendVerification(unverifiedEmail)}
                    >
                      {isResendingVerification
                        ? "Sending verification email…"
                        : "Resend verification email"}
                    </AppButton>
                  )}
                </Stack>
              )}

              {/* Email Input */}
              <Stack spacing={0.5}>
                <TextInput
                  type="email"
                  label={i({ id: "FORM.EMAIL", defaultMessage: "Work Email" })}
                  placeholder="name@company.com"
                  name="email"
                  sx={inputSx}
                  inputProps={{
                    autoComplete: "email",
                    autoCapitalize: "none",
                    spellCheck: false,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineRounded sx={{ fontSize: 19 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {/* Password Input */}
              <Stack spacing={0.5}>
                <TextInput
                  type={showPassword ? "text" : "password"}
                  label={i({ id: "FORM.PASSWORD", defaultMessage: "Password" })}
                  placeholder="••••••••••••"
                  name="password"
                  sx={inputSx}
                  inputProps={{
                    autoComplete: "current-password",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ fontSize: 19 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <AppIconButton
                          type="button"
                          size="small"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          sx={passwordVisibilityButtonSx}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => setShowPassword((visible) => !visible)}
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ fontSize: 18 }} />
                          ) : (
                            <Visibility sx={{ fontSize: 18 }} />
                          )}
                        </AppIconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {/* Auxiliary Controls */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ pt: 0.25 }}
              >
                <FormControlLabel
                  control={
                    <AppCheckbox
                      size="small"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      sx={{ p: 0.5 }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.85rem",
                        userSelect: "none",
                        cursor: "pointer",
                      }}
                    >
                      Remember me
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
                <Link
                  to="/auth/forgot-password"
                  state={{ email: values.email.trim() }}
                  style={{
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    transition: "opacity 0.15s ease",
                  }}
                >
                  {i({ id: "AUTH.FORGOT_PASSWORD", defaultMessage: "Forgot password?" })}
                </Link>
              </Stack>

              {/* Submit CTA */}
              <Stack spacing={1.5} sx={{ pt: 1 }}>
                <CustomisedButton
                  type="submit"
                  label={i({ id: "BUTTON.SIGNIN", defaultMessage: "Sign In" })}
                  size="large"
                  loading={isSubmitting}
                  disabled={isSubmitting || !values.email.trim() || !values.password}
                  Icon={<ArrowForwardRounded sx={{ fontSize: 18 }} />}
                  sx={{
                    minHeight: 46,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    letterSpacing: "-0.01em",
                    textTransform: "none",
                    boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.28)}`,
                    transition: "all 0.18s ease",
                    "&:hover:not(:disabled)": {
                      transform: "translateY(-1px)",
                      boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.38)}`,
                    },
                    "&:active:not(:disabled)": {
                      transform: "translateY(0)",
                    },
                  }}
                />

                <Typography
                  variant="body2"
                  align="center"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.85rem",
                    pt: 0.5,
                  }}
                >
                  Don&apos;t have a workspace?{" "}
                  <Link
                    to="/auth/registration"
                    style={{
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      textDecoration: "none",
                    }}
                  >
                    Create an account
                  </Link>
                </Typography>
              </Stack>

              {/* Security Reassurance */}
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                justifyContent="center"
                sx={{
                  color: "text.secondary",
                  pt: 1,
                  opacity: 0.75,
                }}
              >
                <ShieldOutlined sx={{ fontSize: 14, color: "success.main" }} />
                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                  256-bit encrypted authentication & tenant security
                </Typography>
              </Stack>
            </Stack>
          </form>
        )}
      </Formik>
    </Stack>
  );
}
