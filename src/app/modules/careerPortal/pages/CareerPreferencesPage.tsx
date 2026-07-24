import {
  AddAlertRounded,
  DeleteOutlineRounded,
  MarkEmailReadRounded,
  NotificationsActiveRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CareerHeader } from "../components/CareerHeader";
import {
  getCareerSession,
  setCareerSession,
} from "../hooks/useCareerVisitor";
import {
  createAlert,
  deleteAlert,
  getAlerts,
  getPreferences,
  subscribe,
  unsubscribe,
  updatePreferences,
  verifySubscription,
} from "../services/careerPortalService";
import { CareerPreferences, JobAlert } from "../types/careerPortalTypes";

export const CareerPreferencesPage = () => {
  const [params, setParams] = useSearchParams();
  const [session, setSession] = useState(getCareerSession());
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(params.get("verify") || params.get("unsubscribe")));
  const [preferences, setPreferences] = useState<CareerPreferences>({ notificationFrequency: "DailyDigest", preferredLanguage: "en", isActive: true });
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [alertName, setAlertName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");

  const load = (token = session) => {
    if (!token) return;
    Promise.all([getPreferences(token), getAlerts(token)])
      .then(([prefs, alertResult]) => {
        if (prefs.data.methodResult) setPreferences(prefs.data.methodResult);
        setAlerts(alertResult.data.methodResults ?? []);
      })
      .catch(() => setError("Your career session has expired. Verify your email again."));
  };

  useEffect(() => {
    const verify = params.get("verify");
    const unsubscribeToken = params.get("unsubscribe");
    if (verify) {
      verifySubscription(verify)
        .then(({ data }) => {
          if (!data.success || !data.methodResult) throw new Error(data.message);
          setCareerSession(data.methodResult.sessionToken);
          setSession(data.methodResult.sessionToken);
          setMessage("Email verified. Your job alert preferences are ready.");
          setParams({});
          load(data.methodResult.sessionToken);
        })
        .catch((reason) => setError(reason?.response?.data?.message || reason.message || "Verification failed."))
        .finally(() => setLoading(false));
    } else if (unsubscribeToken) {
      unsubscribe(unsubscribeToken)
        .then(() => { setMessage("You have been unsubscribed from career emails."); setParams({}); })
        .catch(() => setError("The unsubscribe link is invalid or expired."))
        .finally(() => setLoading(false));
    } else {
      load();
      setLoading(false);
    }
  }, []);

  const start = async () => {
    if (!email.trim()) return;
    await subscribe(email, preferences.notificationFrequency);
    setMessage("Check your email and use the verification link to continue.");
  };
  const savePreferences = async () => {
    await updatePreferences(session, preferences);
    setMessage("Preferences saved.");
  };
  const addAlert = async () => {
    const value = {
      name: alertName,
      searchText: keywords || null,
      locations: location ? [location] : [],
      skills: skills.split(",").map((x) => x.trim()).filter(Boolean),
      notificationFrequency: preferences.notificationFrequency,
    };
    await createAlert(session, value);
    setAlertName(""); setKeywords(""); setLocation(""); setSkills("");
    load();
  };
  const removeAlert = async (id: string) => {
    await deleteAlert(id, session);
    setAlerts((values) => values.filter((x) => x.jobAlertSubscriptionId !== id));
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <CareerHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ width: 52, height: 52, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "primary.lighter", color: "primary.dark" }}><NotificationsActiveRounded /></Box><Box><Typography variant="h3" fontWeight={950} letterSpacing="-.04em">Job alerts</Typography><Typography color="text.secondary">Decide what reaches your inbox and when.</Typography></Box></Stack>
        {loading && <Box sx={{ py: 8, display: "grid", placeItems: "center" }}><CircularProgress /></Box>}
        {message && <Alert severity="success" icon={<MarkEmailReadRounded />} sx={{ mt: 3, borderRadius: 3 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }}>{error}</Alert>}
        {!loading && !session ? (
          <Paper sx={{ mt: 4, p: { xs: 3, md: 5 }, maxWidth: 680, borderRadius: 5, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h4" fontWeight={900}>Start with your email</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3, lineHeight: 1.7 }}>We use double opt-in so nobody can create alerts or follow companies on your behalf.</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}><TextField fullWidth label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /><Button variant="contained" onClick={start} disabled={!email.trim()} sx={{ px: 3 }}>Send verification</Button></Stack>
          </Paper>
        ) : !loading && (
          <Stack spacing={3} sx={{ mt: 4 }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h5" fontWeight={900}>Delivery preferences</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
                <TextField select fullWidth label="Frequency" value={preferences.notificationFrequency} onChange={(e) => setPreferences((x) => ({ ...x, notificationFrequency: e.target.value as CareerPreferences["notificationFrequency"] }))}><MenuItem value="Instant">Instant</MenuItem><MenuItem value="DailyDigest">Daily digest</MenuItem><MenuItem value="WeeklyDigest">Weekly digest</MenuItem><MenuItem value="None">Paused</MenuItem></TextField>
                <TextField select fullWidth label="Status" value={preferences.isActive ? "active" : "paused"} onChange={(e) => setPreferences((x) => ({ ...x, isActive: e.target.value === "active" }))}><MenuItem value="active">Active</MenuItem><MenuItem value="paused">Paused</MenuItem></TextField>
                <Button variant="contained" onClick={savePreferences}>Save</Button>
              </Stack>
            </Paper>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" spacing={1} alignItems="center"><AddAlertRounded color="primary" /><Typography variant="h5" fontWeight={900}>Create a tailored alert</Typography></Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mt: 3 }}><TextField label="Alert name" value={alertName} onChange={(e) => setAlertName(e.target.value)} /><TextField label="Keywords or title" value={keywords} onChange={(e) => setKeywords(e.target.value)} /><TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} /><TextField label="Skills" value={skills} onChange={(e) => setSkills(e.target.value)} /><Button variant="contained" onClick={addAlert} disabled={!alertName.trim()}>Create</Button></Stack>
              <Stack spacing={1.25} sx={{ mt: 3 }}>
                {alerts.map((alert) => <Paper variant="outlined" key={alert.jobAlertSubscriptionId} sx={{ p: 2, borderRadius: 3 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography fontWeight={800}>{alert.name}</Typography><Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mt: 0.8 }}>{alert.searchText && <Chip size="small" label={alert.searchText} />}{alert.locations.map((x) => <Chip key={x} size="small" label={x} />)}{alert.skills.map((x) => <Chip key={x} size="small" variant="outlined" label={x} />)}</Stack></Box><IconButton aria-label="Delete alert" onClick={() => removeAlert(alert.jobAlertSubscriptionId)}><DeleteOutlineRounded /></IconButton></Stack></Paper>)}
                {!alerts.length && <Typography color="text.secondary">No tailored alerts yet.</Typography>}
              </Stack>
            </Paper>
          </Stack>
        )}
      </Container>
    </Box>
  );
};
