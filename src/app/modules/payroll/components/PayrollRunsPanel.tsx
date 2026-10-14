import {
  Alert, Autocomplete, Box, Button, Card, CardContent, Checkbox, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tab, TablePagination, Tabs, TextField, Typography,
} from "@mui/material";
import dayjs from "dayjs";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  approvePayrollRun, calculatePayrollRun, cancelPayrollRun, createPayrollAdjustment, createPaymentBatch, createPayrollRun,
  getPayrollRegister, getPayrollRegisterCsv, getPayrollReportSummary, getPaymentBatch, getPayrollRuns,
  getPayrollAdjustments, getPayrollAdjustmentComponents, getPayrollRunEmployees, getPayrollRunReview, processPayrollRun, reconcilePaymentBatch, recordPayrollRunReview, approvePayrollAdjustment, rejectPayrollAdjustment,
  submitPaymentBatch, getPayrollStatutoryRegister, getPayrollStatutoryRegisterCsv, type PayrollPaymentBatchModel,
} from "../services";
import { PayrollAdjustmentComponentModel, PayrollAdjustmentModel, PayrollRegisterRowModel, PayrollReportQuery, PayrollReportSummaryModel, PayrollRunEmployeeModel, PayrollRunModel, PayrollRunReviewModel, PayrollStatutoryRegisterRowModel } from "../models";
import { getAllEmployees } from "../../employees/employeeServices";
import type { GetAllEmployeeResponseModel } from "../../employees/models";
import { formatServerDate } from "../../../../utils/common";
import { currentMonthEndInputValue, currentMonthStartInputValue, nextLocalDateInputValue } from "./payrollDateInputs";

const readableCode = (value: string) => value.replace(/_/g, " ");

type PayrollRunsPanelProps = { canEdit: boolean; canApprove: boolean; canCreate: boolean; canSelectEmployees: boolean };

export function PayrollRunsPanel({ canEdit, canApprove, canCreate, canSelectEmployees }: PayrollRunsPanelProps) {
  const [runs, setRuns] = useState<PayrollRunModel[]>([]);
  const [batches, setBatches] = useState<Record<string, PayrollPaymentBatchModel | undefined>>({});
  const [reviews, setReviews] = useState<Record<string, PayrollRunReviewModel | undefined>>({});
  const [adjustments, setAdjustments] = useState<PayrollAdjustmentModel[]>([]);
  const [adjustmentsPage, setAdjustmentsPage] = useState(0);
  const [adjustmentsRowsPerPage, setAdjustmentsRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [runToCancel, setRunToCancel] = useState<PayrollRunModel | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [periodStart, setPeriodStart] = useState(currentMonthStartInputValue);
  const [periodEnd, setPeriodEnd] = useState(currentMonthEndInputValue);
  const [payDate, setPayDate] = useState(nextLocalDateInputValue);
  const [runType, setRunType] = useState("REGULAR");
  const [populationType, setPopulationType] = useState("ALL_ELIGIBLE");
  const [availableEmployees, setAvailableEmployees] = useState<GetAllEmployeeResponseModel[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<GetAllEmployeeResponseModel[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeOptionsLoading, setEmployeeOptionsLoading] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [reportFrom, setReportFrom] = useState(currentMonthStartInputValue);
  const [reportTo, setReportTo] = useState(currentMonthEndInputValue);
  const [reportStatus, setReportStatus] = useState("");
  const [reportRunType, setReportRunType] = useState("");
  const [reportLineStatus, setReportLineStatus] = useState("");
  const [reportEmployeeId, setReportEmployeeId] = useState("");
  const [reportSummary, setReportSummary] = useState<PayrollReportSummaryModel | null>(null);
  const [reportRows, setReportRows] = useState<PayrollRegisterRowModel[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [statutoryRows, setStatutoryRows] = useState<PayrollStatutoryRegisterRowModel[]>([]);
  const [batchToSubmit, setBatchToSubmit] = useState<PayrollPaymentBatchModel | null>(null);
  const [batchToReconcile, setBatchToReconcile] = useState<PayrollPaymentBatchModel | null>(null);
  const [adjustmentRun, setAdjustmentRun] = useState<PayrollRunModel | null>(null);
  const [adjustmentToReject, setAdjustmentToReject] = useState<PayrollAdjustmentModel | null>(null);
  const [adjustmentRejectionReason, setAdjustmentRejectionReason] = useState("");
  const [adjustmentEmployees, setAdjustmentEmployees] = useState<PayrollRunEmployeeModel[]>([]);
  const [issueRows, setIssueRows] = useState<PayrollRunEmployeeModel[]>([]);
  const [issuesRun, setIssuesRun] = useState<PayrollRunModel | null>(null);
  const [adjustmentEmployeesLoading, setAdjustmentEmployeesLoading] = useState(false);
  const [adjustmentComponents, setAdjustmentComponents] = useState<PayrollAdjustmentComponentModel[]>([]);
  const [adjustmentComponentsLoading, setAdjustmentComponentsLoading] = useState(false);
  const [providerReference, setProviderReference] = useState("");
  const [reconciliationNote, setReconciliationNote] = useState("");
  const [reconciliationConfirmed, setReconciliationConfirmed] = useState(false);
  const [adjustmentEmployeeId, setAdjustmentEmployeeId] = useState("");
  const [adjustmentComponentCode, setAdjustmentComponentCode] = useState("");
  const [adjustmentTargetPeriod, setAdjustmentTargetPeriod] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"ARREARS" | "CORRECTION" | "REVERSAL">("ARREARS");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const adjustmentComponentRequest = useRef(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getPayrollRuns();
      const next = Array.isArray(data) ? data : [];
      setRuns(next);
      try {
        const { data: adjustmentData } = await getPayrollAdjustments();
        if (adjustmentData?.success) {
          setAdjustments(adjustmentData.methodResult ?? []);
          setAdjustmentsPage(0);
        }
      } catch {
        // Adjustments failure does not prevent payroll runs from displaying
      }
      const paymentRuns = next.filter((run) => ["PROCESSED", "PAID", "CLOSED"].includes(run.status));
      const reviewRuns = next.filter((run) => ["CALCULATED", "BLOCKED"].includes(run.status));
      const [entries, reviewEntries] = await Promise.all([Promise.all(paymentRuns.map(async (run) => {
        try { const { data: batch } = await getPaymentBatch(run.id); return [run.id, batch] as const; }
        catch { return [run.id, undefined] as const; }
      })), Promise.all(reviewRuns.map(async (run) => {
        try { const { data: review } = await getPayrollRunReview(run.id); return [run.id, review.methodResult] as const; }
        catch { return [run.id, undefined] as const; }
      }))]);
      setBatches(Object.fromEntries(entries));
      setReviews(Object.fromEntries(reviewEntries));
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

  const initialLoadReport = useRef(loadReport);
  useEffect(() => { void load(); void initialLoadReport.current(); }, []);

  useEffect(() => {
    if (!createOpen || populationType !== "SELECTED" || !canSelectEmployees) return;
    let current = true;
    const timer = window.setTimeout(() => {
      setEmployeeOptionsLoading(true);
      void getAllEmployees({
        pageNo: 1, records: 100, name: employeeSearch.trim(), departmentId: [], gender: [], employmentStatus: "All",
      }).then(({ data }) => {
        if (current) setAvailableEmployees(data.success ? data.methodResults ?? [] : []);
      }).catch(() => {
        if (current) setAvailableEmployees([]);
      }).finally(() => {
        if (current) setEmployeeOptionsLoading(false);
      });
    }, 250);
    return () => { current = false; window.clearTimeout(timer); };
  }, [createOpen, populationType, canSelectEmployees, employeeSearch]);

  const act = async (id: string, fn: () => Promise<unknown>, message: string): Promise<boolean> => {
    setBusy(id); setError("");
    try {
      const result = await fn() as { data?: { success?: boolean; message?: string }; success?: boolean; message?: string };
      const response = result?.data ?? result;
      if (response?.success === false) throw new Error(response.message || message);
      await load(); return true;
    }
    catch (err: any) {
      const serverMessage = err?.response?.data?.message || err?.message;
      setError(serverMessage || message);
      return false;
    }
    finally { setBusy(""); }
  };

  const createRun = async (event: FormEvent) => {
    event.preventDefault();
    if (!periodStart || !periodEnd || !payDate) return;
    if (populationType === "SELECTED" && (!canSelectEmployees || selectedEmployees.length === 0)) return;
    await act("create", async () => {
      const result = await createPayrollRun({
        periodStart: periodStart + "T00:00:00",
        periodEnd: periodEnd + "T00:00:00",
        payDate: payDate + "T00:00:00",
        runType, populationType, employeeIds: populationType === "SELECTED" ? selectedEmployees.map((employee) => employee.employeeId) : undefined,
        idempotencyKey: idempotencyKey.trim() || undefined,
      });
      if (!result.data.success) throw new Error(result.data.message || "Payroll run creation failed.");
      setCreateOpen(false); setIdempotencyKey(""); setSelectedEmployees([]); setEmployeeSearch("");
    }, "Payroll run could not be created. Check the period, permissions, and duplicate-run warning.");
  };

  const inspectRunIssues = async (run: PayrollRunModel) => {
    setBusy(`issues-${run.id}`);
    try {
      const { data } = await getPayrollRunEmployees(run.id);
      if (!data.success) throw new Error(data.message || "Payroll run issues could not be loaded.");
      const rows = data.methodResult ?? [];
      setIssueRows(rows.filter((row) => row.status === "BLOCKED" || row.status === "SKIPPED" || Boolean(row.errorMessage || row.exclusionReason)));
      setIssuesRun(run);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Payroll run issues could not be loaded.");
    } finally {
      setBusy("");
    }
  };

  const cancelRunForm = async (event: FormEvent) => {
    event.preventDefault();
    const reason = cancelReason.trim();
    if (!runToCancel || reason.length < 5 || reason.length > 500) return;
    const succeeded = await act(runToCancel.id, () => cancelPayrollRun(runToCancel.id, reason), "Draft payroll run could not be cancelled. Reload and verify its status and permissions.");
    if (succeeded) {
      setRunToCancel(null);
      setCancelReason("");
      setIdempotencyKey("");
      if (canCreate) setCreateOpen(true);
    }
  };

  const calculate = (id: string) => act(id, async () => {
    const { data } = await calculatePayrollRun(id);
    if (!data.success) throw new Error(data.message || "Payroll calculation failed.");
  }, "Payroll calculation failed. Resolve missing payroll rows or invalid component formulas.");
  const review = (id: string) => act(id, () => recordPayrollRunReview(id, "Reviewed from payroll management"), "Payroll run review failed. Resolve blocked rows first.");
  const approve = (id: string) => act(id, () => approvePayrollRun(id), "Payroll run approval failed. Review the run before approving.");
  const process = (id: string) => act(id, () => processPayrollRun(id), "Payroll run could not be processed. Approve the reviewed run first.");
  const payment = (id: string) => act(id, () => createPaymentBatch(id), "Payment batch could not be created. The run must be processed first.");
  const approveAdjustment = (adjustment: PayrollAdjustmentModel) => act(adjustment.id, () => approvePayrollAdjustment(adjustment.id), "Adjustment approval failed. Reload the queue and verify the adjustment is still a draft.");
  const rejectAdjustmentForm = async (event: FormEvent) => {
    event.preventDefault();
    const reason = adjustmentRejectionReason.trim();
    if (!adjustmentToReject || reason.length < 5 || reason.length > 500) return;
    const succeeded = await act(adjustmentToReject.id, () => rejectPayrollAdjustment(adjustmentToReject.id, reason), "Adjustment rejection failed. Refresh the queue and verify the request is still a draft.");
    if (succeeded) { setAdjustmentToReject(null); setAdjustmentRejectionReason(""); }
  };
  const loadAdjustmentComponents = async (targetMonth: string) => {
    const requestId = ++adjustmentComponentRequest.current;
    if (!targetMonth) { setAdjustmentComponents([]); setAdjustmentComponentCode(""); setAdjustmentComponentsLoading(false); return; }
    setAdjustmentComponentsLoading(true);
    try {
      const { data } = await getPayrollAdjustmentComponents(`${targetMonth}-01`);
      if (!data.success) throw new Error(data.message || "Salary components could not be loaded for this month.");
      const components = data.methodResult ?? [];
      if (requestId !== adjustmentComponentRequest.current) return;
      setAdjustmentComponents(components);
      setAdjustmentComponentCode((current) => components.some((component) => component.code === current) ? current : "");
    } catch {
      if (requestId !== adjustmentComponentRequest.current) return;
      setAdjustmentComponents([]);
      setAdjustmentComponentCode("");
      setError("Effective salary components could not be loaded. Check Payroll view access and component configuration.");
    } finally { if (requestId === adjustmentComponentRequest.current) setAdjustmentComponentsLoading(false); }
  };
  const openAdjustment = async (run: PayrollRunModel) => {
    const requestId = ++adjustmentComponentRequest.current;
    const targetMonth = run.periodStart.slice(0, 7);
    setAdjustmentRun(run); setAdjustmentEmployees([]); setAdjustmentEmployeeId(""); setAdjustmentComponentCode("");
    setAdjustmentTargetPeriod(targetMonth); setAdjustmentAmount(""); setAdjustmentReason(""); setAdjustmentComponents([]);
    setAdjustmentEmployeesLoading(true); setAdjustmentComponentsLoading(true);
    try {
      const [{ data }, { data: componentData }] = await Promise.all([
        getPayrollRunEmployees(run.id), getPayrollAdjustmentComponents(`${targetMonth}-01`),
      ]);
      if (requestId !== adjustmentComponentRequest.current) return;
      if (!data.success) throw new Error(data.message || "Unable to load employees from the original run.");
      if (!componentData.success) throw new Error(componentData.message || "Unable to load salary components for the target month.");
      setAdjustmentEmployees((data.methodResult ?? []).filter((employee) => employee.status === "CALCULATED"));
      setAdjustmentComponents(componentData.methodResult ?? []);
    } catch {
      if (requestId === adjustmentComponentRequest.current) setError("Employees or effective salary components could not be loaded for this adjustment.");
    } finally {
      if (requestId === adjustmentComponentRequest.current) { setAdjustmentEmployeesLoading(false); setAdjustmentComponentsLoading(false); }
    }
  };
  const submitBatchForm = async (event: FormEvent) => {
    event.preventDefault();
    if (!batchToSubmit || !providerReference.trim()) return;
    const succeeded = await act(batchToSubmit.id, () => submitPaymentBatch(batchToSubmit.id, providerReference.trim()), "Payment batch submission failed.");
    if (succeeded) { setBatchToSubmit(null); setProviderReference(""); }
  };
  const reconcileBatchForm = async (event: FormEvent) => {
    event.preventDefault();
    if (!batchToReconcile || !reconciliationNote.trim() || !reconciliationConfirmed) return;
    const succeeded = await act(batchToReconcile.id, () => reconcilePaymentBatch(batchToReconcile.id, reconciliationNote.trim(), reconciliationConfirmed), "Payment reconciliation failed.");
    if (succeeded) { setBatchToReconcile(null); setReconciliationNote(""); setReconciliationConfirmed(false); }
  };
  const createAdjustmentForm = async (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(adjustmentAmount);
    if (!adjustmentRun || !adjustmentEmployeeId || !adjustmentComponentCode || !adjustmentTargetPeriod || !adjustmentReason.trim() || !Number.isFinite(amount) || amount === 0) return;
    const succeeded = await act(adjustmentRun.id, () => createPayrollAdjustment({ originalPayrollRunId: adjustmentRun.id, employeeId: adjustmentEmployeeId, componentCode: adjustmentComponentCode, targetPeriod: `${adjustmentTargetPeriod}-01`, type: adjustmentType, amount, reason: adjustmentReason.trim() }), "Adjustment could not be created.");
    if (succeeded) { setAdjustmentRun(null); setAdjustmentEmployeeId(""); setAdjustmentComponentCode(""); setAdjustmentAmount(""); setAdjustmentReason(""); }
  };

  const renderRunActions = (run: PayrollRunModel, batch: PayrollPaymentBatchModel | undefined) => (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {canEdit && run.status === "DRAFT" && <Button size="small" disabled={busy === run.id} onClick={() => void calculate(run.id)}>Calculate preview</Button>}
      {canEdit && run.status === "BLOCKED" && <Button size="small" title="Retry using the saved payroll snapshot after resolving the source payroll data issue." disabled={busy === run.id} onClick={() => void calculate(run.id)}>Retry calculation</Button>}
      {(run.status === "BLOCKED" || run.blockedCount > 0 || run.skippedCount > 0) && <Button size="small" disabled={busy === `issues-${run.id}`} onClick={() => void inspectRunIssues(run)}>Review issues</Button>}
      {canEdit && (run.status === "DRAFT" || run.status === "BLOCKED") && <Button size="small" color="error" disabled={busy === run.id} onClick={() => { setCancelReason(""); setRunToCancel(run); }}>{canCreate ? "Cancel & recreate" : "Cancel draft"}</Button>}
      {canEdit && run.status === "CALCULATED" && reviews[run.id]?.canApprove && !reviews[run.id]?.isReviewed && <Button size="small" disabled={busy === run.id} onClick={() => void review(run.id)}>Record review</Button>}
      {canApprove && run.status === "CALCULATED" && reviews[run.id]?.canApprove && reviews[run.id]?.isReviewed && <Button size="small" disabled={busy === run.id} onClick={() => void approve(run.id)}>Approve</Button>}
      {(run.status === "CALCULATED" || run.status === "BLOCKED") && reviews[run.id] && !reviews[run.id]?.canApprove && <Chip size="small" color="warning" label={`Resolve ${reviews[run.id]?.blockedCount ?? 0} blocked / incomplete rows`} />}
      {canEdit && run.status === "APPROVED" && <Button size="small" disabled={busy === run.id} onClick={() => void process(run.id)}>Process</Button>}
      {canEdit && batch?.status === "DRAFT" && <Button size="small" disabled={busy === batch.id} onClick={() => { setProviderReference(""); setBatchToSubmit(batch); }}>Submit payment</Button>}
      {canEdit && (batch?.status === "SUBMITTED" || batch?.status === "RECONCILING") && <Button size="small" disabled={busy === batch.id} onClick={() => { setReconciliationNote(batch.reconciliationNote ?? ""); setReconciliationConfirmed(false); setBatchToReconcile(batch); }}>{batch.status === "RECONCILING" ? "Resume reconciliation" : "Reconcile payment"}</Button>}
      {canEdit && (run.status === "PAID" || run.status === "CLOSED") && <Button size="small" disabled={busy === run.id || adjustmentEmployeesLoading} onClick={() => void openAdjustment(run)}>Adjustment</Button>}
    </Stack>
  );

  const runOverview = [
    { label: "Runs in view", value: runs.length.toLocaleString(), detail: "All payroll cycles", color: "primary.main" },
    { label: "Calculated runs", value: runs.filter((run) => run.status === "CALCULATED").length.toLocaleString(), detail: "Review or approval stage", color: "warning.main" },
    { label: "Blocked runs", value: runs.filter((run) => run.status === "BLOCKED").length.toLocaleString(), detail: "Resolve input or calculation issues", color: "error.main" },
    { label: "Paid / closed net", value: runs.filter((run) => run.status === "PAID" || run.status === "CLOSED").reduce((total, run) => total + run.netTotal, 0).toLocaleString(undefined, { maximumFractionDigits: 0 }), detail: "Finalized runs · net total", color: "success.main" },
  ];

  return (
    <Stack spacing={1.25} sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1}>
        <Stack><Typography variant="h6">Payroll runs</Typography><Typography variant="body2" color="text.secondary">Tenant-scoped batches and immutable input snapshots</Typography></Stack>
        {canCreate && <Button variant="contained" onClick={() => setCreateOpen(true)} disabled={busy === "create"}>Create payroll run</Button>}
      </Stack>
      {loading && <CircularProgress size={22} aria-label="Loading payroll runs" />}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          action={
            runs.some((r) => r.status === "BLOCKED" || r.blockedCount > 0) ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  const blockedRun = runs.find((r) => r.status === "BLOCKED" || r.blockedCount > 0);
                  if (blockedRun) void inspectRunIssues(blockedRun);
                }}
              >
                Review issues
              </Button>
            ) : undefined
          }
        >
          {error}
        </Alert>
      )}
      <Tabs value={activeSection} onChange={(_, value: number) => setActiveSection(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Payroll workspace sections">
        <Tab label={`Payroll runs (${runs.length})`} id="payroll-tab-runs" aria-controls="payroll-panel-runs" />
        <Tab label={`Adjustments (${adjustments.length})`} id="payroll-tab-adjustments" aria-controls="payroll-panel-adjustments" />
        <Tab label="Reports & statutory" id="payroll-tab-reports" aria-controls="payroll-panel-reports" />
      </Tabs>
      <Stack role="tabpanel" id="payroll-panel-runs" aria-labelledby="payroll-tab-runs" hidden={activeSection !== 0} spacing={1.25}>
      {!loading && runs.length > 0 && <Stack aria-label="Payroll run overview" sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 1 }}>
        {runOverview.map((metric) => <Card key={metric.label} variant="outlined" sx={{ minWidth: 0, borderLeft: 3, borderLeftColor: metric.color, borderRadius: 1.5 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
            <Typography variant="h6" sx={{ fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{metric.value}</Typography>
            <Typography variant="caption" color="text.secondary">{metric.detail}</Typography>
          </CardContent>
        </Card>)}
      </Stack>}
      {!loading && runs.length === 0 && <Typography color="text.secondary">No payroll runs have been created.</Typography>}
      {!loading && runs.length > 0 && (
        <>
        <Stack spacing={1} sx={{ display: { xs: "flex", md: "none" } }} aria-label="Payroll runs, compact view">
          {runs.slice(0, 10).map((run) => {
            const batch = batches[run.id];
            return <Card key={run.id} variant="outlined"><CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2">{run.periodStart.slice(0, 7)} · {readableCode(run.runType)}</Typography>
                  <Chip size="small" label={run.status} color={run.status === "BLOCKED" ? "error" : run.status === "PAID" || run.status === "CLOSED" ? "success" : "default"} />
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography variant="body2" color="text.secondary">Employees</Typography><Typography variant="body2">{run.employeeCount} · {readableCode(run.populationType)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography variant="body2" color="text.secondary">Net pay</Typography><Typography variant="body2" fontWeight={700}>{run.netTotal.toLocaleString()}</Typography>
                </Stack>
                {batch && <Stack direction="row" justifyContent="space-between" spacing={1}><Typography variant="body2" color="text.secondary">Payment</Typography><Chip size="small" color={batch.status === "RECONCILED" ? "success" : "default"} label={batch.status} /></Stack>}
                {renderRunActions(run, batch)}
              </Stack>
            </CardContent></Card>;
          })}
        </Stack>
        <TableContainer sx={{ display: { xs: "none", md: "block" }, overflowX: "auto" }}>
        <Table size="small" aria-label="Payroll runs" sx={{ minWidth: 1000 }}><TableHead><TableRow>
          <TableCell>Period</TableCell><TableCell>Type</TableCell><TableCell>Population</TableCell><TableCell>Employees</TableCell><TableCell>Net pay</TableCell><TableCell>Status</TableCell><TableCell>Payment</TableCell><TableCell>Actions</TableCell>
        </TableRow></TableHead><TableBody>
          {runs.slice(0, 10).map((run) => { const batch = batches[run.id]; return <TableRow key={run.id}>
            <TableCell>{run.periodStart.slice(0, 7)}</TableCell><TableCell>{run.runType}</TableCell><TableCell>{run.populationType}</TableCell><TableCell>{run.employeeCount}</TableCell><TableCell>{run.netTotal.toLocaleString()}</TableCell><TableCell><Chip size="small" label={run.status} /></TableCell>
            <TableCell>{batch ? <Chip size="small" color={batch.status === "RECONCILED" ? "success" : "default"} label={batch.status} /> : run.status === "PROCESSED" && canEdit ? <Button size="small" disabled={busy === run.id} onClick={() => void payment(run.id)}>Create payment</Button> : "—"}</TableCell>
            <TableCell>{renderRunActions(run, batch)}</TableCell>
          </TableRow>; })}
        </TableBody></Table>
        </TableContainer>
        </>
      )}
      </Stack>
      <Stack role="tabpanel" id="payroll-panel-adjustments" aria-labelledby="payroll-tab-adjustments" hidden={activeSection !== 1} spacing={1}>
      <Stack spacing={1}>
        <Stack><Typography variant="subtitle1">Payroll adjustments</Typography><Typography variant="body2" color="text.secondary">Draft corrections remain separate from finalized payroll. Approvals are audited and tenant-scoped.</Typography></Stack>
        <Alert severity="warning" role="status">
          <Typography component="span" fontWeight={750}>Approval does not apply or pay an adjustment. </Typography>
          Approved requests are not added to gross-to-net, payslips, or payment totals. Processing stays unavailable until this tenant has an approved rule for the earning or deduction component and its tax/statutory treatment.
        </Alert>
        {adjustments.length === 0 ? <Typography variant="body2" color="text.secondary">No payroll adjustments are awaiting review.</Typography> : null}
        {adjustments.length > 0 && (
          <>
          <TableContainer sx={{ overflowX: "auto" }}><Table size="small" aria-label="Payroll adjustments" sx={{ minWidth: 1180 }}><TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Original run</TableCell><TableCell>Target month</TableCell><TableCell>Component</TableCell><TableCell>Type</TableCell><TableCell align="right">Amount</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell><TableCell>Audit history</TableCell><TableCell>Action</TableCell></TableRow></TableHead><TableBody>
            {adjustments.slice(adjustmentsPage * adjustmentsRowsPerPage, adjustmentsPage * adjustmentsRowsPerPage + adjustmentsRowsPerPage).map((adjustment) => <TableRow key={adjustment.id}>
              <TableCell>{adjustment.employeeId}</TableCell><TableCell>{adjustment.originalPayrollRunId}</TableCell>
              <TableCell>{adjustment.targetPeriod ? formatServerDate(adjustment.targetPeriod, "MMM YYYY") : "Legacy / unspecified"}</TableCell>
              <TableCell>{adjustment.componentName ? `${adjustment.componentName} (${adjustment.componentCode})${adjustment.isTaxable ? " · taxable" : " · non-taxable"}` : "Legacy / unspecified"}</TableCell>
              <TableCell>{adjustment.type}</TableCell><TableCell align="right">{adjustment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell><TableCell>{adjustment.reason}</TableCell>
              <TableCell><Chip size="small" label={adjustment.status} color={adjustment.status === "PROCESSED" ? "success" : adjustment.status === "DRAFT" ? "warning" : adjustment.status === "REJECTED" ? "error" : "default"} /></TableCell>
              <TableCell><Stack spacing={0.25}><Typography variant="caption">Created {formatServerDate(adjustment.createdAtUtc, "DD MMM YYYY")} by {adjustment.createdBy || "Unknown"}</Typography>{adjustment.approvedAtUtc && <Typography variant="caption">Approved {formatServerDate(adjustment.approvedAtUtc, "DD MMM YYYY")} by {adjustment.approvedBy || "Unknown"}</Typography>}{adjustment.rejectedAtUtc && <Typography variant="caption">Rejected {formatServerDate(adjustment.rejectedAtUtc, "DD MMM YYYY")} by {adjustment.rejectedBy || "Unknown"}: {adjustment.rejectionReason}</Typography>}{adjustment.processedAtUtc && <Typography variant="caption">Processed {formatServerDate(adjustment.processedAtUtc, "DD MMM YYYY")} by {adjustment.processedBy || "Unknown"}</Typography>}</Stack></TableCell>
              <TableCell>{canApprove && adjustment.status === "DRAFT" ? <Stack direction="row" spacing={0.5}><Button size="small" disabled={busy === adjustment.id} onClick={() => void approveAdjustment(adjustment)}>Approve adjustment</Button><Button size="small" color="error" disabled={busy === adjustment.id} onClick={() => { setAdjustmentRejectionReason(""); setAdjustmentToReject(adjustment); }}>Reject</Button></Stack> : adjustment.status === "APPROVED" ? <Typography variant="caption" color="text.secondary">Approved request · not included in payroll</Typography> : adjustment.correctionPayrollRunId || "—"}</TableCell>
            </TableRow>)}
          </TableBody></Table></TableContainer>
          <TablePagination component="div" count={adjustments.length} page={adjustmentsPage} onPageChange={(_, page) => setAdjustmentsPage(page)} rowsPerPage={adjustmentsRowsPerPage} onRowsPerPageChange={(event) => { setAdjustmentsRowsPerPage(Number(event.target.value)); setAdjustmentsPage(0); }} rowsPerPageOptions={[25, 50, 100]} labelRowsPerPage="Requests per page" />
          </>
        )}
      </Stack>
      </Stack>
      <Stack role="tabpanel" id="payroll-panel-reports" aria-labelledby="payroll-tab-reports" hidden={activeSection !== 2} spacing={1}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1}>
          <Stack><Typography variant="subtitle1">Payroll reports</Typography><Typography variant="body2" color="text.secondary">Register and gross-to-net totals from immutable payroll runs</Typography></Stack>
          <Stack direction="row" spacing={1}><Button size="small" onClick={() => void loadReport()} disabled={reportLoading}>Refresh report</Button><Button size="small" variant="outlined" onClick={() => void downloadReport()} disabled={busy === "report-export"}>Export CSV</Button></Stack>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Box sx={{ flex: 1, minWidth: { sm: 160 } }}>
            <CustomisedDatePicker
              label="From"
              value={reportFrom ? dayjs(reportFrom) : null}
              setValue={(val) => setReportFrom(val ? val.format("YYYY-MM-DD") : "")}
              clearable
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: { sm: 160 } }}>
            <CustomisedDatePicker
              label="To"
              value={reportTo ? dayjs(reportTo) : null}
              setValue={(val) => setReportTo(val ? val.format("YYYY-MM-DD") : "")}
              clearable
            />
          </Box>
          <TextField select label="Run status" value={reportStatus} onChange={(event) => setReportStatus(event.target.value)} size="small" fullWidth sx={{ flex: 1 }}><MenuItem value="">All statuses</MenuItem><MenuItem value="CALCULATED">Calculated</MenuItem><MenuItem value="PROCESSED">Processed</MenuItem><MenuItem value="PAID">Paid</MenuItem><MenuItem value="CLOSED">Closed</MenuItem><MenuItem value="BLOCKED">Blocked</MenuItem></TextField>
          <TextField select label="Line status" value={reportLineStatus} onChange={(event) => setReportLineStatus(event.target.value)} size="small" fullWidth sx={{ flex: 1 }}><MenuItem value="">All lines</MenuItem><MenuItem value="CALCULATED">Calculated</MenuItem><MenuItem value="BLOCKED">Blocked</MenuItem><MenuItem value="SKIPPED">Skipped</MenuItem></TextField>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField select label="Run type" value={reportRunType} onChange={(event) => setReportRunType(event.target.value)} size="small" fullWidth><MenuItem value="">All run types</MenuItem><MenuItem value="REGULAR">Regular</MenuItem><MenuItem value="OFF_CYCLE">Off-cycle</MenuItem><MenuItem value="SUPPLEMENTAL">Supplemental</MenuItem><MenuItem value="CORRECTION">Correction</MenuItem></TextField>
          <TextField label="Employee ID" value={reportEmployeeId} onChange={(event) => setReportEmployeeId(event.target.value)} size="small" fullWidth />
        </Stack>
        {reportLoading && <CircularProgress size={20} aria-label="Loading payroll report" />}
        {reportSummary && <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap"><Chip label={`${reportSummary.runCount} runs`} /><Chip label={`${reportSummary.employeeCount} employees`} /><Chip label={`Gross ${reportSummary.grossTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} /><Chip label={`Deductions ${reportSummary.deductionTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} /><Chip color="success" label={`Net ${reportSummary.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} /></Stack>}
        <TableContainer sx={{ overflowX: "auto" }}><Table size="small" aria-label="Payroll register" sx={{ minWidth: 760 }}><TableHead><TableRow><TableCell>Period</TableCell><TableCell>Employee</TableCell><TableCell>Run</TableCell><TableCell>Status</TableCell><TableCell align="right">Gross</TableCell><TableCell align="right">Deductions</TableCell><TableCell align="right">Net</TableCell></TableRow></TableHead><TableBody>
          {reportRows.slice(0, 50).map((row) => <TableRow key={`${row.runId}-${row.employeeId}`}><TableCell>{row.periodStart.slice(0, 7)}</TableCell><TableCell>{row.employeeId}</TableCell><TableCell>{row.runType}</TableCell><TableCell><Chip size="small" label={row.lineStatus} color={row.lineStatus === "BLOCKED" ? "error" : "default"} /></TableCell><TableCell align="right">{row.grossAmount.toLocaleString()}</TableCell><TableCell align="right">{row.deductionAmount.toLocaleString()}</TableCell><TableCell align="right">{row.netAmount.toLocaleString()}</TableCell></TableRow>)}
          {!reportLoading && reportRows.length === 0 && <TableRow><TableCell colSpan={7}><Typography color="text.secondary">No register rows match the selected filters.</Typography></TableCell></TableRow>}
        </TableBody></Table></TableContainer>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" spacing={1} sx={{ pt: 1 }}>
          <Typography variant="subtitle2">Statutory register · immutable run snapshots</Typography>
          <Button size="small" variant="outlined" onClick={() => void downloadStatutoryReport()} disabled={busy === "statutory-export"}>Export statutory CSV</Button>
        </Stack>
        <TableContainer sx={{ overflowX: "auto" }}><Table size="small" aria-label="Payroll statutory register" sx={{ minWidth: 980 }}><TableHead><TableRow><TableCell>Period</TableCell><TableCell>Employee</TableCell><TableCell>Profile</TableCell><TableCell align="right">Employee EPF</TableCell><TableCell align="right">Employer EPF</TableCell><TableCell align="right">Employee ESIC</TableCell><TableCell align="right">Employer ESIC</TableCell><TableCell align="right">TDS</TableCell><TableCell align="right">Professional tax</TableCell></TableRow></TableHead><TableBody>
          {statutoryRows.slice(0, 50).map((row) => <TableRow key={`statutory-${row.runId}-${row.employeeId}`}><TableCell>{row.periodStart.slice(0, 7)}</TableCell><TableCell>{row.employeeId}</TableCell><TableCell>{row.policyProfileId ? `${row.policyProfileId} v${row.policyProfileVersion}` : "Legacy/default"}</TableCell><TableCell align="right">{row.employeeEpf.toLocaleString()}</TableCell><TableCell align="right">{row.employerEpf.toLocaleString()}</TableCell><TableCell align="right">{row.employeeEsic.toLocaleString()}</TableCell><TableCell align="right">{row.employerEsic.toLocaleString()}</TableCell><TableCell align="right">{row.incomeTax.toLocaleString()}</TableCell><TableCell align="right">{row.professionalTax.toLocaleString()}</TableCell></TableRow>)}
          {!statutoryRows.length && <TableRow><TableCell colSpan={9}><Typography color="text.secondary">No statutory snapshots match these filters.</Typography></TableCell></TableRow>}
        </TableBody></Table></TableContainer>
      </Stack>
      <Dialog open={Boolean(issuesRun)} onClose={() => setIssuesRun(null)} fullWidth maxWidth="md">
        <DialogTitle>Payroll issues{issuesRun ? ` · ${issuesRun.periodStart.slice(0, 7)}` : ""}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Alert severity="warning">Resolve each employee issue, then retry calculation. A pay group or salary template does not replace an approved employee salary.</Alert>
            {issueRows.map((row) => <Card key={row.employeeId} variant="outlined"><CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={700}>{row.employeeId}</Typography><Chip size="small" label={row.status} color={row.status === "BLOCKED" ? "error" : "warning"} /></Stack>
                <Typography variant="body2">{row.errorMessage || row.exclusionReason || row.inclusionReason || "Review this employee's payroll inputs."}</Typography>
              </Stack>
            </CardContent></Card>)}
            {issueRows.length === 0 && <Typography color="text.secondary">No employee level issues were returned. Refresh the run and review its calculation status.</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setIssuesRun(null)}>Close</Button></DialogActions>
      </Dialog>
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={createRun}><DialogTitle>Create payroll run</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">The server resolves the tenant&apos;s effective assignment, pay group, policy, and salary components and snapshots them at creation.</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Box sx={{ flex: 1 }}>
              <CustomisedDatePicker
                label="Period start"
                value={periodStart ? dayjs(periodStart) : null}
                setValue={(val) => setPeriodStart(val ? val.format("YYYY-MM-DD") : "")}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <CustomisedDatePicker
                label="Period end"
                value={periodEnd ? dayjs(periodEnd) : null}
                setValue={(val) => setPeriodEnd(val ? val.format("YYYY-MM-DD") : "")}
                required
              />
            </Box>
          </Stack>
          <Box sx={{ width: "100%" }}>
            <CustomisedDatePicker
              label="Pay date"
              value={payDate ? dayjs(payDate) : null}
              setValue={(val) => setPayDate(val ? val.format("YYYY-MM-DD") : "")}
              required
            />
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField select label="Run type" value={runType} onChange={(event) => setRunType(event.target.value)} fullWidth><MenuItem value="REGULAR">Regular</MenuItem><MenuItem value="OFF_CYCLE">Off-cycle</MenuItem><MenuItem value="SUPPLEMENTAL">Supplemental</MenuItem><MenuItem value="CORRECTION">Correction</MenuItem></TextField>
            <TextField select label="Population" value={populationType} onChange={(event) => { setPopulationType(event.target.value); if (event.target.value !== "SELECTED") setSelectedEmployees([]); }} fullWidth><MenuItem value="ALL_ELIGIBLE">All eligible</MenuItem><MenuItem value="SELECTED" disabled={!canSelectEmployees}>Selected employees</MenuItem></TextField>
          </Stack>
          {populationType === "SELECTED" && canSelectEmployees && <Autocomplete multiple options={Array.from(new Map([...selectedEmployees, ...availableEmployees].map((employee) => [employee.employeeId, employee])).values())} value={selectedEmployees} inputValue={employeeSearch} onInputChange={(_, value) => setEmployeeSearch(value)} onChange={(_, value) => setSelectedEmployees(value)} loading={employeeOptionsLoading} getOptionLabel={(employee) => `${employee.fullName} (${employee.employeeId})`} isOptionEqualToValue={(option, value) => option.employeeId === value.employeeId} renderInput={(params) => <TextField {...params} label="Employees to include" required={selectedEmployees.length === 0} helperText={employeeOptionsLoading ? "Searching employees…" : `${selectedEmployees.length} selected. Run eligibility is validated again by the server.`} />} />}
          <TextField label="Idempotency key (optional)" value={idempotencyKey} onChange={(event) => setIdempotencyKey(event.target.value)} helperText="Reuse the key safely if the request must be retried." fullWidth />
        </Stack></DialogContent><DialogActions><Button onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" variant="contained" disabled={!canCreate || busy === "create" || (populationType === "SELECTED" && selectedEmployees.length === 0)}>Create run</Button></DialogActions></form>
      </Dialog>
      <Dialog open={Boolean(runToCancel)} onClose={() => setRunToCancel(null)} fullWidth maxWidth="sm">
        <form onSubmit={cancelRunForm}>
          <DialogTitle>Cancel draft payroll run?</DialogTitle>
          <DialogContent><Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="warning">Only DRAFT or BLOCKED runs can be cancelled. Its frozen inputs and audit history are retained; calculated, approved, or processed payroll cannot be cancelled here.</Alert>
            <Typography variant="body2">{canCreate ? "After cancellation you can create a replacement run. A fresh run ID and idempotency key will be used." : "You can cancel this run, but creating a replacement requires payroll run creation permission."}</Typography>
            <TextField label="Cancellation reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} required multiline minRows={2} inputProps={{ maxLength: 500 }} helperText={`${cancelReason.trim().length}/500 (minimum 5 characters)`} fullWidth autoFocus />
          </Stack></DialogContent>
          <DialogActions><Button onClick={() => setRunToCancel(null)}>Keep run</Button><Button type="submit" color="error" variant="contained" disabled={cancelReason.trim().length < 5 || cancelReason.trim().length > 500 || busy === runToCancel?.id}>Cancel run</Button></DialogActions>
        </form>
      </Dialog>
      <Dialog open={Boolean(batchToSubmit)} onClose={() => setBatchToSubmit(null)} fullWidth maxWidth="sm"><form onSubmit={submitBatchForm}><DialogTitle>Submit payment batch</DialogTitle><DialogContent><Stack spacing={1.5} sx={{ pt: 1 }}><Typography>Confirm the provider reference used to send this batch of {batchToSubmit?.employeeCount ?? 0} payments ({(batchToSubmit?.totalNetAmount ?? 0).toLocaleString()}).</Typography><TextField label="Bank or payment provider reference" value={providerReference} onChange={(event) => setProviderReference(event.target.value)} required fullWidth autoFocus /></Stack></DialogContent><DialogActions><Button onClick={() => setBatchToSubmit(null)}>Cancel</Button><Button type="submit" variant="contained" disabled={!providerReference.trim() || busy === batchToSubmit?.id}>Mark submitted</Button></DialogActions></form></Dialog>
      <Dialog open={Boolean(batchToReconcile)} onClose={() => setBatchToReconcile(null)} fullWidth maxWidth="sm"><form onSubmit={reconcileBatchForm}><DialogTitle>{batchToReconcile?.status === "RECONCILING" ? "Resume payment reconciliation" : "Reconcile payment batch"}</DialogTitle><DialogContent><Stack spacing={1.5} sx={{ pt: 1 }}><Typography>{batchToReconcile?.status === "RECONCILING" ? "Payment confirmation was recorded, but final payroll/batch updates were interrupted. This safely resumes that reconciliation; it does not submit another payment." : `Reconciliation confirms payment completion for ${batchToReconcile?.employeeCount ?? 0} employees and marks the linked payroll run paid.`} Reference: {batchToReconcile?.providerReference || "Not provided"}.</Typography><TextField label="Reconciliation note" value={reconciliationNote} onChange={(event) => setReconciliationNote(event.target.value)} required multiline minRows={2} fullWidth /><Stack direction="row" spacing={1} alignItems="flex-start"><Checkbox checked={reconciliationConfirmed} onChange={(event) => setReconciliationConfirmed(event.target.checked)} inputProps={{ "aria-label": "Confirm all payments were verified" }} /><Typography variant="body2" sx={{ pt: 1 }}>I verified the payment outcome with the provider/bank and confirm this batch is paid.</Typography></Stack></Stack></DialogContent><DialogActions><Button onClick={() => setBatchToReconcile(null)}>Cancel</Button><Button type="submit" color="success" variant="contained" disabled={!reconciliationConfirmed || !reconciliationNote.trim() || busy === batchToReconcile?.id}>{batchToReconcile?.status === "RECONCILING" ? "Resume reconciliation" : "Confirm reconciliation"}</Button></DialogActions></form></Dialog>
      <Dialog open={Boolean(adjustmentToReject)} onClose={() => setAdjustmentToReject(null)} fullWidth maxWidth="sm">
        <form onSubmit={rejectAdjustmentForm}>
          <DialogTitle>Reject payroll adjustment?</DialogTitle>
          <DialogContent><Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="warning">This permanently closes the draft request; it will not change the original payslip or enter payroll. Rejected requests remain in the audit history.</Alert>
            <Typography variant="body2">Employee {adjustmentToReject?.employeeId} · {adjustmentToReject?.componentName || adjustmentToReject?.componentCode || "Unspecified component"} · {adjustmentToReject?.amount.toLocaleString()}</Typography>
            <TextField label="Rejection reason" value={adjustmentRejectionReason} onChange={(event) => setAdjustmentRejectionReason(event.target.value)} required multiline minRows={2} inputProps={{ maxLength: 500 }} helperText={`${adjustmentRejectionReason.trim().length}/500 (minimum 5 characters)`} fullWidth autoFocus />
          </Stack></DialogContent>
          <DialogActions><Button onClick={() => setAdjustmentToReject(null)}>Cancel</Button><Button type="submit" color="error" variant="contained" disabled={adjustmentRejectionReason.trim().length < 5 || adjustmentRejectionReason.trim().length > 500 || busy === adjustmentToReject?.id}>Reject request</Button></DialogActions>
        </form>
      </Dialog>
      <Dialog open={Boolean(adjustmentRun)} onClose={() => setAdjustmentRun(null)} fullWidth maxWidth="sm"><form onSubmit={createAdjustmentForm}><DialogTitle>Create payroll adjustment</DialogTitle><DialogContent><Stack spacing={1.5} sx={{ pt: 1 }}><Typography>Creates an auditable correction request against paid/closed run {adjustmentRun?.id}; the original payslip stays unchanged.</Typography><Alert severity="warning">Approval records the request only. It will not enter gross-to-net or be paid until tax/statutory treatment is implemented and approved.</Alert><TextField select label="Employee" value={adjustmentEmployeeId} onChange={(event) => setAdjustmentEmployeeId(event.target.value)} required fullWidth disabled={adjustmentEmployeesLoading}><MenuItem value="" disabled>{adjustmentEmployeesLoading ? "Loading run employees…" : "Select employee"}</MenuItem>{adjustmentEmployees.map((employee) => <MenuItem key={employee.employeeId} value={employee.employeeId}>{employee.employeeId}</MenuItem>)}</TextField><TextField select label="Adjustment type" value={adjustmentType} onChange={(event) => setAdjustmentType(event.target.value as typeof adjustmentType)} fullWidth><MenuItem value="ARREARS">Arrears</MenuItem><MenuItem value="CORRECTION">Correction</MenuItem><MenuItem value="REVERSAL">Reversal</MenuItem></TextField><CustomisedDatePicker label="Target payroll month" views={["month", "year"]} format="YYYY-MM" value={adjustmentTargetPeriod ? dayjs(adjustmentTargetPeriod) : null} setValue={(val) => { const nextVal = val ? val.format("YYYY-MM") : ""; setAdjustmentTargetPeriod(nextVal); setAdjustmentComponentCode(""); if (nextVal) { void loadAdjustmentComponents(nextVal); } }} required helperText="The component definition is resolved for this month." /><TextField select label="Salary component" value={adjustmentComponentCode} onChange={(event) => setAdjustmentComponentCode(event.target.value)} required fullWidth disabled={adjustmentComponentsLoading || adjustmentComponents.length === 0}><MenuItem value="" disabled>{adjustmentComponentsLoading ? "Loading components…" : "Select component"}</MenuItem>{adjustmentComponents.map((component) => <MenuItem key={`${component.code}-${component.version}`} value={component.code}>{component.name} ({component.code}) · {component.kind.toLowerCase()} · {component.isTaxable ? "taxable" : "non-taxable"}</MenuItem>)}</TextField><TextField label="Amount (+ earning / − deduction)" type="number" value={adjustmentAmount} onChange={(event) => setAdjustmentAmount(event.target.value)} required inputProps={{ step: "0.01" }} fullWidth /><TextField label="Reason and audit note" value={adjustmentReason} onChange={(event) => setAdjustmentReason(event.target.value)} required multiline minRows={2} fullWidth /></Stack></DialogContent><DialogActions><Button onClick={() => setAdjustmentRun(null)}>Cancel</Button><Button type="submit" variant="contained" disabled={adjustmentEmployeesLoading || adjustmentComponentsLoading || !adjustmentEmployeeId || !adjustmentComponentCode || !adjustmentTargetPeriod || !adjustmentReason.trim() || !adjustmentAmount || Number(adjustmentAmount) === 0 || busy === adjustmentRun?.id}>Create draft</Button></DialogActions></form></Dialog>
    </Stack>
  );
}






