import { Card, Chip } from "@mui/material";
import {
  LocalizationProvider,
  DateCalendar,
  PickersDay,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { getMyLeaveRequest } from "../../leaves/leaveServices";
import {
  GetLeaveRequestPayLoad,
  MyLeaveRequestModel,
} from "../../leaves/model";
import { useParams } from "react-router-dom";
import { LEAVE_REQUEST_STATUS } from "../../../../utils/enums";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"; // ES 2015
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"; // ES 2015
import { useIntl } from "react-intl";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

function LeaveCalendar() {
  const [year, setYear] = useState(dayjs().year());
  const [leaveRequest, setLeaveRequest] = useState<MyLeaveRequestModel[]>([]);
  const empId = useParams().employeeid;

  const { formatMessage: i } = useIntl();

  const checkLeaveDay = (day: Dayjs) => {
    if (!leaveRequest.length) return false;
    day = day.startOf("day");
    return leaveRequest.some(
      (l) =>
        day.isSameOrAfter(dayjs(l.startDate)) &&
        day.isSameOrBefore(dayjs(l.endDate))
    );
  };
  useEffect(() => {
    const fetchLeaveRequest = async () => {
      const payload: GetLeaveRequestPayLoad = {
        pageNo: null,
        pageSize: null,
        employeeId: empId,
        startDate: dayjs().startOf("year").set("year", year),
        endDate: dayjs().endOf("year").set("year", year),
        status: LEAVE_REQUEST_STATUS.APPROVED,
      };
      try {
        const { data } = await getMyLeaveRequest(payload);
        if (data.success) {
          setLeaveRequest(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    };
    fetchLeaveRequest();
  }, [year, empId]);

  return (
    <Card sx={{ height: 1, px: 2, pb: 2, borderRadius: 3, border: 1, borderColor: "divider", boxShadow: "0 10px 28px rgba(0,0,0,.07)", overflow: "hidden" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          onMonthChange={(newDate) => {
            const selectedYear = dayjs(newDate).year();
            if (year !== selectedYear) setYear(selectedYear);
          }}
          readOnly
          sx={{
            width: "auto",
            button: { border: "none" },
            ".MuiDayCalendar-header": {
              justifyContent: "space-between",
            },
            ".MuiDayCalendar-weekContainer": {
              justifyContent: "space-between",
            },
            "MuiButtonBase-root-MuiPickersDay-root": {
              aspectRatio: "1",
            },
          }}
          slotProps={{
            calendarHeader: {
              sx: {
                paddingInline: 0,
              },
            },
          }}
          slots={{
            day: (day) => {
              const isSelected = checkLeaveDay(day.day);
              return (
                <PickersDay
                  {...day}
                  sx={{
                    ...(isSelected && {
                      backgroundColor: "primary.main",
                      color: "white",
                    }),
                  }}
                />
              );
            },
          }}
        />
      </LocalizationProvider>
      <Chip label={i({ id: "LEAVE.TITLE" })} sx={{ borderRadius: 2, px: .5, fontWeight: 600, bgcolor: "primary.lighter", color: "primary.dark" }} />
    </Card>
  );
}

export default LeaveCalendar;
