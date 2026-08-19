import { Box, Card, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { DateCalendar, LocalizationProvider, PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { getAllAttendance } from "../../attendance/AttendanceServices";
import { formatServerDate, hasModuleFeaturePermission } from "../../../../utils/common";
import { AttendanceModel } from "../../attendance/AttendanceModels";
import { getRequest } from "../../../../server/axios";
import { ResponseData } from "../../../../utils/common_types";
import { useAppSelector } from "../../../Redux/hooks";
import { useUserDetails } from "../UserDataProvider";
import { ModulesName, Permission, Roles } from "../../../../utils/enums";

type AttendanceStatusSetting = {
  code: string;
  name: string;
  colorHex?: string;
};

const fallbackColors: Record<string, string> = {
  P: "#2E7D32", A: "#D32F2F", SL: "#1976D2", CL: "#7B1FA2", EL: "#00838F",
  WFH: "#5E35B1", HD: "#EF6C00", ED: "#C62828", LHD: "#AD1457",
};

function LeaveCalendar() {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [attendance, setAttendance] = useState<AttendanceModel[]>([]);
  const [statuses, setStatuses] = useState<AttendanceStatusSetting[]>([]);
  const { userDetails } = useUserDetails();
  const userData = useAppSelector((state) => state.user.userData);
  const currentUserId = userData?.userId;
  const targetUserId = userDetails.userId || currentUserId;
  const canViewOtherAttendance = userData?.roleType === Roles.Administrator || hasModuleFeaturePermission(ModulesName.Attendance, Permission.ViewAll, userData?.modulePermission ?? []);
  const mayViewCalendar = targetUserId === currentUserId || canViewOtherAttendance;

  useEffect(() => {
    if (!targetUserId || !mayViewCalendar) { setAttendance([]); return; }

    const load = async () => {
      const fromDate = month.startOf("month").format("YYYY-MM-DD");
      const toDate = month.endOf("month").format("YYYY-MM-DD");
      try {
        const statusResponse = await getRequest<ResponseData<AttendanceStatusSetting>>("api/attendance-status-settings?activeOnly=true");
        setStatuses(statusResponse.data.methodResults ?? []);
        if (targetUserId === currentUserId) {
          const response = await getRequest<{ items?: AttendanceModel[] }>(`api/attendance/me/calendar?year=${month.year()}&month=${month.month() + 1}`);
          setAttendance(response.data.items ?? []);
        } else {
          const response = await getAllAttendance({ fromDate, toDate, userIds: [targetUserId] });
          setAttendance((response.data.items ?? []) as unknown as AttendanceModel[]);
        }
      } catch (error) {
        console.error("Unable to load the employee attendance calendar", error);
        setAttendance([]);
      }
    };

    void load();
  }, [currentUserId, mayViewCalendar, month, targetUserId]);

  const attendanceByDay = useMemo(
    () => new Map(attendance.map((item) => [formatServerDate(item.date, "YYYY-MM-DD"), item])),
    [attendance],
  );
  const statusByCode = useMemo(
    () => new Map(statuses.map((status) => [status.code, status])),
    [statuses],
  );
  const visibleStatuses = useMemo(
    () => Array.from(new Set(attendance.map((item) => item.status))).map((code) => ({
      code,
      name: statusByCode.get(code)?.name ?? code,
      color: statusByCode.get(code)?.colorHex ?? fallbackColors[code] ?? "#64748B",
    })),
    [attendance, statusByCode],
  );

  if (!mayViewCalendar) {
    return null;
  }

  const renderDay = (dayProps: PickersDayProps<Dayjs>) => {
    const record = attendanceByDay.get(dayProps.day.format("YYYY-MM-DD"));
    if (!record) return <PickersDay {...dayProps} />;

    const setting = statusByCode.get(record.status);
    const color = setting?.colorHex ?? fallbackColors[record.status] ?? "#64748B";
    const statusName = setting?.name ?? record.status;
    const timeText = record.checkInTime
      ? `\nPunch in: ${dayjs(record.checkInTime).format("hh:mm A")}${record.checkOutTime ? ` · Punch out: ${dayjs(record.checkOutTime).format("hh:mm A")}` : ""}`
      : "";

    return (
      <Tooltip arrow placement="top" title={<Box><Typography variant="caption" fontWeight={800}>{record.status} · {statusName}</Typography><Typography variant="caption" display="block">{dayProps.day.format("DD MMMM YYYY")}{timeText}</Typography></Box>}>
        <PickersDay
          {...dayProps}
          sx={{
            bgcolor: color,
            color: "#fff",
            fontWeight: 800,
            border: "2px solid",
            borderColor: "background.paper",
            "&:hover, &:focus": { bgcolor: color, filter: "brightness(.9)" },
            "&.Mui-selected": { bgcolor: color, color: "#fff" },
          }}
        />
      </Tooltip>
    );
  };

  return (
    <Card sx={{ height: 1, px: 2, pb: 2, borderRadius: 3, border: 1, borderColor: "divider", boxShadow: "0 10px 28px rgba(0,0,0,.07)", overflow: "hidden" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={month}
          onMonthChange={(value) => setMonth(value.startOf("month"))}
          onChange={(value) => value && setMonth(value.startOf("month"))}
          readOnly
          slots={{ day: renderDay }}
          sx={{ width: "auto", button: { border: "none" }, ".MuiDayCalendar-header, .MuiDayCalendar-weekContainer": { justifyContent: "space-between" } }}
        />
      </LocalizationProvider>
      <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.5 }}>
        {visibleStatuses.length ? visibleStatuses.map((status) => <Chip key={status.code} size="small" label={status.code} title={status.name} sx={{ borderRadius: 1.5, fontWeight: 800, bgcolor: status.color, color: "#fff" }} />) : <Chip size="small" label="No attendance this month" variant="outlined" />}
      </Stack>
    </Card>
  );
}

export default LeaveCalendar;
