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
  UploadFile,
} from "@mui/icons-material";

import { SearchInput } from "../../shared/components/SearchInput";
import { AttendanceCalendarGrid } from "./component/AttendanceCalendar";
import { getAllEmployees } from "../employees/employeeServices";
import { exportMonthlyAttendance } from "./AttendanceServices";
import { ImportAttendanceModal } from "./component/ImportAttendanceModal";
import { ExportAttendanceModal, DepartmentOption } from "./component/ExportAttendanceModal";
import { getAllDepartments } from "../admin/adminservices";

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
  // Updating a row can alter payroll and must mirror the API's explicit
  // Attendance.Override requirement. Viewing or creating attendance does not
  // grant access to source-owned WFH/leave correction controls.
  const canManageAttendance = isAdministrator ||
    hasModuleFeaturePermission(ModulesName.Attendance, Permission.Override, userData?.modulePermission ?? []);

  const [selectedPeriod, setSelectedPeriod] = React.useState<AttendancePeriod>("today");
  const [calendarOffset, setCalendarOffset] = React.useState(0);
  const [Employee, setEmployee] = React.useState<any[]>([]);
  const [isLoading, setLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedShiftId, setSelectedShiftId] = React.useState("");
  const [shiftOptions, setShiftOptions] = React.useState<Array<{ scheduleId: string; name: string }>>([]);
  const [effectiveSchedules, setEffectiveSchedules] = React.useState<Record<string, { scheduleId?: string | null; scheduleName?: string | null; startTime?: string | null; endTime?: string | null; punchInAllowedFrom?: string | null; punchInAllowedUntil?: string | null; punchOutAllowedFrom?: string | null; punchOutAllowedUntil?: string | null; source?: string }>>({});
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
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [correctionRequests, setCorrectionRequests] = React.useState<any[]>([]);
  const [reviewCorrection, setReviewCorrection] = React.useState<any | null>(null);
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    setPageTitle("Attendance Report");
  }, [setPageTitle]);

  useEffect(() => {
    if (!canViewAllAttendance) return;
    void (async () => {
      try {
        const response = await getAllDepartments(true);
        if (response?.data?.success) {
          const list = (response.data.methodResults ?? []).map((d: any) => ({
            departmentId: d.departmentId,
            name: d.titles?.en || d.titles?.[0]?.label || d.departmentId,
          }));
          setDepartments(list);
        }
      } catch (e) {
        console.error("Failed to load departments", e);
      }
    })();
  }, [canViewAllAttendance]);

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
          // Keep the operational attendance roster current. Completed exits
          // are available in employee/offboarding reporting, not as editable
          // attendance cards.
          employmentStatus: "AttendanceRoster",
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

  useEffect(() => {
    if (!canViewAllAttendance) return;
    void getRequest<any>("api/User/AvailableOfficeSchedules")
      .then((response) => {
        if (response.data?.success) setShiftOptions(response.data.methodResults ?? []);
      })
      .catch(() => toast.error("Unable to load company shifts."));
  }, [canViewAllAttendance]);

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
    const stateObj =
      location.state && typeof location.state === "object"
        ? (location.state as {
            focusEmployeeCode?: string;
            focusEmployeeName?: string;
            focusDate?: string;
          })
        : null;

    if (stateObj && (stateObj.focusEmployeeCode || stateObj.focusEmployeeName || stateObj.focusDate)) {
      if (stateObj.focusEmployeeName || stateObj.focusEmployeeCode) {
        setSearchValue(stateObj.focusEmployeeName || stateObj.focusEmployeeCode || "");
      }
      if (stateObj.focusDate) {
        const targetMonth = dayjs(stateObj.focusDate).startOf("month");
        const currentMonth = dayjs().startOf("month");
        const monthDiff = targetMonth.diff(currentMonth, "month");
        setCalendarOffset(monthDiff);
        if (monthDiff === 0) {
          setSelectedPeriod("this-month");
        }
      }
      if (stateObj.focusEmployeeCode && stateObj.focusDate) {
        const timer = setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("edit-attendance-exception", {
              detail: { employeeId: stateObj.focusEmployeeCode, date: stateObj.focusDate },
            }),
          );
        }, 450);
        window.history.replaceState(null, document.title, window.location.pathname);
        return () => clearTimeout(timer);
      }
      window.history.replaceState(null, document.title, window.location.pathname);
      return;
    }

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

  useEffect(() => {
    if (!canViewAllAttendance || Employee.length === 0) {
      setEffectiveSchedules({});
      return;
    }
    let cancelled = false;
    void postRequest<{ userIds: string[]; attendanceDate: string }, { items?: Array<any> }>("api/admin/attendance/effective-schedules", {
      userIds: Employee.map((employee) => employee.userId).filter(Boolean),
      attendanceDate: dateRange.startDate.format("YYYY-MM-DD"),
    }).then((response) => {
      if (cancelled) return;
      const schedules = (response.data?.items ?? []).reduce((result: Record<string, any>, item: any) => {
        result[item.userId] = item;
        return result;
      }, {});
      setEffectiveSchedules(schedules);
    }).catch(() => {
      if (!cancelled) {
        setEffectiveSchedules({});
        toast.error("Unable to resolve employee shifts for this report.");
      }
    });
    return () => { cancelled = true; };
  }, [canViewAllAttendance, Employee, dateRange.startDate]);

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

  const downloadMonthlyReport = () => {
    setExportModalOpen(true);
  };

  const employeesForCalendar = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return Employee.filter((emp) => {
      const matchesSearch = !query || `${emp.fullName ?? ""} ${emp.employeeId ?? ""}`.toLowerCase().includes(query);
      const empDept = emp.departmentId || (typeof emp.department === "string" ? emp.department : emp.department?.en || emp.department?.departmentId);
      const matchesDept = !selectedDepartmentId || empDept === selectedDepartmentId;
      return matchesSearch && matchesDept;
    }).map((emp) => ({
      id: emp.userId,
      userId: emp.userId,
      employeeId: emp.employeeId,
      name: emp.fullName,
      fullName: emp.fullName,
      dateOfJoining: emp.dateOfJoining,
      lastWorkingDate: emp.lastWorkingDate,
      employmentStatus: emp.employmentStatus,
      availabilityStatus: emp.availabilityStatus,
      scheduleId: effectiveSchedules[emp.userId]?.scheduleId,
      scheduleName: effectiveSchedules[emp.userId]?.scheduleName,
      scheduledStartTime: effectiveSchedules[emp.userId]?.startTime,
      scheduledEndTime: effectiveSchedules[emp.userId]?.endTime,
      punchInAllowedFrom: effectiveSchedules[emp.userId]?.punchInAllowedFrom,
      punchInAllowedUntil: effectiveSchedules[emp.userId]?.punchInAllowedUntil,
      punchOutAllowedFrom: effectiveSchedules[emp.userId]?.punchOutAllowedFrom,
      punchOutAllowedUntil: effectiveSchedules[emp.userId]?.punchOutAllowedUntil,
      scheduleSource: effectiveSchedules[emp.userId]?.source,
    }));
  }, [Employee, debouncedSearch, effectiveSchedules]);

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
            borderColor: "divider",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: (theme) => theme.palette.mode === "dark"
              ? "0 10px 30px 0 rgba(0, 0, 0, 0.35)"
              : "0 10px 30px 0 rgba(11, 92, 171, 0.06), 0 2px 8px 0 rgba(15, 23, 42, 0.03)",
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
              <Typography fontWeight={800} sx={{ color: "text.primary", fontSize: "1.05rem" }}>
                Today’s attendance overview
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                {todayOverview.startDate.format("dddd, DD MMMM YYYY")}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: "999px",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.28),
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main" }} />
              <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
                Live summary for today
              </Typography>
            </Box>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                lg: "repeat(6, 1fr)",
              },
              gap: { xs: 1.25, sm: 1.5, md: 2 },
            }}
          >
            {[
              {
                title: "Present",
                modalTitle: "Present employees",
                people: attendanceStats.members.Present,
                number: attendanceStats.present,
                icon: <EventAvailable fontSize="medium" />,
                accent: "#0B5CAB",
                iconBg: "rgba(11, 92, 171, 0.12)",
                clickable: true,
              },
              {
                title: "Leave",
                modalTitle: "Employees on leave",
                people: attendanceStats.members.Leave,
                number: attendanceStats.leave,
                icon: <TimerOffOutlined fontSize="medium" />,
                accent: "#16A34A",
                iconBg: "rgba(22, 163, 74, 0.12)",
                clickable: true,
              },
              {
                title: "Absent",
                modalTitle: "Absent employees",
                people: attendanceStats.members.Absent,
                number: attendanceStats.absent,
                icon: <EventBusy fontSize="medium" />,
                accent: "#EA580C",
                iconBg: "rgba(234, 88, 12, 0.12)",
                clickable: true,
              },
              {
                title: "WFH",
                modalTitle: "WFH employees",
                people: attendanceStats.members.WFH,
                number: attendanceStats.wfh,
                icon: <HomeWorkOutlined fontSize="medium" />,
                accent: "#0D9488",
                iconBg: "rgba(13, 148, 136, 0.12)",
                clickable: true,
              },
              {
                title: "Half Day",
                modalTitle: "Half-day attendance",
                people: attendanceStats.members["Half Day"],
                number: attendanceStats.halfDay,
                icon: <TimerOffOutlined fontSize="medium" />,
                accent: "#D97706",
                iconBg: "rgba(217, 119, 6, 0.12)",
                clickable: true,
              },
              {
                title: "Exceptions",
                modalTitle: "Attendance exceptions",
                people: [],
                number: attendanceStats.exceptions,
                icon: <ErrorOutline fontSize="medium" />,
                accent: "#DC2626",
                iconBg: "rgba(220, 38, 38, 0.12)",
                clickable: false,
              },
            ].map((stat) => (
              <Card
                key={stat.title}
                className="interactive-card"
                onClick={
                  stat.clickable
                    ? () => setSummaryModal({ title: stat.modalTitle, people: stat.people })
                    : undefined
                }
                role={stat.clickable ? "button" : undefined}
                tabIndex={stat.clickable ? 0 : -1}
                onKeyDown={(e) => {
                  if (stat.clickable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setSummaryModal({ title: stat.modalTitle, people: stat.people });
                  }
                }}
                sx={{
                  height: "100%",
                  cursor: stat.clickable ? "pointer" : "default",
                  borderRadius: "12px",
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                  backdropFilter: "blur(12px) saturate(180%)",
                  WebkitBackdropFilter: "blur(12px) saturate(180%)",
                  borderLeft: `3.5px solid ${stat.accent} !important`,
                  boxShadow: (theme) => theme.palette.mode === "dark"
                    ? "0 4px 16px rgba(0, 0, 0, 0.25)"
                    : "0 4px 16px rgba(11, 92, 171, 0.04)",
                  transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease, background-color 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    bgcolor: "background.paper",
                    borderColor: `${stat.accent} !important`,
                    boxShadow: `0 12px 24px -6px ${alpha(stat.accent, 0.28)}, 0 4px 10px -2px rgba(15, 23, 42, 0.12)`,
                  },
                  "&:focus-visible": {
                    outline: `2px solid ${stat.accent}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <CardContent sx={{ p: "16px !important" }}>
                  <IconStat
                    iconBg={stat.iconBg}
                    iconColor={stat.accent}
                    icon={stat.icon}
                    number={stat.number}
                    title={stat.title}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
        </Card>
      </Grid>}

      {/* ----------- Attendance Section ----------- */}
      <Grid size={{ xs: 12 }} sx={{ order: 3 }}>
        <Card
          sx={{
            p: { xs: 1.5, md: 2.5 },
            borderRadius: 3,
            bgcolor: "var(--mui-palette-background-card, var(--mui-palette-background-paper))",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 10px 30px 0 rgba(0, 0, 0, 0.08)",
            containerType: "inline-size",
          }}
        >
          {/* Header Row: Title & Subtitle on left, Actions on right */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                component="h2"
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
                  lineHeight: 1.25,
                }}
              >
                Attendance Report
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  mt: 0.35,
                }}
              >
                <span>
                  {selectedPeriod === "today"
                    ? `Today · ${dateRange.startDate.format("DD MMMM YYYY")}`
                    : selectedPeriod === "this-week"
                    ? `Week · ${dateRange.startDate.format("DD MMM")} – ${dateRange.startDate.endOf("week").format("DD MMM YYYY")}`
                    : `Month · ${dateRange.startDate.format("MMMM YYYY")}`}
                </span>
              </Typography>
            </Box>
            {canViewAllAttendance && (
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  "& > *": { flex: { xs: 1, sm: "initial" } },
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<DownloadOutlined />}
                  onClick={downloadMonthlyReport}
                  disabled={isExporting}
                  sx={{
                    height: 40,
                    minHeight: 40,
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: 13.5,
                    bgcolor: "background.paper",
                    borderColor: "divider",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    color: "text.primary",
                    whiteSpace: "nowrap",
                    px: 2,
                    "&:hover": {
                      bgcolor: "action.hover",
                      borderColor: "primary.main",
                      color: "primary.main",
                    },
                  }}
                >
                  {isExporting ? "Preparing..." : "Export month"}
                </Button>
                {canManageAttendance && (
                  <Button
                    variant="contained"
                    startIcon={<UploadFile />}
                    onClick={() => setImportModalOpen(true)}
                    sx={{
                      height: 40,
                      minHeight: 40,
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: 13.5,
                      bgcolor: "#0B5CAB",
                      color: "#FFFFFF",
                      whiteSpace: "nowrap",
                      px: 2,
                      "&:hover": {
                        bgcolor: "#094a8a",
                      },
                    }}
                  >
                    Import attendance
                  </Button>
                )}
              </Stack>
            )}
          </Stack>

          {/* Filter Toolbar: 4 cleanly aligned controls */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: canViewAllAttendance
                  ? "minmax(180px, 1.4fr) minmax(130px, 0.9fr) minmax(130px, 0.9fr) minmax(150px, 1fr) minmax(150px, 1fr)"
                  : "minmax(200px, 2fr) minmax(170px, 1fr) minmax(190px, 1fr)",
              },
              gap: 1.5,
              alignItems: "end",
              mb: 2.5,
              p: 1.75,
              borderRadius: "12px",
              bgcolor: "var(--mui-palette-background-box, action.hover)",
              border: "1px solid",
              borderColor: "divider",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "none",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack spacing={0.6}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                    minHeight: 17,
                    lineHeight: "17px",
                    letterSpacing: "0.01em",
                  }}
                >
                  Search employee
                </Typography>
                <SearchInput
                  search={searchValue}
                  setSearch={handleSearchChange}
                  sx={{
                    width: "100%",
                    maxWidth: "none",
                    "& .MuiOutlinedInput-root": {
                      minHeight: 40,
                      height: 40,
                      borderRadius: "10px",
                      bgcolor: "background.paper",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "divider",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              </Stack>
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack spacing={0.6}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                    minHeight: 17,
                    lineHeight: "17px",
                    letterSpacing: "0.01em",
                  }}
                >
                  Attendance Period
                </Typography>
                <AppSelect
                  name="attendance-period"
                  value={selectedPeriod}
                  onChange={(event: any) => {
                    setCalendarOffset(0);
                    setSelectedPeriod(event.target.value as AttendancePeriod);
                  }}
                  sx={{
                    height: 40,
                    minHeight: 40,
                    borderRadius: "10px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    bgcolor: "background.paper",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "divider",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "text.secondary",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  {attendancePeriods.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </AppSelect>
              </Stack>
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack spacing={0.6}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                    minHeight: 17,
                    lineHeight: "17px",
                    letterSpacing: "0.01em",
                  }}
                >
                  Month
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={0.5}
                  sx={{
                    width: "100%",
                    height: 40,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderRadius: "10px",
                    px: 0.5,
                    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
                    "&:hover": {
                      borderColor: "text.secondary",
                    },
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => setCalendarOffset((value) => value - 1)}
                    aria-label="Previous month"
                    sx={{
                      minWidth: 32,
                      height: 30,
                      p: 0,
                      borderRadius: "7px",
                      color: "text.secondary",
                      "&:hover": { bgcolor: "action.hover", color: "primary.main" },
                    }}
                  >
                    <KeyboardArrowLeft fontSize="small" />
                  </Button>
                  <Typography
                    fontWeight={700}
                    noWrap
                    sx={{
                      minWidth: 0,
                      textAlign: "center",
                      px: 0.5,
                      fontSize: "0.875rem",
                      color: "text.primary",
                    }}
                  >
                    {dateRange.startDate.format("MMMM YYYY")}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setCalendarOffset((value) => value + 1)}
                    aria-label="Next month"
                    sx={{
                      minWidth: 32,
                      height: 30,
                      p: 0,
                      borderRadius: "7px",
                      color: "text.secondary",
                      "&:hover": { bgcolor: "action.hover", color: "primary.main" },
                    }}
                  >
                    <KeyboardArrowRight fontSize="small" />
                  </Button>
                </Stack>
              </Stack>
            </Box>

            {canViewAllAttendance && (
              <Box sx={{ minWidth: 0 }}>
                <Stack spacing={0.6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 700,
                      minHeight: 17,
                      lineHeight: "17px",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Shift
                  </Typography>
                  <AppSelect
                    displayEmpty
                    value={selectedShiftId}
                    onChange={(event: any) => setSelectedShiftId(event.target.value)}
                    renderValue={(value: unknown) =>
                      value
                        ? shiftOptions.find((shift) => shift.scheduleId === value)?.name ?? "Selected shift"
                        : "All shifts"
                    }
                    sx={{
                      height: 40,
                      minHeight: 40,
                      borderRadius: "10px",
                      fontSize: 13.5,
                      fontWeight: 600,
                      bgcolor: "background.paper",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "divider",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <MenuItem value="">All shifts</MenuItem>
                    {shiftOptions.map((shift) => (
                      <MenuItem key={shift.scheduleId} value={shift.scheduleId}>
                        {shift.name}
                      </MenuItem>
                    ))}
                  </AppSelect>
                </Stack>
              </Box>
            )}

            {canViewAllAttendance && (
              <Box sx={{ minWidth: 0 }}>
                <Stack spacing={0.6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 700,
                      minHeight: 17,
                      lineHeight: "17px",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Department
                  </Typography>
                  <AppSelect
                    displayEmpty
                    value={selectedDepartmentId}
                    onChange={(event: any) => setSelectedDepartmentId(event.target.value)}
                    renderValue={(value: unknown) =>
                      value
                        ? departments.find((d) => d.departmentId === value)?.name ?? "Selected department"
                        : "All departments"
                    }
                    sx={{
                      height: 40,
                      minHeight: 40,
                      borderRadius: "10px",
                      fontSize: 13.5,
                      fontWeight: 600,
                      bgcolor: "background.paper",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "divider",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "text.secondary",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <MenuItem value="">All departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.departmentId} value={dept.departmentId}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </AppSelect>
                </Stack>
              </Box>
            )}
          </Box>
          {selectedPeriod === "this-week" && <Box sx={{ mb: 2, px: 1.5, py: 1, borderRadius: 2, bgcolor: "action.hover", color: "text.secondary", fontSize: 13, fontWeight: 700 }}>{dateRange.startDate.format("DD MMM")} – {dateRange.startDate.endOf("week").format("DD MMM YYYY")} · Full week view</Box>}
          {!canViewAllAttendance && canManageAttendance && <Typography color="text.secondary" sx={{ mb: 2 }}>You can manage attendance for yourself or assigned employees.</Typography>}

          <Box sx={{ mb: 3 }}>
            <AttendanceCalendarGrid
              key={`calendar-${refreshTrigger}-${calendarOffset}`}
              employees={employeesForCalendar}
              searchValue={debouncedSearch}
              onStatsChange={setAttendanceStats}
              dateRange={dateRange}
              showWholeMonth={selectedPeriod === "this-month" || calendarOffset !== 0}
              showWholeWeek={selectedPeriod === "this-week"}
              companyView={canViewAllAttendance}
              readOnly={!canManageAttendance}
              scheduleIdFilter={selectedShiftId}
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
            <Box sx={{ px: 1.25, py: 0.75, borderRadius: 2, bgcolor: "action.hover", color: "text.secondary", fontSize: 12, fontWeight: 700 }}>Attendance stays unchanged until reviewed</Box>
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(280px, 0.65fr)" }, gap: { xs: 2.5, lg: 3 } }}>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); void submitCorrection(); }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>Request details</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Include the date and a short, specific description for a faster review.</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.75 }}>
            <TextField fullWidth label="Attendance date" type="date" value={correctionDate} onChange={(e) => setCorrectionDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ max: new Date().toISOString().slice(0, 10) }} />
            <TextField fullWidth select label="Issue type" value={correctionType} onChange={(e) => setCorrectionType(e.target.value)}>
              <MenuItem value="Incorrect status">Incorrect status</MenuItem>
              <MenuItem value="Missing check-in">Missing punch in</MenuItem>
              <MenuItem value="Missing check-out">Missing punch out</MenuItem>
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

      <ImportAttendanceModal
        open={importModalOpen}
        handleClose={() => setImportModalOpen(false)}
        initialYear={dateRange.startDate.year()}
        initialMonth={dateRange.startDate.month() + 1}
        onImportSuccess={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      <ExportAttendanceModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        year={dateRange.startDate.year()}
        month={dateRange.startDate.month() + 1}
        initialSearch={searchValue}
        initialDepartmentId={selectedDepartmentId}
        departments={departments}
      />
    </Grid>
  );
};

export default EmployeeAttendance;
