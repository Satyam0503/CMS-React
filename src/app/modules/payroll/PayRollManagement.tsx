import {
  Box,
  Card,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { usePageData } from "../../Context/PageDataProvider";
import { PayRollTable } from "./components/PayRollTable";
import { PayRollResponseModel } from "./models";
import { SearchInput } from "../../shared/components/SearchInput";
import dayjs, { Dayjs } from "dayjs";
import { getEmployeePayRollData, approvePayrollMonth, processPayrollMonth, recordPayrollPayment, closePayrollMonth } from "./services";
import CustomisedDatePicker from "../../shared/components/C_DatePicker";
import { UploadPayRollData } from "./components/UploadPayRollData";
import Add from "@mui/icons-material/Add";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Lock from "@mui/icons-material/Lock";
import PlayArrow from "@mui/icons-material/PlayArrow";
import ReceiptLong from "@mui/icons-material/ReceiptLong";
import TableChart from "@mui/icons-material/TableChart";
import { AddUpdateEmployeePayRoll } from "./AddUpdateEmployeePayRoll";

import { useAppSelector } from "../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { Roles } from "../../../utils/enums";
import { payrollActionButtonSx } from "./components/payrollActionButtonSx";
import { ProcessPayrollModal } from "./components/ProcessPayrollModal";
import { RecordPayrollPaymentModal, PaymentForm } from "./components/RecordPayrollPaymentModal";
import { PayrollAuditHistoryModal } from "./components/PayrollAuditHistoryModal";
import { initialPayRollValues } from "./payrollDefaults";
import { ConfirmationModal } from "../../shared/components/ConfirmModal";
import { toast } from "react-toastify";


import { AppButton } from "../../shared/components/ui";
import { PayrollRunsPanel } from "./components/PayrollRunsPanel";

type PayrollView = "runs" | "register";

const payrollViews: Array<{
  value: PayrollView;
  label: string;
  icon: JSX.Element;
}> = [
  {
    value: "runs",
    label: "Payroll Runs & Batches",
    icon: <ReceiptLong fontSize="small" />,
  },
  {
    value: "register",
    label: "Monthly Register & Records",
    icon: <TableChart fontSize="small" />,
  },
];

const PayRollManagement = () => {
    const { setPageTitle } = usePageData();
    const { formatMessage: i } = useIntl();
    const [search, setSearch] = useState<string>("");
    const [payMonth, setPayMonth] = useState<Dayjs | null>(dayjs().subtract(1, "month").startOf("day"));
    const [payRollData, setPayRollData] = useState<PayRollResponseModel[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<typeof initialPayRollValues>(initialPayRollValues);
    const [refresh, setRefresh] = useState<boolean>(false);
    const userModulePermissions = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
    const currentUser = useAppSelector(state => state.user.userData);
    const hasCreatePermission = hasModuleFeaturePermission(ModulesName.PayRoll, Permission.Create, userModulePermissions);
    const hasEditPermission = hasModuleFeaturePermission(ModulesName.PayRoll, Permission.Edit, userModulePermissions);
    const isAdministrator = currentUser?.roleType === Roles.Administrator;
    const hasPayrollViewPermission = hasModuleFeaturePermission(ModulesName.PayRoll, Permission.View, userModulePermissions);
    const hasPayrollRunCreatePermission = hasModuleFeaturePermission(ModulesName.PayrollSettings, Permission.Create, userModulePermissions);
    const hasEmployeeViewPermission = hasModuleFeaturePermission(ModulesName.Employees, Permission.View, userModulePermissions);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [paymentRow, setPaymentRow] = useState<PayRollResponseModel | null>(null);
    const [isRecordingPayment, setIsRecordingPayment] = useState(false);
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
    const [isClosingMonth, setIsClosingMonth] = useState(false);
    const [auditRow, setAuditRow] = useState<PayRollResponseModel | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const viewParam = searchParams.get("view");
    const activeView: PayrollView = viewParam === "register" ? "register" : "runs";

    const handleViewChange = (newView: PayrollView) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("view", newView);
            return next;
        }, { replace: true });
    };

    const payrollRows = payRollData.filter(row => Boolean(row.payData.payRollId));
    const processableRows = payrollRows.filter(row => !row.payData.isProcessed);
    const isMonthProcessed = payrollRows.length > 0 && payrollRows.every(row => row.payData.isProcessed);
    const needsApproval = payrollRows.some(row => (row.payData.approvalStatus ?? "").toUpperCase() === "PENDING");
    const allPaymentsRecorded = payrollRows.length > 0 && payrollRows.every(row => ["PAID", "CLOSED"].includes((row.payData.paymentStatus ?? "PENDING").toUpperCase()));
    const workflowStatus = (row: PayRollResponseModel) => (row.payData.workflowStatus ?? row.payData.paymentStatus ?? (row.payData.isProcessed ? "PROCESSED" : "DRAFT")).toUpperCase();
    const processedRows = payrollRows.filter(row => ["PROCESSED", "PAID", "CLOSED"].includes(workflowStatus(row)));
    const paidRows = payrollRows.filter(row => ["PAID", "CLOSED"].includes(workflowStatus(row)));
    const closedRows = payrollRows.filter(row => workflowStatus(row) === "CLOSED");

    const handleDateChange = (newValue: Dayjs | null) => {
        setPayMonth(newValue);
    }

    const handleSearchChange = (value: string) => {
        setSearch(value.trim());
    };

    const handleRowClick = (row: PayRollResponseModel) => {
        if (row.payData.isProcessed) {
            toast.info("Processed payroll is locked and cannot be edited.");
            return;
        }
        setInitialValues({
            ...row.payData,
            // the API returns paidDate as a plain ISO string, not a Dayjs instance
            paidDate: row.payData.paidDate ? dayjs(row.payData.paidDate as unknown as string) : null,
            payMonth: payMonth!
        })
        setIsEdit(true);
        setIsModalOpen(true);
    }

    const handleRecordPayment = (row: PayRollResponseModel) => setPaymentRow(row);
    const handleViewAudit = (row: PayRollResponseModel) => setAuditRow(row);

    const submitPayment = async (form: PaymentForm) => {
        if (!paymentRow?.payData.payRollId) return;
        setIsRecordingPayment(true);
        try {
            const { data } = await recordPayrollPayment({ payrollId: paymentRow.payData.payRollId, paymentMethod: form.paymentMethod, paymentReference: form.paymentReference, paymentDate: form.paymentDate, notes: form.notes });
            if (data.success) { toast.success(data.message || "Payment recorded."); setPaymentRow(null); handlePageRefresh(); }
            else toast.error(data.message || i({ id: "ERROR.500" }));
        } catch (error) { toast.error((error as any)?.response?.data?.message ?? i({ id: "ERROR.500" })); }
        finally { setIsRecordingPayment(false); }
    };
    const handleApproveMonth = async () => {
        if (!payMonth || isApproving || !needsApproval) return;
        setIsApproving(true);
        try {
            const { data } = await approvePayrollMonth({ payMonth: payMonth.startOf("month").format("YYYY-MM-DD") });
            if (data.success) { toast.success(data.message || "Payroll approved."); handlePageRefresh(); }
            else toast.error(data.message || i({ id: "ERROR.500" }));
        } catch (error) { toast.error((error as any)?.response?.data?.message ?? i({ id: "ERROR.500" })); }
        finally { setIsApproving(false); }
    };

    const handlePageRefresh = () => {
        setRefresh(!refresh);
    }

    const requestCloseMonth = () => {
        if (payMonth && isMonthProcessed && allPaymentsRecorded && hasEditPermission) setIsCloseConfirmOpen(true);
    };

    const handleCloseMonth = async () => {
        if (!payMonth || !isMonthProcessed || !allPaymentsRecorded || isClosingMonth) return;
        setIsClosingMonth(true);
        try {
            const { data } = await closePayrollMonth({ payMonth: payMonth.startOf("month").format("YYYY-MM-DD") });
            if (data.success) { toast.success(data.message || "Payroll month closed."); setIsCloseConfirmOpen(false); handlePageRefresh(); }
            else toast.error(data.message || i({ id: "ERROR.500" }));
        } catch (error) { toast.error((error as any)?.response?.data?.message ?? i({ id: "ERROR.500" })); }
        finally { setIsClosingMonth(false); }
    };    const handleProcessMonth = async () => {
        if (!payMonth || isMonthProcessed || isProcessing) return;
        setIsProcessing(true);
        try {
            const { data } = await processPayrollMonth({
                payMonth: payMonth.startOf("month").format("YYYY-MM-DD"),
            });
            if (data.success) {
                toast.success(data.message);
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
        setInitialValues(initialPayRollValues);
    }

    useEffect(() => {
        setPageTitle(i({ id: "PAGE.PAYROLL" }))
    }, [i, setPageTitle])

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getEmployeePayRollData({ employeeName: search, payMonth: payMonth!.format("YYYY-MM-DD") });
                if (data.success) {
                    setPayRollData(data.methodResults)
                }
            } catch (error) {
                console.error((error as Error).message);
            }
        })();
    }, [search, payMonth, refresh])


    return (
        <Box sx={{ width: "100%", maxWidth: "none", mx: 0, pb: { xs: 2, md: 3 } }}>
            {/* Codeji HRMS Consistent Theme Tab Container */}
            {hasPayrollViewPermission && (
                <Card
                    role="tablist"
                    aria-label="Payroll workflow navigation"
                    className="tab-container d-flex flex-row"
                    sx={{
                        mb: 2.5,
                        borderRadius: 3,
                        p: 0.75,
                        gap: 0.5,
                        overflowX: "auto",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                        "& .tab-box": {
                            flex: { xs: "0 0 auto", sm: "1 1 0" },
                            minWidth: { xs: 180, sm: 0 },
                            justifyContent: "center",
                            textAlign: "center",
                        },
                    }}
                >
                    {payrollViews.map((tab) => {
                        const isSelected = activeView === tab.value;
                        return (
                            <Box
                                component="div"
                                key={tab.value}
                                role="tab"
                                aria-selected={isSelected}
                                className={clsx("tab-box", {
                                    tab_active: isSelected,
                                })}
                                onClick={() => handleViewChange(tab.value)}
                            >
                                {tab.icon}
                                {tab.label}
                            </Box>
                        );
                    })}
                </Card>
            )}

            {/* View 1: Automated Payroll Runs & Payment Batches */}
            {hasPayrollViewPermission && activeView === "runs" && (
                <Box
                    role="tabpanel"
                    id="payroll-panel-runs"
                    aria-labelledby="payroll-tab-runs"
                    sx={{ minWidth: 0 }}
                >
                    <PayrollRunsPanel
                        canEdit={hasEditPermission}
                        canApprove={isAdministrator}
                        canCreate={hasPayrollRunCreatePermission}
                        canSelectEmployees={hasEmployeeViewPermission}
                    />
                </Box>
            )}

            {/* View 2: Monthly Register & Individual Employee Records */}
            {(!hasPayrollViewPermission || activeView === "register") && (
                <Box
                    role="tabpanel"
                    id="payroll-panel-register"
                    aria-labelledby="payroll-tab-register"
                    sx={{ minWidth: 0 }}
                >
                    <Card
                        className="payroll-management-card d-flex flex-column flex-grow-1"
                        sx={{
                            gap: { xs: 1.5, sm: 2, md: 3 },
                            p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                            minWidth: 0,
                            overflow: "hidden",
                            borderRadius: 3,
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", lg: "row" }}
                            spacing={1.25}
                            useFlexGap
                            sx={{
                                alignItems: { xs: "stretch", lg: "center" },
                                width: "100%",
                                p: { xs: 1, sm: 1.5 },
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 2,
                                bgcolor: "action.hover",
                                "& .MuiOutlinedInput-root": {
                                    height: 40,
                                    bgcolor: "background.paper",
                                },
                            }}
                        >
                            <Stack
                                sx={{
                                    width: { xs: "100%", lg: 232 },
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
                            </Stack>
                            <Stack sx={{ flex: "0 1 auto", width: { xs: "100%", sm: 280, lg: 320 }, minWidth: 0 }}>
                                <SearchInput search={search} setSearch={handleSearchChange} />
                            </Stack>
                            <Stack
                                direction="row"
                                spacing={1}
                                useFlexGap
                                sx={{
                                    alignItems: "center",
                                    flexShrink: { lg: 0 },
                                    flexWrap: "wrap",
                                    width: { xs: "100%", lg: "auto" },
                                    justifyContent: { xs: "flex-start", lg: "flex-end" },
                                    ml: { lg: "auto" },
                                    pl: { lg: 1.5 },
                                    borderLeft: { lg: 1 },
                                    borderColor: { lg: "divider" },
                                }}
                            >
                                {
                                    hasCreatePermission &&
                                    <>
                                        <UploadPayRollData handlePageRefresh={handlePageRefresh} fillToolbarRow />
                                        <Tooltip title={i({ id: "BUTTON.ADD" })} arrow placement="top">
                                            <AppButton
                                                variant="outlined"
                                                aria-label={i({ id: "BUTTON.ADD" })}
                                                sx={{ ...payrollActionButtonSx, flex: { xs: "1 1 0", lg: "0 0 auto" }, width: { xs: "100%", lg: 40 } }}
                                                onClick={() => setIsModalOpen(true)}
                                            >
                                                <Add fontSize="small" />
                                            </AppButton>
                                        </Tooltip>
                                    </>
                                }
                                {needsApproval && hasEditPermission && !isMonthProcessed && (
                                    <Tooltip title="Approve payroll month" arrow placement="top">
                                        <AppButton variant="outlined" color="success" aria-label="Approve payroll month" disabled={isApproving} onClick={() => void handleApproveMonth()} sx={{ ...payrollActionButtonSx, flex: { xs: "1 1 0", lg: "0 0 auto" }, width: { xs: "100%", lg: 40 } }}>
                                            <CheckCircle fontSize="small" />
                                        </AppButton>
                                    </Tooltip>
                                )}
                                {isMonthProcessed && allPaymentsRecorded && hasEditPermission && (
                                    <Tooltip title="Close payroll month" arrow placement="top">
                                        <AppButton variant="outlined" color="success" aria-label="Close payroll month" onClick={requestCloseMonth} sx={{ ...payrollActionButtonSx, flex: { xs: "1 1 0", lg: "0 0 auto" }, width: { xs: "100%", lg: 40 } }}>
                                            <Lock fontSize="small" />
                                        </AppButton>
                                    </Tooltip>
                                )}
                                {(hasCreatePermission || hasEditPermission) && payrollRows.length > 0 && (
                                    isMonthProcessed ? (
                                        <Chip
                                            icon={<CheckCircle />}
                                            color="success"
                                            variant="outlined"
                                            label="Already processed"
                                            aria-label={`Payroll for ${payMonth?.format("MMMM YYYY")} is already processed`}
                                            sx={{
                                                height: 40,
                                                px: 0.5,
                                                fontWeight: 600,
                                                borderRadius: 1.5,
                                                bgcolor: "background.paper",
                                                maxWidth: "100%",
                                                flexBasis: { xs: "100%", lg: "auto" },
                                                "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                                                "& .MuiChip-icon": { fontSize: 20 },
                                            }}
                                        />
                                    ) : (
                                        <Tooltip
                                            title={needsApproval ? "Approve payroll month before processing" : `Process salary for ${processableRows.length} remaining employee${processableRows.length === 1 ? "" : "s"}`}
                                            arrow
                                            placement="top"
                                        >
                                            <AppButton
                                                variant="outlined"
                                                color="primary"
                                                aria-label={`Process salary for ${processableRows.length} remaining employee${processableRows.length === 1 ? "" : "s"}`}
                                                sx={{ ...payrollActionButtonSx, flex: { xs: "1 1 0", lg: "0 0 auto" }, width: { xs: "100%", lg: 40 } }}
                                                disabled={isProcessing || processableRows.length === 0 || needsApproval}
                                                onClick={() => setIsProcessModalOpen(true)}
                                            >
                                                <PlayArrow fontSize="small" />
                                            </AppButton>
                                        </Tooltip>
                                    )
                                )}
                            </Stack>
                        </Stack>
                        {payrollRows.length > 0 && !isMonthProcessed && (
                            <Typography variant="body2" color="warning.main" sx={{ mt: -2, fontSize: { xs: 12, sm: 14 } }}>
                                Draft payroll is visible only to authorized payroll users. It is not finalized, cannot generate payslips, and must pass attendance readiness before processing.
                            </Typography>
                        )}
                        {payrollRows.length > 0 && (
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1}
                                useFlexGap
                                sx={{ flexWrap: "wrap", alignItems: { xs: "stretch", sm: "center" }, p: 1.25, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}
                                aria-label="Payroll month summary"
                            >
                                <Typography variant="body2" sx={{ fontWeight: 700, mr: { sm: 1 } }}>
                                    {payMonth?.format("MMMM YYYY")} status
                                </Typography>
                                <Chip size="small" label={`Draft ${payrollRows.length - processedRows.length}`} color={processedRows.length === payrollRows.length ? "default" : "warning"} variant="outlined" />
                                <Chip size="small" label={`Processed ${processedRows.length}`} color="info" variant="outlined" />
                                <Chip size="small" label={`Paid ${paidRows.length}`} color={paidRows.length === payrollRows.length ? "success" : "default"} variant="outlined" />
                                <Chip size="small" label={`Closed ${closedRows.length}`} color={closedRows.length === payrollRows.length ? "success" : "default"} variant="outlined" />
                            </Stack>
                        )}
                        <PayRollTable payRollData={payRollData} payMonth={payMonth} handleRowClick={handleRowClick} handleRecordPayment={handleRecordPayment} handleViewAudit={handleViewAudit} />
                        <RecordPayrollPaymentModal open={Boolean(paymentRow)} employeeName={paymentRow?.employeeName ?? ""} submitting={isRecordingPayment} onClose={() => setPaymentRow(null)} onSubmit={submitPayment} />
                        <PayrollAuditHistoryModal payrollId={auditRow?.payData.payRollId ?? null} employeeName={auditRow?.employeeName ?? ""} onClose={() => setAuditRow(null)} />
                        <ConfirmationModal open={isCloseConfirmOpen} title="Close payroll month" content={`Close payroll for ${payMonth?.format("MMMM YYYY")}? This will make it read-only.`} handleClose={() => !isClosingMonth && setIsCloseConfirmOpen(false)} handleConfirmation={() => void handleCloseMonth()} ok_btn confirming={isClosingMonth} />
                    </Card>
                </Box>
            )}

            {isModalOpen && (
                <AddUpdateEmployeePayRoll
                    edit={isEdit}
                    open={isModalOpen}
                    initialValues={initialValues}
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
}

export default PayRollManagement;
