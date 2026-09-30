import { CloudUploadRounded, CheckCircleRounded } from "@mui/icons-material";
import { Alert, Box, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { getEmployeeSalaryImportBatch, previewEmployeeSalaryImport, previewEmployeeSalaryPdf, submitEmployeeSalaryImport } from "../../payroll/services";
import type { EmployeeSalaryImportBatchModel, EmployeeSalaryImportPreviewRowModel, EmployeeSalaryImportRowModel } from "../../payroll/models";
import { rowToImport } from "./salaryImportMapping";

export function EmployeeSalaryImportPanel({ canEdit }: { canEdit: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<EmployeeSalaryImportRowModel[]>([]);
  const [preview, setPreview] = useState<EmployeeSalaryImportPreviewRowModel[]>([]);
  const [busy, setBusy] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [batchStatus, setBatchStatus] = useState<EmployeeSalaryImportBatchModel | null>(null);
  const allValid = rows.length > 0 && preview.length === rows.length && preview.every((row) => row.isValid);

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const workbook = XLSX.read(reader.result, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      setRows(data.map((row, index) => rowToImport(row, index + 2)));
      setBatchId(crypto.randomUUID());
      setPreview([]);
      setBatchStatus(null);
    };
    reader.readAsArrayBuffer(file);
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
    try { const response = await submitEmployeeSalaryImport(rows, batchId); if (response.data.success) { const status = await getEmployeeSalaryImportBatch(batchId); setBatchStatus(status.data ?? null); toast.success("Salary drafts imported; approval is still required."); setRows([]); setPreview([]); } else toast.error(response.data.message || "Import failed."); }
    catch { toast.error("Unable to submit salary import."); }
    finally { setBusy(false); }
  };
  return <Stack spacing={2}>
    <Box><Typography variant="h6">Import employee salary structures</Typography><Typography variant="body2" color="text.secondary">Upload an Excel or text-based PDF salary document. Extracted structures require preview validation and remain drafts until approved.</Typography></Box>
    {!canEdit && <Alert severity="info">You have view-only access to salary imports.</Alert>}
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <input ref={inputRef} hidden type="file" accept=".xlsx,.xls,.pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) { if (file.name.toLowerCase().endsWith(".pdf")) void parsePdf(file); else parseFile(file); } }} />
      <Button disabled={!canEdit || busy} startIcon={<CloudUploadRounded />} variant="outlined" onClick={() => inputRef.current?.click()}>Choose Excel or PDF file</Button>
      <Button disabled={!canEdit || busy || rows.length === 0} variant="contained" onClick={() => void runPreview()}>Validate preview</Button>
      <Button disabled={!canEdit || busy || !allValid} color="success" variant="contained" startIcon={<CheckCircleRounded />} onClick={() => void submit()}>Import salary drafts</Button>
    </Stack>
    {rows.length > 0 && <Alert severity={allValid ? "success" : "warning"}>{preview.length ? `${preview.filter((row) => row.isValid).length}/${rows.length} rows valid.` : `${rows.length} rows loaded. Run preview validation before importing.`}</Alert>}
    {batchStatus && <Alert severity={batchStatus.status === "PARTIAL_FAILURE" ? "error" : "success"}>Batch {batchStatus.batchId}: {batchStatus.status}. Processed {batchStatus.processedRows}/{batchStatus.totalRows}; skipped {batchStatus.skippedRows}.{batchStatus.failureMessage ? " " + batchStatus.failureMessage : ""}</Alert>}
    {preview.length > 0 && <Table size="small"><TableHead><TableRow><TableCell>Row</TableCell><TableCell>Employee</TableCell><TableCell>Status</TableCell><TableCell>Errors</TableCell></TableRow></TableHead><TableBody>{preview.map((row) => <TableRow key={row.rowNumber}><TableCell>{row.rowNumber}</TableCell><TableCell>{row.employeeId}</TableCell><TableCell>{row.isValid ? "Valid" : "Invalid"}</TableCell><TableCell>{row.errors.join(" ")}</TableCell></TableRow>)}</TableBody></Table>}
  </Stack>;
}
