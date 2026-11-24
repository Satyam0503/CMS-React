import { FormEvent, useState } from "react";
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import { Link } from "react-router-dom";
import { CareerHeader } from "../components/CareerHeader";
import { getPublicApplicationStatus } from "../../applynow/publicCareerService";
import { PublicApplicationStatus } from "../../applynow/publicCareerTypes";

export const PublicApplicationStatusPage = () => {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<PublicApplicationStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkStatus = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus(null);
    setLoading(true);
    try {
      const { data } = await getPublicApplicationStatus(reference.trim(), email.trim());
      if (!data.success || !data.methodResult) throw new Error(data.message || "We couldn't find an application with those details. Check them and try again.");
      setStatus(data.methodResult);
    } catch (reason: any) {
      setError(reason?.response?.data?.message || reason?.message || "We couldn't check your application right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <CareerHeader />
      <Container maxWidth="sm" sx={{ py: { xs: 5, md: 9 } }}>
        <Paper component="form" onSubmit={checkStatus} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
          <FactCheckOutlined color="primary" sx={{ fontSize: 38 }} />
          <Typography variant="h3" fontWeight={900} letterSpacing="-.04em" sx={{ mt: 1.5 }}>Check your application</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3, lineHeight: 1.7 }}>
            Enter the application reference from your confirmation and the email address you used to apply. We only show a high level progress update.
          </Typography>
          <Stack spacing={2}>
            {error && <Alert severity="error" role="alert">{error}</Alert>}
            <TextField label="Application reference" value={reference} onChange={(event) => setReference(event.target.value)} required fullWidth autoComplete="off" inputProps={{ maxLength: 64 }} />
            <TextField label="Email used to apply" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth autoComplete="email" />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ minHeight: 48, borderRadius: 2.5 }}>
              {loading ? "Checking…" : "Check status"}
            </Button>
          </Stack>
          {status && (
            <Paper variant="outlined" aria-live="polite" sx={{ mt: 3, p: 2.5, borderRadius: 3, bgcolor: "action.hover" }}>
              <Typography variant="overline" color="text.secondary">Current update</Typography>
              <Typography variant="h5" fontWeight={850}>{status.status}</Typography>
              <Typography sx={{ mt: 1 }}>{status.jobTitle} · {status.companyName}</Typography>
              {status.lastUpdatedAtUtc && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Last updated {new Date(status.lastUpdatedAtUtc).toLocaleDateString()}</Typography>}
            </Paper>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, lineHeight: 1.7 }}>
            Need help? <Box component={Link} to="/careers" sx={{ color: "primary.main", fontWeight: 700 }}>Return to careers</Box>. For privacy, this page never displays recruiter notes or interview feedback.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};
