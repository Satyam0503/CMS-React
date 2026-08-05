import {
  useCallback,
  useEffect,
  useState } from "react";
import {
  Box,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { patchRequest, postRequest } from "../../../../server/axios";
import { ResponseData } from "../../../../utils/common_types";

import { AppButton, AppTextField } from "../../../shared/components/ui";
type PayrollException = {
  id: string;
  employeeId: string;
  exceptionType?: string;
  affectedDates?: string[];
  lhdCount: number;
  edCount: number;
  combinedOccurrenceCount: number;
  exceededOccurrenceCount: number;
  status: string;
  version: number;
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

export default function MonthlyAttendanceExceptions({ month }: Props) {
  const [items, setItems] = useState<PayrollException[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkDecision, setBulkDecision] = useState("");
  const [wfhException, setWfhException] = useState<PayrollException | null>(null);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [savingCorrection, setSavingCorrection] = useState(false);

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

  const review = async (item: PayrollException, decision: string, suppliedReason?: string) => {
    const reason = suppliedReason ?? window.prompt("Review reason (required)");
    if (!reason?.trim()) return;
    try {
      const { data } = await patchRequest<
        { decision: string; reason: string; version: number },
        { success: boolean; message: string }
      >(`api/attendance/penalty/exceptions/${item.id}/review`, {
        decision,
        reason,
        version: item.version,
      });
      data.success ? toast.success("Exception reviewed.") : toast.error(data.message);
      await load();
    } catch {
      toast.error("Unable to review the exception.");
    }
  };

  const resolveAllFixed = async () => {
    await load(true);
    toast.success("Attendance was rechecked. Corrected issues are now resolved.");
  };

  const reviewAllPenaltyExceptions = async () => {
    if (!bulkDecision) return;
    const reason = window.prompt("Reason for applying this decision to all pending LHD/ED exceptions (required)");
    if (!reason?.trim()) return;
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
          { decision: bulkDecision, reason, version: item.version },
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

  const openAttendanceRecord = (item: PayrollException) => {
    const affectedDate = item.affectedDates?.[0];
    if (!affectedDate) {
      toast.error("No affected attendance date is available for this exception.");
      return;
    }
    window.dispatchEvent(new CustomEvent("edit-attendance-exception", {
      detail: { employeeId: item.employeeId, date: affectedDate },
    }));
  };

  const openWfhHoursCorrection = (item: PayrollException) => {
    const date = item.affectedDates?.[0];
    if (!date) {
      toast.error("No affected attendance date is available for this exception.");
      return;
    }
    const localDate = new Date(date).toISOString().slice(0, 10);
    setCheckInTime(`${localDate}T09:00`);
    setCheckOutTime(`${localDate}T18:00`);
    setCorrectionReason("");
    setWfhException(item);
  };

  const saveWfhHoursCorrection = async () => {
    if (!wfhException || !checkInTime || !checkOutTime || !correctionReason.trim()) {
      toast.error("Check-in, check-out, and a correction reason are required.");
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
        toast.error(data.message || "WFH hours could not be corrected.");
        return;
      }
      toast.success(data.message || "WFH hours updated and exception resolved.");
      setWfhException(null);
      await load(true);
    } catch {
      toast.error("WFH hours could not be corrected. Refresh and try again.");
    } finally {
      setSavingCorrection(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ p: { xs: 2, md: 3 }, mt: 3, borderRadius: 3, overflow: "hidden" }}>
      <Typography variant="h5" color="primary.main" sx={{ mb: 2.5, fontWeight: 700 }}>
        Monthly Exceptions
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(190px, 1fr) minmax(170px, 1fr) auto auto" }, gap: 2, alignItems: "center" }}>
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
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="PENDING_REVIEW">Pending review</MenuItem>
          <MenuItem value="OPEN">Open</MenuItem>
          <MenuItem value="WAIVED">Waived</MenuItem>
          <MenuItem value="DEDUCTION_APPROVED">Deduction approved</MenuItem>
          <MenuItem value="RESOLVED">Resolved</MenuItem>
        </AppTextField>
        <AppButton variant="outlined" disabled={loading} onClick={() => void load(true)}>
          {loading ? <CircularProgress size={20} /> : "Recalculate & Load"}
        </AppButton>
        <AppButton variant="contained" disabled={loading} onClick={() => void resolveAllFixed()}>
          Resolve All Fixed Issues
        </AppButton>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px auto minmax(260px, 1fr)" }, gap: 2, alignItems: "center", mt: 2 }}>
        <AppTextField
          select
          size="small"
          label="Bulk LHD/ED decision"
          value={bulkDecision}
          onChange={(event) => setBulkDecision(event.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="WAIVE">Waive</MenuItem>
          <MenuItem value="WARNING_ONLY">Warning only</MenuItem>
          <MenuItem value="HALF_DAY_LOP">Half-day LOP</MenuItem>
          <MenuItem value="FULL_DAY_LOP">Full-day LOP</MenuItem>
        </AppTextField>
        <AppButton
          variant="outlined"
          disabled={!bulkDecision || loading}
          onClick={() => void reviewAllPenaltyExceptions()}
        >
          Apply to All Pending LHD/ED
        </AppButton>
        <Typography variant="body2" color="text.secondary">
          Structural errors resolve only after attendance data is corrected and rechecked.
        </Typography>
      </Box>

      <Box sx={{ overflowX: "auto", width: "100%", mt: 2 }}>
        <Box sx={{ minWidth: 820 }}>
          {items.length === 0 && !loading ? (
            <Typography color="text.secondary" sx={{ py: 3 }}>
              No exceptions found for this month.
            </Typography>
          ) : items.map((item) => (
            <Box
              key={item.id}
              sx={{ display: "grid", gridTemplateColumns: "150px minmax(330px, 1fr) 170px 180px", columnGap: 2, alignItems: "center", borderBottom: 1, borderColor: "divider", minHeight: 68, py: 1.25, px: 0.5, transition: "background-color .2s ease", "&:hover": { bgcolor: "action.hover" } }}
            >
              <Typography sx={{ width: 150, flexShrink: 0 }}>{item.employeeId}</Typography>
              <Box sx={{ minWidth: 330, flex: 1 }}>
                <Typography sx={{ textTransform: "capitalize" }}>{exceptionDescription(item)}</Typography>
                {!!item.affectedDates?.length && (
                  <Typography variant="caption" color="text.secondary">
                    {item.affectedDates.map((date) => new Date(date).toLocaleDateString()).join(", ")}
                  </Typography>
                )}
              </Box>
              <Typography sx={{ width: 170, flexShrink: 0 }}>{item.status}</Typography>
              {item.status === "PENDING_REVIEW" && item.exceptionType === "LHD_ED_LIMIT_EXCEEDED" ? (
                <AppTextField
                  select
                  size="small"
                  label="Decision"
                  value=""
                  onChange={(event) => void review(item, event.target.value)}
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
                    onClick={() => item.exceptionType === "WFH_INSUFFICIENT_HOURS" ? openWfhHoursCorrection(item) : openAttendanceRecord(item)}
                  >
                    Edit
                  </AppButton>
                  <AppButton size="small" onClick={() => void load(true)}>Recheck</AppButton>
                </Stack>
              ) : <Box sx={{ width: 180, flexShrink: 0 }} />}
            </Box>
          ))}
        </Box>
      </Box>
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
      />
      <Dialog open={!!wfhException} onClose={() => !savingCorrection && setWfhException(null)} fullWidth maxWidth="xs">
        <DialogTitle>Correct WFH working hours</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the verified working hours. The WFH attendance status is retained; this exception resolves only when the policy minimum is met.
          </Typography>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <AppTextField label="Check-in" type="datetime-local" value={checkInTime} onChange={(event) => setCheckInTime(event.target.value)} InputLabelProps={{ shrink: true }} />
            <AppTextField label="Check-out" type="datetime-local" value={checkOutTime} onChange={(event) => setCheckOutTime(event.target.value)} InputLabelProps={{ shrink: true }} />
            <AppTextField label="Correction reason" value={correctionReason} onChange={(event) => setCorrectionReason(event.target.value)} multiline minRows={3} required />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <AppButton variant="outlined" disabled={savingCorrection} onClick={() => setWfhException(null)}>Cancel</AppButton>
          <AppButton disabled={savingCorrection} onClick={() => void saveWfhHoursCorrection()}>{savingCorrection ? "Saving…" : "Update & resolve"}</AppButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
