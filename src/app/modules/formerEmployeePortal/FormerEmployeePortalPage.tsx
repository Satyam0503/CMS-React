import { DownloadRounded, LockOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BaseUrl } from "../../../utils/constant/Constant";
import { FormerEmployeePortalCase, createFormerEmployeePortalRequest, formerEmployeeDocumentUrl, getFormerEmployeePortalCase, redeemFormerEmployeePortalInvite } from "./formerEmployeePortalService";

const sessionKey = "former_employee_portal_session";

export const FormerEmployeePortalPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(() => sessionStorage.getItem(sessionKey) ?? "");
  const [caseData, setCaseData] = useState<FormerEmployeePortalCase | null>(null);
  const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(true);
  const [requestType, setRequestType] = useState("RelievingLetter"); const [details, setDetails] = useState("");

  const load = async (portalSession = session) => {
    if (!portalSession) { setLoading(false); return; }
    try { const response = await getFormerEmployeePortalCase(portalSession); if (!response.data.success || !response.data.methodResult) throw new Error(response.data.message); setCaseData(response.data.methodResult); }
    catch { sessionStorage.removeItem(sessionKey); setSession(""); setError("This portal session is invalid or has expired. Use a new invitation link."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const token = params.get("token");
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
  const download = async (evidenceId: string, fileName?: string) => {
    const response = await fetch(`${BaseUrl}/${formerEmployeeDocumentUrl(evidenceId)}`, { headers: { "X-Former-Employee-Session": session } });
    if (!response.ok) { setError("That document is no longer available."); return; }
    const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = fileName ?? "offboarding-document"; link.click(); URL.revokeObjectURL(url);
  };

  return <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 3, md: 8 } }}><Container maxWidth="md"><Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}><Stack spacing={3}>
    <Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 2, bgcolor: "primary.lighter", color: "primary.dark" }}><LockOutlined /></Box><Box><Typography variant="h4" fontWeight={800}>Former employee portal</Typography><Typography color="text.secondary">Access exit documents and submit limited requests securely.</Typography></Box></Stack>
    {error && <Alert severity="error">{error}</Alert>}{message && <Alert severity="success">{message}</Alert>}{loading && <Typography color="text.secondary">Verifying secure access…</Typography>}
    {!loading && !session && !error && <Alert severity="info">Open the invitation link sent by your former employer.</Alert>}
    {caseData && <><Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}><Typography fontWeight={700}>Offboarding status: {caseData.status}</Typography><Typography variant="body2" color="text.secondary">Last working date: {new Date(caseData.lastWorkingDate).toLocaleDateString()}</Typography></Paper>
      <Box><Typography variant="h6" fontWeight={750} gutterBottom>Available documents</Typography>{caseData.documents.length === 0 ? <Typography color="text.secondary">No approved documents are available yet.</Typography> : <Stack spacing={1}>{caseData.documents.map(document => <Button key={document.evidenceId} startIcon={<DownloadRounded />} variant="outlined" onClick={() => download(document.evidenceId, document.fileName)}>{document.fileName ?? "Offboarding document"}</Button>)}</Stack>}</Box>
      <Box><Typography variant="h6" fontWeight={750} gutterBottom>Request a document or correction</Typography><Stack spacing={1.5}><TextField select label="Request type" value={requestType} onChange={event => setRequestType(event.target.value)}>{["RelievingLetter", "ExperienceLetter", "FnFStatement", "TaxDocument", "Correction", "Other"].map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField><TextField label="Details" value={details} onChange={event => setDetails(event.target.value)} multiline minRows={3} inputProps={{ maxLength: 2000 }} /><Button variant="contained" onClick={submit} disabled={!details.trim()}>Submit request</Button></Stack></Box>
      {caseData.requests.length > 0 && <Box><Typography variant="h6" fontWeight={750} gutterBottom>Your requests</Typography><Stack spacing={1}>{caseData.requests.map(request => <Paper key={request.requestId} variant="outlined" sx={{ p: 1.5 }}><Typography fontWeight={650}>{request.type} — {request.status}</Typography><Typography variant="body2" color="text.secondary">{request.details}</Typography></Paper>)}</Stack></Box>}</>}
  </Stack></Paper></Container></Box>;
};
