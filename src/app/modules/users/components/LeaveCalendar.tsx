import { Card, Chip } from "@mui/material";
import {
  LocalizationProvider,
  DateCalendar,
  PickersDay,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";
import { initialLeaveRequestFilter } from "../../leaves/components/LeaveRequestFilter";
import { getMyLeaveRequest } from "../../leaves/leaveServices";
import {
  GetLeaveRequestPayLoad,
  MyLeaveRequestModel,
} from "../../leaves/model";
import { useParams } from "react-router-dom";
import { LEAVE_REQUEST_STATUS } from "../../../../utils/enums";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"; // ES 2015
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"; // ES 2015

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

function LeaveCalendar() {
  const [year, setYear] = useState(dayjs().year());
  const [leaveRequest, setLeaveRequest] = useState<MyLeaveRequestModel[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const empId = useParams().employeeid;

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
    setLoading(true);
    const fetchLeaveRequest = async () => {
      const payload: GetLeaveRequestPayLoad = {
        ...initialLeaveRequestFilter,
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
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequest();
  }, [year]);

  return (
    <Card sx={{ height: 1, paddingInline: "16px", paddingBlockEnd: "16px" }}>
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
            // paddingLeft: "24px",
            // ".MuiDayCalendar-root": { paddingInline: "24px" },
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
              console.log(day);

              const isSelected = checkLeaveDay(day.day);

              return (
                <PickersDay
                  {...day}
                  sx={{
                    // pointerEvents: "none",
                    ...(isSelected && {
                      backgroundColor: "#9a56d3",
                      color: "white",
                    }),
                  }}
                />
              );
            },
          }}
        />
      </LocalizationProvider>
      <Chip label="Leave" sx={{ borderRadius: "16px" }} />
    </Card>
  );
}

export default LeaveCalendar;
