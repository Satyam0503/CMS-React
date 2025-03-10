import { AxiosResponse } from "axios";
import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import {
  AddEmployeeResponseData,
  ApiResponse,
  EmployeeModel,
  GetAllEmployeeResponseData,
  GetAllRolesResponseData,
} from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";

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

export const deleteEmployee = async (employeeId: string) => {
  return deleteRequest<ApiResponse>(ServiceUrl.DELETE_EMPLOYEE, {
    params: { employeeId },
  });
};

export const getAllEmployees = async (
  pageNo: number = 0,
  records: number = 0
) => {
  return getRequest<GetAllEmployeeResponseData>(
    `${ServiceUrl.GET_ALL_EMPLOYEE}?pageNo=${pageNo}&records=${records}`
  );
};

export const getAllRoles = async () => {
  return getRequest<GetAllRolesResponseData>(ServiceUrl.GET_ALL_ROLES);
};
