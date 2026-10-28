import { useState } from "react";
import { Formik } from "formik";
import { registerCompany } from "../core/_requests";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  FormHelperText,
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
  BusinessOutlined,
  LockOutlined,
  MailOutlineRounded,
  PersonOutlineRounded,
  ShieldOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { registrationSchema } from "../../../../utils/Schema/registrationSchema";
import { toast } from "react-toastify";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { getStatusCodeString } from "../../../../utils/common";
import {
  AppAlert,
  AppCheckbox,
  AppIconButton,
  passwordVisibilityButtonSx,
} from "../../../shared/components/ui";

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
  const theme = useTheme();
  const { formatMessage: i } = useIntl();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        boxShadow: "none",
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

  async function handleRegistration(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: any) => void
  ) {
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      companyName: values.companyName.trim(),
      email: values.email.trim(),
      password: values.password,
      acceptTerms: values.acceptTerms,
    };
    try {
      const { data } = await registerCompany(payload);
      if (data.success) {
        toast.success(
          i({
            id: "TOAST.SUCCESS.REGISTRATION",
            defaultMessage: "Company workspace registered successfully! Please sign in.",
          })
        );
        setStatus("");
        navigate("/auth/login", { replace: true });
      } else {
        setStatus(i({ id: getStatusCodeString(data.statusCode) }));
      }
    } catch (error: any) {
      console.error(error.message);
      setStatus(i({ id: "ERROR.SOMETHING_WRONG", defaultMessage: "Something went wrong. Please check your information and try again." }));
    } finally {
      setSubmitting(false);
    }
  }

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[#?!@$%^&*-]/.test(pwd)) score++;

    const labels = [
      "",
      i({ id: "AUTH.STRENGTH_WEAK", defaultMessage: "Weak" }),
      i({ id: "AUTH.STRENGTH_FAIR", defaultMessage: "Fair" }),
      i({ id: "AUTH.STRENGTH_GOOD", defaultMessage: "Good" }),
      i({ id: "AUTH.STRENGTH_STRONG", defaultMessage: "Strong" }),
    ];
    const colors = [
      theme.palette.divider,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
    ];

    return { score, label: labels[score] || "", color: colors[score] || theme.palette.divider };
  };

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
          {i({ id: "AUTH.REGISTRATION_TITLE", defaultMessage: "Create your workspace" })}
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
            id: "AUTH.REGISTRATION_SUBTITLE",
            defaultMessage: "Set up your organization's HR, attendance, and payroll portal.",
          })}
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
        }) => {
          const { score, label: strengthLabel, color: strengthColor } = getPasswordStrength(values.password);

          return (
            <form onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                {status && (
                  <Stack role="alert">
                    <AppAlert severity="error">{status}</AppAlert>
                  </Stack>
                )}

                {/* Name Row (2-Column Responsive) */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Box sx={{ flex: 1 }}>
                    <TextInput
                      type="text"
                      name="firstName"
                      label={i({ id: "FORM.FIRST_NAME", defaultMessage: "First Name" })}
                      placeholder="Jane"
                      sx={inputSx}
                      inputProps={{
                        autoComplete: "given-name",
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineRounded sx={{ fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextInput
                      type="text"
                      name="lastName"
                      label={i({ id: "FORM.LAST_NAME", defaultMessage: "Last Name" })}
                      placeholder="Doe"
                      sx={inputSx}
                      inputProps={{
                        autoComplete: "family-name",
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineRounded sx={{ fontSize: 19 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Stack>

                {/* Company Name */}
                <TextInput
                  type="text"
                  name="companyName"
                  label={i({ id: "FORM.COMPANY_NAME", defaultMessage: "Company Name" })}
                  placeholder="Acme Technologies Pvt Ltd"
                  sx={inputSx}
                  inputProps={{
                    autoComplete: "organization",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessOutlined sx={{ fontSize: 19 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Email Address */}
                <TextInput
                  type="email"
                  name="email"
                  label={i({ id: "FORM.EMAIL", defaultMessage: "Work Email" })}
                  placeholder="name@company.com"
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

                {/* Password Fields Row (2-Column Responsive) */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Box sx={{ flex: 1 }}>
                    <TextInput
                      type={showPassword ? "text" : "password"}
                      name="password"
                      label={i({ id: "FORM.PASSWORD", defaultMessage: "Password" })}
                      placeholder="••••••••••••"
                      sx={inputSx}
                      inputProps={{
                        autoComplete: "new-password",
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
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <TextInput
                      type={showConfirmPassword ? "text" : "password"}
                      name="changePassword"
                      label={i({ id: "FORM.CONFIRM_PASSWORD", defaultMessage: "Confirm Password" })}
                      placeholder="••••••••••••"
                      sx={inputSx}
                      inputProps={{
                        autoComplete: "new-password",
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
                              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                              sx={passwordVisibilityButtonSx}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => setShowConfirmPassword((visible) => !visible)}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff sx={{ fontSize: 18 }} />
                              ) : (
                                <Visibility sx={{ fontSize: 18 }} />
                              )}
                            </AppIconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Stack>

                {/* Subtle Password Strength Bar (Only shown when user enters password) */}
                {values.password && (
                  <Stack spacing={0.75} sx={{ pt: 0.25 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                        {i({ id: "AUTH.PASSWORD_STRENGTH", defaultMessage: "Password strength:" })}{" "}<Box component="span" sx={{ fontWeight: 600, color: strengthColor }}>{strengthLabel}</Box>
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.72rem" }}>
                        {i({ id: "AUTH.PASSWORD_CRITERIA", defaultMessage: "8+ chars, mixed case, number & symbol" })}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} sx={{ height: 3.5 }}>
                      {[1, 2, 3, 4].map((level) => (
                        <Box
                          key={level}
                          sx={{
                            flex: 1,
                            borderRadius: 1,
                            bgcolor: score >= level ? strengthColor : alpha(theme.palette.text.primary, 0.08),
                            transition: "background-color 0.2s ease",
                          }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                )}

                {/* Terms of Service Checkbox */}
                <Stack spacing={0.5} sx={{ pt: 0.25 }}>
                  <Stack direction="row" alignItems="center" sx={{ ml: -0.5 }}>
                    <AppCheckbox
                      id="acceptTerms"
                      checked={values.acceptTerms}
                      inputProps={{ "aria-label": i({ id: "AUTH.T&C", defaultMessage: "I agree to Terms & Conditions" }) }}
                      {...getFieldProps("acceptTerms")}
                      sx={{ p: 0.5 }}
                    />
                    <Typography
                      component="label"
                      htmlFor="acceptTerms"
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        userSelect: "none",
                        lineHeight: 1.4,
                      }}
                    >
                      {i({ id: "AUTH.AGREE_TERMS_PREFIX", defaultMessage: "I agree to the" })}{" "}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          color: "primary.main",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {i({ id: "AUTH.TERMS_OF_SERVICE", defaultMessage: "Terms of Service" })}
                      </Typography>{" "}
                      {i({ id: "AUTH.AND", defaultMessage: "and" })}{" "}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          color: "primary.main",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {i({ id: "AUTH.PRIVACY_POLICY", defaultMessage: "Privacy Policy" })}
                      </Typography>
                    </Typography>
                  </Stack>
                  {touched.acceptTerms && errors.acceptTerms && (
                    <FormHelperText error sx={{ mx: 0.5 }}>
                      {i({
                        id: "AUTH.TERMS_REQUIRED",
                        defaultMessage: "You must accept the terms and conditions to proceed.",
                      })}
                    </FormHelperText>
                  )}
                </Stack>

                {/* Submit Action */}
                <Stack spacing={1.5} sx={{ pt: 1 }}>
                  <CustomisedButton
                    type="submit"
                    disabled={!(dirty && isValid) || isSubmitting}
                    label={i({ id: "BUTTON.SUBMIT", defaultMessage: "Create Workspace Account" })}
                    size="large"
                    loading={isSubmitting}
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
                    {i({ id: "AUTH.ALREADY_REGISTERED", defaultMessage: "Already have an account?" })}{" "}
                    <Link
                      to="/auth/login"
                      style={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                      }}
                    >
                      {i({ id: "AUTH.SIGNIN", defaultMessage: "Sign in" })}
                    </Link>
                  </Typography>
                </Stack>

                {/* Security Footer */}
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
                    {i({
                      id: "AUTH.ENTERPRISE_PROTECTION",
                      defaultMessage: "Protected by enterprise role-based security & tenant data isolation",
                    })}
                  </Typography>
                </Stack>
              </Stack>
            </form>
          );
        }}
      </Formik>
    </Stack>
  );
}
