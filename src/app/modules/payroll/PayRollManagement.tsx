import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  Select,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { usePageData } from "../../Context/PageDataProvider";
import { PayRollTable } from "./components/PayRollTable";
import { PayRollResponseModel } from "./models";
import { SearchInput } from "../../shared/components/SearchInput";
import dayjs, { Dayjs } from "dayjs";
import {
  getEmployeePayRollData,
  generateMonthlyPayroll,
  approvePayrollMonth,
  processPayrollMonth,
  recordPayrollPayment,
  closePayrollMonth,
} from "./services";
import CustomisedDatePicker from "../../shared/components/C_DatePicker";
import { UploadPayRollData } from "./components/UploadPayRollData";
import Add from "@mui/icons-material/Add";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import CalculateOutlined from "@mui/icons-material/CalculateOutlined";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Close from "@mui/icons-material/Close";
import FilterList from "@mui/icons-material/FilterList";
import Lock from "@mui/icons-material/Lock";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Refresh from "@mui/icons-material/Refresh";
import { AddUpdateEmployeePayRoll } from "./AddUpdateEmployeePayRoll";

import { useAppSelector } from "../../Redux/hooks";
import { canAccessHrManagement, hasModuleFeaturePermission } from "../../../utils/common";
import { UnauthorizedStay } from "../users/about/components/ProtectedRoute";
import { ModulesName, Permission } from "../../../utils/enums";
import { payrollActionButtonSx } from "./components/payrollActionButtonSx";
import { ProcessPayrollModal } from "./components/ProcessPayrollModal";
import { RecordPayrollPaymentModal, PaymentForm } from "./components/RecordPayrollPaymentModal";
import { PayrollAuditHistoryModal } from "./components/PayrollAuditHistoryModal";
import { initialPayRollValues } from "./payrollDefaults";
import { ConfirmationModal } from "../../shared/components/ConfirmModal";
import { toast } from "react-toastify";
import { AppButton } from "../../shared/components/ui";
import { useIsDark } from "../theme/useIsDark";

const PayRollManagement = () => {
    const isDark = useIsDark();
    const { setPageTitle } = usePageData();
    const { formatMessage: i } = useIntl();
    const [search, setSearch] = useState<string>("");
    const [payMonth, setPayMonth] = useState<Dayjs | null>(dayjs().subtract(1, "month").startOf("day"));
    const [payRollData, setPayRollData] = useState<PayRollResponseModel[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<typeof initialPayRollValues>(initialPayRollValues);
    const [refresh, setRefresh] = useState<boolean>(false);
    const userModulePermissions = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
    const currentUser = useAppSelector(state => state.user.userData);
    const hasCreatePermission = hasModuleFeaturePermission(ModulesName.PayRoll, Permission.Create, userModulePermissions);
    const hasEditPermission = hasModuleFeaturePermission(ModulesName.PayRoll, Permission.Edit, userModulePermissions);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [paymentRow, setPaymentRow] = useState<PayRollResponseModel | null>(null);
    const [isRecordingPayment, setIsRecordingPayment] = useState(false);
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
    const [isClosingMonth, setIsClosingMonth] = useState(false);
    const [auditRow, setAuditRow] = useState<PayRollResponseModel | null>(null);

    const payrollRows = payRollData.filter(row => Boolean(row.payData?.payRollId));
    const uncalculatedRows = payRollData.filter(row => !row.payData?.payRollId);
    const processableRows = payrollRows.filter(row => !row.payData?.isProcessed);
    const hasUnprocessedEmployees = payRollData.some(row => !row.payData?.payRollId || !row.payData?.isProcessed);
    const isMonthProcessed = payRollData.length > 0 && !hasUnprocessedEmployees;
    const needsApproval = payrollRows.some(row => (row.payData?.approvalStatus ?? "").toUpperCase() === "PENDING");
    const allPaymentsRecorded = payrollRows.length > 0 && payrollRows.every(row => ["PAID", "CLOSED"].includes((row.payData?.paymentStatus ?? "PENDING").toUpperCase()));
    const workflowStatus = (row: PayRollResponseModel) => (row.payData?.workflowStatus ?? row.payData?.paymentStatus ?? (row.payData?.isProcessed ? "PROCESSED" : "DRAFT")).toUpperCase();
    const draftRows = payrollRows.filter(row => !row.payData?.isProcessed && !["PROCESSED", "PAID", "CLOSED"].includes(workflowStatus(row)));
    const processedRows = payrollRows.filter(row => Boolean(row.payData?.isProcessed) && !["PAID", "CLOSED"].includes(workflowStatus(row)));
    const paidRows = payrollRows.filter(row => workflowStatus(row) === "PAID");
    const closedRows = payrollRows.filter(row => workflowStatus(row) === "CLOSED");

    // Filter state
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [selectedRole, setSelectedRole] = useState<string>("ALL");
    const [onlyLop, setOnlyLop] = useState<boolean>(false);
    const [onlyBonus, setOnlyBonus] = useState<boolean>(false);
    const [onlyTax, setOnlyTax] = useState<boolean>(false);
    const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);

    const getJobTitleString = (jobTitle: Record<string, string> | string | null | undefined): string => {
        if (!jobTitle) return "";
        if (typeof jobTitle === "string") return jobTitle;
        if (typeof jobTitle === "object") {
            return jobTitle.name || jobTitle.title || jobTitle.jobTitle || Object.values(jobTitle)[0] || "";
        }
        return "";
    };

    const availableRoles = useMemo(() => {
        const set = new Set<string>();
        payRollData.forEach((row) => {
            const title = getJobTitleString(row.jobTitle);
            if (title.trim()) set.add(title.trim());
        });
        return Array.from(set).sort();
    }, [payRollData]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (statusFilter !== "ALL") count++;
        if (selectedRole !== "ALL") count++;
        if (onlyLop) count++;
        if (onlyBonus) count++;
        if (onlyTax) count++;
        return count;
    }, [statusFilter, selectedRole, onlyLop, onlyBonus, onlyTax]);

    const { lopCount, bonusCount, taxCount } = useMemo(() => {
        let lop = 0;
        let bonus = 0;
        let tax = 0;
        for (const row of payRollData) {
            if ((row.payData?.lossOfPayDays ?? 0) > 0 || (row.payData?.lossOfPay ?? 0) > 0) {
                lop++;
            }
            if ((row.payData?.bonus ?? 0) > 0) {
                bonus++;
            }
            if ((row.payData?.incomeTax ?? 0) > 0) {
                tax++;
            }
        }
        return { lopCount: lop, bonusCount: bonus, taxCount: tax };
    }, [payRollData]);

    const handleResetFilters = () => {
        setStatusFilter("ALL");
        setSelectedRole("ALL");
        setOnlyLop(false);
        setOnlyBonus(false);
        setOnlyTax(false);
    };

    const filteredPayRollData = useMemo(() => {
        return payRollData.filter((row) => {
            if (statusFilter !== "ALL") {
                const status = workflowStatus(row);
                const hasPayRoll = Boolean(row.payData?.payRollId);

                if (statusFilter === "UNCALCULATED") {
                    if (hasPayRoll) return false;
                } else if (statusFilter === "DRAFT") {
                    if (!hasPayRoll || row.payData?.isProcessed || ["PROCESSED", "PAID", "CLOSED"].includes(status)) return false;
                } else if (statusFilter === "PROCESSED") {
                    if (!hasPayRoll || !row.payData?.isProcessed || status === "PAID" || status === "CLOSED") return false;
                } else if (statusFilter === "PAID") {
                    if (status !== "PAID") return false;
                } else if (statusFilter === "CLOSED") {
                    if (status !== "CLOSED") return false;
                }
            }

            if (selectedRole !== "ALL") {
                const title = getJobTitleString(row.jobTitle);
                if (title.trim() !== selectedRole) return false;
            }

            if (onlyLop && (row.payData?.lossOfPayDays ?? 0) <= 0 && (row.payData?.lossOfPay ?? 0) <= 0) return false;
            if (onlyBonus && (row.payData?.bonus ?? 0) <= 0) return false;
            if (onlyTax && (row.payData?.incomeTax ?? 0) <= 0) return false;

            return true;
        });
    }, [payRollData, statusFilter, selectedRole, onlyLop, onlyBonus, onlyTax]);

    const handleDateChange = (newValue: Dayjs | null) => {
        setPayMonth(newValue);
        handleResetFilters();
    };

    const handleSearchChange = (value: string) => {
        setSearch(value.trim());
    };

    const handleRowClick = (row: PayRollResponseModel) => {
        if (row.payData.isProcessed) {
            toast.info("Processed payroll is locked and cannot be edited.");
            return;
        }
        setSelectedEmployeeName(row.employeeName || '');
        setInitialValues({
            ...row.payData,
            paidDate: row.payData.paidDate ? dayjs(row.payData.paidDate as unknown as string) : null,
            payMonth: payMonth!
        });
        setIsEdit(true);
        setIsModalOpen(true);
    };

    const handleRecordPayment = (row: PayRollResponseModel) => setPaymentRow(row);
    const handleViewAudit = (row: PayRollResponseModel) => setAuditRow(row);

    const submitPayment = async (form: PaymentForm) => {
        if (!paymentRow?.payData.payRollId) return;
        setIsRecordingPayment(true);
        try {
            const { data } = await recordPayrollPayment({
                payrollId: paymentRow.payData.payRollId,
                paymentMethod: form.paymentMethod,
                paymentReference: form.paymentReference,
                paymentDate: form.paymentDate,
                notes: form.notes,
            });
            if (data.success) {
                toast.success(data.message || "Payment recorded.");
                setPaymentRow(null);
                handlePageRefresh();
            } else {
                toast.error(data.message || i({ id: "ERROR.500" }));
            }
        } catch (error) {
            toast.error((error as any)?.response?.data?.message ?? i({ id: "ERROR.500" }));
        } finally {
            setIsRecordingPayment(false);
        }
    };

    const handleGeneratePayroll = async () => {
        if (!payMonth || isGenerating || isMonthProcessed) return;
        setIsGenerating(true);
        try {
            const payload: { payMonth: string; employeeIds?: string[] } = {
                payMonth: payMonth.startOf("month").format("YYYY-MM-DD"),
            };
            if (payrollRows.length > 0 && uncalculatedRows.length > 0) {
                payload.employeeIds = uncalculatedRows.map((r) => r.employeeId);
            }
            const { data } = await generateMonthlyPayroll(payload);
            if (data.success) {
                toast.success(data.message || "Payroll calculated successfully.");
                handlePageRefresh();
            } else {
                toast.error(data.message || i({ id: "ERROR.500" }));
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? i({ id: "ERROR.500" }));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApproveMonth = async () => {
        if (!payMonth || isApproving || !needsApproval) return;
        setIsApproving(true);
        try {
            const { data } = await approvePayrollMonth({ payMonth: payMonth.startOf("month").format("YYYY-MM-DD") });
            if (data.success) {
                toast.success(data.message || "Payroll approved.");
                handlePageRefresh();
            } else {
                toast.error(data.message || i({ id: "ERROR.500" }));
            }
        } catch (error) {
            toast.error((error as any)?.response?.data?.message ?? i({ id: "ERROR.500" }));
        } finally {
            setIsApproving(false);
        }
    };

    const handlePageRefresh = () => {
        setRefresh(prev => !prev);
    };

    const requestCloseMonth = () => {
        if (payMonth && isMonthProcessed && allPaymentsRecorded && hasEditPermission) {
            setIsCloseConfirmOpen(true);
        }
    };

    const handleCloseMonth = async () => {
        if (!payMonth || !isMonthProcessed || !allPaymentsRecorded || isClosingMonth) return;
        setIsClosingMonth(true);
        try {
            const { data } = await closePayrollMonth({ payMonth: payMonth.startOf("month").format("YYYY-MM-DD") });
            if (data.success) {
                toast.success(data.message || "Payroll month closed.");
                setIsCloseConfirmOpen(false);
                handlePageRefresh();
            } else {
                toast.error(data.message || i({ id: "ERROR.500" }));
            }
        } catch (error) {
            toast.error((error as any)?.response?.data?.message ?? i({ id: "ERROR.500" }));
        } finally {
            setIsClosingMonth(false);
        }
    };

    const handleProcessMonth = async () => {
        if (!payMonth || isMonthProcessed || isProcessing) return;
        setIsProcessing(true);
        try {
            const { data } = await processPayrollMonth({
                payMonth: payMonth.startOf("month").format("YYYY-MM-DD"),
            });
            if (data.success) {
                toast.success(data.message || "Payroll processed.");
                setIsProcessModalOpen(false);
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

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setSelectedEmployeeName('');
        setInitialValues(initialPayRollValues);
    };

    useEffect(() => {
        setPageTitle(i({ id: "PAGE.PAYROLL" }));
    }, [i, setPageTitle]);

    useEffect(() => {
        if (!canAccessHrManagement(currentUser?.roleType)) return;
        (async () => {
            try {
                const { data } = await getEmployeePayRollData({ employeeName: search, payMonth: payMonth!.format("YYYY-MM-DD") });
                if (data.success) {
                    setPayRollData(data.methodResults);
                }
            } catch (error) {
                console.error((error as Error).message);
            }
        })();
    }, [search, payMonth, refresh, currentUser?.roleType]);

    if (!canAccessHrManagement(currentUser?.roleType)) {
        return <UnauthorizedStay />;
    }

    return (
        <Box sx={{ width: "100%", maxWidth: "none", mx: 0, pb: { xs: 2, md: 3 } }}>
            <Card
                className="payroll-management-card d-flex flex-column flex-grow-1"
                sx={{
                    gap: { xs: 1.5, sm: 2, md: 2.5 },
                    p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                    minWidth: 0,
                    overflow: "hidden",
                    borderRadius: 3,
                    bgcolor: "var(--mui-palette-background-card, var(--mui-palette-background-paper))",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 10px 30px 0 rgba(0, 0, 0, 0.08)",
                }}
            >
                {/* Actions Toolbar */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        width: "100%",
                        p: { xs: 1.25, sm: 1.5 },
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "14px",
                        bgcolor: isDark ? "rgba(15, 23, 42, 0.55)" : "rgba(248, 250, 252, 0.75)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        boxShadow: "none",
                        "& .MuiOutlinedInput-root": {
                            height: 40,
                            bgcolor: "background.paper",
                            borderRadius: "10px",
                        },
                    }}
                >
                    {/* Row 1: Search & Month Selection ONLY (fully responsive, spans full card width) */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.25}
                        alignItems="center"
                        sx={{ width: "100%" }}
                    >
                        <Box
                            sx={{
                                width: { xs: "100%", sm: "clamp(240px, 30%, 320px)" },
                                flex: { sm: "1 1 240px", md: "1 1 280px" },
                                maxWidth: { sm: 300, md: 340, lg: 360 },
                                minWidth: { sm: 220 },
                                flexShrink: 0,
                                "& > .MuiStack-root": {
                                    pt: "0 !important",
                                    overflow: "visible",
                                },
                            }}
                        >
                            <CustomisedDatePicker
                                label={i({ id: "PAYROLL.SELECT_PAY_MONTH" })}
                                views={["month", "year"]}
                                value={payMonth}
                                maxDate={dayjs().subtract(1, "month")}
                                setValue={handleDateChange}
                            />
                        </Box>
                        <Box
                            sx={{
                                width: { xs: "100%", sm: "auto" },
                                flex: { sm: "2 1 300px", md: "2 1 400px" },
                                minWidth: { sm: 200 },
                            }}
                        >
                            <SearchInput
                                fullWidth
                                search={search}
                                setSearch={handleSearchChange}
                                sx={{ width: "100%", maxWidth: "none" }}
                            />
                        </Box>
                    </Stack>

                    {/* Row 2: All Operations & Controls (Left: Filter + Upload + Sample + Add; Right: Calculate + Process Salary) */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            width: "100%",
                            pt: 1.25,
                            borderTop: "1px dashed",
                            borderColor: "divider",
                        }}
                    >
                        {/* Utility Icon Buttons Group (Filter + Upload + Sample + Add) */}
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{
                                width: { xs: "100%", sm: "auto" },
                                justifyContent: "flex-start",
                                flexShrink: 0,
                            }}
                        >
                            {/* Filter Trigger Button */}
                            <Tooltip
                                title={
                                    activeFilterCount > 0
                                        ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"} applied`
                                        : "Filter payroll records"
                                }
                                arrow
                                placement="top"
                            >
                                <Badge
                                    badgeContent={activeFilterCount}
                                    color="primary"
                                    sx={{
                                        flexShrink: 0,
                                        "& .MuiBadge-badge": {
                                            fontSize: "0.72rem",
                                            fontWeight: 700,
                                            height: 18,
                                            minWidth: 18,
                                            padding: "0 4px",
                                        },
                                    }}
                                >
                                    <AppButton
                                        variant={activeFilterCount > 0 ? "contained" : "outlined"}
                                        color={activeFilterCount > 0 ? "primary" : "inherit"}
                                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                                        aria-label="Filter payroll records"
                                        sx={{
                                            ...payrollActionButtonSx,
                                            height: 40,
                                            minWidth: 40,
                                            width: 40,
                                            border: 1,
                                            borderColor: activeFilterCount > 0 ? "primary.main" : "divider",
                                            bgcolor: activeFilterCount > 0 ? "primary.main" : "background.paper",
                                            color: activeFilterCount > 0 ? "primary.contrastText" : "text.secondary",
                                            borderRadius: "10px",
                                            "&:hover": {
                                                bgcolor: activeFilterCount > 0 ? "primary.dark" : "action.hover",
                                                borderColor: activeFilterCount > 0 ? "primary.dark" : "text.secondary",
                                                color: activeFilterCount > 0 ? "primary.contrastText" : "text.primary",
                                            },
                                        }}
                                    >
                                        <FilterList fontSize="small" />
                                    </AppButton>
                                </Badge>
                            </Tooltip>

                            {hasCreatePermission && (
                                <>
                                    <UploadPayRollData handlePageRefresh={handlePageRefresh} />
                                    <Tooltip title={i({ id: "BUTTON.ADD" })} arrow placement="top">
                                        <AppButton
                                            variant="outlined"
                                            aria-label={i({ id: "BUTTON.ADD" })}
                                            sx={{
                                                ...payrollActionButtonSx,
                                                borderRadius: "10px",
                                                border: 1,
                                                borderColor: "divider",
                                                bgcolor: "background.paper",
                                                color: "text.secondary",
                                                "&:hover": {
                                                    borderColor: "text.primary",
                                                    color: "text.primary",
                                                    bgcolor: "action.hover",
                                                },
                                            }}
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            <Add fontSize="small" />
                                        </AppButton>
                                    </Tooltip>
                                </>
                            )}
                        </Stack>

                        {/* Lifecycle Action Buttons Group */}
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{
                                width: { xs: "100%", sm: "auto" },
                                justifyContent: { xs: "stretch", sm: "flex-end" },
                                flexWrap: "wrap",
                                gap: 1,
                                "& > *": { flex: { xs: 1, sm: "initial" } },
                            }}
                        >
                            {hasCreatePermission && !isMonthProcessed && (
                                <Tooltip
                                    title={
                                        payrollRows.length === 0
                                            ? "Auto-calculate monthly payroll from attendance and approved salary structures"
                                            : uncalculatedRows.length > 0
                                            ? `Calculate payroll for ${uncalculatedRows.length} remaining employee${uncalculatedRows.length === 1 ? "" : "s"} whose salary structures were configured`
                                            : "Recalculate monthly payroll worksheets with latest attendance and approved salary updates"
                                    }
                                    arrow
                                    placement="top"
                                >
                                    <span>
                                        <AppButton
                                            variant={payrollRows.length === 0 ? "contained" : "outlined"}
                                            color={payrollRows.length === 0 ? "primary" : "inherit"}
                                            aria-label={
                                                payrollRows.length === 0
                                                    ? "Generate Payroll"
                                                    : uncalculatedRows.length > 0
                                                    ? "Calculate Remaining"
                                                    : "Recalculate"
                                            }
                                            startIcon={
                                                isGenerating ? (
                                                    <CircularProgress size={16} color="inherit" />
                                                ) : payrollRows.length === 0 ? (
                                                    <AutoAwesome fontSize="small" />
                                                ) : uncalculatedRows.length > 0 ? (
                                                    <CalculateOutlined fontSize="small" />
                                                ) : (
                                                    <Refresh fontSize="small" />
                                                )
                                            }
                                            disabled={isGenerating}
                                            onClick={() => void handleGeneratePayroll()}
                                            sx={{
                                                height: 40,
                                                px: 1.5,
                                                fontSize: "0.82rem",
                                                fontWeight: 700,
                                                borderRadius: "10px",
                                                textTransform: "none",
                                                whiteSpace: "nowrap",
                                                transition: "all 0.15s ease-in-out",
                                                ...(payrollRows.length > 0 && uncalculatedRows.length > 0
                                                    ? {
                                                          color: "primary.main",
                                                          borderColor: (theme) => alpha(theme.palette.primary.main, 0.45),
                                                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                                          "&:hover": {
                                                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                                                              borderColor: "primary.main",
                                                          },
                                                      }
                                                    : payrollRows.length > 0
                                                    ? {
                                                          borderColor: "divider",
                                                          color: "text.secondary",
                                                          bgcolor: "background.paper",
                                                          "&:hover": {
                                                              borderColor: "text.primary",
                                                              color: "text.primary",
                                                              bgcolor: "action.hover",
                                                          },
                                                      }
                                                    : {}),
                                            }}
                                        >
                                            {isGenerating
                                                ? "Calculating..."
                                                : payrollRows.length === 0
                                                ? "Generate"
                                                : uncalculatedRows.length > 0
                                                ? `Calculate (${uncalculatedRows.length})`
                                                : "Recalculate"}
                                        </AppButton>
                                    </span>
                                </Tooltip>
                            )}
                            {needsApproval && hasEditPermission && !isMonthProcessed && (
                                <Tooltip title="Approve payroll month before processing" arrow placement="top">
                                    <AppButton
                                        variant="contained"
                                        color="warning"
                                        startIcon={<CheckCircle fontSize="small" />}
                                        aria-label="Approve payroll month"
                                        disabled={isApproving}
                                        onClick={() => void handleApproveMonth()}
                                        sx={{
                                            height: 40,
                                            px: 1.5,
                                            fontWeight: 700,
                                            borderRadius: "10px",
                                            textTransform: "none",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {isApproving ? "Approving..." : "Approve month"}
                                    </AppButton>
                                </Tooltip>
                            )}
                            {isMonthProcessed && allPaymentsRecorded && hasEditPermission && (
                                <Tooltip title="Close payroll month" arrow placement="top">
                                    <AppButton
                                        variant="outlined"
                                        color="success"
                                        startIcon={<Lock fontSize="small" />}
                                        aria-label="Close payroll month"
                                        onClick={requestCloseMonth}
                                        sx={{
                                            height: 40,
                                            px: 1.5,
                                            fontWeight: 700,
                                            borderRadius: "10px",
                                            textTransform: "none",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Close month
                                    </AppButton>
                                </Tooltip>
                            )}
                            {(hasCreatePermission || hasEditPermission) && payrollRows.length > 0 && (
                                isMonthProcessed ? (
                                    <Chip
                                        icon={<CheckCircle />}
                                        color="success"
                                        variant="outlined"
                                        label="Month processed · Payslips published"
                                        aria-label={`Payroll for ${payMonth?.format("MMMM YYYY")} is already processed`}
                                        sx={{
                                            height: 40,
                                            px: 1,
                                            fontWeight: 700,
                                            borderRadius: "10px",
                                            bgcolor: "background.paper",
                                            maxWidth: "100%",
                                            flexBasis: { xs: "100%", lg: "auto" },
                                            "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                                            "& .MuiChip-icon": { fontSize: 20 },
                                        }}
                                    />
                                ) : (
                                    <Tooltip
                                        title={needsApproval ? "Approve payroll month before processing" : "Locks employee salary worksheets and generates official payslips"}
                                        arrow
                                        placement="top"
                                    >
                                        <span>
                                            <AppButton
                                                variant="contained"
                                                color="primary"
                                                startIcon={<PlayArrow fontSize="small" />}
                                                aria-label={`Process salary for ${processableRows.length} remaining employee${processableRows.length === 1 ? "" : "s"}`}
                                                sx={{
                                                    height: 40,
                                                    px: 2,
                                                    fontWeight: 700,
                                                    borderRadius: "10px",
                                                    textTransform: "none",
                                                    whiteSpace: "nowrap",
                                                }}
                                                disabled={isProcessing || processableRows.length === 0 || needsApproval}
                                                onClick={() => setIsProcessModalOpen(true)}
                                            >
                                                {isProcessing ? "Processing..." : `Process salary (${processableRows.length})`}
                                            </AppButton>
                                        </span>
                                    </Tooltip>
                                )
                            )}
                        </Stack>
                    </Stack>
                </Box>

                {/* Payroll Month Status Summary */}
                <Stack
                    direction={{ xs: "column", lg: "row" }}
                    spacing={{ xs: 1.5, lg: 2 }}
                    alignItems={{ xs: "stretch", lg: "center" }}
                    justifyContent="space-between"
                    sx={{
                        p: { xs: 1.5, sm: 2 },
                        border: 1,
                        borderColor: "divider",
                        borderRadius: "12px",
                        bgcolor: "background.paper",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                    }}
                    aria-label="Payroll month summary"
                >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1rem", color: "text.primary" }}>
                                {payMonth?.format("MMMM YYYY")} Payroll
                            </Typography>
                            <Chip
                                size="small"
                                label={isMonthProcessed ? "Processed & Locked" : "Draft / In Review"}
                                color={isMonthProcessed ? "success" : "warning"}
                                variant="outlined"
                                sx={{ fontWeight: 700, borderRadius: "6px" }}
                            />
                        </Stack>
                        <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.4, display: "block" }}>
                            {isMonthProcessed
                                ? "Salaries are locked and official payslips are published for employees. You can preview/download payslips below or record individual payments."
                                : payrollRows.length === 0
                                ? "No payroll records found for this month. Click 'Generate Payroll' above to auto-calculate salaries from attendance and approved salary structures."
                                : "Review and edit individual employee salary worksheets. Click 'Approve month' then 'Process salary' to freeze numbers and publish payslips."}
                        </Typography>
                    </Box>
                    {payRollData.length > 0 && (
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.75,
                                alignItems: "center",
                                pt: { xs: 1.25, lg: 0 },
                                borderTop: { xs: "1px dashed", lg: "none" },
                                borderColor: { xs: "divider", lg: "transparent" },
                                justifyContent: { xs: "flex-start", lg: "flex-end" },
                            }}
                        >
                            <Chip
                                size="small"
                                label={`Total: ${payRollData.length}`}
                                variant="outlined"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    height: 26,
                                    borderRadius: "8px",
                                    borderColor: "divider",
                                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                                    color: "text.primary",
                                    cursor: "default",
                                }}
                            />
                            <Chip
                                size="small"
                                label={`Draft: ${draftRows.length}`}
                                color="warning"
                                variant="outlined"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    height: 26,
                                    borderRadius: "8px",
                                    cursor: "default",
                                }}
                            />
                            <Chip
                                size="small"
                                label={`Processed: ${processedRows.length}`}
                                color="info"
                                variant="outlined"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    height: 26,
                                    borderRadius: "8px",
                                    cursor: "default",
                                }}
                            />
                            <Chip
                                size="small"
                                label={`Paid: ${paidRows.length}`}
                                color={paidRows.length > 0 ? "success" : "default"}
                                variant="outlined"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    height: 26,
                                    borderRadius: "8px",
                                    cursor: "default",
                                }}
                            />
                            <Chip
                                size="small"
                                label={`Closed: ${closedRows.length}`}
                                color={closedRows.length > 0 ? "success" : "default"}
                                variant="outlined"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    height: 26,
                                    borderRadius: "8px",
                                    cursor: "default",
                                }}
                            />
                            {uncalculatedRows.length > 0 && (
                                <Chip
                                    size="small"
                                    label={`Uncalculated: ${uncalculatedRows.length}`}
                                    color="error"
                                    variant="outlined"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: "0.75rem",
                                        height: 26,
                                        borderRadius: "8px",
                                        cursor: "default",
                                    }}
                                />
                            )}
                            {activeFilterCount > 0 && (
                                <Chip
                                    size="small"
                                    label={`Filtered (${filteredPayRollData.length} shown)`}
                                    onDelete={handleResetFilters}
                                    color="primary"
                                    variant="outlined"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: "0.75rem",
                                        height: 26,
                                        borderRadius: "8px",
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                    }}
                                />
                            )}
                        </Box>
                    )}
                </Stack>

                {/* Salary Worksheet & Records Table */}
                <PayRollTable
                    payRollData={filteredPayRollData}
                    payMonth={payMonth}
                    handleRowClick={handleRowClick}
                    handleRecordPayment={handleRecordPayment}
                    handleViewAudit={handleViewAudit}
                />

                {/* Filter Popover */}
                <Popover
                    open={Boolean(filterAnchorEl)}
                    anchorEl={filterAnchorEl}
                    onClose={() => setFilterAnchorEl(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    slotProps={{
                        paper: {
                            sx: {
                                width: { xs: "calc(100vw - 32px)", sm: 400 },
                                maxWidth: 420,
                                p: 2.5,
                                borderRadius: 2.5,
                                boxShadow: "0 16px 40px -8px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.06)",
                                border: 1,
                                borderColor: "divider",
                            },
                        },
                    }}
                >
                    <Stack spacing={2}>
                        {/* Popover Header */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <Box
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 1.5,
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                        color: "primary.main",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <FilterList fontSize="small" />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>
                                        Filter Records
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Refine employee payroll worksheets
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                                {activeFilterCount > 0 && (
                                    <>
                                        <Chip
                                            size="small"
                                            label={`${activeFilterCount} active`}
                                            color="primary"
                                            variant="outlined"
                                            sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
                                        />
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={handleResetFilters}
                                            sx={{
                                                minWidth: 0,
                                                px: 0.75,
                                                py: 0.25,
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                color: "primary.main",
                                                textTransform: "none",
                                                "&:hover": { bgcolor: "action.hover", textDecoration: "underline" },
                                            }}
                                        >
                                            Clear all
                                        </Button>
                                    </>
                                )}
                                <IconButton
                                    size="small"
                                    onClick={() => setFilterAnchorEl(null)}
                                    aria-label="Close filters"
                                    sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
                                >
                                    <Close fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Stack>

                        <Divider />

                        {/* Status Filter */}
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 700,
                                    color: "text.secondary",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.8,
                                    fontSize: "0.72rem",
                                    display: "block",
                                    mb: 1.25,
                                }}
                            >
                                Payroll Status
                            </Typography>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gap: 1,
                                }}
                            >
                                {[
                                    { id: "ALL", label: "All Records", count: payRollData.length, dotColor: "#94a3b8" },
                                    { id: "DRAFT", label: "Draft", count: draftRows.length, dotColor: "#f59e0b" },
                                    { id: "PROCESSED", label: "Processed", count: processedRows.length, dotColor: "#0284c7" },
                                    { id: "PAID", label: "Paid", count: paidRows.length, dotColor: "#10b981" },
                                    { id: "CLOSED", label: "Closed", count: closedRows.length, dotColor: "#64748b" },
                                    ...(uncalculatedRows.length > 0
                                        ? [{ id: "UNCALCULATED", label: "Uncalculated", count: uncalculatedRows.length, dotColor: "#ef4444" }]
                                        : []),
                                ].map((opt) => {
                                    const isSelected = statusFilter === opt.id;
                                    return (
                                        <Box
                                            key={opt.id}
                                            onClick={() => setStatusFilter(isSelected && opt.id !== "ALL" ? "ALL" : opt.id)}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                px: 1.25,
                                                py: 0.85,
                                                borderRadius: 1.5,
                                                cursor: "pointer",
                                                border: 1,
                                                borderColor: isSelected ? "primary.main" : "divider",
                                                bgcolor: isSelected
                                                    ? (theme) => alpha(theme.palette.primary.main, 0.08)
                                                    : "background.paper",
                                                transition: "all 0.15s ease",
                                                "&:hover": {
                                                    bgcolor: isSelected
                                                        ? (theme) => alpha(theme.palette.primary.main, 0.12)
                                                        : "action.hover",
                                                    borderColor: isSelected ? "primary.main" : "text.secondary",
                                                },
                                            }}
                                        >
                                            <Stack direction="row" spacing={0.85} alignItems="center" sx={{ minWidth: 0 }}>
                                                <Box
                                                    sx={{
                                                        width: 7,
                                                        height: 7,
                                                        borderRadius: "50%",
                                                        bgcolor: opt.dotColor,
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    noWrap
                                                    sx={{
                                                        fontWeight: isSelected ? 700 : 500,
                                                        fontSize: "0.8rem",
                                                        color: isSelected ? "primary.main" : "text.primary",
                                                    }}
                                                >
                                                    {opt.label}
                                                </Typography>
                                            </Stack>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: "0.72rem",
                                                    color: isSelected ? "primary.main" : "text.secondary",
                                                    bgcolor: isSelected
                                                        ? (theme) => alpha(theme.palette.primary.main, 0.15)
                                                        : "action.selected",
                                                    px: 0.6,
                                                    py: 0.15,
                                                    borderRadius: 0.75,
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {opt.count}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                        {/* Role / Designation Filter */}
                        {availableRoles.length > 0 && (
                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        color: "text.secondary",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.8,
                                        fontSize: "0.72rem",
                                        display: "block",
                                        mb: 1,
                                    }}
                                >
                                    Job Role / Designation
                                </Typography>
                                <FormControl size="small" fullWidth>
                                    <Select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        displayEmpty
                                        sx={{
                                            borderRadius: 1.5,
                                            bgcolor: "background.paper",
                                            fontSize: "0.85rem",
                                            "& .MuiSelect-select": {
                                                py: 1,
                                            },
                                        }}
                                    >
                                        <MenuItem value="ALL">
                                            <Typography variant="body2" sx={{ fontWeight: selectedRole === "ALL" ? 700 : 400 }}>
                                                All Roles ({availableRoles.length})
                                            </Typography>
                                        </MenuItem>
                                        {availableRoles.map((role) => (
                                            <MenuItem key={role} value={role}>
                                                <Typography variant="body2" sx={{ fontWeight: selectedRole === role ? 700 : 400 }}>
                                                    {role}
                                                </Typography>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        )}

                        {/* Quick Criteria Flags */}
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 700,
                                    color: "text.secondary",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.8,
                                    fontSize: "0.72rem",
                                    display: "block",
                                    mb: 1,
                                }}
                            >
                                Earnings & Deductions Criteria
                            </Typography>
                            <Stack spacing={0.85}>
                                {[
                                    {
                                        key: "lop",
                                        checked: onlyLop,
                                        toggle: () => setOnlyLop(!onlyLop),
                                        title: "Loss of Pay (LOP)",
                                        subtitle: "Employees with unpaid leave or attendance deductions",
                                        count: lopCount,
                                    },
                                    {
                                        key: "bonus",
                                        checked: onlyBonus,
                                        toggle: () => setOnlyBonus(!onlyBonus),
                                        title: "Bonus / Incentives",
                                        subtitle: "Employees receiving additional bonuses this month",
                                        count: bonusCount,
                                    },
                                    {
                                        key: "tax",
                                        checked: onlyTax,
                                        toggle: () => setOnlyTax(!onlyTax),
                                        title: "Income Tax (TDS)",
                                        subtitle: "Employees with statutory tax deductions withheld",
                                        count: taxCount,
                                    },
                                ].map((item) => (
                                    <Box
                                        key={item.key}
                                        onClick={item.toggle}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            p: 1.1,
                                            borderRadius: 1.5,
                                            border: 1,
                                            borderColor: item.checked ? "primary.main" : "divider",
                                            bgcolor: item.checked
                                                ? (theme) => alpha(theme.palette.primary.main, 0.04)
                                                : "background.paper",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                            "&:hover": {
                                                borderColor: item.checked ? "primary.main" : "text.secondary",
                                                bgcolor: item.checked
                                                    ? (theme) => alpha(theme.palette.primary.main, 0.08)
                                                    : "action.hover",
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "flex-start", minWidth: 0, flex: 1, mr: 1 }}>
                                            <Checkbox
                                                checked={item.checked}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    item.toggle();
                                                }}
                                                size="small"
                                                sx={{ p: 0.2, mr: 1, mt: 0.1 }}
                                            />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: item.checked ? 700 : 600,
                                                        fontSize: "0.82rem",
                                                        color: item.checked ? "primary.main" : "text.primary",
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {item.title}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: "text.secondary", fontSize: "0.72rem", display: "block", mt: 0.25 }}
                                                >
                                                    {item.subtitle}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: "0.72rem",
                                                color: item.checked ? "primary.main" : item.count > 0 ? "text.primary" : "text.disabled",
                                                bgcolor: item.checked
                                                    ? (theme) => alpha(theme.palette.primary.main, 0.15)
                                                    : "action.selected",
                                                px: 0.7,
                                                py: 0.2,
                                                borderRadius: 0.75,
                                                lineHeight: 1.2,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.count}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>

                        <Divider />

                        {/* Popover Footer */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                                Showing <b>{filteredPayRollData.length}</b> of <b>{payRollData.length}</b> records
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <AppButton
                                    variant="outlined"
                                    color="inherit"
                                    size="small"
                                    disabled={activeFilterCount === 0}
                                    onClick={handleResetFilters}
                                    sx={{
                                        borderRadius: 1.5,
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        textTransform: "none",
                                        color: activeFilterCount > 0 ? "text.primary" : "text.disabled",
                                        borderColor: "divider",
                                        "&:hover": {
                                            borderColor: activeFilterCount > 0 ? "text.primary" : "divider",
                                            bgcolor: activeFilterCount > 0 ? "action.hover" : "transparent",
                                        },
                                    }}
                                >
                                    Reset
                                </AppButton>
                                <AppButton
                                    variant="contained"
                                    size="small"
                                    onClick={() => setFilterAnchorEl(null)}
                                    sx={{
                                        borderRadius: 1.5,
                                        px: 2,
                                        py: 0.5,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    Done
                                </AppButton>
                            </Stack>
                        </Stack>
                    </Stack>
                </Popover>

                <RecordPayrollPaymentModal
                    open={Boolean(paymentRow)}
                    employeeName={paymentRow?.employeeName ?? ""}
                    submitting={isRecordingPayment}
                    onClose={() => setPaymentRow(null)}
                    onSubmit={submitPayment}
                />

                <PayrollAuditHistoryModal
                    payrollId={auditRow?.payData.payRollId ?? null}
                    employeeName={auditRow?.employeeName ?? ""}
                    onClose={() => setAuditRow(null)}
                />

                <ConfirmationModal
                    open={isCloseConfirmOpen}
                    title="Close payroll month"
                    content={`Close payroll for ${payMonth?.format("MMMM YYYY")}? This will make it read-only.`}
                    handleClose={() => !isClosingMonth && setIsCloseConfirmOpen(false)}
                    handleConfirmation={() => void handleCloseMonth()}
                    ok_btn
                    confirming={isClosingMonth}
                />
            </Card>

            {isModalOpen && (
                <AddUpdateEmployeePayRoll
                    edit={isEdit}
                    open={isModalOpen}
                    initialValues={initialValues}
                    employeeName={selectedEmployeeName}
                    handleClose={handleModalClose}
                    handlePageRefresh={handlePageRefresh}
                />
            )}

            {isProcessModalOpen && payMonth && (
                <ProcessPayrollModal
                    open={isProcessModalOpen}
                    monthLabel={payMonth.format("MMMM YYYY")}
                    employees={processableRows}
                    processing={isProcessing}
                    onClose={() => setIsProcessModalOpen(false)}
                    onConfirm={handleProcessMonth}
                />
            )}
        </Box>
    );
};

export default PayRollManagement;
