import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  MenuItem,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { patchRequest, postRequest } from "../../../../server/axios";
import { ResponseData } from "../../../../utils/common_types";

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

  return (
    <Card variant="outlined" sx={{ p: { xs: 2, md: 3 }, mt: 3, borderRadius: 3, overflow: "hidden" }}>
      <Typography variant="h5" color="primary.main" sx={{ mb: 2.5, fontWeight: 700 }}>
        Monthly Exceptions
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(190px, 1fr) minmax(170px, 1fr) auto auto" }, gap: 2, alignItems: "center" }}>
        <TextField
          label="Attendance month"
          value={month.format("MMMM YYYY")}
          size="small"
          InputProps={{ readOnly: true }}
        />
        <TextField
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
        </TextField>
        <Button variant="outlined" disabled={loading} onClick={() => void load(true)}>
          {loading ? <CircularProgress size={20} /> : "Recalculate & Load"}
        </Button>
        <Button variant="contained" disabled={loading} onClick={() => void resolveAllFixed()}>
          Resolve All Fixed Issues
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px auto minmax(260px, 1fr)" }, gap: 2, alignItems: "center", mt: 2 }}>
        <TextField
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
        </TextField>
        <Button
          variant="outlined"
          disabled={!bulkDecision || loading}
          onClick={() => void reviewAllPenaltyExceptions()}
        >
          Apply to All Pending LHD/ED
        </Button>
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
                <TextField
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
                </TextField>
              ) : item.status === "PENDING_REVIEW" ? (
                <Stack direction="row" spacing={1} sx={{ width: 180, flexShrink: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!item.affectedDates?.length}
                    onClick={() => openAttendanceRecord(item)}
                  >
                    Edit
                  </Button>
                  <Button size="small" onClick={() => void load(true)}>Recheck</Button>
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
    </Card>
  );
}
