import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
  Divider,
  alpha,
} from "@mui/material";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import Close from "@mui/icons-material/Close";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import { toast } from "react-toastify";
import { AppSelect } from "../../../shared/components/ui";
import { exportMonthlyAttendance } from "../AttendanceServices";
import dayjs from "dayjs";

export interface DepartmentOption {
  departmentId: string;
  name: string;
}

interface ExportAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  year: number;
  month: number; // 1-12
  initialSearch?: string;
  initialDepartmentId?: string;
  departments?: DepartmentOption[];
}

export const ExportAttendanceModal: React.FC<ExportAttendanceModalProps> = ({
  open,
  onClose,
  year: defaultYear,
  month: defaultMonth,
  initialSearch = "",
  initialDepartmentId = "",
  departments = [],
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [statusFilter, setStatusFilter] = useState<string>("Employed");
  const [departmentId, setDepartmentId] = useState<string>(initialDepartmentId);
  const [search, setSearch] = useState<string>(initialSearch);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setSelectedYear(defaultYear);
      setSelectedMonth(defaultMonth);
      setSearch(initialSearch);
      setDepartmentId(initialDepartmentId);
      setStatusFilter("Employed");
    }
  }, [open, defaultYear, defaultMonth, initialSearch, initialDepartmentId]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const isEmployedOnly = statusFilter === "Employed";
      const actualStatusFilter = statusFilter === "Employed" ? undefined : statusFilter;

      const response = await exportMonthlyAttendance({
        year: selectedYear,
        month: selectedMonth,
        departmentId: departmentId || undefined,
        search: search.trim() || undefined,
        employmentStatus: actualStatusFilter,
        onlyEmployed: isEmployedOnly,
      });

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      const monthStr = selectedMonth.toString().padStart(2, "0");
      link.download = `attendance-report-${selectedYear}-${monthStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Attendance report downloaded successfully.");
      onClose();
    } catch (error) {
      console.error("Unable to export monthly attendance report", error);
      toast.error("Unable to download attendance report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const monthOptions = [
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

  const currentYear = dayjs().year();
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <Dialog
      open={open}
      onClose={() => !isExporting && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.25)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1,
              borderRadius: "10px",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              display: "flex",
            }}
          >
            <DescriptionOutlined />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={750} sx={{ lineHeight: 1.2 }}>
              Export Attendance Muster
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Download monthly attendance register with department, designation & summaries
            </Typography>
          </Box>
        </Stack>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={isExporting}
          sx={{ color: "text.secondary" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Month & Year Selection */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.75, display: "block" }}>
              Report Period
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Box sx={{ flex: 2 }}>
                <AppSelect
                  value={selectedMonth}
                  onChange={(e: any) => setSelectedMonth(Number(e.target.value))}
                  sx={{ height: 40, borderRadius: "10px" }}
                >
                  {monthOptions.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </AppSelect>
              </Box>
              <Box sx={{ flex: 1 }}>
                <AppSelect
                  value={selectedYear}
                  onChange={(e: any) => setSelectedYear(Number(e.target.value))}
                  sx={{ height: 40, borderRadius: "10px" }}
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </AppSelect>
              </Box>
            </Stack>
          </Box>

          {/* Employee Status Filter */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Employee Eligibility
              </Typography>
              <Typography variant="caption" color="primary.main" fontWeight={600}>
                {statusFilter === "Employed" ? "Excludes former / exited staff" : ""}
              </Typography>
            </Stack>
            <AppSelect
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              sx={{ height: 40, borderRadius: "10px" }}
            >
              <MenuItem value="Employed">
                <Box>
                  <Typography variant="body2" fontWeight={650}>
                    Employed Only (Active & Notice Period) — Recommended
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Excludes resigned, terminated, retired, and future joiners
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="Active">
                <Box>
                  <Typography variant="body2" fontWeight={600}>Active Staff Only</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="NoticePeriod">
                <Box>
                  <Typography variant="body2" fontWeight={600}>Notice Period Staff Only</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="All">
                <Box>
                  <Typography variant="body2" fontWeight={600}>All Staff (Including Former & Resigned)</Typography>
                  <Typography variant="caption" color="text.secondary">Full historical record</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="Resigned">
                <Box>
                  <Typography variant="body2" fontWeight={600}>Resigned & Terminated Staff Only</Typography>
                </Box>
              </MenuItem>
            </AppSelect>
          </Box>

          {/* Department Filter */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.75, display: "block" }}>
              Department
            </Typography>
            <AppSelect
              displayEmpty
              value={departmentId}
              onChange={(e: any) => setDepartmentId(e.target.value)}
              renderValue={(val: unknown) => {
                if (!val) return "All Departments";
                const match = departments.find((d) => d.departmentId === val);
                return match?.name ?? "Selected Department";
              }}
              sx={{ height: 40, borderRadius: "10px" }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.departmentId} value={dept.departmentId}>
                  {dept.name}
                </MenuItem>
              ))}
            </AppSelect>
          </Box>

          {/* Search Filter */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.75, display: "block" }}>
              Filter by Employee Name or ID (Optional)
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. Aarav Sharma or EMP-001"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  borderRadius: "10px",
                },
              }}
            />
          </Box>

          {/* Information Banner */}
          <Alert
            severity="info"
            icon={<FilterListOutlined fontSize="small" />}
            sx={{
              borderRadius: "10px",
              py: 0.75,
              "& .MuiAlert-message": { fontSize: "0.8125rem", lineHeight: 1.4 },
            }}
          >
            The export includes <strong>Employee ID</strong>, <strong>Name</strong>, <strong>Department</strong>, <strong>Designation</strong>, clean daily muster without internal logs, and month-end summaries (Present, Half Day, Absent, Leave, Weekly Off, Holiday, and Total Paid Days).
          </Alert>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isExporting}
          sx={{ borderRadius: "10px", fontWeight: 650, px: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={18} color="inherit" /> : <DownloadOutlined />}
          onClick={handleExport}
          disabled={isExporting}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            bgcolor: "#0B5CAB",
            "&:hover": { bgcolor: "#094a8a" },
            px: 2.5,
          }}
        >
          {isExporting ? "Generating..." : "Download Excel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

