import { deleteRequest, postRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  EditEmployeeResponseData,
  GetAllEmployeePayloadModel,
  GetAllEmployeeResponseData,
  InviteEmployeeResponse,
  InviteNewEmployeeModel,
} from "./models";
import { EditEmployeePayloadModel } from "../users/models";

export const updateEmployee = async (
  payload: EditEmployeePayloadModel,
  userId: string
) => {
  return postRequest<EditEmployeePayloadModel, EditEmployeeResponseData>(
    `${ServiceUrl.UPDATE_EMPLOYEE}?userId=${userId}`,
    payload
  );
};

export const deleteEmployee = async (employeeId: string) => {
  return deleteRequest<ApiResponse>(ServiceUrl.DELETE_EMPLOYEE, {
    params: { employeeId },
  });
};

export const getAllEmployees = async (
  payload: GetAllEmployeePayloadModel | null = null
) => {
  return postRequest<
    GetAllEmployeePayloadModel | null,
    GetAllEmployeeResponseData
  >(ServiceUrl.GET_ALL_EMPLOYEE, payload);
};

export const inviteNewEmployee = (payload: InviteNewEmployeeModel) => {
  return postRequest<
    InviteNewEmployeeModel,
    ResponseData<InviteEmployeeResponse>
  >(ServiceUrl.INVITE_NEW_EMPLOYEE, payload);
};

export const resendInvitationLink = (userId: string) => {
  return postRequest<undefined, ApiResponse>(
    `${ServiceUrl.RESEND_INVITE_LINK}/${userId}`
  );
};
