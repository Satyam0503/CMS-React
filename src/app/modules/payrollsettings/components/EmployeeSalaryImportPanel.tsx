import {
  CloudUploadRounded,
  CheckCircleRounded,
  DownloadRounded,
  DeleteOutlineRounded,
  InsertDriveFileOutlined,
  TaskAltRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useIsDark } from "../../theme/useIsDark";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  approveEmployeeSalaryStructure,
  getEmployeeSalaryImportBatch,
  getPendingEmployeeSalaryStructures,
  previewEmployeeSalaryImport,
  previewEmployeeSalaryPdf,
  rejectEmployeeSalaryStructure,
  submitEmployeeSalaryImport,
  submitEmployeeSalaryStructure,
} from "../../payroll/services";
import type {
  EmployeeSalaryImportBatchModel,
  EmployeeSalaryImportPreviewRowModel,
  EmployeeSalaryImportRowModel,
  EmployeeSalaryStructureModel,
} from "../../payroll/models";
import { downloadPayrollBulkSampleTemplate, parseSalarySpreadsheet } from "./salaryImportMapping";
import { currencyFormatter, dateFormatter } from "../../../../utils/common";

const humanizeSource = (source?: string | null) => {
  if (!source) return "Manual";
  if (source.startsWith("IMPORT:")) return "Excel Import";
  if (source === "ONBOARDING_MANUAL") return "Manual Onboarding";
  if (source === "OFFER_PDF") return "Offer PDF";
  if (source === "SPREADSHEET") return "Spreadsheet";
  if (source === "ANNUALIZED_GROSS_ESTIMATE") return "Estimated Gross";
  if (source === "USER_ENTERED") return "HR Entry";
  return source.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const annualCtcSourceLabel = (source?: string | null, missingLabel = "Legacy / unspecified") => {
  switch (source) {
    case "OFFER_PDF": return "Offer PDF";
    case "SPREADSHEET": return "Spreadsheet";
    case "ANNUALIZED_GROSS_ESTIMATE": return "Estimated from recurring gross";
    case "USER_ENTERED": return "Entered by HR";
    default: return missingLabel;
  }
};

export function EmployeeSalaryImportPanel({
  canEdit,
  canApprove,
  onPendingCountChange,
  onSalaryApproved,
}: {
  canEdit: boolean;
  canApprove: boolean;
  onPendingCountChange?: (count: number | null) => void;
  onSalaryApproved?: () => void;
}) {
  const theme = useTheme();
  const isDark = useIsDark();

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  useEffect(() => {
    void reloadPendingSalaries();
  }, [reloadPendingSalaries]);

  const updateApprovalState = async (
    salary: EmployeeSalaryStructureModel,
    action: "submit" | "approve" | "reject"
  ) => {
    if (!salary.id) return;
    setBusy(true);
    try {
      const response =
        action === "submit"
          ? await submitEmployeeSalaryStructure(salary.id, salary.version)
          : action === "approve"
          ? await approveEmployeeSalaryStructure(salary.id, salary.version)
          : await rejectEmployeeSalaryStructure(salary.id, salary.version);

      if (!response.data.success) {
        throw new Error(response.data.message || "Salary approval action failed.");
      }

      toast.success(
        action === "submit"
          ? `${salary.employeeId} submitted for approval.`
          : action === "approve"
          ? `${salary.employeeId} salary approved and activated.`
          : `${salary.employeeId} draft discarded.`
      );
      await reloadPendingSalaries();
      onSalaryApproved?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Salary approval action failed.");
      await reloadPendingSalaries();
    } finally {
      setBusy(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setRows([]);
    setPreview([]);
    setBatchStatus(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFilePicked = async (file: File) => {
    setSelectedFile(file);
    setBusy(true);
    try {
      if (file.name.toLowerCase().endsWith(".pdf")) {
        const response = await previewEmployeeSalaryPdf(file);
        if (response.data.errors?.length || !response.data.row) {
          toast.error(response.data.errors?.join(" ") || "PDF salary fields could not be extracted.");
          resetUpload();
          return;
        }
        setRows([response.data.row]);
        setPreview([]);
        setBatchId(crypto.randomUUID());
        setBatchStatus(null);
        toast.success("PDF salary structure extracted. Validate preview before importing.");
      } else {
        const parsedRows = parseSalarySpreadsheet(await file.arrayBuffer());
        setRows(parsedRows);
        setBatchId(crypto.randomUUID());
        setPreview([]);
        setBatchStatus(null);
        toast.info(`${parsedRows.length} rows parsed from spreadsheet. Click Validate Preview.`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The file could not be read.");
      resetUpload();
    } finally {
      setBusy(false);
    }
  };

  const runPreview = async () => {
    if (!rows.length) return;
    setBusy(true);
    try {
      const response = await previewEmployeeSalaryImport(rows);
      setPreview(response.data ?? []);
    } catch {
      toast.error("Unable to validate salary import preview.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!allValid) return;
    setBusy(true);
    try {
      const response = await submitEmployeeSalaryImport(rows, batchId);
      if (response.data.success) {
        resetUpload();
        toast.success("Salary drafts imported into approval queue.");
        void reloadPendingSalaries();
        onSalaryApproved?.();
        try {
          const status = await getEmployeeSalaryImportBatch(batchId);
          setBatchStatus(status.data ?? null);
        } catch {
          // non-critical
        }
      } else {
        toast.error(response.data.message || "Import failed.");
      }
    } catch {
      toast.error("Unable to submit salary import.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={3.5}>
      {/* ------------------------------------------------------------- */}
      {/* 1. MINIMAL EXECUTIVE IMPORT CARD                              */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: "14px",
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
          bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : "#F8FAFC",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1.5}
          sx={{ mb: 2, width: "100%" }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CloudUploadRounded sx={{ fontSize: 22, color: "primary.main" }} />
              <Typography variant="subtitle1" fontWeight={750} sx={{ color: "text.primary", letterSpacing: "-0.01em" }}>
                Import Employee Salary Structures
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem", mt: 0.35 }}>
              Upload master salary spreadsheet (.xlsx) or candidate offer letters (.pdf) to stage compensation revisions.
            </Typography>
          </Box>

          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadRounded sx={{ fontSize: 18 }} />}
            onClick={() => downloadPayrollBulkSampleTemplate()}
            sx={{
              height: 38,
              px: 2,
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "10px",
              borderColor: isDark ? "rgba(255,255,255,0.14)" : "divider",
              color: "text.primary",
              bgcolor: "background.paper",
              whiteSpace: "nowrap",
              flexShrink: 0,
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
                color: "primary.main",
              },
            }}
          >
            Download sample Excel
          </Button>
        </Stack>

        {!canEdit && !canApprove && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: "10px", fontSize: "0.8rem" }}>
            You have view-only access to salary imports and salary approvals.
          </Alert>
        )}

        {/* Upload Trigger / Selected File Zone */}
        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".xlsx,.xls,.pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFilePicked(file);
          }}
        />

        {!selectedFile ? (
          <Box
            onClick={() => {
              if (canEdit && !busy) inputRef.current?.click();
            }}
            sx={{
              p: { xs: 2.5, sm: 3 },
              textAlign: "center",
              borderRadius: "10px",
              border: "1.5px dashed",
              borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
              bgcolor: isDark ? "rgba(15, 23, 42, 0.4)" : "#FFFFFF",
              cursor: canEdit && !busy ? "pointer" : "default",
              transition: "all 0.15s ease",
              "&:hover": canEdit && !busy ? {
                borderColor: "primary.main",
                bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : alpha(theme.palette.primary.main, 0.02),
              } : undefined,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                mx: "auto",
                mb: 1,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              <InsertDriveFileOutlined sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="body2" fontWeight={650} sx={{ color: "text.primary" }}>
              Click to choose Excel spreadsheet (.xlsx, .xls) or Offer Letter (.pdf)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Standard salary templates are validated against active employees before entering approval queue.
            </Typography>
            <Button
              size="small"
              variant="contained"
              disabled={!canEdit || busy}
              sx={{
                mt: 1.5,
                height: 30,
                px: 2,
                fontSize: "0.78rem",
                fontWeight: 650,
                textTransform: "none",
                borderRadius: "6px",
                boxShadow: "none",
              }}
            >
              Choose Excel or PDF file
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              borderRadius: "10px",
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#E2E8F0",
              bgcolor: isDark ? "rgba(15, 23, 42, 0.5)" : "#FFFFFF",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={2}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <InsertDriveFileOutlined sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rows.length} salary {rows.length === 1 ? "structure" : "structures"} loaded · {(selectedFile.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems="center"
                sx={{ width: { xs: "100%", md: "auto" }, flexWrap: "wrap" }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={resetUpload}
                  disabled={busy}
                  sx={{
                    height: 36,
                    px: 2,
                    fontSize: "0.8rem",
                    fontWeight: 650,
                    textTransform: "none",
                    borderRadius: "8px",
                    borderColor: "divider",
                    color: "text.secondary",
                    width: { xs: "100%", sm: "auto" },
                    whiteSpace: "nowrap",
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => void runPreview()}
                  disabled={!canEdit || busy || rows.length === 0}
                  sx={{
                    height: 36,
                    px: 2,
                    fontSize: "0.8rem",
                    fontWeight: 650,
                    textTransform: "none",
                    borderRadius: "8px",
                    width: { xs: "100%", sm: "auto" },
                    whiteSpace: "nowrap",
                  }}
                >
                  Validate preview
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => void submit()}
                  disabled={!canEdit || busy || !allValid}
                  startIcon={<CheckCircleRounded sx={{ fontSize: 16 }} />}
                  sx={{
                    height: 36,
                    px: 2.25,
                    fontSize: "0.8rem",
                    fontWeight: 650,
                    textTransform: "none",
                    borderRadius: "8px",
                    boxShadow: "none",
                    width: { xs: "100%", sm: "auto" },
                    whiteSpace: "nowrap",
                  }}
                >
                  Import salary drafts
                </Button>
              </Stack>
            </Stack>

            {rows.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Alert
                  severity={allValid ? "success" : preview.length ? "warning" : "info"}
                  sx={{ py: 0.25, px: 1.5, borderRadius: "8px", fontSize: "0.78rem" }}
                >
                  {preview.length
                    ? `${preview.filter((row) => row.isValid).length} of ${rows.length} rows valid. ${
                        allValid ? "Ready to import into approval queue." : "Please correct highlighted rows."
                      }`
                    : `${rows.length} rows loaded. Click 'Validate preview' before importing.`}
                </Alert>
              </Box>
            )}
          </Box>
        )}

        {batchStatus && (
          <Alert
            severity={batchStatus.status === "PARTIAL_FAILURE" ? "error" : "success"}
            sx={{ mt: 1.5, borderRadius: "8px", fontSize: "0.8rem" }}
          >
            Batch {batchStatus.batchId}: {batchStatus.status}. Processed {batchStatus.processedRows}/{batchStatus.totalRows}; skipped {batchStatus.skippedRows}.
            {batchStatus.failureMessage ? ` ${batchStatus.failureMessage}` : ""}
          </Alert>
        )}

        {/* Validation Preview Table */}
        {preview.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <TableContainer
              sx={{
                width: "100%",
                overflowX: "auto",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
              }}
            >
              <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#F1F5F9" }}>
                    <TableCell sx={{ fontSize: "0.72rem", fontWeight: 700 }}>Row</TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", fontWeight: 700 }}>Employee ID</TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", fontWeight: 700 }} align="right">Monthly Gross</TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", fontWeight: 700 }} align="right">Annual CTC</TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", fontWeight: 700 }}>Source / Note</TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((row) => {
                    const salary = rows.find((item) => item.rowNumber === row.rowNumber);
                    return (
                      <TableRow key={row.rowNumber}>
                        <TableCell sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{row.rowNumber}</TableCell>
                        <TableCell sx={{ fontSize: "0.82rem", fontWeight: 700 }}>{row.employeeId}</TableCell>
                        <TableCell sx={{ fontSize: "0.82rem" }} align="right">
                          {currencyFormatter(salary?.monthlyGross)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.82rem", fontWeight: 650 }} align="right">
                          {currencyFormatter(salary?.annualCtc)}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.76rem", color: "text.secondary" }}>
                          {annualCtcSourceLabel(salary?.annualCtcSource, "Direct input")}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={row.isValid ? "Valid" : row.errors.join(", ") || "Invalid"}
                            color={row.isValid ? "success" : "error"}
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. CLASSY, MINIMAL SALARY APPROVAL QUEUE TABLE                */}
      {/* ------------------------------------------------------------- */}
      <Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={750} sx={{ letterSpacing: "-0.015em", color: "text.primary", fontSize: "1.05rem" }}>
              Salary structures awaiting approval
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mt: 0.25 }}>
              Drafts are not active until approved. Review, approve, or discard salary structures below.
            </Typography>
          </Box>

          {pendingSalaries.length > 0 && (
            <Chip
              size="small"
              label={`${pendingSalaries.length} pending review`}
              sx={{
                height: 28,
                px: 1,
                fontSize: "0.75rem",
                fontWeight: 700,
                borderRadius: "8px",
                flexShrink: 0,
                bgcolor: isDark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7",
                color: isDark ? "#FDE68A" : "#92400E",
                border: "1px solid",
                borderColor: isDark ? "rgba(245, 158, 11, 0.4)" : "#FDE68A",
              }}
            />
          )}
        </Stack>

        {pendingLoadFailed && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: "8px" }}
            action={
              <Button color="inherit" size="small" onClick={() => void reloadPendingSalaries()}>
                Retry
              </Button>
            }
          >
            Pending salary structures could not be loaded. Refresh this section before taking approval action.
          </Alert>
        )}

        {pendingSalaries.length === 0 ? (
          <Box
            sx={{
              py: 5,
              px: 3,
              textAlign: "center",
              borderRadius: "12px",
              border: "1px dashed",
              borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
              bgcolor: isDark ? "rgba(30, 41, 59, 0.2)" : "#F8FAFC",
            }}
          >
            <TaskAltRounded sx={{ fontSize: 32, color: "success.main", mb: 0.75, opacity: 0.8 }} />
            <Typography variant="body2" fontWeight={650} sx={{ color: "text.primary" }}>
              All caught up! No salary structures are awaiting approval.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
              Approved employee salaries will automatically appear in the Active Salaries &amp; Register tab.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              width: "100%",
              overflowX: "auto",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: isDark ? "rgba(15, 23, 42, 0.4)" : "#FFFFFF",
              boxShadow: isDark
                ? "0 4px 14px rgba(0,0,0,0.25)"
                : "0 2px 10px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: 880,
                "& .MuiTableCell-root": {
                  py: 1.25,
                  px: 2,
                  borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9",
                },
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: isDark ? "rgba(30, 41, 59, 0.85)" : "#F8FAFC",
                    "& .MuiTableCell-root": {
                      fontSize: "0.72rem",
                      fontWeight: 750,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "text.secondary",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    },
                  }}
                >
                  <TableCell>Employee</TableCell>
                  <TableCell>Annual CTC &amp; Gross</TableCell>
                  <TableCell>Effective Period</TableCell>
                  <TableCell>Salary Breakdown</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingSalaries.map((salary) => {
                  const nonZeroComponents = salary.components.filter((c) => c.value > 0);
                  const isSubmitted = salary.approvalStatus === "SUBMITTED";

                  return (
                    <TableRow
                      key={salary.id}
                      hover
                      sx={{
                        transition: "background-color 0.15s ease",
                        "&:hover": {
                          bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(248, 250, 252, 0.8)",
                        },
                      }}
                    >
                      {/* 1. Employee */}
                      <TableCell sx={{ minWidth: 150 }}>
                        <Typography variant="body2" fontWeight={750} sx={{ color: "text.primary", letterSpacing: "0.02em" }}>
                          {salary.employeeId}
                        </Typography>
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            mt: 0.35,
                            px: 0.8,
                            py: 0.15,
                            borderRadius: "4px",
                            bgcolor: isDark ? "rgba(11, 92, 171, 0.18)" : "rgba(11, 92, 171, 0.08)",
                            color: "primary.main",
                            fontSize: "0.68rem",
                            fontWeight: 650,
                            letterSpacing: "0.01em",
                          }}
                        >
                          {humanizeSource(salary.source)}
                        </Box>
                      </TableCell>

                      {/* 2. Annual CTC & Recurring Gross */}
                      <TableCell sx={{ minWidth: 170 }}>
                        <Typography variant="body2" fontWeight={750} sx={{ color: "text.primary" }}>
                          {currencyFormatter(salary.annualCtc)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.2 }}>
                          {currencyFormatter(salary.monthlyGross)} / month
                        </Typography>
                      </TableCell>

                      {/* 3. Effective Period */}
                      <TableCell sx={{ minWidth: 160 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: "text.primary", fontSize: "0.82rem" }}>
                          {dateFormatter(salary.effectiveFrom, "DD MMM YYYY")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.2 }}>
                          {salary.effectiveTo ? `through ${dateFormatter(salary.effectiveTo, "DD MMM YYYY")}` : "Open-ended (active)"}
                        </Typography>
                      </TableCell>

                      {/* 4. Components Breakdown */}
                      <TableCell sx={{ minWidth: 260 }}>
                        <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ maxWidth: 360 }}>
                          {nonZeroComponents.map((c) => (
                            <Box
                              key={c.componentCode}
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.4,
                                px: 0.85,
                                py: 0.2,
                                borderRadius: "5px",
                                bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9",
                                border: "1px solid",
                                borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                                fontSize: "0.72rem",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Typography component="span" sx={{ fontSize: "inherit", color: "text.secondary", fontWeight: 500 }}>
                                {c.componentName}:
                              </Typography>
                              <Typography component="span" sx={{ fontSize: "inherit", fontWeight: 700, color: "text.primary" }}>
                                {currencyFormatter(c.value)}
                              </Typography>
                            </Box>
                          ))}
                          {nonZeroComponents.length === 0 && (
                            <Typography variant="caption" color="text.secondary">
                              No component breakdown
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* 5. Status */}
                      <TableCell sx={{ minWidth: 120 }}>
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            px: 1,
                            py: 0.25,
                            borderRadius: "999px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            letterSpacing: "0.01em",
                            bgcolor: isSubmitted ? "#FEF3C7" : isDark ? "rgba(148, 163, 184, 0.12)" : "#F1F5F9",
                            color: isSubmitted ? "#92400E" : isDark ? "#94A3B8" : "#475569",
                            border: "1px solid",
                            borderColor: isSubmitted ? "#FDE68A" : isDark ? "rgba(148, 163, 184, 0.2)" : "#E2E8F0",
                          }}
                        >
                          {isSubmitted ? "Pending approval" : "Draft"}
                        </Box>
                      </TableCell>

                      {/* 6. Action */}
                      <TableCell align="right" sx={{ minWidth: 150 }}>
                        <Stack direction="row" spacing={0.85} justifyContent="flex-end" alignItems="center">
                          {canApprove && (
                            <Button
                              size="small"
                              variant="contained"
                              disabled={busy || pendingLoadFailed}
                              onClick={() => void updateApprovalState(salary, "approve")}
                              sx={{
                                minWidth: 68,
                                height: 28,
                                px: 1.5,
                                fontSize: "0.78rem",
                                fontWeight: 650,
                                textTransform: "none",
                                borderRadius: "6px",
                                boxShadow: "none",
                                "&:hover": { boxShadow: "none" },
                              }}
                            >
                              Approve
                            </Button>
                          )}
                          {!canApprove && canEdit && !isSubmitted && (
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={busy || pendingLoadFailed}
                              onClick={() => void updateApprovalState(salary, "submit")}
                              sx={{
                                height: 28,
                                px: 1.25,
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: "6px",
                              }}
                            >
                              Submit for approval
                            </Button>
                          )}
                          {(canEdit || canApprove) && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="inherit"
                              disabled={busy || pendingLoadFailed}
                              onClick={() => void updateApprovalState(salary, "reject")}
                              sx={{
                                minWidth: 60,
                                height: 28,
                                px: 1.25,
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: "6px",
                                borderColor: isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0",
                                color: "text.secondary",
                                "&:hover": {
                                  borderColor: "error.main",
                                  color: "error.main",
                                  bgcolor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
                                },
                              }}
                            >
                              Discard
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Stack>
  );
}
