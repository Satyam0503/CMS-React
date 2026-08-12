import {
  Card,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { usePageData } from "../../Context/PageDataProvider";
import { PayRollTable } from "./components/PayRollTable";
import { PayRollDataModel, PayRollResponseModel } from "./models";
import { SearchInput } from "../../shared/components/SearchInput";
import dayjs, { Dayjs } from "dayjs";
import { getEmployeePayRollData, processPayrollMonth } from "./services";
import CustomisedDatePicker from "../../shared/components/C_DatePicker";
import { UploadPayRollData } from "./components/UploadPayRollData";
import { Add, CheckCircle, PlayArrow } from "@mui/icons-material";
import { AddUpdateEmployeePayRoll } from "./AddUpdateEmployeePayRoll";
import { Nullable } from "../../../utils/common_types";
import { useAppSelector } from "../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { payrollActionButtonSx } from "./components/payrollActionButtonSx";
import { ProcessPayrollModal } from "./components/ProcessPayrollModal";
import { toast } from "react-toastify";


import { AppButton } from "../../shared/components/ui";
export const initialPayRollValues: Nullable<PayRollDataModel> & { payMonth: Dayjs } = {
    employeeId: "",
    paidDate: null,
    basicPay: null,
    paidDays: null,
    bonus: null,
    hra: null,
    lta: null,
    otherAllowance: null,
    lossOfPayDays: null,
    lossOfPay: null,
    incomeTax: null,
    healthInsurance: null,
    epf: null,
    esic: null,
    isProcessed: false,
    payMonth: dayjs().subtract(1, "month"),
}

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
    const hasCreatePermission = hasModuleFeaturePermission(ModulesName.PayRoll, Permission.Create, userModulePermissions);
    const hasEditPermission = hasModuleFeaturePermission(ModulesName.PayRoll, Permission.Edit, userModulePermissions);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

    const payrollRows = payRollData.filter(row => Boolean(row.payData.payRollId));
    const processableRows = payrollRows.filter(row => !row.payData.isProcessed);
    const isMonthProcessed = payrollRows.length > 0 && payrollRows.every(row => row.payData.isProcessed);

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

    const handlePageRefresh = () => {
        setRefresh(!refresh);
    }

    const handleProcessMonth = async (employeeIds: string[]) => {
        if (!payMonth || employeeIds.length === 0 || isMonthProcessed || isProcessing) return;
        setIsProcessing(true);
        try {
            const { data } = await processPayrollMonth({
                payMonth: payMonth.startOf("month").format("YYYY-MM-DD"),
                employeeIds,
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
    }, [])

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getEmployeePayRollData({ employeeName: search, payMonth: payMonth! });
                if (data.success) {
                    setPayRollData(data.methodResults)
                }
            } catch (error) {
                console.error((error as Error).message);
            }
        })();
    }, [search, payMonth, refresh])


    return (
        <>
            <Card className="d-flex flex-column flex-grow-1 gap-4 p-4 p-md-6">
                <Stack
                    direction="row"
                    spacing={1.25}
                    useFlexGap
                    sx={{
                        alignItems: "center",
                        flexWrap: { xs: "wrap", lg: "nowrap" },
                        width: "100%",
                        p: { xs: 1.25, sm: 1.5 },
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
                            width: { xs: "100%", sm: 232 },
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
                    <Stack sx={{ flex: "1 1 360px", minWidth: { xs: "100%", sm: 240 } }}>
                        <SearchInput search={search} setSearch={handleSearchChange} />
                    </Stack>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: "center",
                            flexShrink: 0,
                            ml: { lg: 0.25 },
                            pl: { lg: 1.25 },
                            borderLeft: { lg: 1 },
                            borderColor: { lg: "divider" },
                        }}
                    >
                        {
                            hasCreatePermission &&
                            <>
                                <UploadPayRollData handlePageRefresh={handlePageRefresh} />
                                <Tooltip title={i({ id: "BUTTON.ADD" })} arrow placement="top">
                                    <AppButton
                                        variant="outlined"
                                        aria-label={i({ id: "BUTTON.ADD" })}
                                        sx={payrollActionButtonSx}
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <Add fontSize="small" />
                                    </AppButton>
                                </Tooltip>
                            </>
                        }
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
                                        "& .MuiChip-icon": { fontSize: 20 },
                                    }}
                                />
                            ) : (
                                <Tooltip
                                    title={`Process salary for ${processableRows.length} remaining employee${processableRows.length === 1 ? "" : "s"}`}
                                    arrow
                                    placement="top"
                                >
                                    <AppButton
                                        variant="outlined"
                                        color="primary"
                                        aria-label={`Process salary for ${processableRows.length} remaining employee${processableRows.length === 1 ? "" : "s"}`}
                                        sx={payrollActionButtonSx}
                                        disabled={isProcessing || processableRows.length === 0}
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
                    <Typography variant="body2" color="warning.main" sx={{ mt: -2 }}>
                        Draft payroll is visible only to authorized payroll users. It is not finalized, cannot generate payslips, and must pass attendance readiness before processing.
                    </Typography>
                )}
                <PayRollTable payRollData={payRollData} payMonth={payMonth} handleRowClick={handleRowClick} />
            </Card>
            {
                isModalOpen && <AddUpdateEmployeePayRoll edit={isEdit} open={isModalOpen} initialValues={initialValues} handleClose={handleModalClose} handlePageRefresh={handlePageRefresh} />
            }
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
        </>
    )
}

export default PayRollManagement;
