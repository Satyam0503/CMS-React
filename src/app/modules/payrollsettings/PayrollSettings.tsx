import {
  Box,
  Card,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from "@mui/material";
import { LockOutlined, LockOpenOutlined, CloudUploadRounded, PaymentsOutlined, DownloadRounded } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageData } from "../../Context/PageDataProvider";
import { useIntl } from "react-intl";
import { canAccessHrManagement, hasModuleFeaturePermission } from "../../../utils/common";
import { SearchInput } from "../../shared/components/SearchInput";
import { useAppSelector } from "../../Redux/hooks";
import { UnauthorizedStay } from "../users/about/components/ProtectedRoute";
import { ModulesName, Permission, Roles } from "../../../utils/enums";
import { SalaryTable } from "./components/SalaryTable";
import { CompanySalaryResponseModel } from "./model";
import dayjs, { Dayjs } from "dayjs";
import { getCompanySalaries, processPayroll } from "./services";
import { AddUpdateEmployeeSalary } from "./components/AddUpdateEmployeeSalary";
import { EmployeeSalaryImportPanel } from "./components/EmployeeSalaryImportPanel";
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
import { AppAlert, AppButton } from "../../shared/components/ui";
import { downloadPayrollBulkSampleTemplate } from "./components/salaryImportMapping";
import { useIsDark } from "../theme/useIsDark";

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
  const isDark = useIsDark();
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

  const [activeTab, setActiveTab] = useState<"salaries" | "import">("salaries");
  const [pendingSalaryApprovalCount, setPendingSalaryApprovalCount] = useState<number | null>(null);

  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const userRoleType = useAppSelector((state) => state.user.userData?.roleType);
  const isAdministrator = userRoleType === Roles.Administrator;
  const canEdit = isAdministrator || hasModuleFeaturePermission(
    ModulesName.PayrollSettings,
    Permission.Edit,
    userModulesPermissions,
  );
  const canApprove = isAdministrator || hasModuleFeaturePermission(
    ModulesName.PayrollSettings,
    Permission.Approve,
    userModulesPermissions,
  );
  const hasProcessPermission = isAdministrator || hasModuleFeaturePermission(
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
    if (!canAccessHrManagement(userRoleType) || !processMonth) {
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
    if (!canAccessHrManagement(userRoleType)) return;
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
          const joiningByUserId = new Map(
            (employeeResponse.data.methodResults ?? []).map((employee) => [
              employee.userId,
              employee.dateOfJoining,
            ]),
          );
          setSalaryData(
            salaries.map((salary) => ({
              ...salary,
              dateOfJoining: salary.dateOfJoining || joiningByUserId.get(salary.userId) || null,
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
              dateOfJoining: employee.dateOfJoining || null,
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
    Boolean(!processMonth?.startOf("month").isAfter(dayjs().startOf("month"))) &&
    !isProcessing &&
    !isLoadingPolicy &&
    !policyLoadError &&
    !isCheckingLock &&
    !isLocking &&
    (attendanceLocked || !policyConfig.requireAttendanceLock);

  if (!canAccessHrManagement(userRoleType)) {
    return <UnauthorizedStay />;
  }

  return (
    <>

      <Card
        sx={{
          minWidth: 0,
          width: "100%",
          p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
          borderRadius: 3,
          bgcolor: "var(--mui-palette-background-card, var(--mui-palette-background-paper))",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 30px 0 rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: { xs: "100%", sm: "fit-content" },
            p: "4px",
            borderRadius: "10px",
            bgcolor: "var(--mui-palette-background-box, action.hover)",
            border: "1px solid",
            borderColor: "divider",
            mb: 2.5,
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 38,
              "& .MuiTabs-indicator": { display: "none" },
              "& .MuiTabs-flexContainer": { gap: 0.5 },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 650,
                fontSize: "0.835rem",
                minHeight: 36,
                py: 0.65,
                px: { xs: 1.5, sm: 2 },
                borderRadius: "8px",
                color: "text.secondary",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
                "&.Mui-selected": {
                  bgcolor: isDark ? "rgba(15, 23, 42, 0.98)" : "#FFFFFF",
                  color: isDark ? "#F8FAFC" : "text.primary",
                  boxShadow: isDark
                    ? "0 2px 8px rgba(0, 0, 0, 0.4)"
                    : "0 1px 4px rgba(15, 23, 42, 0.08)",
                  border: "1px solid",
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(226, 232, 240, 0.9)",
                },
                "&:hover:not(.Mui-selected)": {
                  color: "text.primary",
                  bgcolor: isDark
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(255, 255, 255, 0.5)",
                },
              },
            }}
          >
            <Tab
              value="salaries"
              icon={<PaymentsOutlined sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label="Active Salaries & Register"
            />
            <Tab
              value="import"
              icon={<CloudUploadRounded sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>Import &amp; Salary Approvals</span>
                  {pendingSalaryApprovalCount !== null && pendingSalaryApprovalCount > 0 && (
                    <Box
                      component="span"
                      sx={{
                        px: 0.85,
                        py: 0.15,
                        borderRadius: "999px",
                        bgcolor: isDark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7",
                        color: isDark ? "#FDE68A" : "#92400E",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        border: "1px solid",
                        borderColor: isDark ? "rgba(245, 158, 11, 0.4)" : "#FDE68A",
                        lineHeight: 1.4,
                      }}
                    >
                      {pendingSalaryApprovalCount} pending
                    </Box>
                  )}
                </Stack>
              }
            />
          </Tabs>
        </Box>

        {activeTab === "salaries" ? (
          <>
            {/* Minimal & Classy Actions Toolbar */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                mb: 2.5,
                p: { xs: 1.5, sm: 1.75 },
                borderRadius: "14px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(248, 250, 252, 0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: isDark
                  ? "0 4px 20px rgba(0, 0, 0, 0.25)"
                  : "0 2px 10px rgba(0, 0, 0, 0.03)",
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  bgcolor: "background.paper",
                  borderRadius: "10px",
                },
              }}
            >
              {/* Row 1: Period Selection, Search & Template Utility */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{ width: "100%" }}
              >
                {hasProcessPermission && (
                  <Box
                    sx={{
                      width: { xs: "100%", sm: 190, md: 210 },
                      flexShrink: 0,
                    }}
                  >
                    <CustomisedDatePicker
                      label={i({ id: "PAYROLL_SETTINGS.PROCESS_MONTH" })}
                      views={["month", "year"]}
                      value={processMonth}
                      maxDate={dayjs()}
                      setValue={handleProcessMonthChange}
                    />
                  </Box>
                )}

                <Box
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    flex: 1,
                    minWidth: { sm: 160 },
                  }}
                >
                  <SearchInput
                    fullWidth
                    search={search}
                    setSearch={handleSearchChange}
                    sx={{ width: "100%", maxWidth: "none" }}
                  />
                </Box>

                <AppButton
                  variant="outlined"
                  startIcon={<DownloadRounded fontSize="small" />}
                  onClick={() => downloadPayrollBulkSampleTemplate(salaryData)}
                  sx={{
                    height: 40,
                    px: 1.75,
                    fontWeight: 650,
                    fontSize: "0.82rem",
                    borderRadius: "10px",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    color: "text.primary",
                    width: { xs: "100%", sm: "auto" },
                    flexShrink: 0,
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                      color: "primary.main",
                    },
                  }}
                >
                  Template
                </AppButton>
              </Stack>

              {/* Row 2: Attendance Status & Primary Processing Pipeline */}
              {hasProcessPermission && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.25,
                    width: "100%",
                    pt: 1.25,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 650,
                      display: { xs: "none", sm: "inline-flex" },
                      alignItems: "center",
                      gap: 0.75,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: attendanceLocked ? "success.main" : "warning.main",
                        display: "inline-block",
                      }}
                    />
                    {salaryData.length} Employee{salaryData.length === 1 ? "" : "s"} in register
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      ml: { sm: "auto" },
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
                          ? "Checking..."
                          : attendanceLocked
                            ? "Attendance Locked"
                            : !policyConfig.requireAttendanceLock
                              ? "Lock Optional"
                              : "Attendance Unlocked"
                      }
                      sx={{
                        height: 40,
                        px: 1.25,
                        borderRadius: "10px",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                        borderWidth: attendanceLocked ? 0 : 1,
                        bgcolor: attendanceLocked ? undefined : "background.paper",
                        width: { xs: "100%", sm: "auto" },
                        justifyContent: "center",
                        "& .MuiChip-icon": { fontSize: 18 },
                      }}
                    />

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      <AppButton
                        variant="outlined"
                        startIcon={<LockOutlined fontSize="small" />}
                        onClick={() => void handleValidateAndLock()}
                        disabled={!processMonth || isLocking}
                        sx={{
                          flex: { xs: 1, sm: "initial" },
                          height: 40,
                          px: 1.75,
                          fontWeight: 650,
                          fontSize: "0.82rem",
                          borderRadius: "10px",
                          textTransform: "none",
                          whiteSpace: "nowrap",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          color: "text.primary",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "action.hover",
                            color: "primary.main",
                          },
                        }}
                      >
                        {isLocking ? "Validating..." : "Validate & Lock"}
                      </AppButton>

                      <AppButton
                        variant="contained"
                        color="primary"
                        startIcon={<PaymentsOutlined fontSize="small" />}
                        onClick={() => setConfirmOpen(true)}
                        disabled={!canRunDraftGeneration || isProcessing}
                        sx={{
                          flex: { xs: 1, sm: "initial" },
                          height: 40,
                          px: 2,
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          borderRadius: "10px",
                          textTransform: "none",
                          whiteSpace: "nowrap",
                          boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}40`,
                        }}
                      >
                        {isProcessing ? "Processing..." : i({ id: "PAYROLL_SETTINGS.PROCESS_SALARY" })}
                      </AppButton>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Box>

            {policyLoadError && <AppAlert severity="error" sx={{ mb: 2 }}>Payroll configuration could not be loaded. Refresh this page before generating payroll.</AppAlert>}
            <PayrollProcessingIssues failure={processingFailure} onDismiss={() => setProcessingFailure(null)}
              onPolicy={() => navigate("/admin/companydetails/payroll-configuration")}
              onAttendance={() => navigate("/attendance")} />
            <SalaryTable salaryData={salaryData} handleRowClick={handleRowClick} />
          </>
        ) : (
          <Box sx={{ py: 1 }}>
            <EmployeeSalaryImportPanel
              canEdit={canEdit}
              canApprove={canApprove}
              onPendingCountChange={setPendingSalaryApprovalCount}
              onSalaryApproved={handlePageRefresh}
            />
          </Box>
        )}
      </Card>
      {isModalOpen && selectedEmployee && (
        <AddUpdateEmployeeSalary
          open={isModalOpen}
          userId={selectedEmployee.userId}
          employeeId={selectedEmployee.employeeId}
          employeeName={selectedEmployee.employeeName}
          existingSalary={selectedEmployee.activeSalary}
          defaultEffectiveFrom={
            selectedEmployee.activeSalary?.effectiveFrom
              ? dayjs(selectedEmployee.activeSalary.effectiveFrom).format("YYYY-MM-DD")
              : (selectedEmployee.dateOfJoining || processMonth?.startOf("month").format("YYYY-MM-DD"))
          }
          canApprove={canApprove}
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
