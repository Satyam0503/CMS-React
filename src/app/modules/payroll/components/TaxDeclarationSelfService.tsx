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

export default function TaxDeclarationSelfService() {
  const userId = useAppSelector((state) => state.user.userData?.userId);
  const [financialYear, setFinancialYear] = useState(currentFinancialYear);
  const [declaration, setDeclaration] = useState<SubmitTaxDeclarationPayload>(() => emptyDeclaration(currentFinancialYear()));
  const [record, setRecord] = useState<EmployeeTaxDeclarationModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revisionMode, setRevisionMode] = useState(false);
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

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || saving || isLocked) return;
    if (numberFields.some(({ key }) => Number(declaration[key]) < 0)) {
      toast.error("Amounts cannot be negative.");
      return;
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
          {record?.rejectionReason && <Alert severity="warning">Returned for changes: {record.rejectionReason}</Alert>}
          {record?.reviewRemarks && <Alert severity="info">Reviewer note: {record.reviewRemarks}</Alert>}

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
              <TextField fullWidth label="Landlord PAN (if applicable)" value={declaration.landlordPan ?? ""} onChange={(event) => setDeclaration((current) => ({ ...current, landlordPan: event.target.value }))} disabled={Boolean(isLocked) || loading} inputProps={{ maxLength: 10 }} />
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
