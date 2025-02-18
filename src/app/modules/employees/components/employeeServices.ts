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


export const addEmployee = async (payload: EmployeeModel) => {
  return postRequest<EmployeeModel, AddEmployeeResponseData>(
    ServiceUrl.ADD_EMPLOYEE,
    payload
  );
};

export const updateEmployee = async (
  payload: EmployeeModel,
  userId: string
) => {
  return postRequest<EmployeeModel, AddEmployeeResponseData>(
    `${ServiceUrl.UPDATE_EMPLOYEE}?userId=${userId}`,
    payload
  );
};

export const deleteEmployee = async (
  employeeId: string
): Promise<AxiosResponse<ApiResponse>> => {
  return postRequest(ServiceUrl.DELETE_EMPLOYEE);
};

export const getAllEmployees = async () => {
  return getRequest<GetAllEmployeeResponseData>(ServiceUrl.GET_ALL_EMPLOYEE);
};

export const getAllRoles = async () => {
  return getRequest<GetAllRolesResponseData>(ServiceUrl.GET_ALL_ROLES);
};
