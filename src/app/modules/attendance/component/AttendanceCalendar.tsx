import { FC, useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Avatar,
  Stack,
  Typography,
  MenuItem,
  Tooltip,
  Card,
  Chip,
  TablePagination,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import dayjs, { Dayjs } from "dayjs";
import { getHolidays } from "../../holidays/calendarServices";
import { HolidayPayload, HolidayModel } from "../../holidays/models";
import { formatIndianTime, formatServerDate } from "../../../../utils/common";
import { addEditAttendance, getAllAttendance } from "../AttendanceServices";
import {
  AdminAttendanceCreateDto,
  AttendanceStatus,
} from "../AttendanceModels";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CelebrationIcon from "@mui/icons-material/Celebration";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import { GetLeaveRequestPayLoad, LeaveRequestModel } from "../../leaves/model";
import { LEAVE_REQUEST_STATUS } from "../../../../utils/enums";
import { getAllLeaveRequest } from "../../leaves/leaveServices";
import { getRequest } from "../../../../server/axios";
import { ResponseData } from "../../../../utils/common_types";
import { AttendanceStatusSetting } from "../AttendanceStatusSettings";
import MonthlyAttendanceExceptions from "./MonthlyAttendanceExceptions";
import { AttendanceDateRange } from "../attendancePeriod";
import {
  buildAttendanceStatusColorMap,
  DEFAULT_ATTENDANCE_STATUS_COLOR,
  resolveAttendanceStatusColor,
  toAlphaHex,
} from "../attendanceStatusColors";
import {
  ATTENDANCE_DATE_COLUMN_WIDTH,
  ATTENDANCE_EMPLOYEE_COLUMN_WIDTH,
  buildAttendanceGridScrollContainerSx,
} from "../attendanceGridLayout";
import {
  formatTimePreset,
  timeToMinutes,
  formatMinutesToTime,
  deriveAttendanceStatus,
  getDerivedStatusExplanation,
} from "../attendanceStatusCalculation";

import { AppButton, AppTextField } from "../../../shared/components/ui";
interface Employee {
  name: string;
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  dateOfJoining?: string | null;
  lastWorkingDate?: string | null;
  employmentStatus?: string | null;
  availabilityStatus?: string | null;
  scheduleId?: string | null;
  scheduleName?: string | null;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  punchInAllowedFrom?: string | null;
  punchInAllowedUntil?: string | null;
  punchOutAllowedFrom?: string | null;
  punchOutAllowedUntil?: string | null;
  scheduleSource?: string | null;
}
interface AttendanceRow {
  id: string;
  employeeId: string;
  name: string;
  [key: string]: any;
}

interface AttendanceData {
  status: AttendanceStatus | "";
  checkIn: string;
  checkOut: string;
  remarks: string;
  sourceType?: string | null;
  sourceId?: string | null;
  scheduleId?: string | null;
  isDaySegment?: boolean;
  segment?: string | null;
  halfDaySegments?: Partial<
    Record<"FIRST_HALF" | "SECOND_HALF", AttendanceSegmentData>
  >;
}

interface AttendanceSegmentData {
  status: AttendanceStatus | string;
  sourceType?: string | null;
  sourceId?: string | null;
}

const attendanceStatusOptions: Array<{
  value: AttendanceStatus;
  label: string;
  requiresTime?: boolean;
  colorHex?: string;
}> = [
  { value: "P", label: "Present", colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR },
  { value: "A", label: "Absent", colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR },
  {
    value: "SL",
    label: "Sick Leave",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  {
    value: "CL",
    label: "Casual Leave",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  {
    value: "EL",
    label: "Earned Leave",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  {
    value: "WFH",
    label: "Work From Home",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  { value: "HD", label: "Half Day", colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR },
  {
    value: "ED",
    label: "Early Departure",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  {
    value: "LHD",
    label: "Late Arrival-Half Day",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  {
    value: "WFH+WFO",
    label: "Half WFH and Half WFO",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  {
    value: "COMP-OFF",
    label: "Compensatory Off",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  {
    value: "CL-HALF",
    label: "Casual Leave (Half Day)",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  {
    value: "SL-HALF",
    label: "Sick Leave (Half Day)",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  {
    value: "WFH-HD",
    label: "WFH with Half Day",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
  {
    value: "MED",
    label: "Medical Leave",
    colorHex: "#0D9488",
  },
  {
    value: "ML",
    label: "Maternity Leave",
    colorHex: "#7C3AED",
  },
  {
    value: "SAB",
    label: "Sabbatical Leave",
    colorHex: "#6366F1",
  },
  {
    value: "UL",
    label: "Unpaid Leave",
    colorHex: "#DC2626",
  },
  {
    value: "LHD+ED",
    label: "Late Arrival + Early Departure",
    colorHex: DEFAULT_ATTENDANCE_STATUS_COLOR,
  },
];

const attendanceStatusLabels = Object.fromEntries(
  attendanceStatusOptions.map(({ value, label }) => [value, label]),
) as Record<AttendanceStatus, string>;

const statusesWithTimes = new Set<AttendanceStatus>([
  "P",
  "WFH",
  "HD",
  "ED",
  "LHD",
  "LC",
  "EHD",
  "LHD+ED",
  "WFH+WFO",
  "WFH-HD",
  "WFH+SL",
  "WFH+CL",
]);

const createPunchPresets = (from?: string | null, until?: string | null, fallback?: string | null) => {
  const start = timeToMinutes(from ?? fallback);
  const end = timeToMinutes(until ?? fallback);
  if (start === null || end === null || end < start) return fallback ? [fallback] : [];
  return Array.from({ length: Math.floor((end - start) / 15) + 1 }, (_, index) => {
    const minutes = start + index * 15;
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  });
};

// Leave and WFH statuses are owned by their respective request workflows.
// Letting the generic attendance editor write one of these values would create
// a visual attendance result without the leave balance, approval history, or
// request-owned audit trail that payroll relies on.
const workflowOwnedStatusCodes = new Set([
  "SL", "CL", "EL", "UL", "COMP-OFF", "WFH", "WFH+WFO", "WFH-HD",
  "WFH+SL", "WFH+CL", "CL-HALF", "SL-HALF", "MED", "ML", "SAB",
]);

const isManualAttendanceStatus = (code: string) =>
  !workflowOwnedStatusCodes.has(code.trim().toUpperCase());

const manualAttendanceStatusOptions = attendanceStatusOptions.filter((option) =>
  isManualAttendanceStatus(option.value),
);

interface Props {
  employees: Employee[];
  searchValue: string;
  dateRange: AttendanceDateRange;
  showWholeMonth?: boolean;
  showWholeWeek?: boolean;
  // Company view is independent from mutation authority. A reviewer can see
  // the company grid without gaining edit, bulk, or exception controls.
  companyView?: boolean;
  readOnly?: boolean;
  scheduleIdFilter?: string;
  onStatsChange?: (stats: {
    present: number;
    absent: number;
    leave: number;
    wfh: number;
    halfDay: number;
    exceptions: number;
    members: {
      Present: string[];
      Absent: string[];
      WFH: string[];
      Leave: string[];
      "Half Day": string[];
    };
  }) => void;
}

/* ---------------- INITIAL MODAL STATE ---------------- */

const initialModalState: AttendanceData = {
  status: "",
  checkIn: "",
  checkOut: "",
  remarks: "",
};

/* ---------------- COMPONENT ---------------- */

export const AttendanceCalendarGrid: FC<Props> = ({
  employees,
  dateRange,
  showWholeMonth = false,
  showWholeWeek = false,
  companyView = false,
  searchValue,
  readOnly = false,
  scheduleIdFilter = "",
  onStatsChange,
}) => {
  const theme = useTheme();
  const isCompactAttendanceGrid = useMediaQuery(theme.breakpoints.down("md"));
  const employeeColumnWidth = isCompactAttendanceGrid
    ? 148
    : ATTENDANCE_EMPLOYEE_COLUMN_WIDTH;
  const dateColumnWidth = isCompactAttendanceGrid
    ? 64
    : ATTENDANCE_DATE_COLUMN_WIDTH;
  // A weekly grid fits on desktop, but flexing seven date columns into a phone
  // viewport makes every date unreadable. On compact screens it stays a grid
  // and scrolls horizontally instead.
  const fitDateColumns = showWholeWeek && !isCompactAttendanceGrid;
  const attendanceDatesPaneRef = useRef<HTMLDivElement>(null);
  const attendanceHorizontalScrollbarRef = useRef<HTMLDivElement>(null);
  const attendanceEmployeesPaneRef = useRef<HTMLDivElement>(null);
  const isSynchronizingAttendanceScroll = useRef(false);
  const isSynchronizingAttendanceVerticalScroll = useRef(false);
  const [statusOptions, setStatusOptions] = useState(manualAttendanceStatusOptions);
  const [allStatusSettings, setAllStatusSettings] = useState<AttendanceStatusSetting[]>([]);

  const syncAttendanceHorizontalScroll = (
    source: HTMLDivElement,
    target: HTMLDivElement | null,
  ) => {
    if (
      !target ||
      isSynchronizingAttendanceScroll.current ||
      target.scrollLeft === source.scrollLeft
    )
      return;

    isSynchronizingAttendanceScroll.current = true;
    target.scrollLeft = source.scrollLeft;
    requestAnimationFrame(() => {
      isSynchronizingAttendanceScroll.current = false;
    });
  };
  const syncAttendanceVerticalScroll = (
    source: HTMLDivElement,
    target: HTMLDivElement | null,
  ) => {
    if (
      !target ||
      isSynchronizingAttendanceVerticalScroll.current ||
      target.scrollTop === source.scrollTop
    )
      return;

    isSynchronizingAttendanceVerticalScroll.current = true;
    target.scrollTop = source.scrollTop;
    requestAnimationFrame(() => {
      isSynchronizingAttendanceVerticalScroll.current = false;
    });
  };
  const attendanceStatusColorMap = useMemo(() => {
    const baseList = attendanceStatusOptions.map((status) => ({
      code: status.value,
      colorHex: status.colorHex,
    }));
    const configuredList = allStatusSettings.map((status) => ({
      code: status.code,
      colorHex: status.colorHex,
    }));
    return buildAttendanceStatusColorMap([...baseList, ...configuredList]);
  }, [allStatusSettings]);

  const getStatusColor = (status?: string | null) =>
    resolveAttendanceStatusColor(status, attendanceStatusColorMap);

  useEffect(() => {
    const loadStatusOptions = async () => {
      try {
        const { data } = await getRequest<
          ResponseData<AttendanceStatusSetting>
        >("api/attendance-status-settings?activeOnly=true");
        const settings = data.methodResults ?? [];
        setAllStatusSettings(settings);
        setStatusOptions(
          settings.length > 0
            ? settings
                .filter((x) => isManualAttendanceStatus(x.code))
                .map((x) => ({
                  value: x.code as AttendanceStatus,
                  label: x.name,
                  requiresTime: x.requiresTime,
                  colorHex: x.colorHex || DEFAULT_ATTENDANCE_STATUS_COLOR,
                }))
            : manualAttendanceStatusOptions,
        );
      } catch {
        setStatusOptions(manualAttendanceStatusOptions);
      }
    };

    void loadStatusOptions();

    const refreshStatusOptions = () => {
      void loadStatusOptions();
    };

    window.addEventListener(
      "attendance-status-settings-updated",
      refreshStatusOptions,
    );
    return () =>
      window.removeEventListener(
        "attendance-status-settings-updated",
        refreshStatusOptions,
      );
  }, []);
  const [attendanceData, setAttendanceData] = useState<
    Record<string, AttendanceData>
  >({});
  const [selectedCell, setSelectedCell] = useState<{
    employee: AttendanceRow;
    dateObj: Date;
  } | null>(null);

  const [modalData, setModalData] = useState<AttendanceData>(initialModalState);
  const scheduleTimePresets = useMemo(() => {
    const employee = selectedCell?.employee;
    const checkInPresets = createPunchPresets(employee?.punchInAllowedFrom, employee?.punchInAllowedUntil, employee?.scheduledStartTime || "09:00");
    const checkOutPresets = createPunchPresets(employee?.punchOutAllowedFrom, employee?.punchOutAllowedUntil, employee?.scheduledEndTime || "18:00");
    const defaultIn = ["09:00", "09:15", "09:30", "10:00", "13:30"];
    const defaultOut = ["13:30", "14:00", "16:00", "17:30", "18:00"];

    return {
      checkIn: checkInPresets.length > 1 ? checkInPresets : defaultIn,
      checkOut: checkOutPresets.length > 1 ? checkOutPresets : defaultOut,
    };
  }, [selectedCell]);

  const handlePunchInChange = useCallback((newInTime: string) => {
    setModalData((prev) => {
      const derived = deriveAttendanceStatus(
        newInTime,
        prev.checkOut,
        selectedCell?.employee,
        statusOptions,
      );
      return {
        ...prev,
        checkIn: newInTime,
        status: derived ?? prev.status,
      };
    });
  }, [selectedCell, statusOptions]);

  const handlePunchOutChange = useCallback((newOutTime: string) => {
    setModalData((prev) => {
      const derived = deriveAttendanceStatus(
        prev.checkIn,
        newOutTime,
        selectedCell?.employee,
        statusOptions,
      );
      return {
        ...prev,
        checkOut: newOutTime,
        status: derived ?? prev.status,
      };
    });
  }, [selectedCell, statusOptions]);
  const [holidays, setHolidays] = useState<Set<string>>(new Set());
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0, 6]);
  useEffect(() => {
    getRequest<{ offDays: number[] }>("api/attendance/weekly-offs")
      .then(({ data }) => setWeeklyOffDays(data.offDays))
      .catch(() => setWeeklyOffDays([0, 6]));
  }, []);

  const today = useMemo(() => dayjs().startOf("day"), []);
  const lastStatsRef = useRef<string>("");
  const visibleDates = useMemo(() => {
    const dates: Dayjs[] = [];
    const displayEndDate = showWholeMonth
      ? dateRange.startDate.endOf("month").startOf("day")
      : showWholeWeek
        ? dateRange.startDate.endOf("week").startOf("day")
        : dateRange.endDate.startOf("day");
    for (
      let date = dateRange.startDate.startOf("day");
      !date.isAfter(displayEndDate, "day");
      date = date.add(1, "day")
    )
      dates.push(date);
    return dates;
  }, [dateRange.endDate, dateRange.startDate, showWholeMonth, showWholeWeek]);
  const isSingleDay = visibleDates.length === 1;
  const displayEndDate = visibleDates.at(-1) ?? dateRange.endDate;
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    title: string;
    content: string;
  }>({
    open: false,
    title: "",
    content: "",
  });

  const normalizeUserId = useCallback(
    (userId?: string) => (userId ?? "").toString().trim().toLowerCase(),
    [],
  );
  const resolveRowId = useCallback(
    (emp: Employee) => normalizeUserId(emp.userId || emp.id),
    [normalizeUserId],
  );
  const [attendanceItems, setAttendanceItems] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestModel[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const handleExceptionEdit = (event: Event) => {
      const detail = (
        event as CustomEvent<{ employeeId: string; date: string }>
      ).detail;
      if (!detail?.employeeId || !detail?.date) return;

      const employeeIndex = employees.findIndex(
        (employee) => employee.employeeId === detail.employeeId,
      );
      if (employeeIndex < 0) {
        setConfirmationModal({
          open: true,
          title: "Employee not found",
          content: `Employee ${detail.employeeId} is not available in the attendance table.`,
        });
        return;
      }

      const employee = employees[employeeIndex];
      const affectedDate = dayjs(detail.date);
      if (!affectedDate.isValid()) return;
      const joiningDate = employee.dateOfJoining
        ? dayjs(employee.dateOfJoining).startOf("day")
        : null;
      if (joiningDate?.isValid() && affectedDate.isBefore(joiningDate, "day")) {
        setConfirmationModal({
          open: true,
          title: "Not applicable",
          content: `Attendance cannot be marked before the employee's joining date of ${joiningDate.format("DD MMM YYYY")}.`,
        });
        return;
      }

      setPage(Math.floor(employeeIndex / rowsPerPage));
      setSelectedCell({
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          name: employee.name,
        },
        dateObj: affectedDate.toDate(),
      });

      window.setTimeout(() => {
        document.querySelector(".data-grid-parent-container")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    };

    window.addEventListener("edit-attendance-exception", handleExceptionEdit);
    return () =>
      window.removeEventListener(
        "edit-attendance-exception",
        handleExceptionEdit,
      );
  }, [employees, rowsPerPage]);

  useEffect(() => {
    const refreshAfterExceptionResolution = () =>
      setReloadKey((value) => value + 1);
    window.addEventListener(
      "attendance-exception-resolved",
      refreshAfterExceptionResolution,
    );
    return () =>
      window.removeEventListener(
        "attendance-exception-resolved",
        refreshAfterExceptionResolution,
      );
  }, []);

  /*---------------------------------LEave------------------------------- */

  useEffect(() => {
    if (employees.length === 0) return;

    const fetchAllData = async () => {
      try {
        /* ------------------ LEAVES ------------------ */
        let leaveItems: LeaveRequestModel[] = [];
        const approvedWfhById = new Map<
          string,
          { fromDate: string; toDate: string }
        >();
        if (companyView) {
          const leavePayload: GetLeaveRequestPayLoad = {
            pageNo: 1,
            pageSize: 1000,
            startDate: dateRange.startDate,
            endDate: displayEndDate,
            status: LEAVE_REQUEST_STATUS.APPROVED,
          };

          const leaveResponse = await getAllLeaveRequest(leavePayload);
          leaveItems = leaveResponse?.data?.methodResults ?? [];
          setLeaveRequests(leaveItems);
          // A legacy WFH attendance row can have been serialized at the previous
          // UTC day. The approved request owns the business date, just as an
          // approved leave request does, so use it for one-day WFH rows.
          try {
            const wfhResponse = await getRequest<{
              methodResults?: Array<{
                requestId: string;
                fromDate: string;
                toDate: string;
                status: string;
              }>;
            }>("api/wfh/requests/all");
            (wfhResponse.data.methodResults ?? [])
              .filter((request) => request.status === "Approved")
              .forEach((request) =>
                approvedWfhById.set(request.requestId, request),
              );
          } catch {
            // Attendance remains usable for viewers without WFH-all permission.
          }
        } else {
          setLeaveRequests([]);
        }

        /* ------------------ HOLIDAYS ------------------ */
        const holidayPayload: HolidayPayload = {
          fromDate: dateRange.startDate,
          toDate: displayEndDate,
        };

        const holidayResponse = await getHolidays(holidayPayload);
        const holidayDates =
          holidayResponse?.data?.methodResults?.map((h: HolidayModel) =>
            formatServerDate(h.date, "YYYY-MM-DD"),
          ) ?? [];

        setHolidays(new Set(holidayDates));

        /* ------------------ ATTENDANCE ------------------ */
        const attendancePayload = {
          fromDate: dateRange.startDate.format("YYYY-MM-DD"),
          toDate: displayEndDate.format("YYYY-MM-DD"),
          userIds: employees.map((e) => e.userId || e.id).filter(Boolean),
        };

        const attendanceResponse = !companyView
          ? await Promise.all(
              Array.from(
                new Set(
                  visibleDates.map(
                    (date) => `${date.year()}-${date.month() + 1}`,
                  ),
                ),
              ).map((period) => {
                const [year, month] = period.split("-");
                return getRequest<{ items?: any[] }>(
                  `api/attendance/me/grid?year=${year}&month=${month}`,
                  {
                    headers: { "Cache-Control": "no-cache" },
                  },
                );
              }),
            )
          : await getAllAttendance(attendancePayload);
        // Current calendar endpoints return { items }.  Older deployed API builds
        // return the standard Result envelope, so accept both while deployments roll.
        const responses = Array.isArray(attendanceResponse)
          ? attendanceResponse
          : [attendanceResponse];
        const items = responses
          .flatMap((response) => {
            const responsePayload = response?.data as any;
            const responseItems =
              responsePayload?.items ??
              responsePayload?.methodResults ??
              responsePayload?.methodResult ??
              responsePayload;
            return Array.isArray(responseItems) ? responseItems : [];
          })
          .filter((item) => {
            const itemDate = dayjs(formatServerDate(item.date, "YYYY-MM-DD"));
            return (
              !itemDate.isBefore(dateRange.startDate, "day") &&
              !itemDate.isAfter(displayEndDate, "day")
            );
          });
        setAttendanceItems(items);

        const formatted: Record<string, AttendanceData> = {};
        const approvedLeaveById = new Map<string, LeaveRequestModel>(
          leaveItems.map(
            (leave: LeaveRequestModel) =>
              [leave.leaveRequestId, leave] as const,
          ),
        );

        items.forEach((item: any) => {
          const sourceIsLeave =
            String(item.sourceType ?? "").toUpperCase() === "LEAVE";
          const relatedLeave = sourceIsLeave
            ? approvedLeaveById.get(item.sourceId)
            : undefined;
          const sourceIsWfh =
            String(item.sourceType ?? "").toUpperCase() === "WFH_REQUEST";
          const relatedWfh = sourceIsWfh
            ? approvedWfhById.get(item.sourceId)
            : undefined;

          // Leave requests own the business date. For a single-day source row, use the
          // approved request date rather than a serialized attendance timestamp. This
          // prevents a timezone-shifted/stale source timestamp from showing a 5 Aug or
          // 17 Aug leave under an earlier calendar column.
          const dateISO =
            relatedLeave && relatedLeave.totalDays <= 1
              ? dayjs(relatedLeave.startDate).format("YYYY-MM-DD")
              : relatedWfh &&
                  relatedWfh.fromDate.slice(0, 10) ===
                    relatedWfh.toDate.slice(0, 10)
                ? dayjs(relatedWfh.fromDate).format("YYYY-MM-DD")
                : formatServerDate(item.date, "YYYY-MM-DD");
          if (!dateISO || dateISO === "NA") return;

          // The self endpoint derives the employee from the access token.  Use
          // the rendered row identity for that one-row grid rather than relying
          // on a legacy user-id representation returned by older attendance rows.
          const rowUserId = !companyView
            ? resolveRowId(employees[0])
            : normalizeUserId(item.userId);
          if (!rowUserId) return;
          const key = `${rowUserId}-${dateISO}`;

          const isDaySegment = item.isDaySegment === true;
          const segmentName =
            item.segment === "FIRST_HALF" || item.segment === "SECOND_HALF"
              ? (item.segment as "FIRST_HALF" | "SECOND_HALF")
              : null;

          // Keep both authoritative half-day segments. A split day must never
          // lose one workflow because its API row happened to arrive last.
          if (isDaySegment && segmentName) {
            const current = formatted[key] ?? {
              status: "",
              checkIn: "",
              checkOut: "",
              remarks: "",
            };
            formatted[key] = {
              ...current,
              status: item.status,
              checkIn: formatIndianTime(item.checkInTime),
              checkOut: formatIndianTime(item.checkOutTime),
              remarks: item.remarks ?? "",
              sourceType: item.sourceType ?? null,
              sourceId: item.sourceId ?? null,
              scheduleId: item.scheduleId ?? null,
              isDaySegment: true,
              segment: segmentName,
              halfDaySegments: {
                ...current.halfDaySegments,
                [segmentName]: {
                  status: item.status,
                  sourceType: item.sourceType ?? null,
                  sourceId: item.sourceId ?? null,
                },
              },
            };
            return;
          }

          if (formatted[key]?.isDaySegment && !isDaySegment) return;

          formatted[key] = {
            status: item.status,
            checkIn: formatIndianTime(item.checkInTime),
            checkOut: formatIndianTime(item.checkOutTime),
            remarks: item.remarks ?? "",
            sourceType: item.sourceType ?? null,
            sourceId: item.sourceId ?? null,
            scheduleId: item.scheduleId ?? null,
            isDaySegment,
            segment: item.segment ?? null,
          };
        });

        setAttendanceData(formatted);
      } catch (error) {
        console.error("Failed to fetch calendar data", error);
      }
    };

    fetchAllData();
  }, [
    dateRange,
    displayEndDate,
    employees,
    companyView,
    normalizeUserId,
    reloadKey,
    resolveRowId,
    visibleDates,
  ]);

  /*-------------------------------ICON STATS-------------------------------------- */

  useEffect(() => {
    if (!attendanceItems.length) {
      const emptyPayload = {
        present: 0,
        absent: 0,
        leave: 0,
        wfh: 0,
        halfDay: 0,
        exceptions: 0,
        members: {
          Present: [] as string[],
          Absent: [] as string[],
          WFH: [] as string[],
          Leave: [] as string[],
          "Half Day": [] as string[],
        },
      };
      const serialized = JSON.stringify(emptyPayload);
      if (lastStatsRef.current !== serialized) {
        lastStatsRef.current = serialized;
        onStatsChange?.(emptyPayload);
      }
      return;
    }

    let present = 0;
    let absent = 0;
    let leave = 0;
    let wfh = 0;
    let exceptions = 0;
    const members = {
      Present: new Set<string>(),
      Absent: new Set<string>(),
      WFH: new Set<string>(),
      Leave: new Set<string>(),
      "Half Day": new Set<string>(),
    };
    // A half-day workflow can produce more than one attendance row for the
    // same employee/day (for example, a source-owned segment plus its derived
    // status). The overview is an employee count, so retain a stable employee
    // key while keeping names for the drill-down dialog.
    const halfDayEmployees = new Map<string, string>();

    attendanceItems.forEach((item: any) => {
      const itemDate = dayjs(formatServerDate(item.date, "YYYY-MM-DD"));
      // The overview cards are an operational today snapshot.  The grid itself
      // continues to honour the selected period and its full set of columns.
      const include = itemDate.isSame(today, "day");

      if (include) {
        if (item.status === "P") present++;
        if (item.status === "A") absent++;
        const employeeName =
          employees.find(
            (employee) =>
              resolveRowId(employee) === normalizeUserId(item.userId),
          )?.name ??
          item.employeeName ??
          item.userId;
        if (item.status === "P" && employeeName)
          members.Present.add(employeeName);
        if (item.status === "A" && employeeName)
          members.Absent.add(employeeName);
        if (
          [
            "SL",
            "CL",
            "EL",
            "COMP-OFF",
            "CL-HALF",
            "SL-HALF",
            "MED",
            "ML",
            "SAB",
            "UL",
          ].includes(item.status)
        ) {
          leave++;
          if (employeeName) members.Leave.add(employeeName);
        }
        if (["WFH", "WFH+WFO", "WFH-HD", "WFH+SL", "WFH+CL"].includes(item.status)) {
          wfh++;
          if (employeeName) members.WFH.add(employeeName);
        }
        if (
          ["HD", "LHD", "WFH-HD", "CL-HALF", "SL-HALF"].includes(item.status)
        ) {
          const employeeKey = normalizeUserId(item.userId) || employeeName;
          if (employeeName && employeeKey) halfDayEmployees.set(employeeKey, employeeName);
        }
        if (item.exceptionId || item.hasException || item.lateCount > 0)
          exceptions++;
      }
    });

    const nextStats = {
      present,
      absent,
      leave,
      wfh,
      halfDay: halfDayEmployees.size,
      exceptions,
      members: {
        Present: [...members.Present],
        Absent: [...members.Absent],
        WFH: [...members.WFH],
        Leave: [...members.Leave],
        "Half Day": [...halfDayEmployees.values()],
      },
    };
    const serialized = JSON.stringify(nextStats);
    if (lastStatsRef.current !== serialized) {
      lastStatsRef.current = serialized;
      onStatsChange?.(nextStats);
    }
  }, [
    attendanceItems,
    dateRange,
    employees,
    normalizeUserId,
    onStatsChange,
    resolveRowId,
    today,
  ]);

  /* ------------------------------------------------ LOAD MODAL ------------------------------------- */

  useEffect(() => {
    if (!selectedCell) {
      setModalData(initialModalState);
      return;
    }

    const dateISO = dayjs(selectedCell.dateObj).format("YYYY-MM-DD");
    const rowId = selectedCell.employee.userId || selectedCell.employee.id;
    const key = `${rowId}-${dateISO}`;
    const existing = attendanceData[key];

    setModalData({
      status: existing?.status ?? "",
      checkIn: existing?.checkIn ?? selectedCell.employee.scheduledStartTime ?? "",
      checkOut:
        existing?.checkOut ?? selectedCell.employee.scheduledEndTime ?? "",
      remarks: existing?.remarks ?? "",
    });
  }, [selectedCell, attendanceData]);

  /* ----------------------------------------------------------- GRID COLUMN ------------------------------------------- */

  const renderAttendanceCell = (
    row: AttendanceRow,
    date: Dayjs,
    index: number,
  ) => {
    const dateObj = date.toDate();
    const dayOfWeek = date.day();
    const isWeekend = weeklyOffDays.includes(dayOfWeek);
    const dateIso = date.format("YYYY-MM-DD");
    const isHoliday = holidays.has(dateIso);
    const isFutureDate = date.isAfter(today, "day");
    const editable =
      !readOnly && dateObj <= today.toDate() && !isHoliday && !isWeekend;
    const value = (row[`day-${index + 1}`] ??
      initialModalState) as AttendanceData;
    const joiningDate = row.dateOfJoining
      ? dayjs(row.dateOfJoining).startOf("day")
      : null;
    const isBeforeJoining = Boolean(
      joiningDate?.isValid() && dayjs(dateObj).isBefore(joiningDate, "day"),
    );
    const lastWorkingDate = row.lastWorkingDate
      ? dayjs(row.lastWorkingDate).endOf("day")
      : null;
    const employmentStatus = row.employmentStatus ?? "Active";
    const usesExitCutoff = ["NoticePeriod", "Resigned", "Terminated"].includes(employmentStatus);
    const isAfterExit = Boolean(
      usesExitCutoff && lastWorkingDate?.isValid() && dayjs(dateObj).isAfter(lastWorkingDate, "day"),
    );
    const firstHalf = value.halfDaySegments?.FIRST_HALF;
    const secondHalf = value.halfDaySegments?.SECOND_HALF;
    const hasHalfDaySegments = Boolean(firstHalf || secondHalf);
    const isLeaveGenerated = value.sourceType?.toUpperCase() === "LEAVE";
    const isWfhGenerated = value.sourceType?.toUpperCase() === "WFH_REQUEST";
    const isLifecycleGenerated = value.sourceType?.toUpperCase() === "LIFECYCLE_CASE";
    const isWorkflowOwned =
      isLeaveGenerated || isWfhGenerated || isLifecycleGenerated;
    const isSourceOwnedSegment =
      hasHalfDaySegments &&
      [firstHalf, secondHalf].some(
        (half) =>
          half?.sourceType?.toUpperCase() === "LEAVE" ||
          half?.sourceType?.toUpperCase() === "WFH_REQUEST" ||
          half?.sourceType?.toUpperCase() === "LIFECYCLE_CASE",
      );
    const isSystemDefault = [
      "SYSTEM_DEFAULT_PRESENT",
      "SYSTEM_OFFICE_START_PRESENT",
    ].includes(value.sourceType?.toUpperCase() ?? "");
    const relatedLeave = isLeaveGenerated
      ? leaveRequests.find((leave) => leave.leaveRequestId === value.sourceId)
      : undefined;
    const statusCode = value.status || "—";
    const availabilityLabel = row.availabilityStatus
      ? row.availabilityStatus.replace(/([a-z])([A-Z])/g, "$1 $2")
      : "";
    const statusLabel = value.status
      ? (attendanceStatusLabels[value.status as AttendanceStatus] ??
        value.status)
      : isAfterExit
        ? "Not employed on this date"
        : isFutureDate
          ? "Future date — attendance is not calculated"
          : availabilityLabel && availabilityLabel !== "Working"
          ? availabilityLabel
        : "No attendance recorded";
    const leaveDetail = relatedLeave
      ? `${relatedLeave.leavePolicyName} • ${relatedLeave.isHalfDay ? "Half day" : "Full day"} • Approved • Generated from leave request`
      : "Approved leave • Generated from leave request";
    const halfDayDetail = [
      firstHalf && `First half: ${firstHalf.status}`,
      secondHalf && `Second half: ${secondHalf.status}`,
    ]
      .filter(Boolean)
      .join("\n");
    const tooltipText = isBeforeJoining
      ? `Not applicable — employee joins on ${joiningDate?.format("DD MMM YYYY")}.`
      : isAfterExit
        ? `Not employed — last working date was ${lastWorkingDate?.format("DD MMM YYYY")}.`
      : hasHalfDaySegments
        ? `${halfDayDetail}\n${dayjs(dateObj).format("DD MMMM YYYY")}\nGenerated from approved attendance workflows.`
        : isLeaveGenerated
          ? `${statusCode} — ${statusLabel}\n${leaveDetail}\n${dayjs(dateObj).format("DD MMMM YYYY")}`
          : isWfhGenerated
            ? `${statusCode} — ${statusLabel}\nApproved work-from-home request • Generated from WFH workflow\n${dayjs(dateObj).format("DD MMMM YYYY")}`
            : isSystemDefault
              ? `${statusCode} - System default Present\nCreated automatically. An authorized attendance, Leave, or WFH workflow can update it.`
                : isFutureDate
                ? "Future date — attendance is not calculated."
                : availabilityLabel && availabilityLabel !== "Working"
                  ? `${availabilityLabel} — normal attendance is not expected for this date.`
                : isHoliday
                  ? "Public Holiday"
                  : isWeekend
                    ? "Weekend"
                    : statusLabel;
    const canEdit =
      editable && !isWorkflowOwned && !isSourceOwnedSegment && !isBeforeJoining && !isAfterExit;
    const tooltipLines: string[] = tooltipText.split("\n");
    const tooltipTitle = (
      <Box sx={{ display: "grid", gap: 0.35, maxWidth: 280 }}>
        <Typography
          component="span"
          sx={{ color: "common.white", fontSize: 12, fontWeight: 800, lineHeight: 1.35 }}
        >
          {tooltipLines[0]}
        </Typography>
        {tooltipLines.slice(1).map((line, index) => (
          <Typography
            key={`${line}-${index}`}
            component="span"
            sx={{ color: "rgba(255,255,255,.82)", fontSize: 11, lineHeight: 1.45 }}
          >
            {line}
          </Typography>
        ))}
      </Box>
    );

    const getIcon = (attendanceValue: AttendanceData) => {
      const statusStr = (attendanceValue.status as string) || "";
      const isVirtualOff = !statusStr || statusStr === "WO" || statusStr === "H";
      if (isVirtualOff) {
        if (isHoliday) {
          return (
            <CelebrationIcon sx={{ fontSize: 18, color: "secondary.main" }} />
          );
        }
        if (isWeekend && !isHoliday) {
          return (
            <FreeBreakfastIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          );
        }
        return null;
      }

      const color = getStatusColor(attendanceValue.status);
      switch (attendanceValue.status) {
        case "P":
          return <TaskAltIcon sx={{ fontSize: 18, color }} />;
        case "A":
          return <PersonOffIcon sx={{ fontSize: 18, color }} />;
        case "HD":
        case "LHD":
        case "WFH-HD":
          return <TimelapseIcon sx={{ fontSize: 18, color }} />;
        case "SL":
        case "CL":
        case "EL":
        case "COMP-OFF":
        case "CL-HALF":
        case "SL-HALF":
          return <EventBusyIcon sx={{ fontSize: 18, color }} />;
        case "WFH":
        case "WFH+WFO":
        case "ED":
          return <TaskAltIcon sx={{ fontSize: 18, color }} />;
        default:
          return <TaskAltIcon sx={{ fontSize: 18, color }} />;
      }
    };

    const getBg = (attendanceValue: AttendanceData) => {
      const statusStr = (attendanceValue.status as string) || "";
      const isVirtualOff = !statusStr || statusStr === "WO" || statusStr === "H";
      if (isHoliday) return alpha(theme.palette.secondary.main, 0.16);
      if (isWeekend && !isHoliday && (!statusStr || statusStr === "WO"))
        return theme.palette.action.hover;
      if (isVirtualOff) return theme.palette.background.paper;
      const color = getStatusColor(attendanceValue.status);
      return alpha(color, 0.14);
    };

    return (
      <Tooltip
        title={tooltipTitle}
        placement="top"
        arrow
        enterDelay={180}
        leaveDelay={80}
        slotProps={{
          tooltip: {
            sx: {
              maxWidth: 300,
              px: 1.5,
              py: 1.15,
              borderRadius: 1.75,
              backgroundColor: "#241b35",
              boxShadow: "0 10px 28px rgba(24, 16, 38, .28)",
            },
          },
          arrow: {
            sx: { color: "#241b35" },
          },
        }}
      >
        <Box
          onClick={() => {
            if (isFutureDate) return;
            if (readOnly) return;
            if (isWorkflowOwned || isSourceOwnedSegment) {
              setConfirmationModal({
                open: true,
                title: isWfhGenerated
                  ? "WFH-generated attendance"
                  : "Leave-generated attendance",
                content: isWfhGenerated
                  ? "This record is generated from an approved WFH request. Update or cancel the WFH request through its workflow to make a correction."
                  : "This record is generated from an approved leave request. Use the authorized leave-attendance conflict-resolution workflow to make a correction.",
              });
              return;
            }
            if (canEdit) setSelectedCell({ employee: row, dateObj });
          }}
          role="button"
          tabIndex={
            !readOnly && (isWorkflowOwned || isSourceOwnedSegment || canEdit)
              ? 0
              : -1
          }
          aria-label={tooltipText.replace(/\n/g, ". ")}
          onKeyDown={(event) => {
            if (
              !readOnly &&
              (event.key === "Enter" || event.key === " ") &&
              (isWorkflowOwned || isSourceOwnedSegment || canEdit)
            ) {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
          sx={{
            width: "100%",
            minHeight: 52,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isBeforeJoining || isAfterExit
              ? theme.palette.action.disabledBackground
              : getBg(value),
            borderRight: "1px solid",
            borderRightColor: "divider",
            borderBottom: "1px solid",
            borderBottomColor: "divider",
            opacity: isFutureDate ? 0.45 : 1,
            cursor: isBeforeJoining || isAfterExit
              ? "not-allowed"
              : isWorkflowOwned || isSourceOwnedSegment || canEdit
                ? "pointer"
                : "default",
            transition: "all 0.2s ease",
            borderRadius: 0,
            "&:hover":
              isWorkflowOwned || isSourceOwnedSegment || canEdit
                ? {
                    boxShadow: theme.shadows[3],
                  }
                : {},
          }}
        >
          {isBeforeJoining || isAfterExit ? (
            <Typography
              component="span"
              fontSize={10}
              color="text.secondary"
              fontWeight={700}
              aria-hidden="true"
            >
              N/A
            </Typography>
          ) : hasHalfDaySegments ? (
            <Stack spacing={0.15} alignItems="center" justifyContent="center">
              {firstHalf && (
                <Typography
                  component="span"
                  fontSize={9}
                  fontWeight={800}
                  aria-label={`First half ${firstHalf.status}`}
                >
                  FH: {firstHalf.status}
                </Typography>
              )}
              {secondHalf && (
                <Typography
                  component="span"
                  fontSize={9}
                  fontWeight={800}
                  aria-label={`Second half ${secondHalf.status}`}
                >
                  SH: {secondHalf.status}
                </Typography>
              )}
              {isSourceOwnedSegment && (
                <LockOutlinedIcon sx={{ fontSize: 12 }} aria-hidden="true" />
              )}
            </Stack>
          ) : isLeaveGenerated ? (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              justifyContent="center"
            >
              <Typography
                component="span"
                fontSize={12}
                fontWeight={800}
                aria-hidden="true"
              >
                {statusCode}
              </Typography>
              {isSystemDefault && (
                <Typography
                  component="span"
                  fontSize={8}
                  color="text.secondary"
                  aria-hidden="true"
                >
                  System
                </Typography>
              )}
              <LockOutlinedIcon sx={{ fontSize: 14 }} aria-hidden="true" />
            </Stack>
          ) : isWfhGenerated ? (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              justifyContent="center"
            >
              {getIcon(value)}
              <Typography
                component="span"
                fontSize={12}
                fontWeight={800}
                aria-hidden="true"
              >
                WFH
              </Typography>
              <LockOutlinedIcon sx={{ fontSize: 14 }} aria-hidden="true" />
            </Stack>
          ) : (((value.status as string) && (value.status as string) !== "WO" && (value.status as string) !== "H")) ? (
            <Stack alignItems="center" spacing={0.25}>
              {getIcon(value)}
              <Typography
                component="span"
                fontSize={11}
                fontWeight={800}
                aria-hidden="true"
              >
                {statusCode}
              </Typography>
            </Stack>
          ) : (
            getIcon(value)
          )}
        </Box>
      </Tooltip>
    );
  };

  /* ------------------------------------------------------------ GRID ROW ------------------------------------------------------------------------------------- */

  const rows: AttendanceRow[] = useMemo(() => {
    return employees.filter((emp) => !scheduleIdFilter || emp.scheduleId === scheduleIdFilter).map((emp) => {
      const row: AttendanceRow = {
        id: resolveRowId(emp),
        userId: emp.userId,
        employeeId: emp.employeeId ?? "",
        name: emp.name,
        dateOfJoining: emp.dateOfJoining,
        lastWorkingDate: emp.lastWorkingDate,
        employmentStatus: emp.employmentStatus,
        availabilityStatus: emp.availabilityStatus,
        scheduleId: emp.scheduleId,
        scheduleName: emp.scheduleName,
        scheduledStartTime: emp.scheduledStartTime,
        scheduledEndTime: emp.scheduledEndTime,
        scheduleSource: emp.scheduleSource,
      };

      visibleDates.forEach((date, index) => {
        const dateISO = date.format("YYYY-MM-DD");
        const key = `${resolveRowId(emp)}-${dateISO}`;
        row[`day-${index + 1}`] = attendanceData[key] ?? initialModalState;
      });

      return row;
    });
  }, [employees, attendanceData, resolveRowId, scheduleIdFilter, visibleDates]);

  useEffect(() => {
    setPage(0);
  }, [employees, visibleDates]);

  const paginatedRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage],
  );

  const hasAttendanceForVisibleMonth = attendanceItems.length > 0;

  /* --------------------------------------------------------------- SAVE -------------------------------------------------------------------------- */

  const saveAttendance = async () => {
    if (!selectedCell || !modalData.status) {
      setConfirmationModal({
        open: true,
        title: "Select",
        content: "Please Select Status",
      });
      return;
    }

    const dateISO = dayjs(selectedCell.dateObj).format("YYYY-MM-DD");
    const payload: AdminAttendanceCreateDto = {
      UserId: selectedCell.employee.userId || selectedCell.employee.id,
      EmployeeId: selectedCell.employee.employeeId,
      Date: dateISO,
      CheckInTime: modalData.checkIn || undefined,
      CheckOutTime: modalData.checkOut || undefined,
      Status: modalData.status,
      Remarks: modalData.remarks || null,
    };

    const rowId = selectedCell.employee.userId || selectedCell.employee.id;
    const key = `${rowId}-${dateISO}`;

    try {
      const saveRes = await addEditAttendance(payload);
      const savedAttendance = saveRes?.data as { status?: AttendanceStatus } | undefined;
      const effectiveStatus = savedAttendance?.status || modalData.status;

      setAttendanceData((prev) => ({
        ...prev,
        [key]: {
          ...modalData,
          status: effectiveStatus,
        },
      }));
      setReloadKey((key) => key + 1);

      setConfirmationModal({
        open: true,
        title: "Success",
        content: "Attendance saved successfully!",
      });
    } catch (err) {
      console.error("Save failed", err);
      const responseMessage =
        typeof err === "object" && err !== null && "response" in err
          ? (err.response as { data?: { message?: string } })?.data?.message
          : err instanceof Error
            ? err.message
            : undefined;
      const isLocked = /locked/i.test(responseMessage ?? "");
      const message = responseMessage === "ATTENDANCE_WORKFLOW_STATUS_REQUIRES_LEAVE_OR_WFH_REQUEST"
        ? "Leave and Work From Home must be created through their respective request workflows."
        : responseMessage || "Failed to save attendance";
      setConfirmationModal({
        open: true,
        title: isLocked ? "Attendance Locked" : "Error",
        content: message,
      });
      return;
    }

    setSelectedCell(null);
    setModalData(initialModalState);
  };

  const openTodayAttendance = (row: AttendanceRow) => {
    const value = row["day-1"] as AttendanceData;
    const dateObj = visibleDates[0]?.toDate();
    if (!dateObj || readOnly || dayjs(dateObj).isAfter(today, "day")) return;
    const isWorkflowOwned = [
      "LEAVE",
      "WFH_REQUEST",
      "LIFECYCLE_CASE",
    ].includes((value.sourceType ?? "").toUpperCase());
    const isSourceOwnedSegment = Object.values(
      value.halfDaySegments ?? {},
    ).some((segment) =>
      ["LEAVE", "WFH_REQUEST", "LIFECYCLE_CASE"].includes(
        (segment?.sourceType ?? "").toUpperCase(),
      ),
    );
    if (isWorkflowOwned || isSourceOwnedSegment) {
      const isWfh = value.sourceType?.toUpperCase() === "WFH_REQUEST";
      const isLifecycle =
        value.sourceType?.toUpperCase() === "LIFECYCLE_CASE";
      setConfirmationModal({
        open: true,
        title: isWfh
          ? "WFH-generated attendance"
          : isLifecycle
            ? "Lifecycle-managed attendance"
            : "Workflow-owned attendance",
        content: isWfh
          ? "This status is maintained by the approved WFH request. Update or cancel that request to make a change."
          : isLifecycle
            ? "This status is maintained by an approved employee lifecycle case (e.g. Medical/Maternity leave). Update or complete that lifecycle case to make a change."
            : "This status is maintained by an approved leave or half-day workflow and cannot be edited from attendance.",
      });
      return;
    }
    setSelectedCell({ employee: row, dateObj });
  };

  const getStatusChipStyle = (status: string | null | undefined) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: toAlphaHex(color, 15),
      color,
      border: `1px solid ${toAlphaHex(color, 45)}`,
      fontWeight: 800,
    };
  };

  /* ------------------------------------------------- RENDER ------------------------------------------------------------ */

  return (
    <Stack spacing={2}>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={700}
        sx={{ display: "none" }}
      >
        {dateRange.startDate.format("DD MMM YYYY")} –{" "}
        {dateRange.endDate.format("DD MMM YYYY")}
      </Typography>
      <Box sx={{ width: "100%", minWidth: 0 }}>
        {isSingleDay ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
              alignItems: "stretch",
              "@keyframes attendance-card-in": {
                from: { opacity: 0, transform: "translateY(10px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {paginatedRows.map((row, index) => {
              const value = row["day-1"] as AttendanceData;
              const status = value.status || "Not marked";
              const statusAccent = value.status
                ? getStatusColor(value.status)
                : "#94A3B8";
              const isWorkflowOwned = [
                "LEAVE",
                "WFH_REQUEST",
                "LIFECYCLE_CASE",
              ].includes((value.sourceType ?? "").toUpperCase());
              const isLegacySystemPresent =
                value.status === "P" &&
                [
                  "SYSTEM_DEFAULT_PRESENT",
                  "SYSTEM_OFFICE_START_PRESENT",
                ].includes((value.sourceType ?? "").toUpperCase());
              const initials = (row.name || "E")
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part: string) => part[0]?.toUpperCase() ?? "")
                .join("");

              return (
                <Card
                  key={row.id}
                  className="interactive-card"
                  variant="outlined"
                  onClick={() => openTodayAttendance(row)}
                  role={!readOnly ? "button" : undefined}
                  tabIndex={!readOnly ? 0 : -1}
                  onKeyDown={(event) => {
                    if (
                      !readOnly &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      openTodayAttendance(row);
                    }
                  }}
                  sx={{
                    p: 2,
                    minHeight: 158,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: "12px",
                    cursor: readOnly ? "default" : "pointer",
                    bgcolor: "var(--mui-palette-background-card, var(--mui-palette-background-paper))",
                    backdropFilter: "blur(14px) saturate(180%)",
                    WebkitBackdropFilter: "blur(14px) saturate(180%)",
                    border: "1px solid",
                    borderColor: "divider",
                    borderLeft: `4px solid ${statusAccent} !important`,
                    boxShadow: "0 8px 24px 0 rgba(0, 0, 0, 0.05)",
                    animation: `attendance-card-in 320ms ease-out ${Math.min(index * 35, 280)}ms both`,
                    transition:
                      "transform 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms cubic-bezier(0.22, 1, 0.36, 1), border-color 180ms ease, background 180ms ease",
                    "&:hover": readOnly
                      ? {}
                      : {
                          transform: "translateY(-4px)",
                          bgcolor: "var(--mui-palette-background-paper)",
                          borderColor: "primary.main",
                          borderLeftColor: "#0B5CAB !important",
                          boxShadow: "0 14px 28px -6px rgba(0, 0, 0, 0.16)",
                          "& .attendance-card-cta": {
                            color: "primary.main",
                            transform: "translateX(2px)",
                          },
                        },
                    "&:focus-visible": {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1.25}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "9px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            bgcolor: "action.hover",
                            color: "primary.main",
                            border: "1px solid",
                            borderColor: "divider",
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            fontWeight={700}
                            noWrap
                            title={row.name}
                            sx={{ color: "text.primary", fontSize: "0.925rem", lineHeight: 1.3 }}
                          >
                            {row.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ color: "text.secondary", fontWeight: 600, display: "block" }}
                          >
                            {row.employeeId || "Employee"}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        size="small"
                        label={status}
                        variant={isWorkflowOwned ? "filled" : "outlined"}
                        sx={{
                          ...getStatusChipStyle(value.status),
                          height: 24,
                          fontSize: "0.72rem",
                          opacity: isWorkflowOwned ? 0.96 : 1,
                          flexShrink: 0,
                        }}
                      />
                    </Stack>

                    {row.scheduleName && (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          mt: 1.25,
                          px: 1,
                          py: 0.35,
                          borderRadius: "6px",
                          bgcolor: "action.hover",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.72rem" }}
                        >
                          {row.scheduleName} · {row.scheduledStartTime}–{row.scheduledEndTime}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1,
                        mt: 1.25,
                        p: 1,
                        borderRadius: "8px",
                        bgcolor: "var(--mui-palette-background-box, action.hover)",
                        border: "1px solid",
                        borderColor: "divider",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem", fontWeight: 600, display: "block" }}>
                          Punch in
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.8rem" }}>
                          {value.checkIn || (isLegacySystemPresent ? "09:00" : "—")}
                        </Typography>
                      </Box>
                      <Box sx={{ borderLeft: "1px solid", borderColor: "divider", pl: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.68rem", fontWeight: 600, display: "block" }}>
                          Punch out
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.8rem" }}>
                          {value.checkOut || (isLegacySystemPresent ? "18:00" : "—")}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Typography
                    className="attendance-card-cta"
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1.25,
                      pt: 1,
                      borderTop: "1px dashed #E2E8F0",
                      color: "#64748B",
                      fontWeight: 600,
                      fontSize: "0.73rem",
                      transition: "color 180ms ease, transform 180ms ease",
                    }}
                  >
                    {isWorkflowOwned
                      ? "Managed by approved workflow"
                      : readOnly
                        ? "Attendance status"
                        : "Select to update attendance →"}
                  </Typography>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ width: "100%", overflow: "hidden" }}>
            {!hasAttendanceForVisibleMonth && (
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ minHeight: 300, px: 3, textAlign: "center" }}
              >
                <Typography fontWeight={700}>
                  No attendance recorded in this period
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The selected range is ready for review. Attendance will appear
                  here as it is recorded.
                </Typography>
              </Stack>
            )}
            {hasAttendanceForVisibleMonth && (
              <Box
                sx={{
                  ...buildAttendanceGridScrollContainerSx(theme),
                  width: "100%",
                  maxHeight: "68vh",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    minWidth: 0,
                    height: "calc(68vh - 14px)",
                    overflowY: "hidden",
                    overflowX: "hidden",
                  }}
                >
                  <Box
                    ref={attendanceEmployeesPaneRef}
                    onScroll={(event) =>
                      syncAttendanceVerticalScroll(
                        event.currentTarget,
                        attendanceDatesPaneRef.current,
                      )
                    }
                    sx={{
                      width: employeeColumnWidth,
                      minWidth: employeeColumnWidth,
                      maxWidth: employeeColumnWidth,
                      flexShrink: 0,
                      backgroundColor: "background.paper",
                      borderRight: "1px solid",
                      borderColor: "divider",
                      position: "sticky",
                      left: 0,
                      zIndex: 3,
                      overflowY: "auto",
                      overflowX: "hidden",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": { display: "none" },
                    }}
                  >
                    <Box
                      sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 4,
                        height: 72,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "background.default",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        fontWeight: 800,
                      }}
                    >
                      Employee
                    </Box>
                    {paginatedRows.map((row) => {
                      const search = searchValue?.toLowerCase();
                      const name = row.name || "";
                      const matchIndex = search
                        ? name.toLowerCase().indexOf(search)
                        : -1;
                      const displayName =
                        matchIndex >= 0 && search ? (
                          <>
                            {name.substring(0, matchIndex)}
                            <Box
                              component="span"
                              sx={{
                                backgroundColor: alpha(
                                  theme.palette.warning.main,
                                  0.28,
                                ),
                                color: "text.primary",
                              }}
                            >
                              {name.substring(
                                matchIndex,
                                matchIndex + search.length,
                              )}
                            </Box>
                            {name.substring(matchIndex + search.length)}
                          </>
                        ) : (
                          name
                        );

                      return (
                        <Box
                          key={row.id}
                          sx={{
                            height: 52,
                            minHeight: 52,
                            display: "flex",
                            alignItems: "center",
                            px: 1.5,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "background.paper",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontWeight: 600,
                            title: row.name,
                          }}
                        >
                          {displayName}
                        </Box>
                      );
                    })}
                  </Box>

                  <Box
                    ref={attendanceDatesPaneRef}
                    onScroll={(event) =>
                      {
                        syncAttendanceHorizontalScroll(
                          event.currentTarget,
                          attendanceHorizontalScrollbarRef.current,
                        );
                        syncAttendanceVerticalScroll(
                          event.currentTarget,
                          attendanceEmployeesPaneRef.current,
                        );
                      }
                    }
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflowX: "auto",
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": { display: "none" },
                    }}
                  >
                    <Box
                      sx={{
                        width: fitDateColumns ? "100%" : "max-content",
                        minWidth: fitDateColumns
                          ? 0
                          : visibleDates.length * dateColumnWidth,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          backgroundColor: "background.default",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {visibleDates.map((date) => {
                          const dayOfWeek = date.day();
                          const isWeekend = weeklyOffDays.includes(dayOfWeek);
                          const dateIso = date.format("YYYY-MM-DD");
                          const isHoliday = holidays.has(dateIso);

                          return (
                            <Box
                              key={`header-${dateIso}`}
                              sx={{
                                width: fitDateColumns ? "auto" : dateColumnWidth,
                                minWidth: fitDateColumns ? 0 : dateColumnWidth,
                                maxWidth: fitDateColumns ? "none" : dateColumnWidth,
                                flex: fitDateColumns ? "1 1 0" : "0 0 auto",
                                height: 72,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                py: 1,
                                borderRight: "1px solid",
                                borderColor: "divider",
                                opacity: isHoliday || isWeekend ? 0.7 : 1,
                              }}
                            >
                              <Typography fontSize={11} color="text.secondary">
                                {date.format("ddd")}
                              </Typography>
                              <Typography fontWeight={600} fontSize={14}>
                                {date.format("D")}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>

                      {paginatedRows.map((row) => (
                        <Box
                          key={row.id}
                          sx={{
                            display: "flex",
                            minHeight: 52,
                            backgroundColor: "background.paper",
                          }}
                        >
                          {visibleDates.map((date, index) => (
                            <Box
                              key={`${row.id}-${date.format("YYYY-MM-DD")}`}
                              sx={{
                                width: fitDateColumns ? "auto" : dateColumnWidth,
                                minWidth: fitDateColumns ? 0 : dateColumnWidth,
                                maxWidth: fitDateColumns ? "none" : dateColumnWidth,
                                flex: fitDateColumns ? "1 1 0" : "0 0 auto",
                                borderRight: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              {renderAttendanceCell(row, date, index)}
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
                <Box
                  ref={attendanceHorizontalScrollbarRef}
                  onScroll={(event) =>
                    syncAttendanceHorizontalScroll(
                      event.currentTarget,
                      attendanceDatesPaneRef.current,
                    )
                  }
                  aria-label="Scroll attendance dates horizontally"
                  sx={{
                    ml: `${employeeColumnWidth}px`,
                    overflowX: "auto",
                    overflowY: "hidden",
                    height: 14,
                    minHeight: 14,
                    display: fitDateColumns ? "none" : "block",
                    borderTop: "1px solid",
                    borderColor: "divider",
                    scrollbarWidth: "thin",
                    scrollbarColor: `${theme.palette.primary.light} ${theme.palette.action.hover}`,
                    "&::-webkit-scrollbar": { height: 10 },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: 8,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: theme.palette.primary.light,
                      borderRadius: 8,
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: visibleDates.length * dateColumnWidth,
                      height: 1,
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            mt: 1.5,
            px: 0,
            "& .MuiTablePagination-toolbar": {
              px: { xs: 1, sm: 2 },
            },
          }}
        />
      </Box>
      {!readOnly && dateRange.startDate.isSame(dateRange.endDate, "month") && (
        <MonthlyAttendanceExceptions month={dateRange.startDate} />
      )}
      <CustomisedModal
        open={Boolean(selectedCell)}
        handleClose={() => {
          setSelectedCell(null);
          setModalData(initialModalState);
        }}
        title={
          selectedCell ? (
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 800,
                }}
              >
                {selectedCell.employee.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography component="div" variant="h6" fontWeight={800} lineHeight={1.15}>
                  {selectedCell.employee.name}
                </Typography>
                <Typography component="div" variant="caption" color="text.secondary" fontWeight={600}>
                  Mark attendance
                </Typography>
              </Box>
            </Stack>
          ) : undefined
        }
      >
        {selectedCell && (
          <Stack spacing={2.25} sx={{ pt: 1, pb: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.5,
                py: 1.25,
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.04)})`,
              }}
            >
              <CalendarTodayIcon color="primary" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                  Attendance date
                </Typography>
                <Typography fontWeight={700}>
                  {dayjs(selectedCell.dateObj).format("dddd, DD MMMM YYYY")}
                </Typography>
              </Box>
            </Box>
            {selectedCell.employee.scheduleName && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
                Effective shift: <Box component="span" sx={{ color: "text.primary", fontWeight: 800 }}>{selectedCell.employee.scheduleName} · {selectedCell.employee.scheduledStartTime}–{selectedCell.employee.scheduledEndTime}</Box>{selectedCell.employee.scheduleSource ? ` · ${selectedCell.employee.scheduleSource}` : ""}
              </Typography>
            )}

            <Box
              sx={{
                px: 1.25,
                py: 1,
                borderRadius: 2,
                bgcolor: "info.lighter",
                border: "1px solid",
                borderColor: "info.light",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                This editor is for attendance corrections. Create or manage a Leave or WFH request for leave and work-from-home days; those workflows keep balances, approvals, and payroll history in sync.
              </Typography>
            </Box>

            <AppTextField
              select
              label="Status"
              fullWidth
              value={modalData.status}
              SelectProps={{
                renderValue: (value) => {
                  const option = statusOptions.find((item) => item.value === value);
                  const optionColor = option
                    ? getStatusColor(option.value)
                    : DEFAULT_ATTENDANCE_STATUS_COLOR;
                  return option ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        component="span"
                        sx={{
                          minWidth: 30,
                          px: 0.75,
                          py: 0.15,
                          borderRadius: 1,
                          bgcolor: optionColor,
                          color: (theme) => theme.palette.getContrastText(optionColor),
                          fontSize: 11,
                          fontWeight: 800,
                          textAlign: "center",
                        }}
                      >
                        {option.value}
                      </Box>
                      <Typography component="span" fontWeight={700}>{option.label}</Typography>
                    </Stack>
                  ) : String(value);
                },
                MenuProps: {
                  PaperProps: {
                    sx: {
                      mt: 0.75,
                      maxHeight: 380,
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "0 16px 36px rgba(31, 24, 66, 0.18)",
                    },
                  },
                  MenuListProps: { sx: { p: 0.75 } },
                },
              }}
              onChange={(e) => {
                const newStatus = e.target.value as AttendanceData["status"];
                setModalData((prev) => {
                  let inTime = prev.checkIn || selectedCell?.employee?.scheduledStartTime || "09:00";
                  let outTime = prev.checkOut || selectedCell?.employee?.scheduledEndTime || "18:00";
                  if (newStatus === "ED" && (!prev.checkOut || prev.checkOut === "18:00")) {
                    outTime = "14:00";
                  } else if (newStatus === "LHD" && (!prev.checkIn || prev.checkIn === "09:00")) {
                    inTime = "13:30";
                  } else if (newStatus === "HD" && (!prev.checkOut || prev.checkOut === "18:00")) {
                    outTime = "13:30";
                  }
                  return {
                    ...prev,
                    status: newStatus,
                    checkIn: inTime,
                    checkOut: outTime,
                  };
                });
              }}
            >
              {statusOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{ borderRadius: 1.75, py: 1, px: 1.25, mb: 0.25 }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                      component="span"
                      sx={{
                        minWidth: 38,
                        px: 0.75,
                        py: 0.35,
                        borderRadius: 1,
                        bgcolor: toAlphaHex(getStatusColor(option.value), 14),
                        color: getStatusColor(option.value),
                        border: `1px solid ${toAlphaHex(getStatusColor(option.value), 40)}`,
                        fontSize: 11,
                        fontWeight: 800,
                        textAlign: "center",
                      }}
                    >
                      {option.value}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontSize={14} fontWeight={700}>{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.requiresTime || statusesWithTimes.has(option.value as AttendanceStatus) ? "Punch in and punch out required" : "Attendance status"}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
            </AppTextField>

            {modalData.status &&
              (Boolean(statusOptions.find((x) => x.value === modalData.status)?.requiresTime) ||
                statusesWithTimes.has(modalData.status)) && (
                <Stack spacing={2}>
                  <Stack spacing={0.75}>
                    <AppTextField
                      label="Punch in time"
                      fullWidth
                      value={modalData.checkIn}
                      placeholder="HH:MM (for example, 09:00)"
                      inputProps={{ inputMode: "numeric", maxLength: 5 }}
                      onChange={(e) => handlePunchInChange(e.target.value)}
                    />
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {scheduleTimePresets.checkIn.map((time) => (
                        <AppButton key={time} size="small" variant="outlined" onClick={() => handlePunchInChange(time)}>
                          {formatTimePreset(time)}
                        </AppButton>
                      ))}
                    </Stack>
                  </Stack>

                  <Stack spacing={0.75}>
                    <AppTextField
                      label="Punch out time"
                      fullWidth
                      value={modalData.checkOut}
                      placeholder="HH:MM (for example, 18:00)"
                      inputProps={{ inputMode: "numeric", maxLength: 5 }}
                      onChange={(e) => handlePunchOutChange(e.target.value)}
                    />
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {scheduleTimePresets.checkOut.map((time) => (
                        <AppButton key={time} size="small" variant="outlined" onClick={() => handlePunchOutChange(time)}>
                          {formatTimePreset(time)}
                        </AppButton>
                      ))}
                    </Stack>
                  </Stack>

                  {(() => {
                    const explanation = getDerivedStatusExplanation(
                      modalData.status,
                      modalData.checkIn,
                      modalData.checkOut,
                      selectedCell?.employee,
                    );
                    if (!explanation) return null;
                    return (
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(99, 102, 241, 0.12)" : "rgba(99, 102, 241, 0.08)",
                          border: "1px dashed",
                          borderColor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box component="span" sx={{ fontSize: 16 }}>⚡</Box>
                        <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 600 }}>
                          {explanation}
                        </Typography>
                      </Box>
                    );
                  })()}
                </Stack>
              )}

            <AppTextField
              label="Remarks (optional)"
              fullWidth
              multiline
              minRows={2}
              placeholder="Add a note for this attendance update"
              value={modalData.remarks}
              onChange={(e) =>
                setModalData((prev) => ({
                  ...prev,
                  remarks: e.target.value,
                }))
              }
            />

            <Stack direction="row" spacing={2}>
              <AppButton
                variant="contained"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
                onClick={saveAttendance}
              >
                Save attendance
              </AppButton>
              <AppButton
                onClick={() => {
                  setSelectedCell(null);
                  setModalData(initialModalState);
                }}
              >
                Cancel
              </AppButton>
            </Stack>
          </Stack>
        )}
      </CustomisedModal>
      <ConfirmationModal
        open={confirmationModal.open}
        title={confirmationModal.title}
        content={confirmationModal.content}
        handleClose={() =>
          setConfirmationModal({
            open: false,
            title: "",
            content: "",
          })
        }
        handleConfirmation={() =>
          setConfirmationModal({
            open: false,
            title: "",
            content: "",
          })
        }
        ok_btn
      />
    </Stack>
  );
};
