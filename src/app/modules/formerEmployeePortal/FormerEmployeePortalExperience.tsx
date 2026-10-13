import {
  ArrowBackRounded,
  CheckCircleRounded,
  DescriptionOutlined,
  DownloadRounded,
  EmailOutlined,
  FolderOutlined,
  HomeRounded,
  LockOutlined,
  LogoutRounded,
  OpenInNewRounded,
  PersonOutlineRounded,
  ReceiptLongOutlined,
  RequestPageOutlined,
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
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BaseUrl } from "../../../utils/constant/Constant";
import { CompanyCareerTheme } from "../careerPortal/components/CompanyCareerTheme";
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

const sessionKey = "former_employee_portal_session",
  themeKey = "former_employee_portal_theme";
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
const date = (value?: string) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Not available";
const publicLabel = (value?: string) =>
  !value ||
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? "Not available"
    : value;
const time = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

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
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestType, setRequestType] = useState(requestTypes[0]);
  const [details, setDetails] = useState("");
  const load = async (token = session) => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await getFormerEmployeePortalCase(token);
      if (!response.data.success || !response.data.methodResult)
        throw new Error();
      setData(response.data.methodResult);
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
        setBrand({ name: response.methodResult.companyName || "Codeji Infotech Pvt Ltd", logo: response.methodResult.companyLogo || "" });
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
      if (!response.data.success || !response.data.methodResult)
        throw new Error();
      sessionStorage.setItem(
        sessionKey,
        response.data.methodResult.sessionToken,
      );
      if (response.data.methodResult.theme) {
        sessionStorage.setItem(themeKey, response.data.methodResult.theme);
        setTheme(response.data.methodResult.theme);
      }
      setBrand({ name: response.data.methodResult.companyName || brand.name, logo: response.data.methodResult.companyLogo || "" });
      setSession(response.data.methodResult.sessionToken);
      setLoading(true);
      await load(response.data.methodResult.sessionToken);
    } catch {
      setError(
        "That code is invalid or expired. Request a new code and try again.",
      );
      setCode(Array(6).fill(""));
    } finally {
      setBusy(false);
    }
  };
  const submit = async () => {
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
      setNotice("Your request has been sent to HR.");
      await load();
    } catch {
      setError("Your request could not be submitted. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const document = async (
    id: string,
    name: string | undefined,
    preview: boolean,
  ) => {
    const tab = preview ? window.open("", "_blank") : null;
    try {
      const path = preview
        ? formerEmployeeDocumentPreviewUrl(id)
        : formerEmployeeDocumentUrl(id);
      const response = await fetch(`${BaseUrl}/${path}`, {
        headers: { "X-Former-Employee-Session": session },
      });
      if (!response.ok) throw new Error();
      const url = URL.createObjectURL(await response.blob());
      if (preview && tab) tab.location.href = url;
      else {
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = name || "former-employee-document";
        anchor.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      tab?.close();
      setError("That document is no longer available. Refresh and try again.");
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
      <Box sx={root}>
        {loading ? (
          <Loading />
        ) : !session ? (
        <Access
            {...{
              stage,
              email,
              code,
              expires,
              resend,
              busy,
              error,
              notice,
              setEmail,
              setCode,
              send,
              verify,
              setStage,
              brand,
            }}
          />
        ) : data ? (
          <Portal
            {...{
              data,
              initials,
              view,
              setView,
              logout,
              document,
              setRequestOpen,
            }}
          />
        ) : (
          <ErrorState
            text={error || "We could not load your portal."}
            retry={() => void load()}
          />
        )}
      </Box>
      <RequestModal
        open={requestOpen}
        busy={busy}
        type={requestType}
        details={details}
        setType={setRequestType}
        setDetails={setDetails}
        close={() => setRequestOpen(false)}
        submit={submit}
      />
    </CompanyCareerTheme>
  );
};

const Brand = ({ name = "Codeji Infotech Pvt Ltd", logo = "" }: { name?: string; logo?: string }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box sx={brandMark}>
      {logo ? <Box component="img" src={logo} alt="" sx={{ width: 24, height: 24, objectFit: "contain" }} /> : <ShieldOutlined />}
    </Box>
    <Box>
      <Typography fontWeight={850} lineHeight={1.1}>
        {name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Former Employee Portal
      </Typography>
    </Box>
  </Stack>
);
const Access = ({
  stage,
  email,
  code,
  expires,
  resend,
  busy,
  error,
  notice,
  setEmail,
  setCode,
  send,
  verify,
  setStage,
  brand,
}: any) => (
  <Box sx={publicPage}>
    <Container
      maxWidth="xl"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ py: { xs: 2, md: 3 } }}
      >
        <Brand name={brand?.name} logo={brand?.logo} />
        <Box sx={{ display: { xs: "none", md: "block" }, width: 80 }} />
      </Stack>
      <Box sx={stage === "otp" ? otpLayout : accessLayout}>
        {stage === "login" && (
          <Box sx={welcome}>
            <Typography variant="h2" fontWeight={850} sx={{ fontSize: { md: "2rem", lg: "2.35rem" }, lineHeight: 1.05 }}>
              Welcome Back!
            </Typography>
            <Typography
              sx={{ color: "#008b90", fontSize: { md: 18, lg: 20 }, fontWeight: 600 }}
            >
              We're here for you.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 330, fontSize: { md: 13, lg: 14 } }}>
              Access your documents, request support and stay connected even
              after your journey with us.
            </Typography>
            <Stack spacing={{ md: 1.5, lg: 2 }} sx={{ mt: { md: 3, lg: 4 } }}>
              <Feature
                icon={<LockOutlined />}
                title="Secure & Private"
                text="Your data is encrypted and protected"
              />
              <Feature
                icon={<DescriptionOutlined />}
                title="Easy Access"
                text="All your documents in one place"
              />
              <Feature
                icon={<SupportAgentOutlined />}
                title="We're Here to Help"
                text="Raise requests and get support"
              />
            </Stack>
          </Box>
        )}
        <Paper key={stage} elevation={0} sx={stage === "otp" ? otpCard : accessCard}>
          {stage === "login" ? (
            <Stack spacing={2}>
              <Typography variant="caption" sx={{ alignSelf: "flex-end", color: "text.secondary", fontWeight: 700 }}>◉ English⌄</Typography>
              <ShieldGraphic />
              <Chip
                icon={<SecurityRounded />}
                label="Protected Sign In"
                size="small"
                sx={{
                  alignSelf: "center",
                  bgcolor: "#DDF7F4",
                  color: "#007D83",
                }}
              />
              <Typography variant="h5" fontWeight={850} textAlign="center" sx={{ fontSize: { xs: "1.45rem", md: "1.75rem", lg: "2rem" }, letterSpacing: "-.03em" }}>
                Let's verify your access
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                Enter your registered email to receive a secure verification
                code.
              </Typography>
              <TextField
                label="Email or mobile number"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <EmailOutlined sx={{ mr: 1, color: "text.disabled" }} />
                  ),
                }}
              />
              <Button
                size="large"
                variant="contained"
                disabled={!email.trim() || busy}
                onClick={() => void send()}
              >
                {busy ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Send Secure Code →"
                )}
              </Button>
              <Divider>Need help?</Divider>
              <Button startIcon={<SupportAgentOutlined />}>
                Contact Support
              </Button>
              <Indicators />
            </Stack>
          ) : (
            <Otp
              {...{
                email,
                code,
                expires,
                resend,
                busy,
                setCode,
                verify,
                send,
                setStage,
              }}
            />
          )}
          {(error || notice) && (
            <Alert
              severity={error ? "error" : "success"}
              sx={{ mt: 2 }}
              aria-live="polite"
            >
              {error || notice}
            </Alert>
          )}
        </Paper>
      </Box>
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          justifyContent: "space-between",
          pb: 2.5,
        }}
      >
        <Typography variant="caption">
          ◈ Secure portal for former employees only
        </Typography>
        <Typography variant="caption">
          © 2026 Codeji Infotech Pvt Ltd. All rights reserved.
        </Typography>
      </Box>
    </Container>
  </Box>
);
const Otp = ({
  email,
  code,
  expires,
  resend,
  busy,
  setCode,
  verify,
  send,
  setStage,
}: any) => (
  <Stack spacing={2} sx={{ animation: "otpContentEnter .5s ease-out both" }}>
    <Button
      startIcon={<ArrowBackRounded />}
      onClick={() => setStage("login")}
      sx={{ alignSelf: "flex-start" }}
    >
      Back
    </Button>
    <Typography variant="h5" fontWeight={850} textAlign="center">
      Enter Verification Code
    </Typography>
    <Typography variant="body2" color="text.secondary" textAlign="center">
      We've sent a 6-digit code to
      <br />
      <strong>{email}</strong>
    </Typography>
    <OtpInput value={code} onChange={setCode} disabled={busy} />
    <Typography
      variant="caption"
      textAlign="center"
      color={expires ? "text.secondary" : "error"}
    >
      {expires ? `Code expires in ${time(expires)}` : "Code expired"}
    </Typography>
    <Button
      variant="contained"
      size="large"
      disabled={busy || !expires || code.join("").length !== 6}
      onClick={() => void verify()}
      sx={busy ? { animation: "verifyPulse 1s ease-in-out infinite" } : undefined}
    >
      {busy ? <CircularProgress size={20} color="inherit" /> : "Verify Code"}
    </Button>
    <Typography variant="caption" textAlign="center">
      Didn't receive the code?{" "}
      {resend ? (
        `Resend in ${time(resend)}`
      ) : (
        <Button size="small" onClick={() => void send(true)}>
          Resend Code
        </Button>
      )}
    </Typography>
    <Indicators />
  </Stack>
);
const OtpInput = ({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
}) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const update = (i: number, entered: string) => {
    const next = [...value];
    next[i] = entered.replace(/\D/g, "").slice(-1);
    onChange(next);
    if (next[i] && i < 5) refs.current[i + 1]?.focus();
  };
  return (
    <Stack direction="row" justifyContent="center" spacing={{ xs: 0.6, sm: 1 }}>
      {value.map((item, i) => (
        <TextField
          key={i}
          inputRef={(x) => {
            refs.current[i] = x;
          }}
          value={item}
          disabled={disabled}
          onChange={(e) => update(i, e.target.value)}
          onPaste={(e) => {
            const digits = e.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, 6)
              .split("");
            if (digits.length) {
              e.preventDefault();
              onChange(Array.from({ length: 6 }, (_, x) => digits[x] || ""));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !item && i)
              refs.current[i - 1]?.focus();
          }}
          inputProps={{
            "aria-label": `Verification digit ${i + 1}`,
            inputMode: "numeric",
            autoComplete: i === 0 ? "one-time-code" : "off",
            maxLength: 1,
            style: {
              textAlign: "center",
              fontSize: 20,
              fontWeight: 850,
              padding: "12px 0",
            },
          }}
          sx={{ width: { xs: 43, sm: 52 } }}
        />
      ))}
    </Stack>
  );
};
const Portal = ({
  data,
  initials,
  view,
  setView,
  logout,
  document,
  setRequestOpen,
}: any) => (
  <Box sx={{ minHeight: "100vh", bgcolor: "#F6F9FC", pb: { xs: 9, md: 4 } }}>
    <Container maxWidth="xl">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          display: { xs: "none", md: "flex" },
          py: 2,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Brand name={data.companyName} logo={data.companyLogo} />
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ display: "flex", alignItems: "center", gap: .25, bgcolor: "#eef4f6", borderRadius: 99, p: .5 }}>
          {(["home", "documents", "requests", "support"] as View[]).map(
            (item) => (
              <Button
                key={item}
                variant="text"
                onClick={() => setView(item)}
                sx={{ minWidth: "auto", px: 1.6, py: .75, borderRadius: 99, textTransform: "none", fontWeight: 750, color: view === item ? "#fff" : "#35616a", bgcolor: view === item ? "#0b6153" : "transparent", boxShadow: view === item ? "0 5px 14px rgba(11,97,83,.25)" : "none", '&:hover': { bgcolor: view === item ? '#075344' : 'rgba(11,97,83,.08)' } }}
              >
                {readable(item)}
              </Button>
            ),
          )}
          </Box>
          <IconButton onClick={() => setView("profile")}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#008b90" }}>
              {initials}
            </Avatar>
          </IconButton>
          <IconButton onClick={logout}>
            <LogoutRounded />
          </IconButton>
        </Stack>
      </Stack>
      <Box sx={mobileHero}>
        <Stack direction="row" justifyContent="space-between">
          <Typography>☰</Typography>
          <Avatar
            sx={{ width: 30, height: 30, bgcolor: "white", color: "#008b90" }}
          >
            {initials}
          </Avatar>
        </Stack>
        <Typography variant="h6" fontWeight={850} sx={{ mt: 2 }}>
          Hi, {data.profile?.fullName?.split(" ")[0] || "there"} 👋
        </Typography>
        <Typography variant="body2">Welcome to your portal</Typography>
      </Box>
      <Box sx={{ pt: { xs: 0, md: 3 } }}>
        {view === "home" && (
          <Home {...{ data, initials, setView, document, setRequestOpen }} />
        )}
        {view === "documents" && (
          <Page
            title="My Documents"
            subtitle="View and download documents issued by HR."
          >
            <Card>
              {data.documents.length ? (
                <Stack spacing={1}>
                  {data.documents.map((d: any) => (
                    <Document key={d.evidenceId} item={d} document={document} />
                  ))}
                </Stack>
              ) : (
                <Empty
                  icon={<DescriptionOutlined />}
                  text="No documents available yet. Documents issued by HR will appear here."
                />
              )}
            </Card>
          </Page>
        )}
        {view === "requests" && (
          <Page
            title="My Requests"
            subtitle="Track your support and document requests."
            action="Raise Request"
            onAction={() => setRequestOpen(true)}
          >
            <Card>
              <Requests requests={data.requests} />
            </Card>
          </Page>
        )}
        {view === "support" && (
          <Support onRequest={() => setRequestOpen(true)} />
        )}
        {view === "profile" && (
          <Profile data={data} initials={initials} logout={logout} />
        )}
      </Box>
    </Container>
    <Bottom view={view} setView={setView} />
  </Box>
);
const Home = ({ data, initials, setView, document, setRequestOpen }: any) => (
  <Stack spacing={2}>
    <Box sx={{ display: { xs: "none", md: "block" }, position: "relative", overflow: "hidden", borderRadius: { xs: 3, md: 4 }, p: { xs: 2.5, sm: 3.5, md: 4.5 }, color: "white", background: "linear-gradient(120deg,#00483c 0%,#0b6153 52%,#007d72 100%)", boxShadow: "0 18px 44px rgba(0,72,60,.2)", animation: "portalEnter .65s ease-out both", "&::before": { content: '""', position: "absolute", width: 360, height: 360, right: -100, top: -170, borderRadius: "50%", border: "1px solid rgba(167,241,222,.22)", boxShadow: "0 0 0 26px rgba(167,241,222,.06),0 0 0 54px rgba(167,241,222,.04)", animation: "portalOrbit 18s linear infinite" }, "&::after": { content: '""', position: "absolute", right: 24, bottom: -90, width: 260, height: 140, borderRadius: "50%", background: "rgba(150,241,218,.16)", filter: "blur(6px)" } }}>
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 700 }}><Chip size="small" icon={<ShieldOutlined sx={{ color: "inherit !important" }} />} label="Verified alumni access" sx={{ color: "#a7f1de", bgcolor: "rgba(255,255,255,.12)", mb: 1.5, fontWeight: 700 }} /><Typography variant="h3" fontWeight={850} sx={{ fontSize: { xs: "1.8rem", sm: "2.35rem" }, lineHeight: 1.1 }}>Hi, {data.profile?.fullName?.split(" ")[0] || "there"} 👋</Typography><Typography sx={{ mt: .75, color: "#90d9c7" }}>Welcome to your former employee portal</Typography><Typography variant="body2" sx={{ mt: 1.5, color: "rgba(255,255,255,.78)", maxWidth: 560 }}>Your documents, requests, and employment records are safely available in one place.</Typography></Box>
      <Box aria-hidden="true" sx={{ position: "absolute", right: { md: 34, lg: 72 }, bottom: 22, width: 150, height: 120, display: { xs: "none", lg: "block" }, transform: "rotate(-8deg)", animation: "shieldFloat 5s ease-in-out infinite" }}>
        <Paper sx={{ position: "absolute", right: 8, top: 8, width: 104, height: 76, bgcolor: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", borderRadius: 2 }} />
        <Paper sx={{ position: "absolute", right: 24, top: 20, width: 104, height: 76, bgcolor: "#f6fffc", borderRadius: 2, p: 1.5, color: "#0b6153" }}><DescriptionOutlined sx={{ fontSize: 34 }} /><Box sx={{ width: 52, height: 5, borderRadius: 99, bgcolor: "#96f1da", mt: .5 }} /><Box sx={{ width: 38, height: 5, borderRadius: 99, bgcolor: "#d5eee8", mt: .75 }} /></Paper>
        <Box sx={{ position: "absolute", left: 4, bottom: 0, width: 44, height: 44, borderRadius: 2, bgcolor: "#96f1da", color: "#00483c", display: "grid", placeItems: "center", boxShadow: "0 8px 20px rgba(0,0,0,.18)" }}><ShieldOutlined /></Box>
      </Box>
    </Box>
    <Box sx={grid}>
      <Card title="Your Exit Case">
        <Stack direction="row" justifyContent="space-between">
          <Info
            label="Status"
            value={
              <Chip
                size="small"
                color="success"
                label={readable(data.status)}
              />
            }
          />
          <Info label="Exit date" value={date(data.lastWorkingDate)} />
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" color="text.secondary">
          Clearance status is managed securely by HR
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ mt: 0.25 }}>
          Case details are available from your HR team.
        </Typography>
        <Box sx={{ mt: 1.5 }}><Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Journey progress</Typography><Typography variant="caption" fontWeight={800} color="primary">{data.status === "Completed" ? "100%" : "In progress"}</Typography></Stack><Box sx={{ mt: .75, height: 7, borderRadius: 99, bgcolor: "action.hover", overflow: "hidden" }}><Box sx={{ width: data.status === "Completed" ? "100%" : "58%", height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#0b6153,#55e4a8)", transition: "width .8s ease" }} /></Box></Box>
      </Card>
      <Card
        title="Employment Overview"
        action="View profile"
        onAction={() => setView("profile")}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: "#008b90" }}>{initials}</Avatar>
          <Box>
            <Typography fontWeight={800}>
              {data.profile?.fullName || "Former employee"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.profile?.jobRole || "Employment record"}
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Info
            label="Employee ID"
            value={data.profile?.employeeId || "Not available"}
          />
          <Info label="Joined" value={date(data.profile?.dateOfJoining)} />
        </Stack>
      </Card>
      <Card title="Quick Actions">
        <Box sx={quickGrid}>
          <Quick
            icon={<FolderOutlined />}
            title="My Documents"
            text="View & download"
            click={() => setView("documents")}
          />
          <Quick
            icon={<RequestPageOutlined />}
            title="Raise Request"
            text="Get support"
            click={() => setRequestOpen(true)}
          />
          <Quick
            icon={<ReceiptLongOutlined />}
            title="My Requests"
            text="Track your requests"
            click={() => setView("requests")}
          />
          <Quick
            icon={<SupportAgentOutlined />}
            title="Contact Support"
            text="We're here to help"
            click={() => setView("support")}
          />
        </Box>
      </Card>
      <Card title="Recent Requests">
        <Requests requests={data.requests.slice(0, 3)} />
      </Card>
      <Card title="Recent Documents" sx={{ gridColumn: { md: "span 2" } }}>
        {data.documents.length ? (
          data.documents
            .slice(0, 3)
            .map((d: any) => (
              <Document key={d.evidenceId} item={d} document={document} />
            ))
        ) : (
          <Empty
            icon={<DescriptionOutlined />}
            text="No documents have been issued yet."
          />
        )}
      </Card>
    </Box>
  </Stack>
);
const Support = ({ onRequest }: any) => (
  <Page
    title="Need help?"
    subtitle="Our HR team can help with documents, corrections, and post-employment queries."
  >
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2,minmax(0,1fr))" },
        gap: 2,
      }}
    >
      <Card title="Raise a request">
        <Typography color="text.secondary">
          Send a secure, tracked request directly to HR.
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={onRequest}>
          Raise Request
        </Button>
      </Card>
      <Card title="Portal security">
        <Typography color="text.secondary">
          Your portal uses verified one-time-code access. You can end your
          secure session from Profile.
        </Typography>
      </Card>
    </Box>
  </Page>
);
const Profile = ({ data, initials, logout }: any) => (
  <Page title="Profile" subtitle="Your employment information">
    <Stack spacing={2}>
      <Card>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "#008b90", width: 64, height: 64 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography fontWeight={850} variant="h6">
              {data.profile?.fullName || "Former employee"}
            </Typography>
            <Typography color="text.secondary">
              {publicLabel(data.profile?.jobRole) || "Employment record"}
            </Typography>
          </Box>
        </Stack>
      </Card>
      <Card title="Personal information">
        <Box sx={profileGrid}>
          <Info label="Full name" value={publicLabel(data.profile?.fullName)} />
          <Info
            label="Employee ID"
            value={publicLabel(data.profile?.employeeId)}
          />
          <Info
            label="Department"
            value={publicLabel(data.profile?.department)}
          />
          <Info label="Position" value={publicLabel(data.profile?.jobRole)} />
          <Info label="Joined" value={date(data.profile?.dateOfJoining)} />
          <Info label="Last working day" value={date(data.lastWorkingDate)} />
        </Box>
      </Card>
      <Card title="Portal Security">
        <Typography color="text.secondary">Verified access session</Typography>
        <Button
          color="error"
          startIcon={<LogoutRounded />}
          sx={{ mt: 1 }}
          onClick={logout}
        >
          Logout
        </Button>
      </Card>
    </Stack>
  </Page>
);
const Page = ({ title, subtitle, action, onAction, children }: any) => (
  <Stack spacing={2}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ sm: "center" }}
    >
      <Box>
        <Typography variant="h4" fontWeight={850}>
          {title}
        </Typography>
        <Typography color="text.secondary">{subtitle}</Typography>
      </Box>
      {action && (
        <Button variant="contained" onClick={onAction}>
          + {action}
        </Button>
      )}
    </Stack>
    {children}
  </Stack>
);
const Card = ({ title, action, onAction, children, sx }: any) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2 },
      border: "1px solid #E2E8F0",
      borderRadius: 3,
      boxShadow: "0 7px 22px rgba(15,42,58,.05)",
      animation: "portalEnter .55s ease-out both",
      transition: "transform .25s ease, box-shadow .25s ease",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: "0 14px 30px rgba(15,42,58,.09)",
      },
      ...sx,
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <>
        {title && (
          <Typography variant="h6" fontWeight={850}>
            {title}
          </Typography>
        )}
      </>
      {action && (
        <Button size="small" onClick={onAction}>
          {action}
        </Button>
      )}
    </Stack>
    <Box sx={{ mt: title ? 1.25 : 0 }}>{children}</Box>
  </Paper>
);
const Document = ({ item, document }: any) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    alignItems={{ sm: "center" }}
    gap={1}
    sx={{ p: 1.25, border: "1px solid #E2E8F0", borderRadius: 2.5, mb: 1 }}
  >
    <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
      <Box sx={docIcon}>
        <DescriptionOutlined />
      </Box>
      <Box minWidth={0}>
        <Typography fontWeight={750} sx={{ overflowWrap: "anywhere" }}>
          {item.fileName || "Issued document"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.contentType || "Secure HR document"}
        </Typography>
      </Box>
    </Stack>
    <Stack direction="row">
      <Button
        size="small"
        startIcon={<OpenInNewRounded />}
        onClick={() => document(item.evidenceId, item.fileName, true)}
      >
        Preview
      </Button>
      <Button
        size="small"
        startIcon={<DownloadRounded />}
        onClick={() => document(item.evidenceId, item.fileName, false)}
      >
        Download
      </Button>
    </Stack>
  </Stack>
);
const Requests = ({ requests }: any) =>
  requests.length ? (
    <Stack spacing={1}>
      {requests.map((request: any) => (
        <Box
          key={request.requestId}
          sx={{
            p: 1.25,
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 2.5,
          }}
        >
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Typography fontWeight={800}>{readable(request.type)}</Typography>
            <Chip size="small" label={readable(request.status)} />
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
          >
            {request.details}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {date(request.requestedAtUtc)}
          </Typography>
        </Box>
      ))}
    </Stack>
  ) : (
    <Empty
      icon={<ReceiptLongOutlined />}
      text="No requests yet. Raise a request whenever you need HR support."
    />
  );
const RequestModal = ({
  open,
  busy,
  type,
  details,
  setType,
  setDetails,
  close,
  submit,
}: any) => (
  <Dialog
    open={open}
    onClose={() => !busy && close()}
    fullWidth
    maxWidth="sm"
    PaperProps={{ sx: { borderRadius: 3 } }}
  >
    <DialogTitle>
      Raise a Request
      <IconButton
        onClick={close}
        sx={{ position: "absolute", right: 12, top: 12 }}
      >
        <ArrowBackRounded />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Stack spacing={1.5} sx={{ pt: 0.5 }}>
        <TextField
          select
          label="Request type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {requestTypes.map((item) => (
            <MenuItem value={item} key={item}>
              {readable(item)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Tell HR what you need"
          multiline
          minRows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          inputProps={{ maxLength: 2000 }}
          helperText={`${details.length}/2000`}
        />
        <Button
          variant="contained"
          disabled={busy || !details.trim()}
          onClick={() => void submit()}
        >
          {busy ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Submit Request"
          )}
        </Button>
      </Stack>
    </DialogContent>
  </Dialog>
);
const Bottom = ({
  view,
  setView,
}: {
  view: View;
  setView: (v: View) => void;
}) => (
  <Paper elevation={8} sx={bottom}>
    {(
      [
        { key: "home", icon: <HomeRounded />, label: "Home" },
        { key: "documents", icon: <FolderOutlined />, label: "Documents" },
        { key: "requests", icon: <ReceiptLongOutlined />, label: "Requests" },
        { key: "support", icon: <SupportAgentOutlined />, label: "Support" },
        { key: "profile", icon: <PersonOutlineRounded />, label: "Profile" },
      ] as { key: View; icon: ReactNode; label: string }[]
    ).map((item) => (
      <Button
        key={item.key}
        onClick={() => setView(item.key)}
        sx={{
          minWidth: 0,
          flex: 1,
          flexDirection: "column",
          color: view === item.key ? "#008b90" : "#64748B",
          fontSize: 10,
        }}
      >
        {item.icon}
        {item.label}
      </Button>
    ))}
  </Paper>
);
const Feature = ({ icon, title, text }: any) => (
  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ animation: "featureReveal .55s ease-out both", "&:nth-of-type(2)": { animationDelay: ".12s" }, "&:nth-of-type(3)": { animationDelay: ".24s" } }}>
    <Box sx={featureIcon}>{icon}</Box>
    <Box>
      <Typography fontWeight={800} fontSize={14}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {text}
      </Typography>
    </Box>
  </Stack>
);
const ShieldGraphic = () => (
  <Box
    sx={{
      width: 154,
      height: 126,
      mx: "auto",
      alignSelf: "center",
      position: "relative",
      display: "grid",
      placeItems: "center",
      "&::before, &::after": {
        content: '""',
        position: "absolute",
        border: "1px solid rgba(0,166,166,.19)",
        borderRadius: "50%",
        animation: "portalOrbit 7s linear infinite",
      },
      "&::before": { width: 144, height: 72, transform: "rotate(24deg)" },
      "&::after": {
        width: 132,
        height: 66,
        transform: "rotate(-34deg)",
        animationDirection: "reverse",
        animationDuration: "9s",
      },
    }}
  >
    <Box
      sx={{
        zIndex: 1,
        width: 78,
        height: 90,
        display: "grid",
        placeItems: "center",
        clipPath: "polygon(50% 0,93% 14%,88% 65%,50% 100%,12% 65%,7% 14%)",
        color: "white",
        background: "linear-gradient(145deg,#11babb,#0875a6)",
        boxShadow: "0 17px 32px rgba(0,125,131,.26)",
        animation: "shieldFloat 3.8s ease-in-out infinite",
      }}
    >
      <PersonOutlineRounded sx={{ fontSize: 45 }} />
    </Box>
    <CheckCircleRounded
      sx={{
        position: "absolute",
        zIndex: 2,
        right: 20,
        bottom: 13,
        color: "white",
        bgcolor: "#00a6a6",
        borderRadius: "50%",
        fontSize: 29,
      }}
    />
  </Box>
);
const Indicators = () => (
  <Stack
    direction="row"
    justifyContent="center"
    spacing={1.25}
    divider={<Divider orientation="vertical" flexItem />}
  >
    <Typography variant="caption" color="#007D83">
      ◈ Secure
    </Typography>
    <Typography variant="caption" color="#007D83">
      ▣ Private
    </Typography>
    <Typography variant="caption" color="#007D83">
      ◉ Monitored
    </Typography>
  </Stack>
);
const Info = ({ label, value }: { label: string; value: ReactNode }) => (
  <Box minWidth={0}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    {typeof value === "string" ? (
      <Typography
        variant="body2"
        fontWeight={750}
        sx={{ overflowWrap: "anywhere" }}
      >
        {value}
      </Typography>
    ) : (
      <Box sx={{ mt: 0.25 }}>{value}</Box>
    )}
  </Box>
);
const Quick = ({ icon, title, text, click }: any) => (
  <Button
    onClick={click}
    sx={{
      minHeight: 74,
      justifyContent: "flex-start",
      textAlign: "left",
      p: 1,
      border: "1px solid #E2E8F0",
      borderRadius: 2.5,
      color: "text.primary",
    }}
  >
    <Box sx={quickIcon}>{icon}</Box>
    <Box sx={{ ml: 1 }}>
      <Typography fontWeight={800} fontSize={13}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {text}
      </Typography>
    </Box>
  </Button>
);
const Empty = ({ icon, text }: any) => (
  <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
    <Box sx={{ opacity: 0.55 }}>{icon}</Box>
    <Typography variant="body2" sx={{ mt: 0.75 }}>
      {text}
    </Typography>
  </Box>
);
const Loading = () => (
  <Box sx={publicPage}>
    <Container maxWidth="sm">
      <Box sx={{ pt: 3 }}>
        <Brand />
      </Box>
      <Stack alignItems="center" spacing={2} sx={{ py: 12 }}>
        <CircularProgress />
        <Typography color="text.secondary">
          Preparing your secure portal...
        </Typography>
      </Stack>
    </Container>
  </Box>
);
const ErrorState = ({ text, retry }: any) => (
  <Box sx={publicPage}>
    <Container maxWidth="sm">
      <Box sx={{ pt: 3 }}>
        <Brand />
      </Box>
      <Paper sx={{ p: 3, mt: 6, borderRadius: 3 }}>
        <Alert severity="error">{text}</Alert>
        <Button sx={{ mt: 2 }} onClick={retry}>
          Try again
        </Button>
      </Paper>
    </Container>
  </Box>
);
const root = { minHeight: "100vh", color: "#07142F" };
const publicPage = {
  minHeight: "100vh",
  overflow: "hidden",
  bgcolor: "#F6F9FC",
  background:
    "radial-gradient(ellipse at 16% 8%,rgba(221,247,244,.95),transparent 34%),radial-gradient(ellipse at 88% 85%,rgba(222,236,255,.9),transparent 38%),linear-gradient(135deg,#fbffff,#f4f8fd)",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.72,
    background:
      "linear-gradient(154deg,transparent 22%,rgba(255,255,255,.8) 22.2%,transparent 37%),repeating-radial-gradient(ellipse at 27% 7%,transparent 0 38px,rgba(255,255,255,.5) 39px 40px,transparent 41px 82px)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    zIndex: 0,
    left: -30,
    right: -30,
    bottom: -38,
    height: 190,
    pointerEvents: "none",
    background:
      "radial-gradient(ellipse at 8% 112%,#9edfe2 0 23%,transparent 24%),radial-gradient(ellipse at 39% 118%,#55c5ce 0 30%,transparent 31%),radial-gradient(ellipse at 74% 112%,#8edfd1 0 25%,transparent 26%),radial-gradient(ellipse at 108% 121%,#44b7c5 0 24%,transparent 25%)",
    animation: "waveDrift 12s ease-in-out infinite alternate",
  },
  "@keyframes portalOrbit": {
    from: { rotate: "0deg" },
    to: { rotate: "360deg" },
  },
  "@keyframes portalEnter": {
    from: { opacity: 0, transform: "translateY(18px) scale(.985)" },
    to: { opacity: 1, transform: "translateY(0) scale(1)" },
  },
  "@keyframes featureReveal": {
    from: { opacity: 0, transform: "translateX(-10px)" },
    to: { opacity: 1, transform: "translateX(0)" },
  },
  "@keyframes shieldFloat": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-6px)" },
  },
  "@keyframes otpContentEnter": {
    from: { opacity: 0, transform: "translateY(12px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  "@keyframes verifyPulse": {
    "0%, 100%": { boxShadow: "0 10px 20px rgba(0,139,144,.2)" },
    "50%": { boxShadow: "0 10px 30px rgba(0,166,166,.55)" },
  },
  "@keyframes waveDrift": {
    from: { transform: "translateX(-10px)" },
    to: { transform: "translateX(10px)" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    "*": { animation: "none !important", transition: "none !important" },
  },
};
const accessLayout = {
  flex: 1,
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "minmax(0,.82fr) minmax(0,1.18fr)" },
  alignItems: { xs: "center", md: "start" },
  gap: { md: 2, lg: 4 },
  py: { xs: 1, md: 0 },
  position: "relative",
};
const otpLayout = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  py: { xs: 1, md: 0 },
};
const welcome = {
  display: { xs: "none", md: "block" },
  pl: { md: 4, lg: 7 },
  pt: { md: 4, lg: 6 },
  animation: "portalEnter .7s ease-out both",
};
const accessCard = {
  width: "100%",
  maxWidth: 600,
  minHeight: { sm: 560, md: 590 },
  justifySelf: { md: "start", lg: "start" },
  mx: "auto",
  mt: { md: 0 },
  p: { xs: 2.25, sm: 4, md: 4.5 },
  borderRadius: { xs: 0, sm: 5 },
  bgcolor: "#ffffff",
  border: "1px solid rgba(255,255,255,.92)",
  backdropFilter: "blur(18px)",
  boxShadow: { sm: "0 28px 72px rgba(28,62,88,.18), 0 4px 14px rgba(0,139,144,.08)" },
  animation: "portalEnter .72s .1s cubic-bezier(.2,.8,.2,1) both",
  position: "relative",
  "&::before": { content: '""', position: "absolute", inset: -1, borderRadius: "inherit", pointerEvents: "none", background: "linear-gradient(135deg,rgba(0,166,166,.18),transparent 38%,rgba(107,179,255,.14))", opacity: .8 },
  "& > *": { position: "relative" },
  "& .MuiButton-contained": {
    background: "linear-gradient(90deg,#008f91,#00a6a6)",
    boxShadow: "0 10px 20px rgba(0,139,144,.2)",
    "&:hover": {
      background: "linear-gradient(90deg,#007d83,#00989a)",
      transform: "translateY(-1px)",
    },
  },
  "& .MuiButton-root": {
    transition: "transform .2s ease, box-shadow .2s ease",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    bgcolor: "rgba(255,255,255,.8)",
  },
  "@media (min-width: 900px)": { position: "absolute", left: "29vw", top: "6%", width: "min(38vw, 600px)", transform: "none" },
};
const otpCard = {
  ...accessCard,
  maxWidth: 360,
  justifySelf: "center",
};
const brandMark = {
  display: "grid",
  placeItems: "center",
  width: 34,
  height: 34,
  borderRadius: 2,
  color: "white",
  bgcolor: "#008b90",
};
const featureIcon = {
  display: "grid",
  placeItems: "center",
  width: 42,
  height: 42,
  flex: "0 0 auto",
  borderRadius: "50%",
  color: "#008b90",
  bgcolor: "#DDF7F4",
};
const mobileHero = {
  display: { xs: "block", md: "none" },
  color: "white",
  px: 2,
  pt: 2,
  pb: 8,
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(135deg,#007D83,#009b9c)",
  animation: "portalEnter .55s ease-out both",
  "&::after": {
    content: '""',
    position: "absolute",
    left: "-8%",
    right: "-8%",
    bottom: -66,
    height: 112,
    borderRadius: "50% 50% 0 0",
    background: "#eafcfb",
    opacity: 0.94,
  },
};
const grid = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "minmax(0,1.4fr) minmax(280px,.8fr)" },
  gap: 2,
};
const quickGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: 1,
};
const quickIcon = {
  display: "grid",
  placeItems: "center",
  width: 34,
  height: 34,
  flex: "0 0 auto",
  borderRadius: "50%",
  color: "#008b90",
  bgcolor: "#DDF7F4",
};
const docIcon = {
  display: "grid",
  placeItems: "center",
  width: 40,
  height: 40,
  flex: "0 0 auto",
  borderRadius: 2,
  color: "#008b90",
  bgcolor: "#DDF7F4",
};
const profileGrid = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" },
  gap: 1.5,
};
const bottom = {
  display: { xs: "flex", md: "none" },
  position: "fixed",
  zIndex: 5,
  bottom: 0,
  left: 0,
  right: 0,
  height: "calc(62px + env(safe-area-inset-bottom))",
  pb: "env(safe-area-inset-bottom)",
  borderRadius: 0,
  alignItems: "center",
};
