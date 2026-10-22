import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircleOutline, WorkOutline } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { recordRecruitmentOfferView, respondToRecruitmentOffer } from "../services";
import { RecruitmentCandidateOfferDetails } from "../models";

export default function CandidateOfferResponse() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const [decision, setDecision] = useState<"Accepted" | "Declined" | "RequestOfferChange">("Accepted");
  const [message, setMessage] = useState("");
  const [offerDetails, setOfferDetails] = useState<RecruitmentCandidateOfferDetails | null>(null);
  const [state, setState] = useState<{ loading: boolean; initialLoading: boolean; error?: string; success?: string }>({
    loading: false,
    initialLoading: true,
  });

  useEffect(() => {
    if (!token) {
      setState({ loading: false, initialLoading: false, error: "This offer link is missing its secure token." });
      return;
    }

    const loadOffer = async () => {
      try {
        const { data } = await recordRecruitmentOfferView(token);
        if (data.success && data.methodResult) {
          setOfferDetails(data.methodResult);
          if (data.methodResult.actionType === "AcceptOffer") setDecision("Accepted");
          else if (data.methodResult.actionType === "DeclineOffer") setDecision("Declined");
          else if (data.methodResult.actionType === "RequestOfferChange") setDecision("RequestOfferChange");
        } else if (!data.success) {
          setState((prev) => ({ ...prev, error: data.message || "This offer link is invalid or has expired." }));
        }
      } catch (err) {
        setState((prev) => ({ ...prev, error: (err as Error).message || "This offer link is no longer valid or accessible." }));
      } finally {
        setState((prev) => ({ ...prev, initialLoading: false }));
      }
    };

    void loadOffer();
  }, [token]);

  const submit = async () => {
    if (!token) {
      setState((prev) => ({ ...prev, error: "This offer link is missing its token." }));
      return;
    }
    if (decision === "RequestOfferChange" && !message.trim()) {
      setState((prev) => ({ ...prev, error: "Please tell the hiring team what changes you would like to request." }));
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const { data } = await respondToRecruitmentOffer({
        token,
        decision,
        message: message.trim() || null,
        idempotencyKey: `${Date.now()}-candidate-offer-response`,
      });
      if (!data.success) throw new Error(data.message || "This offer link is no longer available.");
      setState((prev) => ({
        ...prev,
        loading: false,
        success: data.message || "Your response was successfully recorded. Thank you!",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message || "Unable to submit your response. Please try again or reach out to HR.",
      }));
    }
  };

  const formatDate = (val?: string | null) => {
    if (!val) return "To be determined";
    try {
      return new Date(val).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return val;
    }
  };

  const formatCurrency = (amount?: number, curr = "INR") => {
    if (amount == null) return "-";
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: curr, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${curr} ${amount.toLocaleString()}`;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 620,
          p: { xs: 3, sm: 4.5 },
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
        }}
      >
        <Stack spacing={3}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
              }}
            >
              <WorkOutline />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                Job Offer Response
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review your offer details and record your response below.
              </Typography>
            </Box>
          </Stack>

          {state.initialLoading && (
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress size={26} />
              <Typography variant="body2" color="text.secondary">
                Loading offer details...
              </Typography>
            </Stack>
          )}

          {state.error && <Alert severity="error">{state.error}</Alert>}

          {state.success ? (
            <Stack spacing={2} sx={{ py: 3, textAlign: "center", alignItems: "center" }}>
              <CheckCircleOutline sx={{ fontSize: 56, color: "success.main" }} />
              <Typography variant="h6" fontWeight={700}>
                Response Submitted
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {state.success}
              </Typography>
            </Stack>
          ) : (
            !state.initialLoading && (
              <>
                {offerDetails && (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      bgcolor: "action.hover",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                          Candidate
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {offerDetails.candidateName || "Candidate"}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                          Position Offered
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {offerDetails.jobTitle || "Open Position"}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                          Annual Compensation (CTC)
                        </Typography>
                        <Typography variant="body1" fontWeight={700} color="primary.main">
                          {formatCurrency(offerDetails.totalCtc || offerDetails.salary, offerDetails.currency)}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                          Proposed Joining Date
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatDate(offerDetails.startDateUtc)}
                        </Typography>
                      </Grid>

                      {offerDetails.expiresAtUtc && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                            Offer Valid Until
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(offerDetails.expiresAtUtc)}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}

                <Divider />

                <Stack spacing={2}>
                  <TextField
                    select
                    fullWidth
                    label="Your Response"
                    value={decision}
                    onChange={(event) => setDecision(event.target.value as typeof decision)}
                  >
                    <MenuItem value="Accepted">Accept Offer</MenuItem>
                    <MenuItem value="Declined">Decline Offer</MenuItem>
                    <MenuItem value="RequestOfferChange">Request Changes / Counter</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label={decision === "RequestOfferChange" ? "Requested Changes (Required)" : "Message / Comments (Optional)"}
                    placeholder={
                      decision === "RequestOfferChange"
                        ? "Please specify any compensation, start date, or title adjustments you'd like to discuss..."
                        : "Add an optional message or note for the hiring team..."
                    }
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => void submit()}
                    disabled={state.loading}
                    sx={{
                      py: 1.25,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                    }}
                  >
                    {state.loading ? <CircularProgress size={22} color="inherit" /> : "Submit Response"}
                  </Button>
                </Stack>
              </>
            )
          )}
        </Stack>
      </Card>
    </Box>
  );
}
