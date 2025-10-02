import { deleteRequest, postRequest } from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  EditEmployeeResponseData,
  EmployeeModel,
  GetAllEmployeePayloadModel,
  GetAllEmployeeResponseData,
} from "./models";
import { EditEmployeePayloadModel } from "../users/models";

export const addEmployee = async (payload: EmployeeModel) => {
  return postRequest<EmployeeModel, ApiResponse>(
    ServiceUrl.ADD_EMPLOYEE,
    payload
  );
};

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
