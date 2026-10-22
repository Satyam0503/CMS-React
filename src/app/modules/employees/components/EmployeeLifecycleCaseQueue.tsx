import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
} from "@mui/material";
import AssignmentLateOutlined from "@mui/icons-material/AssignmentLateOutlined";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DateRangeRounded from "@mui/icons-material/DateRangeRounded";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import HourglassEmptyRounded from "@mui/icons-material/HourglassEmptyRounded";
import LaunchRounded from "@mui/icons-material/LaunchRounded";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import UploadFileRounded from "@mui/icons-material/UploadFileRounded";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import SyncAltRounded from "@mui/icons-material/SyncAltRounded";
import RestartAltRounded from "@mui/icons-material/RestartAltRounded";
import { toast } from "react-toastify";
import { useIsDark } from "../../theme/useIsDark";
import {
  EmployeeLifecycleCase,
  EmployeeLifecycleCaseSummary,
  getEmployeeLifecycleCaseSummary,
  getEmployeeLifecycleCases,
  downloadEmployeeLifecycleCaseEvidence,
  updateEmployeeLifecycleCase,
  uploadEmployeeLifecycleCaseEvidence,
  verifyEmployeeLifecycleCaseEvidence,
} from "../employeeServices";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import { SearchInput } from "../../../shared/components/SearchInput";

const label = (value?: string) =>
  value ? value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ") : "";

const isGuid = (val?: string): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim()));

const cleanJobRole = (role?: string): string => {
  if (!role || isGuid(role)) return "Team Member";
  return role;
};

const cleanEmployeeId = (id?: string): string => {
  if (!id || isGuid(id)) return "";
  return id;
};

const formatDate = (val?: string): string => {
  if (!val) return "Not recorded";
  const d = dayjs(val);
  return d.isValid()
    ? d.format("DD MMM YYYY")
    : new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateRange = (start?: string, end?: string): string => {
  if (!start) return "Not recorded";
  const s = dayjs(start);
  if (!s.isValid()) return start;
  if (!end) return s.format("DD MMM YYYY");
  const e = dayjs(end);
  if (!e.isValid()) return s.format("DD MMM YYYY");
  if (s.year() === e.year()) {
    return `${s.format("DD MMM")} – ${e.format("DD MMM YYYY")}`;
  }
  return `${s.format("DD MMM YYYY")} – ${e.format("DD MMM YYYY")}`;
};

const getWorkflowStage = (status?: string): number => {
  switch (status?.toLowerCase()) {
    case "open":
    case "underreview":
      return 0;
    case "approved":
      return 1;
    case "active":
      return 2;
    case "extended":
      return 3;
    case "completed":
    case "resumedduty":
      return 4;
    case "closed":
      return 5;
    default:
      return 0;
  }
};

const evidenceIdOf = (evidence: {
  evidenceId?: string;
  evidenceID?: string;
  evidenceIdLegacy?: string;
  EvidenceId?: string;
  EvidenceID?: string;
  id?: string;
  _id?: string;
}) =>
  evidence.evidenceId ||
  evidence.evidenceID ||
  evidence.evidenceIdLegacy ||
  evidence.EvidenceId ||
  evidence.EvidenceID ||
  evidence.id ||
  evidence._id ||
  "";

export const EmployeeLifecycleCaseQueue = () => {
  const isDark = useIsDark();
  const [cases, setCases] = useState<EmployeeLifecycleCase[]>([]);
  const [selected, setSelected] = useState<EmployeeLifecycleCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [extensionDate, setExtensionDate] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [payrollStatus, setPayrollStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [transitionStatus, setTransitionStatus] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [summary, setSummary] = useState<EmployeeLifecycleCaseSummary | null>(null);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getEmployeeLifecycleCases(undefined, statusFilter || undefined, overdueOnly)
      .then(({ data }) => setCases(Array.isArray(data) ? data : []))
      .catch(() => {
        setCases([]);
        setError(true);
      })
      .finally(() => setLoading(false));
    getEmployeeLifecycleCaseSummary()
      .then(({ data }) => setSummary(data ?? null))
      .catch(() => setSummary(null));
  }, [statusFilter, overdueOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const empName = (item.employeeName || "").toLowerCase();
        const empCode = (item.employeeId || "").toLowerCase();
        const cId = (item.caseId || "").toLowerCase();
        const eventType = (item.lifecycleStatus || "").toLowerCase();
        if (
          !empName.includes(query) &&
          !empCode.includes(query) &&
          !cId.includes(query) &&
          !eventType.includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [cases, search]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, overdueOnly]);

  const paginatedCases = useMemo(() => {
    return filteredCases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCases, page, rowsPerPage]);

  const complete = async () => {
    if (!selected) return;
    try {
      const { data } = await updateEmployeeLifecycleCase({
        caseId: selected.caseId,
        status: "Completed",
        actualReturnDate: new Date().toISOString(),
        comment: "Return to work confirmed by HR",
      });
      setSelected(null);
      if (data) load();
      toast.success("Return to work recorded");
    } catch {
      toast.error("Unable to update lifecycle case");
    }
  };

  const upload = async (file?: File) => {
    if (!selected || !file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Evidence must be 10 MB or smaller");
      return;
    }
    try {
      const { data } = await uploadEmployeeLifecycleCaseEvidence(selected.caseId, file);
      toast.success("Evidence uploaded successfully");
      if (data) setSelected(data);
      load();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Unable to upload evidence");
    }
  };

  const verify = async (evidenceId: string, verified: boolean) => {
    if (!selected) return;
    try {
      const { data } = await verifyEmployeeLifecycleCaseEvidence({
        caseId: selected.caseId,
        evidenceId,
        verified,
      });
      if (data) setSelected(data);
      load();
      toast.success(verified ? "Evidence verified" : "Evidence rejected");
    } catch {
      toast.error("Unable to update evidence");
    }
  };

  const extend = async () => {
    if (!selected || !extensionDate) return;
    try {
      const { data } = await updateEmployeeLifecycleCase({
        caseId: selected.caseId,
        status: "Extended",
        expectedReturnDate: extensionDate,
        comment: "Expected return date extended by HR",
      });
      if (data) setSelected(data);
      setExtensionDate("");
      load();
      toast.success("Leave case extended");
    } catch {
      toast.error("Unable to extend case");
    }
  };

  const openEvidence = async (evidenceId: string, fileName: string, download = false) => {
    if (!selected || !evidenceId) {
      toast.error("Evidence identifier is missing. Refresh the case and try again.");
      return;
    }
    try {
      const { data } = await downloadEmployeeLifecycleCaseEvidence(selected.caseId, evidenceId);
      const url = URL.createObjectURL(data);
      if (download) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error("Unable to open evidence. Please try again.");
    }
  };

  const updateCaseControls = async () => {
    if (!selected || (!accountStatus && !payrollStatus)) return;
    try {
      const { data } = await updateEmployeeLifecycleCase({
        caseId: selected.caseId,
        status: selected.status,
        ...(accountStatus ? { accountStatus: accountStatus as "Active" | "TemporarilyDisabled" } : {}),
        ...(payrollStatus ? { payrollStatus: payrollStatus as "Active" | "Hold" | "Paused" } : {}),
        comment: "Case controls updated by HR",
      });
      if (data) setSelected(data);
      setAccountStatus("");
      setPayrollStatus("");
      load();
      toast.success("Case controls saved");
    } catch {
      toast.error("Unable to update case controls");
    }
  };

  const updateStatusTransition = async () => {
    if (!selected || !transitionStatus) return;
    try {
      const { data } = await updateEmployeeLifecycleCase({
        caseId: selected.caseId,
        status: transitionStatus,
        comment: `Case stage transitioned to ${transitionStatus} by HR`,
      });
      if (data) setSelected(data);
      setTransitionStatus("");
      load();
      toast.success(`Case transitioned to ${label(transitionStatus)}`);
    } catch {
      toast.error("Unable to transition case status");
    }
  };

  const isCancelled = selected?.status === "Cancelled";
  const hasEvidence = Boolean(selected?.evidence?.length);
  const hasPendingEvidence = Boolean(selected?.evidence?.some((item) => item.status === "PendingVerification"));
  const canConfirmReturn = Boolean(selected && !isCancelled && selected.documentsVerified && !hasPendingEvidence);

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2.25 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        bgcolor: "background.paper",
      }}
    >
      {/* Summary KPI Cards */}
      {summary && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: { xs: 1.25, sm: 1.5 },
            mb: 2.5,
          }}
        >
          {/* Active Cases */}
          <Card
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 1.75 },
              borderRadius: 2.5,
              bgcolor: (t) => alpha(t.palette.warning.main, 0.04),
              borderColor: (t) => alpha(t.palette.warning.main, 0.25),
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(237, 108, 2, 0.08)",
                borderColor: "warning.main",
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: { xs: 38, sm: 44 },
                  height: { xs: 38, sm: 44 },
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.warning.main, 0.12),
                  color: "warning.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AssignmentLateOutlined sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={750}
                  textTransform="uppercase"
                  sx={{
                    fontSize: { xs: "0.68rem", sm: "0.72rem" },
                    letterSpacing: "0.04em",
                    display: "block",
                    lineHeight: 1.2,
                  }}
                >
                  Active Cases
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={850}
                  color="warning.dark"
                  sx={{ mt: 0.25, fontSize: { xs: "1.35rem", sm: "1.65rem" }, lineHeight: 1.1 }}
                >
                  {summary.active}
                </Typography>
              </Box>
            </Stack>
          </Card>

          {/* Pending Documents */}
          <Card
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 1.75 },
              borderRadius: 2.5,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
              borderColor: (t) => alpha(t.palette.primary.main, 0.2),
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.08)",
                borderColor: "primary.main",
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: { xs: 38, sm: 44 },
                  height: { xs: 38, sm: 44 },
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <HourglassEmptyRounded sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={750}
                  textTransform="uppercase"
                  sx={{
                    fontSize: { xs: "0.68rem", sm: "0.72rem" },
                    letterSpacing: "0.04em",
                    display: "block",
                    lineHeight: 1.2,
                  }}
                >
                  Pending Documents
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={850}
                  color="text.primary"
                  sx={{ mt: 0.25, fontSize: { xs: "1.35rem", sm: "1.65rem" }, lineHeight: 1.1 }}
                >
                  {summary.pendingDocuments}
                </Typography>
              </Box>
            </Stack>
          </Card>

          {/* Overdue Returns */}
          <Card
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 1.75 },
              borderRadius: 2.5,
              bgcolor: (t) =>
                summary.overdueReturns
                  ? alpha(t.palette.error.main, 0.05)
                  : "background.paper",
              borderColor: (t) =>
                summary.overdueReturns
                  ? alpha(t.palette.error.main, 0.3)
                  : "divider",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: summary.overdueReturns
                  ? "0 4px 12px rgba(211, 47, 47, 0.1)"
                  : "0 2px 8px rgba(0,0,0,0.04)",
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: { xs: 38, sm: 44 },
                  height: { xs: 38, sm: 44 },
                  borderRadius: 2,
                  bgcolor: (t) =>
                    summary.overdueReturns
                      ? alpha(t.palette.error.main, 0.14)
                      : alpha(t.palette.text.secondary, 0.08),
                  color: summary.overdueReturns ? "error.main" : "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <WarningAmberRounded sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  color={summary.overdueReturns ? "error.main" : "text.secondary"}
                  fontWeight={750}
                  textTransform="uppercase"
                  sx={{
                    fontSize: { xs: "0.68rem", sm: "0.72rem" },
                    letterSpacing: "0.04em",
                    display: "block",
                    lineHeight: 1.2,
                  }}
                >
                  Overdue Returns
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={850}
                  color={summary.overdueReturns ? "error.main" : "text.primary"}
                  sx={{ mt: 0.25, fontSize: { xs: "1.35rem", sm: "1.65rem" }, lineHeight: 1.1 }}
                >
                  {summary.overdueReturns}
                </Typography>
              </Box>
            </Stack>
          </Card>

          {/* Upcoming Returns (30d) */}
          <Card
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 1.75 },
              borderRadius: 2.5,
              bgcolor: (t) => alpha(t.palette.info.main, 0.04),
              borderColor: (t) => alpha(t.palette.info.main, 0.2),
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(2, 136, 209, 0.08)",
                borderColor: "info.main",
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: { xs: 38, sm: 44 },
                  height: { xs: 38, sm: 44 },
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.info.main, 0.12),
                  color: "info.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <DateRangeRounded sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={750}
                  textTransform="uppercase"
                  sx={{
                    fontSize: { xs: "0.68rem", sm: "0.72rem" },
                    letterSpacing: "0.04em",
                    display: "block",
                    lineHeight: 1.2,
                  }}
                >
                  Upcoming Returns (30d)
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={850}
                  color="text.primary"
                  sx={{ mt: 0.25, fontSize: { xs: "1.35rem", sm: "1.65rem" }, lineHeight: 1.1 }}
                >
                  {summary.upcomingReturns}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Box>
      )}

      {/* Integrated Filter Toolbar - Responsive & Cohesive */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2.5,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.25,
            alignItems: "center",
            flex: { xs: "1 1 100%", md: "1 1 auto" },
          }}
        >
          <SearchInput
            search={search}
            setSearch={setSearch}
            placeholder="Search employee or case…"
            sx={{
              width: { xs: "100%", sm: 240, md: 260 },
              minWidth: { sm: 180 },
            }}
          />

          <FormControl
            size="small"
            sx={{
              width: { xs: "100%", sm: 165 },
              minWidth: { sm: 150 },
              "& .MuiOutlinedInput-root": {
                height: 40,
                borderRadius: "10px",
              },
            }}
          >
            <InputLabel id="case-status-filter-label">Case Status</InputLabel>
            <Select
              labelId="case-status-filter-label"
              label="Case Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {["Open", "UnderReview", "Active", "Extended", "Completed", "Cancelled"].map((val) => (
                <MenuItem key={val} value={val}>
                  {label(val)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant={overdueOnly ? "contained" : "outlined"}
            color={overdueOnly ? "error" : "inherit"}
            onClick={() => setOverdueOnly((prev) => !prev)}
            startIcon={<WarningAmberRounded sx={{ fontSize: 18 }} />}
            sx={{
              height: 40,
              borderRadius: "10px",
              whiteSpace: "nowrap",
              textTransform: "none",
              fontWeight: 650,
              fontSize: "0.84rem",
              px: 1.75,
              borderColor: overdueOnly ? undefined : (t) => alpha(t.palette.divider, 0.8),
              color: overdueOnly ? "#FFFFFF" : "text.primary",
              bgcolor: overdueOnly ? undefined : isDark ? "rgba(255, 255, 255, 0.04)" : "#FFFFFF",
              "&:hover": {
                borderColor: overdueOnly ? undefined : "primary.main",
                bgcolor: overdueOnly ? undefined : isDark ? "rgba(255, 255, 255, 0.08)" : "#F8FAFC",
              },
            }}
          >
            {overdueOnly ? "Overdue Only" : "Overdue Returns"}
          </Button>

          {(Boolean(search) || Boolean(statusFilter) || overdueOnly) && (
            <Button
              size="small"
              variant="text"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setOverdueOnly(false);
              }}
              startIcon={<RestartAltRounded sx={{ fontSize: 18 }} />}
              sx={{
                height: 40,
                textTransform: "none",
                fontWeight: 650,
                color: "text.secondary",
                borderRadius: "10px",
                whiteSpace: "nowrap",
                px: 1.25,
                "&:hover": { color: "primary.main" },
              }}
            >
              Clear
            </Button>
          )}
        </Box>

        <Chip
          size="small"
          color="default"
          label={
            loading
              ? "Loading…"
              : `${filteredCases.length} case${filteredCases.length === 1 ? "" : "s"}`
          }
          sx={{
            fontWeight: 750,
            height: 32,
            px: 1.25,
            fontSize: "0.8rem",
            color: "text.primary",
            bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
            alignSelf: { xs: "flex-start", sm: "center" },
            flexShrink: 0,
          }}
        />
      </Box>

      {/* Loading & Error States */}
      {loading && (
        <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
          <CircularProgress size={30} />
          <Typography variant="body2" color="text.secondary">
            Loading lifecycle cases…
          </Typography>
        </Stack>
      )}

      {error && !loading && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Lifecycle cases could not be loaded. Please refresh or try again later.
        </Alert>
      )}

      {/* Data Presentation */}
      {!loading && !error && (
        <>
          {filteredCases.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              {cases.length === 0
                ? "No lifecycle cases are currently recorded."
                : "No cases match the active search or filter criteria."}
            </Alert>
          ) : (
            <>
              {/* Tablet & Desktop Table View (sm screens and above) with Sticky Employee Column */}
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <TableContainer
                  tabIndex={0}
                  role="region"
                  aria-label="Employee lifecycle cases directory"
                  sx={{
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    maxHeight: 560,
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "thin",
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: (t) => alpha(t.palette.text.primary, 0.15),
                      borderRadius: 3,
                    },
                  }}
                >
                  <Table size="medium" stickyHeader sx={{ width: "100%", minWidth: 880 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          "& th": {
                            bgcolor: "action.hover",
                            fontWeight: 750,
                            color: "text.secondary",
                            py: 1.5,
                            fontSize: "0.78rem",
                            letterSpacing: "0.03em",
                            whiteSpace: "nowrap",
                          },
                        }}
                      >
                        {/* Sticky Column Header */}
                        <TableCell
                          sx={{
                            position: "sticky",
                            left: 0,
                            zIndex: 3,
                            bgcolor: "action.hover !important",
                            minWidth: 210,
                            borderRight: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          EMPLOYEE
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>CASE TYPE</TableCell>
                        <TableCell sx={{ minWidth: 80 }}>DURATION</TableCell>
                        <TableCell sx={{ minWidth: 180 }}>LEAVE PERIOD</TableCell>
                        <TableCell sx={{ minWidth: 130 }}>DOCUMENTS</TableCell>
                        <TableCell sx={{ minWidth: 110 }}>STATUS</TableCell>
                        <TableCell align="right" sx={{ minWidth: 105 }}>ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedCases.map((item) => {
                        const employeeName = item.employeeName || "Employee";
                        const employeeCode = cleanEmployeeId(item.employeeId) || item.employeeUserId?.slice(0, 8);
                        const profileUrl = item.employeeUserId ? `/employees/${item.employeeUserId}/about` : undefined;

                        return (
                          <TableRow
                            key={item.caseId}
                            hover
                            sx={{
                              cursor: "pointer",
                              transition: "background-color 0.15s ease",
                              "&:last-child td, &:last-child th": { borderBottom: 0 },
                            }}
                            onClick={() => setSelected(item)}
                          >
                            {/* Sticky Employee Column */}
                            <TableCell
                              sx={{
                                py: 1.5,
                                position: "sticky",
                                left: 0,
                                zIndex: 2,
                                bgcolor: "background.paper",
                                borderRight: "1px solid",
                                borderColor: "divider",
                                minWidth: 210,
                              }}
                            >
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar
                                  src={item.employeeProfileUrl}
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: "primary.main",
                                    fontSize: "0.85rem",
                                    fontWeight: 750,
                                    flexShrink: 0,
                                  }}
                                >
                                  {employeeName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                                    {profileUrl ? (
                                      <Typography
                                        component="a"
                                        href={profileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{
                                          fontWeight: 750,
                                          fontSize: "0.88rem",
                                          color: "text.primary",
                                          textDecoration: "none",
                                          "&:hover": { color: "primary.main", textDecoration: "underline" },
                                        }}
                                      >
                                        {employeeName}
                                      </Typography>
                                    ) : (
                                      <Typography fontWeight={750} fontSize="0.88rem">
                                        {employeeName}
                                      </Typography>
                                    )}
                                    {employeeCode && (
                                      <Chip
                                        size="small"
                                        label={employeeCode}
                                        sx={{
                                          height: 20,
                                          fontSize: "0.72rem",
                                          fontWeight: 750,
                                          color: "text.secondary",
                                          bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
                                          border: "1px solid",
                                          borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
                                          letterSpacing: "0.02em",
                                        }}
                                      />
                                    )}
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                    {cleanJobRole(item.employeeJobRole)}
                                    {item.employeeDepartmentName || item.employeeDepartment
                                      ? ` · ${item.employeeDepartmentName || item.employeeDepartment}`
                                      : ""}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>

                            {/* Case Type */}
                            <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                              <Chip
                                size="small"
                                label={label(item.lifecycleStatus)}
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: "0.75rem", height: 24, whiteSpace: "nowrap" }}
                              />
                            </TableCell>

                            {/* Duration */}
                            <TableCell sx={{ py: 1.5, fontWeight: 750, whiteSpace: "nowrap" }}>
                              {item.leaveTotalDays} {item.leaveTotalDays === 1 ? "day" : "days"}
                            </TableCell>

                            {/* Leave Period */}
                            <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                <DateRangeRounded sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.84rem", fontWeight: 650, whiteSpace: "nowrap" }}
                                >
                                  {formatDateRange(item.effectiveFromUtc, item.expectedReturnDate)}
                                </Typography>
                              </Stack>
                            </TableCell>

                            {/* Documents Status */}
                            <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                              <Chip
                                size="small"
                                icon={
                                  item.documentsVerified ? (
                                    <CheckCircleRounded sx={{ fontSize: "14px !important" }} />
                                  ) : (
                                    <HourglassEmptyRounded sx={{ fontSize: "14px !important" }} />
                                  )
                                }
                                label={item.documentsVerified ? "Docs Verified" : "Docs Pending"}
                                color={item.documentsVerified ? "success" : "default"}
                                variant="outlined"
                                sx={{ fontWeight: 700, height: 24, fontSize: "0.73rem", whiteSpace: "nowrap" }}
                              />
                            </TableCell>

                            {/* Case Status */}
                            <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                              <Chip
                                size="small"
                                label={item.isReturnOverdue ? "Overdue Return" : label(item.status)}
                                color={
                                  item.isReturnOverdue
                                    ? "error"
                                    : item.status === "Completed"
                                      ? "success"
                                      : item.status === "Active"
                                        ? "info"
                                        : "warning"
                                }
                                sx={{ fontWeight: 700, height: 24, whiteSpace: "nowrap" }}
                              />
                            </TableCell>

                            {/* Actions */}
                            <TableCell align="right" sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelected(item);
                                }}
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                  borderRadius: 1.75,
                                  py: 0.5,
                                  px: 1.5,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Card List View (xs screens only) */}
              <Stack spacing={1.5} sx={{ display: { xs: "flex", sm: "none" } }}>
                {paginatedCases.map((item) => {
                  const employeeName = item.employeeName || "Employee";
                  const employeeCode = cleanEmployeeId(item.employeeId) || item.employeeUserId?.slice(0, 8);
                  const profileUrl = item.employeeUserId ? `/employees/${item.employeeUserId}/about` : undefined;

                  return (
                    <Card
                      key={item.caseId}
                      variant="outlined"
                      onClick={() => setSelected(item)}
                      sx={{
                        p: 1.75,
                        borderRadius: 2.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:active": { bgcolor: "action.hover" },
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                      }}
                    >
                      {/* Mobile Card Header */}
                      <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                          <Avatar
                            src={item.employeeProfileUrl}
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor: "primary.main",
                              fontSize: "0.9rem",
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {employeeName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                              {profileUrl ? (
                                <Typography
                                  component="a"
                                  href={profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: "0.92rem",
                                    color: "text.primary",
                                    textDecoration: "none",
                                    "&:hover": { color: "primary.main", textDecoration: "underline" },
                                  }}
                                >
                                  {employeeName}
                                </Typography>
                              ) : (
                                <Typography fontWeight={800} fontSize="0.92rem">
                                  {employeeName}
                                </Typography>
                              )}
                              {employeeCode && (
                                <Chip
                                  size="small"
                                  label={employeeCode}
                                  sx={{
                                    height: 20,
                                    fontSize: "0.72rem",
                                    fontWeight: 750,
                                    color: "text.secondary",
                                    bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
                                    border: "1px solid",
                                    borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
                                    letterSpacing: "0.02em",
                                  }}
                                />
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" display="block" noWrap>
                              {cleanJobRole(item.employeeJobRole)}
                              {item.employeeDepartmentName || item.employeeDepartment
                                ? ` · ${item.employeeDepartmentName || item.employeeDepartment}`
                                : ""}
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip
                          size="small"
                          label={item.isReturnOverdue ? "Overdue Return" : label(item.status)}
                          color={
                            item.isReturnOverdue
                              ? "error"
                              : item.status === "Completed"
                                ? "success"
                                : item.status === "Active"
                                  ? "info"
                                  : "warning"
                          }
                          sx={{ fontWeight: 750, height: 24, fontSize: "0.72rem", flexShrink: 0 }}
                        />
                      </Stack>

                      <Divider sx={{ my: 1.25 }} />

                      {/* Middle: Case Type, Duration, Leave Period, Documents */}
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={0.75}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              size="small"
                              label={label(item.lifecycleStatus)}
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: "0.75rem", height: 24 }}
                            />
                            <Typography variant="body2" fontWeight={750} color="text.secondary">
                              {item.leaveTotalDays} {item.leaveTotalDays === 1 ? "day" : "days"}
                            </Typography>
                          </Stack>

                          <Chip
                            size="small"
                            icon={
                              item.documentsVerified ? (
                                <CheckCircleRounded sx={{ fontSize: "14px !important" }} />
                              ) : (
                                <HourglassEmptyRounded sx={{ fontSize: "14px !important" }} />
                              )
                            }
                            label={item.documentsVerified ? "Docs Verified" : "Docs Pending"}
                            color={item.documentsVerified ? "success" : "default"}
                            variant="outlined"
                            sx={{ fontWeight: 700, height: 24, fontSize: "0.72rem" }}
                          />
                        </Stack>

                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <DateRangeRounded sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "text.secondary", fontWeight: 650 }}>
                            {formatDateRange(item.effectiveFromUtc, item.expectedReturnDate)}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Footer: Action Button */}
                      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(item);
                          }}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            px: 1.5,
                          }}
                        >
                          View Details
                        </Button>
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>

              <TablePagination
                component="div"
                count={filteredCases.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  mt: 1.5,
                  "& .MuiTablePagination-toolbar": {
                    flexWrap: "wrap",
                    gap: 1,
                    px: { xs: 1, sm: 2 },
                  },
                }}
              />
            </>
          )}
        </>
      )}

      {/* Case Details Modal */}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="md"
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(15, 30, 38, .55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          },
        }}
        PaperProps={{
          sx: {
            width: "calc(100% - 32px)",
            maxWidth: 780,
            maxHeight: "calc(100dvh - 36px)",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
          },
        }}
      >
        {selected && (
          <>
            {/* Modal Title Header */}
            <DialogTitle
              sx={{
                px: { xs: 2.5, sm: 3 },
                py: 2,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AssignmentLateOutlined />
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="h6" fontWeight={850} color="text.primary" sx={{ letterSpacing: "-0.01em" }}>
                        Lifecycle Case: {selected.caseId || "Details"}
                      </Typography>
                      <Chip
                        size="small"
                        label={label(selected.lifecycleStatus)}
                        color="primary"
                        sx={{ fontWeight: 750, height: 22, fontSize: "0.75rem" }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Case Effective: {formatDate(selected.effectiveFromUtc)} · Lifecycle Governance
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setSelected(null)} size="small" aria-label="Close dialog">
                  <CloseRounded />
                </IconButton>
              </Stack>
            </DialogTitle>

            {/* Modal Content */}
            <DialogContent
              dividers
              sx={{
                px: { xs: 2.5, sm: 3 },
                py: { xs: 2.5, sm: 3 },
                bgcolor: (t) => alpha(t.palette.background.default, 0.4),
              }}
            >
              <Stack spacing={2.5}>
                {/* Clickable Employee Profile Card */}
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ sm: "center" }}
                    gap={1.5}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                      <Avatar
                        src={selected.employeeProfileUrl || undefined}
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: "primary.main",
                          fontWeight: 800,
                          fontSize: "1.2rem",
                          border: "2px solid",
                          borderColor: (t) => alpha(t.palette.primary.main, 0.2),
                          flexShrink: 0,
                        }}
                      >
                        {(selected.employeeName || "E").charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography
                            component="a"
                            href={
                              selected.employeeUserId
                                ? `/employees/${selected.employeeUserId}/about`
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              fontWeight: 850,
                              fontSize: "1.05rem",
                              color: "text.primary",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              "&:hover": { color: "primary.main", textDecoration: "underline" },
                            }}
                          >
                            {selected.employeeName || "Employee Details Unavailable"}
                          </Typography>
                          {cleanEmployeeId(selected.employeeId) && (
                            <Chip
                              size="small"
                              label={cleanEmployeeId(selected.employeeId)}
                              sx={{
                                height: 22,
                                fontWeight: 750,
                                fontSize: "0.75rem",
                                color: "text.secondary",
                                bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
                                border: "1px solid",
                                borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
                              }}
                            />
                          )}
                          <Chip
                            size="small"
                            label={selected.employeeEmploymentStatus || "Active"}
                            color="success"
                            variant="outlined"
                            sx={{ height: 22, fontWeight: 750, fontSize: "0.75rem" }}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                          {cleanJobRole(selected.employeeJobRole)} ·{" "}
                          {selected.employeeDepartmentName || selected.employeeDepartment || "Department not assigned"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Button
                      component="a"
                      href={
                        selected.employeeUserId
                          ? `/employees/${selected.employeeUserId}/about`
                          : undefined
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="small"
                      endIcon={<LaunchRounded fontSize="small" />}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 750,
                        px: 1.75,
                        whiteSpace: "nowrap",
                        alignSelf: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      View Full Profile
                    </Button>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Email Address
                        </Typography>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {selected.employeeEmail || "Not recorded"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Phone Number
                        </Typography>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {selected.employeePhoneNumber || "Not recorded"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonOutlineRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Case Owner
                        </Typography>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {selected.caseOwnerName || "Not assigned"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>

                {/* Workflow Stage Stepper */}
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "background.paper" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={750}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.04em", display: "block", mb: 1.5 }}
                  >
                    Workflow Stage Progression
                  </Typography>
                  <Stepper
                    activeStep={getWorkflowStage(selected.status)}
                    alternativeLabel
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontSize: { xs: "0.68rem", sm: "0.75rem" },
                        fontWeight: 650,
                        mt: 0.5,
                      },
                      "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {["Reviewing", "Approved", "Active Leave", "Extension Requested", "Resumed Duty", "Closed"].map(
                      (stage) => (
                        <Step key={stage}>
                          <StepLabel>{stage}</StepLabel>
                        </Step>
                      ),
                    )}
                  </Stepper>
                </Card>

                {/* Document Verification Notice Banner */}
                <Alert
                  severity={isCancelled ? "info" : selected.documentsVerified ? "success" : "warning"}
                  icon={
                    isCancelled ? undefined : selected.documentsVerified ? <FactCheckOutlined /> : undefined
                  }
                  sx={{ borderRadius: 2 }}
                >
                  {isCancelled
                    ? "This lifecycle case has been cancelled and is stored in read-only audit status."
                    : selected.documentsVerified
                      ? "All supporting leave documents have been verified. The employee is clear for duty resumption."
                      : hasPendingEvidence
                        ? "Supporting documents require HR review. Please verify or reject pending files before confirming duty resumption."
                        : "Upload the required medical or supporting certificates to initiate HR verification."}
                </Alert>

                {/* Case Dates & Leave Metrics Grid */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    gap: 1.5,
                  }}
                >
                  <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2, bgcolor: "background.paper" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Effective From
                    </Typography>
                    <Typography variant="h6" fontWeight={850} sx={{ mt: 0.25, fontSize: "1.05rem" }}>
                      {formatDate(selected.effectiveFromUtc)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Start of absence tenure
                    </Typography>
                  </Card>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      borderColor: selected.isReturnOverdue ? "error.main" : "divider",
                    }}
                  >
                    <Typography variant="caption" color={selected.isReturnOverdue ? "error.main" : "text.secondary"} fontWeight={700}>
                      Expected Return
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={850}
                      sx={{
                        mt: 0.25,
                        fontSize: "1.05rem",
                        color: selected.isReturnOverdue ? "error.main" : "text.primary",
                      }}
                    >
                      {selected.expectedReturnDate ? formatDate(selected.expectedReturnDate) : "Not recorded"}
                    </Typography>
                    <Typography variant="caption" color={selected.isReturnOverdue ? "error.main" : "text.secondary"}>
                      {selected.isReturnOverdue ? "Return date is overdue" : "Scheduled duty resumption"}
                    </Typography>
                  </Card>
                  <Card variant="outlined" sx={{ p: 1.75, borderRadius: 2, bgcolor: "background.paper" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Total Leave Duration
                    </Typography>
                    <Typography variant="h6" fontWeight={850} color="primary.main" sx={{ mt: 0.25, fontSize: "1.05rem" }}>
                      {selected.leaveTotalDays} {selected.leaveTotalDays === 1 ? "Day" : "Days"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reconciliation: {selected.leaveReconciliationStatus || "Reconciled"}
                    </Typography>
                  </Card>
                </Box>

                {/* Leave Reason Justification */}
                {selected.reason && (
                  <Card
                    variant="outlined"
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      bgcolor: (t) => alpha(t.palette.info.light, 0.05),
                      borderColor: (t) => alpha(t.palette.info.main, 0.2),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Leave Reason & Justification
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic", color: "text.primary" }}>
                      "{selected.reason}"
                    </Typography>
                  </Card>
                )}

                {/* Status Transition Controls */}
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "background.paper" }}>
                  <Typography variant="subtitle2" fontWeight={850} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SyncAltRounded fontSize="small" color="primary" />
                    Status Transition Controls
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, mt: 0.25 }}>
                    Adjust lifecycle stage or override account and payroll treatments for this employee tenure.
                  </Typography>

                  <Stack spacing={1.5}>
                    {/* Stage Transition Selector */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                      <FormControl size="small" fullWidth disabled={isCancelled || selected.status === "Completed"}>
                        <InputLabel>Next Lifecycle Stage</InputLabel>
                        <Select
                          label="Next Lifecycle Stage"
                          value={transitionStatus}
                          onChange={(e) => setTransitionStatus(e.target.value)}
                        >
                          <MenuItem value="">
                            <em>Select stage transition…</em>
                          </MenuItem>
                          {["UnderReview", "Active", "Extended", "Completed", "Cancelled"].map((st) => (
                            <MenuItem key={st} value={st}>
                              {label(st)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={isCancelled || selected.status === "Completed" || !transitionStatus}
                        onClick={() => void updateStatusTransition()}
                        sx={{ minHeight: 40, px: 2.5, whiteSpace: "nowrap", textTransform: "none", fontWeight: 700 }}
                      >
                        Change Status
                      </Button>
                    </Stack>

                    <Divider sx={{ my: 0.5 }} />

                    {/* Account & Payroll Policy Overrides */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <FormControl size="small" fullWidth disabled={isCancelled || selected.status === "Completed"}>
                        <InputLabel>Account Access</InputLabel>
                        <Select
                          label="Account Access"
                          value={accountStatus}
                          onChange={(e) => setAccountStatus(e.target.value)}
                        >
                          <MenuItem value="">
                            <em>Keep current ({selected.appliedAccountStatus || "Policy Default"})</em>
                          </MenuItem>
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="TemporarilyDisabled">Temporarily Disabled</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" fullWidth disabled={isCancelled || selected.status === "Completed"}>
                        <InputLabel>Payroll Handling</InputLabel>
                        <Select
                          label="Payroll Handling"
                          value={payrollStatus}
                          onChange={(e) => setPayrollStatus(e.target.value)}
                        >
                          <MenuItem value="">
                            <em>Keep current ({selected.appliedPayrollStatus || "Policy Default"})</em>
                          </MenuItem>
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="Hold">Hold for Review</MenuItem>
                          <MenuItem value="Paused">Paused</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ sm: "center" }}
                      gap={1}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Active overrides: account {selected.appliedAccountStatus ?? "policy default"} · payroll{" "}
                        {selected.appliedPayrollStatus ?? "policy default"}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={
                          isCancelled ||
                          selected.status === "Completed" ||
                          (!accountStatus && !payrollStatus)
                        }
                        onClick={() => void updateCaseControls()}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                      >
                        Save Policy Overrides
                      </Button>
                    </Stack>
                  </Stack>
                </Card>

                {/* Extension Request */}
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "background.paper" }}>
                  <Typography variant="subtitle2" fontWeight={850} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DateRangeRounded fontSize="small" color="primary" />
                    Extension Request
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, mt: 0.25 }}>
                    Extend the expected return-to-work date if medical or personal circumstances require additional tenure.
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
                    <CustomisedDatePicker
                      label="New Expected Return Date"
                      value={extensionDate ? dayjs(extensionDate) : null}
                      setValue={(value) =>
                        setExtensionDate(
                          value?.isValid() ? value.format("YYYY-MM-DD") : "",
                        )
                      }
                      minDate={dayjs().startOf("day")}
                      disabled={isCancelled || selected.status === "Completed"}
                      format="DD-MM-YYYY"
                      sx={{ flex: 1, "& .MuiFormControl-root": { width: "100%" } }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      disabled={isCancelled || selected.status === "Completed" || !extensionDate}
                      onClick={() => void extend()}
                      sx={{ minHeight: 40, px: 3, textTransform: "none", fontWeight: 750, borderRadius: 2 }}
                    >
                      Extend Leave
                    </Button>
                  </Stack>
                </Card>

                {/* Evidence Verification */}
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "background.paper" }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ sm: "center" }}
                    gap={1}
                    sx={{ mb: 1.5 }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={850} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <UploadFileRounded fontSize="small" color="primary" />
                        Evidence Verification
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Upload and verify medical certificates, doctor clearance, or official documentation.
                      </Typography>
                    </Box>
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      disabled={isCancelled}
                      startIcon={<UploadFileRounded />}
                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, whiteSpace: "nowrap" }}
                    >
                      Upload Evidence
                      <input
                        hidden
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(event) => {
                          void upload(event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />
                    </Button>
                  </Stack>

                  {selected.evidence?.length > 0 ? (
                    <Stack spacing={1}>
                      {selected.evidence.map((evidence) => {
                        const evId = evidenceIdOf(evidence);

                        return (
                          <Card
                            key={evId || evidence.fileName}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: (t) => alpha(t.palette.action.hover, 0.4),
                              borderColor: "divider",
                            }}
                          >
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              justifyContent="space-between"
                              alignItems={{ sm: "center" }}
                              gap={1}
                            >
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body2" fontWeight={750} sx={{ overflowWrap: "anywhere" }}>
                                  {evidence.fileName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {evidence.sizeBytes ? `${Math.round(evidence.sizeBytes / 1024)} KB · ` : ""}
                                  Uploaded {formatDate(evidence.uploadedAtUtc)} · Status:{" "}
                                  <Chip
                                    size="small"
                                    label={label(evidence.status)}
                                    color={
                                      evidence.status === "Verified"
                                        ? "success"
                                        : evidence.status === "Rejected"
                                          ? "error"
                                          : "warning"
                                    }
                                    sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                                  />
                                </Typography>
                              </Box>

                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {evidence.status === "PendingVerification" && (
                                  <>
                                    <Button
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                      disabled={!evId}
                                      onClick={() => void verify(evId, true)}
                                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                                    >
                                      Verify
                                    </Button>
                                    <Button
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                      disabled={!evId}
                                      onClick={() => void verify(evId, false)}
                                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<VisibilityOutlined fontSize="small" />}
                                  onClick={() => void openEvidence(evId, evidence.fileName)}
                                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<DownloadOutlined fontSize="small" />}
                                  onClick={() => void openEvidence(evId, evidence.fileName, true)}
                                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                                >
                                  Download
                                </Button>
                              </Stack>
                            </Stack>
                          </Card>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box
                      sx={{
                        p: 2,
                        textAlign: "center",
                        bgcolor: (t) => alpha(t.palette.action.hover, 0.25),
                        borderRadius: 2,
                        border: "1px dashed",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No supporting evidence uploaded yet. Accepted formats: PDF, PNG, JPG (up to 10 MB).
                      </Typography>
                    </Box>
                  )}
                </Card>

                {/* Case Activity Timeline */}
                {selected.events && selected.events.length > 0 && (
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "background.paper" }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={750}
                      sx={{ textTransform: "uppercase", letterSpacing: "0.04em", display: "block", mb: 1.5 }}
                    >
                      Case Audit History
                    </Typography>
                    <Stack spacing={1.5}>
                      {selected.events
                        .slice()
                        .reverse()
                        .map((evt, idx) => (
                          <Box
                            key={`${evt.occurredAtUtc}-${idx}`}
                            sx={{
                              borderLeft: 3,
                              borderColor: "primary.light",
                              pl: 1.5,
                              py: 0.25,
                            }}
                          >
                            <Typography variant="body2" fontWeight={750}>
                              {label(evt.eventType)}
                              {evt.fromStatus && evt.toStatus ? (
                                <Typography component="span" variant="body2" color="text.secondary">
                                  {" "}
                                  ({label(evt.fromStatus)} → {label(evt.toStatus)})
                                </Typography>
                              ) : null}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(evt.occurredAtUtc)}
                              {evt.comment ? ` · "${evt.comment}"` : ""}
                            </Typography>
                          </Box>
                        ))}
                    </Stack>
                  </Card>
                )}
              </Stack>
            </DialogContent>

            {/* Modal Actions Footer */}
            <DialogActions
              sx={{
                px: { xs: 2.5, sm: 3 },
                py: 2,
                gap: 1.5,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                justifyContent: "space-between",
              }}
            >
              <Button
                onClick={() => setSelected(null)}
                variant="outlined"
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                Close Case Window
              </Button>

              <Stack direction="row" spacing={1}>
                {selected.status !== "Completed" && !isCancelled && (
                  <Button
                    variant="contained"
                    disabled={!canConfirmReturn}
                    onClick={complete}
                    startIcon={<CheckCircleRounded />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 750,
                      px: 2.5,
                      boxShadow: "none",
                    }}
                  >
                    Confirm Duty Resumption
                  </Button>
                )}
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
};
