import {
  Card,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { LEAVE_REQUEST_STATUS } from "../../../../utils/enums";
import { LeaveRequestStatusTypes } from "../../../../utils/constant/Constant";
import {
  GetLeaveRequestPayLoad,
  LeaveRequestApprovalPayload,
  LeaveRequestModel,
} from "../model";
import { Pagination } from "../../../shared/components/Pagination";
import { getAllLeaveRequest, updateLeaveRequestStatus } from "../leaveServices";
import clsx from "clsx";
import { dateFormatter } from "../../../../utils/common";
import TableSkeleton from "../../../shared/components/TableSkeleton";
import { ViewLeaveReason } from "../../../shared/components/ViewLeaveReason";
import { AvatarCell } from "../../../shared/components/AvatarCell";
import { toast } from "react-toastify";
import {
  initialLeaveRequestFilter,
  LeaveRequestFilter,
} from "./LeaveRequestFilter";
import { useAppSelector } from "../../../Redux/hooks";
import { StyleStatus } from "../../../shared/components/StyledStatus";
import { Edit } from "@mui/icons-material";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../shared/components/CustomisedButton";

export const LeaveRequest = () => {
  const { formatMessage: i } = useIntl();
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequestModel[]>([]);
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    records: 10,
  });
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] =
    useState<LeaveRequestModel | null>(null);
  const appliedLeaveRequestFilter =
    useAppSelector((state) => state.filters.leaveRequest) ??
    initialLeaveRequestFilter;

  useEffect(() => {
    setLoading(true);
    const fetchLeaveRequest = async () => {
      const payload: GetLeaveRequestPayLoad = {
        pageNo: paginationValues.pageNo + 1,
        pageSize: paginationValues.records,
        ...appliedLeaveRequestFilter,
      };
      try {
        const { data } = await getAllLeaveRequest(payload);

        if (data.success) {
          // console.log(data.methodResults);
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
  }, [paginationValues, appliedLeaveRequestFilter, refresh]);

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
  };
  return (
    <Card className="p-4 gap-4 d-flex flex-column flex-grow-1">
      <Typography variant="h5">
        {i({ id: "LEAVE.TITLES.LEAVE_REQUESTS" })}
      </Typography>
      <LeaveRequestFilter />
      <Divider className="mt-2" />
      <TableContainer className="mb-2 h-100">
        <Table sx={{ minWidth: 1200 }}>
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
          {isLoading ? (
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
                      <AvatarCell
                        avatarSrc={row.profileUrl}
                        title={row.employeeName}
                        subTitle={row.jobRole}
                      />
                    </TableCell>
                    <TableCell>{`${row.leavePolicyName} (${row.code})`}</TableCell>
                    <TableCell>{`${dateFormatter(
                      row.startDate,
                      "DD MMM YY"
                    )} - ${dateFormatter(
                      row.endDate,
                      "DD MMM YY"
                    )}`}</TableCell>
                    <TableCell>{`${row.totalDays} ${i({
                      id: row.totalDays > 1 ? "DAYS" : "DAY",
                    })}`}</TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        sx={{ maxWidth: 200, alignItems: "center" }}
                      >
                        <Typography
                          variant="caption"
                          className="text-truncate "
                        >
                          {row.reason}
                        </Typography>
                        <ViewLeaveReason reason={row.reason} />
                      </Stack>
                    </TableCell>
                    <TableCell>{row.reviewedBy}</TableCell>
                    <TableCell>
                      <StyleStatus
                        className={clsx({
                          success: row.status === LEAVE_REQUEST_STATUS.APPROVED,
                          warning: row.status === LEAVE_REQUEST_STATUS.PENDING,
                          danger: row.status === LEAVE_REQUEST_STATUS.REJECTED,
                          info: row.status === LEAVE_REQUEST_STATUS.WITHDRAWN,
                        })}
                        label={
                          LeaveRequestStatusTypes.find(
                            (type) => type.value === row.status
                          )?.label ?? ""
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => setSelectedLeaveRequest(row)}
                        disabled={row.status === 4}
                      >
                        <Edit className="fs-20" />
                      </IconButton>
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
      {selectedLeaveRequest && (
        <LeaveApprovalModal
          open={true}
          handleClose={() => setSelectedLeaveRequest(null)}
          leaveRequest={selectedLeaveRequest}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
};

type PropsType = {
  open: boolean;
  handleClose: () => void;
  leaveRequest: LeaveRequestModel;
  refresh: () => void;
};
export const LeaveApprovalModal = ({
  open,
  handleClose,
  leaveRequest,
  refresh,
}: PropsType) => {
  const { formatMessage: i } = useIntl();
  const [leaveData, setLeaveData] = useState({
    status: leaveRequest.status,
    comment: leaveRequest.comment,
  });

  // console.log(leaveData);

  const handleLeaveStatusUpdate = async () => {
    try {
      const payload: LeaveRequestApprovalPayload = {
        ...leaveData,
      };

      const { data } = await updateLeaveRequestStatus(
        leaveRequest.leaveRequestId,
        payload
      );
      if (data.success) {
        toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
        refresh();
        handleClose();
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<number>
  ) => {
    const { name, value } = e.target;
    setLeaveData({
      ...leaveData,
      [name]: value,
    });
    console.log(leaveData);
  };
  return (
    <CustomisedModal
      open={open}
      handleClose={handleClose}
      title={i({ id: "LEAVE.TITLES.UPDATE_LEAVE_STATUS" })}
    >
      <Stack spacing={2}>
        <FormControl className="mt-2" fullWidth>
          <InputLabel id="leave-request-status">
            {i({ id: "LEAVE.APPROVAL_STATUS" })}
          </InputLabel>
          <Select
            labelId="leave-request-status"
            label={i({ id: "LEAVE.APPROVAL_STATUS" })}
            size="small"
            name="status"
            value={leaveData.status}
            onChange={handleChange}
          >
            {LeaveRequestStatusTypes.map((item) => (
              <MenuItem
                value={item.value}
                key={item.id}
                disabled={
                  (leaveRequest.status !== LEAVE_REQUEST_STATUS.PENDING &&
                    item.value === LEAVE_REQUEST_STATUS.PENDING) ||
                  item.value === LEAVE_REQUEST_STATUS.WITHDRAWN
                }
              >
                {i({ id: item.label })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          type="text"
          name="comment"
          label={i({ id: "LEAVE.COMMENT" })}
          rows={3}
          placeholder={i({ id: "LEAVE.COMMENT" })}
          value={leaveData.comment}
          onChange={handleChange}
        />

        <Stack className="flex-row gap-2 justify-content-end">
          <CustomisedButton
            variant="outlined"
            label={i({ id: "BUTTON.CLOSE" })}
            handleClick={handleClose}
          />
          <CustomisedButton
            label={i({ id: "BUTTON.UPDATE" })}
            disabled={leaveRequest.status === leaveData.status}
            handleClick={handleLeaveStatusUpdate}
          />
        </Stack>
      </Stack>
    </CustomisedModal>
  );
};
