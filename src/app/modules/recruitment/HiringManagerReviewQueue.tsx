import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import Refresh from "@mui/icons-material/Refresh";
import ThumbDownAltOutlined from "@mui/icons-material/ThumbDownAltOutlined";
import { toast } from "react-toastify";
import { getPendingManagerReviews, reviewRecruitmentHiringDecision } from "./services";
import { RecruitmentManagerReviewQueueItem } from "./models";

const createReviewKey = () => `manager-review-${Date.now()}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

export default function HiringManagerReviewQueue() {
  const reviewKeys = useRef(new Map<string, string>());
  const [items, setItems] = useState<RecruitmentManagerReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<RecruitmentManagerReviewQueueItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await getPendingManagerReviews();
      if (!data.success) throw new Error(data.message || "Unable to load assigned reviews.");
      setItems(data.methodResult ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load assigned reviews.";
      setLoadError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const submitReview = async (item: RecruitmentManagerReviewQueueItem, decision: "Approve" | "Reject", notes?: string) => {
    setBusyId(item.decisionId);
    const actionFingerprint = `${item.decisionId}:${item.version}:${decision}:${notes?.trim() ?? ""}`;
    const idempotencyKey = reviewKeys.current.get(actionFingerprint) ?? createReviewKey();
    reviewKeys.current.set(actionFingerprint, idempotencyKey);
    try {
      const { data } = await reviewRecruitmentHiringDecision({
        decisionId: item.decisionId,
        decision,
        notes,
        idempotencyKey,
        expectedVersion: item.version,
      });
      if (!data.success) throw new Error(data.message || "The review could not be saved.");
      reviewKeys.current.delete(actionFingerprint);
      toast.success(data.message || (decision === "Approve" ? "Candidate approved." : "Candidate rejected."));
      setRejecting(null);
      setRejectReason("");
      await refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Review failed. Refresh the queue and try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1.5} sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Hiring manager reviews</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Review recruiter recommendations assigned to you. Candidates remain at their current stage until you decide.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => void refresh()} disabled={loading}>Refresh</Button>
      </Stack>
      {loadError && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void refresh()}>Retry</Button>} sx={{ mb: 2 }}>{loadError}</Alert>}
      {!loadError && <Chip label={`${items.length} pending`} color={items.length ? "warning" : "default"} size="small" sx={{ mb: 2 }} />}
      {loading ? <Box sx={{ display: "grid", placeItems: "center", py: 8 }}><CircularProgress aria-label="Loading manager reviews" /></Box> : !loadError && items.length === 0 ? (
        <Card variant="outlined"><CardContent sx={{ py: 6, textAlign: "center" }}>
          <CheckCircleOutline color="success" sx={{ fontSize: 42, mb: 1 }} />
          <Typography variant="h6" fontWeight={750}>You’re all caught up</Typography>
          <Typography color="text.secondary">New recruiter recommendations assigned to you will appear here.</Typography>
        </CardContent></Card>
      ) : !loadError && <Stack spacing={1.5}>{items.map((item) => (
        <Card key={item.decisionId} variant="outlined"><CardContent>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" fontWeight={750}>{item.applicantName}</Typography>
              <Typography color="text.secondary">{item.vacancyTitle}{item.email ? ` · ${item.email}` : ""}</Typography>
              <Typography variant="caption" color="text.secondary">Requested {new Date(item.requestedAtUtc).toLocaleString()}</Typography>
              {item.recruiterNotes && <Alert severity="info" icon={false} sx={{ mt: 1.5, whiteSpace: "pre-wrap" }}><b>Recruiter recommendation:</b> {item.recruiterNotes}</Alert>}
            </Box>
            <Stack direction={{ xs: "row", md: "column" }} spacing={1} alignItems="stretch" justifyContent="center">
              <Button variant="contained" startIcon={<CheckCircleOutline />} disabled={busyId === item.decisionId} onClick={() => void submitReview(item, "Approve")}>Approve</Button>
              <Button color="error" variant="outlined" startIcon={<ThumbDownAltOutlined />} disabled={busyId === item.decisionId} onClick={() => { setRejecting(item); setRejectReason(""); }}>Reject</Button>
            </Stack>
          </Stack>
        </CardContent></Card>
      ))}</Stack>}
      <Dialog open={Boolean(rejecting)} onClose={() => !busyId && setRejecting(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reject recruiter recommendation</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>{rejecting?.applicantName} · {rejecting?.vacancyTitle}</Typography>
          <TextField autoFocus multiline minRows={3} fullWidth required label="Reason for rejection" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} helperText="This reason is recorded in the candidate’s hiring audit history." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejecting(null)} disabled={Boolean(busyId)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={!rejectReason.trim() || Boolean(busyId)} onClick={() => rejecting && void submitReview(rejecting, "Reject", rejectReason.trim())}>{busyId ? "Saving…" : "Confirm rejection"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
