import {
  useEffect,
  useRef,
} from "react";
import * as Yup from "yup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import CustomisedButton from "../../../shared/components/C_Button";
import {
  Box,
  InputAdornment,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Regex } from "../../../../utils/constant/Constant";
import { resetPassword } from "../core/_requests";
import { toast } from "react-toastify";
import { getStatusCodeString } from "../../../../utils/common";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../../utils/common_types";
import { AppTextField } from "../../../shared/components/ui";
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  MailOutlineRounded,
} from "@mui/icons-material";

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL")
    .required("VALIDATION_ERR.EMAIL_REQ"),
});

export function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const autoSubmitStarted = useRef(false);
  const { formatMessage: i } = useIntl();
  const navigationState = location.state as { email?: string; autoSubmit?: boolean } | null;
  const emailFromLogin = navigationState?.email?.trim() ?? "";

  const formik = useFormik({
    initialValues: { email: emailFromLogin },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data } = await resetPassword(values.email);
        if (data.success || data.statusCode === 2) {
          toast.success("If an active account exists for this email, a password reset link has been sent.");
          formik.resetForm();
        } else {
          toast.error(
            data.message ||
              i({
                id: getStatusCodeString(data.statusCode),
                defaultMessage: "The reset email could not be sent. Please try again.",
              })
          );
        }
      } catch (error) {
        const response = (error as AxiosError<ApiResponse>).response?.data;
        toast.error(response?.message || "Unable to request a password reset. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (
      navigationState?.autoSubmit &&
      emailFromLogin &&
      forgotPasswordSchema.isValidSync({ email: emailFromLogin }) &&
      !autoSubmitStarted.current
    ) {
      autoSubmitStarted.current = true;
      void formik.submitForm();
    }
  }, [emailFromLogin, navigationState?.autoSubmit]);

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
          {i({ id: "AUTH.FORGOT_PASSWORD", defaultMessage: "Reset your password" })}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.875rem",
            lineHeight: 1.5,
          }}
        >
          {i({
            id: "AUTH.FORGOT_PASSWORD.NOTE",
            defaultMessage: "Enter your registered email address and we'll send you recovery instructions.",
          })}
        </Typography>
      </Stack>

      <form id="login_password_reset_form" onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <AppTextField
              fullWidth
              type="email"
              label={i({ id: "FORM.EMAIL", defaultMessage: "Work Email" })}
              placeholder="name@company.com"
              autoComplete="email"
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={
                formik.touched.email && formik.errors.email
                  ? i({ id: formik.errors.email, defaultMessage: formik.errors.email })
                  : ""
              }
              sx={inputSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRounded sx={{ fontSize: 19 }} />
                    </InputAdornment>
                  ),
                },
              }}
              {...formik.getFieldProps("email")}
            />
          </Stack>

          <Stack spacing={1.5}>
            <CustomisedButton
              type="submit"
              label={i({ id: "BUTTON.SUBMIT", defaultMessage: "Send Reset Link" })}
              size="large"
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting || !formik.isValid || !formik.values.email.trim()}
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
              }}
            />

            <Box sx={{ textAlign: "center", pt: 0.5 }}>
              <Link
                to="/auth/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: theme.palette.text.secondary,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
              >
                <ArrowBackRounded sx={{ fontSize: 16 }} />
                <span>Back to sign in</span>
              </Link>
            </Box>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}
