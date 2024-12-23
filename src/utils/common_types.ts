import { Dayjs } from "dayjs";

export interface ApiResponse {
   success:boolean;
   message?:string;
   statusCode?:number;
}

export interface RolesType {
    id: string
    roleName: string,
    description: string,
    isDeleted: boolean| null,
    createdAt: string,
    updatedAt: string
}

export interface EmployeesDataTypes {
  id:string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  role: string;
  employeeId: string;
  department: string;
  dateOfBirth: Dayjs | null;
  reportingManager: string;
  teamLead: string;
  phoneNumber: string;
  bloodGroup: string;
  status: string,
  address: string,
  jobRole: string,
  dateOfJoining: Dayjs | null,
  personalEmail: string,
  emergencyContact: string,
  skills?: null | string[],
  summary?:string| null,
  createdAt?: string,
  updatedAt?:string
  profilePicture?: string | File | null,
}


// Api respone date types

export interface ResponseData<T> {
    message:string;
    success:boolean;
    methodResult:T;
    // methodResults:T[];
    statusCode?:number;
}

export type GetAllEmployeeResponseData = ResponseData<{
    totalEmployees:number;
    record:EmployeesDataTypes[];
}>

export type GetAllRolesResponseData = ResponseData<RolesType[]>