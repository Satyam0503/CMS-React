import React, { useEffect } from "react";
import {
  useIntl } from "react-intl";
import IconStat from "../../shared/components/IconStat";
import {
  Box,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  Typography,
  TextField,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import {
  EventAvailable,
  EventBusy,
  TimerOffOutlined,
  HomeWorkOutlined,
  ErrorOutline,
  DownloadOutlined,
  AssignmentTurnedInOutlined,
  HistoryOutlined,
  SendRounded,
} from "@mui/icons-material";

import { SearchInput } from "../../shared/components/SearchInput";
import { AttendanceCalendarGrid } from "./component/AttendanceCalendar";
import { getAllEmployees } from "../employees/employeeServices";
import { exportMonthlyAttendance } from "./AttendanceServices";

import { AppSelect } from "../../shared/components/ui";
import { CustomisedModal } from "../../shared/components/C_Modal";
import { getRequest, postRequest } from "../../../server/axios";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useAppSelector } from "../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission, Roles } from "../../../utils/enums";
import { attendancePeriods, AttendancePeriod, resolveAttendanceDateRange } from "./attendancePeriod";
import dayjs from "dayjs";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { usePageData } from "../../Context/PageDataProvider";
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const EmployeeAttendance = () => {
  const intl = useIntl();
  const { setPageTitle } = usePageData();
  const location = useLocation();
  const theme = useTheme();
  const userData = useAppSelector((state) => state.user.userData);
  // Administrators are authorized by the API independently of individual module grants.
  // Other roles must have the granular attendance permissions returned at sign-in.
  const isAdministrator = userData?.roleType === Roles.Administrator;
  const isHrAttendanceRole = userData?.roleType === Roles.HRManager || userData?.roleType === Roles.HRExecutive;
  const hasAnyAttendancePermission = (userData?.modulePermission ?? []).some((item) => item.startsWith(`${ModulesName.Attendance}.`));
  const canViewAllAttendance = isAdministrator || hasModuleFeaturePermission(ModulesName.Attendance, Permission.ViewAll, userData?.modulePermission ?? []) ||
    (isHrAttendanceRole && hasAnyAttendancePermission);
  const canManageAttendance = isAdministrator || hasModuleFeaturePermission(ModulesName.Attendance, Permission.CreateForEmployee, userData?.modulePermission ?? []) ||
    hasModuleFeaturePermission(ModulesName.Attendance, Permission.Override, userData?.modulePermission ?? []) ||
    (isHrAttendanceRole && hasAnyAttendancePermission);

  const [selectedPeriod, setSelectedPeriod] = React.useState<AttendancePeriod>("today");
  const [calendarOffset, setCalendarOffset] = React.useState(0);
  const [Employee, setEmployee] = React.useState<any[]>([]);
  const [isLoading, setLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [attendanceStats, setAttendanceStats] = React.useState({
    present: 0,
    absent: 0,
    leave: 0,
    wfh: 0,
    halfDay: 0,
    exceptions: 0,
    members: { Present: [] as string[], Absent: [] as string[], WFH: [] as string[], Leave: [] as string[], "Half Day": [] as string[] },
  });
  const [summaryModal, setSummaryModal] = React.useState<{ title: string; people: string[] } | null>(null);
  const [correctionDate, setCorrectionDate] = React.useState("");
  const [correctionReason, setCorrectionReason] = React.useState("");
  const [correctionType, setCorrectionType] = React.useState("Incorrect status");
  const [submittingCorrection, setSubmittingCorrection] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [correctionRequests, setCorrectionRequests] = React.useState<any[]>([]);
  const [reviewCorrection, setReviewCorrection] = React.useState<any | null>(null);
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    setPageTitle("Attendance Report");
  }, [setPageTitle]);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!canViewAllAttendance) {
        if (userData?.userId) setEmployee([{ userId: userData.userId, employeeId: "", fullName: "My attendance" }]);
        return;
      }
      setLoading(true);
      try {
        const response = await getAllEmployees({
          name: debouncedSearch,
          pageNo: 1,
          records: 1000,
          departmentId: [],
          gender: [],
        });

        if (response.data.success) {
          setEmployee(response.data.methodResults);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [canViewAllAttendance, debouncedSearch, userData?.userId]);

  const loadMyCorrectionRequests = React.useCallback(async () => {
    if (canViewAllAttendance) return;
    try {
      const response = await getRequest<{ items?: any[] }>("api/attendance/me/correction-requests", {
        headers: { "Cache-Control": "no-cache" },
      });
      setCorrectionRequests(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (error) {
      console.error("Unable to load attendance correction requests", error);
    }
  }, [canViewAllAttendance]);

  useEffect(() => {
    void loadMyCorrectionRequests();
  }, [loadMyCorrectionRequests]);

  useEffect(() => {
    const requestId = typeof location.state === "string" ? location.state : null;
    if (!canViewAllAttendance || !requestId) return;

    (async () => {
      try {
        const response = await getRequest<{ items?: any[] }>("api/admin/attendance/correction-requests", {
          headers: { "Cache-Control": "no-cache" },
        });
        const request = response.data?.items?.find((item) => item.id === requestId);
        if (request) {
          setReviewCorrection(request);
        } else {
          toast.info("This correction request is no longer pending.");
        }
      } catch {
        toast.error("Unable to open the attendance correction request.");
      } finally {
        window.history.replaceState(null, document.title, window.location.pathname);
      }
    })();
  }, [canViewAllAttendance, location.state]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  // Month navigation is intentionally independent from the five period presets.
  // Once the user moves away from the current month, the attendance grid always
  // shows the complete navigated month instead of a single-day/week subset.
  const dateRange = React.useMemo(() => {
    const calendarMonth = dayjs().add(calendarOffset, "month");
    return calendarOffset === 0
      ? resolveAttendanceDateRange(selectedPeriod, calendarMonth)
      : { startDate: calendarMonth.startOf("month"), endDate: calendarMonth.endOf("month") };
  }, [selectedPeriod, calendarOffset]);
  const todayOverview = React.useMemo(() => resolveAttendanceDateRange("today"), []);

  const submitCorrection = async () => {
    if (!correctionDate || !correctionReason.trim()) {
      toast.error("Select an attendance date and describe the correction required.");
      return;
    }
    try {
      setSubmittingCorrection(true);
      await postRequest("api/attendance/me/correction-requests", { attendanceDate: correctionDate, reason: `${correctionType}: ${correctionReason.trim()}` });
      toast.success("Your correction request has been sent to HR.");
      setCorrectionDate("");
      setCorrectionReason("");
      await loadMyCorrectionRequests();
    } catch (error) {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      if (status === 409) {
        toast.info("A correction request for this date is already pending. See your request status below.");
        await loadMyCorrectionRequests();
      } else if (status === 404) {
        toast.error("No attendance record exists for the selected date. Select a date that is shown in your attendance grid.");
      } else {
        toast.error("Unable to send the correction request. Please try again or contact HR.");
      }
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const downloadMonthlyReport = async () => {
    try {
      setIsExporting(true);
      const response = await exportMonthlyAttendance(dateRange.startDate.year(), dateRange.startDate.month() + 1);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-report-${dateRange.startDate.format("YYYY-MM")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Unable to export attendance report", error);
      toast.error("Unable to download the attendance report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const employeesForCalendar = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return Employee.filter((emp) => !query || `${emp.fullName ?? ""} ${emp.employeeId ?? ""}`.toLowerCase().includes(query)).map((emp) => ({
      id: emp.userId,
      userId: emp.userId,
      employeeId: emp.employeeId,
      name: emp.fullName,
      fullName: emp.fullName,
      dateOfJoining: emp.dateOfJoining,
    }));
  }, [Employee, debouncedSearch]);

  return (
    <Grid container spacing={2}>
      {/* Company-wide summary is intentionally not exposed on the employee self-service view. */}
      {canViewAllAttendance && <Grid size={{ xs: 12 }} sx={{ order: 1 }}>
        <Card
          variant="outlined"
          sx={{
            p: { xs: 1.5, sm: 2, md: 2.5 },
            borderRadius: 3,
            bgcolor: "background.paper",
            boxShadow: "0 8px 24px rgba(71, 46, 117, 0.08)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
            gap={0.5}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography fontWeight={800}>Today’s attendance overview</Typography>
              <Typography variant="body2" color="text.secondary">
                {todayOverview.startDate.format("dddd, DD MMMM YYYY")}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Live summary for today
            </Typography>
          </Stack>
          <Grid container spacing={{ xs: 1.5, md: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card onClick={() => setSummaryModal({ title: "Present employees", people: attendanceStats.members.Present })} role="button" tabIndex={0} sx={{ height: "100%", cursor: "pointer", transition: "transform .2s", "&:hover": { transform: "translateY(-3px)" } }}>
            <CardContent>
              <IconStat
                iconBg={alpha(theme.palette.info.main, 0.18)}
                iconColor="info.dark"
                icon={<EventAvailable fontSize="large" />}
                number={attendanceStats.present}
                title="Present"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card onClick={() => setSummaryModal({ title: "Employees on leave", people: attendanceStats.members.Leave })} role="button" tabIndex={0} sx={{ height: "100%", cursor: "pointer", transition: "transform .2s", "&:hover": { transform: "translateY(-3px)" } }}>
            <CardContent>
              <IconStat
                iconBg={alpha(theme.palette.success.main, 0.18)}
                icon={<TimerOffOutlined fontSize="large" />}
                iconColor="success.light"
                number={attendanceStats.leave}
                title="Leave"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card onClick={() => setSummaryModal({ title: "Absent employees", people: attendanceStats.members.Absent })} role="button" tabIndex={0} sx={{ height: "100%", cursor: "pointer", transition: "transform .2s", "&:hover": { transform: "translateY(-3px)" } }}>
            <CardContent>
              <IconStat
                iconBg={theme.palette.secondary.lighter}
                icon={<EventBusy fontSize="large" />}
                iconColor="warning.light"
                number={attendanceStats.absent}
                title="Absent"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card onClick={() => setSummaryModal({ title: "WFH employees", people: attendanceStats.members.WFH })} role="button" tabIndex={0} sx={{ height: "100%", cursor: "pointer", transition: "transform .2s", "&:hover": { transform: "translateY(-3px)" } }}>
            <CardContent>
              <IconStat
                iconBg={theme.palette.primary.lighter}
                icon={<HomeWorkOutlined fontSize="large" />}
                iconColor="primary.main"
                number={attendanceStats.wfh}
                title="WFH"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card onClick={() => setSummaryModal({ title: "Half-day attendance", people: attendanceStats.members["Half Day"] })} role="button" tabIndex={0} sx={{ height: "100%", cursor: "pointer", transition: "transform .2s", "&:hover": { transform: "translateY(-3px)" } }}><CardContent><IconStat iconBg={alpha(theme.palette.warning.main, 0.18)} iconColor="warning.dark" icon={<TimerOffOutlined fontSize="large" />} number={attendanceStats.halfDay} title="Half Day" /></CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card sx={{ height: "100%" }}><CardContent><IconStat iconBg={alpha(theme.palette.error.main, 0.14)} iconColor="error.main" icon={<ErrorOutline fontSize="large" />} number={attendanceStats.exceptions} title="Exceptions" /></CardContent></Card>
        </Grid>
          </Grid>
        </Card>
      </Grid>}

      {/* ----------- Attendance Section ----------- */}
      <Grid size={{ xs: 12 }} sx={{ order: 3 }}>
        <Card sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 3, boxShadow: "0 10px 30px rgba(71, 46, 117, 0.08)", containerType: "inline-size" }}>
          <Typography component="h2" variant="h6" sx={{ mb: { xs: 1.5, sm: 2 }, textAlign: "center", fontWeight: 800, fontSize: "clamp(1.05rem, 3.8vw, 1.25rem)", lineHeight: 1.25 }}>
            Attendance Report
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1.5, alignItems: "end", mb: 2.5, "@container (max-width: 900px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", "& .attendance-report-period": { gridColumn: "1 / -1" } }, "@container (max-width: 640px)": { gridTemplateColumns: "minmax(0, 1fr)" } }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%", minWidth: 0, "& > *": { width: "100% !important", maxWidth: "100% !important", minWidth: 0 } }}><Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", minHeight: 17, lineHeight: "17px" }}>Search employee</Typography><SearchInput search={searchValue} setSearch={handleSearchChange} sx={{ width: "100%", maxWidth: "none", "& .MuiOutlinedInput-root": { minHeight: 40 } }} />
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: { xs: "block", md: "none" }, mt: 0.75 }}>
                {dateRange.startDate.format("DD MMM YYYY")} – {dateRange.endDate.format("DD MMM YYYY")}
              </Typography></Box>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5} sx={{ width: "100%", height: 40, border: "1px solid", borderColor: "divider", borderRadius: 2, px: 0.5 }}>
                <Button size="small" onClick={() => setCalendarOffset((value) => value - 1)} aria-label="Previous month" sx={{ minWidth: 36, px: 0.5 }}><KeyboardArrowLeft /></Button>
                <Typography fontWeight={800} noWrap sx={{ minWidth: 0, textAlign: "center", px: 0.5 }}>{dateRange.startDate.format("MMMM YYYY")}</Typography>
                <Button size="small" onClick={() => setCalendarOffset((value) => value + 1)} aria-label="Next month" sx={{ minWidth: 36, px: 0.5 }}><KeyboardArrowRight /></Button>
              </Stack>
            </Box>
            <Box className="attendance-report-period" sx={{ minWidth: 0 }}>
              <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "flex-end" }} justifyContent="flex-start" gap={1.25} sx={{ width: "100%" }}>
                <Stack spacing={0.5} sx={{ width: { xs: "100%", sm: 210 }, flexShrink: 0 }}><Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ minHeight: 17, lineHeight: "17px" }}>Attendance Period</Typography><AppSelect name="attendance-period" value={selectedPeriod} onChange={(event: any) => { setCalendarOffset(0); setSelectedPeriod(event.target.value as AttendancePeriod); }} sx={{ height: 40 }}>{attendancePeriods.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}</AppSelect></Stack>
                {canViewAllAttendance && <Button variant="outlined" startIcon={<DownloadOutlined />} onClick={downloadMonthlyReport} disabled={isExporting} sx={{ height: 40, minHeight: 40, whiteSpace: "nowrap", width: { xs: "100%", sm: "auto" }, alignSelf: { xs: "stretch", sm: "flex-end" } }}>{isExporting ? "Preparing..." : "Export month"}</Button>}
              </Stack>
            </Box>
          </Box>
          {selectedPeriod === "this-week" && <Box sx={{ mb: 2, px: 1.5, py: 1, borderRadius: 2, bgcolor: "action.hover", color: "text.secondary", fontSize: 13, fontWeight: 700 }}>{dateRange.startDate.format("DD MMM")} – {dateRange.startDate.endOf("week").format("DD MMM YYYY")} · Full week view</Box>}
          {!canViewAllAttendance && canManageAttendance && <Typography color="text.secondary" sx={{ mb: 2 }}>You can manage attendance for yourself or assigned employees.</Typography>}

          <Box sx={{ mb: 3 }}>
            <AttendanceCalendarGrid
              employees={employeesForCalendar}
              searchValue={debouncedSearch}
              onStatsChange={setAttendanceStats}
              dateRange={dateRange}
              showWholeMonth={selectedPeriod === "this-month" || calendarOffset !== 0}
              showWholeWeek={selectedPeriod === "this-week"}
              companyView={canViewAllAttendance}
              readOnly={!canManageAttendance}
            />
          </Box>
        </Card>
      </Grid>

      <CustomisedModal open={Boolean(summaryModal)} handleClose={() => setSummaryModal(null)} title={summaryModal?.title} maxWidth="sm">
        <Typography color="text.secondary" sx={{ mb: 2 }}>{summaryModal?.people.length ?? 0} employee(s) in the selected period.</Typography>
        <Stack spacing={1}>{summaryModal?.people.length ? summaryModal.people.map((person) => <Box key={person} sx={{ px: 1.5, py: 1, borderRadius: 1, bgcolor: "action.hover" }}>{person}</Box>) : <Typography color="text.secondary">No employees match this status for the selected period.</Typography>}</Stack>
      </CustomisedModal>

      <CustomisedModal open={Boolean(reviewCorrection)} handleClose={() => setReviewCorrection(null)} title="Attendance correction request" maxWidth="sm">
        {reviewCorrection && <Stack spacing={1.5}>
          <Box sx={{ bgcolor: "action.hover", borderRadius: 2, p: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Attendance date</Typography>
            <Typography fontWeight={800}>{new Date(reviewCorrection.attendanceDate).toLocaleDateString()}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Requested correction</Typography>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>{reviewCorrection.reason}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">Review this request from the attendance correction workflow.</Typography>
        </Stack>}
      </CustomisedModal>

      {!canViewAllAttendance && <Grid size={{ xs: 12 }} sx={{ order: 4 }}>
        <Card sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.18), boxShadow: "0 12px 32px rgba(71, 46, 117, 0.10)", background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)}, transparent 45%)` }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ width: 42, height: 42, borderRadius: 2, display: "grid", placeItems: "center", color: "primary.main", bgcolor: "background.paper", boxShadow: "0 4px 12px rgba(71, 46, 117, 0.12)" }}><AssignmentTurnedInOutlined /></Box>
              <Box>
                <Typography variant="h6" fontWeight={800}>Report incorrect attendance</Typography>
                <Typography variant="body2" color="text.secondary">Send a correction request for HR or Admin review.</Typography>
              </Box>
            </Stack>
            <Box sx={{ px: 1.25, py: 0.75, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.8), color: "text.secondary", fontSize: 12, fontWeight: 700 }}>Attendance stays unchanged until reviewed</Box>
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(280px, 0.65fr)" }, gap: { xs: 2.5, lg: 3 } }}>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); void submitCorrection(); }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>Request details</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Include the date and a short, specific description for a faster review.</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.75 }}>
            <TextField fullWidth label="Attendance date" type="date" value={correctionDate} onChange={(e) => setCorrectionDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ max: new Date().toISOString().slice(0, 10) }} />
            <TextField fullWidth select label="Issue type" value={correctionType} onChange={(e) => setCorrectionType(e.target.value)}>
              <MenuItem value="Incorrect status">Incorrect status</MenuItem>
              <MenuItem value="Missing check-in">Missing check-in</MenuItem>
              <MenuItem value="Missing check-out">Missing check-out</MenuItem>
              <MenuItem value="Incorrect working hours">Incorrect working hours</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField fullWidth sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }} label="Describe the correction needed" placeholder="For example: I checked in at 9:15 AM, but the status shows absent." value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} multiline minRows={5} helperText={`${correctionReason.length}/1000 characters`} inputProps={{ maxLength: 1000 }} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: { xs: "stretch", sm: "flex-end" }, mt: 2 }}>
            <Button type="submit" variant="contained" size="large" startIcon={<SendRounded />} disabled={submittingCorrection} sx={{ minHeight: 46, px: { xs: 2, sm: 3 }, width: { xs: "100%", sm: "auto" }, borderRadius: 2, boxShadow: "0 8px 18px rgba(122, 73, 190, 0.28)" }}>{submittingCorrection ? "Sending request..." : "Send correction request"}</Button>
          </Box>
          </Box>
          <Box sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.16), borderRadius: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.035), minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <HistoryOutlined color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={800}>My requests</Typography>
              <Box sx={{ ml: "auto", px: 0.9, py: 0.25, borderRadius: 99, bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main", fontSize: 12, fontWeight: 800 }}>{correctionRequests.length}</Box>
            </Stack>
          {correctionRequests.length > 0 ? (
            <Box sx={{ maxHeight: { xs: "none", lg: 310 }, overflowY: "auto", pr: { lg: 0.5 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Recent correction requests</Typography>
              <Stack spacing={1}>
                {correctionRequests.map((request) => (
                  <Box key={request.id} sx={{ p: 1.35, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}>
                    <Typography variant="body2" fontWeight={700}>
                      {new Date(request.attendanceDate).toLocaleDateString()} — {request.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{request.reason}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ) : <Box sx={{ py: 3, textAlign: "center", borderRadius: 2, border: "1px dashed", borderColor: "divider" }}><Typography variant="body2" color="text.secondary">No correction requests yet.</Typography></Box>}
          </Box>
          </Box>
        </Card>
      </Grid>}
    </Grid>
  );
};

export default EmployeeAttendance;
