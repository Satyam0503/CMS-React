import { AxiosResponse } from "axios";
import { getRequest, postRequest } from "../../../server/axios";
import {
  ApiResponse,
  GetAllEmployeeResponseData,
  GetAllRolesResponseData,
} from "../../../utils/common_types";
import { ServiceUrl } from "../../../Constant";

interface GetAllEmployeePayload {
  pageNo: number;
  limit: number;
  name: string;
}

export const addEmployee = async (
  payload: any,
  token: string
): Promise<AxiosResponse<any>> => {
  return postRequest(ServiceUrl.ADD_UPDATE_EMPLOYEE, payload, {}, false, token);
};

export const updateEmployee = async (
  employeeId: string,
  payload: any,
  token: string
): Promise<AxiosResponse<ApiResponse>> => {
  return postRequest(
    `${ServiceUrl.ADD_UPDATE_EMPLOYEE}:${employeeId}`,
    payload,
    {},
    false,
    token
  );
};

export const deleteEmployee = async (
  employeeId: string,
  token: string
): Promise<AxiosResponse<ApiResponse>> => {
  return postRequest(
    `${ServiceUrl.DELETE_EMPLOYEE}:${employeeId}`,
    {},
    {},
    false,
    token
  );
};

export const getAllEmployees = async (
  payload: GetAllEmployeePayload,
  token: string
): Promise<AxiosResponse<GetAllEmployeeResponseData>> => {
  return postRequest(ServiceUrl.GET_ALL_EMPLOYEE, payload, {}, false, token);
};

export const getAllRoles = async (
  token: string
): Promise<AxiosResponse<GetAllRolesResponseData>> => {
  return getRequest(ServiceUrl.GET_ALL_ROLES, {}, token);
};
