import dayjs from "dayjs";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { EmployeeLeaveBalance } from "../employees/models";
import {
  LeaveBalanceFilter,
  GetLeaveBalanceResponse,
  GetLeaveTypeResponse,
  LeaveType,
  GetLeaveRequestsResponse,
  GetEmployeeLeaveBalanceResponse,
  RequestLeaveModel,
  GetLeaveRequestPayLoad,
  GetMyLeaveRequestsResponse,
  LeaveRequestApprovalPayload,
  GetLeaveRequestsSummary,
  MonthlyLeaveTakenSummary,
  LeavePolicyModel,
  EmployeeLeaveBalanceFilter,
  EmployeeLeaveBalanceData,
} from "./model";

export const createUpdateLeaveType = (payload: LeaveType) => {
  return postRequest<LeaveType, ApiResponse>(
    ServiceUrl.CREATE_UPDATE_LEAVE_TYPE,
    payload
  );
};
export const getLeavePolicies = (status?: boolean) => {
  return postRequest<
    unknown,
    ResponseData<Omit<LeavePolicyModel, "applicableTo">>
  >(ServiceUrl.GET_LEAVE_POLICIES, {}, { params: { status: status } });
};

export const getLeaveTypes = (isActive?: boolean) => {
  if (isActive) {
    return getRequest<GetLeaveTypeResponse>(ServiceUrl.GET_LEAVE_TYPES, {
      params: { isActive },
    });
  }
  return getRequest<GetLeaveTypeResponse>(ServiceUrl.GET_LEAVE_TYPES);
};

export const createLeavePolicy = (payload: LeavePolicyModel) => {
  return postRequest<LeavePolicyModel, ApiResponse>(
    ServiceUrl.CREATE_NEW_LEAVE_POLICY,
    payload
  );
};

export const updateLeavePolicy = (payload: LeavePolicyModel) => {
  return postRequest<LeavePolicyModel, ApiResponse>(
    ServiceUrl.UPDATE_LEAVE_POLICY,
    payload
  );
};

export const getLeaveBalance = (payload: LeaveBalanceFilter) => {
  return postRequest<LeaveBalanceFilter, GetLeaveBalanceResponse>(
    ServiceUrl.GET_LEAVE_BALANCE,
    payload
  );
};

const serializeLeaveRequestPayload = (payload: RequestLeaveModel) => ({
  ...payload,
  startDate: payload.startDate
    ? dayjs(payload.startDate).startOf("day").format("YYYY-MM-DD")
    : null,
  endDate: payload.endDate
    ? dayjs(payload.endDate).startOf("day").format("YYYY-MM-DD")
    : null,
});

export const createLeaveRequest = (payload: RequestLeaveModel) => {
  return postRequest<RequestLeaveModel, ApiResponse>(
    ServiceUrl.CREATE_LEAVE_REQUEST,
    serializeLeaveRequestPayload(payload) as unknown as RequestLeaveModel
  );
};

export const createEmployeeLeaveRequest = (
  employeeId: string,
  payload: RequestLeaveModel
) => {
  return postRequest<RequestLeaveModel, ApiResponse>(
    `${ServiceUrl.CREATE_EMPLOYEE_LEAVE_REQUEST}/${employeeId}`,
    serializeLeaveRequestPayload(payload) as unknown as RequestLeaveModel
  );
};

export const createMyProfileLeaveRequest = (payload: RequestLeaveModel) => {
  return postRequest<RequestLeaveModel, ApiResponse>(
    "api/LeaveManagement/me/requests",
    serializeLeaveRequestPayload(payload) as unknown as RequestLeaveModel
  );
};

export type WorkFromHomeRequestPayload = {
  fromDate: string;
  toDate: string;
  durationType: "FullDay" | "FirstHalf";
  reasonCode: string;
  reasonText: string;
};

export const createWorkFromHomeRequest = (payload: WorkFromHomeRequestPayload) => {
  return postRequest<WorkFromHomeRequestPayload, ApiResponse>(
    "api/wfh/requests",
    payload
  );
};

export type WorkFromHomeEmployeeAllocation = {
  employeeId: string;
  weeklyLimit: number;
};

export const getWorkFromHomeEmployeeAllocations = () => {
  return getRequest<{ methodResults?: WorkFromHomeEmployeeAllocation[] }>(
    "api/wfh/allocations"
  );
};

export const saveWorkFromHomeEmployeeAllocation = (
  payload: WorkFromHomeEmployeeAllocation
) => {
  return putRequest<WorkFromHomeEmployeeAllocation, ApiResponse>(
    "api/wfh/allocations",
    payload
  );
};

export const updateLeaveRequest = (payload: RequestLeaveModel) => {
  return postRequest<RequestLeaveModel, ApiResponse>(
    ServiceUrl.UPDATE_LEAVE_REQUEST,
    serializeLeaveRequestPayload(payload) as unknown as RequestLeaveModel
  );
};

export const updateMyProfileLeaveRequest = (payload: RequestLeaveModel) => {
  return patchRequest<RequestLeaveModel, ApiResponse>(
    "api/LeaveManagement/me/requests",
    serializeLeaveRequestPayload(payload) as unknown as RequestLeaveModel
  );
};

export const getAllLeaveRequest = (payload: GetLeaveRequestPayLoad) => {
  return postRequest<GetLeaveRequestPayLoad, GetLeaveRequestsResponse>(
    ServiceUrl.GET_LEAVE_REQUESTS,
    payload
  );
};

export const getMyLeaveRequest = (payload: GetLeaveRequestPayLoad) => {
  return postRequest<GetLeaveRequestPayLoad, GetMyLeaveRequestsResponse>(
    ServiceUrl.GET_MY_LEAVE_REQUEST,
    payload
  );
};

export const getMyProfileLeaveRequest = (payload: GetLeaveRequestPayLoad) => {
  return postRequest<GetLeaveRequestPayLoad, GetMyLeaveRequestsResponse>(
    "api/LeaveManagement/me/requests/search",
    payload
  );
};

export const deleteLeaveRequest = (leaveRequestId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_LEAVE_REQUEST}/${leaveRequestId}`
  );
};

export const deleteMyProfileLeaveRequest = (leaveRequestId: string) => {
  return deleteRequest<ApiResponse>(
    `api/LeaveManagement/me/requests/${leaveRequestId}`
  );
};

export const getEmployeeLeaveBalance = (employeeId: string) => {
  return getRequest<GetEmployeeLeaveBalanceResponse>(
    `${ServiceUrl.GET_EMP_LEAVE_BALANCE}/${employeeId}`
  );
};

export const getMyProfileLeaveBalance = () => {
  return getRequest<GetEmployeeLeaveBalanceResponse>(
    "api/LeaveManagement/me/balances"
  );
};

export const updateLeaveRequestStatus = (
  leaveRequestId: string,
  payload: LeaveRequestApprovalPayload
) => {
  return patchRequest<LeaveRequestApprovalPayload, ApiResponse>(
    `${ServiceUrl.UPDATE_LEAVE_REQUEST_STATUS}/${leaveRequestId}/Status`,
    payload
  );
};

export const getLeaveRequestSummary = () => {
  return getRequest<GetLeaveRequestsSummary>(
    ServiceUrl.GET_LEAVE_REQUEST_SUMMARY
  );
};

export const getMonthlyLeaveTakenSummary = (year: number) => {
  return getRequest<ResponseData<MonthlyLeaveTakenSummary>>(
    `${ServiceUrl.GET_MONTHLY_LEAVE_TAKEN_SUMMARY}/${year}`
  );
};
export const updateEmployeeLeaveBalance = (payload: EmployeeLeaveBalance) => {
  return postRequest<EmployeeLeaveBalance, ApiResponse>(
    ServiceUrl.UPDATE_EMPLOYEE_LEAVE_BALANCE,
    payload
  );
};

export const getAllEmployeeLeaveBalance = (
  payload: EmployeeLeaveBalanceFilter
) => {
  return postRequest<
    EmployeeLeaveBalanceFilter,
    ResponseData<EmployeeLeaveBalanceData>
  >(ServiceUrl.GET_ALL_EMPLOYEE_LEAVE_BALANCE, payload);
};
