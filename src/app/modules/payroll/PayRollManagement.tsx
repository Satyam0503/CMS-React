import { Card, IconButton, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { usePageData } from "../../Context/PageDataProvider";
import { PayRollTable } from "./components/PayRollTable";
import { PayRollDataModel, PayRollResponseModel } from "./models";
import { SearchInput } from "../../shared/components/SearchInput";
import dayjs, { Dayjs } from "dayjs";
import { getEmployeePayRollData } from "./services";
import CustomisedDatePicker from "../../shared/components/CustomisedDatePicker";
import { UploadPayRollData } from "./components/UploadPayRollData";
import { Add } from "@mui/icons-material";
import { AddUpdateEmployeePayRoll } from "./AddUpdateEmployeePayRoll";
import { Nullable } from "../../../utils/common_types";
import { useAppSelector } from "../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";


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

    const handleDateChange = (newValue: Dayjs | null) => {
        setPayMonth(newValue);
    }

    const handleSearchChange = (value: string) => {
        setSearch(value.trim());
    };

    const handleRowClick = (row: PayRollResponseModel) => {
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
                                <IconButton sx={{ height: 36, width: 36 }} onClick={() => setIsModalOpen(true)} >
                                    <Add />
                                </IconButton>
                            </>
                        }
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