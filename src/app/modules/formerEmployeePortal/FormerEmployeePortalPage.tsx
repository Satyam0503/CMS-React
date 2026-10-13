import { DownloadRounded, LockOutlined, RequestPageOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BaseUrl } from "../../../utils/constant/Constant";
import { CompanyCareerTheme } from "../careerPortal/components/CompanyCareerTheme";
import { FormerEmployeePortalCase, createFormerEmployeePortalRequest, formerEmployeeDocumentUrl, getFormerEmployeePortalCase, redeemFormerEmployeePortalInvite, requestFormerEmployeeOtp, verifyFormerEmployeeContact, verifyFormerEmployeeOtp } from "./formerEmployeePortalService";

const sessionKey = "former_employee_portal_session";

export const FormerEmployeePortalPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(() => sessionStorage.getItem(sessionKey) ?? "");
  const [caseData, setCaseData] = useState<FormerEmployeePortalCase | null>(null);
  const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(true);
  const [requestType, setRequestType] = useState("RelievingLetter"); const [details, setDetails] = useState("");
  const [email, setEmail] = useState(""); const [otp, setOtp] = useState(""); const [otpSent, setOtpSent] = useState(false); const [authenticating, setAuthenticating] = useState(false);
  const [portalTheme, setPortalTheme] = useState(() => sessionStorage.getItem("former_employee_portal_theme") ?? "glass");

  const load = async (portalSession = session) => {
    if (!portalSession) { setLoading(false); return; }
    try { const response = await getFormerEmployeePortalCase(portalSession); if (!response.data.success || !response.data.methodResult) throw new Error(response.data.message); setCaseData(response.data.methodResult); }
    catch { sessionStorage.removeItem(sessionKey); setSession(""); setError("This portal session is invalid or has expired. Use a new invitation link."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const token = params.get("token");
    if (params.get("verify-contact") === "true" && token) {
      verifyFormerEmployeeContact(token)
        .then(({ data }) => { if (!data.success) throw new Error(data.message); setMessage("Your post-exit email is verified. You can now complete the required offboarding steps."); setLoading(false); navigate("/former-employee", { replace: true }); })
        .catch(() => { setError("This contact-verification link is invalid or has already been used. Request a new verification email from Offboarding Centre."); setLoading(false); });
      return;
    }
    if (!token) { load(); return; }
    redeemFormerEmployeePortalInvite(token)
      .then(({ data }) => { if (!data.success || !data.methodResult) throw new Error(data.message); sessionStorage.setItem(sessionKey, data.methodResult.sessionToken); setSession(data.methodResult.sessionToken); navigate("/former-employee", { replace: true }); return load(data.methodResult.sessionToken); })
      .catch(() => { setError("This invitation link is invalid, expired, or has already been used."); setLoading(false); });
  }, []);

  const submit = async () => {
    if (!session || !details.trim()) return;
    try { await createFormerEmployeePortalRequest(session, { type: requestType, details: details.trim() }); setDetails(""); setMessage("Your request has been submitted."); await load(); }
    catch { setError("Your request could not be submitted. Please try again."); }
  };
  const requestOtp = async () => { if (!email.trim()) return; const isResend = otpSent; setAuthenticating(true); setError(""); try { const { data } = await requestFormerEmployeeOtp(email.trim()); if (!data.success) { const action = isResend ? "resend" : "send"; const message = data.message === "FORMER_PORTAL_OTP_EMAIL_DELIVERY_FAILED" ? `We could not ${action} the code. Check the email address and try again. If it continues, contact HR so they can confirm the post-exit email and email service.` : data.message === "FORMER_PORTAL_OTP_CREATE_FAILED" ? "We could not create a secure sign-in code. Please try again." : `We could not ${action} the code. Please try again.`; throw new Error(message); } setOtpSent(true); setOtp(""); setMessage(isResend ? "A new six-digit code has been sent. Your previous code is no longer valid." : "If this email has portal access, a six-digit code has been sent."); } catch (error) { setError(error instanceof Error ? error.message : `We could not ${isResend ? "resend" : "send"} a code. Please try again.`); } finally { setAuthenticating(false); } };
  const verifyOtp = async () => { if (!email.trim() || otp.length !== 6) return; setAuthenticating(true); setError(""); try { const { data } = await verifyFormerEmployeeOtp(email.trim(), otp); if (!data.success || !data.methodResult) throw new Error(); sessionStorage.setItem(sessionKey, data.methodResult.sessionToken); if (data.methodResult.theme) { sessionStorage.setItem("former_employee_portal_theme", data.methodResult.theme); setPortalTheme(data.methodResult.theme); } setSession(data.methodResult.sessionToken); await load(data.methodResult.sessionToken); } catch { setError("That code is invalid or expired. Request a new code and try again."); } finally { setAuthenticating(false); } };
  const download = async (evidenceId: string, fileName?: string) => {
    const response = await fetch(`${BaseUrl}/${formerEmployeeDocumentUrl(evidenceId)}`, { headers: { "X-Former-Employee-Session": session } });
    if (!response.ok) { setError("That document is no longer available."); return; }
    const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = fileName ?? "offboarding-document"; link.click(); URL.revokeObjectURL(url);
  };

  return <CompanyCareerTheme theme={portalTheme}><Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 2, sm: 4, md: 8 } }}><Container maxWidth="md"><Paper elevation={0} sx={{ p: { xs: 1.5, sm: 3, md: 5 }, borderRadius: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider", boxShadow: "0 18px 46px rgba(15, 42, 58, .10)" }}><Stack spacing={{ xs: 2, sm: 3 }}>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}><Box sx={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 2.5, bgcolor: "primary.lighter", color: "primary.dark", flex: "0 0 auto" }}><LockOutlined /></Box><Box sx={{ minWidth: 0 }}><Typography variant="h4" fontWeight={800}>Former employee portal</Typography><Typography color="text.secondary">Access exit documents and submit limited requests securely.</Typography></Box></Stack>
    {error && <Alert severity="error">{error}</Alert>}{message && <Alert severity="success">{message}</Alert>}{loading && <Typography color="text.secondary">Verifying secure access…</Typography>}
    {!loading && !session && <Box sx={{ p: { xs: 1.25, sm: 1.75 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5, animation: "fadeIn .35s ease-out" }}><Typography variant="h6" fontWeight={750}>Secure email sign in</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Enter your verified post-exit email. Your session remains active for seven days unless HR disables your access.</Typography><Stack spacing={1.25}><TextField size="small" type="email" label="Personal email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />{otpSent && <TextField size="small" label="Six-digit code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputProps={{ inputMode: "numeric", maxLength: 6, style: { letterSpacing: "0.35em", textAlign: "center" } }} />}<Stack direction={{ xs: "column", sm: "row" }} spacing={1}><Button variant="outlined" onClick={() => void requestOtp()} disabled={authenticating || !email.trim()}>{otpSent ? "Resend code" : "Send code"}</Button>{otpSent && <Button variant="contained" onClick={() => void verifyOtp()} disabled={authenticating || otp.length !== 6}>Verify & sign in</Button>}</Stack></Stack></Box>}
    {caseData && <><Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, bgcolor: "action.hover" }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={.5}><Typography fontWeight={750}>Offboarding status: {caseData.status}</Typography><Typography variant="body2" color="text.secondary">Last working date: {new Date(caseData.lastWorkingDate).toLocaleDateString()}</Typography></Stack></Paper>
      <Box sx={{ p: { xs: 1.25, sm: 1.75 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}><Typography variant="h6" fontWeight={750} gutterBottom>Available documents</Typography>{caseData.documents.length === 0 ? <Typography color="text.secondary">No approved documents are available yet.</Typography> : <Stack spacing={1}>{caseData.documents.map(document => <Button key={document.evidenceId} startIcon={<DownloadRounded />} variant="outlined" onClick={() => download(document.evidenceId, document.fileName)} sx={{ justifyContent: "flex-start", textAlign: "left", minHeight: 42, overflowWrap: "anywhere" }}>{document.fileName ?? "Offboarding document"}</Button>)}</Stack>}</Box>
      <Box sx={{ p: { xs: 1.25, sm: 1.75 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}><Stack direction="row" gap={1} alignItems="center" sx={{ mb: 1.25 }}><RequestPageOutlined color="action" fontSize="small" /><Typography variant="h6" fontWeight={750}>Request a document or correction</Typography></Stack><Stack spacing={1.5}><TextField select size="small" label="Request type" value={requestType} onChange={event => setRequestType(event.target.value)}>{["RelievingLetter", "ExperienceLetter", "FnFStatement", "TaxDocument", "Correction", "Other"].map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField><TextField size="small" label="Details" value={details} onChange={event => setDetails(event.target.value)} multiline minRows={3} inputProps={{ maxLength: 2000 }} /><Button variant="contained" onClick={submit} disabled={!details.trim()} sx={{ alignSelf: { xs: "stretch", sm: "flex-end" } }}>Submit request</Button></Stack></Box>
      {caseData.requests.length > 0 && <Box><Typography variant="h6" fontWeight={750} gutterBottom>Your requests</Typography><Stack spacing={1}>{caseData.requests.map(request => <Paper key={request.requestId} variant="outlined" sx={{ p: 1.5, borderRadius: 2.25, bgcolor: "background.default" }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={.5}><Typography fontWeight={650}>{request.type.replace(/([A-Z])/g, " $1").trim()}</Typography><Typography variant="caption" color="text.secondary">{request.status}</Typography></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: .5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{request.details}</Typography></Paper>)}</Stack></Box>}</>}
  </Stack></Paper></Container></Box></CompanyCareerTheme>;
};
