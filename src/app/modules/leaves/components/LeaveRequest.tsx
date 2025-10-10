import { Card, Divider, IconButton, MenuItem, Select, SelectChangeEvent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl"
import { LEAVE_REQUEST_STATUS } from "../../../../utils/enums";
import { LeaveRequestStatusTypes } from "../../../../utils/constant/Constant";
import { GetLeaveRequestPayLoad, LeaveRequestModel } from "../model";
import { Pagination } from "../../../shared/components/Pagination";
import { getAllLeaveRequest, updateLeaveRequestStatus } from "../leaveServices";
import clsx from "clsx";
import { dateFormatter, LeaveTypeMapper } from "../../../../utils/common";
import TableSkeleton from "../../../shared/components/TableSkeleton";
import { ViewLeaveReason } from "../../../shared/components/ViewLeaveReason";
import { AvatarCell } from "../../../shared/components/AvatarCell";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";
import { toast } from "react-toastify";
import { initialLeaveRequestFilter, LeaveRequestFilter } from "./LeaveRequestFilter";
import { useAppSelector } from "../../../Redux/hooks";
import { StyleStatus } from "../../../shared/components/StyledStatus";
import { Edit } from "@mui/icons-material";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../shared/components/CustomisedButton";

export const LeaveRequest = () => {
    const { formatMessage: i } = useIntl();
    const [leaveRequest, setLeaveRequest] = useState<LeaveRequestModel[]>([]);
    const [paginationValues, setPaginationValues] = useState({ pageNo: 0, records: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [isOpen, setOpen] = useState(false);
    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<string | null>(null);
    const [status, setStatus] = useState<number | null>(null);
    const appliedLeaveRequestFilter = useAppSelector(state => state.filters.leaveRequest) ?? initialLeaveRequestFilter;

    useEffect(() => {
        setLoading(true);
        const fetchLeaveRequest = async () => {
            const payload: GetLeaveRequestPayLoad = {
                pageNo: paginationValues.pageNo + 1,
                pageSize: paginationValues.records,
                ...appliedLeaveRequestFilter
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
    }, [paginationValues, appliedLeaveRequestFilter]);

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

    const handleLeaveStatusChange = async (str: string) => {
        if (str !== "ok" || !selectedLeaveRequest || !status) {
            return;
        }
        try {
            const { data } = await updateLeaveRequestStatus(selectedLeaveRequest, status);
            if (data.success) {
                toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
                setLeaveRequest(leaveRequest.map(request => {
                    if (request.leaveRequestId !== selectedLeaveRequest) {
                        return request;
                    }
                    return {
                        ...request,
                        status: status
                    }
                }))
                handleConfirmationClose();
            }
        } catch (error) {
            console.error((error as Error).message);
        }
    }
    const handleConfirmationClose = () => {
        setOpen(false);
        setSelectedLeaveRequest(null);
        setStatus(null);
    }

    const handleChange = (e: SelectChangeEvent<number>, currentStatus: LEAVE_REQUEST_STATUS, leaveRequestId: string) => {
        if (currentStatus !== e.target.value) {
            setSelectedLeaveRequest(leaveRequestId);
            setStatus(e.target.value as number);
            setOpen(true);
        }
    }

    return (
        <Card className="p-4 gap-4 d-flex flex-column flex-grow-1">
            <Typography variant="h5">{i({ id: "LEAVE.TITLES.LEAVE_REQUESTS" })}</Typography>
            <LeaveRequestFilter />
            <Divider className="mt-2" />
            <TableContainer className="mb-2 h-100">
                <Table sx={{ minWidth: 1200 }} >
                    <TableHead>
                        <TableRow>
                            <TableCell>{i({ id: "LEAVE.EMPLOYEE_NAME" })}</TableCell>
                            <TableCell>{i({ id: "LEAVE.LEAVE_TYPE" })}</TableCell>
                            <TableCell>{i({ id: "LEAVE.LEAVE_PERIOD" })}</TableCell>
                            <TableCell>{i({ id: "LEAVE.DURATION" })}</TableCell>
                            <TableCell>{i({ id: "LEAVE.REASON" })}</TableCell>
                            <TableCell>{i({ id: "LEAVE.APPROVED_BY" })}</TableCell>
                            <TableCell>{i({ id: "LEAVE.APPROVAL_STATUS" })}</TableCell>
                            <TableCell>{i({ id: "ACTION" })}</TableCell>
                        </TableRow>
                    </TableHead>
                    {
                        isLoading ?
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
                                                <TableCell >
                                                    <AvatarCell
                                                        avatarSrc={row.profileUrl}
                                                        title={row.employeeName}
                                                        subTitle={row.jobRole}
                                                    />
                                                </TableCell>
                                                <TableCell>{i({ id: LeaveTypeMapper[row.leaveType] })}</TableCell>
                                                <TableCell>{`${dateFormatter(row.startDate, "DD MMM YY")} - ${dateFormatter(row.endDate, "DD MMM YY")}`}</TableCell>
                                                <TableCell>{`${row.totalDays} ${i({ id: row.totalDays > 1 ? "DAYS" : "DAY" })}`}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" sx={{ maxWidth: 200, alignItems: "center" }}>
                                                        <Typography variant="caption" className="text-truncate " >{row.reason}</Typography>
                                                        <ViewLeaveReason reason={row.reason} />
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>{row.reviewedBy}</TableCell>
                                                <TableCell >
                                                    <StyleStatus
                                                        className={clsx({
                                                            "success": row.status === LEAVE_REQUEST_STATUS.APPROVED,
                                                            "warning": row.status === LEAVE_REQUEST_STATUS.PENDING,
                                                            "danger": row.status === LEAVE_REQUEST_STATUS.REJECTED,
                                                        })}
                                                        label={LeaveRequestStatusTypes.find(type => type.value === row.status)?.label ?? ""}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => setSelectedLeaveRequest(row.leaveRequestId)}>
                                                        <Edit className="fs-20" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                }
                            </TableBody>
                    }
                </Table>
            </TableContainer>
            {
                totalRecords > 0 && (
                    <Pagination
                        page={paginationValues.pageNo}
                        rowsPerPage={paginationValues.records}
                        setPage={handlePageChange}
                        setRowPerPage={handleRowPerPageChange}
                        totalRecords={totalRecords}
                    />
                )
            }
            {
                isOpen && <ConfirmationModal
                    open={true}
                    title={i({ id: "CONFIRMATION.TITLE.LEAVE_STATUS_CHANGE" })}
                    content={i({ id: "CONFIRMATION.CONTENT.LEAVE_STATUS_CHANGE" })}
                    handleClose={handleConfirmationClose}
                    handleConfirmation={handleLeaveStatusChange}
                    ok_btn={true}
                />
            }
            {
                selectedLeaveRequest && <LeaveApprovalModal open={true} handleClose={() => setSelectedLeaveRequest(null)} />
            }
        </Card >
    )
}


type PropsType = {
    open: boolean;
    handleClose: () => void;
}
export const LeaveApprovalModal = ({ open, handleClose }: PropsType) => {
    const { formatMessage: i } = useIntl();
    return (
        <CustomisedModal open={open} handleClose={handleClose}>
            <Stack>
                <CustomisedButton
                    label={i({ id: "BUTTON.UPDATE" })}
                />
            </Stack>
        </CustomisedModal>
    )
}