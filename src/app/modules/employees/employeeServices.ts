import { AxiosResponse } from "axios";
import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import {
  AddEmployeeResponseData,
  ApiResponse,
  EmployeeModel,
} from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { GetAllEmployeePayloadModel, GetAllEmployeeResponseData } from "./models";

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
  filters?: GetAllEmployeePayloadModel,
  pageNo: number = 0,
  records: number = 0
) => {
  return postRequest<GetAllEmployeePayloadModel, GetAllEmployeeResponseData>(
    `${ServiceUrl.GET_ALL_EMPLOYEE}?pageNo=${pageNo}&records=${records}`, filters
  );
};


