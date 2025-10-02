import { useEffect, useState } from "react";
import { useAppSelector } from "../../../../Redux/hooks"
import { EmployeeLeaveTypeBalance, LeaveRequestModel, LeaveRequestsFilter } from "../../../leaves/model";
import { deleteLeaveRequest, getAllLeaveRequest } from "../../../leaves/leaveServices";
import { Card, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { dateFormatter, leaveRequestStatusMapper, LeaveTypeMapper } from "../../../../../utils/common";
import { StyleStatus } from "../../../../shared/components/StyledStatus";
import clsx from "clsx";
import { LEAVE_REQUEST_STATUS } from "../../../../../utils/enums";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import { Delete, Edit } from "@mui/icons-material";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { Pagination } from "../../../../shared/components/Pagination";
import { ViewLeaveReason } from "../../../../shared/components/ViewLeaveReason";
import { toast } from "react-toastify";
import TableSkeleton from "../../../../shared/components/TableSkeleton";
import { LeaveApplication } from "./LeaveApplication";
import dayjs from "dayjs";

interface PropsType {
    leaveBalance: EmployeeLeaveTypeBalance[],
}

export const MyLeaveRequests = ({ leaveBalance }: PropsType) => {
    const { formatMessage: i } = useIntl();
    const currentUserId = useAppSelector(state => state.user.userData?.userId)!
    const [paginationValues, setPaginationValues] = useState({ pageNo: 0, records: 10 });
    const [leaveRequest, setLeaveRequest] = useState<LeaveRequestModel[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [refresh, setRefresh] = useState(false);
    const [selectedLeaveRequestId, setSelectedLeaveRequestId] = useState<string | null>();
    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequestModel | null>(null);
    const [loading, setLoading] = useState(true);

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

    const handleRefresh = () => {
        setRefresh(!refresh);
    }


    const handleLeaveRequestDeletion = async (str: string) => {
        if (str !== "ok" || !selectedLeaveRequestId) {
            return;
        }
        try {
            const { data } = await deleteLeaveRequest(selectedLeaveRequestId);
            if (data.success) {
                setSelectedLeaveRequestId(null);
                setRefresh(!refresh);
                toast.success(i({ id: "TOAST.SUCCESS.LEAVE_REQ_DELETE" }));
            } else {
                toast.error(i({ id: "TOAST.FAILED.LEAVE_REQ_DELETE" }));
            }
        } catch (error) {
            console.error((error as Error).message);
        }

    }

    useEffect(() => {
        setLoading(true);
        const fetchLeaveRequest = async () => {
            const payload: LeaveRequestsFilter = {
                employeeId: currentUserId,
                pageNo: paginationValues.pageNo + 1,
                pageSize: paginationValues.records,
            }
            try {
                const { data } = await getAllLeaveRequest(payload);
                if (data.success) {
                    setLeaveRequest(data.methodResults);
                    setTotalRecords(data.totalRecords);
                }
            } catch (error) {
                console.error((error as Error).message);
            }
            finally {
                setLoading(false);
            }
        }
        fetchLeaveRequest();
    }, [paginationValues, refresh]);


    return (
        <>
            <Card className="p-4">
                <Typography variant="h5" className="mb-2">{i({ id: "LEAVE.APPLIED_LEAVE" })}</Typography>
                <TableContainer className="mb-2">
                    <Table sx={{ minWidth: 800 }} >
                        <TableHead>
                            <TableRow>
                                <TableCell>{i({ id: "LEAVE.DATE" })}</TableCell>
                                <TableCell>{i({ id: "LEAVE.LEAVE_TYPE" })}</TableCell>
                                <TableCell>{i({ id: "LEAVE.TOTAL_DAYS" })}</TableCell>
                                <TableCell>{i({ id: "LEAVE.REASON" })}</TableCell>
                                <TableCell>{i({ id: "LEAVE.STATUS" })}</TableCell>
                                <TableCell>{i({ id: "ACTION" })}</TableCell>
                            </TableRow>
                        </TableHead>
                        {
                            loading ?
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={12} align="center">
                                            <TableSkeleton />
                                        </TableCell>
                                    </TableRow>
                                </TableBody> :

                                <TableBody>
                                    {
                                        leaveRequest.length === 0 ?
                                            <TableRow>
                                                <TableCell colSpan={12} align="center">
                                                    {i({ id: "MESSAGE.NO_DATA_AVAILABLE" })}
                                                </TableCell>
                                            </TableRow>
                                            :
                                            leaveRequest.map((row) => (
                                                <TableRow key={row.leaveRequestId} hover >
                                                    <TableCell>{dateFormatter(row.startDate, "DD MMM YY")} - {dateFormatter(row.endDate, "DD MMM YY")}</TableCell>
                                                    <TableCell>{i({ id: LeaveTypeMapper[row.leaveType] })}</TableCell>
                                                    <TableCell>{`${row.totalDays} ${i({ id: row.totalDays > 1 ? "DAYS" : "DAY" })}`}</TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" sx={{ maxWidth: 200, alignItems: "center" }}>
                                                            <Typography variant="caption" className="text-truncate " >{row.reason}</Typography>
                                                            <ViewLeaveReason reason={row.reason} />
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StyleStatus label={leaveRequestStatusMapper[row.status!]} className={clsx({
                                                            success: row.status === LEAVE_REQUEST_STATUS.APPROVED,
                                                            warning: row.status === LEAVE_REQUEST_STATUS.PENDING,
                                                            danger: row.status === LEAVE_REQUEST_STATUS.REJECTED,
                                                        })} />
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.status === LEAVE_REQUEST_STATUS.PENDING ?
                                                            <>
                                                                <CustomIconButton icon={<Edit />} classNames="me-2" tooltip={i({ id: "TOOLTIP.EDIT_LEAVE_REQUEST" })} handleClick={() => setSelectedLeaveRequest(row)} />
                                                                <CustomIconButton icon={<Delete color="error" />} tooltip={i({ id: "TOOLTIP.DELETE_LEAVE_REQUEST" })} handleClick={() => setSelectedLeaveRequestId(row.leaveRequestId)} />
                                                            </> : "-"
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    }
                                </TableBody>
                        }
                    </Table>
                </TableContainer>
                {totalRecords > 0 && (
                    <Pagination
                        page={paginationValues.pageNo}
                        rowsPerPage={paginationValues.records}
                        setPage={handlePageChange}
                        setRowPerPage={handleRowPerPageChange}
                        totalRecords={totalRecords}
                    />
                )}
            </Card>
            {
                selectedLeaveRequestId &&
                <ConfirmationModal
                    open={true}
                    title={i({ id: "CONFIRMATION.TITLE.DELETE_LEAVE_REQUEST" })}
                    content={i({ id: "CONFIRMATION.CONTENT.DELETE_LEAVE_REQUEST" })}
                    handleClose={() => setSelectedLeaveRequestId(null)}
                    handleConfirmation={handleLeaveRequestDeletion}
                />
            }
            {
                selectedLeaveRequest !== null &&
                <LeaveApplication
                    edit={true}
                    open={true}
                    handleClose={() => setSelectedLeaveRequest(null)}
                    handleRefresh={handleRefresh}
                    initialValues={{
                        leaveRequestId: selectedLeaveRequest.leaveRequestId,
                        employeeId: selectedLeaveRequest.employeeId,
                        leaveType: selectedLeaveRequest.leaveType,
                        totalDays: selectedLeaveRequest.totalDays,
                        isHalfDay: selectedLeaveRequest.isHalfDay,
                        startDate: dayjs(selectedLeaveRequest.startDate),
                        endDate: dayjs(selectedLeaveRequest.endDate),
                        reason: selectedLeaveRequest.reason
                    }}
                    leaveTypeBalance={leaveBalance}
                />
            }

        </>
    )
}