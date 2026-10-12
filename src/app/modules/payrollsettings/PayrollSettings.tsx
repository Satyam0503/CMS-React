import {
  Box,
  Card,
  Chip,
  Stack,
} from "@mui/material";
import { LockOutlined, LockOpenOutlined } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { PayrollDivisorPolicyConfig } from "./components/PayrollPolicyConfigCard";
import {
  AttendanceLockBlockingModal,
  AttendanceLockBlockingIssue,
} from "./components/AttendanceLockBlockingModal";
import { PayrollProcessingIssues, payrollProcessingFailure, type PayrollProcessingFailure } from "./components/PayrollProcessingIssues";
import { AppAlert } from "../../shared/components/ui";
import { downloadPayrollBulkSampleTemplate } from "./components/salaryImportMapping";

type AttendanceMonthLockStatus = {
  payrollMonth: string;
  isLocked: boolean;
  eligibleEmployeeCount: number;
  lockedEmployeeCount: number;
};

type AttendanceMonthLockValidationResult = {
  blockingIssues: AttendanceLockBlockingIssue[];
};

export default function PayrollSettings() {
  const { setPageTitle } = usePageData();
  const { formatMessage: i } = useIntl();
  const navigate = useNavigate();
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
  const [processingFailure, setProcessingFailure] = useState<PayrollProcessingFailure | null>(null);
  const [policyLoadError, setPolicyLoadError] = useState(false);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);
  const [policyConfig, setPolicyConfig] = useState<PayrollDivisorPolicyConfig>({
    payrollMode: "Standard",
    divisorPolicy: "CALENDAR_DAYS",
    lopCalculationBase: "FIXED_GROSS",
    epfMode: "CAPPED_CEILING",
    epfWageCeiling: 15000,
    esicMode: "STATUTORY",
    tdsMode: "AUTO_NEW_REGIME",
    requireAttendanceLock: true,
    effectiveFrom: dayjs().startOf("month").format("YYYY-MM-01"),
    isActive: true,
    version: 1,
  });

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
    setProcessingFailure(null);
    setBlockingIssues([]);
  };

  useEffect(() => {
    setPageTitle(i({ id: "MODULES.PAYROLL_SETTINGS" }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAttendanceLocked(false);
    setPolicyLoadError(false);
    if (!processMonth) {
      setIsCheckingLock(false);
      setIsLoadingPolicy(false);
      return;
    }
    const monthKey = processMonth.format("YYYY-MM-01");
    setIsCheckingLock(true);
    getRequest<AttendanceMonthLockStatus>(
      "api/attendance/penalty/month/lock-status",
      { params: { month: monthKey } },
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

    setIsLoadingPolicy(true);
    getRequest<PayrollDivisorPolicyConfig>(
      "api/payroll/divisor-policy",
      { params: { month: monthKey } },
    )
      .then(({ data }) => {
        if (!cancelled && data) {
          setPolicyConfig({
            id: data.id,
            payrollMode: data.payrollMode || "Standard",
            divisorPolicy: data.divisorPolicy || "CALENDAR_DAYS",
            lopCalculationBase: data.lopCalculationBase || "FIXED_GROSS",
            epfMode: data.epfMode || "CAPPED_CEILING",
            epfWageCeiling: data.epfWageCeiling || 15000,
            esicMode: data.esicMode || "STATUTORY",
            tdsMode: data.tdsMode || "AUTO_NEW_REGIME",
            requireAttendanceLock: data.requireAttendanceLock ?? true,
            effectiveFrom: data.effectiveFrom || monthKey,
            isActive: data.isActive ?? true,
            version: data.version ?? 1,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setPolicyLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPolicy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [processMonth]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getCompanySalaries({ employeeName: search });
        const salaries = data.methodResults ?? [];
        try {
          const employeeResponse = await getAllEmployees({
            pageNo: 1,
            records: 10000,
            name: search,
            departmentId: [],
            gender: [],
          });
          const lifecycleByUserId = new Map(
            (employeeResponse.data.methodResults ?? []).map((employee) => [
              employee.userId,
              employee.payrollStatus ?? "Active",
            ]),
          );
          setSalaryData(
            salaries.map((salary) => ({
              ...salary,
              lifecyclePayrollStatus: lifecycleByUserId.get(salary.userId) ?? "Active",
            })),
          );
        } catch {
          setSalaryData(salaries);
        }
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
    if (!processMonth || isProcessing) return;
    setConfirmOpen(false);
    setProcessingFailure(null);
    setIsProcessing(true);
    try {
      const { data } = await processPayroll({
        payMonth: processMonth.startOf("month").format("YYYY-MM-DD"),
      });
      if (data.success) {
        toast.success(data.message);
        handlePageRefresh();
      } else {
        setProcessingFailure(payrollProcessingFailure(data));
        toast.error("Payroll could not be generated. Review the issues below.");
      }
    } catch (error) {
      const response = (error as { response?: { data?: ApiResponse } })?.response?.data;
      setProcessingFailure(payrollProcessingFailure(response ?? { message: i({ id: "ERROR.500" }) }));
      toast.error("Payroll could not be generated. Review the issues below.");
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
    } finally {
      setIsLocking(false);
    }
  };

  const openAttendanceCell = (issue: AttendanceLockBlockingIssue) => {
    setBlockingIssues([]);
    navigate("/attendance", {
      state: {
        focusEmployeeCode: issue.employeeCode,
        focusEmployeeName: issue.employeeName,
        focusDate: issue.attendanceDate,
      },
    });
  };

  const canRunDraftGeneration =
    Boolean(processMonth) &&
    Boolean(processMonth?.startOf("month").isBefore(dayjs().startOf("month"))) &&
    !isProcessing &&
    !isLoadingPolicy &&
    !policyLoadError &&
    !isCheckingLock &&
    !isLocking &&
    (attendanceLocked || !policyConfig.requireAttendanceLock);

  return (
    <>

      <Card
        sx={(theme) => ({
          minWidth: 0,
          width: "100%",
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 4,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(15, 23, 42, 0.72) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.78) 100%)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid",
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(148, 163, 184, 0.18)"
              : "rgba(255, 255, 255, 0.88)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 16px 36px -6px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)"
              : "0 14px 34px -6px rgba(15, 23, 42, 0.05), 0 4px 12px -2px rgba(15, 23, 42, 0.025), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
        })}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
          spacing={1.5}
          useFlexGap
          sx={(theme) => ({
            mb: 2.5,
            p: { xs: 1.25, sm: 1.5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(30, 41, 59, 0.45)"
                : "rgba(241, 245, 249, 0.65)",
            backdropFilter: "blur(12px)",
          })}
        >
          <Box sx={{ width: { xs: "100%", lg: 280 }, flexShrink: 0, minWidth: 0 }}>
            <SearchInput search={search} setSearch={handleSearchChange} sx={{ width: "100%" }} />
          </Box>
          {hasProcessPermission && (
            <Stack
              direction="row"
              spacing={1.25}
              useFlexGap
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: { xs: "stretch", lg: "flex-end" },
              }}
            >
              <Chip
                size="small"
                icon={attendanceLocked ? <LockOutlined fontSize="small" /> : <LockOpenOutlined fontSize="small" />}
                color={
                  attendanceLocked
                    ? "success"
                    : !policyConfig.requireAttendanceLock
                      ? "info"
                      : "warning"
                }
                variant={attendanceLocked ? "filled" : "outlined"}
                label={
                  isCheckingLock
                    ? "Checking Lock..."
                    : attendanceLocked
                      ? "Attendance Locked"
                      : !policyConfig.requireAttendanceLock
                        ? "Lock Optional"
                        : "Attendance Unlocked"
                }
                sx={{
                  height: 38,
                  px: 1,
                  borderRadius: 999,
                  fontWeight: 600,
                }}
              />
              <Box sx={{ width: { xs: "100%", sm: 195 }, flexShrink: 0 }}>
                <CustomisedDatePicker
                  label={i({ id: "PAYROLL_SETTINGS.PROCESS_MONTH" })}
                  views={["month", "year"]}
                  value={processMonth}
                  maxDate={dayjs()}
                  setValue={handleProcessMonthChange}
                />
              </Box>
              <CustomisedButton
                label="Sample Template"
                variant="outlined"
                handleClick={() => downloadPayrollBulkSampleTemplate(salaryData)}
                sx={{ height: 40, borderRadius: 2.5, whiteSpace: "nowrap" }}
              />
              <CustomisedButton
                label="Validate & Lock Attendance"
                variant="outlined"
                handleClick={() => void handleValidateAndLock()}
                disabled={!processMonth}
                loading={isLocking}
                sx={{ height: 40, borderRadius: 2.5, whiteSpace: "nowrap" }}
              />
              <CustomisedButton
                label={i({ id: "PAYROLL_SETTINGS.PROCESS_SALARY" })}
                handleClick={() => setConfirmOpen(true)}
                disabled={!canRunDraftGeneration}
                loading={isProcessing}
                sx={{ height: 40, borderRadius: 2.5, whiteSpace: "nowrap" }}
              />
            </Stack>
          )}
        </Stack>
        {policyLoadError && <AppAlert severity="error" sx={{ mb: 2 }}>Payroll configuration could not be loaded. Refresh this page before generating payroll.</AppAlert>}
        <PayrollProcessingIssues failure={processingFailure} onDismiss={() => setProcessingFailure(null)}
          onPolicy={() => navigate("/admin/companydetails/payroll-configuration")}
          onAttendance={() => navigate("/attendance")} />
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
      <AttendanceLockBlockingModal
        blockingIssues={blockingIssues}
        onClose={() => setBlockingIssues([])}
        onResolveIssue={openAttendanceCell}
      />
    </>
  );
}
