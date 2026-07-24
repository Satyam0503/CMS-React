import {
  Autocomplete,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
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
import { Add, Edit } from "@mui/icons-material";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../shared/components/CustomisedButton";

import { AppIconButton, AppSelect, AppTextField } from "../../../shared/components/ui";
import { ModulesName, Permission } from "../../../../utils/enums";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { getAllEmployees } from "../../employees/employeeServices";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { EmployeeLeaveTypeBalance, RequestLeaveModel } from "../model";
import { getEmployeeLeaveBalance } from "../leaveServices";
import { LeaveApplication } from "../../users/leavetracker/components/LeaveApplication";

const emptyLeaveRequest: RequestLeaveModel = {
  isHalfDay: false, startDate: null, endDate: null, reason: "", userId: "", leavePolicyId: "",
};
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
  const [showCreateLeave, setShowCreateLeave] = useState(false);
  const modulePermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const canCreateForEmployee = useMemo(
    () =>
      hasModuleFeaturePermission(ModulesName.LeaveManagement, Permission.Edit, modulePermissions),
    [modulePermissions],
  );
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
      >
        <Typography variant="h5">
          {i({ id: "LEAVE.TITLES.LEAVE_REQUESTS" })}
        </Typography>
        {canCreateForEmployee && (
          <CustomisedButton
            Icon={<Add />}
            label={i({ id: "LEAVE.CREATE_FOR_EMPLOYEE", defaultMessage: "Create Leave for Employee" })}
            handleClick={() => setShowCreateLeave(true)}
          />
        )}
      </Stack>
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
              {canCreateForEmployee && <TableCell>{i({ id: "ACTION" })}</TableCell>}
            </TableRow>
          </TableHead>
          {isLoading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={canCreateForEmployee ? 8 : 7} align="center">
                  <TableSkeleton />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {leaveRequest.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canCreateForEmployee ? 8 : 7} align="center">
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
                    {canCreateForEmployee && (
                      <TableCell>
                        <AppIconButton
                          onClick={() => setSelectedLeaveRequest(row)}
                          disabled={row.status === 4}
                        >
                          <Edit className="fs-20" />
                        </AppIconButton>
                      </TableCell>
                    )}
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
      {showCreateLeave && (
        <CreateEmployeeLeaveModal
          handleClose={() => setShowCreateLeave(false)}
          handleRefresh={handleRefresh}
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


type CreateEmployeeLeaveModalProps = {
  handleClose: () => void;
  handleRefresh: () => void;
};

const CreateEmployeeLeaveModal = ({ handleClose, handleRefresh }: CreateEmployeeLeaveModalProps) => {
  const { formatMessage: i } = useIntl();
  const [employees, setEmployees] = useState<GetAllEmployeeResponseModel[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<GetAllEmployeeResponseModel | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<EmployeeLeaveTypeBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showApplication, setShowApplication] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const { data } = await getAllEmployees({
          pageNo: 1, records: 1000, name: "", departmentId: [], gender: [],
        });
        if (data.success) setEmployees(data.methodResults);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const continueToApplication = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    try {
      const { data } = await getEmployeeLeaveBalance(selectedEmployee.userId);
      if (!data.success || data.methodResults.length === 0) {
        toast.error(i({ id: "VALIDATION_ERR.LEAVE_TYPES_NOT_AVAILABLE" }));
        return;
      }
      setLeaveBalances(data.methodResults);
      setShowApplication(true);
    } finally {
      setLoading(false);
    }
  };

  if (showApplication && selectedEmployee) {
    return (
      <LeaveApplication
        edit={false}
        open
        initialValues={emptyLeaveRequest}
        leaveTypeBalance={leaveBalances}
        targetEmployeeId={selectedEmployee.userId}
        handleClose={handleClose}
        handleRefresh={handleRefresh}
      />
    );
  }

  return (
    <CustomisedModal
      open
      handleClose={handleClose}
      title={i({ id: "LEAVE.SELECT_EMPLOYEE", defaultMessage: "Select Employee" })}
    >
      <Stack spacing={3}>
        <Autocomplete
          options={employees}
          value={selectedEmployee}
          loading={loading}
          getOptionLabel={(option) => `${option.fullName} (${option.employeeId})`}
          isOptionEqualToValue={(option, value) => option.userId === value.userId}
          onChange={(_event, value) => setSelectedEmployee(value)}
          renderInput={(params) => (
            <AppTextField
              {...params}
              label={i({ id: "LEAVE.EMPLOYEE_NAME" })}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Stack direction="row" justifyContent="flex-end" gap={1}>
          <CustomisedButton variant="outlined" label={i({ id: "BUTTON.CANCEL" })} handleClick={handleClose} />
          <CustomisedButton
            label={i({ id: "BUTTON.CONTINUE", defaultMessage: "Continue" })}
            disabled={!selectedEmployee || loading}
            loading={loading}
            handleClick={continueToApplication}
          />
        </Stack>
      </Stack>
    </CustomisedModal>
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
  const [isUpdating, setIsUpdating] = useState(false);

  // console.log(leaveData);

  const handleLeaveStatusUpdate = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
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
      } else {
        toast.error(
          data.message ||
            i({ id: "TOAST.FAILED.UPDATE", defaultMessage: "Unable to update leave status" }),
        );
      }
    } catch (error) {
      console.error((error as Error).message);
      toast.error(i({ id: "TOAST.FAILED.UPDATE", defaultMessage: "Unable to update leave status" }));
    } finally {
      setIsUpdating(false);
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
          <AppSelect
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
          </AppSelect>
        </FormControl>

        <AppTextField
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
            disabled={isUpdating}
            handleClick={handleClose}
          />
          <CustomisedButton
            label={i({ id: "BUTTON.UPDATE" })}
            disabled={isUpdating || leaveRequest.status === leaveData.status}
            loading={isUpdating}
            handleClick={handleLeaveStatusUpdate}
          />
        </Stack>
      </Stack>
    </CustomisedModal>
  );
};
