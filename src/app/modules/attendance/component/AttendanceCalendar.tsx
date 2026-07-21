import { FC, useMemo, useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  MenuItem,
  Tooltip,
  IconButton,
  Card,
  TablePagination,
  alpha,
  useTheme,
} from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import utc from "dayjs/plugin/utc";
import { GridColDef } from "@mui/x-data-grid";
import { CustomDataGrid } from "../../../shared/components/CustomDataGrid";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import dayjs, { Dayjs } from "dayjs";
import { getHolidays } from "../../holidays/calendarServices";
import { HolidayPayload, HolidayModel } from "../../holidays/models";
import { addEditAttendance, getAllAttendance } from "../AttendanceServices";
import { AdminAttendanceCreateDto, AttendanceStatus } from "../AttendanceModels";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import CelebrationIcon from "@mui/icons-material/Celebration";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import { GetLeaveRequestPayLoad, LeaveRequestModel } from "../../leaves/model";
import { LEAVE_REQUEST_STATUS } from "../../../../utils/enums";
import { getAllLeaveRequest } from "../../leaves/leaveServices";
import { getRequest } from "../../../../server/axios";
import { ResponseData } from "../../../../utils/common_types";
import { AttendanceStatusSetting } from "../AttendanceStatusSettings";
import MonthlyAttendanceExceptions from "./MonthlyAttendanceExceptions";

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
  searchValue,
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
  const [holidays, setHolidays] = useState<number[]>([]);
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
  const [bulkDate, setBulkDate] = useState<Date | null>(null);
  const [bulkStatus, setBulkStatus] = useState<AttendanceData["status"]>("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    title: string;
    content: string;
  }>({
    open: false,
    title: "",
    content: "",
  });
  const [attendanceItems, setAttendanceItems] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestModel[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
        const leavePayload: GetLeaveRequestPayLoad = {
          pageNo: 1,
          pageSize: 1000,
          startDate: selectedDate.startOf("month"),
          endDate: selectedDate.endOf("month"),
          status: LEAVE_REQUEST_STATUS.APPROVED,
        };

        const leaveResponse = await getAllLeaveRequest(leavePayload);
        const leaveItems = leaveResponse?.data?.methodResults ?? [];
        setLeaveRequests(leaveItems);

        /* ------------------ HOLIDAYS ------------------ */
        const holidayPayload: HolidayPayload = {
          fromDate: selectedDate.startOf("month"),
          toDate: selectedDate.endOf("month"),
        };

        const holidayResponse = await getHolidays(holidayPayload);
        const holidayDays =
          holidayResponse?.data?.methodResults?.map((h: HolidayModel) =>
            new Date(h.date).getDate(),
          ) ?? [];

        setHolidays(holidayDays);

        /* ------------------ ATTENDANCE ------------------ */
        const attendancePayload = {
          fromDate: selectedDate.startOf("month").format("YYYY-MM-DD"),
          toDate: selectedDate.endOf("month").format("YYYY-MM-DD"),
          userIds: employees.map((e) => e.id),
        };

        const attendanceResponse = await getAllAttendance(attendancePayload);
        const items = attendanceResponse?.data?.items ?? [];
        setAttendanceItems(items);

        const formatted: Record<string, AttendanceData> = {};

        items.forEach((item: any) => {
          const dateISO = dayjs(item.date).format("YYYY-MM-DD");
          const key = `${item.userId}-${dateISO}`;

          formatted[key] = {
            status: item.status,
            checkIn: item.checkInTime
              ? dayjs(item.checkInTime).format("HH:mm")
              : "",
            checkOut: item.checkOutTime
              ? dayjs(item.checkOutTime).format("HH:mm")
              : "",
            remarks: item.remarks ?? "",
          };
        });

        setAttendanceData(formatted);
      } catch (error) {
        console.error("Failed to fetch calendar data", error);
      }
    };

    fetchAllData();
  }, [selectedDate, employees]);

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
      const itemDate = dayjs(item.date);

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
    const key = `${selectedCell.employee.id}-${dateISO}`;
    const existing = attendanceData[key];

    setModalData({
      status: existing?.status ?? "",
      checkIn: existing?.checkIn ?? (existing?.status === "HD" ? "09:00" : ""),
      checkOut: existing?.checkOut ?? (existing?.status === "HD" ? "13:00" : ""),
      remarks: existing?.remarks ?? "",
    });
  }, [selectedCell, attendanceData]);

  /* ----------------------------------------------------------BULK SAVE--------------------------------------------------------------------------*/
  const handleBulkSave = async () => {
    if (!bulkDate || !bulkStatus) {
      setConfirmationModal({
        open: true,
        title: "Check",
        content: "Please Select Status And Date",
      });

      return;
    }

    const dateISO = dayjs(bulkDate).format("YYYY-MM-DD");

    const updates: Record<string, AttendanceData> = {};

    try {
      for (const emp of employees) {
        const dayOfWeek = bulkDate.getDay();
        const isWeekend = weeklyOffDays.includes(dayOfWeek);
        const isHoliday = holidays.includes(bulkDate.getDate());
        if (isWeekend || isHoliday) {
          setConfirmationModal({
            open: true,
            title: "Invalid",
            content: "Cannot mark attendance on Weekend or Public Holiday",
          });
          return;
        }

        const key = `${emp.userId}-${dateISO}`;

        const payload: AdminAttendanceCreateDto = {
          UserId: emp.id,
          EmployeeId: emp.employeeId,
          Date: dateISO,
          Status: bulkStatus,
          CheckInTime: bulkStatus === "P" ? "09:00" : undefined,
          CheckOutTime: bulkStatus === "P" ? "18:00" : undefined,
          Remarks: null,
        };

        await addEditAttendance(payload);

        updates[key] = {
          status: bulkStatus,
          checkIn: bulkStatus === "P" ? "09:00" : "",
          checkOut: bulkStatus === "P" ? "18:00" : "",
          remarks: "",
        };
      }

      setAttendanceData((prev) => ({
        ...prev,
        ...updates,
      }));

      setConfirmationModal({
        open: true,
        title: "Success",
        content: "Bulk attendance applied successfully!",
      });
    } catch (error) {
      console.error(error);
      setConfirmationModal({
        open: true,
        title: "Error",
        content: "Bulk save failed",
      });
    }

    setBulkDate(null);
    setBulkStatus("");
    setSelectedEmployeeIds([]);
  };

  /*-----------------------------------------------------------------SELECTED BULK ATTENDANCE-----------------------------------------------------*/
  const handleSelectedBulk = async () => {
    if (!bulkDate || !bulkStatus) {
      setConfirmationModal({
        open: true,
        title: "Check",
        content: "Please Select Status And Date",
      });
      return;
    }

    if (selectedEmployeeIds.length === 0) {
      setConfirmationModal({
        open: true,
        title: "Select",
        content: "Select Employee",
      });
      return;
    }

    const dateISO = dayjs(bulkDate).format("YYYY-MM-DD");

    const updates: Record<string, AttendanceData> = {};

    try {
      for (const userId of selectedEmployeeIds) {
        const dayOfWeek = bulkDate.getDay();
        const isWeekend = weeklyOffDays.includes(dayOfWeek);
        const isHoliday = holidays.includes(bulkDate.getDate());

        if (isWeekend || isHoliday) {
          setConfirmationModal({
            open: true,
            title: "Invalid",
            content: "Cannot mark attendance on Weekend or Public Holiday",
          });
          return;
        }

        const emp = employees.find((e) => e.userId === userId);
        if (!emp) continue;

        const key = `${emp.userId}-${dateISO}`;

        const payload: AdminAttendanceCreateDto = {
          UserId: emp.userId,
          EmployeeId: emp.employeeId,
          Date: dateISO,
          Status: bulkStatus,
          CheckInTime: bulkStatus === "P" ? "09:00" : undefined,
          CheckOutTime: bulkStatus === "P" ? "18:00" : undefined,
          Remarks: null,
        };

        await addEditAttendance(payload);

        updates[key] = {
          status: bulkStatus,
          checkIn: bulkStatus === "P" ? "09:00" : "",
          checkOut: bulkStatus === "P" ? "18:00" : "",
          remarks: "",
        };
      }

      setAttendanceData((prev) => ({
        ...prev,
        ...updates,
      }));

      setConfirmationModal({
        open: true,
        title: "Success",
        content: "Selected employees updated successfully!",
      });
    } catch (error) {
      console.error(error);
      setConfirmationModal({
        open: true,
        title: "Error",
        content: "Bulk update failed",
      });
    }

    setBulkDate(null);
    setBulkStatus("");
    setSelectedEmployeeIds([]);
  };

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
        const isHoliday = holidays.includes(i + 1);
        const editable = dateObj <= today.toDate() && !isHoliday && !isWeekend;

        const getIcon = (value: AttendanceData) => {
          if (isHoliday) {
            return <CelebrationIcon sx={{ fontSize: 18, color: "secondary.main" }} />;
          }

          if (isWeekend && !isHoliday) {
            return (
              <FreeBreakfastIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            );
          }

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
              return null;
          }
        };
        const getBg = (value: AttendanceData) => {
          if (isHoliday) return alpha(theme.palette.secondary.main, 0.16);
          if (isWeekend && !isHoliday) return theme.palette.action.hover;

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
                cursor: dayjs(dateObj).isAfter(today, "day")
                  ? "not-allowed"
                  : "pointer",
              }}
              onClick={() => {
                const isFuture = dayjs(dateObj).isAfter(today, "day");
                if (!isFuture) {
                  setBulkDate(dateObj);
                }
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

            return (
              <Tooltip
                title={
                  isHoliday
                    ? "Public Holiday"
                    : isWeekend
                      ? "Weekend"
                      : value.status
                        ? attendanceStatusLabels[value.status as AttendanceStatus] ?? value.status
                        : ""
                }
              >
                <Box
                  onClick={() =>
                    editable &&
                    setSelectedCell({ employee: params.row, dateObj })
                  }
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 46,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: getBg(value),
                    borderRadius: 2,
                    cursor: editable ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    border: "1px solid",
                    borderColor: "divider",

                    "&:hover": {
                      ...(editable && {
                        transform: "scale(1.05)",
                        boxShadow: theme.shadows[3],
                      }),
                    },
                  }}
                >
                  {getIcon(value)}
                </Box>
              </Tooltip>
            );
          },
        };
      }),
    ];
  }, [daysInMonth, holidays, weeklyOffDays, selectedMonth, selectedYear, today, searchValue, theme]);

  /* ------------------------------------------------------------ GRID ROW ------------------------------------------------------------------------------------- */

  const rows: AttendanceRow[] = useMemo(() => {
    return employees.map((emp) => {
      const row: AttendanceRow = {
        id: emp.id,
        employeeId: emp.employeeId ?? "",
        name: emp.name,
      };

      const employeeLeaves = leaveRequests.filter(
        (leaveItem) => leaveItem.employeeId === emp.employeeId,
      );

      for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(selectedYear, selectedMonth, i);
        const dateISO = dayjs(dateObj).format("YYYY-MM-DD");
        const key = `${emp.id}-${dateISO}`;

        const leave = employeeLeaves.find((leaveItem) => {
          const start = dayjs(leaveItem.startDate).format("YYYY-MM-DD");
          const end = dayjs(leaveItem.endDate).format("YYYY-MM-DD");
          return dateISO >= start && dateISO <= end;
        });
        if (leave) {
          row[`day-${i}`] = {
            status: leave.isHalfDay ? "H" : "L",
            checkIn: "",
            checkOut: "",
            remarks: leave.leavePolicyName,
          };
        } else {
          row[`day-${i}`] = attendanceData[key] ?? initialModalState;
        }
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
      UserId: selectedCell.employee.id,
      EmployeeId: selectedCell.employee.employeeId,
      Date: dateISO,
      CheckInTime: modalData.checkIn || undefined,
      CheckOutTime: modalData.checkOut || undefined,
      Status: modalData.status,
      Remarks: modalData.remarks || null,
    };

    const key = `${selectedCell.employee.id}-${dateISO}`;

    try {
      await addEditAttendance(payload);

      setAttendanceData((prev) => ({
        ...prev,
        [key]: modalData,
      }));

      setConfirmationModal({
        open: true,
        title: "Success",
        content: "Attendance saved successfully!",
      });
    } catch (err) {
      console.error("Save failed", err);
      setConfirmationModal({
        open: true,
        title: "Error",
        content: "Failed to save attendance",
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
          }}
        >
          <IconButton
            size="small"
            sx={{ p: 0.5 }}
            onClick={() =>
              setSelectedDate((prev) => prev?.subtract(1, "month") ?? prev)
            }
          >
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>

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

          <IconButton
            size="small"
            sx={{ p: 0.5 }}
            onClick={() =>
              setSelectedDate((prev) => prev?.add(1, "month") ?? prev)
            }
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>
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
            <CustomDataGrid
              row={paginatedRows}
              columns={columns}
              keyName="id"
              hidePagination
              loading={false}
              checkboxSelection
              onRowSelectionModelChange={(
                selectionModel: GridRowSelectionModel,
              ) => {
                const selectedIds = Array.from(selectionModel.ids);
                setSelectedEmployeeIds(selectedIds.map((id) => String(id)));
              }}
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
      <MonthlyAttendanceExceptions month={selectedDate ?? today} />
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

            <TextField
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
            </TextField>

            {modalData.status && (statusOptions.find(x => x.value === modalData.status)?.requiresTime ?? statusesWithTimes.has(modalData.status)) && (
              <>
                <TextField
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
                <TextField
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

            <TextField
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
              <Button
                variant="contained"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
                onClick={saveAttendance}
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setSelectedCell(null);
                  setModalData(initialModalState);
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
      </CustomisedModal>
      <CustomisedModal
        open={Boolean(bulkDate)}
        handleClose={() => {
          setBulkDate(null);
          setBulkStatus("");
        }}
        title="Mark Attendance for All"
      >
        {bulkDate && (
          <Stack spacing={2}>
            <Typography>{bulkDate.toDateString()}</Typography>
            <Typography color="primary">
              {selectedEmployeeIds.length > 0
                ? `${selectedEmployeeIds.length} Employees Selected`
                : "All Employees"}
            </Typography>

            <TextField
              select
              label="Select Status"
              fullWidth
              value={bulkStatus}
              onChange={(e) =>
                setBulkStatus(e.target.value as AttendanceData["status"])
              }
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.value} - {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              onClick={
                selectedEmployeeIds.length > 0
                  ? handleSelectedBulk
                  : handleBulkSave
              }
            >
              {selectedEmployeeIds.length > 0
                ? "Apply to Selected"
                : "Apply to All"}
            </Button>
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
