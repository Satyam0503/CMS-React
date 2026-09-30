import { Alert, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getPayrollAuditHistory } from "../services";
import { PayrollAuditEventModel } from "../models";
import { AppButton } from "../../../shared/components/ui";

type Props = { payrollId: string | null; employeeName: string; onClose: () => void };

export const PayrollAuditHistoryModal = ({ payrollId, employeeName, onClose }: Props) => {
  const [events, setEvents] = useState<PayrollAuditEventModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setEvents([]);
    setError(null);
    if (!payrollId) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    void getPayrollAuditHistory(payrollId)
      .then(({ data }) => {
        if (!active) return;
        if (data.success) setEvents(data.methodResult ?? []);
        else setError(data.message || "Unable to load payroll history.");
      })
      .catch((reason: any) => {
        if (active) setError(reason?.response?.data?.message ?? "Unable to load payroll history.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [payrollId]);

  return <Dialog open={Boolean(payrollId)} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="payroll-audit-title">
    <DialogTitle id="payroll-audit-title">Payroll history · {employeeName}</DialogTitle>
    <DialogContent dividers>
      {loading && <Stack alignItems="center" py={3} aria-label="Loading payroll history"><CircularProgress size={24} /></Stack>}
      {!loading && error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && events.length === 0 && <Typography color="text.secondary" py={2}>No audit events have been recorded for this payroll.</Typography>}
      {!loading && !error && events.length > 0 && <List disablePadding>{events.map((event, index) => <span key={`${event.action}-${event.occurredAtUtc}-${index}`}><ListItem disableGutters alignItems="flex-start"><ListItemText primary={event.action} secondary={<>{new Date(event.occurredAtUtc).toLocaleString()} · {event.actorId}{event.notes ? ` · ${event.notes}` : ""}</>} /></ListItem>{index < events.length - 1 && <Divider />}</span>)}</List>}
      <Stack direction="row" justifyContent="flex-end" mt={2}><AppButton variant="outlined" onClick={onClose}>Close</AppButton></Stack>
    </DialogContent>
  </Dialog>;
};