import { Refresh, Replay } from "@mui/icons-material";
import { Alert, Box, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, TablePagination, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRequest, postRequest } from "../../../../server/axios";
import { ApiResponse } from "../../../../utils/common_types";
import { AppButton, AppTextField } from "../../../shared/components/ui";

type DeadLetterEvent = {
  eventId: string;
  requestId: string;
  eventType: string;
  createdDate?: string | null;
  availableAtUtc: string;
  attemptCount: number;
  replayCount: number;
  replayedAtUtc?: string | null;
};

type DeadLetterPage = { methodResults?: DeadLetterEvent[]; totalRecords?: number };

const displayDate = (value?: string | null) => value ? new Date(value).toLocaleString() : "Not recorded";

export default function WorkFromHomeDeadLetterPanel() {
  const [events, setEvents] = useState<DeadLetterEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<DeadLetterEvent | null>(null);
  const [reason, setReason] = useState("");
  const [replaying, setReplaying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRequest<DeadLetterPage>(`api/wfh/outbox/dead-letter?pageNo=${page + 1}&pageSize=10`);
      setEvents(data.methodResults ?? []);
      setTotal(data.totalRecords ?? 0);
    } catch {
      setEvents([]);
      setTotal(0);
      toast.error("Unable to load WFH delivery failures.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { void load(); }, [load]);

  const replay = async () => {
    if (!target || reason.trim().length < 3 || reason.trim().length > 500 || replaying) return;
    setReplaying(true);
    try {
      const { data } = await postRequest<{ reason: string }, ApiResponse>(
        `api/wfh/outbox/dead-letter/${encodeURIComponent(target.eventId)}/replay`,
        { reason: reason.trim() },
      );
      if (!data.success) throw new Error(data.message);
      toast.success("WFH delivery event queued for retry.");
      setTarget(null);
      setReason("");
      await load();
    } catch (error) {
      toast.error((error as Error).message || "Unable to queue this event for retry.");
    } finally {
      setReplaying(false);
    }
  };

  return <>
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
        <Box>
          <Typography variant="h6" fontWeight={800}>WFH delivery failures</Typography>
          <Typography variant="body2" color="text.secondary">Review failed audit and notification delivery. Retry records an administrator, timestamp, and reason.</Typography>
        </Box>
        <AppButton variant="outlined" startIcon={<Refresh />} disabled={loading} onClick={() => void load()}>{loading ? "Refreshing…" : "Refresh"}</AppButton>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={1.25}>
        {events.length === 0 && <Typography color="text.secondary" sx={{ py: 1 }}>{loading ? "Loading delivery failures…" : "No WFH delivery failures are waiting for review."}</Typography>}
        {events.map((event) => <Box key={event.eventId} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={1.5}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip size="small" color="error" label={event.eventType} />
                <Typography variant="body2" fontWeight={700}>Request {event.requestId}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: .5, overflowWrap: "anywhere" }}>
                Event {event.eventId} · Failed attempts {event.attemptCount} · Manual retries {event.replayCount} · First queued {displayDate(event.createdDate)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Last replay: {displayDate(event.replayedAtUtc)}</Typography>
            </Box>
            <AppButton variant="contained" startIcon={<Replay />} onClick={() => { setTarget(event); setReason(""); }}>Retry with reason</AppButton>
          </Stack>
        </Box>)}
      </Stack>
      <TablePagination component="div" count={total} page={page} rowsPerPage={10} rowsPerPageOptions={[10]} onPageChange={(_, nextPage) => setPage(nextPage)} />
    </Card>

    <Dialog open={!!target} onClose={() => !replaying && setTarget(null)} fullWidth maxWidth="sm">
      <DialogTitle>Retry WFH delivery event</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="info">Completed audit, notification, and email milestones are retained. Only unfinished delivery steps will be retried; email and live push delivery can still be at least once.</Alert>
          {target && <Typography variant="body2" color="text.secondary">Event {target.eventId} · Request {target.requestId}</Typography>}
          <AppTextField label="Retry reason" value={reason} onChange={(event) => setReason(event.target.value)} required multiline minRows={3} inputProps={{ maxLength: 500 }} helperText={`${reason.trim().length}/500 characters; enter at least 3.`} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <AppButton variant="outlined" disabled={replaying} onClick={() => setTarget(null)}>Cancel</AppButton>
        <AppButton variant="contained" disabled={replaying || reason.trim().length < 3 || reason.trim().length > 500} onClick={() => void replay()}>{replaying ? "Queuing…" : "Queue retry"}</AppButton>
      </DialogActions>
    </Dialog>
  </>;
}
