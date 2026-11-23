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
  alpha,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import { useIsDark } from "../../theme/useIsDark";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Close from "@mui/icons-material/Close";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import Refresh from "@mui/icons-material/Refresh";
import Fingerprint from "@mui/icons-material/Fingerprint";
import Sync from "@mui/icons-material/Sync";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { toast } from "react-toastify";
import { AppSelect } from "../../../shared/components/ui";
import {
  downloadAttendanceImportTemplate,
  validateAttendanceImport,
  commitAttendanceImport,
  syncBiometricPunches,
} from "../AttendanceServices";
import {
  AttendanceImportValidationResult,
  AttendanceImportIssue,
  BiometricPunchModel,
  BiometricSyncResult,
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
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [deviceId, setDeviceId] = useState<string>("BIO-DEVICE-01");
  const [terminalIp, setTerminalIp] = useState<string>("192.168.1.100");
  const [verifyMode, setVerifyMode] = useState<string>("AUTO");
  const [biometricPunches, setBiometricPunches] = useState<BiometricPunchModel[]>([]);
  const [isBiometricSyncing, setIsBiometricSyncing] = useState<boolean>(false);
  const [biometricSyncResult, setBiometricSyncResult] = useState<BiometricSyncResult | null>(null);
  const [manualEmpId, setManualEmpId] = useState<string>("");
  const [manualPunchType, setManualPunchType] = useState<string>("CHECK_IN");
  const isDark = useIsDark();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setValidationResult(null);
    setIsDownloading(false);
    setIsValidating(false);
    setIsCommitting(false);
    setBiometricSyncResult(null);
    setIsBiometricSyncing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLoadSamplePunches = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const morningPunch = `${dateStr}T09:30:00Z`;
    const eveningPunch = `${dateStr}T18:30:00Z`;
    const duplicatePunch = `${dateStr}T09:30:25Z`; // sub-60s duplicate to test deduplication
    setBiometricPunches([
      { deviceId, employeeId: "EMP001", timestampUtc: morningPunch, punchType: "CHECK_IN", verifyMode, terminalIp },
      { deviceId, employeeId: "EMP001", timestampUtc: duplicatePunch, punchType: "CHECK_IN", verifyMode, terminalIp },
      { deviceId, employeeId: "EMP001", timestampUtc: eveningPunch, punchType: "CHECK_OUT", verifyMode, terminalIp },
      { deviceId, employeeId: "EMP002", timestampUtc: morningPunch, punchType: "CHECK_IN", verifyMode, terminalIp },
      { deviceId, employeeId: "EMP002", timestampUtc: eveningPunch, punchType: "CHECK_OUT", verifyMode, terminalIp },
    ]);
    toast.success("Loaded 5 sample punches (including a 25s duplicate for deduplication test)");
  };

  const handleAddManualPunch = () => {
    if (!manualEmpId.trim()) {
      toast.error("Please enter an employee ID or code.");
      return;
    }
    const newPunch: BiometricPunchModel = {
      deviceId: deviceId || "BIO-DEVICE-01",
      employeeId: manualEmpId.trim().toUpperCase(),
      timestampUtc: new Date().toISOString(),
      punchType: manualPunchType,
      verifyMode,
      terminalIp,
    };
    setBiometricPunches((prev) => [...prev, newPunch]);
    setManualEmpId("");
    toast.success(`Added ${manualPunchType} punch for ${newPunch.employeeId}`);
  };

  const handleDeletePunch = (index: number) => {
    setBiometricPunches((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearPunches = () => {
    setBiometricPunches([]);
    setBiometricSyncResult(null);
  };

  const handleBiometricSync = async () => {
    if (biometricPunches.length === 0) {
      toast.error("Please add or load at least one punch to sync.");
      return;
    }
    try {
      setIsBiometricSyncing(true);
      const res = await syncBiometricPunches({
        deviceId: deviceId || "BIO-DEVICE-01",
        punches: biometricPunches,
      });
      const data = res.data;
      setBiometricSyncResult(data);
      if (data.success) {
        toast.success(data.message || `Successfully synced ${data.processedCount} punches!`);
        onImportSuccess?.();
      } else {
        toast.error(data.message || "Biometric sync completed with issues.");
      }
    } catch (err: any) {
      console.error("Biometric sync error:", err);
      toast.error(err?.response?.data?.message ?? "Failed to sync biometric punches.");
    } finally {
      setIsBiometricSyncing(false);
    }
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
          bgcolor: "background.paper",
          backgroundImage: "none",
          boxShadow: (theme) => theme.palette.mode === "dark"
            ? "0 20px 45px rgba(0, 0, 0, 0.5)"
            : "0 20px 45px rgba(15, 23, 42, 0.16)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Import Monthly Attendance & Biometric Sync
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload attendance muster or synchronize punches directly from biometric hardware devices.
          </Typography>
        </Box>
        <IconButton onClick={onCloseModal} size="small" sx={{ color: "text.secondary" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2.5 }}>
        <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)}>
          <Tab
            icon={<InsertDriveFileOutlined />}
            iconPosition="start"
            label="Excel Muster Import"
            sx={{ textTransform: "none", fontWeight: 700 }}
          />
          <Tab
            icon={<Fingerprint />}
            iconPosition="start"
            label="Biometric Hardware Punch Sync"
            sx={{ textTransform: "none", fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {tabIndex === 0 ? (
        <Stack spacing={3}>
          {/* Step 1: Period Selection & Template Download */}
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1.5}>
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
                  <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
                    Month
                  </Typography>
                  <AppSelect
                    value={month}
                    onChange={(e: any) => {
                      setMonth(Number(e.target.value));
                      setValidationResult(null);
                    }}
                    sx={{ height: 40, bgcolor: "background.paper" }}
                  >
                    {months.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </AppSelect>
                </Box>

                <Box sx={{ width: 110 }}>
                  <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
                    Year
                  </Typography>
                  <AppSelect
                    value={year}
                    onChange={(e: any) => {
                      setYear(Number(e.target.value));
                      setValidationResult(null);
                    }}
                    sx={{ height: 40, bgcolor: "background.paper" }}
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
                  color: "primary.main",
                  borderColor: "primary.main",
                  whiteSpace: "nowrap",
                  alignSelf: { xs: "stretch", sm: "flex-end" },
                  "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
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
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1}>
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
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: "12px",
                bgcolor: file
                  ? (isDark ? "rgba(22, 163, 74, 0.15)" : "#F0FDF4")
                  : (isDark ? "rgba(255, 255, 255, 0.03)" : "#F8FAFC"),
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: file
                    ? (isDark ? "rgba(22, 163, 74, 0.22)" : "#F0FDF4")
                    : (isDark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9"),
                },
              }}
            >
              {file ? (
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  <InsertDriveFileOutlined sx={{ fontSize: 32, color: "success.main" }} />
                  <Box sx={{ textAlign: "left" }}>
                    <Typography fontWeight={700} color="text.primary">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB · Click to change file
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Stack spacing={1} alignItems="center">
                  <CloudUploadOutlined sx={{ fontSize: 40, color: "primary.main" }} />
                  <Typography fontWeight={700} color="text.primary">
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
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
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
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1}>
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
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "action.hover", color: "text.primary" }}>Row</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "action.hover", color: "text.primary" }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "action.hover", color: "text.primary" }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "action.hover", color: "text.primary" }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "action.hover", color: "text.primary" }}>Issue Description</TableCell>
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
        ) : (
          <Stack spacing={2.5}>
            {/* Device Info & Settings */}
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1.5}>
                Hardware Device Connection & Verification Mode
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Terminal Device ID"
                  size="small"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Device IP Address"
                  size="small"
                  value={terminalIp}
                  onChange={(e) => setTerminalIp(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Box sx={{ flex: 1 }}>
                  <AppSelect
                    label="Verify Mode"
                    value={verifyMode}
                    onChange={(e: any) => setVerifyMode(e.target.value as string)}
                  >
                    <MenuItem value="AUTO">AUTO (Multi-Factor)</MenuItem>
                    <MenuItem value="FINGERPRINT">FINGERPRINT (Biometric)</MenuItem>
                    <MenuItem value="FACE">FACE (Facial Recognition)</MenuItem>
                    <MenuItem value="CARD">CARD (RFID Badge)</MenuItem>
                    <MenuItem value="PASSWORD">PASSWORD (PIN)</MenuItem>
                  </AppSelect>
                </Box>
              </Stack>
            </Box>

            {/* Quick Ingestion & Manual Punch Form */}
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  Ingest / Queue Punches for Synchronization
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleLoadSamplePunches}
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
                  >
                    Load Sample Punches
                  </Button>
                  {biometricPunches.length > 0 && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={handleClearPunches}
                      sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
                    >
                      Clear
                    </Button>
                  )}
                </Stack>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
                <TextField
                  label="Employee ID / Code"
                  placeholder="e.g. EMP001"
                  size="small"
                  value={manualEmpId}
                  onChange={(e) => setManualEmpId(e.target.value)}
                  sx={{ flex: 2 }}
                />
                <Box sx={{ flex: 1.5 }}>
                  <AppSelect
                    label="Punch Type"
                    value={manualPunchType}
                    onChange={(e: any) => setManualPunchType(e.target.value as string)}
                  >
                    <MenuItem value="CHECK_IN">CHECK_IN (Shift Start)</MenuItem>
                    <MenuItem value="CHECK_OUT">CHECK_OUT (Shift End)</MenuItem>
                    <MenuItem value="AUTO">AUTO (Auto-Detect)</MenuItem>
                  </AppSelect>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutline />}
                  onClick={handleAddManualPunch}
                  sx={{
                    height: 40,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    px: 2.5,
                  }}
                >
                  Add Punch
                </Button>
              </Stack>
            </Box>

            {/* Punches Queue Table */}
            {biometricPunches.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" mb={1} display="block">
                  QUEUED PUNCHES ({biometricPunches.length})
                </Typography>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ maxHeight: 220, borderRadius: "10px" }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Employee ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Device ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Punch Type</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Mode</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {biometricPunches.map((punch, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 600 }}>{punch.employeeId}</TableCell>
                          <TableCell>{punch.deviceId}</TableCell>
                          <TableCell>{new Date(punch.timestampUtc).toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={punch.punchType}
                              color={punch.punchType === "CHECK_IN" ? "success" : "info"}
                              sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                            />
                          </TableCell>
                          <TableCell>{punch.verifyMode}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" color="error" onClick={() => handleDeletePunch(idx)}>
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Sync Results & Metrics Dashboard */}
            {biometricSyncResult && (
              <Box sx={{ p: 2, borderRadius: "12px", border: "1px solid", borderColor: "divider" }}>
                <Alert
                  severity={biometricSyncResult.success ? "success" : "warning"}
                  sx={{ borderRadius: "10px", mb: 2 }}
                >
                  {biometricSyncResult.message}
                </Alert>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={`Total Received: ${biometricSyncResult.totalReceived}`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    label={`Processed: ${biometricSyncResult.processedCount}`}
                    color="success"
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    label={`Deduplicated: ${biometricSyncResult.duplicateCount}`}
                    color="warning"
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    label={`Unmatched Employees: ${biometricSyncResult.unmatchedEmployeeCount}`}
                    color="default"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>

                {biometricSyncResult.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="error.main" fontWeight={700}>
                      ERRORS ({biometricSyncResult.errors.length})
                    </Typography>
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      {biometricSyncResult.errors.map((err, i) => (
                        <Typography key={i} variant="caption" color="error.main" display="block">
                          • {err}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
        <Button onClick={onCloseModal} color="inherit" sx={{ fontWeight: 600 }}>
          Cancel
        </Button>

        {tabIndex === 0 ? (
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
                bgcolor: "primary.main",
                borderRadius: "9px",
                px: 3,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              {isCommitting ? "Importing..." : "Commit Attendance Import"}
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained"
            onClick={handleBiometricSync}
            disabled={biometricPunches.length === 0 || isBiometricSyncing}
            startIcon={isBiometricSyncing ? <CircularProgress size={16} color="inherit" /> : <Sync />}
            sx={{
              fontWeight: 700,
              bgcolor: "primary.main",
              borderRadius: "9px",
              px: 3,
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {isBiometricSyncing ? "Syncing..." : `Sync ${biometricPunches.length} Hardware Punches`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
export default ImportAttendanceModal;
