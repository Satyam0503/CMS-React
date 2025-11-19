import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { LEAVE_REQUEST_STATUS } from "../../../utils/enums";
import {
  LeaveBalanceFilter,
  GetLeaveBalanceResponse,
  GetLeaveTypeResponse,
  LeaveBalanceRequestModel,
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
  GetLeavePolicyData,
} from "./model";

export const createUpdateLeaveType = (payload: LeaveType) => {
  return postRequest<LeaveType, ApiResponse>(
    ServiceUrl.CREATE_UPDATE_LEAVE_TYPE,
    payload
  );
};

export const getAllLeavePolicies = ()=>{
  return postRequest<[],GetLeavePolicyData>(ServiceUrl.GET_ALL_LEAVE_POLICIES)
}

export const getLeaveTypes = (isActive?: boolean) => {
  if (isActive) {
    return getRequest<GetLeaveTypeResponse>(ServiceUrl.GET_LEAVE_TYPES, {
      params: { isActive },
    });
  }
  return getRequest<GetLeaveTypeResponse>(ServiceUrl.GET_LEAVE_TYPES);
};

export const createLeavePolicy = (payload: LeavePolicyModel)=>{
  return postRequest<LeavePolicyModel, ApiResponse>(ServiceUrl.CREATE_NEW_LEAVE_POLICY, payload)
}

export const updateLeavePolicy = (payload: LeavePolicyModel)=>{
  return postRequest<LeavePolicyModel, ApiResponse>(ServiceUrl.UPDATE_LEAVE_POLICY, payload)
}

export const createUpdateLeaveBalance = (payload: LeaveBalanceRequestModel) => {
  return postRequest<LeaveBalanceRequestModel, ApiResponse>(
    ServiceUrl.CREATE_UPDATE_LEAVE_BALANCE,
    payload
  );
};

export const getLeaveBalance = (payload: LeaveBalanceFilter) => {
  return postRequest<LeaveBalanceFilter, GetLeaveBalanceResponse>(
    ServiceUrl.GET_LEAVE_BALANCE,
    payload
  );
};

export const createLeaveRequest = (payload: RequestLeaveModel) => {
  return postRequest<RequestLeaveModel, ApiResponse>(
    ServiceUrl.CREATE_LEAVE_REQUEST,
    payload
  );
};

export const updateLeaveRequest = (payload: RequestLeaveModel) => {
  return postRequest<RequestLeaveModel, ApiResponse>(
    ServiceUrl.UPDATE_LEAVE_REQUEST,
    payload
  );
}

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

export const deleteLeaveRequest = (leaveRequestId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_LEAVE_REQUEST}/${leaveRequestId}`
  );
};

export const getEmployeeLeaveBalance = (employeeId: string) => {
  return getRequest<GetEmployeeLeaveBalanceResponse>(
    `${ServiceUrl.GET_EMP_LEAVE_BALANCE}/${employeeId}`
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
