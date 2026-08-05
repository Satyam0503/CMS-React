import {
  FC,
  useMemo,
  useState,
  useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  MenuItem,
  Tooltip,
  Card,
  TablePagination,
  alpha,
  useTheme,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { CustomDataGrid } from "../../../shared/components/C_DataGrid";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import dayjs, { Dayjs } from "dayjs";
import { getHolidays } from "../../holidays/calendarServices";
import { HolidayPayload, HolidayModel } from "../../holidays/models";
import { formatIndianTime, formatServerDate } from "../../../../utils/common";
import { addEditAttendance, getAllAttendance } from "../AttendanceServices";
import { AdminAttendanceCreateDto, AttendanceStatus } from "../AttendanceModels";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
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

import { AppButton, AppIconButton, AppTextField } from "../../../shared/components/ui";
interface Employee {
  name: string;
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
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
}

const attendanceStatusOptions: Array<{ value: AttendanceStatus; label: string; requiresTime?: boolean }> = [
  { value: "P", label: "Present" },
  { value: "A", label: "Absent" },
  { value: "SL", label: "Sick Leave" },
  { value: "CL", label: "Casual Leave" },
  { value: "EL", label: "Earned Leave" },
  { value: "WFH", label: "Work From Home" },
  { value: "HD", label: "Half Day" },
  { value: "ED", label: "Early Departure" },
  { value: "LHD", label: "Late Arrival-Half Day" },
  { value: "WFH+WFO", label: "Half WFH and Half WFO" },
  { value: "COMP-OFF", label: "Compensatory Off" },
  { value: "CL-HALF", label: "Casual Leave (Half Day)" },
  { value: "SL-HALF", label: "Sick Leave (Half Day)" },
  { value: "WFH-HD", label: "WFH with Half Day" },
];

const attendanceStatusLabels = Object.fromEntries(
  attendanceStatusOptions.map(({ value, label }) => [value, label]),
) as Record<AttendanceStatus, string>;

const statusesWithTimes = new Set<AttendanceStatus>([
  "P", "WFH", "HD", "ED", "LHD", "WFH+WFO", "WFH-HD",
]);

interface Props {
  employees: Employee[];
  searchValue: string;
  selectedDay: string;
  // Company view is independent from mutation authority. A reviewer can see
  // the company grid without gaining edit, bulk, or exception controls.
  companyView?: boolean;
  readOnly?: boolean;
  onStatsChange?: (stats: {
    present: number;
    absent: number;
    late: number;
    total: number;
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
  selectedDay,
  companyView = false,
  searchValue,
  readOnly = false,
  onStatsChange,
}) => {
  const theme = useTheme();
  const [statusOptions, setStatusOptions] = useState(attendanceStatusOptions);
  useEffect(() => {
    getRequest<ResponseData<AttendanceStatusSetting>>("api/attendance-status-settings?activeOnly=true")
      .then(({ data }) => setStatusOptions((data.methodResults ?? []).map(x => ({ value: x.code as AttendanceStatus, label: x.name, requiresTime: x.requiresTime }))))
      .catch(() => setStatusOptions(attendanceStatusOptions));
  }, []);
  const [attendanceData, setAttendanceData] = useState<
    Record<string, AttendanceData>
  >({});
  const [selectedCell, setSelectedCell] = useState<{
    employee: AttendanceRow;
    dateObj: Date;
  } | null>(null);

  const [modalData, setModalData] = useState<AttendanceData>(initialModalState);
  const [holidays, setHolidays] = useState<Set<string>>(new Set());
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0, 6]);
  useEffect(() => {
    getRequest<{ offDays: number[] }>("api/attendance/weekly-offs")
      .then(({ data }) => setWeeklyOffDays(data.offDays))
      .catch(() => setWeeklyOffDays([0, 6]));
  }, []);

  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(today);

  const selectedMonth = selectedDate?.month() ?? today.month();
  const selectedYear = selectedDate?.year() ?? today.year();
  const daysInMonth = selectedDate?.daysInMonth() ?? today.daysInMonth();
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    title: string;
    content: string;
  }>({
    open: false,
    title: "",
    content: "",
  });

  const normalizeUserId = (userId?: string) => (userId ?? "").toString().trim().toLowerCase();
  const resolveRowId = (emp: Employee) => normalizeUserId(emp.userId || emp.id);
  const [attendanceItems, setAttendanceItems] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestModel[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);

  const isLeaveGeneratedAttendance = (userId: string, dateISO: string) =>
    attendanceItems.some((item) =>
      item.userId === userId &&
      formatServerDate(item.date, "YYYY-MM-DD") === dateISO &&
      String(item.sourceType ?? "").toUpperCase() === "LEAVE",
    );

  useEffect(() => {
    const handleExceptionEdit = (event: Event) => {
      const detail = (event as CustomEvent<{ employeeId: string; date: string }>).detail;
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

      setSelectedDate(affectedDate);
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
    return () => window.removeEventListener("edit-attendance-exception", handleExceptionEdit);
  }, [employees, rowsPerPage]);

  /*---------------------------------LEave------------------------------- */

  useEffect(() => {
    if (!selectedDate || employees.length === 0) return;

    const fetchAllData = async () => {
      try {
        /* ------------------ LEAVES ------------------ */
        let leaveItems: LeaveRequestModel[] = [];
        const approvedWfhById = new Map<string, { fromDate: string; toDate: string }>();
        if (companyView) {
        const leavePayload: GetLeaveRequestPayLoad = {
          pageNo: 1,
          pageSize: 1000,
          startDate: selectedDate.startOf("month"),
          endDate: selectedDate.endOf("month"),
          status: LEAVE_REQUEST_STATUS.APPROVED,
        };

        const leaveResponse = await getAllLeaveRequest(leavePayload);
        leaveItems = leaveResponse?.data?.methodResults ?? [];
        setLeaveRequests(leaveItems);
        // A legacy WFH attendance row can have been serialized at the previous
        // UTC day. The approved request owns the business date, just as an
        // approved leave request does, so use it for one-day WFH rows.
        try {
          const wfhResponse = await getRequest<{ methodResults?: Array<{ requestId: string; fromDate: string; toDate: string; status: string }> }>("api/wfh/requests/all");
          (wfhResponse.data.methodResults ?? [])
            .filter((request) => request.status === "Approved")
            .forEach((request) => approvedWfhById.set(request.requestId, request));
        } catch {
          // Attendance remains usable for viewers without WFH-all permission.
        }
        } else {
          setLeaveRequests([]);
        }

        /* ------------------ HOLIDAYS ------------------ */
        const holidayPayload: HolidayPayload = {
          fromDate: selectedDate.startOf("month"),
          toDate: selectedDate.endOf("month"),
        };

        const holidayResponse = await getHolidays(holidayPayload);
        const holidayDates =
          holidayResponse?.data?.methodResults?.map((h: HolidayModel) =>
            formatServerDate(h.date, "YYYY-MM-DD"),
          ) ?? [];

        setHolidays(new Set(holidayDates));

        /* ------------------ ATTENDANCE ------------------ */
        const attendancePayload = {
          fromDate: selectedDate.startOf("month").format("YYYY-MM-DD"),
          toDate: selectedDate.endOf("month").format("YYYY-MM-DD"),
          userIds: employees.map((e) => e.userId || e.id).filter(Boolean),
        };

        const attendanceResponse = !companyView
          ? await getRequest<{ items?: any[] }>(`api/attendance/me/grid?year=${selectedYear}&month=${selectedMonth + 1}`, {
              headers: { "Cache-Control": "no-cache" },
            })
          : await getAllAttendance(attendancePayload);
        // Current calendar endpoints return { items }.  Older deployed API builds
        // return the standard Result envelope, so accept both while deployments roll.
        const responsePayload = attendanceResponse?.data as any;
        const responseItems = responsePayload?.items ?? responsePayload?.methodResults ?? responsePayload?.methodResult ?? responsePayload;
        const items = Array.isArray(responseItems) ? responseItems : [];
        setAttendanceItems(items);

        const formatted: Record<string, AttendanceData> = {};
        const approvedLeaveById = new Map<string, LeaveRequestModel>(
          leaveItems.map((leave: LeaveRequestModel) => [leave.leaveRequestId, leave] as const),
        );

        items.forEach((item: any) => {
          const sourceIsLeave = String(item.sourceType ?? "").toUpperCase() === "LEAVE";
          const relatedLeave = sourceIsLeave
            ? approvedLeaveById.get(item.sourceId)
            : undefined;
          const sourceIsWfh = String(item.sourceType ?? "").toUpperCase() === "WFH_REQUEST";
          const relatedWfh = sourceIsWfh ? approvedWfhById.get(item.sourceId) : undefined;

          // Leave requests own the business date. For a single-day source row, use the
          // approved request date rather than a serialized attendance timestamp. This
          // prevents a timezone-shifted/stale source timestamp from showing a 5 Aug or
          // 17 Aug leave under an earlier calendar column.
          const dateISO = relatedLeave && relatedLeave.totalDays <= 1
            ? dayjs(relatedLeave.startDate).format("YYYY-MM-DD")
            : relatedWfh && relatedWfh.fromDate.slice(0, 10) === relatedWfh.toDate.slice(0, 10)
              ? dayjs(relatedWfh.fromDate).format("YYYY-MM-DD")
            : formatServerDate(item.date, "YYYY-MM-DD");
          if (!dateISO || dateISO === "NA") return;

          // The self endpoint derives the employee from the access token.  Use
          // the rendered row identity for that one-row grid rather than relying
          // on a legacy user-id representation returned by older attendance rows.
          const rowUserId = !companyView ? resolveRowId(employees[0]) : normalizeUserId(item.userId);
          if (!rowUserId) return;
          const key = `${rowUserId}-${dateISO}`;

          formatted[key] = {
            status: item.status,
            checkIn: formatIndianTime(item.checkInTime),
            checkOut: formatIndianTime(item.checkOutTime),
            remarks: item.remarks ?? "",
            sourceType: item.sourceType ?? null,
            sourceId: item.sourceId ?? null,
          };
        });

        setAttendanceData(formatted);
      } catch (error) {
        console.error("Failed to fetch calendar data", error);
      }
    };

    fetchAllData();
  }, [selectedDate, employees, companyView, reloadKey]);

  /*-------------------------------ICON STATS-------------------------------------- */

  useEffect(() => {
    if (!attendanceItems.length) {
      onStatsChange?.({
        present: 0,
        absent: 0,
        late: 0,
        total: employees.length,
      });
      return;
    }

    let present = 0;
    let absent = 0;
    let late = 0;

    const todayDate = dayjs();

    attendanceItems.forEach((item: any) => {
      const itemDate = dayjs(formatServerDate(item.date, "YYYY-MM-DD"));

      let include = false;

      switch (selectedDay) {
        case "today":
          include = itemDate.isSame(todayDate, "day");
          break;

        case "week":
          include = itemDate.isSame(todayDate, "week");
          break;

        case "month":
          include = itemDate.isSame(todayDate, "month");
          break;

        default:
          include = true;
      }

      if (include) {
        if (item.status === "P") present++;
        if (item.status === "A") absent++;
        if (item.lateCount > 0) late++;
      }
    });

    onStatsChange?.({
      present,
      absent,
      late,
      total: employees.length,
    });
  }, [attendanceItems, selectedDay, employees]);

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
      checkIn: existing?.checkIn ?? (existing?.status === "HD" ? "09:00" : ""),
      checkOut: existing?.checkOut ?? (existing?.status === "HD" ? "13:00" : ""),
      remarks: existing?.remarks ?? "",
    });
  }, [selectedCell, attendanceData]);

  /* ----------------------------------------------------------- GRID COLUMN ------------------------------------------- */

  const columns: GridColDef<AttendanceRow>[] = useMemo(() => {
    return [
      {
        field: "name",
        headerName: "Employee",
        width: 200,
        renderCell: (params) => {
          const name = params.value || "";
          const search = searchValue?.toLowerCase();

          if (!search) return name;

          const index = name.toLowerCase().indexOf(search);
          if (index === -1) return name;

          return (
            <>
              {name.substring(0, index)}
              <Box
                component="span"
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.28),
                  color: "text.primary",
                }}
              >
                {name.substring(index, index + search.length)}
              </Box>
              {name.substring(index + search.length)}
            </>
          );
        },
      },

      ...Array.from({ length: daysInMonth }, (_, i) => {
        const dateObj = new Date(selectedYear, selectedMonth, i + 1);
        const dayOfWeek = dateObj.getDay();
        const isWeekend = weeklyOffDays.includes(dayOfWeek);
        const dateIso = dayjs(dateObj).format("YYYY-MM-DD");
        const isHoliday = holidays.has(dateIso);
        const editable = !readOnly && dateObj <= today.toDate() && !isHoliday && !isWeekend;

        const getIcon = (value: AttendanceData) => {
          switch (value.status) {
            case "P":
              return <TaskAltIcon sx={{ fontSize: 18, color: "success.main" }} />;

            case "A":
              return <PersonOffIcon sx={{ fontSize: 18, color: "error.main" }} />;

            case "HD":
            case "LHD":
            case "WFH-HD":
              return <TimelapseIcon sx={{ fontSize: 18, color: "warning.main" }} />;

            case "SL":
            case "CL":
            case "EL":
            case "COMP-OFF":
            case "CL-HALF":
            case "SL-HALF":
              return <EventBusyIcon sx={{ fontSize: 18, color: "primary.main" }} />;

            case "WFH":
            case "WFH+WFO":
            case "ED":
              return <TaskAltIcon sx={{ fontSize: 18, color: "info.main" }} />;

            default:
              if (isHoliday) {
                return <CelebrationIcon sx={{ fontSize: 18, color: "secondary.main" }} />;
              }

              if (isWeekend && !isHoliday) {
                return (
                  <FreeBreakfastIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                );
              }
              return null;
          }
        };
        const getBg = (value: AttendanceData) => {
          if (isHoliday) return alpha(theme.palette.secondary.main, 0.16);
          if (isWeekend && !isHoliday && !value.status) return theme.palette.action.hover;

          switch (value.status) {
            case "P":
              return alpha(theme.palette.success.main, 0.14);
            case "A":
              return alpha(theme.palette.error.main, 0.14);
            case "HD":
            case "LHD":
            case "WFH-HD":
              return alpha(theme.palette.warning.main, 0.14);
            case "SL":
            case "CL":
            case "EL":
            case "COMP-OFF":
            case "CL-HALF":
            case "SL-HALF":
              return alpha(theme.palette.primary.main, 0.14);
            case "WFH":
            case "WFH+WFO":
            case "ED":
              return alpha(theme.palette.info.main, 0.14);
            default:
              return theme.palette.background.paper;
          }
        };

        return {
          field: `day-${i + 1}`,
          renderHeader: () => (
            <Stack
              alignItems="center"
              spacing={0.5}
              sx={{
                py: 1,
                opacity: isHoliday || isWeekend ? 0.7 : 1,
              }}
            >
              <Typography fontSize={11} color="text.secondary">
                {dayjs(dateObj).format("ddd")}
              </Typography>
              <Typography fontWeight="600" fontSize={14}>
                {i + 1}
              </Typography>
            </Stack>
          ),

          width: 85,
          sortable: false,
          renderCell: (params: any) => {
            const value = params.value as AttendanceData;
            const isLeaveGenerated = value.sourceType?.toUpperCase() === "LEAVE";
            const isSystemDefault = ["SYSTEM_DEFAULT_PRESENT", "SYSTEM_OFFICE_START_PRESENT"].includes(value.sourceType?.toUpperCase() ?? "");
            const relatedLeave = isLeaveGenerated
              ? leaveRequests.find((leave) => leave.leaveRequestId === value.sourceId)
              : undefined;
            const statusCode = value.status || "—";
            const statusLabel = value.status
              ? attendanceStatusLabels[value.status as AttendanceStatus] ?? value.status
              : "No attendance recorded";
            const leaveDetail = relatedLeave
              ? `${relatedLeave.leavePolicyName} • ${relatedLeave.isHalfDay ? "Half day" : "Full day"} • Approved • Generated from leave request`
              : "Approved leave • Generated from leave request";
            const tooltipText = isLeaveGenerated
              ? `${statusCode} — ${statusLabel}\n${leaveDetail}\n${dayjs(dateObj).format("DD MMMM YYYY")}`
              : isSystemDefault
                ? `${statusCode} - System default Present\nCreated automatically. An authorized attendance, Leave, or WFH workflow can update it.`
              : isHoliday
                ? "Public Holiday"
                : isWeekend
                  ? "Weekend"
                  : statusLabel;
            const canEdit = editable && !isLeaveGenerated;

            return (
              <Tooltip
                title={<Typography component="span" variant="body2" sx={{ whiteSpace: "pre-line" }}>{tooltipText}</Typography>}
              >
                <Box
                  onClick={() => {
                    if (readOnly) return;
                    if (isLeaveGenerated) {
                      setConfirmationModal({
                        open: true,
                        title: "Leave-generated attendance",
                        content: "This record is generated from an approved leave request. Use the authorized leave-attendance conflict-resolution workflow to make a correction.",
                      });
                      return;
                    }
                    if (canEdit) setSelectedCell({ employee: params.row, dateObj });
                  }}
                  role="button"
                  tabIndex={!readOnly && (isLeaveGenerated || canEdit) ? 0 : -1}
                  aria-label={tooltipText.replace(/\n/g, ". ")}
                  onKeyDown={(event) => {
                    if (!readOnly && (event.key === "Enter" || event.key === " ") && (isLeaveGenerated || canEdit)) {
                      event.preventDefault();
                      event.currentTarget.click();
                    }
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 46,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: getBg(value),
                    borderRadius: 2,
                    cursor: isLeaveGenerated || canEdit ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": (isLeaveGenerated || canEdit) ? {
                      transform: "scale(1.05)",
                      boxShadow: theme.shadows[3],
                    } : {},
                  }}
                >
                  {isLeaveGenerated ? (
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                      <Typography component="span" fontSize={12} fontWeight={800} aria-hidden="true">
                        {statusCode}
                      </Typography>
                      {isSystemDefault && <Typography component="span" fontSize={8} color="text.secondary" aria-hidden="true">System</Typography>}
                      <LockOutlinedIcon sx={{ fontSize: 14 }} aria-hidden="true" />
                    </Stack>
                  ) : value.status ? (
                    <Stack alignItems="center" spacing={0.25}>
                      {getIcon(value)}
                      <Typography component="span" fontSize={11} fontWeight={800} aria-hidden="true">
                        {statusCode}
                      </Typography>
                    </Stack>
                  ) : (
                    getIcon(value)
                  )}
                </Box>
              </Tooltip>
            );
          },
        };
      }),
    ];
  }, [daysInMonth, holidays, weeklyOffDays, selectedMonth, selectedYear, today, searchValue, theme, leaveRequests]);

  /* ------------------------------------------------------------ GRID ROW ------------------------------------------------------------------------------------- */

  const rows: AttendanceRow[] = useMemo(() => {
    return employees.map((emp) => {
      const row: AttendanceRow = {
        id: resolveRowId(emp),
        employeeId: emp.employeeId ?? "",
        name: emp.name,
      };

      for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(selectedYear, selectedMonth, i);
        const dateISO = dayjs(dateObj).format("YYYY-MM-DD");
        const key = `${resolveRowId(emp)}-${dateISO}`;

        row[`day-${i}`] = attendanceData[key] ?? initialModalState;
      }

      return row;
    });
  }, [employees, attendanceData, daysInMonth, leaveRequests]);

  useEffect(() => {
    setPage(0);
  }, [employees, selectedMonth, selectedYear]);

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
      await addEditAttendance(payload);

      setAttendanceData((prev) => ({
        ...prev,
        [key]: modalData,
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
      setConfirmationModal({
        open: true,
        title: isLocked ? "Attendance Locked" : "Error",
        content: responseMessage || "Failed to save attendance",
      });
      return;
    }

    setSelectedCell(null);
    setModalData(initialModalState);
  };

  /* ------------------------------------------------- RENDER ------------------------------------------------------------ */

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          mt: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            boxShadow: theme.shadows[2],
          }}>
          
          <AppIconButton
            size="small"
            sx={{ p: 0.5 }}
            onClick={() =>
              setSelectedDate((prev) => prev?.subtract(1, "month") ?? prev)
            }
          >
            <KeyboardArrowLeftIcon fontSize="small" />
          </AppIconButton>

          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 15,
              minWidth: 140,
              textAlign: "center",
              color: "text.primary",
              letterSpacing: 0.3,
            }}
          >
            {selectedDate?.format("MMMM YYYY")}
          </Typography>

          <AppIconButton
            size="small"
            sx={{ p: 0.5 }}
            onClick={() =>
              setSelectedDate((prev) => prev?.add(1, "month") ?? prev)
            }
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </AppIconButton>
        </Box>
      </Box>
      <Card
        sx={{
          p: 2,
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            overflowX: "auto",
            width: "100%",
            pb: 1,
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "background.default",
              borderBottom: "1px solid",
              borderBottomColor: "divider",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid",
              borderBottomColor: "divider",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "transparent",
            },
          }}
        >
          <Box sx={{ minWidth: 230 + daysInMonth * 85 }}>
      {!hasAttendanceForVisibleMonth && !companyView && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 1, pb: 1 }}>
          No attendance has been recorded for {selectedDate?.format("MMMM YYYY")}.
        </Typography>
      )}
      <CustomDataGrid
              row={paginatedRows}
              columns={columns}
              keyName="id"
              hidePagination
              loading={false}
              checkboxSelection={false}
            />
          </Box>
        </Box>
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
        />
      </Card>
      {!readOnly && <MonthlyAttendanceExceptions month={selectedDate ?? today} />}
      <CustomisedModal
        open={Boolean(selectedCell)}
        handleClose={() => {
          setSelectedCell(null);
          setModalData(initialModalState);
        }}
        title={selectedCell?.employee.name}
      >
        {selectedCell && (
          <Stack spacing={2}>
            <Typography>{selectedCell.dateObj.toDateString()}</Typography>

            <AppTextField
              select
              label="Status"
              fullWidth
              value={modalData.status}
              onChange={(e) =>
                setModalData((prev) => ({
                  ...prev,
                  status: e.target.value as AttendanceData["status"],
                }))
              }
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.value} - {option.label}
                </MenuItem>
              ))}
            </AppTextField>

            {modalData.status && (statusOptions.find(x => x.value === modalData.status)?.requiresTime ?? statusesWithTimes.has(modalData.status)) && (
              <>
                <AppTextField
                  label="Check-in"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={modalData.checkIn}
                  onChange={(e) =>
                    setModalData((prev) => ({
                      ...prev,
                      checkIn: e.target.value,
                    }))
                  }
                />
                <AppTextField
                  label="Check-out"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={modalData.checkOut}
                  onChange={(e) =>
                    setModalData((prev) => ({
                      ...prev,
                      checkOut: e.target.value,
                    }))
                  }
                />
              </>
            )}

            <AppTextField
              label="Remarks"
              fullWidth
              multiline
              minRows={2}
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
                Save
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
