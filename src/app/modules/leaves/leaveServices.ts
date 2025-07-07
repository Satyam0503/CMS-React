import { getRequest, postRequest } from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { GetLeaveTypeResponse, LeaveBalanceFilter, LeaveType } from "./model";

export const createUpdateLeaveType = (payload: LeaveType) => {
  return postRequest<LeaveType, ApiResponse>(
    ServiceUrl.CREATE_UPDATE_LEAVE_TYPE,
    payload
  );
};

export const getLeaveTypes = (isActive?: boolean) => {
  if (isActive) {
    return getRequest<GetLeaveTypeResponse>(ServiceUrl.GET_LEAVE_TYPES, {
      params: { isActive },
    });
  }
  return getRequest<GetLeaveTypeResponse>(ServiceUrl.GET_LEAVE_TYPES);
};

// export const getLeaveBalance = (payload: LeaveBalanceFilter) => {
//   return postRequest<LeaveBalanceFilter>(ServiceUrl.GET_LEAVE_BALANCE, payload);
// };
