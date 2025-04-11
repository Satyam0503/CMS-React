import { ResponseData } from "../../../utils/common_types";

export interface GetAllEmployeeResponseModel {
  userId: string;
  firstName:string;
  lastName: string;
  email: string;
  employeeId: string;
  jobRole: string;
  department: string;
  phoneNumber: string;
  profileUrl: string|null;
  fullProfileUrl:string| null;
  dateOfBirth :string ;
}


export type GetAllEmployeeResponseData = ResponseData<GetAllEmployeeResponseModel>;