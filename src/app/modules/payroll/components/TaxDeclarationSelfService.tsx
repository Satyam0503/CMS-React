import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { useAppSelector } from "../../../Redux/hooks";
import { EmployeeTaxDeclarationModel, SubmitTaxDeclarationPayload } from "../models";
import { getEmployeeTaxDeclaration, submitEmployeeTaxDeclaration } from "../services";

const currentFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const start = now.getMonth() >= 3 ? year : year - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
};

const emptyDeclaration = (financialYear: string): SubmitTaxDeclarationPayload => ({
  financialYear,
  regime: "NEW_115BAC",
  previousEmployerGrossSalary: 0,
  previousEmployerTds: 0,
  previousEmployerPf: 0,
  previousEmployerPt: 0,
  otherIncomeSavingsInterest: 0,
  otherIncomeOther: 0,
  declaredSection80C: 0,
  declaredSection80Ccd1B: 0,
  declaredSection80D: 0,
  declaredSection24HomeLoanInterest: 0,
  declaredHraRentPaid: 0,
  declaredSection80E: 0,
  declaredOtherDeductions: 0,
  landlordPan: "",
  rentalAddress: "",
  isMetroCity: false,
});

type NumericTaxField =
  | "previousEmployerGrossSalary" | "previousEmployerTds" | "previousEmployerPf" | "previousEmployerPt"
  | "otherIncomeSavingsInterest" | "otherIncomeOther" | "declaredSection80C" | "declaredSection80Ccd1B"
  | "declaredSection80D" | "declaredSection24HomeLoanInterest" | "declaredHraRentPaid"
  | "declaredSection80E" | "declaredOtherDeductions";

const numberFields: Array<{ key: NumericTaxField; label: string }> = [
  { key: "previousEmployerGrossSalary", label: "Previous employer salary" },
  { key: "previousEmployerTds", label: "Previous employer TDS" },
  { key: "previousEmployerPf", label: "Previous employer PF" },
  { key: "previousEmployerPt", label: "Previous employer professional tax" },
  { key: "otherIncomeSavingsInterest", label: "Savings interest income" },
  { key: "otherIncomeOther", label: "Other income" },
  { key: "declaredSection80C", label: "Section 80C investments" },
  { key: "declaredSection80Ccd1B", label: "Section 80CCD(1B) NPS" },
  { key: "declaredSection80D", label: "Section 80D medical insurance" },
  { key: "declaredSection24HomeLoanInterest", label: "Section 24 home loan interest" },
  { key: "declaredHraRentPaid", label: "Rent paid for HRA review" },
  { key: "declaredSection80E", label: "Section 80E education loan interest" },
  { key: "declaredOtherDeductions", label: "Other declared deductions" },
];

const toPayload = (record: EmployeeTaxDeclarationModel): SubmitTaxDeclarationPayload => ({
  financialYear: record.financialYear,
  regime: record.regime || "NEW_115BAC",
  previousEmployerGrossSalary: record.previousEmployerGrossSalary ?? 0,
  previousEmployerTds: record.previousEmployerTds ?? 0,
  previousEmployerPf: record.previousEmployerPf ?? 0,
  previousEmployerPt: record.previousEmployerPt ?? 0,
  otherIncomeSavingsInterest: record.otherIncomeSavingsInterest ?? 0,
  otherIncomeOther: record.otherIncomeOther ?? 0,
  declaredSection80C: record.declaredSection80C ?? 0,
  declaredSection80Ccd1B: record.declaredSection80Ccd1B ?? 0,
  declaredSection80D: record.declaredSection80D ?? 0,
  declaredSection24HomeLoanInterest: record.declaredSection24HomeLoanInterest ?? 0,
  declaredHraRentPaid: record.declaredHraRentPaid ?? 0,
  declaredSection80E: record.declaredSection80E ?? 0,
  declaredOtherDeductions: record.declaredOtherDeductions ?? 0,
  landlordPan: record.landlordPan ?? "",
  rentalAddress: record.rentalAddress ?? "",
  isMetroCity: record.isMetroCity,
});

export const calculateTaxComparison = (
  estimatedGross: number,
  deductions: {
    sec80C: number;
    sec80Ccd1B: number;
    sec80D: number;
    sec24: number;
    sec80E: number;
    other: number;
  }
) => {
  const newStdDed = 75000;
  const newNetTaxable = Math.max(0, estimatedGross - newStdDed);
  let newTaxBeforeRebate = 0;
  if (newNetTaxable > 2400000) {
    newTaxBeforeRebate += (newNetTaxable - 2400000) * 0.30 + (400000 * 0.25) + (400000 * 0.20) + (400000 * 0.15) + (400000 * 0.10) + (400000 * 0.05);
  } else if (newNetTaxable > 2000000) {
    newTaxBeforeRebate += (newNetTaxable - 2000000) * 0.25 + (400000 * 0.20) + (400000 * 0.15) + (400000 * 0.10) + (400000 * 0.05);
  } else if (newNetTaxable > 1600000) {
    newTaxBeforeRebate += (newNetTaxable - 1600000) * 0.20 + (400000 * 0.15) + (400000 * 0.10) + (400000 * 0.05);
  } else if (newNetTaxable > 1200000) {
    newTaxBeforeRebate += (newNetTaxable - 1200000) * 0.15 + (400000 * 0.10) + (400000 * 0.05);
  } else if (newNetTaxable > 800000) {
    newTaxBeforeRebate += (newNetTaxable - 800000) * 0.10 + (400000 * 0.05);
  } else if (newNetTaxable > 400000) {
    newTaxBeforeRebate += (newNetTaxable - 400000) * 0.05;
  }

  let newTaxAfterRebate = newTaxBeforeRebate;
  if (newNetTaxable <= 1200000) {
    newTaxAfterRebate = 0;
  } else if (newNetTaxable > 1200000) {
    const excessIncome = newNetTaxable - 1200000;
    if (newTaxBeforeRebate > excessIncome) {
      newTaxAfterRebate = excessIncome;
    }
  }
  const newFinalTax = Math.round(newTaxAfterRebate * 1.04);

  const oldStdDed = 50000;
  const eligible80C = Math.min(150000, Math.max(0, deductions.sec80C || 0));
  const eligible80Ccd = Math.min(50000, Math.max(0, deductions.sec80Ccd1B || 0));
  const eligible80D = Math.min(100000, Math.max(0, deductions.sec80D || 0));
  const eligibleSec24 = Math.min(200000, Math.max(0, deductions.sec24 || 0));
  const eligible80E = Math.max(0, deductions.sec80E || 0);
  const eligibleOther = Math.max(0, deductions.other || 0);

  const totalOldDeductions = oldStdDed + eligible80C + eligible80Ccd + eligible80D + eligibleSec24 + eligible80E + eligibleOther;
  const oldNetTaxable = Math.max(0, estimatedGross - totalOldDeductions);

  let oldTaxBeforeRebate = 0;
  if (oldNetTaxable > 1000000) {
    oldTaxBeforeRebate += (oldNetTaxable - 1000000) * 0.30 + (500000 * 0.20) + (250000 * 0.05);
  } else if (oldNetTaxable > 500000) {
    oldTaxBeforeRebate += (oldNetTaxable - 500000) * 0.20 + (250000 * 0.05);
  } else if (oldNetTaxable > 250000) {
    oldTaxBeforeRebate += (oldNetTaxable - 250000) * 0.05;
  }

  let oldTaxAfterRebate = oldTaxBeforeRebate;
  if (oldNetTaxable <= 500000) {
    oldTaxAfterRebate = 0;
  }
  const oldFinalTax = Math.round(oldTaxAfterRebate * 1.04);

  return {
    newNetTaxable,
    newFinalTax,
    oldNetTaxable,
    oldFinalTax,
    totalOldDeductions,
    savings: Math.abs(oldFinalTax - newFinalTax),
    recommendedRegime: (newFinalTax <= oldFinalTax ? "NEW_115BAC" : "OLD_REGIME") as "NEW_115BAC" | "OLD_REGIME",
  };
};

export default function TaxDeclarationSelfService() {
  const userId = useAppSelector((state) => state.user.userData?.userId);
  const [financialYear, setFinancialYear] = useState(currentFinancialYear);
  const [declaration, setDeclaration] = useState<SubmitTaxDeclarationPayload>(() => emptyDeclaration(currentFinancialYear()));
  const [record, setRecord] = useState<EmployeeTaxDeclarationModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revisionMode, setRevisionMode] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [estimatedAnnualSalary, setEstimatedAnnualSalary] = useState<number>(1200000);
  const isLocked = record?.status === "SUBMITTED" || (record?.status === "APPROVED" && !revisionMode);
  const yearOptions = useMemo(() => {
    const current = currentFinancialYear();
    const start = Number(current.slice(0, 4));
    return [current, `${start - 1}-${String(start).slice(-2)}`];
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setRecord(null);
    setRevisionMode(false);
    setDeclaration(emptyDeclaration(financialYear));
    if (!userId) {
      setLoading(false);
      return () => { mounted = false; };
    }
    getEmployeeTaxDeclaration(userId, financialYear)
      .then(({ data }) => {
        if (!mounted) return;
        if (data.success && data.methodResult) {
          setRecord(data.methodResult);
          setDeclaration(toPayload(data.methodResult));
        } else if (data.statusCode !== 404) {
          toast.error(data.message || "Could not load your tax declaration.");
        }
      })
      .catch(() => { if (mounted) toast.error("Could not load your tax declaration."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [financialYear, userId]);

  const changeAmount = (key: NumericTaxField, value: string) => {
    setDeclaration((current) => ({ ...current, [key]: value === "" ? 0 : Number(value) }));
  };

  const isNewRegime = declaration.regime === "NEW_115BAC";
  const isRentAboveOneLakh = (declaration.declaredHraRentPaid || 0) > 100000;
  const totalChapterViADeclared = useMemo(() => {
    return (
      (declaration.declaredSection80C || 0) +
      (declaration.declaredSection80Ccd1B || 0) +
      (declaration.declaredSection80D || 0) +
      (declaration.declaredSection24HomeLoanInterest || 0) +
      (declaration.declaredSection80E || 0) +
      (declaration.declaredOtherDeductions || 0)
    );
  }, [declaration]);

  const comparison = useMemo(() => {
    return calculateTaxComparison(estimatedAnnualSalary, {
      sec80C: declaration.declaredSection80C,
      sec80Ccd1B: declaration.declaredSection80Ccd1B,
      sec80D: declaration.declaredSection80D,
      sec24: declaration.declaredSection24HomeLoanInterest,
      sec80E: declaration.declaredSection80E,
      other: declaration.declaredOtherDeductions,
    });
  }, [estimatedAnnualSalary, declaration]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || saving || isLocked) return;
    if (numberFields.some(({ key }) => Number(declaration[key]) < 0)) {
      toast.error("Amounts cannot be negative.");
      return;
    }
    if (declaration.declaredHraRentPaid > 100000 && !declaration.landlordPan?.trim()) {
      toast.warning("CBDT mandates Landlord PAN when annual rent exceeds ₹1,00,000.");
    }
    setSaving(true);
    try {
      const { data } = await submitEmployeeTaxDeclaration(userId, { ...declaration, financialYear });
      if (!data.success || !data.methodResult) throw new Error(data.message || "Declaration could not be submitted.");
      setRecord(data.methodResult);
      setDeclaration(toPayload(data.methodResult));
      setRevisionMode(false);
      toast.success("Tax declaration submitted for payroll review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Declaration could not be submitted.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2.5} component="form" onSubmit={submit}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" gap={1.5}>
            <Box>
              <Typography variant="h5" fontWeight={700}>Tax declaration</Typography>
              <Typography variant="body2" color="text.secondary">Submit income and deduction details for payroll&apos;s annual tax estimate.</Typography>
            </Box>
            {record && <Chip label={`${record.status} · v${record.version}`} color={record.status === "APPROVED" ? "success" : record.status === "REJECTED" ? "error" : "info"} variant="outlined" />}
          </Stack>

          <Alert severity="info">Payroll review is required before declared deductions affect a payroll estimate. Keep supporting documents available for your payroll team; this screen does not upload evidence.</Alert>
          {isNewRegime ? (
            <Alert severity="info" variant="outlined">
              <strong>New Tax Regime (Section 115BAC):</strong> Default statutory regime. Automatic Standard Deduction of ₹75,000 applies with Nil tax up to ₹12 Lakhs (via Section 87A rebate &amp; marginal relief). Chapter VI-A deductions (80C, 80D, 80E, HRA, Section 24) are not allowable by law under this regime.
            </Alert>
          ) : (
            <Alert severity="info" variant="outlined">
              <strong>Old Tax Regime:</strong> Standard Deduction of ₹50,000 applies. Deductions declared under Chapter VI-A (Section 80C up to ₹1.5L, 80D medical, 80CCD(1B) NPS ₹50K, Section 24 home loan interest up to ₹2L, and HRA Section 10(13A)) will be verified and deducted from gross income.
            </Alert>
          )}
          {record?.rejectionReason && <Alert severity="warning">Returned for changes: {record.rejectionReason}</Alert>}
          {record?.reviewRemarks && <Alert severity="info">Reviewer note: {record.reviewRemarks}</Alert>}

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Chip
                label={`Total Chapter VI-A Declared: ₹${totalChapterViADeclared.toLocaleString("en-IN")}`}
                color={isNewRegime ? "default" : "primary"}
                variant={isNewRegime ? "outlined" : "filled"}
                size="small"
              />
              {isNewRegime && totalChapterViADeclared > 0 && (
                <Typography variant="caption" color="text.secondary">
                  (Note: Deductions will not reduce TDS under the New Tax Regime)
                </Typography>
              )}
            </Stack>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowSimulator((s) => !s)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {showSimulator ? "Hide Tax Simulator" : "Compare Old vs. New Regime (Live Simulator)"}
            </Button>
          </Stack>

          {showSimulator && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default", borderRadius: 2 }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.5}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Live Regime Comparison Simulator (FY {financialYear})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Estimates annual tax liability under both regimes based on your entered gross income and declared deductions.
                    </Typography>
                  </Box>
                  <Chip
                    label={`Recommended: ${comparison.recommendedRegime === "NEW_115BAC" ? "New Regime" : "Old Regime"} (Saves ₹${comparison.savings.toLocaleString("en-IN")})`}
                    color="success"
                    size="small"
                  />
                </Stack>

                <TextField
                  label="Estimated Annual Gross CTC / Salary"
                  type="number"
                  size="small"
                  value={estimatedAnnualSalary}
                  onChange={(e) => setEstimatedAnnualSalary(Math.max(0, Number(e.target.value)))}
                  sx={{ maxWidth: 300 }}
                  inputProps={{ min: 0, step: "10000" }}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 1.5, border: "1px solid", borderColor: declaration.regime === "NEW_115BAC" ? "primary.main" : "divider", borderRadius: 1.5, bgcolor: declaration.regime === "NEW_115BAC" ? "action.hover" : "inherit" }}>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={700}>New Tax Regime (u/s 115BAC)</Typography>
                          {declaration.regime === "NEW_115BAC" && <Chip label="Selected" size="small" color="primary" />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">Standard Deduction: ₹75,000</Typography>
                        <Typography variant="caption" color="text.secondary">Net Taxable: ₹{comparison.newNetTaxable.toLocaleString("en-IN")}</Typography>
                        <Typography variant="body2" fontWeight={700} color="primary">
                          Annual Tax: ₹{comparison.newFinalTax.toLocaleString("en-IN")}
                        </Typography>
                        {declaration.regime !== "NEW_115BAC" && !isLocked && (
                          <Button size="small" variant="outlined" onClick={() => setDeclaration(c => ({ ...c, regime: "NEW_115BAC" }))} sx={{ mt: 1, alignSelf: "flex-start" }}>
                            Switch to New Regime
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 1.5, border: "1px solid", borderColor: declaration.regime === "OLD_REGIME" ? "primary.main" : "divider", borderRadius: 1.5, bgcolor: declaration.regime === "OLD_REGIME" ? "action.hover" : "inherit" }}>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={700}>Old Tax Regime</Typography>
                          {declaration.regime === "OLD_REGIME" && <Chip label="Selected" size="small" color="primary" />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">Std Ded + Eligible VI-A: ₹{comparison.totalOldDeductions.toLocaleString("en-IN")}</Typography>
                        <Typography variant="caption" color="text.secondary">Net Taxable: ₹{comparison.oldNetTaxable.toLocaleString("en-IN")}</Typography>
                        <Typography variant="body2" fontWeight={700} color="primary">
                          Annual Tax: ₹{comparison.oldFinalTax.toLocaleString("en-IN")}
                        </Typography>
                        {declaration.regime !== "OLD_REGIME" && !isLocked && (
                          <Button size="small" variant="outlined" onClick={() => setDeclaration(c => ({ ...c, regime: "OLD_REGIME" }))} sx={{ mt: 1, alignSelf: "flex-start" }}>
                            Switch to Old Regime
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="tax-fy-label">Financial year</InputLabel>
                <Select labelId="tax-fy-label" label="Financial year" value={financialYear} onChange={(event) => setFinancialYear(event.target.value)} disabled={loading || saving}>
                  {yearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="tax-regime-label">Tax regime</InputLabel>
                <Select labelId="tax-regime-label" label="Tax regime" value={declaration.regime} onChange={(event) => setDeclaration((current) => ({ ...current, regime: event.target.value }))} disabled={Boolean(isLocked) || loading}>
                  <MenuItem value="NEW_115BAC">New regime</MenuItem>
                  <MenuItem value="OLD_REGIME">Old regime</MenuItem>
                </Select>
                <FormHelperText>Payroll applies deductions according to the approved regime and tax-year rules.</FormHelperText>
              </FormControl>
            </Grid>
            {numberFields.map(({ key, label }) => (
              <Grid key={key} size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth type="number" label={label} value={declaration[key] ?? 0} onChange={(event) => changeAmount(key, event.target.value)} disabled={Boolean(isLocked) || loading} inputProps={{ min: 0, step: "0.01" }} />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Landlord PAN (if applicable)"
                value={declaration.landlordPan ?? ""}
                onChange={(event) => setDeclaration((current) => ({ ...current, landlordPan: event.target.value.toUpperCase() }))}
                disabled={Boolean(isLocked) || loading}
                inputProps={{ maxLength: 10 }}
                error={isRentAboveOneLakh && !declaration.landlordPan?.trim()}
                helperText={isRentAboveOneLakh && !declaration.landlordPan?.trim() ? "Mandatory: CBDT mandates Landlord PAN when annual rent exceeds ₹1,00,000." : undefined}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Rental address (if applicable)" value={declaration.rentalAddress ?? ""} onChange={(event) => setDeclaration((current) => ({ ...current, rentalAddress: event.target.value }))} disabled={Boolean(isLocked) || loading} inputProps={{ maxLength: 500 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel id="metro-city-label">Rental city category</InputLabel>
                <Select labelId="metro-city-label" label="Rental city category" value={declaration.isMetroCity ? "METRO" : "NON_METRO"} onChange={(event) => setDeclaration((current) => ({ ...current, isMetroCity: event.target.value === "METRO" }))} disabled={Boolean(isLocked) || loading}>
                  <MenuItem value="METRO">Metro</MenuItem>
                  <MenuItem value="NON_METRO">Non-metro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {record && <Typography variant="caption" color="text.secondary">Submitted {record.submittedAtUtc ? new Date(record.submittedAtUtc).toLocaleString() : ""}{record.reviewedAtUtc ? ` · reviewed ${new Date(record.reviewedAtUtc).toLocaleString()}` : ""}</Typography>}
          <Stack direction="row" justifyContent="flex-end">
            {record?.status === "APPROVED" && !revisionMode ? (
              <Button variant="outlined" onClick={() => setRevisionMode(true)} disabled={loading}>Revise declaration</Button>
            ) : (
              <Button variant="contained" type="submit" disabled={Boolean(isLocked) || loading || saving || !userId} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}>
                {saving ? "Submitting…" : record?.status === "REJECTED" ? "Resubmit declaration" : record?.status === "APPROVED" ? "Submit new version" : "Submit declaration"}
              </Button>
            )}
          </Stack>
          {isLocked && <Typography variant="body2" color="text.secondary">{record?.status === "SUBMITTED" ? "This declaration is locked while it is under review. Payroll must return it before you can revise it." : "This approved version stays in payroll history. Start a new version to report a change."}</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
}
