import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { canAccessHrManagement, hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { EmployeeTaxDeclarationModel } from "../models";
import { getCompanyTaxDeclarations, reviewEmployeeTaxDeclaration } from "../services";

const getCurrentFinancialYear = () => {
  const now = new Date();
  const start = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
};

const money = (amount: number) => new Intl.NumberFormat(undefined, {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
}).format(amount || 0);

export default function TaxDeclarationReviewQueue() {
  const permissions = useAppSelector((state) => state.user.userData?.modulePermission ?? []);
  const currentUserId = useAppSelector((state) => state.user.userData?.userId ?? "");
  const roleType = useAppSelector((state) => state.user.userData?.roleType);
  const canAccessQueue = canAccessHrManagement(roleType);
  const canApprove = hasModuleFeaturePermission(ModulesName.PayRoll, Permission.Approve, permissions);
  const [financialYear, setFinancialYear] = useState(getCurrentFinancialYear);
  const [declarations, setDeclarations] = useState<EmployeeTaxDeclarationModel[]>([]);
  const [selected, setSelected] = useState<EmployeeTaxDeclarationModel | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [approvedHraExemption, setApprovedHraExemption] = useState("0");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!canAccessQueue) {
      setDeclarations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await getCompanyTaxDeclarations(financialYear, "SUBMITTED");
      if (!data.success) throw new Error(data.message || "Unable to load tax declarations.");
      setDeclarations(data.methodResult ?? []);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to load tax declarations.";
      setError(message);
      setDeclarations([]);
    } finally {
      setLoading(false);
    }
  }, [canAccessQueue, financialYear]);

  useEffect(() => { void load(); }, [load]);

  const close = () => {
    if (busy) return;
    setSelected(null);
    setRejectionReason("");
    setReviewRemarks("");
    setApprovedHraExemption("0");
  };

  const review = async (decision: "APPROVE" | "REJECT") => {
    if (!selected || busy || !canApprove) return;
    if (selected.submittedBy === currentUserId) {
      toast.error("You cannot review a declaration you submitted.");
      return;
    }
    if (decision === "REJECT" && !rejectionReason.trim()) {
      toast.error("Add a reason before returning this declaration.");
      return;
    }
    const hraAmount = Number(approvedHraExemption);
    if (!Number.isFinite(hraAmount) || hraAmount < 0 || hraAmount > selected.declaredHraRentPaid) {
      toast.error("HRA exemption must be between zero and the employee's declared rent.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await reviewEmployeeTaxDeclaration(selected.id, {
        decision,
        reviewRemarks: reviewRemarks.trim() || undefined,
        rejectionReason: decision === "REJECT" ? rejectionReason.trim() : undefined,
        approvedHraExemption: decision === "APPROVE" ? hraAmount : undefined,
      });
      if (!data.success) throw new Error(data.message || "Review could not be saved.");
      toast.success(decision === "APPROVE" ? "Declaration approved." : "Declaration returned to the employee.");
      close();
      await load();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Review could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const detail = (item: EmployeeTaxDeclarationModel) => (
    <Card variant="outlined" key={item.id}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} gap={1}>
            <Box>
              <Typography variant="h6">{item.employeeId}</Typography>
              <Typography variant="body2" color="text.secondary">FY {item.financialYear} · {item.regime === "OLD_REGIME" ? "Old regime" : "New regime"}</Typography>
            </Box>
            <Stack direction="row" alignItems="center" gap={1}>
              <Chip size="small" label={`Version ${item.version}`} variant="outlined" />
              <Button variant="outlined" onClick={() => setSelected(item)}>Review</Button>
            </Stack>
          </Stack>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}><Typography variant="body2">Previous salary: {money(item.previousEmployerGrossSalary)}</Typography></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><Typography variant="body2">Previous TDS: {money(item.previousEmployerTds)}</Typography></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><Typography variant="body2">Other income: {money(item.otherIncomeSavingsInterest + item.otherIncomeOther)}</Typography></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><Typography variant="body2">Proof records: {item.proofAttachments?.length ?? 0}</Typography></Grid>
          </Grid>
          {item.proofAttachments?.length ? (
            <Typography variant="caption" color="text.secondary">Evidence metadata: {item.proofAttachments.map((proof) => `${proof.section} ${proof.documentName} (${money(proof.amount)})`).join(" · ")}</Typography>
          ) : <Alert severity="warning">No evidence is attached. Verify evidence through your approved company process before accepting proof-dependent claims.</Alert>}
        </Stack>
      </CardContent>
    </Card>
  );

  const year = Number(financialYear.slice(0, 4));
  const yearOptions = [financialYear, `${year - 1}-${String(year).slice(-2)}`];

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" gap={1.5}>
          <Box><Typography variant="h5" fontWeight={700}>Tax declaration review</Typography><Typography variant="body2" color="text.secondary">Review submitted employee income and deduction claims for this company.</Typography></Box>
          <TextField select label="Financial year" value={financialYear} onChange={(event) => setFinancialYear(event.target.value)} sx={{ minWidth: { xs: "100%", sm: 180 } }}>
            {yearOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
        </Stack>
        {!canAccessQueue && <Alert severity="error">Only HR, HR Executive, and administrators can access this review queue.</Alert>}
        {!canApprove && <Alert severity="info">You can view the review queue. Payroll approval permission is required to approve or return declarations.</Alert>}
        {error && <Alert severity="error" action={<Button color="inherit" onClick={() => void load()}>Retry</Button>}>{error}</Alert>}
        {loading ? <Stack alignItems="center" py={5}><CircularProgress /></Stack> : declarations.length ? declarations.map(detail) : !error ? <Alert severity="success">There are no submitted declarations for {financialYear}.</Alert> : null}
      </Stack>

      <Dialog open={Boolean(selected)} onClose={close} fullWidth maxWidth="md" slotProps={{ paper: { sx: { minWidth: { xs: "calc(100vw - 32px)", sm: "auto" } } } }}>
        <DialogTitle>Review tax declaration · {selected?.employeeId}</DialogTitle>
        <DialogContent>
          {selected && <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning">Declarations are employee-provided. Review submitted evidence and company policy before approval. Current payroll estimates are not filing-ready statutory calculations.</Alert>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}><Typography>Tax regime: {selected.regime}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography>Previous employer salary / TDS: {money(selected.previousEmployerGrossSalary)} / {money(selected.previousEmployerTds)}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography>Other income: {money(selected.otherIncomeSavingsInterest + selected.otherIncomeOther)}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography>80C / 80CCD(1B): {money(selected.declaredSection80C)} / {money(selected.declaredSection80Ccd1B)}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography>80D / Section 24: {money(selected.declaredSection80D)} / {money(selected.declaredSection24HomeLoanInterest)}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography>80E / other deductions: {money(selected.declaredSection80E)} / {money(selected.declaredOtherDeductions)}</Typography></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Typography>Rent / landlord PAN: {money(selected.declaredHraRentPaid)} / {selected.landlordPan || "Not provided"}</Typography></Grid>
            </Grid>
            {selected.proofAttachments?.map((proof) => <Typography key={proof.id} variant="body2">{proof.section}: {proof.documentName} · {money(proof.amount)} · {proof.isVerified ? "verified" : "not verified"}</Typography>)}
            {selected.submittedBy === currentUserId && <Alert severity="error">You submitted this declaration and cannot review it.</Alert>}
            <TextField label="Approved HRA exemption" type="number" value={approvedHraExemption} onChange={(event) => setApprovedHraExemption(event.target.value)} inputProps={{ min: 0, max: selected.declaredHraRentPaid, step: "0.01" }} helperText="Other approved amounts are capped by the employee's declared claims and current rule ceilings." />
            <TextField label="Review remarks" value={reviewRemarks} onChange={(event) => setReviewRemarks(event.target.value)} multiline minRows={2} inputProps={{ maxLength: 1000 }} />
            <TextField label="Return reason" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} multiline minRows={2} required inputProps={{ maxLength: 1000 }} />
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ flexWrap: "wrap", gap: 1, px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={close} disabled={busy}>Close</Button>
          <Button variant="outlined" color="error" onClick={() => void review("REJECT")} disabled={!canApprove || busy || !rejectionReason.trim() || selected?.submittedBy === currentUserId}>{busy ? "Saving…" : "Return for changes"}</Button>
          <Button variant="contained" onClick={() => void review("APPROVE")} disabled={!canApprove || busy || selected?.submittedBy === currentUserId}>{busy ? "Saving…" : "Approve declaration"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
