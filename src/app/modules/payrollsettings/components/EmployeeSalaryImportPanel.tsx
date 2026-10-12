import { CloudUploadRounded, CheckCircleRounded } from "@mui/icons-material";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import { Alert, Box, Button, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { approveEmployeeSalaryStructure, getEmployeeSalaryImportBatch, getPendingEmployeeSalaryStructures, previewEmployeeSalaryImport, previewEmployeeSalaryPdf, submitEmployeeSalaryImport, submitEmployeeSalaryStructure } from "../../payroll/services";
import type { EmployeeSalaryImportBatchModel, EmployeeSalaryImportPreviewRowModel, EmployeeSalaryImportRowModel, EmployeeSalaryStructureModel } from "../../payroll/models";
import { downloadPayrollBulkSampleTemplate, parseSalarySpreadsheet } from "./salaryImportMapping";

const annualCtcSourceLabel = (source?: string | null, missingLabel = "Legacy / unspecified") => {
  switch (source) {
    case "OFFER_PDF": return "Offer PDF";
    case "SPREADSHEET": return "Spreadsheet";
    case "ANNUALIZED_GROSS_ESTIMATE": return "Estimated from recurring gross";
    case "USER_ENTERED": return "Entered by HR";
    default: return missingLabel;
  }
};

export function EmployeeSalaryImportPanel({ canEdit, canApprove, onPendingCountChange }: { canEdit: boolean; canApprove: boolean; onPendingCountChange?: (count: number | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<EmployeeSalaryImportRowModel[]>([]);
  const [preview, setPreview] = useState<EmployeeSalaryImportPreviewRowModel[]>([]);
  const [busy, setBusy] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [batchStatus, setBatchStatus] = useState<EmployeeSalaryImportBatchModel | null>(null);
  const [pendingSalaries, setPendingSalaries] = useState<EmployeeSalaryStructureModel[]>([]);
  const [pendingLoadFailed, setPendingLoadFailed] = useState(false);
  const allValid = rows.length > 0 && preview.length === rows.length && preview.every((row) => row.isValid);

  const reloadPendingSalaries = useCallback(async () => {
    try {
      const response = await getPendingEmployeeSalaryStructures();
      setPendingSalaries(response.data ?? []);
      setPendingLoadFailed(false);
      onPendingCountChange?.((response.data ?? []).length);
    } catch {
      setPendingLoadFailed(true);
      onPendingCountChange?.(null);
    }
  }, [onPendingCountChange]);

  useEffect(() => { void reloadPendingSalaries(); }, [reloadPendingSalaries]);

  const updateApprovalState = async (salary: EmployeeSalaryStructureModel, action: "submit" | "approve") => {
    if (!salary.id) return;
    setBusy(true);
    try {
      const response = action === "submit"
        ? await submitEmployeeSalaryStructure(salary.id, salary.version)
        : await approveEmployeeSalaryStructure(salary.id, salary.version);
      if (!response.data.success) throw new Error(response.data.message || "Salary approval action failed.");
      toast.success(action === "submit" ? `${salary.employeeId} submitted for approval.` : `${salary.employeeId} salary approved.`);
      await reloadPendingSalaries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Salary approval action failed.");
      await reloadPendingSalaries();
    } finally {
      setBusy(false);
    }
  };

  const parseFile = async (file: File) => {
    setBusy(true);
    try {
      setRows(parseSalarySpreadsheet(await file.arrayBuffer()));
      setBatchId(crypto.randomUUID());
      setPreview([]);
      setBatchStatus(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The spreadsheet could not be read.");
    } finally {
      setBusy(false);
    }
  };
  const parsePdf = async (file: File) => {
    setBusy(true);
    try {
      const response = await previewEmployeeSalaryPdf(file);
      if (response.data.errors?.length || !response.data.row) {
        toast.error(response.data.errors?.join(" ") || "PDF salary fields could not be extracted.");
        return;
      }
      setRows([response.data.row]);
      setPreview([]);
      setBatchId(crypto.randomUUID());
      setBatchStatus(null);
      toast.success("PDF salary structure extracted. Validate the preview before importing.");
    } catch {
      toast.error("Unable to read the salary PDF.");
    } finally {
      setBusy(false);
    }
  };
  const runPreview = async () => {
    if (!rows.length) return;
    setBusy(true);
    try { const response = await previewEmployeeSalaryImport(rows); setPreview(response.data ?? []); }
    catch { toast.error("Unable to validate salary import."); }
    finally { setBusy(false); }
  };
  const submit = async () => {
    if (!allValid) return;
    setBusy(true);
    try {
      const response = await submitEmployeeSalaryImport(rows, batchId);
      if (response.data.success) {
        setRows([]);
        setPreview([]);
        toast.success("Salary drafts imported. Submit them for review; a different authorized approver must approve them before payroll can use them.");
        void reloadPendingSalaries();
        try {
          const status = await getEmployeeSalaryImportBatch(batchId);
          setBatchStatus(status.data ?? null);
        } catch {
          toast.info("Salary drafts were imported, but the batch summary could not be loaded. The approval queue is being refreshed.");
        }
      } else toast.error(response.data.message || "Import failed.");
    }
    catch { toast.error("Unable to submit salary import."); }
    finally { setBusy(false); }
  };
  return <Stack spacing={2}>
    <Box><Typography variant="h6">Import employee salary structures</Typography><Typography variant="body2" color="text.secondary">Upload an Excel or text-based PDF salary document. Extracted structures require preview validation and remain drafts until approved.</Typography></Box>
    {!canEdit && !canApprove && <Alert severity="info">You have view-only access to salary imports and salary approvals.</Alert>}
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
      <input ref={inputRef} hidden type="file" accept=".xlsx,.xls,.pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) { if (file.name.toLowerCase().endsWith(".pdf")) void parsePdf(file); else void parseFile(file); } event.target.value = ""; }} />
      <Button disabled={!canEdit || busy} startIcon={<CloudUploadRounded />} variant="outlined" onClick={() => inputRef.current?.click()}>Choose Excel or PDF file</Button>
      <Button startIcon={<DownloadRounded />} variant="outlined" color="primary" onClick={() => downloadPayrollBulkSampleTemplate()}>Download sample Excel</Button>
      <Button disabled={!canEdit || busy || rows.length === 0} variant="contained" onClick={() => void runPreview()}>Validate preview</Button>
      <Button disabled={!canEdit || busy || !allValid} color="success" variant="contained" startIcon={<CheckCircleRounded />} onClick={() => void submit()}>Import salary drafts</Button>
    </Stack>
    {rows.length > 0 && <Alert severity={allValid ? "success" : "warning"}>{preview.length ? `${preview.filter((row) => row.isValid).length}/${rows.length} rows valid.` : `${rows.length} rows loaded. Run preview validation before importing.`}</Alert>}
    {batchStatus && <Alert severity={batchStatus.status === "PARTIAL_FAILURE" ? "error" : "success"}>Batch {batchStatus.batchId}: {batchStatus.status}. Processed {batchStatus.processedRows}/{batchStatus.totalRows}; skipped {batchStatus.skippedRows}.{batchStatus.failureMessage ? " " + batchStatus.failureMessage : ""}</Alert>}
    {preview.length > 0 && <TableContainer sx={{ width: "100%", overflowX: "auto" }}><Table size="small" sx={{ minWidth: 780 }}><TableHead><TableRow><TableCell>Row</TableCell><TableCell>Employee</TableCell><TableCell>Monthly recurring gross</TableCell><TableCell>Annual CTC</TableCell><TableCell>CTC source / reconciliation</TableCell><TableCell>Status</TableCell><TableCell>Errors</TableCell></TableRow></TableHead><TableBody>{preview.map((row) => {
      const salary = rows.find((item) => item.rowNumber === row.rowNumber);
      const annualizedGross = (salary?.monthlyGross ?? 0) * 12;
      const ctcDifference = (salary?.annualCtc ?? 0) - annualizedGross;
      const sourceLabel = annualCtcSourceLabel(salary?.annualCtcSource, "Not attributed");
      return <TableRow key={row.rowNumber}><TableCell>{row.rowNumber}</TableCell><TableCell>{row.employeeId}</TableCell><TableCell>{(salary?.monthlyGross ?? 0).toLocaleString()}</TableCell><TableCell>{(salary?.annualCtc ?? 0).toLocaleString()}</TableCell><TableCell><Stack spacing={0.25}><Typography variant="body2">{sourceLabel}</Typography><Typography variant="caption" color="text.secondary">Annualized recurring gross: {annualizedGross.toLocaleString()} · CTC difference: {ctcDifference.toLocaleString()}</Typography></Stack></TableCell><TableCell>{row.isValid ? "Valid" : "Invalid"}</TableCell><TableCell>{row.errors.join(" ")}</TableCell></TableRow>;
    })}</TableBody></Table></TableContainer>}
    <Box>
      <Typography variant="h6">Salary structures awaiting approval</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Drafts are not used in payroll. Submit a draft for review, then a different user with Payroll Settings approval permission must approve it.</Typography>
      {pendingLoadFailed && <Alert severity="error" sx={{ mb: 1 }} action={<Button color="inherit" size="small" onClick={() => void reloadPendingSalaries()}>Retry</Button>}>Pending salary structures could not be loaded. Refresh this section before taking approval action.</Alert>}
      {pendingSalaries.length === 0 ? <Alert severity="info">No salary structures are awaiting submission or approval.</Alert> : (
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}><Table size="small" sx={{ minWidth: 900 }}><TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Source</TableCell><TableCell>Annual CTC</TableCell><TableCell>Effective period</TableCell><TableCell>Components</TableCell><TableCell>Status</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
          <TableBody>{pendingSalaries.map((salary) => <TableRow key={salary.id}>
            <TableCell>{salary.employeeId}</TableCell>
            <TableCell>{salary.source?.startsWith("IMPORT:") ? `Import batch ${salary.source.slice("IMPORT:".length)}` : salary.source || "Manual"}</TableCell>
            <TableCell>{salary.annualCtc == null ? "Not provided" : <Stack spacing={0.25}><Typography variant="body2">{salary.annualCtc.toLocaleString()} {salary.currency}</Typography><Typography variant="caption" color="text.secondary">{annualCtcSourceLabel(salary.annualCtcSource)}</Typography><Typography variant="caption" color="text.secondary">Recurring gross × 12: {((salary.monthlyGross ?? 0) * 12).toLocaleString()} · Difference: {(salary.annualCtc - (salary.monthlyGross ?? 0) * 12).toLocaleString()}</Typography></Stack>}</TableCell>
            <TableCell>{salary.effectiveFrom.slice(0, 10)} – {salary.effectiveTo ? salary.effectiveTo.slice(0, 10) : "Open-ended (until replaced)"}</TableCell>
            <TableCell>{salary.components.map((component) => `${component.componentName}: ${component.value.toLocaleString()}${component.percentage != null ? ` (${component.percentage}%)` : ""}`).join(" · ")}</TableCell>
            <TableCell><Chip size="small" label={salary.approvalStatus === "SUBMITTED" ? "Pending approval" : "Draft"} color={salary.approvalStatus === "SUBMITTED" ? "warning" : "default"} /></TableCell>
            <TableCell align="right">{salary.approvalStatus === "DRAFT" && canEdit && <Button size="small" disabled={busy || pendingLoadFailed} onClick={() => void updateApprovalState(salary, "submit")}>Submit for approval</Button>}{salary.approvalStatus === "SUBMITTED" && canApprove && <Button size="small" variant="contained" disabled={busy || pendingLoadFailed} onClick={() => void updateApprovalState(salary, "approve")}>Approve</Button>}</TableCell>
          </TableRow>)}</TableBody>
        </Table></TableContainer>
      )}
    </Box>
  </Stack>;
}
