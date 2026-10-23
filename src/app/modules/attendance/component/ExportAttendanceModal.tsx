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
  CircularProgress,
  TextField,
  Divider,
  Grid,
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
          borderRadius: "16px",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.2)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pt: 2.5,
          pb: 1.5,
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
            <DescriptionOutlined fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={750} sx={{ lineHeight: 1.25, fontSize: "1.1rem" }}>
              Export Attendance Muster
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              Download monthly attendance register (.xlsx)
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
          <Grid container spacing={2}>
            {/* Report Period */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ mb: 0.75, display: "block", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" }}
              >
                Report Period
              </Typography>
              <Stack direction="row" spacing={1}>
                <Box sx={{ flex: 1.4 }}>
                  <AppSelect
                    value={selectedMonth}
                    onChange={(e: any) => setSelectedMonth(Number(e.target.value))}
                    sx={{ height: 40, borderRadius: "10px", fontSize: "0.875rem" }}
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
                    sx={{ height: 40, borderRadius: "10px", fontSize: "0.875rem" }}
                  >
                    {yearOptions.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </AppSelect>
                </Box>
              </Stack>
            </Grid>

            {/* Employee Eligibility */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ mb: 0.75, display: "block", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" }}
              >
                Staff Eligibility
              </Typography>
              <AppSelect
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                sx={{ height: 40, borderRadius: "10px", fontSize: "0.875rem" }}
              >
                <MenuItem value="Employed">Employed Only (Active & Notice)</MenuItem>
                <MenuItem value="Active">Active Staff Only</MenuItem>
                <MenuItem value="NoticePeriod">Notice Period Only</MenuItem>
                <MenuItem value="All">All Staff (Include Exited)</MenuItem>
                <MenuItem value="Resigned">Exited / Resigned Only</MenuItem>
              </AppSelect>
            </Grid>

            {/* Department */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ mb: 0.75, display: "block", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" }}
              >
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
                sx={{ height: 40, borderRadius: "10px", fontSize: "0.875rem" }}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.departmentId} value={dept.departmentId}>
                    {dept.name}
                  </MenuItem>
                ))}
              </AppSelect>
            </Grid>

            {/* Search by Employee */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ mb: 0.75, display: "block", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.72rem" }}
              >
                Employee (Optional)
              </Typography>
              <TextField
                size="small"
                fullWidth
                placeholder="Search name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 40,
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Minimal info note */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.75,
              py: 1.25,
              borderRadius: "10px",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <FilterListOutlined sx={{ fontSize: 18, color: "primary.main", flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.8rem", lineHeight: 1.4 }}>
              Includes daily punch records, department, designation, and month-end paid day summaries.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isExporting}
          sx={{ borderRadius: "10px", fontWeight: 650, px: 2.5 }}
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
