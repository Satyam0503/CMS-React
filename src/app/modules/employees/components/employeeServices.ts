import { AxiosResponse } from "axios";
import { getRequest, postRequest } from "../../../../server/axios";
import {
  AddEmployeeResponseData,
  ApiResponse,
  EmployeeModel,
  GetAllEmployeeResponseData,
  GetAllRolesResponseData,
} from "../../../../utils/common_types";
import { ServiceUrl } from "../../../../utils/constant/Constant";

interface GetAllEmployeePayload {
  pageNo: number;
  limit: number;
  name: string;
}

export const addEmployee = (payload: EmployeeModel, token: string) => {
  return postRequest<EmployeeModel, AddEmployeeResponseData>(
    ServiceUrl.ADD_EMPLOYEE,
    payload,
    {},
    false,
    token
  );
};

export const updateEmployee = async (payload: EmployeeModel, token: string,userId:string) => {
  return postRequest<EmployeeModel, AddEmployeeResponseData> (`${ServiceUrl.UPDATE_EMPLOYEE}?userId=${userId}`,payload,{},false,token);
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

export const getAllEmployees = async (token: string) => {
  return getRequest<GetAllEmployeeResponseData>(
    ServiceUrl.GET_ALL_EMPLOYEE,
    {},
    token
  );
};

export const getAllRoles = async (token: string) => {
  return getRequest<GetAllRolesResponseData>(
    ServiceUrl.GET_ALL_ROLES,
    {},
    token
  );
};
