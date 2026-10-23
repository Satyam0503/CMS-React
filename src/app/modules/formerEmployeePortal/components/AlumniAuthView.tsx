import {
  ArrowBackRounded,
  CheckCircleRounded,
  DescriptionOutlined,
  EmailOutlined,
  HelpOutlineRounded,
  LockOutlined,
  SecurityRounded,
  ShieldOutlined,
  SupportAgentOutlined,
  VerifiedUserRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import LightDarkMode from "../../../../_themes/layout/components/header/navbarmenus/LightDarkMode";

type Props = {
  stage: "login" | "otp";
  email: string;
  setEmail: (email: string) => void;
  code: string[];
  setCode: (code: string[]) => void;
  expires: number;
  resend: number;
  busy: boolean;
  error: string;
  notice: string;
  send: (isResend?: boolean) => Promise<void>;
  verify: () => Promise<void>;
  setStage: (stage: "login" | "otp") => void;
  brand?: { name?: string; logo?: string };
};

const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export const AlumniAuthView = ({
  stage,
  email,
  setEmail,
  code,
  setCode,
  expires,
  resend,
  busy,
  error,
  notice,
  send,
  verify,
  setStage,
  brand,
}: Props) => {
  const [supportOpen, setSupportOpen] = useState(false);
  const companyName = brand?.name || "Codeji Infotech Pvt Ltd";

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && !busy) {
      void send();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.join("").length === 6 && !busy && expires > 0) {
      void verify();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        position: "relative",
        overflowX: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: { xs: 260, md: 420 },
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(13, 148, 136, 0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        },
      }}
    >
      {/* Top Header Bar */}
      <Box
        component="header"
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          backdropFilter: "blur(12px)",
          py: 1.25,
          position: "relative",
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              {brand?.logo ? (
                <Box
                  component="img"
                  src={brand.logo}
                  alt=""
                  sx={{
                    width: 34,
                    height: 34,
                    objectFit: "contain",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    p: 0.5,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
                  }}
                >
                  <ShieldOutlined fontSize="small" />
                </Box>
              )}
              <Box>
                <Typography fontWeight={850} fontSize={{ xs: 14, sm: 15 }} lineHeight={1.2}>
                  {companyName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ letterSpacing: "0.03em", fontWeight: 650, display: "block", fontSize: "0.72rem" }}
                >
                  Former Employee Portal
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                startIcon={<SupportAgentOutlined />}
                onClick={() => setSupportOpen(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: "text.secondary",
                  display: { xs: "none", sm: "inline-flex" },
                  borderRadius: 2,
                  fontSize: "0.82rem",
                }}
              >
                Need Help?
              </Button>
              <LightDarkMode sx={{ width: 34, height: 34 }} />
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Unified Card Container */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          py: { xs: 2.5, sm: 3.5, md: 4 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: { xs: 460, sm: 520, md: 920 },
            borderRadius: { xs: 3.5, sm: 4, md: 5 },
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: {
              xs: "0 10px 30px rgba(15, 23, 42, 0.06)",
              md: "0 20px 60px -15px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.04)",
            },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
            minHeight: { md: 530 },
          }}
        >
          {/* Left Panel: Executive Brand Welcome (Hidden on mobile < 900px to keep form compact and above fold) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "space-between",
              p: { md: 4, lg: 5 },
              background: "linear-gradient(145deg, #042f2e 0%, #0d9488 60%, #115e59 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                width: 260,
                height: 260,
                right: -60,
                top: -80,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Chip
                icon={<VerifiedUserRounded sx={{ fontSize: 15, color: "#0d9488 !important" }} />}
                label="Official Alumni Gateway"
                size="small"
                sx={{
                  bgcolor: "white",
                  color: "#0f766e",
                  fontWeight: 750,
                  fontSize: "0.72rem",
                  mb: 2.5,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />

              <Typography
                variant="h4"
                fontWeight={900}
                sx={{
                  fontSize: { md: "1.85rem", lg: "2.1rem" },
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: "white",
                }}
              >
                Welcome Back!
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  color: "rgba(255, 255, 255, 0.88)",
                  lineHeight: 1.5,
                  fontSize: "0.92rem",
                }}
              >
                Your secure hub to access relieving certificates, experience letters, and manage post-employment records.
              </Typography>

              <Stack spacing={1.75} sx={{ mt: 3.5 }}>
                <FeatureBullet
                  icon={<LockOutlined sx={{ fontSize: 18 }} />}
                  title="Encrypted & Private"
                  text="Single-use security code verification."
                />
                <FeatureBullet
                  icon={<DescriptionOutlined sx={{ fontSize: 18 }} />}
                  title="Instant Document Access"
                  text="Download digitally verified letters anytime."
                />
                <FeatureBullet
                  icon={<SupportAgentOutlined sx={{ fontSize: 18 }} />}
                  title="Alumni Request Desk"
                  text="Direct channel for corrections & queries."
                />
              </Stack>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                pt: 2.5,
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                color: "rgba(255, 255, 255, 0.85)",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 650 }}>
                <CheckCircleRounded sx={{ fontSize: 14, color: "#6ee7b7" }} /> SOC2 Compliant
              </Typography>
              <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 650 }}>
                <CheckCircleRounded sx={{ fontSize: 14, color: "#6ee7b7" }} /> 256-Bit TLS
              </Typography>
              <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 650 }}>
                <CheckCircleRounded sx={{ fontSize: 14, color: "#6ee7b7" }} /> Audit-Logged
              </Typography>
            </Stack>
          </Box>

          {/* Right Panel: Interactive Sign In Form */}
          <Box
            sx={{
              p: { xs: 3, sm: 4, md: 4.5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "background.paper",
            }}
          >
            {/* Mobile Header (Visible only on < 900px) */}
            <Box sx={{ display: { xs: "block", md: "none" }, textAlign: "center", mb: 2 }}>
              <Chip
                icon={<VerifiedUserRounded sx={{ fontSize: 14, color: "#0d9488 !important" }} />}
                label="Official Alumni Gateway"
                size="small"
                sx={{
                  bgcolor: "rgba(13, 148, 136, 0.1)",
                  color: "#0f766e",
                  fontWeight: 750,
                  fontSize: "0.7rem",
                  mb: 1,
                }}
              />
              <Typography variant="h5" fontWeight={850} sx={{ letterSpacing: "-0.02em" }}>
                Welcome Back!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Access your post-employment records & relieving documents.
              </Typography>
            </Box>

            {stage === "login" ? (
              <Box component="form" onSubmit={handleEmailSubmit}>
                {/* Shield Badge Graphic */}
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: 3,
                      mx: "auto",
                      display: "grid",
                      placeItems: "center",
                      background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                      color: "white",
                      boxShadow: "0 6px 18px rgba(13, 148, 136, 0.28)",
                      position: "relative",
                    }}
                  >
                    <SecurityRounded sx={{ fontSize: 28 }} />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -3,
                        right: -3,
                        width: 17,
                        height: 17,
                        borderRadius: "50%",
                        bgcolor: "success.main",
                        border: "2px solid white",
                        display: "grid",
                        placeItems: "center",
                        color: "white",
                      }}
                    >
                      <CheckCircleRounded sx={{ fontSize: 12 }} />
                    </Box>
                  </Box>

                  <Chip
                    size="small"
                    label="Protected Sign In"
                    sx={{
                      mt: 1.5,
                      bgcolor: "rgba(13, 148, 136, 0.08)",
                      color: "#0f766e",
                      fontWeight: 750,
                      fontSize: "0.72rem",
                      height: 22,
                    }}
                  />
                </Box>

                <Typography
                  variant="h5"
                  fontWeight={850}
                  textAlign="center"
                  sx={{ letterSpacing: "-0.02em", fontSize: { xs: "1.25rem", sm: "1.4rem" } }}
                >
                  Verify your access
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 0.75, mb: 2.5, px: 1, lineHeight: 1.45, fontSize: "0.875rem" }}
                >
                  Enter your registered personal email to receive a secure sign-in code.
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={750}
                      color="text.primary"
                      sx={{ mb: 0.75, display: "block" }}
                    >
                      Registered Personal Email <span style={{ color: "#ef4444" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      id="alumni-email-input"
                      type="email"
                      name="email"
                      placeholder="e.g. name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                      inputProps={{
                        autoCapitalize: "none",
                        autoCorrect: "off",
                        spellCheck: "false",
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ mr: 1 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.75,
                                bgcolor: "rgba(13, 148, 136, 0.08)",
                                color: "#0d9488",
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              <EmailOutlined sx={{ fontSize: 18 }} />
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2.5,
                          fontSize: "0.95rem",
                          height: 48,
                          bgcolor: "action.hover",
                          "& fieldset": {
                            borderColor: "divider",
                            borderWidth: "1.5px",
                          },
                          "&:hover fieldset": {
                            borderColor: "primary.main",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#0d9488",
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiOutlinedInput-input": {
                          py: 1.2,
                          "&::placeholder": {
                            color: "text.secondary",
                            opacity: 0.85,
                          },
                        },
                      }}
                    />
                  </Box>

                  <Button
                    type="submit"
                    size="large"
                    fullWidth
                    variant="contained"
                    disabled={!email.trim() || busy}
                    sx={{
                      height: 48,
                      fontSize: "0.95rem",
                      fontWeight: 750,
                      textTransform: "none",
                      borderRadius: 2.5,
                      background: "linear-gradient(90deg, #0d9488, #0f766e) !important",
                      color: "#ffffff !important",
                      boxShadow: "0 6px 18px rgba(13, 148, 136, 0.32)",
                      "&:hover": {
                        background: "linear-gradient(90deg, #0f766e, #115e59) !important",
                        boxShadow: "0 8px 22px rgba(13, 148, 136, 0.42)",
                        transform: "translateY(-1px)",
                      },
                      "&:disabled": {
                        background: "action.disabledBackground !important",
                        color: "text.disabled !important",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {busy ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={18} color="inherit" />
                        <span>Sending Security Code...</span>
                      </Stack>
                    ) : (
                      "Send Secure Code →"
                    )}
                  </Button>

                  <Divider sx={{ my: 0.25 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Need help?
                    </Typography>
                  </Divider>

                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<SupportAgentOutlined />}
                    onClick={() => setSupportOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.85rem",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Can't access registered email?
                  </Button>

                  {/* Security Footnote */}
                  <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={1.25}
                    divider={<Divider orientation="vertical" flexItem />}
                    sx={{ pt: 0.25 }}
                  >
                    <Typography variant="caption" fontWeight={700} sx={{ color: "#0d9488", fontSize: "0.72rem" }}>
                      ◈ 256-Bit TLS
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: "#0d9488", fontSize: "0.72rem" }}>
                      ▣ Single-Use OTP
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: "#0d9488", fontSize: "0.72rem" }}>
                      ◉ Audit Logged
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ) : (
              /* OTP Stage */
              <Box component="form" onSubmit={handleOtpSubmit}>
                <Button
                  startIcon={<ArrowBackRounded />}
                  onClick={() => setStage("login")}
                  sx={{
                    mb: 1.5,
                    textTransform: "none",
                    fontWeight: 700,
                    color: "text.secondary",
                    fontSize: "0.85rem",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  Change Email
                </Button>

                <Typography variant="h5" fontWeight={850} textAlign="center" sx={{ letterSpacing: "-0.02em" }}>
                  Enter Verification Code
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 0.75, mb: 2.5 }}
                >
                  We have sent a 6-digit verification code to
                  <br />
                  <Typography
                    component="span"
                    fontWeight={800}
                    color="text.primary"
                    sx={{ wordBreak: "break-all" }}
                  >
                    {email}
                  </Typography>
                </Typography>

                <Stack spacing={2}>
                  <OtpInputField
                    value={code}
                    onChange={setCode}
                    disabled={busy}
                    onSubmit={() => {
                      if (code.join("").length === 6 && !busy && expires > 0) {
                        void verify();
                      }
                    }}
                  />

                  <Typography
                    variant="caption"
                    textAlign="center"
                    fontWeight={700}
                    color={expires < 60 ? "error.main" : "text.secondary"}
                  >
                    {expires > 0 ? `Code expires in ${formatTime(expires)}` : "Code has expired"}
                  </Typography>

                  <Button
                    type="submit"
                    size="large"
                    fullWidth
                    variant="contained"
                    disabled={busy || !expires || code.join("").length !== 6}
                    sx={{
                      height: 48,
                      fontSize: "0.95rem",
                      fontWeight: 750,
                      textTransform: "none",
                      borderRadius: 2.5,
                      background: "linear-gradient(90deg, #0d9488, #0f766e) !important",
                      color: "#ffffff !important",
                      boxShadow: "0 6px 18px rgba(13, 148, 136, 0.32)",
                      "&:hover": {
                        background: "linear-gradient(90deg, #0f766e, #115e59) !important",
                      },
                    }}
                  >
                    {busy ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={18} color="inherit" />
                        <span>Verifying Code...</span>
                      </Stack>
                    ) : (
                      "Verify & Access Portal →"
                    )}
                  </Button>

                  <Box sx={{ textAlign: "center", pt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Didn't receive the code?{" "}
                      {resend > 0 ? (
                        <Typography component="span" variant="caption" fontWeight={750} color="text.secondary">
                          Resend in {formatTime(resend)}
                        </Typography>
                      ) : (
                        <Button
                          size="small"
                          onClick={() => void send(true)}
                          disabled={busy}
                          sx={{ textTransform: "none", fontWeight: 750, p: 0 }}
                        >
                          Resend Code Now
                        </Button>
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* Error & Notice Alerts */}
            {(error || notice) && (
              <Alert
                severity={error ? "error" : "success"}
                sx={{ mt: 2.5, borderRadius: 2.5 }}
                aria-live="polite"
              >
                {error || notice}
              </Alert>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          py: 1.75,
          mt: "auto",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            gap={1}
            sx={{
              color: "text.secondary",
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Typography variant="caption" fontWeight={600}>
              ◈ Secure Alumni Portal • Authorized former employees only
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Support / Help Dialog */}
      <Dialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 850 }}>
          Alumni Access Assistance
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              If your personal email address has changed or you are not receiving the one-time code:
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "action.hover" }}>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                1. Check Spam / Junk Folder
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Verification emails are sent instantly from Codeji Identity Service. Search for "Codeji Sign In".
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "action.hover" }}>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                2. Contact People Operations
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Email HR directly at <strong>hr@codeji.in</strong> with your Full Name, Employee ID, and updated personal email address.
              </Typography>
            </Paper>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setSupportOpen(false)}
              sx={{
                mt: 1,
                textTransform: "none",
                fontWeight: 750,
                background: "linear-gradient(90deg, #0d9488, #0f766e)",
                color: "#ffffff !important",
              }}
            >
              Got it
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const FeatureBullet = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 2,
        bgcolor: "rgba(255, 255, 255, 0.16)",
        color: "white",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.25, color: "white" }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", display: "block", lineHeight: 1.35, mt: 0.25 }}>
        {text}
      </Typography>
    </Box>
  </Stack>
);

const OtpInputField = ({
  value,
  onChange,
  disabled,
  onSubmit,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
  onSubmit: () => void;
}) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, entered: string) => {
    const next = [...value];
    const cleaned = entered.replace(/\D/g, "").slice(-1);
    next[index] = cleaned;
    onChange(next);
    if (cleaned && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    if (digits.length) {
      e.preventDefault();
      const next = Array.from({ length: 6 }, (_, i) => digits[i] || "");
      onChange(next);
      const lastIndex = Math.min(digits.length, 5);
      refs.current[lastIndex]?.focus();
    }
  };

  return (
    <Stack direction="row" justifyContent="center" spacing={{ xs: 0.75, sm: 1.25 }}>
      {value.map((digit, i) => (
        <TextField
          key={i}
          inputRef={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          inputProps={{
            "aria-label": `Digit ${i + 1}`,
            inputMode: "numeric",
            pattern: "[0-9]*",
            autoComplete: i === 0 ? "one-time-code" : "off",
            maxLength: 1,
            style: {
              textAlign: "center",
              fontSize: 20,
              fontWeight: 800,
              padding: "10px 0",
            },
          }}
          sx={{
            width: { xs: 42, sm: 48 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.25,
              height: 48,
              bgcolor: "action.hover",
              "& fieldset": {
                borderColor: "divider",
                borderWidth: "1.5px",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#0d9488",
                borderWidth: "2px",
              },
            },
          }}
        />
      ))}
    </Stack>
  );
};
