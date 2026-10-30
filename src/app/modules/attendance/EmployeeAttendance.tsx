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
  Chip,
  Badge,
  CircularProgress,
  Tabs,
  Tab,
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
  CheckCircleOutline,
  HighlightOffOutlined,
  AccessTimeOutlined,
  CalendarToday as CalendarTodayIcon,
  InfoOutlined,
} from "@mui/icons-material";
import CustomisedDatePicker from "../../shared/components/C_DatePicker";

import { SearchInput } from "../../shared/components/SearchInput";
import { AttendanceCalendarGrid } from "./component/AttendanceCalendar";
import { getAllEmployees } from "../employees/employeeServices";
import { exportMonthlyAttendance } from "./AttendanceServices";
import { ImportAttendanceModal } from "./component/ImportAttendanceModal";
import { ExportAttendanceModal, DepartmentOption } from "./component/ExportAttendanceModal";
import { getAllDepartments } from "../admin/adminservices";

import { AppSelect } from "../../shared/components/ui";
import { CustomisedModal } from "../../shared/components/C_Modal";
import { getRequest, postRequest, putRequest } from "../../../server/axios";
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
  const hasWfhAccess = (userData?.modulePermission ?? []).some((item) => item.startsWith(`${ModulesName.WorkFromHome}.`));
  const hasAnyAttendancePermission = (userData?.modulePermission ?? []).some((item) => item.startsWith(`${ModulesName.Attendance}.`));
  const canViewAllAttendance =
    isAdministrator ||
    hasModuleFeaturePermission(ModulesName.Attendance, Permission.ViewAll, userData?.modulePermission ?? []) ||
    hasModuleFeaturePermission(ModulesName.Attendance, Permission.Review, userData?.modulePermission ?? []) ||
    hasModuleFeaturePermission(ModulesName.Attendance, Permission.Approve, userData?.modulePermission ?? []) ||
    (isHrAttendanceRole && hasAnyAttendancePermission);
  // Updating a row can alter payroll and must mirror the API's explicit
  // Attendance.Override requirement. Viewing or creating attendance does not
  // grant access to source-owned WFH/leave correction controls.

  const canManageAttendance =
    isAdministrator ||
    isHrAttendanceRole ||
    hasModuleFeaturePermission(ModulesName.Attendance, Permission.Override, userData?.modulePermission ?? []) ||
    hasModuleFeaturePermission(ModulesName.Attendance, Permission.Edit, userData?.modulePermission ?? []) ||
    hasModuleFeaturePermission(ModulesName.Attendance, Permission.Review, userData?.modulePermission ?? []) ||
    hasModuleFeaturePermission(ModulesName.Attendance, Permission.Approve, userData?.modulePermission ?? []);

  const [selectedPeriod, setSelectedPeriod] = React.useState<AttendancePeriod>("today");
  const [calendarOffset, setCalendarOffset] = React.useState(0);
  const [Employee, setEmployee] = React.useState<any[]>([]);
  const [isLoading, setLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedShiftId, setSelectedShiftId] = React.useState("");
  const [shiftOptions, setShiftOptions] = React.useState<Array<{ scheduleId: string; name: string }>>([]);
  const [effectiveSchedules, setEffectiveSchedules] = React.useState<Record<string, { scheduleId?: string | null; scheduleName?: string | null; startTime?: string | null; endTime?: string | null; punchInAllowedFrom?: string | null; punchInAllowedUntil?: string | null; punchOutAllowedFrom?: string | null; punchOutAllowedUntil?: string | null; graceMinutes?: number | null; breakMinutes?: number | null; requiredWorkingMinutes?: number | null; source?: string }>>({});
  const [attendanceStats, setAttendanceStats] = React.useState({
    present: 0,
    absent: 0,
    leave: 0,
    wfh: 0,
    halfDay: 0,
    exceptions: 0,
    members: { Present: [] as string[], Absent: [] as string[], WFH: [] as string[], Leave: [] as string[], "Half Day": [] as string[] },
  });

  const handleStatsChange = React.useCallback((nextStats: typeof attendanceStats) => {
    setAttendanceStats((prev) => {
      if (
        prev.present === nextStats.present &&
        prev.absent === nextStats.absent &&
        prev.leave === nextStats.leave &&
        prev.wfh === nextStats.wfh &&
        prev.halfDay === nextStats.halfDay &&
        prev.exceptions === nextStats.exceptions &&
        prev.members.Present.length === nextStats.members.Present.length &&
        prev.members.Absent.length === nextStats.members.Absent.length &&
        prev.members.WFH.length === nextStats.members.WFH.length &&
        prev.members.Leave.length === nextStats.members.Leave.length &&
        prev.members["Half Day"].length === nextStats.members["Half Day"].length
      ) {
        return prev;
      }
      return nextStats;
    });
  }, []);
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
  const [pendingCorrections, setPendingCorrections] = React.useState<any[]>([]);
  const [pendingCorrectionQueueOpen, setPendingCorrectionQueueOpen] = React.useState(false);
  const [resolutionNote, setResolutionNote] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [correctionTab, setCorrectionTab] = React.useState<"submit" | "history">("submit");
  const [historyFilter, setHistoryFilter] = React.useState<"ALL" | "Pending" | "Approved" | "Rejected">("ALL");
  const debouncedSearch = useDebounce(searchValue, 500);

  const pendingCorrectionCount = React.useMemo(
    () => correctionRequests.filter((r) => r.status === "Pending").length,
    [correctionRequests],
  );

  const filteredCorrectionRequests = React.useMemo(() => {
    if (historyFilter === "ALL") return correctionRequests;
    return correctionRequests.filter((r) => r.status === historyFilter);
  }, [correctionRequests, historyFilter]);

  useEffect(() => {
    const handleReportCorrectionEvent = (e: any) => {
      if (e.detail?.date) {
        setCorrectionDate(e.detail.date);
        setCorrectionTab("submit");
        const el = document.getElementById("attendance-correction-card");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("report-attendance-correction", handleReportCorrectionEvent);
    return () => {
      window.removeEventListener("report-attendance-correction", handleReportCorrectionEvent);
    };
  }, []);

  useEffect(() => {
    setPageTitle(canViewAllAttendance ? "Attendance Report" : "My Attendance");
  }, [canViewAllAttendance, setPageTitle]);

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
          departmentId: selectedDepartmentId ? [selectedDepartmentId] : [],
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
  }, [canViewAllAttendance, debouncedSearch, selectedDepartmentId, userData?.userId]);

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

  const loadPendingCorrectionRequests = React.useCallback(async () => {
    if (!canViewAllAttendance) return;
    try {
      const response = await getRequest<{ items?: any[] }>("api/admin/attendance/correction-requests", {
        headers: { "Cache-Control": "no-cache" },
      });
      setPendingCorrections(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (error) {
      console.error("Unable to load pending attendance correction requests", error);
    }
  }, [canViewAllAttendance]);

  useEffect(() => {
    if (canViewAllAttendance) {
      void loadPendingCorrectionRequests();
    }
  }, [canViewAllAttendance, loadPendingCorrectionRequests, refreshTrigger]);

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

    const rawRequestId = typeof location.state === "string" ? location.state : null;
    const requestId = rawRequestId?.startsWith("attendance-review-")
      ? rawRequestId.substring("attendance-review-".length)
      : rawRequestId;
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
      setCorrectionTab("history");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const status = axiosError.response?.status;
      const backendMsg = axiosError.response?.data?.error || axiosError.response?.data?.message;

      if (status === 409) {
        toast.info("A correction request for this date is already pending. See your request status below.");
        await loadMyCorrectionRequests();
        setCorrectionTab("history");
      } else if (backendMsg) {
        toast.error(backendMsg);
      } else if (status === 404) {
        toast.error("Employee profile not found. Please contact HR.");
      } else {
        toast.error("Unable to send the correction request. Please try again or contact HR.");
      }
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const handleReviewCorrection = async (resolution: "Approved" | "Rejected") => {
    if (!reviewCorrection?.id) return;
    try {
      setSubmittingReview(true);
      await putRequest(`api/admin/attendance/correction-requests/${reviewCorrection.id}`, {
        resolution,
        note: resolutionNote.trim() || undefined,
      });
      toast.success(`Correction request ${resolution.toLowerCase()} successfully.`);
      setReviewCorrection(null);
      setResolutionNote("");
      setRefreshTrigger((prev) => prev + 1);
      await loadPendingCorrectionRequests();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to process correction request.";
      toast.error(errorMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const downloadMonthlyReport = () => {
    setExportModalOpen(true);
  };

  const employeesForCalendar = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const selectedDeptObj = departments.find((d) => d.departmentId === selectedDepartmentId);
    const selectedDeptName = selectedDeptObj?.name?.trim().toLowerCase();

    return Employee.filter((emp) => {
      const matchesSearch = !query || `${emp.fullName ?? ""} ${emp.employeeId ?? ""}`.toLowerCase().includes(query);
      const empDeptId = emp.departmentId || emp.department?.departmentId;
      const empDeptName = (
        typeof emp.department === "string"
          ? emp.department
          : emp.department?.en || emp.department?.name || ""
      ).trim().toLowerCase();

      const matchesDept =
        !selectedDepartmentId ||
        empDeptId === selectedDepartmentId ||
        (selectedDeptName && empDeptName === selectedDeptName);

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
      graceMinutes: effectiveSchedules[emp.userId]?.graceMinutes,
      breakMinutes: effectiveSchedules[emp.userId]?.breakMinutes,
      requiredWorkingMinutes: effectiveSchedules[emp.userId]?.requiredWorkingMinutes,
      scheduleSource: effectiveSchedules[emp.userId]?.source,
    }));
  }, [Employee, debouncedSearch, effectiveSchedules, selectedDepartmentId, departments]);

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
                Today's attendance overview
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
            ].filter((stat) => stat.title !== "WFH" || hasWfhAccess).map((stat) => (
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
                {canViewAllAttendance ? "Attendance Report" : "My Attendance"}
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
                    ? `Today \u00B7 ${dateRange.startDate.format("DD MMMM YYYY")}`
                    : selectedPeriod === "this-week"
                    ? `Week \u00B7 ${dateRange.startDate.format("DD MMM")} \u2013 ${dateRange.startDate.endOf("week").format("DD MMM YYYY")}`
                    : `Month \u00B7 ${dateRange.startDate.format("MMMM YYYY")}`}
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
                {canManageAttendance && (
                  <Button
                    variant="outlined"
                    startIcon={
                      <Badge
                        badgeContent={pendingCorrections.length}
                        color="error"
                        max={99}
                        sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16 } }}
                      >
                        <AssignmentTurnedInOutlined />
                      </Badge>
                    }
                    onClick={() => setPendingCorrectionQueueOpen(true)}
                    sx={{
                      height: 40,
                      minHeight: 40,
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: 13.5,
                      bgcolor: "background.paper",
                      borderColor: pendingCorrections.length > 0 ? "warning.main" : "divider",
                      color: pendingCorrections.length > 0 ? "warning.dark" : "text.primary",
                      whiteSpace: "nowrap",
                      px: 2,
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "warning.main",
                      },
                    }}
                  >
                    Corrections {pendingCorrections.length > 0 ? `(${pendingCorrections.length})` : ""}
                  </Button>
                )}
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

          {/* Filter Toolbar: cleanly aligned controls */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: canViewAllAttendance
                  ? "repeat(2, minmax(0, 1fr))"
                  : "repeat(2, minmax(0, 1fr))",
                md: canViewAllAttendance
                  ? "repeat(3, minmax(0, 1fr))"
                  : "minmax(200px, 260px) minmax(200px, 260px)",
                lg: canViewAllAttendance
                  ? "minmax(180px, 1.4fr) minmax(130px, 0.9fr) minmax(130px, 0.9fr) minmax(150px, 1fr) minmax(150px, 1fr)"
                  : "minmax(220px, 280px) minmax(220px, 280px)",
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
            )}

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
          {selectedPeriod === "this-week" && <Box sx={{ mb: 2, px: 1.5, py: 1, borderRadius: 2, bgcolor: "action.hover", color: "text.secondary", fontSize: 13, fontWeight: 700 }}>{`${dateRange.startDate.format("DD MMM")} \u2013 ${dateRange.startDate.endOf("week").format("DD MMM YYYY")} \u00B7 Full week view`}</Box>}
          {!canViewAllAttendance && canManageAttendance && <Typography color="text.secondary" sx={{ mb: 2 }}>You can manage attendance for yourself or assigned employees.</Typography>}

          <Box sx={{ mb: 3 }}>
            <AttendanceCalendarGrid
              key={`calendar-${refreshTrigger}-${calendarOffset}`}
              employees={employeesForCalendar}
              searchValue={debouncedSearch}
              onStatsChange={handleStatsChange}
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

      <CustomisedModal
        open={pendingCorrectionQueueOpen}
        handleClose={() => setPendingCorrectionQueueOpen(false)}
        title={
          <Stack direction="row" spacing={1.25} alignItems="center">
            <AssignmentTurnedInOutlined color="primary" />
            <Typography variant="h6" fontWeight={800}>
              Pending Attendance Corrections ({pendingCorrections.length})
            </Typography>
          </Stack>
        }
        maxWidth="md"
        fullWidth
      >
        {pendingCorrections.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center", borderRadius: 2, border: "1px dashed", borderColor: "divider" }}>
            <CheckCircleOutline sx={{ fontSize: 44, color: "success.main", mb: 1, opacity: 0.8 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              All caught up!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no pending attendance correction requests to review.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 480, overflowY: "auto", pr: 0.5 }}>
            <Stack spacing={1.5}>
              {pendingCorrections.map((req) => (
                <Card
                  key={req.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: "background.paper",
                    borderColor: "divider",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 4px 14px rgba(122, 73, 190, 0.08)",
                    },
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.75 }}>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {req.employeeName || "Employee"}
                        </Typography>
                        {req.employeeId && (
                          <Chip
                            size="small"
                            label={req.employeeId}
                            variant="outlined"
                            sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                          />
                        )}
                        <Chip
                          size="small"
                          label={`Date: ${dayjs(req.attendanceDate).format("DD MMM YYYY")}`}
                          color="primary"
                          sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", mb: 0.5 }}>
                        {req.reason}
                      </Typography>
                      {req.requestedAt && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTimeOutlined sx={{ fontSize: 12 }} />
                          Requested {dayjs(req.requestedAt).format("DD MMM YYYY, hh:mm A")}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setReviewCorrection(req);
                        setPendingCorrectionQueueOpen(false);
                      }}
                      sx={{
                        minWidth: 100,
                        height: 36,
                        borderRadius: "8px",
                        fontWeight: 700,
                        textTransform: "none",
                        alignSelf: { xs: "stretch", sm: "center" },
                      }}
                    >
                      Review
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </CustomisedModal>

      <CustomisedModal
        open={Boolean(reviewCorrection)}
        handleClose={() => {
          if (!submittingReview) {
            setReviewCorrection(null);
            setResolutionNote("");
          }
        }}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <AssignmentTurnedInOutlined color="primary" />
            <Typography variant="h6" fontWeight={800}>
              Review Attendance Correction
            </Typography>
          </Stack>
        }
        maxWidth="sm"
        fullWidth
      >
        {reviewCorrection && (
          <Stack spacing={2.5}>
            <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <Grid container spacing={1.5}>
                {reviewCorrection.employeeName && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">Employee</Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {reviewCorrection.employeeName} {reviewCorrection.employeeId ? `(${reviewCorrection.employeeId})` : ""}
                    </Typography>
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: reviewCorrection.employeeName ? 6 : 12 }}>
                  <Typography variant="caption" color="text.secondary">Attendance Date</Typography>
                  <Typography variant="body2" fontWeight={800}>
                    {dayjs(reviewCorrection.attendanceDate).format("dddd, DD MMMM YYYY")}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Requested Issue / Reason</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5, fontWeight: 500 }}>
                    {reviewCorrection.reason}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Resolution Note (Optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Reason or remarks for approval or rejection..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                disabled={submittingReview}
              />
            </Box>

            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.08), border: "1px solid", borderColor: alpha(theme.palette.info.main, 0.2) }}>
              <Typography variant="caption" color="info.dark" sx={{ display: "block", fontWeight: 600 }}>
                • Approving will mark attendance as Present (P) with standard shift punch times.
              </Typography>
              <Typography variant="caption" color="info.dark" sx={{ display: "block", fontWeight: 600 }}>
                • Monthly penalties are automatically recalculated and payroll readiness is unblocked.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setReviewCorrection(null);
                  setResolutionNote("");
                }}
                disabled={submittingReview}
                sx={{ borderRadius: "8px" }}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleReviewCorrection("Rejected")}
                disabled={submittingReview}
                startIcon={submittingReview ? <CircularProgress size={16} color="inherit" /> : <HighlightOffOutlined />}
                sx={{ borderRadius: "8px", fontWeight: 700 }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleReviewCorrection("Approved")}
                disabled={submittingReview}
                startIcon={submittingReview ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutline />}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 700,
                  bgcolor: "success.main",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "success.dark" },
                }}
              >
                Approve & Regularize
              </Button>
            </Stack>
          </Stack>
        )}
      </CustomisedModal>

      {!canViewAllAttendance && (
        <Grid size={{ xs: 12 }} sx={{ order: 4 }}>
          <Card
            id="attendance-correction-card"
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.16),
              boxShadow: (t) =>
                t.palette.mode === "dark"
                  ? "0 10px 30px 0 rgba(0, 0, 0, 0.45)"
                  : "0 12px 32px rgba(71, 46, 117, 0.08)",
              bgcolor: "background.paper",
              backdropFilter: "blur(20px)",
              overflow: "hidden",
            }}
          >
            {/* Header: Title, Subtitle, and Segmented Navigation Tabs */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              sx={{
                pb: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                mb: 2.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    color: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    flexShrink: 0,
                  }}
                >
                  <AssignmentTurnedInOutlined sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.25, fontSize: "1.05rem" }}>
                    Attendance Correction
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem", mt: 0.25 }}>
                    Request regularization for missed punches or attendance discrepancies
                  </Typography>
                </Box>
              </Stack>

              {/* Segmented Pill Tabs */}
              <Tabs
                value={correctionTab}
                onChange={(_, val) => setCorrectionTab(val)}
                sx={{
                  minHeight: 38,
                  bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
                  p: 0.5,
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "divider",
                  width: { xs: "100%", sm: "auto" },
                  "& .MuiTabs-indicator": {
                    display: "none",
                  },
                  "& .MuiTab-root": {
                    minHeight: 30,
                    py: 0.5,
                    px: 1.75,
                    borderRadius: "8px",
                    fontSize: "0.825rem",
                    fontWeight: 700,
                    textTransform: "none",
                    color: "text.secondary",
                    transition: "all 0.18s ease",
                    flex: { xs: 1, sm: "initial" },
                    "&.Mui-selected": {
                      color: "primary.main",
                      bgcolor: "background.paper",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    },
                  },
                }}
              >
                <Tab
                  value="submit"
                  icon={<SendRounded sx={{ fontSize: 15 }} />}
                  iconPosition="start"
                  label="Report Issue"
                />
                <Tab
                  value="history"
                  icon={<HistoryOutlined sx={{ fontSize: 16 }} />}
                  iconPosition="start"
                  label={
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <span>My Requests</span>
                      {correctionRequests.length > 0 && (
                        <Chip
                          size="small"
                          label={correctionRequests.length}
                          sx={{
                            height: 18,
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            bgcolor:
                              pendingCorrectionCount > 0
                                ? alpha(theme.palette.warning.main, 0.16)
                                : alpha(theme.palette.primary.main, 0.12),
                            color:
                              pendingCorrectionCount > 0
                                ? "warning.dark"
                                : "primary.main",
                          }}
                        />
                      )}
                    </Stack>
                  }
                />
              </Tabs>
            </Stack>

            {/* TAB 1: Submit Correction Form */}
            {correctionTab === "submit" && (
              <Box
                component="form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitCorrection();
                }}
              >
                {/* Minimal 1-line guidance banner */}
                <Box
                  sx={{
                    px: 1.75,
                    py: 1.25,
                    mb: 2.5,
                    borderRadius: 2,
                    bgcolor: (t) => t.palette.mode === "dark" ? "rgba(14, 165, 233, 0.08)" : "#f0f9ff",
                    border: "1px solid",
                    borderColor: (t) => t.palette.mode === "dark" ? "rgba(14, 165, 233, 0.22)" : "#bae6fd",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                  }}
                >
                  <InfoOutlined sx={{ fontSize: 18, color: "#0284c7", flexShrink: 0 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.825rem",
                      color: (t) => t.palette.mode === "dark" ? "#e0f2fe" : "#0369a1",
                      lineHeight: 1.4,
                    }}
                  >
                    Approved corrections automatically regularize the day to Present with shift timings and recalculate monthly hours.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {/* Attendance Date (Balanced 50/50 on sm+) */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomisedDatePicker
                      label="Attendance date"
                      value={correctionDate ? dayjs(correctionDate) : null}
                      setValue={(date) =>
                        setCorrectionDate(date ? date.format("YYYY-MM-DD") : "")
                      }
                      maxDate={dayjs()}
                      format="DD/MM/YYYY"
                      clearable
                      required
                    />
                  </Grid>

                  {/* Issue Type */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      label="Issue type"
                      value={correctionType}
                      onChange={(e) => setCorrectionType(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: 40,
                          bgcolor: "background.paper",
                        },
                      }}
                    >
                      <MenuItem value="Incorrect status">Incorrect status (marked absent)</MenuItem>
                      <MenuItem value="Missing check-in">Missing punch in</MenuItem>
                      <MenuItem value="Missing check-out">Missing punch out</MenuItem>
                      <MenuItem value="Incorrect working hours">Incorrect working hours</MenuItem>
                      <MenuItem value="Half day regularization">Half day regularization</MenuItem>
                      <MenuItem value="Other">Other discrepancy</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Quick Reason Suggestions */}
                  <Grid size={{ xs: 12 }}>
                    <Stack spacing={0.75}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Quick reason tags (click to add):
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gap: 0.75 }}>
                        {[
                          "Forgot to punch in at shift start",
                          "Biometric device did not register fingerprint",
                          "Forgot to punch out before leaving",
                          "On-site client meeting during shift hours",
                          "System error marked absent while present",
                        ].map((preset) => (
                          <Chip
                            key={preset}
                            label={preset}
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setCorrectionReason((prev) =>
                                prev.trim() ? `${prev.trim()}\n${preset}.` : `${preset}.`
                              );
                            }}
                            sx={{
                              borderRadius: "16px",
                              cursor: "pointer",
                              fontSize: "0.76rem",
                              height: 26,
                              borderColor: "divider",
                              bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                              transition: "all 0.15s ease",
                              "&:hover": {
                                borderColor: "primary.main",
                                bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                                color: "primary.main",
                              },
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </Grid>

                  {/* Description Textarea */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Describe the correction needed"
                      placeholder="Briefly explain the reason for regularization (e.g. biometric machine was offline at 9:30 AM)..."
                      value={correctionReason}
                      onChange={(e) => setCorrectionReason(e.target.value)}
                      helperText={`${correctionReason.length}/1000 characters`}
                      inputProps={{ maxLength: 1000 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "background.paper",
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Form Action Footer */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="space-between"
                  sx={{ mt: 2.5, pt: 2, borderTop: "1px solid", borderColor: "divider" }}
                >
                  <Typography variant="caption" color="text.secondary">
                    * Submitting notifies HR Manager for review. Attendance stays unchanged until approved.
                  </Typography>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      submittingCorrection || !correctionDate || !correctionReason.trim()
                    }
                    startIcon={
                      submittingCorrection ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <SendRounded sx={{ fontSize: 18 }} />
                      )
                    }
                    sx={{
                      minHeight: 40,
                      px: 3,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: "none",
                      boxShadow: "0 4px 14px rgba(11, 92, 171, 0.25)",
                    }}
                  >
                    {submittingCorrection ? "Submitting..." : "Submit Request"}
                  </Button>
                </Stack>
              </Box>
            )}

            {/* TAB 2: Request History & Status */}
            {correctionTab === "history" && (
              <Box>
                {/* Status Filter Chips */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gap: 0.75 }}>
                    {(["ALL", "Pending", "Approved", "Rejected"] as const).map((filter) => {
                      const count =
                        filter === "ALL"
                          ? correctionRequests.length
                          : correctionRequests.filter((r) => r.status === filter).length;
                      const isSelected = historyFilter === filter;
                      return (
                        <Chip
                          key={filter}
                          label={`${filter === "ALL" ? "All Requests" : filter} (${count})`}
                          size="small"
                          onClick={() => setHistoryFilter(filter)}
                          variant={isSelected ? "filled" : "outlined"}
                          color={
                            filter === "Approved"
                              ? "success"
                              : filter === "Rejected"
                              ? "error"
                              : filter === "Pending"
                              ? "warning"
                              : "primary"
                          }
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            height: 28,
                            borderRadius: "16px",
                            cursor: "pointer",
                          }}
                        />
                      );
                    })}
                  </Stack>

                  <Typography variant="caption" color="text.secondary">
                    Showing {filteredCorrectionRequests.length} of {correctionRequests.length} requests
                  </Typography>
                </Stack>

                {filteredCorrectionRequests.length > 0 ? (
                  <Grid container spacing={2}>
                    {filteredCorrectionRequests.map((request) => {
                      const isApproved = request.status === "Approved";
                      const isRejected = request.status === "Rejected";
                      const isPending = request.status === "Pending";

                      return (
                        <Grid key={request.id} size={{ xs: 12, md: 6 }}>
                          <Card
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2.5,
                              bgcolor: "background.paper",
                              borderColor: isApproved
                                ? alpha(theme.palette.success.main, 0.3)
                                : isRejected
                                ? alpha(theme.palette.error.main, 0.3)
                                : alpha(theme.palette.warning.main, 0.4),
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                              display: "flex",
                              flexDirection: "column",
                              height: "100%",
                              transition: "transform 0.18s ease, box-shadow 0.18s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
                              },
                            }}
                          >
                            {/* Card Header: Date & Status Badge */}
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mb: 1.5 }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <CalendarTodayIcon
                                  fontSize="small"
                                  sx={{ color: "primary.main", fontSize: 16 }}
                                />
                                <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: "0.875rem" }}>
                                  {dayjs(request.attendanceDate).format("dddd, DD MMMM YYYY")}
                                </Typography>
                              </Stack>
                              <Chip
                                size="small"
                                icon={
                                  isApproved ? (
                                    <CheckCircleOutline sx={{ fontSize: "14px !important" }} />
                                  ) : isRejected ? (
                                    <HighlightOffOutlined sx={{ fontSize: "14px !important" }} />
                                  ) : (
                                    <AccessTimeOutlined sx={{ fontSize: "14px !important" }} />
                                  )
                                }
                                label={
                                  isApproved
                                    ? "Approved"
                                    : isRejected
                                    ? "Rejected"
                                    : "Pending Review"
                                }
                                color={
                                  isApproved
                                    ? "success"
                                    : isRejected
                                    ? "error"
                                    : "warning"
                                }
                                variant={isPending ? "outlined" : "filled"}
                                sx={{
                                  height: 22,
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  borderRadius: "12px",
                                }}
                              />
                            </Stack>

                            {/* Card Body: Reason */}
                            <Box sx={{ mb: 1.5, flex: 1 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={700}
                                sx={{ display: "block", mb: 0.5, fontSize: "0.75rem" }}
                              >
                                Requested Correction:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "pre-wrap",
                                  color: "text.primary",
                                  fontSize: "0.825rem",
                                  lineHeight: 1.5,
                                  p: 1.25,
                                  borderRadius: 1.5,
                                  bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                                  border: "1px solid",
                                  borderColor: (t) => t.palette.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(226, 232, 240, 0.8)",
                                }}
                              >
                                {request.reason}
                              </Typography>
                            </Box>

                            {/* HR Resolution Note */}
                            {request.resolutionNote && (
                              <Box
                                sx={{
                                  mt: "auto",
                                  mb: 1.5,
                                  p: 1.25,
                                  borderRadius: 1.5,
                                  bgcolor: isApproved
                                    ? alpha(theme.palette.success.main, 0.08)
                                    : alpha(theme.palette.error.main, 0.08),
                                  border: "1px solid",
                                  borderColor: isApproved
                                    ? alpha(theme.palette.success.main, 0.25)
                                    : alpha(theme.palette.error.main, 0.25),
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  fontWeight={800}
                                  color={isApproved ? "success.dark" : "error.dark"}
                                  sx={{ display: "block", fontSize: "0.75rem" }}
                                >
                                  HR Resolution Note:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: "0.8rem",
                                    color: "text.primary",
                                    mt: 0.25,
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {request.resolutionNote}
                                </Typography>
                              </Box>
                            )}

                            {/* Card Footer: Timestamps */}
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{
                                pt: 1,
                                borderTop: "1px dashed",
                                borderColor: "divider",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.72rem" }}
                              >
                                {request.createdAtUtc
                                  ? `Submitted on ${dayjs(request.createdAtUtc).format("DD MMM YYYY, hh:mm A")}`
                                  : "Submitted recently"}
                              </Typography>
                              {request.reviewedAtUtc && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.72rem", fontWeight: 600 }}
                                >
                                  Reviewed on {dayjs(request.reviewedAtUtc).format("DD MMM YYYY, hh:mm A")}
                                </Typography>
                              )}
                            </Stack>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      py: 5,
                      px: 2,
                      textAlign: "center",
                      borderRadius: 3,
                      border: "1px dashed",
                      borderColor: (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.12)"
                          : "rgba(203, 213, 225, 0.8)",
                      bgcolor: (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.02)"
                          : "#f8fafc",
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        mx: "auto",
                        mb: 1.25,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: "primary.main",
                      }}
                    >
                      <HistoryOutlined sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: "0.95rem" }}>
                      {historyFilter === "ALL"
                        ? "No attendance correction requests yet"
                        : `No ${historyFilter.toLowerCase()} correction requests`}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ maxWidth: 420, mx: "auto", mt: 0.5, mb: 2, fontSize: "0.825rem" }}
                    >
                      {historyFilter === "ALL"
                        ? "If you notice an incorrect status or missed punches, submit a request to get it regularized."
                        : `You do not have any requests with "${historyFilter}" status at this time.`}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SendRounded sx={{ fontSize: 16 }} />}
                      onClick={() => setCorrectionTab("submit")}
                      sx={{ borderRadius: "8px", fontWeight: 700, textTransform: "none", px: 2 }}
                    >
                      Submit Correction Request
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Card>
        </Grid>
      )}

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
