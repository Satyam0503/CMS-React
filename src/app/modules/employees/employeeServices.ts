import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  BulkImportEmployeesRequest,
  BulkImportEmployeesResponse,
  CreateEmployeeSalary,
  CreateEmployeeSalaryResponseData,
  EditEmployeeResponseData,
  GetAllEmployeePayloadModel,
  GetAllEmployeeResponseData,
  InviteEmployeeResponse,
  InviteNewEmployeeModel,
} from "./models";
import { EditEmployeePayloadModel } from "../users/models";
import { GetAllDepartmentDetailsResponseData } from "../dashboard/model";

export const updateEmployee = async (
  payload: EditEmployeePayloadModel,
  userId: string,
) => {
  return postRequest<EditEmployeePayloadModel, EditEmployeeResponseData>(
    `${ServiceUrl.UPDATE_EMPLOYEE}?userId=${userId}`,
    payload,
  );
};

export type EditOwnProfilePayloadModel = Pick<
  EditEmployeePayloadModel,
  | "firstName"
  | "lastName"
  | "gender"
  | "dateOfBirth"
  | "phoneNumber"
  | "bloodGroup"
  | "personalEmail"
  | "emergencyContact"
  | "address"
>;

// Lets a user update their own profile without requiring the Employees module's Edit
// permission (that permission governs managing *other* employees). Always targets the
// caller's own account server-side; only accepts non-privileged, self-service fields.
export const updateOwnProfile = async (payload: EditOwnProfilePayloadModel) => {
  return postRequest<EditOwnProfilePayloadModel, EditEmployeeResponseData>(
    ServiceUrl.EDIT_OWN_PROFILE,
    payload,
  );
};

export const updateSalary = async (
  payload: CreateEmployeeSalary,
  userId: string,
  employeeId: string,
) => {
  return postRequest<CreateEmployeeSalary, CreateEmployeeSalaryResponseData>(
    `${ServiceUrl.UPDATE_SALARY}`,
    payload,
  );
};

export const deleteEmployee = async (employeeId: string) => {
  return deleteRequest<ApiResponse>(ServiceUrl.DELETE_EMPLOYEE, {
    params: { employeeId },
  });
};

export const getAllEmployees = async (
  payload: GetAllEmployeePayloadModel | null = null,
) => {
  return postRequest<
    GetAllEmployeePayloadModel | null,
    GetAllEmployeeResponseData
  >(ServiceUrl.GET_ALL_EMPLOYEE, payload);
};

export const getDirectoryDepartments = () =>
  getRequest<GetAllDepartmentDetailsResponseData>(
    ServiceUrl.GET_DIRECTORY_DEPARTMENTS,
  );

export const inviteNewEmployee = (payload: InviteNewEmployeeModel) => {
  return postRequest<
    InviteNewEmployeeModel,
    ResponseData<InviteEmployeeResponse>
  >(ServiceUrl.INVITE_NEW_EMPLOYEE, payload);
};

export const resendInvitationLink = (userId: string) => {
  return postRequest<undefined, ApiResponse>(
    `${ServiceUrl.RESEND_INVITE_LINK}/${userId}`,
  );
};

export const bulkImportEmployees = (payload: BulkImportEmployeesRequest) => {
  return postRequest<BulkImportEmployeesRequest, ResponseData<BulkImportEmployeesResponse>>(
    ServiceUrl.BULK_IMPORT_EMPLOYEES,
    payload,
  );
};
