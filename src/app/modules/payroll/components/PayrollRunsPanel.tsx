import {
  Alert, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography, FormControlLabel, Switch,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import {
  approvePayrollRun, calculatePayrollRun, createPayrollAdjustment, createPaymentBatch, createPayrollRun,
  getPayrollRegister, getPayrollRegisterCsv, getPayrollReportSummary, getPaymentBatch, getPayrollRuns, reconcilePaymentBatch, recordPayrollRunReview,
  submitPaymentBatch, getPayrollPolicies, savePayrollPolicy, submitPayrollPolicy, approvePayrollPolicy, getPayrollStatutoryRegister, getPayrollStatutoryRegisterCsv, type PayrollPaymentBatchModel,
} from "../services";
import { PayrollPolicyProfileModel, PayrollRegisterRowModel, PayrollReportQuery, PayrollReportSummaryModel, PayrollRunModel, PayrollStatutoryRegisterRowModel } from "../models";

const monthStart = () => { const date = new Date(); date.setDate(1); return date.toISOString().slice(0, 10); };
const monthEnd = () => { const date = new Date(); date.setMonth(date.getMonth() + 1, 0); return date.toISOString().slice(0, 10); };
const emptyPolicy = (): PayrollPolicyProfileModel => ({ name: "Standard statutory profile", version: 1, divisorPolicy: "CALENDAR_DAYS", requireAttendanceLock: true, epfMode: "CAPPED_CEILING", epfWageCeiling: 15000, esicMode: "STATUTORY", esicWageCeiling: 21000, tdsMode: "AUTO_NEW_REGIME", statutoryJurisdiction: "", financialYear: "", statutoryRuleVersion: "", effectiveFrom: monthStart(), isActive: true });

export function PayrollRunsPanel() {
  const [runs, setRuns] = useState<PayrollRunModel[]>([]);
  const [batches, setBatches] = useState<Record<string, PayrollPaymentBatchModel | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState(monthStart);
  const [periodEnd, setPeriodEnd] = useState(monthEnd);
  const [payDate, setPayDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [runType, setRunType] = useState("REGULAR");
  const [populationType, setPopulationType] = useState("ALL_ELIGIBLE");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [reportFrom, setReportFrom] = useState(monthStart);
  const [reportTo, setReportTo] = useState(monthEnd);
  const [reportStatus, setReportStatus] = useState("");
  const [reportRunType, setReportRunType] = useState("");
  const [reportLineStatus, setReportLineStatus] = useState("");
  const [reportEmployeeId, setReportEmployeeId] = useState("");
  const [reportSummary, setReportSummary] = useState<PayrollReportSummaryModel | null>(null);
  const [reportRows, setReportRows] = useState<PayrollRegisterRowModel[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [statutoryRows, setStatutoryRows] = useState<PayrollStatutoryRegisterRowModel[]>([]);
  const [policyProfiles, setPolicyProfiles] = useState<PayrollPolicyProfileModel[]>([]);
  const [policyForm, setPolicyForm] = useState<PayrollPolicyProfileModel>(emptyPolicy);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policySaving, setPolicySaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getPayrollRuns();
      const next = Array.isArray(data) ? data : [];
      setRuns(next);
      const entries = await Promise.all(next.filter((run) => ["PROCESSED", "PAID", "CLOSED"].includes(run.status)).map(async (run) => {
        try { const { data: batch } = await getPaymentBatch(run.id); return [run.id, batch] as const; }
        catch { return [run.id, undefined] as const; }
      }));
      setBatches(Object.fromEntries(entries));
    } catch { setError("Payroll runs could not be loaded."); }
    finally { setLoading(false); }
  };

  const reportQuery = (): PayrollReportQuery => ({
    from: reportFrom || undefined, to: reportTo || undefined, status: reportStatus || undefined,
    runType: reportRunType || undefined, lineStatus: reportLineStatus || undefined,
    employeeId: reportEmployeeId.trim() || undefined,
  });

  const loadReport = async () => {
    setReportLoading(true);
    try {
      const query = reportQuery();
      const [{ data: summaryData }, { data: registerData }] = await Promise.all([
        getPayrollReportSummary(query), getPayrollRegister(query),
      ]);
      if (!summaryData.success || !registerData.success) throw new Error("Payroll report could not be loaded.");
      setReportSummary(summaryData.methodResult);
      setReportRows(registerData.methodResult || []);
      const { data: statutoryData } = await getPayrollStatutoryRegister(query);
      if (!statutoryData.success) throw new Error("Statutory report could not be loaded.");
      setStatutoryRows(statutoryData.methodResult || []);
    } catch { setError("Payroll report could not be loaded. Check the selected filters and permissions."); }
    finally { setReportLoading(false); }
  };

  const loadPolicies = async () => {
    setPolicyLoading(true);
    try { const { data } = await getPayrollPolicies(); setPolicyProfiles(Array.isArray(data) ? data : []); }
    catch { setError("Payroll statutory profiles could not be loaded."); }
    finally { setPolicyLoading(false); }
  };

  const changePolicyApproval = async (profile: PayrollPolicyProfileModel, action: "submit" | "approve") => {
    if (!profile.id) return;
    setPolicySaving(true); setError("");
    try {
      const response = action === "submit" ? await submitPayrollPolicy(profile.id, profile.version) : await approvePayrollPolicy(profile.id, profile.version);
      if (!response.data.success) throw new Error(response.data.message || "Policy approval failed.");
      await loadPolicies();
    } catch { setError("Policy approval action could not be completed. Check permission and policy version."); }
    finally { setPolicySaving(false); }
  };

  const savePolicy = async (event: FormEvent) => {
    event.preventDefault(); setPolicySaving(true); setError("");
    try {
      const { data } = await savePayrollPolicy(policyForm);
      if (!data.success) throw new Error(data.message || "Policy profile could not be saved.");
      setPolicyForm(emptyPolicy()); await loadPolicies();
    } catch { setError("Policy profile could not be saved. Check effective dates, access, and overlapping active profiles."); }
    finally { setPolicySaving(false); }
  };

  const downloadStatutoryReport = async () => {
    setBusy("statutory-export"); setError("");
    try {
      const response = await getPayrollStatutoryRegisterCsv(reportQuery());
      const url = URL.createObjectURL(response.data); const link = document.createElement("a");
      link.href = url; link.download = "payroll-statutory-register.csv"; link.click(); URL.revokeObjectURL(url);
    } catch { setError("Statutory CSV export could not be downloaded."); }
    finally { setBusy(""); }
  };
  const downloadReport = async () => {
    setBusy("report-export"); setError("");
    try {
      const response = await getPayrollRegisterCsv(reportQuery());
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a"); link.href = url; link.download = "payroll-register.csv"; link.click();
      URL.revokeObjectURL(url);
    } catch { setError("Payroll CSV export could not be downloaded."); }
    finally { setBusy(""); }
  };

  useEffect(() => { void load(); void loadReport(); void loadPolicies(); }, []);

  const act = async (id: string, fn: () => Promise<unknown>, message: string) => {
    setBusy(id); setError("");
    try { await fn(); await load(); }
    catch { setError(message); }
    finally { setBusy(""); }
  };

  const createRun = async (event: FormEvent) => {
    event.preventDefault();
    if (!periodStart || !periodEnd || !payDate) return;
    await act("create", async () => {
      const result = await createPayrollRun({
        periodStart: periodStart + "T00:00:00",
        periodEnd: periodEnd + "T00:00:00",
        payDate: payDate + "T00:00:00",
        runType, populationType, idempotencyKey: idempotencyKey.trim() || undefined,
      });
      if (!result.data.success) throw new Error(result.data.message || "Payroll run creation failed.");
      setCreateOpen(false); setIdempotencyKey("");
    }, "Payroll run could not be created. Check the period, permissions, and duplicate-run warning.");
  };

  const calculate = (id: string) => act(id, async () => {
    const { data } = await calculatePayrollRun(id);
    if (!data.success) throw new Error(data.message || "Payroll calculation failed.");
  }, "Payroll calculation failed. Resolve missing payroll rows or invalid component formulas.");
  const review = (id: string) => act(id, () => recordPayrollRunReview(id, "Reviewed from payroll management"), "Payroll run review failed. Resolve blocked rows first.");
  const approve = (id: string) => act(id, () => approvePayrollRun(id), "Payroll run approval failed. Review the run before approving.");
  const payment = (id: string) => act(id, () => createPaymentBatch(id), "Payment batch could not be created. The run must be processed first.");
  const submit = (batch: PayrollPaymentBatchModel) => { const reference = window.prompt("Bank/provider payment reference"); if (reference) void act(batch.id, () => submitPaymentBatch(batch.id, reference), "Payment batch submission failed."); };
  const reconcile = (batch: PayrollPaymentBatchModel) => { const note = window.prompt("Reconciliation note") || "Reconciled from payroll management"; void act(batch.id, () => reconcilePaymentBatch(batch.id, note), "Payment reconciliation failed."); };
  const adjustment = async (run: PayrollRunModel) => {
    const employeeId = window.prompt("Employee ID for adjustment");
    const amount = Number(window.prompt("Adjustment amount"));
    const reason = window.prompt("Reason");
    if (!employeeId || !reason || !Number.isFinite(amount) || amount === 0) return;
    await act(run.id, () => createPayrollAdjustment({ originalPayrollRunId: run.id, employeeId, type: amount > 0 ? "ARREARS" : "CORRECTION", amount, reason }), "Adjustment could not be created.");
  };

  return (
    <Stack spacing={1.25} sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1}>
        <Stack><Typography variant="h6">Payroll runs</Typography><Typography variant="body2" color="text.secondary">Tenant-scoped batches and immutable input snapshots</Typography></Stack>
        <Button variant="contained" onClick={() => setCreateOpen(true)} disabled={busy === "create"}>Create payroll run</Button>
      </Stack>
      {loading && <CircularProgress size={22} aria-label="Loading payroll runs" />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && runs.length === 0 && <Typography color="text.secondary">No payroll runs have been created.</Typography>}
      {!loading && !error && runs.length > 0 && (
        <Table size="small" aria-label="Payroll runs"><TableHead><TableRow>
          <TableCell>Period</TableCell><TableCell>Type</TableCell><TableCell>Population</TableCell><TableCell>Employees</TableCell><TableCell>Net pay</TableCell><TableCell>Status</TableCell><TableCell>Payment</TableCell><TableCell>Actions</TableCell>
        </TableRow></TableHead><TableBody>
          {runs.slice(0, 10).map((run) => { const batch = batches[run.id]; return <TableRow key={run.id}>
            <TableCell>{run.periodStart.slice(0, 7)}</TableCell><TableCell>{run.runType}</TableCell><TableCell>{run.populationType}</TableCell><TableCell>{run.employeeCount}</TableCell><TableCell>{run.netTotal.toLocaleString()}</TableCell><TableCell><Chip size="small" label={run.status} /></TableCell>
            <TableCell>{batch ? <Chip size="small" color={batch.status === "RECONCILED" ? "success" : "default"} label={batch.status} /> : run.status === "PROCESSED" ? <Button size="small" onClick={() => void payment(run.id)}>Create</Button> : "—"}</TableCell>
            <TableCell><Stack direction="row" spacing={0.5} flexWrap="wrap">
              {run.status === "DRAFT" && <Button size="small" disabled={busy === run.id} onClick={() => void calculate(run.id)}>Calculate preview</Button>}
              {run.status === "CALCULATED" && <Button size="small" disabled={busy === run.id} onClick={() => void review(run.id)}>Review</Button>}
              {run.status === "REVIEWED" && <Button size="small" disabled={busy === run.id} onClick={() => void approve(run.id)}>Approve</Button>}
              {batch?.status === "DRAFT" && <Button size="small" disabled={busy === batch.id} onClick={() => submit(batch)}>Submit</Button>}
              {batch?.status === "SUBMITTED" && <Button size="small" disabled={busy === batch.id} onClick={() => reconcile(batch)}>Reconcile</Button>}
              {(run.status === "PAID" || run.status === "CLOSED") && <Button size="small" disabled={busy === run.id} onClick={() => void adjustment(run)}>Adjustment</Button>}
            </Stack></TableCell>
          </TableRow>; })}
        </TableBody></Table>
      )}
      <form onSubmit={savePolicy}><Stack spacing={1.25} sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
        <Stack><Typography variant="subtitle1">Statutory policy profiles</Typography><Typography variant="body2" color="text.secondary">Effective dated settings are resolved from assignments or pay groups and captured with payroll.</Typography></Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField label="Profile name" value={policyForm.name} onChange={(event) => setPolicyForm({ ...policyForm, name: event.target.value })} size="small" fullWidth />
          <TextField select label="Divisor" value={policyForm.divisorPolicy} onChange={(event) => setPolicyForm({ ...policyForm, divisorPolicy: event.target.value as PayrollPolicyProfileModel["divisorPolicy"] })} size="small" fullWidth><MenuItem value="CALENDAR_DAYS">Calendar days</MenuItem><MenuItem value="WORKING_DAYS">Working days</MenuItem><MenuItem value="FIXED_30_DAYS">Fixed 30 days</MenuItem></TextField>
          <TextField select label="EPF mode" value={policyForm.epfMode} onChange={(event) => setPolicyForm({ ...policyForm, epfMode: event.target.value as PayrollPolicyProfileModel["epfMode"] })} size="small" fullWidth><MenuItem value="CAPPED_CEILING">Capped ceiling</MenuItem><MenuItem value="ACTUAL_BASIC_12">12% actual basic</MenuItem><MenuItem value="EXEMPT">Exempt</MenuItem></TextField>
          <TextField label="EPF ceiling" type="number" value={policyForm.epfWageCeiling} onChange={(event) => setPolicyForm({ ...policyForm, epfWageCeiling: Number(event.target.value) })} size="small" fullWidth />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField label="Jurisdiction" value={policyForm.statutoryJurisdiction} onChange={(event) => setPolicyForm({ ...policyForm, statutoryJurisdiction: event.target.value })} size="small" fullWidth required={policyForm.epfMode !== "EXEMPT" || policyForm.esicMode !== "EXEMPT"} />
          <TextField label="Financial year" placeholder="2026-27" value={policyForm.financialYear} onChange={(event) => setPolicyForm({ ...policyForm, financialYear: event.target.value })} size="small" fullWidth required={policyForm.epfMode !== "EXEMPT" || policyForm.esicMode !== "EXEMPT"} />
          <TextField label="Rule version" value={policyForm.statutoryRuleVersion} onChange={(event) => setPolicyForm({ ...policyForm, statutoryRuleVersion: event.target.value })} size="small" fullWidth required={policyForm.epfMode !== "EXEMPT" || policyForm.esicMode !== "EXEMPT"} />
          <TextField select label="ESIC mode" value={policyForm.esicMode} onChange={(event) => setPolicyForm({ ...policyForm, esicMode: event.target.value as PayrollPolicyProfileModel["esicMode"] })} size="small" fullWidth><MenuItem value="STATUTORY">Statutory</MenuItem><MenuItem value="EXEMPT">Exempt</MenuItem></TextField>
          <TextField label="ESIC ceiling" type="number" value={policyForm.esicWageCeiling} onChange={(event) => setPolicyForm({ ...policyForm, esicWageCeiling: Number(event.target.value) })} size="small" fullWidth />
          <TextField select label="TDS mode" value={policyForm.tdsMode} onChange={(event) => setPolicyForm({ ...policyForm, tdsMode: event.target.value as PayrollPolicyProfileModel["tdsMode"] })} size="small" fullWidth><MenuItem value="AUTO_NEW_REGIME">New regime</MenuItem><MenuItem value="AUTO_OLD_REGIME">Old regime</MenuItem><MenuItem value="MANUAL_ONLY">Manual</MenuItem></TextField>
          <TextField label="Effective from" type="date" value={policyForm.effectiveFrom.slice(0, 10)} onChange={(event) => setPolicyForm({ ...policyForm, effectiveFrom: event.target.value })} InputLabelProps={{ shrink: true }} size="small" fullWidth />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
          <FormControlLabel control={<Switch checked={policyForm.requireAttendanceLock} onChange={(event) => setPolicyForm({ ...policyForm, requireAttendanceLock: event.target.checked })} />} label="Require locked attendance" />
          <Button type="submit" variant="contained" disabled={policySaving}>{policySaving ? "Saving…" : "Save profile"}</Button>
        </Stack>
        {policyLoading && <CircularProgress size={18} aria-label="Loading statutory profiles" />}
        {policyProfiles.map((profile) => <Stack key={profile.id} direction="row" spacing={0.5} alignItems="center" flexWrap="wrap"><Chip variant="outlined" label={`${profile.name} · v${profile.version} · ${profile.approvalStatus || "APPROVED"} · ${profile.epfMode} / ${profile.esicMode} / ${profile.tdsMode} · from ${profile.effectiveFrom.slice(0, 10)}`} />{profile.approvalStatus === "DRAFT" && <Button size="small" onClick={() => void changePolicyApproval(profile, "submit")} disabled={policySaving}>Submit</Button>}{profile.approvalStatus === "SUBMITTED" && <Button size="small" color="success" onClick={() => void changePolicyApproval(profile, "approve")} disabled={policySaving}>Approve</Button>}</Stack>)}
      </Stack></form>
      <Stack spacing={1} sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1}>
          <Stack><Typography variant="subtitle1">Payroll reports</Typography><Typography variant="body2" color="text.secondary">Register and gross-to-net totals from immutable payroll runs</Typography></Stack>
          <Stack direction="row" spacing={1}><Button size="small" onClick={() => void loadReport()} disabled={reportLoading}>Refresh report</Button><Button size="small" variant="outlined" onClick={() => void downloadReport()} disabled={busy === "report-export"}>Export CSV</Button></Stack>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField label="From" type="date" value={reportFrom} onChange={(event) => setReportFrom(event.target.value)} InputLabelProps={{ shrink: true }} size="small" fullWidth />
          <TextField label="To" type="date" value={reportTo} onChange={(event) => setReportTo(event.target.value)} InputLabelProps={{ shrink: true }} size="small" fullWidth />
          <TextField select label="Run status" value={reportStatus} onChange={(event) => setReportStatus(event.target.value)} size="small" fullWidth><MenuItem value="">All statuses</MenuItem><MenuItem value="CALCULATED">Calculated</MenuItem><MenuItem value="PROCESSED">Processed</MenuItem><MenuItem value="PAID">Paid</MenuItem><MenuItem value="CLOSED">Closed</MenuItem><MenuItem value="BLOCKED">Blocked</MenuItem></TextField>
          <TextField select label="Line status" value={reportLineStatus} onChange={(event) => setReportLineStatus(event.target.value)} size="small" fullWidth><MenuItem value="">All lines</MenuItem><MenuItem value="CALCULATED">Calculated</MenuItem><MenuItem value="BLOCKED">Blocked</MenuItem><MenuItem value="SKIPPED">Skipped</MenuItem></TextField>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField select label="Run type" value={reportRunType} onChange={(event) => setReportRunType(event.target.value)} size="small" fullWidth><MenuItem value="">All run types</MenuItem><MenuItem value="REGULAR">Regular</MenuItem><MenuItem value="OFF_CYCLE">Off-cycle</MenuItem><MenuItem value="SUPPLEMENTAL">Supplemental</MenuItem><MenuItem value="CORRECTION">Correction</MenuItem></TextField>
          <TextField label="Employee ID" value={reportEmployeeId} onChange={(event) => setReportEmployeeId(event.target.value)} size="small" fullWidth />
        </Stack>
        {reportLoading && <CircularProgress size={20} aria-label="Loading payroll report" />}
        {reportSummary && <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap"><Chip label={`${reportSummary.runCount} runs`} /><Chip label={`${reportSummary.employeeCount} employees`} /><Chip label={`Gross ${reportSummary.grossTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} /><Chip label={`Deductions ${reportSummary.deductionTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} /><Chip color="success" label={`Net ${reportSummary.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} /></Stack>}
        <Table size="small" aria-label="Payroll register"><TableHead><TableRow><TableCell>Period</TableCell><TableCell>Employee</TableCell><TableCell>Run</TableCell><TableCell>Status</TableCell><TableCell align="right">Gross</TableCell><TableCell align="right">Deductions</TableCell><TableCell align="right">Net</TableCell></TableRow></TableHead><TableBody>
          {reportRows.slice(0, 50).map((row) => <TableRow key={`${row.runId}-${row.employeeId}`}><TableCell>{row.periodStart.slice(0, 7)}</TableCell><TableCell>{row.employeeId}</TableCell><TableCell>{row.runType}</TableCell><TableCell><Chip size="small" label={row.lineStatus} color={row.lineStatus === "BLOCKED" ? "error" : "default"} /></TableCell><TableCell align="right">{row.grossAmount.toLocaleString()}</TableCell><TableCell align="right">{row.deductionAmount.toLocaleString()}</TableCell><TableCell align="right">{row.netAmount.toLocaleString()}</TableCell></TableRow>)}
          {!reportLoading && reportRows.length === 0 && <TableRow><TableCell colSpan={7}><Typography color="text.secondary">No register rows match the selected filters.</Typography></TableCell></TableRow>}
        </TableBody></Table>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" spacing={1} sx={{ pt: 1 }}>
          <Typography variant="subtitle2">Statutory register · immutable run snapshots</Typography>
          <Button size="small" variant="outlined" onClick={() => void downloadStatutoryReport()} disabled={busy === "statutory-export"}>Export statutory CSV</Button>
        </Stack>
        <Table size="small" aria-label="Payroll statutory register"><TableHead><TableRow><TableCell>Period</TableCell><TableCell>Employee</TableCell><TableCell>Profile</TableCell><TableCell align="right">Employee EPF</TableCell><TableCell align="right">Employer EPF</TableCell><TableCell align="right">Employee ESIC</TableCell><TableCell align="right">Employer ESIC</TableCell><TableCell align="right">TDS</TableCell><TableCell align="right">Professional tax</TableCell></TableRow></TableHead><TableBody>
          {statutoryRows.slice(0, 50).map((row) => <TableRow key={`statutory-${row.runId}-${row.employeeId}`}><TableCell>{row.periodStart.slice(0, 7)}</TableCell><TableCell>{row.employeeId}</TableCell><TableCell>{row.policyProfileId ? `${row.policyProfileId} v${row.policyProfileVersion}` : "Legacy/default"}</TableCell><TableCell align="right">{row.employeeEpf.toLocaleString()}</TableCell><TableCell align="right">{row.employerEpf.toLocaleString()}</TableCell><TableCell align="right">{row.employeeEsic.toLocaleString()}</TableCell><TableCell align="right">{row.employerEsic.toLocaleString()}</TableCell><TableCell align="right">{row.incomeTax.toLocaleString()}</TableCell><TableCell align="right">{row.professionalTax.toLocaleString()}</TableCell></TableRow>)}
          {!statutoryRows.length && <TableRow><TableCell colSpan={9}><Typography color="text.secondary">No statutory snapshots match these filters.</Typography></TableCell></TableRow>}
        </TableBody></Table>      </Stack>      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={createRun}><DialogTitle>Create payroll run</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">The server resolves the tenant&apos;s effective assignment, pay group, policy, and salary components and snapshots them at creation.</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField label="Period start" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} InputLabelProps={{ shrink: true }} fullWidth required />
            <TextField label="Period end" type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} InputLabelProps={{ shrink: true }} fullWidth required />
          </Stack>
          <TextField label="Pay date" type="date" value={payDate} onChange={(event) => setPayDate(event.target.value)} InputLabelProps={{ shrink: true }} fullWidth required />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField select label="Run type" value={runType} onChange={(event) => setRunType(event.target.value)} fullWidth><MenuItem value="REGULAR">Regular</MenuItem><MenuItem value="OFF_CYCLE">Off-cycle</MenuItem><MenuItem value="SUPPLEMENTAL">Supplemental</MenuItem><MenuItem value="CORRECTION">Correction</MenuItem></TextField>
            <TextField select label="Population" value={populationType} onChange={(event) => setPopulationType(event.target.value)} fullWidth><MenuItem value="ALL_ELIGIBLE">All eligible</MenuItem><MenuItem value="SELECTED">Selected employees</MenuItem></TextField>
          </Stack>
          <TextField label="Idempotency key (optional)" value={idempotencyKey} onChange={(event) => setIdempotencyKey(event.target.value)} helperText="Reuse the key safely if the request must be retried." fullWidth />
        </Stack></DialogContent><DialogActions><Button onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" variant="contained" disabled={busy === "create"}>Create run</Button></DialogActions></form>
      </Dialog>
    </Stack>
  );
}






