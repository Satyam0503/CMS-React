import { Alert, Box, Button, Card, CircularProgress, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { respondToRecruitmentOffer } from "../services";

export default function CandidateOfferResponse() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const [decision, setDecision] = useState<"Accepted" | "Declined" | "RequestOfferChange">("Accepted");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<{ loading: boolean; error?: string; success?: string }>({ loading: false });
  const submit = async () => {
    if (!token) { setState({ loading: false, error: "This offer link is missing its token." }); return; }
    if (decision === "RequestOfferChange" && !message.trim()) { setState({ loading: false, error: "Tell the hiring team what you would like changed." }); return; }
    setState({ loading: true });
    try {
      const { data } = await respondToRecruitmentOffer({ token, decision, message: message.trim() || null, idempotencyKey: `${Date.now()}-candidate-offer-response` });
      if (!data.success) throw new Error(data.message || "This offer link is no longer available.");
      setState({ loading: false, success: data.message || "Your response was recorded." });
    } catch (error) { setState({ loading: false, error: (error as Error).message || "Unable to submit your response." }); }
  };
  return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 2 }}><Card sx={{ width: "100%", maxWidth: 520, p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}><Stack spacing={2}><Typography variant="h5" fontWeight={800}>Offer response</Typography><Typography variant="body2" color="text.secondary">Use this secure link to accept, decline, or request a change to your offer.</Typography>{state.error && <Alert severity="error">{state.error}</Alert>}{state.success ? <Alert severity="success">{state.success}</Alert> : <><TextField select fullWidth label="Response" value={decision} onChange={event => setDecision(event.target.value as typeof decision)}><MenuItem value="Accepted">Accept offer</MenuItem><MenuItem value="Declined">Decline offer</MenuItem><MenuItem value="RequestOfferChange">Request a change</MenuItem></TextField><TextField fullWidth multiline minRows={3} label="Message (optional unless requesting a change)" value={message} onChange={event => setMessage(event.target.value)} /><Button variant="contained" onClick={() => void submit()} disabled={state.loading}>{state.loading ? <CircularProgress size={20} color="inherit" /> : "Submit response"}</Button></>}</Stack></Card></Box>;
}
