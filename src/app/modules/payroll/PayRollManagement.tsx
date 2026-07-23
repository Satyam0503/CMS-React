import {
  Card,
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
import CustomisedDatePicker from "../../shared/components/CustomisedDatePicker";
import { UploadPayRollData } from "./components/UploadPayRollData";
import { Add, PlayArrow } from "@mui/icons-material";
import { AddUpdateEmployeePayRoll } from "./AddUpdateEmployeePayRoll";
import { Nullable } from "../../../utils/common_types";
import { useAppSelector } from "../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { payrollActionButtonSx } from "./components/payrollActionButtonSx";
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

    const payrollRows = payRollData.filter(row => Boolean(row.payData.payRollId));
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

    const handleProcessMonth = async () => {
        if (!payMonth || payrollRows.length === 0 || isMonthProcessed || isProcessing) return;
        setIsProcessing(true);
        try {
            const { data } = await processPayrollMonth({ payMonth: payMonth.startOf("month").format("YYYY-MM-DD") });
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
                    className="justify-content-between flex-wrap-reverse gap-2"
                    sx={{ alignItems: "end" }}
                >
                    <SearchInput search={search} setSearch={handleSearchChange} />
                    <Stack direction="row" className="align-items-end flex-wrap gap-2">
                        <CustomisedDatePicker
                            label={i({ id: "PAYROLL.SELECT_PAY_MONTH" })}
                            views={["month", "year"]}
                            value={payMonth}
                            maxDate={dayjs().subtract(1, "month")}
                            setValue={handleDateChange}
                        />
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
                            <Tooltip title={isMonthProcessed ? `Payroll for ${payMonth?.format("MMMM YYYY")} is processed` : `Process payroll for ${payMonth?.format("MMMM YYYY")}`} arrow placement="top">
                                <span>
                                    <AppButton
                                        variant={isMonthProcessed ? "contained" : "outlined"}
                                        color={isMonthProcessed ? "success" : "primary"}
                                        aria-label={`Process payroll for ${payMonth?.format("MMMM YYYY")}`}
                                        sx={payrollActionButtonSx}
                                        disabled={isMonthProcessed || isProcessing}
                                        onClick={handleProcessMonth}
                                    >
                                        <PlayArrow fontSize="small" />
                                    </AppButton>
                                </span>
                            </Tooltip>
                        )}
                    </Stack>
                </Stack>
                <PayRollTable payRollData={payRollData} payMonth={payMonth} handleRowClick={handleRowClick} />
            </Card>
            {
                isModalOpen && <AddUpdateEmployeePayRoll edit={isEdit} open={isModalOpen} initialValues={initialValues} handleClose={handleModalClose} handlePageRefresh={handlePageRefresh} />
            }
        </>
    )
}

export default PayRollManagement;
