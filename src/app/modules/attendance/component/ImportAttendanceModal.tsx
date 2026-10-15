import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Close from "@mui/icons-material/Close";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import Refresh from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import { AppSelect } from "../../../shared/components/ui";
import {
  downloadAttendanceImportTemplate,
  validateAttendanceImport,
  commitAttendanceImport,
} from "../AttendanceServices";
import {
  AttendanceImportValidationResult,
  AttendanceImportIssue,
} from "../AttendanceModels";

interface ImportAttendanceModalProps {
  open: boolean;
  handleClose: () => void;
  initialYear?: number;
  initialMonth?: number;
  onImportSuccess?: () => void;
}

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const ImportAttendanceModal: React.FC<ImportAttendanceModalProps> = ({
  open,
  handleClose,
  initialYear = new Date().getFullYear(),
  initialMonth = new Date().getMonth() + 1,
  onImportSuccess,
}) => {
  const [year, setYear] = useState<number>(initialYear);
  const [month, setMonth] = useState<number>(initialMonth);
  const [preserveApprovedLeaves, setPreserveApprovedLeaves] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<AttendanceImportValidationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setValidationResult(null);
    setIsDownloading(false);
    setIsValidating(false);
    setIsCommitting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onCloseModal = () => {
    resetState();
    handleClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      const response = await downloadAttendanceImportTemplate(year, month);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Attendance_Import_Template_${year}_${String(month).padStart(2, "0")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Dynamic attendance template downloaded successfully!");
    } catch (err: any) {
      console.error("Template download error:", err);
      toast.error(err?.response?.data?.message ?? "Failed to download attendance template.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx")) {
      toast.error("Please upload an Excel file (.xlsx)");
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);
  };

  const handleValidate = async () => {
    if (!file) {
      toast.error("Please select an Excel file to validate.");
      return;
    }

    try {
      setIsValidating(true);
      const res = await validateAttendanceImport(file, year, month, preserveApprovedLeaves);
      const resultData = res.data;
      setValidationResult(resultData);

      if (resultData.isValid) {
        toast.success(
          `Validation passed! ${resultData.validEntriesCount} cells across ${resultData.totalEmployees} employees verified.`
        );
      } else {
        toast.error(`Validation found ${resultData.errorCount} error(s). Please review below.`);
      }
    } catch (err: any) {
      console.error("Validation error:", err);
      toast.error(err?.response?.data?.message ?? "Failed to validate attendance file.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!file) return;

    try {
      setIsCommitting(true);
      const res = await commitAttendanceImport(file, year, month, preserveApprovedLeaves);
      const commitData = res.data;

      if (commitData.success) {
        toast.success(
          commitData.message ||
            `Successfully imported ${commitData.recordsUpserted} attendance records!`
        );
        onImportSuccess?.();
        onCloseModal();
      } else {
        toast.error(commitData.message || "Failed to import attendance.");
      }
    } catch (err: any) {
      console.error("Commit error:", err);
      toast.error(err?.response?.data?.message ?? "Failed to import attendance records.");
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCloseModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: "#FFFFFF",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.16)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2.5,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Import Monthly Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload attendance muster configured with company calendar, working days & policies.
          </Typography>
        </Box>
        <IconButton onClick={onCloseModal} size="small" sx={{ color: "#64748B" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Step 1: Period Selection & Template Download */}
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="#1E293B" mb={1.5}>
              1. Select Payroll Month & Download Dynamic Template
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
                <Box sx={{ width: 150 }}>
                  <Typography variant="caption" fontWeight={600} color="#475569" display="block" mb={0.5}>
                    Month
                  </Typography>
                  <AppSelect
                    value={month}
                    onChange={(e: any) => {
                      setMonth(Number(e.target.value));
                      setValidationResult(null);
                    }}
                    sx={{ height: 40, bgcolor: "#FFFFFF" }}
                  >
                    {months.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </AppSelect>
                </Box>

                <Box sx={{ width: 110 }}>
                  <Typography variant="caption" fontWeight={600} color="#475569" display="block" mb={0.5}>
                    Year
                  </Typography>
                  <AppSelect
                    value={year}
                    onChange={(e: any) => {
                      setYear(Number(e.target.value));
                      setValidationResult(null);
                    }}
                    sx={{ height: 40, bgcolor: "#FFFFFF" }}
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </AppSelect>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                startIcon={isDownloading ? <CircularProgress size={16} /> : <DownloadOutlined />}
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                sx={{
                  height: 40,
                  borderRadius: "9px",
                  fontWeight: 700,
                  color: "#0B5CAB",
                  borderColor: "#0B5CAB",
                  whiteSpace: "nowrap",
                  alignSelf: { xs: "stretch", sm: "flex-end" },
                  "&:hover": { bgcolor: "#EBF3FA", borderColor: "#0B5CAB" },
                }}
              >
                {isDownloading ? "Generating..." : "Download Template"}
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              💡 Template is dynamically pre-filled with all active employees, company holidays (H), weekly offs (WO), and dropdown statuses.
            </Typography>
          </Box>

          {/* Step 2: File Upload Dropzone */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#1E293B" mb={1}>
              2. Upload Completed Excel Sheet
            </Typography>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx"
              style={{ display: "none" }}
            />

            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                p: 3,
                border: "2px dashed #CBD5E1",
                borderRadius: "12px",
                bgcolor: file ? "#F0FDF4" : "#F8FAFC",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#0B5CAB",
                  bgcolor: file ? "#F0FDF4" : "#F1F5F9",
                },
              }}
            >
              {file ? (
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  <InsertDriveFileOutlined sx={{ fontSize: 32, color: "#16A34A" }} />
                  <Box sx={{ textAlign: "left" }}>
                    <Typography fontWeight={700} color="#0F172A">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB · Click to change file
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Stack spacing={1} alignItems="center">
                  <CloudUploadOutlined sx={{ fontSize: 40, color: "#0B5CAB" }} />
                  <Typography fontWeight={700} color="#1E293B">
                    Click to browse or drag & drop attendance Excel file (.xlsx)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports Microsoft Excel OpenXML Spreadsheet (.xlsx)
                  </Typography>
                </Stack>
              )}
            </Box>

            <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={preserveApprovedLeaves}
                    onChange={(e) => setPreserveApprovedLeaves(e.target.checked)}
                    size="small"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="#334155" fontWeight={600}>
                    Preserve approved leaves (recommended)
                  </Typography>
                }
              />

              {file && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleValidate}
                  disabled={isValidating}
                  startIcon={isValidating ? <CircularProgress size={14} /> : <CheckCircleOutline />}
                  sx={{
                    borderRadius: "8px",
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                >
                  {isValidating ? "Validating..." : "Pre-flight Validate"}
                </Button>
              )}
            </Box>
          </Box>

          {/* Step 3: Validation Preview & Results */}
          {validationResult && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#1E293B" mb={1}>
                3. Pre-flight Validation Report
              </Typography>

              {validationResult.isValid ? (
                <Alert
                  severity="success"
                  icon={<CheckCircleOutline fontSize="inherit" />}
                  sx={{ borderRadius: "10px", mb: 2 }}
                >
                  <Typography fontWeight={700}>Excel file is verified and ready for import!</Typography>
                  <Typography variant="body2">
                    Verified {validationResult.validEntriesCount} attendance records for{" "}
                    {validationResult.totalEmployees} employees across {validationResult.totalDaysInMonth} days.
                    {validationResult.preservedLeavesCount > 0 &&
                      ` (${validationResult.preservedLeavesCount} approved leave days will be preserved).`}
                  </Typography>
                </Alert>
              ) : (
                <Alert
                  severity="error"
                  icon={<ErrorOutline fontSize="inherit" />}
                  sx={{ borderRadius: "10px", mb: 2 }}
                >
                  <Typography fontWeight={700}>
                    Validation failed with {validationResult.errorCount} blocking error(s).
                  </Typography>
                  <Typography variant="body2">
                    Please correct the highlighted issues in your Excel file and re-upload.
                  </Typography>
                </Alert>
              )}

              {/* Issues Grid */}
              {validationResult.issues.length > 0 && (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    maxHeight: 220,
                    borderRadius: "10px",
                    borderColor: "#E2E8F0",
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#F8FAFC" }}>Row</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#F8FAFC" }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#F8FAFC" }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#F8FAFC" }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#F8FAFC" }}>Issue Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validationResult.issues.map((issue, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontSize: 13 }}>{issue.rowNumber || "–"}</TableCell>
                          <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                            {issue.employeeId ? `${issue.employeeId} (${issue.employeeName ?? ""})` : "–"}
                          </TableCell>
                          <TableCell sx={{ fontSize: 13 }}>{issue.date || issue.columnHeader || "–"}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={issue.severity}
                              color={issue.severity === "Error" ? "error" : "warning"}
                              sx={{ fontWeight: 700, height: 22, fontSize: 11 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: 13 }}>{issue.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
        <Button onClick={onCloseModal} color="inherit" sx={{ fontWeight: 600 }}>
          Cancel
        </Button>

        <Stack direction="row" spacing={1.5}>
          {validationResult && !validationResult.isValid && (
            <Button
              variant="outlined"
              onClick={handleValidate}
              startIcon={<Refresh />}
              disabled={isValidating}
              sx={{ fontWeight: 700 }}
            >
              Re-validate
            </Button>
          )}

          <Button
            variant="contained"
            onClick={handleCommit}
            disabled={
              !file ||
              !validationResult ||
              !validationResult.isValid ||
              isCommitting ||
              isValidating
            }
            startIcon={isCommitting ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlined />}
            sx={{
              fontWeight: 700,
              bgcolor: "#0B5CAB",
              borderRadius: "9px",
              px: 3,
              "&:hover": { bgcolor: "#094a8a" },
            }}
          >
            {isCommitting ? "Importing..." : "Commit Attendance Import"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
export default ImportAttendanceModal;
