import { EmployeeModel, ResponseData } from "../../../utils/common_types";
import { EmployeeByIdResponse } from "../users/models";

export interface GetAllEmployeeResponseModel {
  userId: string;
  fullName: string;
  email: string;
  employeeId: string;
  jobRole: string;
  department: string;
  phoneNumber: string;
  fullProfileUrl: string | null;
  dateOfBirth: string;
}

export interface EmployeeFilterModel {
  departmentId: string[];
  gender: string[];
}

export interface GetAllEmployeePayloadModel {
  name: string;
  pageNo: number;
  records: number;
  departmentId: string[];
  gender: string[];
}


export type AddEmployeeResponseData = ResponseData<EmployeeModel>;
export type EditEmployeeResponseData = ResponseData<EmployeeByIdResponse>;

export type GetAllEmployeeResponseData = ResponseData<GetAllEmployeeResponseModel>;
