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

import { CustomIconButton } from "../../shared/components/C_IconButton";
import { SearchInput } from "../../shared/components/SearchInput";
import { CustomisedTable } from "../../shared/components/C_Table";
import { AttendanceModel } from "../../../utils/common_types";
import { AttendanceCalendarGrid } from "./component/AttendanceCalendar";
import { getAllEmployees } from "../employees/employeeServices";

import { AppSelect } from "../../shared/components/ui";
import { getRequest, postRequest } from "../../../server/axios";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useAppSelector } from "../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission, Roles } from "../../../utils/enums";
import { useNavigate } from "react-router-dom";
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
  const userData = useAppSelector((state) => state.user.userData);
  // Administrators are authorized by the API independently of individual module grants.
  // Other roles must have the granular attendance permissions returned at sign-in.
  const isAdministrator = userData?.roleType === Roles.Administrator;
  const canViewAllAttendance = isAdministrator || hasModuleFeaturePermission(ModulesName.Attendance, Permission.ViewAll, userData?.modulePermission ?? []);
  const canManageAttendance = isAdministrator || hasModuleFeaturePermission(ModulesName.Attendance, Permission.CreateForEmployee, userData?.modulePermission ?? []) ||
    hasModuleFeaturePermission(ModulesName.Attendance, Permission.Override, userData?.modulePermission ?? []);

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
  const [correctionDate, setCorrectionDate] = React.useState("");
  const [correctionReason, setCorrectionReason] = React.useState("");
  const [correctionType, setCorrectionType] = React.useState("Incorrect status");
  const navigate = useNavigate();
  const [submittingCorrection, setSubmittingCorrection] = React.useState(false);
  const [correctionRequests, setCorrectionRequests] = React.useState<any[]>([]);
  const debouncedSearch = useDebounce(searchValue, 500);

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

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleChange = (event: any) => {
    setSelectedDay(event.target.value);
  };

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
      {canViewAllAttendance && <Grid
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
      </Grid>}

      {/* ----------- Attendance Section ----------- */}
      <Grid size={{ xs: 12 }}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {intl.formatMessage({ id: "MODULES.ATTENDANCE" })}
          </Typography>
          {(canViewAllAttendance || canManageAttendance) && <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap-reverse"
            gap={2}
          >
            {canViewAllAttendance ? (
              <SearchInput search={searchValue} setSearch={handleSearchChange} />
            ) : (
              <Typography color="text.secondary">You can manage attendance for yourself or assigned employees.</Typography>
            )}
          </Stack>}

          <Box sx={{ mb: 3 }}>
            <AttendanceCalendarGrid
              employees={employeesForCalendar}
              searchValue={debouncedSearch}
              onStatsChange={setAttendanceStats}
              selectedDay={selectedDay}
              companyView={canViewAllAttendance}
              readOnly={!canManageAttendance}
            />
          </Box>
        </Card>
      </Grid>

      {!canViewAllAttendance && <Grid size={{ xs: 12 }}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Report incorrect attendance</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This does not change your attendance. HR/Admin will review your request.
          </Typography>
          <Stack spacing={2} sx={{ maxWidth: 640 }}>
            <TextField label="Attendance date" type="date" value={correctionDate} onChange={(e) => setCorrectionDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ max: new Date().toISOString().slice(0, 10) }} />
            <TextField select label="Issue type" value={correctionType} onChange={(e) => setCorrectionType(e.target.value)}>
              <MenuItem value="Incorrect status">Incorrect status</MenuItem>
              <MenuItem value="Missing check-in">Missing check-in</MenuItem>
              <MenuItem value="Missing check-out">Missing check-out</MenuItem>
              <MenuItem value="Incorrect working hours">Incorrect working hours</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField label="Describe the correction needed" placeholder="For example: I checked in at 9:15 AM, but the status shows absent." value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} multiline minRows={4} helperText={`${correctionReason.length}/1000 characters`} inputProps={{ maxLength: 1000 }} />
            <Button variant="contained" size="large" onClick={submitCorrection} disabled={submittingCorrection}>{submittingCorrection ? "Sending request..." : "Send correction request to HR"}</Button>
          </Stack>
          {correctionRequests.length > 0 && (
            <Box sx={{ mt: 3, maxWidth: 640 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>My correction requests</Typography>
              <Stack spacing={1}>
                {correctionRequests.map((request) => (
                  <Box key={request.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {new Date(request.attendanceDate).toLocaleDateString()} — {request.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{request.reason}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Card>
      </Grid>}
    </Grid>
  );
};

export default EmployeeAttendance;
