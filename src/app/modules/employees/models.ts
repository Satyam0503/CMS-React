import { ResponseData } from "../../../utils/common_types";

export interface GetAllEmployeeResponseModel {
  userId: string;
  fullName:string;
  email: string;
  employeeId: string;
  jobRole: string;
  department: string;
  phoneNumber: string;
  fullProfileUrl:string| null;
  dateOfBirth :string ;
}

export interface EmployeeFilterModel {
  departmentId: string[];
}

export interface GetAllEmployeePayloadModel {
  name: string;
  departmentId?: string[];
}

export type GetAllEmployeeResponseData = ResponseData<GetAllEmployeeResponseModel>;