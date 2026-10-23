import {
  AccessTimeRounded,
  BadgeOutlined,
  CalendarTodayOutlined,
  DescriptionOutlined,
  DownloadRounded,
  ExitToAppRounded,
  FolderOpenRounded,
  HomeRounded,
  LogoutRounded,
  OpenInNewRounded,
  PersonOutlineRounded,
  QuestionAnswerOutlined,
  ReceiptLongOutlined,
  RefreshRounded,
  SecurityRounded,
  ShieldOutlined,
  SupportAgentOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LightDarkMode from "../../../_themes/layout/components/header/navbarmenus/LightDarkMode";
import { BaseUrl } from "../../../utils/constant/Constant";
import { CompanyCareerTheme } from "../careerPortal/components/CompanyCareerTheme";
import { AlumniAuthView } from "./components/AlumniAuthView";
import { AlumniCredentialCard } from "./components/AlumniCredentialCard";
import { AlumniDocumentPreviewModal } from "./components/AlumniDocumentPreviewModal";
import { AlumniDocumentVault } from "./components/AlumniDocumentVault";
import { AlumniHelpCenter } from "./components/AlumniHelpCenter";
import { AlumniJourneyStepper } from "./components/AlumniJourneyStepper";
import { AlumniRequestDesk } from "./components/AlumniRequestDesk";
import {
  FormerEmployeePortalCase,
  createFormerEmployeePortalRequest,
  formerEmployeeDocumentPreviewUrl,
  formerEmployeeDocumentUrl,
  getFormerEmployeePortalCase,
  logoutFormerEmployeePortal,
  redeemFormerEmployeePortalInvite,
  requestFormerEmployeeOtp,
  verifyFormerEmployeeContact,
  verifyFormerEmployeeOtp,
} from "./formerEmployeePortalService";

const sessionKey = "former_employee_portal_session";
const themeKey = "former_employee_portal_theme";

const requestTypes = [
  "RelievingLetter",
  "ExperienceLetter",
  "FnFStatement",
  "TaxDocument",
  "Correction",
  "Other",
];

type View = "home" | "documents" | "requests" | "support" | "profile";

const readable = (value: string) => value.replace(/([A-Z])/g, " $1").trim();

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Not available";

export const FormerEmployeePortalExperience = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(
    () => sessionStorage.getItem(sessionKey) ?? "",
  );
  const [theme, setTheme] = useState(
    () => sessionStorage.getItem(themeKey) ?? "glass",
  );
  const [brand, setBrand] = useState({ name: "Codeji Infotech Pvt Ltd", logo: "" });
  const [data, setData] = useState<FormerEmployeePortalCase | null>(null);
  const [stage, setStage] = useState<"login" | "otp">("login");
  const [view, setView] = useState<View>("home");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(Array(6).fill(""));
  const [expires, setExpires] = useState(300);
  const [resend, setResend] = useState(30);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Request Desk dialog state
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestType, setRequestType] = useState(requestTypes[0]);
  const [details, setDetails] = useState("");

  // Document Preview Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [currentEvidenceId, setCurrentEvidenceId] = useState("");

  const load = async (token = session) => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await getFormerEmployeePortalCase(token);
      if (!response.data.success || !response.data.methodResult) throw new Error();
      setData(response.data.methodResult);
      if (response.data.methodResult.companyName) {
        setBrand({
          name: response.data.methodResult.companyName,
          logo: response.data.methodResult.companyLogo || "",
        });
      }
    } catch {
      sessionStorage.removeItem(sessionKey);
      setSession("");
      setData(null);
      setError(
        "Your secure session has expired or access has changed. Please sign in again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const tokenHandledRef = useRef(false);

  useEffect(() => {
    const token = params.get("token");
    if (params.get("verify-contact") === "true" && token) {
      if (tokenHandledRef.current) return;
      tokenHandledRef.current = true;
      verifyFormerEmployeeContact(token)
        .then(({ data: response }) => {
          if (!response.success) throw new Error();
          setNotice(
            "Your post-exit email is verified. You can sign in below with a secure code.",
          );
          navigate("/former-employee", { replace: true });
        })
        .catch(() => {
          setError(
            "This verification link is invalid, expired, or has already been used. If your email is already verified, enter it below to receive a secure code.",
          );
          navigate("/former-employee", { replace: true });
        })
        .finally(() => setLoading(false));
      return;
    }
    if (!token) {
      void load();
      return;
    }
    if (tokenHandledRef.current) return;
    tokenHandledRef.current = true;
    redeemFormerEmployeePortalInvite(token)
      .then(({ data: response }) => {
        if (!response.success || !response.methodResult) throw new Error();
        if (response.methodResult.theme) {
          sessionStorage.setItem(themeKey, response.methodResult.theme);
          setTheme(response.methodResult.theme);
        }
        setBrand({
          name: response.methodResult.companyName || "Codeji Infotech Pvt Ltd",
          logo: response.methodResult.companyLogo || "",
        });
        sessionStorage.setItem(sessionKey, response.methodResult.sessionToken);
        setSession(response.methodResult.sessionToken);
        navigate("/former-employee", { replace: true });
        return load(response.methodResult.sessionToken);
      })
      .catch(() => {
        setError(
          "This invitation link is invalid, expired, or has already been used. Please ask HR for a new invitation or enter your email below.",
        );
        navigate("/former-employee", { replace: true });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (stage !== "otp") return;
    const id = window.setInterval(() => {
      setExpires((x) => Math.max(0, x - 1));
      setResend((x) => Math.max(0, x - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  const send = async (isResend = false) => {
    if (!email.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await requestFormerEmployeeOtp(email.trim());
      if (!response.data.success) throw new Error();
      setStage("otp");
      setCode(Array(6).fill(""));
      setExpires(300);
      setResend(30);
      setNotice(
        isResend
          ? "A fresh verification code has been sent."
          : "If this email has access, a six-digit security code has been sent.",
      );
    } catch {
      setError(
        "We could not send a code right now. Check the email address or contact HR.",
      );
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    const otp = code.join("");
    if (otp.length !== 6 || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await verifyFormerEmployeeOtp(email.trim(), otp);
      if (!response.data.success || !response.data.methodResult) throw new Error();
      sessionStorage.setItem(sessionKey, response.data.methodResult.sessionToken);
      if (response.data.methodResult.theme) {
        sessionStorage.setItem(themeKey, response.data.methodResult.theme);
        setTheme(response.data.methodResult.theme);
      }
      setBrand({
        name: response.data.methodResult.companyName || brand.name,
        logo: response.data.methodResult.companyLogo || "",
      });
      setSession(response.data.methodResult.sessionToken);
      setLoading(true);
      await load(response.data.methodResult.sessionToken);
    } catch {
      setError("That code is invalid or expired. Request a new code and try again.");
      setCode(Array(6).fill(""));
    } finally {
      setBusy(false);
    }
  };

  const submitRequest = async () => {
    if (!details.trim() || busy) return;
    setBusy(true);
    try {
      const response = await createFormerEmployeePortalRequest(session, {
        type: requestType,
        details: details.trim(),
      });
      if (!response.data.success) throw new Error();
      setDetails("");
      setRequestOpen(false);
      setNotice("Your request has been sent to HR successfully.");
      await load();
    } catch {
      setError("Your request could not be submitted. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleDocumentAction = async (
    id: string,
    name: string | undefined,
    preview: boolean,
  ) => {
    setCurrentEvidenceId(id);
    const fileName = name || "former-employee-document.pdf";
    setPreviewTitle(fileName);

    if (preview) {
      setPreviewOpen(true);
      setPreviewLoading(true);
      setPreviewUrl(null);
    }

    try {
      const path = preview
        ? formerEmployeeDocumentPreviewUrl(id)
        : formerEmployeeDocumentUrl(id);
      const response = await fetch(`${BaseUrl}/${path}`, {
        headers: { "X-Former-Employee-Session": session },
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (preview) {
        setPreviewUrl(url);
      } else {
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch {
      if (preview) setPreviewOpen(false);
      setError("That document is no longer available. Refresh and try again.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutFormerEmployeePortal(session);
    } finally {
      sessionStorage.removeItem(sessionKey);
      setSession("");
      setData(null);
      setStage("login");
      setView("home");
      setNotice("You have signed out securely.");
    }
  };

  const initials = useMemo(
    () =>
      data?.profile?.fullName
        .split(" ")
        .filter(Boolean)
        .map((x) => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "FE",
    [data?.profile?.fullName],
  );

  return (
    <CompanyCareerTheme theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
        {loading ? (
          <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default" }}>
            <Stack alignItems="center" spacing={2.5}>
              <CircularProgress size={42} thickness={4} />
              <Typography variant="body1" fontWeight={700} color="text.secondary">
                Preparing your secure alumni portal...
              </Typography>
            </Stack>
          </Box>
        ) : !session ? (
          <AlumniAuthView
            stage={stage}
            email={email}
            setEmail={setEmail}
            code={code}
            setCode={setCode}
            expires={expires}
            resend={resend}
            busy={busy}
            error={error}
            notice={notice}
            send={send}
            verify={verify}
            setStage={setStage}
            brand={brand}
          />
        ) : data ? (
          <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Top Navigation Bar */}
            <Paper
              elevation={0}
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                backdropFilter: "blur(16px)",
              }}
            >
              <Container maxWidth="xl">
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ py: 1.5 }}
                >
                  {/* Brand */}
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {data.companyLogo ? (
                      <Box
                        component="img"
                        src={data.companyLogo}
                        alt=""
                        sx={{ width: 36, height: 36, objectFit: "contain", borderRadius: 2 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: "primary.main",
                          color: "white",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <ShieldOutlined fontSize="small" />
                      </Box>
                    )}
                    <Box>
                      <Typography fontWeight={850} fontSize={15} lineHeight={1.2}>
                        {data.companyName || "Codeji Infotech"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={650}>
                        Alumni Portal
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Desktop Navigation Tabs */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ display: { xs: "none", md: "flex" } }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        bgcolor: "action.hover",
                        p: 0.5,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {(
                        [
                          { key: "home", label: "Dashboard", icon: <HomeRounded fontSize="small" /> },
                          { key: "documents", label: "Documents", icon: <FolderOpenRounded fontSize="small" /> },
                          { key: "requests", label: "Requests", icon: <ReceiptLongOutlined fontSize="small" /> },
                          { key: "support", label: "Help Center", icon: <SupportAgentOutlined fontSize="small" /> },
                        ] as { key: View; label: string; icon: React.ReactNode }[]
                      ).map((item) => (
                        <Button
                          key={item.key}
                          variant="text"
                          startIcon={item.icon}
                          onClick={() => setView(item.key)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 750,
                            fontSize: "0.875rem",
                            px: 2,
                            py: 0.75,
                            borderRadius: 2.5,
                            color: view === item.key ? "#ffffff !important" : "text.secondary",
                            bgcolor:
                              view === item.key
                                ? "linear-gradient(90deg, #0d9488, #0f766e)"
                                : "transparent",
                            background:
                              view === item.key
                                ? "linear-gradient(90deg, #0d9488, #0f766e)"
                                : "transparent",
                            boxShadow: view === item.key ? "0 4px 12px rgba(13, 148, 136, 0.3)" : "none",
                            "&:hover": {
                              bgcolor: view === item.key ? "#0f766e" : "action.selected",
                            },
                          }}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </Box>
                  </Stack>

                  {/* Right Actions (Theme, Profile, Logout) */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LightDarkMode sx={{ width: 36, height: 36 }} />

                    <Tooltip title="View Alumni Profile">
                      <IconButton
                        onClick={() => setView("profile")}
                        sx={{
                          p: 0.5,
                          border: "2px solid",
                          borderColor: view === "profile" ? "primary.main" : "transparent",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            bgcolor: "primary.main",
                            color: "white",
                            fontWeight: 800,
                            fontSize: 14,
                          }}
                        >
                          {initials}
                        </Avatar>
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="End Secure Session">
                      <IconButton onClick={logout} sx={{ color: "error.main" }}>
                        <LogoutRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Container>
            </Paper>

            {/* Global Notice/Alert */}
            {(notice || error) && (
              <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Alert
                  severity={error ? "error" : "success"}
                  onClose={() => {
                    setNotice("");
                    setError("");
                  }}
                  sx={{ borderRadius: 2.5 }}
                >
                  {error || notice}
                </Alert>
              </Container>
            )}

            {/* Main Content Area */}
            <Box sx={{ flex: 1, py: { xs: 2.5, md: 4 }, pb: { xs: 10, md: 5 } }}>
              <Container maxWidth="xl">
                {view === "home" && (
                  <Stack spacing={3.5}>
                    {/* Welcome Hero Banner */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 4,
                        color: "white",
                        background:
                          "linear-gradient(135deg, #042f2e 0%, #0d9488 60%, #14b8a6 100%)",
                        boxShadow: "0 18px 45px -10px rgba(13, 148, 136, 0.3)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ md: "center" }}
                        gap={3}
                        sx={{ position: "relative", zIndex: 1 }}
                      >
                        <Box sx={{ maxWidth: 640 }}>
                          <Chip
                            icon={<ShieldOutlined sx={{ color: "white !important" }} />}
                            label="Verified Alumni Access"
                            size="small"
                            sx={{
                              bgcolor: "rgba(255, 255, 255, 0.18)",
                              color: "white",
                              fontWeight: 750,
                              mb: 1.5,
                            }}
                          />
                          <Typography
                            variant="h4"
                            fontWeight={900}
                            sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" }, letterSpacing: "-0.02em" }}
                          >
                            Welcome back, {data.profile?.fullName?.split(" ")[0] || "Alumni"} 👋
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 1, color: "rgba(255, 255, 255, 0.88)", lineHeight: 1.6 }}>
                            Your official employment records, relieving certificates, and service documents are ready for immediate download.
                          </Typography>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{
                            bgcolor: "rgba(0, 0, 0, 0.22)",
                            p: 2,
                            borderRadius: 3,
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          <Box sx={{ textAlign: "center", px: 1.5 }}>
                            <Typography variant="h5" fontWeight={850} color="white">
                              {data.documents.length}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: 650 }}>
                              Documents Available
                            </Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255, 255, 255, 0.2)" }} />
                          <Box sx={{ textAlign: "center", px: 1.5 }}>
                            <Typography variant="h5" fontWeight={850} color="white">
                              {data.requests.length}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: 650 }}>
                              Total Requests
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Paper>

                    {/* Alumni Digital Credential Card */}
                    <AlumniCredentialCard data={data} initials={initials} />

                    {/* Transition Stepper */}
                    <AlumniJourneyStepper
                      status={data.status}
                      lastWorkingDate={data.lastWorkingDate}
                    />

                    {/* Two Column Layout: Quick Actions & Recent Documents */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.2fr) minmax(0, 0.8fr)" },
                        gap: 3,
                      }}
                    >
                      {/* Left: Recent Documents Vault */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <FolderOpenRounded color="primary" />
                            <Typography variant="h6" fontWeight={850}>
                              Recent Documents
                            </Typography>
                          </Stack>
                          <Button
                            size="small"
                            onClick={() => setView("documents")}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                          >
                            View All ({data.documents.length})
                          </Button>
                        </Stack>

                        {data.documents.length > 0 ? (
                          <Stack spacing={1.5}>
                            {data.documents.slice(0, 3).map((doc) => (
                              <Paper
                                key={doc.evidenceId}
                                variant="outlined"
                                sx={{
                                  p: 1.75,
                                  borderRadius: 2.5,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                                  <DescriptionOutlined color="primary" />
                                  <Typography variant="body2" fontWeight={750} noWrap>
                                    {doc.fileName || "Employment Document"}
                                  </Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDocumentAction(doc.evidenceId, doc.fileName, true)}
                                    title="Preview"
                                  >
                                    <OpenInNewRounded fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDocumentAction(doc.evidenceId, doc.fileName, false)}
                                    title="Download"
                                    color="primary"
                                  >
                                    <DownloadRounded fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Paper>
                            ))}
                          </Stack>
                        ) : (
                          <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                            <DescriptionOutlined sx={{ fontSize: 44, opacity: 0.5, mb: 1 }} />
                            <Typography variant="body2">No documents available yet.</Typography>
                          </Box>
                        )}
                      </Paper>

                      {/* Right: Quick Request Desk */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                            <QuestionAnswerOutlined color="primary" />
                            <Typography variant="h6" fontWeight={850}>
                              Need Support or Records?
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            Have questions regarding your Full & Final settlement, Form 16, or need a customized service certificate?
                          </Typography>
                        </Box>

                        <Stack spacing={1.5}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => {
                              setRequestType("RelievingLetter");
                              setRequestOpen(true);
                            }}
                            sx={{
                              py: 1.2,
                              textTransform: "none",
                              fontWeight: 750,
                              background: "linear-gradient(90deg, #0d9488, #0f766e)",
                              color: "#ffffff !important",
                            }}
                          >
                            + Raise HR Request
                          </Button>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setView("support")}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                          >
                            Browse FAQ & Help Center
                          </Button>
                        </Stack>
                      </Paper>
                    </Box>
                  </Stack>
                )}

                {view === "documents" && (
                  <AlumniDocumentVault
                    documents={data.documents}
                    onDocument={handleDocumentAction}
                    onRequestDocument={() => {
                      setRequestType("RelievingLetter");
                      setRequestOpen(true);
                    }}
                  />
                )}

                {view === "requests" && (
                  <AlumniRequestDesk
                    requests={data.requests}
                    requestTypes={requestTypes}
                    requestOpen={requestOpen}
                    busy={busy}
                    type={requestType}
                    details={details}
                    setType={setRequestType}
                    setDetails={setDetails}
                    setRequestOpen={setRequestOpen}
                    onSubmit={submitRequest}
                    onDownloadAttachment={(id) => handleDocumentAction(id, "resolution-document.pdf", false)}
                  />
                )}

                {view === "support" && (
                  <AlumniHelpCenter
                    companyName={data.companyName}
                    onRequest={() => {
                      setRequestType("Other");
                      setRequestOpen(true);
                    }}
                  />
                )}

                {view === "profile" && (
                  <Stack spacing={3.5}>
                    <AlumniCredentialCard data={data} initials={initials} />

                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.5, sm: 3.5 },
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Typography variant="h6" fontWeight={850} sx={{ mb: 2 }}>
                        Verified Employment Record
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                          gap: 2.5,
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            FULL NAME
                          </Typography>
                          <Typography variant="body1" fontWeight={750} sx={{ mt: 0.5 }}>
                            {data.profile?.fullName || "Not provided"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            EMPLOYEE IDENTIFIER
                          </Typography>
                          <Typography variant="body1" fontWeight={750} sx={{ mt: 0.5 }}>
                            {data.profile?.employeeId || "N/A"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            DESIGNATION / ROLE
                          </Typography>
                          <Typography variant="body1" fontWeight={750} sx={{ mt: 0.5 }}>
                            {data.profile?.jobRole || "Alumni"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            DEPARTMENT
                          </Typography>
                          <Typography variant="body1" fontWeight={750} sx={{ mt: 0.5 }}>
                            {data.profile?.department || "General"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            TENURE COMMENCED
                          </Typography>
                          <Typography variant="body1" fontWeight={750} sx={{ mt: 0.5 }}>
                            {formatDate(data.profile?.dateOfJoining)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            SEPARATION DATE (LWD)
                          </Typography>
                          <Typography variant="body1" fontWeight={750} sx={{ mt: 0.5 }}>
                            {formatDate(data.lastWorkingDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.5, sm: 3.5 },
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ sm: "center" }}
                        gap={2}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={850}>
                            Active Alumni Session
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Your session is cryptographically bound to this device and browser.
                          </Typography>
                        </Box>
                        <Button
                          color="error"
                          variant="outlined"
                          startIcon={<LogoutRounded />}
                          onClick={logout}
                          sx={{ textTransform: "none", fontWeight: 750 }}
                        >
                          Sign Out of Portal
                        </Button>
                      </Stack>
                    </Paper>
                  </Stack>
                )}
              </Container>
            </Box>

            {/* Mobile Bottom Navigation Bar */}
            <Paper
              elevation={8}
              sx={{
                display: { xs: "flex", md: "none" },
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                bgcolor: "background.paper",
                borderTop: "1px solid",
                borderColor: "divider",
                py: 0.5,
              }}
            >
              {(
                [
                  { key: "home", label: "Home", icon: <HomeRounded fontSize="small" /> },
                  { key: "documents", label: "Documents", icon: <FolderOpenRounded fontSize="small" /> },
                  { key: "requests", label: "Requests", icon: <ReceiptLongOutlined fontSize="small" /> },
                  { key: "support", label: "Help", icon: <SupportAgentOutlined fontSize="small" /> },
                  { key: "profile", label: "Profile", icon: <PersonOutlineRounded fontSize="small" /> },
                ] as { key: View; label: string; icon: React.ReactNode }[]
              ).map((item) => (
                <Button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  sx={{
                    minWidth: 0,
                    flex: 1,
                    flexDirection: "column",
                    gap: 0.25,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "none",
                    color: view === item.key ? "primary.main" : "text.secondary",
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </Paper>
          </Box>
        ) : (
          <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}>
            <Paper sx={{ p: 4, maxWidth: 420, textAlign: "center", borderRadius: 3 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error || "We could not load your alumni portal session."}
              </Alert>
              <Button
                variant="contained"
                onClick={() => void load()}
                startIcon={<RefreshRounded />}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Retry
              </Button>
            </Paper>
          </Box>
        )}

        {/* Global Document Preview Modal */}
        <AlumniDocumentPreviewModal
          open={previewOpen}
          title={previewTitle}
          url={previewUrl}
          loading={previewLoading}
          onClose={() => setPreviewOpen(false)}
          onDownload={() => {
            if (currentEvidenceId) {
              void handleDocumentAction(currentEvidenceId, previewTitle, false);
            }
          }}
        />
      </Box>
    </CompanyCareerTheme>
  );
};
