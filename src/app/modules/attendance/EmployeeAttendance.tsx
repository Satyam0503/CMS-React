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
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add,
  Download,
  EventAvailable,
  EventBusy,
  FilterList,
  SupervisorAccount,
  TimerOffOutlined,
} from "@mui/icons-material";

import {
  AttendanceMangementTableColumnList,
  Days,
} from "../../../utils/constant/Constant";

import { CustomIconButton } from "../../shared/components/CustomIconButton";
import { SearchInput } from "../../shared/components/SearchInput";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import { AttendanceModel } from "../../../utils/common_types";
import { AttendanceCalendarGrid } from "./component/AttendanceCalendar";
import { getAllEmployees } from "../employees/employeeServices";

import { AppSelect } from "../../shared/components/ui";
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
  const theme = useTheme();

  const [selectedDay, setSelectedDay] = React.useState("today");
  const [AttendanceList, setAttendanceList] = React.useState<AttendanceModel[]>(
    [],
  );
  const [Employee, setEmployee] = React.useState<any[]>([]);
  const [rowPerPage] = React.useState<number>(10);
  const [isLoading, setLoading] = React.useState(false);
  const [page] = React.useState(0);
  const [searchValue, setSearchValue] = React.useState("");
  const [attendanceStats, setAttendanceStats] = React.useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
  });
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    const fetchEmployees = async () => {
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
  }, [debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleChange = (event: any) => {
    setSelectedDay(event.target.value);
  };

  const employeesForCalendar = React.useMemo(() => {
    return Employee.map((emp) => ({
      id: emp.userId,
      userId: emp.userId,
      employeeId: emp.employeeId,
      name: emp.fullName,
      fullName: emp.fullName,
    }));
  }, [Employee]);

  return (
    <Grid container spacing={2}>
      {/* ----------- Stats Cards ----------- */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
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

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <IconStat
                iconBg={alpha(theme.palette.success.main, 0.18)}
                icon={<TimerOffOutlined fontSize="large" />}
                iconColor="success.light"
                number={attendanceStats.late}
                title="Late"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
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

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <IconStat
                iconBg={theme.palette.primary.lighter}
                icon={<SupervisorAccount fontSize="large" />}
                iconColor="primary.main"
                number={attendanceStats.total}
                title="Total"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ----------- Filter ----------- */}
      <Grid
        size={{ xs: 12 }}
        sx={{ display: "flex", justifyContent: "flex-end" }}
      >
        <AppSelect
          name="days"
          value={selectedDay}
          onChange={handleChange}
          sx={{ minWidth: 130, bgcolor: "background.paper" }}
        >
          {Days.map((item) => (
            <MenuItem key={item.id} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </AppSelect>
      </Grid>

      {/* ----------- Attendance Section ----------- */}
      <Grid size={{ xs: 12 }}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {intl.formatMessage({ id: "MODULES.ATTENDANCE" })}
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap-reverse"
            gap={2}
          >
            <SearchInput search={searchValue} setSearch={handleSearchChange} />

            {/* <Stack direction="row" spacing={1}>
              <CustomIconButton tooltip="Filter List" icon={<FilterList />} />
              <CustomIconButton tooltip="Add Attendance" icon={<Add />} />
              <CustomIconButton tooltip="Import Excel" icon={<Download />} />
            </Stack> */}
          </Stack>

          <Box sx={{ mb: 3 }}>
            <AttendanceCalendarGrid
              employees={employeesForCalendar}
              searchValue={debouncedSearch}
              onStatsChange={setAttendanceStats}
              selectedDay={selectedDay}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default EmployeeAttendance;
