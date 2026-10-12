import { Box, Card, Chip, Stack, Tooltip, Typography, alpha } from "@mui/material";
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
import { getHolidays } from "../../holidays/calendarServices";
import { HolidayModel } from "../../holidays/models";

type AttendanceStatusSetting = {
  code: string;
  name: string;
  colorHex?: string;
};

const fallbackColors: Record<string, string> = {
  P: "#2E7D32", A: "#D32F2F", SL: "#1976D2", CL: "#7B1FA2", EL: "#00838F",
  WFH: "#5E35B1", HD: "#EF6C00", ED: "#C62828", LHD: "#AD1457",
};

type CalendarDayAttendance = {
  daily?: AttendanceModel;
  segments: AttendanceModel[];
};

function LeaveCalendar() {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [attendance, setAttendance] = useState<AttendanceModel[]>([]);
  const [holidays, setHolidays] = useState<Map<string, HolidayModel>>(new Map());
  const [statuses, setStatuses] = useState<AttendanceStatusSetting[]>([]);
  const { userDetails } = useUserDetails();
  const userData = useAppSelector((state) => state.user.userData);
  const currentUserId = userData?.userId;
  const targetUserId = userDetails.userId || currentUserId;
  const canViewOtherAttendance = userData?.roleType === Roles.Administrator || hasModuleFeaturePermission(ModulesName.Attendance, Permission.ViewAll, userData?.modulePermission ?? []);
  const mayViewCalendar = targetUserId === currentUserId || canViewOtherAttendance;

  useEffect(() => {
    if (!targetUserId || !mayViewCalendar) { setAttendance([]); setHolidays(new Map()); return; }

    const load = async () => {
      const fromDate = month.startOf("month").format("YYYY-MM-DD");
      const toDate = month.endOf("month").format("YYYY-MM-DD");
      try {
        const [statusResponse, holidayResponse] = await Promise.all([
          getRequest<ResponseData<AttendanceStatusSetting>>("api/attendance-status-settings?activeOnly=true"),
          getHolidays({ fromDate: month.startOf("month"), toDate: month.endOf("month") }),
        ]);
        setStatuses(statusResponse.data.methodResults ?? []);
        setHolidays(new Map((holidayResponse.data.methodResults ?? []).map((holiday) => [formatServerDate(holiday.date, "YYYY-MM-DD"), holiday])));
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
        setHolidays(new Map());
      }
    };

    void load();
  }, [currentUserId, mayViewCalendar, month, targetUserId]);

  const attendanceByDay = useMemo(() => {
    const days = new Map<string, CalendarDayAttendance>();
    attendance.forEach((item) => {
      const date = formatServerDate(item.date, "YYYY-MM-DD");
      const entry = days.get(date) ?? { segments: [] };
      if (item.isDaySegment) {
        entry.segments.push(item);
      } else {
        entry.daily = item;
      }
      days.set(date, entry);
    });
    for (const entry of days.values()) {
      entry.segments.sort((left, right) => left.segment === "FIRST_HALF" ? -1 : right.segment === "FIRST_HALF" ? 1 : 0);
    }
    return days;
  }, [attendance]);
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
    const dateKey = dayProps.day.format("YYYY-MM-DD");
    const holiday = holidays.get(dateKey);
    if (holiday) {
      const holidayName = holiday.name || "Public holiday";
      return (
        <Tooltip arrow placement="top" title={<Box><Typography variant="caption" display="block" fontWeight={800}>{holidayName}</Typography><Typography variant="caption" display="block">Public holiday · {dayProps.day.format("DD MMMM YYYY")}</Typography></Box>}>
          <PickersDay
            {...dayProps}
            aria-label={`${holidayName}, public holiday`}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16),
              color: "secondary.dark",
              fontWeight: 800,
              border: "2px solid",
              borderColor: "background.paper",
              "&:hover, &:focus": { bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.26) },
              "&.Mui-selected": { bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.3), color: "secondary.dark" },
            }}
            >
            {dayProps.day.format("D")}
          </PickersDay>
        </Tooltip>
      );
    }
    const dayAttendance = attendanceByDay.get(dateKey);
    if (!dayAttendance) return <PickersDay {...dayProps} />;

    // Segments are authoritative whenever present: the daily compatibility row
    // cannot describe a day containing two different half-day statuses.
    const records = dayAttendance.segments.length ? dayAttendance.segments : dayAttendance.daily ? [dayAttendance.daily] : [];
    if (!records.length) return <PickersDay {...dayProps} />;
    const colors = records.map((record) => statusByCode.get(record.status)?.colorHex ?? fallbackColors[record.status] ?? "#64748B");
    const color = colors[0];
    const background = colors.length > 1
      ? `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%)`
      : color;
    const statusLines = records.map((record) => {
      const segmentLabel = record.isDaySegment
        ? `${record.segment === "SECOND_HALF" ? "Second" : "First"} half: `
        : "";
      const statusName = statusByCode.get(record.status)?.name ?? record.status;
      return `${segmentLabel}${record.status} · ${statusName}`;
    });
    const timingRecord = records.find((record) => record.checkInTime);
    const timeText = timingRecord?.checkInTime
      ? `\nPunch in: ${dayjs(timingRecord.checkInTime).format("hh:mm A")}${timingRecord.checkOutTime ? ` · Punch out: ${dayjs(timingRecord.checkOutTime).format("hh:mm A")}` : ""}`
      : "";

    return (
      <Tooltip arrow placement="top" title={<Box>{statusLines.map((line) => <Typography key={line} variant="caption" display="block" fontWeight={800}>{line}</Typography>)}<Typography variant="caption" display="block">{dayProps.day.format("DD MMMM YYYY")}{timeText}</Typography></Box>}>
        <PickersDay
          {...dayProps}
          sx={{
            bgcolor: color,
            background,
            color: "#fff",
            fontWeight: 800,
            border: "2px solid",
            borderColor: "background.paper",
            "&:hover, &:focus": { bgcolor: color, background, filter: "brightness(.9)" },
            "&.Mui-selected": { bgcolor: color, background, color: "#fff" },
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
          // This profile widget is a compact attendance calendar. Keep the
          // picker in day view so the header cannot leave it stuck in the
          // year-selection grid inside the narrow profile rail.
          views={["day"]}
          openTo="day"
          onMonthChange={(value) => setMonth(value.startOf("month"))}
          onChange={(value) => value && setMonth(value.startOf("month"))}
          readOnly
          slots={{ day: renderDay }}
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
            "& .MuiPickersCalendarHeader-root": { width: "100%", boxSizing: "border-box", px: 0, minHeight: 38, mb: 0.5 },
            "& .MuiDayCalendar-monthContainer": { width: "100%" },
            "& .MuiDayCalendar-weekContainer": { width: "100%", minWidth: 0 },
            button: { border: "none" },
            ".MuiDayCalendar-header, .MuiDayCalendar-weekContainer": { justifyContent: "space-between" },
            "& .MuiPickersCalendarHeader-labelContainer": { flex: "1 1 auto", minWidth: 0, overflow: "hidden" },
            "& .MuiPickersCalendarHeader-label": { fontSize: "0.9rem", lineHeight: 1.2, fontWeight: 800, whiteSpace: "nowrap" },
            "& .MuiPickersCalendarHeader-switchViewButton": { mx: 0.25, p: 0.5 },
            "& .MuiPickersArrowSwitcher-root": { gap: 0.25 },
            "& .MuiPickersArrowSwitcher-button": { p: 0.5 },
          }}
        />
      </LocalizationProvider>
      <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center" sx={{ mt: 0.5 }}>
        {holidays.size > 0 && <Tooltip title="Public holiday"><Box aria-label="Public holiday" sx={{ display: "grid", placeItems: "center", width: 28, height: 24, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16), color: "secondary.dark", fontSize: 10 }}><Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "currentColor" }} /></Box></Tooltip>}
        {visibleStatuses.length ? visibleStatuses.map((status) => <Chip key={status.code} size="small" label={status.code} title={status.name} sx={{ borderRadius: 1.5, fontWeight: 800, bgcolor: status.color, color: "#fff" }} />) : <Chip size="small" label="No attendance this month" variant="outlined" />}
      </Stack>
    </Card>
  );
}

export default LeaveCalendar;
