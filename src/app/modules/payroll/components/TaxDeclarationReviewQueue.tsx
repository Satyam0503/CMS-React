import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
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
  const [approved80C, setApproved80C] = useState("0");
  const [approved80Ccd1B, setApproved80Ccd1B] = useState("0");
  const [approved80D, setApproved80D] = useState("0");
  const [approvedSection24, setApprovedSection24] = useState("0");
  const [approved80E, setApproved80E] = useState("0");
  const [approvedOther, setApprovedOther] = useState("0");
  const [verifiedAttachmentIds, setVerifiedAttachmentIds] = useState<string[]>([]);
  const [previewAttachmentIndex, setPreviewAttachmentIndex] = useState(0);
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

  const openReviewModal = (item: EmployeeTaxDeclarationModel) => {
    setSelected(item);
    setRejectionReason("");
    setReviewRemarks("");
    setApprovedHraExemption(String(item.approvedHraExemption || item.declaredHraRentPaid || 0));
    setApproved80C(String(item.approvedSection80C || item.declaredSection80C || 0));
    setApproved80Ccd1B(String(item.approvedSection80Ccd1B || item.declaredSection80Ccd1B || 0));
    setApproved80D(String(item.approvedSection80D || item.declaredSection80D || 0));
    setApprovedSection24(String(item.approvedSection24HomeLoanInterest || item.declaredSection24HomeLoanInterest || 0));
    setApproved80E(String(item.approvedSection80E || item.declaredSection80E || 0));
    setApprovedOther(String(item.approvedOtherDeductions || item.declaredOtherDeductions || 0));
    setVerifiedAttachmentIds(item.proofAttachments?.filter((p) => p.isVerified).map((p) => p.id) ?? []);
    setPreviewAttachmentIndex(0);
  };

  const close = () => {
    if (busy) return;
    setSelected(null);
    setRejectionReason("");
    setReviewRemarks("");
    setApprovedHraExemption("0");
    setApproved80C("0");
    setApproved80Ccd1B("0");
    setApproved80D("0");
    setApprovedSection24("0");
    setApproved80E("0");
    setApprovedOther("0");
    setVerifiedAttachmentIds([]);
    setPreviewAttachmentIndex(0);
  };

  const toggleAttachmentVerification = (id: string) => {
    setVerifiedAttachmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

    const val80C = Number(approved80C);
    const val80Ccd = Number(approved80Ccd1B);
    const val80D = Number(approved80D);
    const valSec24 = Number(approvedSection24);
    const val80E = Number(approved80E);
    const valOther = Number(approvedOther);

    if ([val80C, val80Ccd, val80D, valSec24, val80E, valOther].some((n) => !Number.isFinite(n) || n < 0)) {
      toast.error("Approved amounts cannot be negative.");
      return;
    }

    setBusy(true);
    try {
      const { data } = await reviewEmployeeTaxDeclaration(selected.id, {
        decision,
        reviewRemarks: reviewRemarks.trim() || undefined,
        rejectionReason: decision === "REJECT" ? rejectionReason.trim() : undefined,
        approvedHraExemption: decision === "APPROVE" ? hraAmount : undefined,
        approvedSection80C: decision === "APPROVE" ? val80C : undefined,
        approvedSection80Ccd1B: decision === "APPROVE" ? val80Ccd : undefined,
        approvedSection80D: decision === "APPROVE" ? val80D : undefined,
        approvedSection24HomeLoanInterest: decision === "APPROVE" ? valSec24 : undefined,
        approvedSection80E: decision === "APPROVE" ? val80E : undefined,
        approvedOtherDeductions: decision === "APPROVE" ? valOther : undefined,
        verifiedAttachmentIds: decision === "APPROVE" ? verifiedAttachmentIds : undefined,
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
              <Button variant="outlined" onClick={() => openReviewModal(item)}>Review</Button>
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

      <Dialog open={Boolean(selected)} onClose={close} fullWidth maxWidth="lg" slotProps={{ paper: { sx: { minWidth: { xs: "calc(100vw - 32px)", sm: "auto" } } } }}>
        <DialogTitle>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1}>
            <Typography variant="h6" fontWeight={700}>Review tax declaration · {selected?.employeeId}</Typography>
            <Chip size="small" label={`FY ${selected?.financialYear} · ${selected?.regime === "OLD_REGIME" ? "Old Regime" : "New Regime (115BAC)"}`} color={selected?.regime === "OLD_REGIME" ? "primary" : "secondary"} />
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={2.5}>
              <Alert severity="warning">
                Declarations are employee-provided. Review submitted evidence and statutory caps before approval. Current payroll estimates are not filing-ready statutory calculations.
              </Alert>
              {selected.submittedBy === currentUserId && (
                <Alert severity="error">You submitted this declaration and cannot review it.</Alert>
              )}
              {selected.regime === "NEW_115BAC" && (
                <Alert severity="info">
                  Under Section 115BAC (New Regime), deductions under Chapter VI-A (80C, 80D, etc.) and HRA exemption are not allowable. Approved amounts will be recorded as ₹0 by law.
                </Alert>
              )}

              <Grid container spacing={2.5}>
                {/* Left side: Split-Screen Proof Verification & Preview */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Paper variant="outlined" sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>
                        Proof documents ({selected.proofAttachments?.length || 0})
                      </Typography>
                      <Chip
                        size="small"
                        color={verifiedAttachmentIds.length === (selected.proofAttachments?.length || 0) && verifiedAttachmentIds.length > 0 ? "success" : "default"}
                        label={`${verifiedAttachmentIds.length} / ${selected.proofAttachments?.length || 0} verified`}
                      />
                    </Stack>
                    <Divider />
                    {(!selected.proofAttachments || selected.proofAttachments.length === 0) ? (
                      <Alert severity="info">No proof documents were attached to this tax declaration.</Alert>
                    ) : (
                      <>
                        <Stack spacing={1} sx={{ maxHeight: 220, overflowY: "auto", pr: 0.5 }}>
                          {selected.proofAttachments.map((proof, idx) => {
                            const isVerified = verifiedAttachmentIds.includes(proof.id);
                            const isSelected = previewAttachmentIndex === idx;
                            return (
                              <Paper
                                key={proof.id}
                                variant="outlined"
                                onClick={() => setPreviewAttachmentIndex(idx)}
                                sx={{
                                  p: 1.25,
                                  cursor: "pointer",
                                  bgcolor: isSelected ? "action.selected" : "background.paper",
                                  borderColor: isSelected ? "primary.main" : "divider",
                                }}
                              >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="body2" fontWeight={600} noWrap>
                                      {proof.documentName || "Document"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {proof.section} · {money(proof.amount)}
                                    </Typography>
                                  </Box>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        size="small"
                                        checked={isVerified}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          toggleAttachmentVerification(proof.id);
                                        }}
                                      />
                                    }
                                    label={<Typography variant="caption">{isVerified ? "Verified" : "Verify"}</Typography>}
                                    sx={{ m: 0 }}
                                  />
                                </Stack>
                              </Paper>
                            );
                          })}
                        </Stack>

                        {selected.proofAttachments[previewAttachmentIndex] && (
                          <Box sx={{ mt: 1, border: 1, borderColor: "divider", borderRadius: 1, p: 1.5, flex: 1, minHeight: 180, display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="caption" fontWeight={600} noWrap>
                                Preview: {selected.proofAttachments[previewAttachmentIndex].documentName}
                              </Typography>
                              {selected.proofAttachments[previewAttachmentIndex].documentUrl && (
                                <Button
                                  size="small"
                                  variant="text"
                                  href={selected.proofAttachments[previewAttachmentIndex].documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Open
                                </Button>
                              )}
                            </Stack>
                            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "action.hover", borderRadius: 1, minHeight: 140 }}>
                              {selected.proofAttachments[previewAttachmentIndex].documentUrl ? (
                                <iframe
                                  src={selected.proofAttachments[previewAttachmentIndex].documentUrl}
                                  title="Document preview"
                                  style={{ width: "100%", height: "200px", border: "none" }}
                                />
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  No preview URL available.
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                      </>
                    )}
                  </Paper>
                </Grid>

                {/* Right side: Itemized Approved Amounts & Remarks */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack spacing={2}>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Reported income from other sources & previous employer
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2">Previous salary: {money(selected.previousEmployerGrossSalary)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2">Previous TDS: {money(selected.previousEmployerTds)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2">Savings interest: {money(selected.otherIncomeSavingsInterest)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2">Other income: {money(selected.otherIncomeOther)}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    <Typography variant="subtitle2" fontWeight={700}>
                      Itemized deduction approvals
                    </Typography>

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Approved Section 80C"
                          type="number"
                          value={approved80C}
                          onChange={(e) => setApproved80C(e.target.value)}
                          helperText={`Declared: ${money(selected.declaredSection80C)} · Max: ₹1,50,000`}
                          inputProps={{ min: 0, max: Math.min(150000, selected.declaredSection80C), step: "1" }}
                          disabled={selected.regime === "NEW_115BAC"}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Approved Section 80CCD(1B)"
                          type="number"
                          value={approved80Ccd1B}
                          onChange={(e) => setApproved80Ccd1B(e.target.value)}
                          helperText={`Declared: ${money(selected.declaredSection80Ccd1B)} · Max: ₹50,000`}
                          inputProps={{ min: 0, max: Math.min(50000, selected.declaredSection80Ccd1B), step: "1" }}
                          disabled={selected.regime === "NEW_115BAC"}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Approved Section 80D"
                          type="number"
                          value={approved80D}
                          onChange={(e) => setApproved80D(e.target.value)}
                          helperText={`Declared: ${money(selected.declaredSection80D)} · Max: ₹1,00,000`}
                          inputProps={{ min: 0, max: Math.min(100000, selected.declaredSection80D), step: "1" }}
                          disabled={selected.regime === "NEW_115BAC"}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Approved Section 24 (Home Loan)"
                          type="number"
                          value={approvedSection24}
                          onChange={(e) => setApprovedSection24(e.target.value)}
                          helperText={`Declared: ${money(selected.declaredSection24HomeLoanInterest)} · Max: ₹2,00,000`}
                          inputProps={{ min: 0, max: Math.min(200000, selected.declaredSection24HomeLoanInterest), step: "1" }}
                          disabled={selected.regime === "NEW_115BAC"}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Approved HRA exemption"
                          type="number"
                          value={approvedHraExemption}
                          onChange={(event) => setApprovedHraExemption(event.target.value)}
                          inputProps={{ min: 0, max: selected.declaredHraRentPaid, step: "1" }}
                          helperText={`Declared rent: ${money(selected.declaredHraRentPaid)} · Landlord PAN: ${selected.landlordPan || "None"}`}
                          disabled={selected.regime === "NEW_115BAC"}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Approved Section 80E"
                          type="number"
                          value={approved80E}
                          onChange={(e) => setApproved80E(e.target.value)}
                          helperText={`Declared: ${money(selected.declaredSection80E)}`}
                          inputProps={{ min: 0, max: selected.declaredSection80E, step: "1" }}
                          disabled={selected.regime === "NEW_115BAC"}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 12 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Approved other deductions"
                          type="number"
                          value={approvedOther}
                          onChange={(e) => setApprovedOther(e.target.value)}
                          helperText={`Declared: ${money(selected.declaredOtherDeductions)}`}
                          inputProps={{ min: 0, max: selected.declaredOtherDeductions, step: "1" }}
                          disabled={selected.regime === "NEW_115BAC"}
                        />
                      </Grid>
                    </Grid>

                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "action.hover" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={600}>Total approved deductions:</Typography>
                        <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                          {money(
                            (selected.regime === "NEW_115BAC" ? 0 : (
                              (Number(approved80C) || 0) +
                              (Number(approved80Ccd1B) || 0) +
                              (Number(approved80D) || 0) +
                              (Number(approvedSection24) || 0) +
                              (Number(approvedHraExemption) || 0) +
                              (Number(approved80E) || 0) +
                              (Number(approvedOther) || 0)
                            ))
                          )}
                        </Typography>
                      </Stack>
                    </Paper>

                    <TextField
                      label="Review remarks"
                      value={reviewRemarks}
                      onChange={(event) => setReviewRemarks(event.target.value)}
                      multiline
                      minRows={2}
                      inputProps={{ maxLength: 1000 }}
                      placeholder="Optional notes for payroll audit record"
                    />
                    <TextField
                      label="Return reason"
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      multiline
                      minRows={2}
                      required
                      inputProps={{ maxLength: 1000 }}
                      placeholder="Required only if returning declaration to employee for changes"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          )}
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
