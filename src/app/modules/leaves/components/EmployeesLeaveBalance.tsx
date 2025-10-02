import { Card, Stack, Tooltip, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { Add } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { AddLeaveBalance } from "./AddLeaveBalance";
import { LeaveBalance, LeaveBalanceFilter, LeaveBalanceRequestModel } from "../model";
import { getLeaveBalance } from "../leaveServices";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { EmployeeLeaveBalanceColumnList } from "../../../../utils/constant/Constant";
import { Pagination } from "../../../shared/components/Pagination";
import { useAppSelector } from "../../../Redux/hooks";
import { useNavigate } from "react-router-dom";


const initialLeavBalanceValue: LeaveBalanceRequestModel = {
    employeeId: "",
    leaveTypeBalances: []
}

export const EmployeesLeaveBalance = () => {
    const { formatMessage: i } = useIntl();
    const [isOpen, setOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
    const [refresh, setRefresh] = useState(false);
    const [initialBalance, setInitialBalance] = useState(initialLeavBalanceValue);
    const [paginationValues, setPaginationValues] = useState({ pageNo: 0, records: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const navigate = useNavigate();
    const currentUserId = useAppSelector(state => state.user.userData?.userId)!;
    const [isLoading, setLoading] = useState(true);

    const handleClose = () => {
        setOpen(false);
        setEdit(false);
        setInitialBalance(initialLeavBalanceValue);
    }

    const handlePageChange = (page: number) => {
        setPaginationValues({
            ...paginationValues,
            pageNo: page,
        });
    };

    const handleRowPerPageChange = (rowPerPage: number) => {
        setPaginationValues({
            ...paginationValues,
            records: rowPerPage,
            pageNo: 0,
        });
    };

    const handleLeaveBalanceEdit = (leaveBalance: LeaveBalance) => {
        setEdit(true);
        const leaveBalanceObj: LeaveBalanceRequestModel = {
            id: leaveBalance.id,
            employeeId: leaveBalance.employeeId,
            leaveTypeBalances: [
                leaveBalance.sickLeave,
                leaveBalance.casualLeave,
                leaveBalance.earnedLeave,
                leaveBalance.maternityLeave,
                leaveBalance.paternityLeave
            ]
        }
        setOpen(true);
        setInitialBalance(leaveBalanceObj);
    }
    // const handleRowClick = (row: LeaveBalance) => {
    //     if (row.employeeId === currentUserId) {
    //         navigate("/profile/leave")
    //     } else {
    //         navigate(`/employees/${row.employeeId}/leave`)
    //     }
    // }

    const handleRefresh = () => {
        setRefresh(!refresh)
    }

    useEffect(() => {
        (async () => {
            setLoading(true);
            const payload: LeaveBalanceFilter = { pageNo: paginationValues.pageNo + 1, pageSize: paginationValues.records };
            try {
                const { data } = await getLeaveBalance(payload);
                if (data.success) {
                    setLeaveBalance(data.methodResults);
                    setTotalRecords(data.totalRecords);
                }
            } catch (error) {
                console.error((error as Error).message);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [refresh, paginationValues])

    return (
        <>
            <Card className="p-4 gap-4 d-flex flex-column flex-grow-1">
                <Stack className="flex-row justify-content-between">
                    <Typography variant="h5">{i({ id: "LEAVE.TITLES.LEAVE_BALANCE" })}</Typography>
                    <CustomIconButton icon={<Add />} handleClick={() => setOpen(true)} tooltip={i({ id: "LEAVE.TITLES.ADD_LEAVE_BALANCE" })} />
                </Stack>
                <CustomisedTable
                    keyName="id"
                    rows={leaveBalance}
                    handleEdit={handleLeaveBalanceEdit}
                    columns={EmployeeLeaveBalanceColumnList}
                    page={paginationValues.pageNo}
                    rowsPerPage={paginationValues.records}
                    // rowClickHandler={handleRowClick}
                    loading={isLoading}
                />
                {
                    totalRecords > 0 &&
                    <Pagination
                        rowsPerPage={paginationValues.records}
                        page={paginationValues.pageNo}
                        setPage={handlePageChange}
                        setRowPerPage={handleRowPerPageChange}
                        totalRecords={totalRecords}
                    />
                }
            </Card>
            {
                isOpen && <AddLeaveBalance isEdit={isEdit} handleRefresh={handleRefresh} open={true} initialValues={initialBalance} handleClose={handleClose} />
            }
        </>
    )
}