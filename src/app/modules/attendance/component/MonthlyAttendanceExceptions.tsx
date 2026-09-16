import {
  useCallback,
  useEffect,
  useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Card,
  Alert,
  Chip,
  Collapse,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { getRequest, patchRequest, postRequest } from "../../../../server/axios";
import { ResponseData } from "../../../../utils/common_types";

import { AppButton, AppTextField } from "../../../shared/components/ui";
import { CustomisedModal } from "../../../shared/components/C_Modal";
type PayrollException = {
  id: string;
  userId: string;
  employeeId: string;
  employeeName?: string;
  exceptionType?: string;
  affectedDates?: string[];
  lhdCount: number;
  edCount: number;
  combinedOccurrenceCount: number;
  exceededOccurrenceCount: number;
  status: string;
  version: number;
  severity?: string;
  reason?: string;
  resolution?: string;
  attendanceDate?: string;
  existingAttendanceId?: string;
  existingStatus?: string;
  leaveRequestId?: string;
  requestedLeaveStatus?: string;
  sourceVersion?: number;
};

type AttendanceStatusOption = { code: string; name: string; requiresTime: boolean };
type ExistingAttendance = { status?: string; checkInTime?: string | null; checkOutTime?: string | null; sourceType?: string | null; sourceId?: string | null };
type AttendanceResolution = {
  item: PayrollException;
  date: string;
  status: string;
  checkInTime: string;
  checkOutTime: string;
  reason: string;
};

interface Props {
  month: Dayjs;
}

const exceptionDescription = (item: PayrollException) => {
  if (!item.exceptionType || item.exceptionType === "LHD_ED_LIMIT_EXCEEDED") {
    return `LHD ${item.lhdCount} + ED ${item.edCount} = ${item.combinedOccurrenceCount}; exceeded ${item.exceededOccurrenceCount}`;
  }

  const name = item.exceptionType.replace(/_/g, " ").toLowerCase();
  return `${name} (${item.affectedDates?.length ?? 0} affected date(s))`;
};
type PenaltyReviewModal = {
  item?: PayrollException;
  decision: string;
  reason: string;
};

const exceptionStatusColor = (status: string): "default" | "warning" | "success" | "error" | "info" => {
  switch (status) {
    case "RESOLVED": return "success";
    case "PENDING_REVIEW": return "warning";
    case "OPEN": return "error";
    case "WAIVED":
    case "DEDUCTION_APPROVED": return "info";
    default: return "default";
  }
};

const checkInPresets = ["09:00", "09:30", "10:00", "10:30"];
const checkOutPresets = ["17:00", "17:30", "18:00", "18:30", "19:00"];
const monthlyExceptionsExpandedStorageKey = "codeji.attendance.monthly-exceptions-expanded";
const isValidTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
const formatTimeLabel = (value: string) => dayjs(`2000-01-01T${value}`).format("h:mm A");

export default function MonthlyAttendanceExceptions({ month }: Props) {
  const [items, setItems] = useState<PayrollException[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(monthlyExceptionsExpandedStorageKey) === "true";
    } catch {
      return false;
    }
  });
  const [bulkDecision, setBulkDecision] = useState("");
  const [wfhException, setWfhException] = useState<PayrollException | null>(null);
  const [leaveException, setLeaveException] = useState<{ item: PayrollException; sourceId: string } | null>(null);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [savingCorrection, setSavingCorrection] = useState(false);
  const [wfhCorrectionError, setWfhCorrectionError] = useState("");
  const [overrideException, setOverrideException] = useState<PayrollException | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [statusOptions, setStatusOptions] = useState<AttendanceStatusOption[]>([]);
  const [attendanceResolution, setAttendanceResolution] = useState<AttendanceResolution | null>(null);
  const [savingResolution, setSavingResolution] = useState(false);
  const [attendanceResolutionError, setAttendanceResolutionError] = useState("");
  const [attendanceTimeError, setAttendanceTimeError] = useState("");
  const [penaltyReview, setPenaltyReview] = useState<PenaltyReviewModal | null>(null);
  const [sourceConflict, setSourceConflict] = useState<{ item: PayrollException; sourceType?: string; sourceId?: string | null } | null>(null);
  const [sourceConflictRemarks, setSourceConflictRemarks] = useState("");

  useEffect(() => {
    getRequest<ResponseData<AttendanceStatusOption>>("api/attendance-status-settings?activeOnly=true")
      .then(({ data }) => setStatusOptions(data.methodResults ?? []))
      .catch(() => toast.error("Unable to load attendance status options."));
  }, []);

  const load = useCallback(async (recalculate = false) => {
    setLoading(true);
    try {
      const payrollMonth = month.startOf("month").format("YYYY-MM-DD");
      if (recalculate) {
        await postRequest("api/attendance/penalty/exceptions/recalculate", { payrollMonth });
      }
      const { data } = await postRequest<
        { payrollMonth: string; pageNo: number; pageSize: number; status?: string },
        ResponseData<PayrollException>
      >("api/attendance/penalty/exceptions/search", {
        payrollMonth,
        pageNo: page + 1,
        pageSize: rowsPerPage,
        status: status || undefined,
      });
      setItems(data.methodResults ?? []);
      setTotal(data.totalRecords ?? 0);
    } catch {
      toast.error("Unable to load attendance exceptions for the selected month.");
    } finally {
      setLoading(false);
    }
  }, [month, page, rowsPerPage, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const review = async (item: PayrollException, decision: string, reason: string) => {
    try {
      const { data } = await patchRequest<
        { decision: string; reason: string; version: number },
        { success: boolean; message: string }
      >(`api/attendance/penalty/exceptions/${item.id}/review`, {
        decision,
        reason,
        version: item.version,
      });
      if (data.success) {
        toast.success("Exception reviewed.");
      } else {
        toast.error(data.message);
      }
      await load();
    } catch {
      toast.error("Unable to review the exception.");
    }
  };

  const resolveAllFixed = async () => {
    await load(true);
    toast.success("Attendance was rechecked. Corrected issues are now resolved.");
  };

  const reviewAllPenaltyExceptions = async (decision: string, reason: string) => {
    setLoading(true);
    try {
      const payrollMonth = month.startOf("month").format("YYYY-MM-DD");
      const { data } = await postRequest<
        { payrollMonth: string; pageNo: number; pageSize: number; status: string },
        ResponseData<PayrollException>
      >("api/attendance/penalty/exceptions/search", {
        payrollMonth,
        pageNo: 1,
        pageSize: 500,
        status: "PENDING_REVIEW",
      });
      const penalties = (data.methodResults ?? []).filter(
        (item) => item.exceptionType === "LHD_ED_LIMIT_EXCEEDED",
      );
      for (const item of penalties) {
        await patchRequest(
          `api/attendance/penalty/exceptions/${item.id}/review`,
          { decision, reason, version: item.version },
        );
      }
      setBulkDecision("");
      await load(true);
      toast.success(`${penalties.length} penalty exception(s) reviewed.`);
    } catch {
      toast.error("Unable to review all penalty exceptions. Refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitPenaltyReview = async () => {
    if (!penaltyReview?.reason.trim()) {
      toast.error("A review reason is required.");
      return;
    }

    const { item, decision, reason } = penaltyReview;
    if (item) {
      await review(item, decision, reason.trim());
    } else {
      await reviewAllPenaltyExceptions(decision, reason.trim());
    }
    setPenaltyReview(null);
  };

  const timeFromAttendance = (value?: string | null) => value ? dayjs(value).format("HH:mm") : "";

  const openAttendanceResolution = async (item: PayrollException) => {
    const affectedDate = item.affectedDates?.[0];
    if (!affectedDate) {
      toast.error("No affected attendance date is available for this exception.");
      return;
    }
    const date = dayjs(affectedDate).format("YYYY-MM-DD");
    setAttendanceResolutionError("");
    setAttendanceTimeError("");
    try {
      const { data } = await getRequest<ExistingAttendance>(`api/admin/attendance/${item.userId}/date?date=${date}`);
      if (data.sourceType === "WFH_REQUEST" && item.exceptionType === "WFH_INSUFFICIENT_HOURS") {
        openWfhHoursCorrection(item);
        return;
      }
      if (data.sourceType === "WFH_REQUEST") {
        setSourceConflict({ item, sourceType: data.sourceType, sourceId: data.sourceId });
        setSourceConflictRemarks("");
        return;
      }
      if (data.sourceType === "LEAVE" && data.sourceId) {
        setLeaveException({ item, sourceId: data.sourceId });
        return;
      }
      setAttendanceResolution({ item, date, status: data.status ?? "A", checkInTime: timeFromAttendance(data.checkInTime), checkOutTime: timeFromAttendance(data.checkOutTime), reason: "" });
    } catch {
      // Missing attendance is the expected condition for this exception type.
      setAttendanceResolution({ item, date, status: "A", checkInTime: "", checkOutTime: "", reason: "" });
    }
  };

  const cancelLeaveAndResync = async () => {
    if (!leaveException) return;
    setSavingResolution(true);
    try {
      const { data } = await patchRequest<{ status: number; comment: string }, { success: boolean; message?: string }>(
        `api/LeaveManagement/LeaveRequest/${leaveException.sourceId}/Status`,
        { status: 4, comment: "Cancelled by HR/Admin to correct a source-owned attendance exception." },
      );
      if (!data.success) { toast.error(data.message || "The leave request could not be cancelled."); return; }
      toast.success("Leave request cancelled and attendance re-synchronised. Recheck the exception to continue its correction.");
      setLeaveException(null);
      await load(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "The leave request could not be cancelled.");
    } finally { setSavingResolution(false); }
  };

  const saveAttendanceResolution = async () => {
    if (!attendanceResolution || !attendanceResolution.status) {
      toast.error("Select an attendance status before saving the correction.");
      return;
    }
    if (attendanceResolution.reason.trim().length < 3) {
      setAttendanceResolutionError("Enter a correction reason of at least 3 characters.");
      return;
    }
    setAttendanceResolutionError("");
    const selectedStatus = statusOptions.find((status) => status.code === attendanceResolution.status);
    if (selectedStatus?.requiresTime && (!attendanceResolution.checkInTime || !attendanceResolution.checkOutTime)) {
      setAttendanceTimeError("Enter both punch in and punch out times.");
      return;
    }
    if (selectedStatus?.requiresTime && (!isValidTime(attendanceResolution.checkInTime) || !isValidTime(attendanceResolution.checkOutTime))) {
      setAttendanceTimeError("Use 24-hour time in HH:MM format, for example 09:00 or 18:30.");
      return;
    }
    setAttendanceTimeError("");
    setSavingResolution(true);
    try {
      const { data } = await postRequest<
        { attendanceDate: string; status: string; checkInTime?: string; checkOutTime?: string; reason: string; exceptionVersion: number },
        { success: boolean; message?: string; methodResult?: { isResolved?: boolean } }
      >(`api/attendance/penalty/exceptions/${attendanceResolution.item.id}/resolve-attendance`, {
        attendanceDate: attendanceResolution.date,
        status: attendanceResolution.status,
        checkInTime: attendanceResolution.checkInTime || undefined,
        checkOutTime: attendanceResolution.checkOutTime || undefined,
        reason: attendanceResolution.reason.trim(),
        exceptionVersion: attendanceResolution.item.version,
      });
      if (!data.success) { toast.error(data.message || "Attendance correction was rejected."); return; }
      toast.success(data.message || "Attendance corrected.");
      setAttendanceResolution(null);
      window.dispatchEvent(new Event("attendance-exception-resolved"));
      await load(true);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Attendance correction could not be saved. Check the selected status and times, then try again.";
      setAttendanceResolutionError(message);
      toast.error(message);
    } finally {
      setSavingResolution(false);
    }
  };

  const openWfhHoursCorrection = (item: PayrollException) => {
    const date = item.affectedDates?.[0];
    if (!date) {
      toast.error("No affected attendance date is available for this exception.");
      return;
    }
    const localDate = dayjs(date).format("YYYY-MM-DD");
    setCheckInTime(`${localDate}T09:00`);
    setCheckOutTime(`${localDate}T18:00`);
    setCorrectionReason("");
    setWfhCorrectionError("");
    setWfhException(item);
  };

  const saveWfhHoursCorrection = async () => {
    if (!wfhException || !checkInTime || !checkOutTime || !correctionReason.trim()) {
      toast.error("Punch in, punch out, and a correction reason are required.");
      return;
    }
    if (correctionReason.trim().length < 3) {
      const message = "Enter a correction reason of at least 3 characters.";
      setWfhCorrectionError(message);
      toast.error(message);
      return;
    }
    setSavingCorrection(true);
    try {
      const { data } = await patchRequest<
        { checkInTime: string; checkOutTime: string; remarks: string; exceptionVersion: number },
        { success: boolean; message: string; statusCode: number }
      >(`api/wfh/attendance-exceptions/${wfhException.id}/hours`, {
        checkInTime: new Date(checkInTime).toISOString(),
        checkOutTime: new Date(checkOutTime).toISOString(),
        remarks: correctionReason.trim(),
        exceptionVersion: wfhException.version,
      });
      if (!data.success) {
        const message = data.message || "WFH hours could not be corrected.";
        setWfhCorrectionError(message);
        toast.error(message);
        return;
      }
      toast.success(data.message || "WFH hours updated and exception resolved.");
      setWfhException(null);
      await load(true);
    } catch (error: any) {
      const response = error?.response?.data;
      const validationMessage = response?.errors
        ? Object.values(response.errors as Record<string, string[]>).flat().find(Boolean)
        : undefined;
      const message = response?.message || validationMessage || response?.title || `WFH correction failed (${error?.response?.status ?? "network error"}). The server did not return a detailed reason.`;
      setWfhCorrectionError(message);
      toast.error(message);
    } finally {
      setSavingCorrection(false);
    }
  };

  const overrideBlockingException = async () => {
    if (!overrideException || overrideReason.trim().length < 3) { toast.error("Enter an HR/Admin override reason of at least 3 characters."); return; }
    setSavingResolution(true);
    try {
      const { data } = await patchRequest<{ reason: string; exceptionVersion: number }, { success: boolean; message?: string }>(
        `api/attendance/penalty/exceptions/${overrideException.id}/override`, { reason: overrideReason.trim(), exceptionVersion: overrideException.version },
      );
      if (!data.success) { toast.error(data.message || "The override could not be saved."); return; }
      toast.success(data.message || "Exception overridden and payroll unblocked.");
      setOverrideException(null); setOverrideReason(""); await load(true);
    } catch (error: any) { toast.error(error?.response?.data?.message || "The override could not be saved."); }
    finally { setSavingResolution(false); }
  };

  const resolveSourceConflict = async (resolution: "KEEP_LEAVE_CANCEL_WFH" | "KEEP_WFH_CANCEL_LEAVE") => {
    if (!sourceConflict || sourceConflictRemarks.trim().length < 3) {
      toast.error("Enter a resolution reason of at least 3 characters.");
      return;
    }
    setSavingResolution(true);
    try {
      const { data } = await patchRequest<{ resolution: string; remarks: string; exceptionVersion: number }, { success: boolean; message?: string }>(
        `api/wfh/attendance-exceptions/${sourceConflict.item.id}/resolve-conflict`,
        { resolution, remarks: sourceConflictRemarks.trim(), exceptionVersion: sourceConflict.item.version },
      );
      if (!data.success) { toast.error(data.message || "The conflict could not be resolved."); return; }
      toast.success(data.message || "Attendance conflict resolved.");
      setSourceConflict(null);
      await load(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "The conflict could not be resolved.");
    } finally { setSavingResolution(false); }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        mt: 3,
        borderRadius: 3,
        overflow: "hidden",
        borderColor: "divider",
        boxShadow: "0 12px 30px rgba(46, 38, 69, 0.08)",
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.25} sx={{ mb: expanded ? 2.5 : 0 }}>
        <Box>
          <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            Monthly Exceptions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Review attendance exceptions and recheck resolved records for {month.format("MMMM YYYY")}.
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ alignSelf: { xs: "stretch", sm: "center" }, justifyContent: { xs: "space-between", sm: "flex-end" } }}>
          <Chip label={`${total} ${total === 1 ? "exception" : "exceptions"}`} color={total ? "warning" : "success"} variant="outlined" />
          <IconButton
            size="small"
            color="primary"
            onClick={() => setExpanded((current) => {
              const next = !current;
              try { window.localStorage.setItem(monthlyExceptionsExpandedStorageKey, String(next)); } catch { /* Storage can be unavailable. */ }
              return next;
            })}
            aria-label={expanded ? "Collapse monthly exceptions" : "Expand monthly exceptions"}
            aria-expanded={expanded}
            sx={{ border: 1, borderColor: "divider", borderRadius: 1.5 }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "minmax(190px, 1fr) minmax(170px, 1fr) auto auto" }, gap: 1.5, alignItems: "end" }}>
        <AppTextField
          label="Attendance month"
          value={month.format("MMMM YYYY")}
          size="small"
          InputProps={{ readOnly: true }}
        />
        <AppTextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(event) => { setStatus(event.target.value); setPage(0); }}
          sx={{ minWidth: 0 }}
        >
          <MenuItem value="">All active statuses</MenuItem>
          <MenuItem value="PENDING_REVIEW">Pending review</MenuItem>
          <MenuItem value="OPEN">Open</MenuItem>
          <MenuItem value="WAIVED">Waived</MenuItem>
          <MenuItem value="DEDUCTION_APPROVED">Deduction approved</MenuItem>
        </AppTextField>
        <AppButton variant="outlined" disabled={loading} onClick={() => void load(true)} sx={{ minHeight: 40, whiteSpace: "nowrap", width: { xs: "100%", lg: "auto" } }}>
          {loading ? <CircularProgress size={20} /> : "Recalculate & Load"}
        </AppButton>
        <AppButton variant="contained" disabled={loading} onClick={() => void resolveAllFixed()} sx={{ minHeight: 40, whiteSpace: "nowrap", width: { xs: "100%", lg: "auto" } }}>
          Resolve All Fixed Issues
        </AppButton>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(210px, 1fr) auto", lg: "220px auto minmax(260px, 1fr)" }, gap: 1.5, alignItems: "end", mt: 2.5, p: { xs: 1.25, sm: 1.5 }, borderRadius: 2, bgcolor: "action.hover" }}>
        <AppTextField
          select
          size="small"
          label="Bulk LHD/ED decision"
          value={bulkDecision}
          onChange={(event) => setBulkDecision(event.target.value)}
          sx={{ minWidth: 0 }}
        >
          <MenuItem value="WAIVE">Waive</MenuItem>
          <MenuItem value="WARNING_ONLY">Warning only</MenuItem>
          <MenuItem value="HALF_DAY_LOP">Half-day LOP</MenuItem>
          <MenuItem value="FULL_DAY_LOP">Full-day LOP</MenuItem>
        </AppTextField>
        <AppButton
          variant="outlined"
          disabled={!bulkDecision || loading}
          onClick={() => setPenaltyReview({ decision: bulkDecision, reason: "" })}
          sx={{ minHeight: 40, whiteSpace: "nowrap", width: { xs: "100%", sm: "auto" } }}
        >
          Apply to All Pending LHD/ED
        </AppButton>
        <Typography variant="body2" color="text.secondary" sx={{ gridColumn: { xs: "auto", sm: "1 / -1", lg: "auto" }, alignSelf: "center" }}>
          Structural errors resolve only after attendance data is corrected and rechecked.
        </Typography>
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" }, overflowX: "auto", width: "100%", mt: 2.5 }}>
        <Box sx={{ minWidth: 820 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "150px minmax(330px, 1fr) 170px 180px", columnGap: 2, px: 0.5, pb: 1, color: "text.secondary" }}>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>Employee</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>Exception details</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>Review status</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>Action</Typography>
          </Box>
          <Divider />
          {items.length === 0 && !loading ? (
            <Typography color="text.secondary" sx={{ py: 3 }}>
              No exceptions found for this month.
            </Typography>
          ) : items.map((item) => (
            <Box
              key={item.id}
              sx={{ display: "grid", gridTemplateColumns: "150px minmax(330px, 1fr) 170px 180px", columnGap: 2, alignItems: "center", borderBottom: 1, borderColor: "divider", minHeight: 68, py: 1.25, px: 0.5, transition: "background-color .2s ease", "&:hover": { bgcolor: "action.hover" } }}
            >
              <Box sx={{ width: 150, flexShrink: 0 }}>
                <Typography fontWeight={700}>{item.employeeName || "Employee"}</Typography>
                <Typography variant="caption" color="text.secondary">{item.employeeId}</Typography>
              </Box>
              <Box sx={{ minWidth: 330, flex: 1 }}>
                <Typography sx={{ textTransform: "capitalize" }}>{exceptionDescription(item)}</Typography>
                {!!item.affectedDates?.length && (
                  <Typography variant="caption" color="text.secondary">
                    {item.affectedDates.map((date) => new Date(date).toLocaleDateString()).join(", ")}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.35 }}>
                  {item.severity ? `Severity: ${item.severity.replace(/_/g, " ")} • ` : ""}
                  {item.existingStatus ? `Existing status: ${item.existingStatus} • ` : ""}
                  {item.reason || "No additional reason was recorded."}
                </Typography>
              </Box>
              <Chip label={item.status.replace(/_/g, " ")} color={exceptionStatusColor(item.status)} size="small" variant="outlined" sx={{ justifySelf: "start", textTransform: "capitalize" }} />
              {item.status === "PENDING_REVIEW" && item.exceptionType === "LHD_ED_LIMIT_EXCEEDED" ? (
                <AppTextField
                  select
                  size="small"
                  label="Decision"
                  value=""
                  onChange={(event) => setPenaltyReview({ item, decision: event.target.value, reason: "" })}
                  sx={{ width: 180, flexShrink: 0 }}
                >
                  <MenuItem value="WAIVE">Waive</MenuItem>
                  <MenuItem value="WARNING_ONLY">Warning only</MenuItem>
                  <MenuItem value="HALF_DAY_LOP">Half-day LOP</MenuItem>
                  <MenuItem value="FULL_DAY_LOP">Full-day LOP</MenuItem>
                </AppTextField>
              ) : item.status === "PENDING_REVIEW" ? (
                <Stack direction="row" spacing={1} sx={{ width: 180, flexShrink: 0 }}>
                  <AppButton
                    size="small"
                    variant="outlined"
                    disabled={!item.affectedDates?.length}
                    onClick={() => item.exceptionType === "WFH_INSUFFICIENT_HOURS" ? openWfhHoursCorrection(item) : void openAttendanceResolution(item)}
                  >
                    Edit
                  </AppButton>
                  <AppButton size="small" onClick={() => void load(true)}>Recheck</AppButton>
                  <AppButton size="small" color="warning" onClick={() => { setOverrideException(item); setOverrideReason(""); }}>Override</AppButton>
                </Stack>
              ) : <Box sx={{ width: 180, flexShrink: 0 }} />}
            </Box>
          ))}
        </Box>
      </Box>
      <Stack spacing={1.25} sx={{ display: { xs: "flex", md: "none" }, mt: 2.5 }}>
        {items.length === 0 && !loading ? (
          <Box sx={{ py: 4, textAlign: "center", border: 1, borderColor: "divider", borderRadius: 2 }}>
            <Typography color="text.secondary">No exceptions found for this month.</Typography>
          </Box>
        ) : items.map((item) => (
          <Box key={item.id} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper", boxShadow: "0 4px 12px rgba(46, 38, 69, 0.04)" }}>
            <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={800}>{item.employeeName || "Employee"}</Typography>
                <Typography variant="caption" color="text.secondary">{item.employeeId}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, textTransform: "capitalize" }}>{exceptionDescription(item)}</Typography>
              </Box>
              <Chip label={item.status.replace(/_/g, " ")} color={exceptionStatusColor(item.status)} size="small" variant="outlined" sx={{ flexShrink: 0, textTransform: "capitalize" }} />
            </Stack>
            {!!item.affectedDates?.length && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Affected: {item.affectedDates.map((date) => new Date(date).toLocaleDateString()).join(", ")}
            </Typography>}
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              {item.severity ? `Severity: ${item.severity.replace(/_/g, " ")} • ` : ""}{item.existingStatus ? `Existing: ${item.existingStatus} • ` : ""}{item.reason || "No additional reason was recorded."}
            </Typography>
            {item.status === "PENDING_REVIEW" && item.exceptionType === "LHD_ED_LIMIT_EXCEEDED" ? (
              <AppTextField select size="small" label="Decision" value="" onChange={(event) => setPenaltyReview({ item, decision: event.target.value, reason: "" })} sx={{ mt: 1.5, width: "100%" }}>
                <MenuItem value="WAIVE">Waive</MenuItem>
                <MenuItem value="WARNING_ONLY">Warning only</MenuItem>
                <MenuItem value="HALF_DAY_LOP">Half-day LOP</MenuItem>
                <MenuItem value="FULL_DAY_LOP">Full-day LOP</MenuItem>
              </AppTextField>
            ) : item.status === "PENDING_REVIEW" ? (
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <AppButton size="small" variant="outlined" disabled={!item.affectedDates?.length} onClick={() => item.exceptionType === "WFH_INSUFFICIENT_HOURS" ? openWfhHoursCorrection(item) : void openAttendanceResolution(item)} sx={{ flex: 1 }}>Edit</AppButton>
                <AppButton size="small" color="warning" onClick={() => { setOverrideException(item); setOverrideReason(""); }} sx={{ flex: 1 }}>Override</AppButton>
                <AppButton size="small" onClick={() => void load(true)} sx={{ flex: 1 }}>Recheck</AppButton>
              </Stack>
            ) : null}
          </Box>
        ))}
      </Stack>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        sx={{ mt: 1.5, borderTop: 1, borderColor: "divider", "& .MuiTablePagination-toolbar": { px: { xs: 0, sm: 1 }, flexWrap: "wrap", justifyContent: "flex-end", gap: 0.5 }, "& .MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } } }}
      />
      </Collapse>
      <CustomisedModal
        open={!!penaltyReview}
        handleClose={() => !loading && setPenaltyReview(null)}
        title={penaltyReview?.item ? "Review attendance exception" : "Apply bulk LHD/ED decision"}
        maxWidth="xs"
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {penaltyReview?.item
              ? `Provide a reason for ${penaltyReview.decision.replace(/_/g, " ").toLowerCase()} for ${penaltyReview.item.employeeId}.`
              : `Provide a reason for applying ${penaltyReview?.decision.replace(/_/g, " ").toLowerCase()} to all pending LHD/ED exceptions.`}
          </Typography>
          <AppTextField
            autoFocus
            label="Review reason"
            value={penaltyReview?.reason ?? ""}
            onChange={(event) => setPenaltyReview((current) => current ? { ...current, reason: event.target.value } : current)}
            multiline
            minRows={3}
            required
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <AppButton variant="outlined" disabled={loading} onClick={() => setPenaltyReview(null)}>Cancel</AppButton>
            <AppButton disabled={loading} onClick={() => void submitPenaltyReview()}>{loading ? "Saving..." : "Confirm decision"}</AppButton>
          </Stack>
        </Stack>
      </CustomisedModal>
      <Dialog open={!!wfhException} onClose={() => !savingCorrection && setWfhException(null)} fullWidth maxWidth="xs">
        <DialogTitle>Correct WFH working hours</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the verified working hours. The WFH attendance status is retained; this exception resolves only when the policy minimum is met.
          </Typography>
          {!!wfhCorrectionError && <Alert severity="error" sx={{ mb: 2 }}><strong>Why it failed:</strong> {wfhCorrectionError}</Alert>}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <DateTimePicker
                label="Punch in"
                value={checkInTime ? dayjs(checkInTime) : null}
                onChange={(value) => setCheckInTime(value?.format("YYYY-MM-DDTHH:mm") ?? "")}
                format="DD MMM YYYY, hh:mm A"
                slotProps={{ textField: { fullWidth: true, required: true }, openPickerButton: { sx: { border: 0, boxShadow: "none", bgcolor: "transparent", "&:hover": { bgcolor: "action.hover" } } } }}
              />
              <DateTimePicker
                label="Punch out"
                value={checkOutTime ? dayjs(checkOutTime) : null}
                onChange={(value) => setCheckOutTime(value?.format("YYYY-MM-DDTHH:mm") ?? "")}
                format="DD MMM YYYY, hh:mm A"
                slotProps={{ textField: { fullWidth: true, required: true }, openPickerButton: { sx: { border: 0, boxShadow: "none", bgcolor: "transparent", "&:hover": { bgcolor: "action.hover" } } } }}
              />
              <AppTextField label="Correction reason" value={correctionReason} onChange={(event) => setCorrectionReason(event.target.value)} multiline minRows={3} required helperText="At least 3 characters. The office break is deducted from verified working hours." />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <AppButton variant="outlined" disabled={savingCorrection} onClick={() => setWfhException(null)}>Cancel</AppButton>
          <AppButton disabled={savingCorrection} onClick={() => void saveWfhHoursCorrection()}>{savingCorrection ? "Saving…" : "Update & resolve"}</AppButton>
        </DialogActions>
      </Dialog>
      <Dialog open={!!leaveException} onClose={() => !savingResolution && setLeaveException(null)} fullWidth maxWidth="xs">
        <DialogTitle>Cancel leave and re-sync attendance</DialogTitle>
        <DialogContent><Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>This attendance is owned by an approved leave request. Cancelling the request reverses its generated attendance safely; you can then recheck and correct any remaining attendance exception.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <AppButton variant="outlined" disabled={savingResolution} onClick={() => setLeaveException(null)}>Keep leave</AppButton>
          <AppButton color="error" disabled={savingResolution} onClick={() => void cancelLeaveAndResync()}>{savingResolution ? "Cancelling…" : "Cancel leave & re-sync"}</AppButton>
        </DialogActions>
      </Dialog>
      <Dialog open={!!overrideException} onClose={() => !savingResolution && setOverrideException(null)} fullWidth maxWidth="xs">
        <DialogTitle>HR/Admin exception override</DialogTitle>
        <DialogContent>
          {overrideException && <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="warning">This is an auditable override. It removes this exception from payroll blocking, but does not alter the original attendance, leave, or WFH record.</Alert>
            <Typography variant="body2" color="text.secondary">{overrideException.employeeId} • {exceptionDescription(overrideException)} • {overrideException.affectedDates?.map((date) => dayjs(date).format("DD MMM YYYY")).join(", ") || "No date recorded"}</Typography>
            <AppTextField label="HR/Admin override reason" value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)} multiline minRows={3} required helperText="This reason is stored in the exception audit trail." />
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <AppButton variant="outlined" disabled={savingResolution} onClick={() => setOverrideException(null)}>Cancel</AppButton>
          <AppButton color="warning" disabled={savingResolution} onClick={() => void overrideBlockingException()}>{savingResolution ? "Saving…" : "Override & unblock"}</AppButton>
        </DialogActions>
      </Dialog>
      <Dialog open={!!sourceConflict} onClose={() => setSourceConflict(null)} fullWidth maxWidth="sm">
        <DialogTitle>WFH source conflict details</DialogTitle>
        <DialogContent>
          {sourceConflict && <Stack spacing={1.2} sx={{ pt: 1 }}>
            <Typography variant="body2">{sourceConflict.item.employeeId} • {sourceConflict.item.exceptionType?.replace(/_/g, " ")}</Typography>
            <Typography variant="body2" color="text.secondary">{sourceConflict.item.reason || "The linked WFH/leave attendance sources overlap."}</Typography>
            <Typography variant="body2" color="text.secondary">Affected date: {sourceConflict.item.attendanceDate ? dayjs(sourceConflict.item.attendanceDate).format("DD MMM YYYY") : sourceConflict.item.affectedDates?.map((date) => dayjs(date).format("DD MMM YYYY")).join(", ") || "Not recorded"}</Typography>
            <Typography variant="body2" color="text.secondary">Current source: {sourceConflict.sourceType || "Unknown"}{sourceConflict.sourceId ? ` (${sourceConflict.sourceId})` : ""}</Typography>
            <Typography variant="body2" color="text.secondary">Existing attendance: {sourceConflict.item.existingStatus || "Not recorded"}{sourceConflict.item.existingAttendanceId ? ` (${sourceConflict.item.existingAttendanceId})` : ""}</Typography>
            <Typography variant="body2" color="text.secondary">WFH request: {sourceConflict.item.leaveRequestId || "Not recorded"} • Source version: {sourceConflict.item.sourceVersion ?? "Not recorded"}</Typography>
            <Typography variant="caption" color="text.secondary">Correct the linked leave or WFH request first; attendance ownership is intentionally preserved.</Typography>
            <AppTextField label="HR/Admin resolution reason" value={sourceConflictRemarks} onChange={(event) => setSourceConflictRemarks(event.target.value)} multiline minRows={2} required />
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <AppButton variant="outlined" disabled={savingResolution} onClick={() => setSourceConflict(null)}>Close</AppButton>
          <AppButton color="error" disabled={savingResolution} onClick={() => void resolveSourceConflict("KEEP_LEAVE_CANCEL_WFH")}>Keep leave</AppButton>
          <AppButton disabled={savingResolution} onClick={() => void resolveSourceConflict("KEEP_WFH_CANCEL_LEAVE")}>Keep WFH</AppButton>
        </DialogActions>
      </Dialog>
      <Dialog open={!!attendanceResolution} onClose={() => !savingResolution && setAttendanceResolution(null)} fullWidth maxWidth="xs">
        <DialogTitle>Resolve attendance exception</DialogTitle>
        <DialogContent>
          {attendanceResolution && <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {attendanceResolution.item.employeeId} • {dayjs(attendanceResolution.date).format("DD MMM YYYY")} • {exceptionDescription(attendanceResolution.item)}
            </Typography>
            <AppTextField select label="Status" value={attendanceResolution.status} onChange={(event) => setAttendanceResolution((current) => current ? { ...current, status: event.target.value } : current)} required>
              {statusOptions.map((option) => <MenuItem key={option.code} value={option.code}>{option.code} - {option.name}</MenuItem>)}
            </AppTextField>
            {(statusOptions.find((option) => option.code === attendanceResolution.status)?.requiresTime ?? false) && <>
              <Stack spacing={0.75}>
                <AppTextField
                  label="Punch in"
                  value={attendanceResolution.checkInTime}
                  onChange={(event) => { const checkInTime = event.target.value; setAttendanceResolution((current) => current ? { ...current, checkInTime } : current); setAttendanceTimeError(""); }}
                  placeholder="HH:MM (for example, 09:00)"
                  inputProps={{ inputMode: "numeric", maxLength: 5 }}
                  required
                  error={Boolean(attendanceTimeError)}
                />
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {checkInPresets.map((time) => <AppButton key={time} size="small" variant="outlined" onClick={() => { setAttendanceResolution((current) => current ? { ...current, checkInTime: time } : current); setAttendanceTimeError(""); }}>{formatTimeLabel(time)}</AppButton>)}
                </Stack>
              </Stack>
              <Stack spacing={0.75}>
                <AppTextField
                  label="Punch out"
                  value={attendanceResolution.checkOutTime}
                  onChange={(event) => { const checkOutTime = event.target.value; setAttendanceResolution((current) => current ? { ...current, checkOutTime } : current); setAttendanceTimeError(""); }}
                  placeholder="HH:MM (for example, 18:00)"
                  inputProps={{ inputMode: "numeric", maxLength: 5 }}
                  required
                  error={Boolean(attendanceTimeError)}
                  helperText={attendanceTimeError || "Choose a common time below or enter an exact time."}
                />
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {checkOutPresets.map((time) => <AppButton key={time} size="small" variant="outlined" onClick={() => { setAttendanceResolution((current) => current ? { ...current, checkOutTime: time } : current); setAttendanceTimeError(""); }}>{formatTimeLabel(time)}</AppButton>)}
                </Stack>
              </Stack>
            </>}
            <AppTextField
              label="Correction reason"
              value={attendanceResolution.reason}
              onChange={(event) => {
                const reason = event.target.value;
                setAttendanceResolution((current) => current ? { ...current, reason } : current);
                if (attendanceResolutionError && reason.trim().length >= 3) setAttendanceResolutionError("");
              }}
              multiline
              minRows={3}
              required
              error={Boolean(attendanceResolutionError)}
              helperText={attendanceResolutionError || "Explain the attendance correction (at least 3 characters)."}
            />
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <AppButton variant="outlined" disabled={savingResolution} onClick={() => setAttendanceResolution(null)}>Cancel</AppButton>
          <AppButton disabled={savingResolution} onClick={() => void saveAttendanceResolution()}>{savingResolution ? "Saving…" : "Save correction"}</AppButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
