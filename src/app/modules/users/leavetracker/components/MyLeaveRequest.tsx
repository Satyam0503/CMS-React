import { useEffect, useState } from "react";
import {
  EmployeeLeaveTypeBalance,
  GetLeaveRequestPayLoad,
  MyLeaveRequestModel,
} from "../../../leaves/model";
import {
  deleteLeaveRequest,
  deleteMyProfileLeaveRequest,
  getMyLeaveRequest,
  getMyProfileLeaveRequest,
} from "../../../leaves/leaveServices";
import {
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  dateFormatter,
  leaveRequestStatusMapper,
} from "../../../../../utils/common";
import { StyleStatus } from "../../../../shared/components/StyledStatus";
import clsx from "clsx";
import { LEAVE_REQUEST_STATUS } from "../../../../../utils/enums";
import { CustomIconButton } from "../../../../shared/components/C_IconButton";
import { Delete, Edit } from "@mui/icons-material";
import { ConfirmationModal } from "../../../../shared/components/ConfirmModal";
import { Pagination } from "../../../../shared/components/Pagination";
import { ViewLeaveReason } from "../../../../shared/components/ViewLeaveReason";
import { toast } from "react-toastify";
import TableSkeleton from "../../../../shared/components/TableSkeleton";
import { LeaveApplication } from "./LeaveApplication";
import dayjs from "dayjs";
import { initialLeaveRequestFilter } from "../../../leaves/components/LeaveRequestFilter";
import { useParams } from "react-router-dom";

interface PropsType {
  leaveBalance: EmployeeLeaveTypeBalance[];
  refresh: boolean;
  handleRefresh: () => void;
}

export const MyLeaveRequests = ({
  leaveBalance,
  refresh,
  handleRefresh,
}: PropsType) => {
  const { formatMessage: i } = useIntl();
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    records: 10,
  });
  const [leaveRequest, setLeaveRequest] = useState<MyLeaveRequestModel[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedLeaveRequestId, setSelectedLeaveRequestId] = useState<string | null>();
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<MyLeaveRequestModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const employeeId = useParams().employeeid;


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

  const handleLeaveRequestDeletion = async (str: string) => {
    if (str !== "ok" || !selectedLeaveRequestId) {
      return;
    }
    try {
      const { data } = employeeId
        ? await deleteLeaveRequest(selectedLeaveRequestId)
        : await deleteMyProfileLeaveRequest(selectedLeaveRequestId);
      if (data.success) {
        setSelectedLeaveRequestId(null);
        handleRefresh;
        toast.success(i({ id: "TOAST.SUCCESS.LEAVE_REQ_DELETE" }));
      } else {
        toast.error(i({ id: "TOAST.FAILED.LEAVE_REQ_DELETE" }));
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  function handleClose() {
    setSelectedLeaveRequest(null);
  }

  useEffect(() => {
    setLoading(true);
    const fetchLeaveRequest = async () => {
      const payload: GetLeaveRequestPayLoad = {
        ...initialLeaveRequestFilter,
        pageNo: paginationValues.pageNo + 1,
        pageSize: paginationValues.records,
        employeeId: employeeId
      };
      try {
        const { data } = employeeId
          ? await getMyLeaveRequest(payload)
          : await getMyProfileLeaveRequest(payload);
        if (data.success) {
          setLeaveRequest(data.methodResults);
          setTotalRecords(data.totalRecords);
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequest();
  }, [employeeId, paginationValues, refresh]);

  return (
    <>
      <Card className="p-4">
        <Typography variant="h5" className="mb-2">
          {i({ id: "LEAVE.LEAVE_HISTORY" })}
        </Typography>
        <TableContainer className="mb-2">
          <Table sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                <TableCell>{i({ id: "LEAVE.DATE" })}</TableCell>
                <TableCell>{i({ id: "LEAVE.LEAVE_TYPE" })}</TableCell>
                <TableCell>{i({ id: "LEAVE.TOTAL_DAYS" })}</TableCell>
                <TableCell>{i({ id: "LEAVE.APPROVAL_STATUS" })}</TableCell>
                <TableCell>{i({ id: "LEAVE.APPROVED_BY" })}</TableCell>
                <TableCell>{i({ id: "LEAVE.COMMENT" })}</TableCell>
                <TableCell>{i({ id: "ACTION" })}</TableCell>
              </TableRow>
            </TableHead>
            {loading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <TableSkeleton />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {leaveRequest.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      {i({ id: "MESSAGE.NO_DATA_AVAILABLE" })}
                    </TableCell>
                  </TableRow>
                ) : (
                  leaveRequest.map((row) => (
                    <TableRow key={row.leaveRequestId} hover>
                      <TableCell>
                        {dateFormatter(row.startDate, "DD MMM YY")} -{" "}
                        {dateFormatter(row.endDate, "DD MMM YY")}
                      </TableCell>
                      <TableCell>{row.leavePolicyName}</TableCell>
                      <TableCell>{`${row.totalDays} ${i({
                        id: row.totalDays > 1 ? "DAYS" : "DAY",
                      })}`}</TableCell>
                      <TableCell>
                        <StyleStatus
                          label={leaveRequestStatusMapper[row.status!]}
                          className={clsx({
                            success:
                              row.status === LEAVE_REQUEST_STATUS.APPROVED,
                            warning:
                              row.status === LEAVE_REQUEST_STATUS.PENDING,
                            danger:
                              row.status === LEAVE_REQUEST_STATUS.REJECTED,
                            info: row.status === LEAVE_REQUEST_STATUS.WITHDRAWN,
                          })}
                        />
                      </TableCell>
                      <TableCell>{row.reviewedBy}</TableCell>
                      <TableCell>
                        {row.comment?.trim().length > 0 ? (
                          <Stack
                            direction="row"
                            sx={{ maxWidth: 200, alignItems: "center" }}
                          >
                            <Typography
                              variant="caption"
                              className="text-truncate "
                            >
                              {row.comment}
                            </Typography>
                            <ViewLeaveReason reason={row.comment} />
                          </Stack>
                        ) : (
                          "_"
                        )}
                      </TableCell>
                      <TableCell>
                        {row.status === LEAVE_REQUEST_STATUS.PENDING ? (
                          <Stack direction="row">
                            <CustomIconButton
                              icon={<Edit />}
                              classNames="me-2"
                              tooltip={i({ id: "TOOLTIP.EDIT_LEAVE_REQUEST" })}
                              handleClick={() => setSelectedLeaveRequest(row)}
                            />
                            <CustomIconButton
                              icon={<Delete color="error" />}
                              tooltip={i({
                                id: "TOOLTIP.DELETE_LEAVE_REQUEST",
                              })}
                              handleClick={() =>
                                setSelectedLeaveRequestId(row.leaveRequestId)
                              }
                            />
                          </Stack>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            )}
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
      {selectedLeaveRequestId && (
        <ConfirmationModal
          open={true}
          title={i({ id: "CONFIRMATION.TITLE.DELETE_LEAVE_REQUEST" })}
          content={i({ id: "CONFIRMATION.CONTENT.DELETE_LEAVE_REQUEST" })}
          handleClose={() => setSelectedLeaveRequestId(null)}
          handleConfirmation={handleLeaveRequestDeletion}
        />
      )}
      {selectedLeaveRequest !== null && (
        <LeaveApplication
          edit={true}
          open={true}
          handleClose={handleClose}
          handleRefresh={handleRefresh}
          initialValues={{
            leaveRequestId: selectedLeaveRequest.leaveRequestId,
            userId: selectedLeaveRequest.userId,
            leavePolicyId: selectedLeaveRequest.leavePolicyId,
            isHalfDay: selectedLeaveRequest.isHalfDay,
            startDate: dayjs(selectedLeaveRequest.startDate),
            endDate: dayjs(selectedLeaveRequest.endDate),
            reason: selectedLeaveRequest.reason,
          }}
          leaveTypeBalance={leaveBalance}
        />
      )}
    </>
  );
};
