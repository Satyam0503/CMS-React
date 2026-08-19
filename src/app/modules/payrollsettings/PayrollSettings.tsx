import { Box, Card, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { usePageData } from "../../Context/PageDataProvider";
import { useIntl } from "react-intl";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { SearchInput } from "../../shared/components/SearchInput";
import { useAppSelector } from "../../Redux/hooks";
import { ModulesName, Permission } from "../../../utils/enums";
import { SalaryTable } from "./components/SalaryTable";
import { CompanySalaryResponseModel } from "./model";
import dayjs, { Dayjs } from "dayjs";
import { getCompanySalaries, processPayroll } from "./services";
import { AddUpdateEmployeeSalary } from "./components/AddUpdateEmployeeSalary";
import CustomisedDatePicker from "../../shared/components/C_DatePicker";
import CustomisedButton from "../../shared/components/C_Button";
import { ConfirmationModal } from "../../shared/components/ConfirmModal";
import { toast } from "react-toastify";
import { getAllEmployees } from "../employees/employeeServices";
import { getRequest, postRequest } from "../../../server/axios";
import { ResponseData } from "../../../utils/common_types";
import { CustomisedModal } from "../../shared/components/C_Modal";

type AttendanceMonthLockStatus = {
  payrollMonth: string;
  isLocked: boolean;
  eligibleEmployeeCount: number;
  lockedEmployeeCount: number;
};

type AttendanceLockBlockingIssue = {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  attendanceDate: string;
  exceptionType: string;
  currentAttendanceStatus?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  message: string;
};

type AttendanceMonthLockValidationResult = {
  blockingIssues: AttendanceLockBlockingIssue[];
};

export default function PayrollSettings() {
  const { setPageTitle } = usePageData();
  const { formatMessage: i } = useIntl();
  const [search, setSearch] = useState("");
  const [salaryData, setSalaryData] = useState<CompanySalaryResponseModel[]>(
    [],
  );
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<CompanySalaryResponseModel | null>(null);
  const [processMonth, setProcessMonth] = useState<Dayjs | null>(dayjs());
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [attendanceLocked, setAttendanceLocked] = useState(false);
  const [isCheckingLock, setIsCheckingLock] = useState(false);
  const [blockingIssues, setBlockingIssues] = useState<AttendanceLockBlockingIssue[]>([]);

  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasProcessPermission = hasModuleFeaturePermission(
    ModulesName.PayrollSettings,
    Permission.Create,
    userModulesPermissions,
  );

  const handleSearchChange = (value: string) => {
    setSearch(value.trim());
  };

  const handlePageRefresh = () => {
    setRefresh((prev) => !prev);
  };

  const handleRowClick = (row: CompanySalaryResponseModel) => {
    setSelectedEmployee(row);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleProcessMonthChange = (newValue: Dayjs | null) => {
    setProcessMonth(newValue);
  };

  useEffect(() => {
    setPageTitle(i({ id: "MODULES.PAYROLL_SETTINGS" }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAttendanceLocked(false);
    if (!processMonth) return;
    setIsCheckingLock(true);
    getRequest<AttendanceMonthLockStatus>(
      "api/attendance/penalty/month/lock-status",
      { params: { month: processMonth.format("YYYY-MM-01") } },
    )
      .then(({ data }) => {
        if (!cancelled) setAttendanceLocked(data.isLocked);
      })
      .catch(() => {
        if (!cancelled) setAttendanceLocked(false);
      })
      .finally(() => {
        if (!cancelled) setIsCheckingLock(false);
      });
    return () => { cancelled = true; };
  }, [processMonth]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getCompanySalaries({ employeeName: search });
        setSalaryData(data.methodResults ?? []);
      } catch (error) {
        try {
          const employeeResponse = await getAllEmployees({
            pageNo: 1,
            records: 10000,
            name: search,
            departmentId: [],
            gender: [],
          });
          setSalaryData(
            (employeeResponse.data.methodResults ?? []).map((employee) => ({
              userId: employee.userId,
              employeeId: employee.employeeId,
              employeeName: employee.fullName,
              jobTitle: employee.jobRole,
              activeSalary: null,
            })),
          );
        } catch (fallbackError) {
          setSalaryData([]);
          toast.error(i({ id: "ERROR.500" }));
          console.error((fallbackError as Error).message);
        }
        console.error((error as Error).message);
      }
    })();
  }, [search, refresh]);

  const handleProcessSalary = async () => {
    if (!processMonth) return;
    if (!attendanceLocked) {
      toast.info("Validate and lock attendance before processing salary.");
      return;
    }
    setConfirmOpen(false);
    setIsProcessing(true);
    try {
      const { data } = await processPayroll({
        payMonth: processMonth.format("YYYY-MM-DD"),
      });
      if (data.success) {
        toast.success(data.message);
        handlePageRefresh();
      } else {
        toast.error(data.message || i({ id: "ERROR.500" }));
      }
    } catch (error) {
      toast.error((error as any)?.response?.data?.message ?? i({ id: "ERROR.500" }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidateAndLock = async () => {
    if (!processMonth) return;
    const selectedMonth = processMonth.startOf("month");
    const currentMonth = dayjs().startOf("month");
    if (selectedMonth.isSame(currentMonth, "month")) {
      toast.info(
        `${processMonth.format("MMMM YYYY")} is still in progress. Lock attendance after ${processMonth.endOf("month").format("MMMM D")}.`,
        { autoClose: 5000 },
      );
      return;
    }
    if (selectedMonth.isAfter(currentMonth, "month")) {
      toast.info("A future payroll month cannot be locked.", { autoClose: 5000 });
      return;
    }
    setIsLocking(true);
    try {
      const { data } = await postRequest<{ payrollMonth: string }, ResponseData<AttendanceMonthLockValidationResult>>(
        "api/attendance/penalty/month/validate-lock",
        { payrollMonth: processMonth.format("YYYY-MM-01") },
      );
      if (data.success) {
        setAttendanceLocked(true);
        setBlockingIssues([]);
        toast.success(data.message);
      } else {
        setAttendanceLocked(false);
        setBlockingIssues(data.methodResult?.blockingIssues ?? []);
        toast.error(data.message || "Attendance validation failed.");
      }
    } catch (error) {
      setAttendanceLocked(false);
      toast.error((error as any)?.response?.data?.message ?? "Attendance validation or lock failed.");
    }
    finally { setIsLocking(false); }
  };

  const openAttendanceCell = (issue: AttendanceLockBlockingIssue) => {
    window.dispatchEvent(new CustomEvent("edit-attendance-exception", {
      detail: { employeeId: issue.employeeCode, date: issue.attendanceDate },
    }));
    setBlockingIssues([]);
  };

  return (
    <>
      <Card sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "0 12px 32px rgba(46, 38, 69, 0.08)" }}>
        <Box sx={{ display: "flex", flexWrap: { xs: "wrap", lg: "nowrap" }, gap: 1.5, alignItems: "end", mb: 2.5, p: { xs: 1.25, sm: 1.5 }, borderRadius: 2.5, bgcolor: "action.hover" }}>
          <Box sx={{ width: { xs: "100%", sm: "auto" }, minWidth: 0 }}>
            <SearchInput search={search} setSearch={handleSearchChange} />
          </Box>
          {hasProcessPermission && (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: "end", flexWrap: "wrap", justifyContent: { xs: "stretch", lg: "flex-end" }, "& > *": { flexGrow: { xs: 1, sm: 0 } } }}
            >
              <CustomisedDatePicker
                label={i({ id: "PAYROLL_SETTINGS.PROCESS_MONTH" })}
                views={["month", "year"]}
                value={processMonth}
                maxDate={dayjs()}
                setValue={handleProcessMonthChange}
              />
              <CustomisedButton
                label="Validate & Lock Attendance"
                handleClick={() => void handleValidateAndLock()}
                disabled={!processMonth}
                loading={isLocking}
                sx={{ minHeight: 40, whiteSpace: "nowrap" }}
              />
              <CustomisedButton
                label={i({ id: "PAYROLL_SETTINGS.PROCESS_SALARY" })}
                handleClick={() => setConfirmOpen(true)}
                disabled={!processMonth || !attendanceLocked || isCheckingLock || isLocking}
                loading={isProcessing}
                sx={{ minHeight: 40, whiteSpace: "nowrap" }}
              />
            </Stack>
          )}
        </Box>
        <SalaryTable salaryData={salaryData} handleRowClick={handleRowClick} />
      </Card>
      {isModalOpen && selectedEmployee && (
        <AddUpdateEmployeeSalary
          open={isModalOpen}
          userId={selectedEmployee.userId}
          employeeId={selectedEmployee.employeeId}
          employeeName={selectedEmployee.employeeName}
          existingSalary={selectedEmployee.activeSalary}
          handleClose={handleModalClose}
          handlePageRefresh={handlePageRefresh}
        />
      )}
      {confirmOpen && (
        <ConfirmationModal
          open={confirmOpen}
          title={i({ id: "PAYROLL_SETTINGS.CONFIRM_PROCESS_TITLE" })}
          content={i(
            { id: "PAYROLL_SETTINGS.CONFIRM_PROCESS_BODY" },
            { month: processMonth?.format("MMMM YYYY") ?? "" },
          )}
          handleClose={() => setConfirmOpen(false)}
          handleConfirmation={handleProcessSalary}
          ok_btn
        />
      )}
      <CustomisedModal
        open={blockingIssues.length > 0}
        handleClose={() => setBlockingIssues([])}
        title="Attendance validation failed"
        maxWidth="lg"
        allowMaximize
      >
        <Stack spacing={2}>
          <Typography>
            Attendance cannot be locked because {blockingIssues.length} blocking issue{blockingIssues.length === 1 ? "" : "s"} need to be resolved.
          </Typography>
          <Table size="small" stickyHeader aria-label="Blocking attendance issues">
            <TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Date</TableCell><TableCell>Issue</TableCell><TableCell>Status / timing</TableCell><TableCell>Action</TableCell></TableRow></TableHead>
            <TableBody>
              {blockingIssues.map((issue, index) => (
                <TableRow key={`${issue.employeeId}-${issue.attendanceDate}-${issue.exceptionType}-${index}`}>
                  <TableCell>{issue.employeeName}<br /><Typography variant="caption">{issue.employeeCode}</Typography></TableCell>
                  <TableCell>{dayjs(issue.attendanceDate).format("DD MMM YYYY")}</TableCell>
                  <TableCell>{issue.message}</TableCell>
                  <TableCell>{issue.currentAttendanceStatus ?? "—"}{issue.checkInTime ? ` | Punch in: ${dayjs(issue.checkInTime).format("HH:mm")}` : ""}{issue.checkOutTime ? ` | Punch out: ${dayjs(issue.checkOutTime).format("HH:mm")}` : ""}</TableCell>
                  <TableCell><CustomisedButton label="View" variant="outlined" handleClick={() => openAttendanceCell(issue)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </CustomisedModal>
    </>
  );
}
