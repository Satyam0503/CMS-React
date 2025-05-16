import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  AddEditRoleModel,
  AddEditRoleResponseData,
  DepartmentModel,
  GetAllModulePermissionData,
  GetAllRolesResponseData,
  GetDepartmentResponseModel,
  GetAllModulesInfoResponseModel,
  UpdateModuleAccessResponse,
  GetCompanyDetailsResponse,
} from "./models";

export const getAllRoles = async () => {
  return getRequest<GetAllRolesResponseData>(ServiceUrl.GET_ALL_ROLES);
};
export const getAllModulePermission = async () => {
  return getRequest<GetAllModulePermissionData>(
    ServiceUrl.GET_ALL_MODULE_PERMISSION
  );
};
export const getRolePermissionsById = async (roleId?: string) => {
  return getRequest<GetAllModulePermissionData>(
    ServiceUrl.GET_ROLE_ALL_PERMISSIONS,
    { params: { roleId } }
  );
};

export const addEditRole = async (payload: AddEditRoleModel) => {
  return postRequest<AddEditRoleModel, AddEditRoleResponseData>(
    ServiceUrl.ADD_EDIT_ROLE,
    payload
  );
};

export const getRoleById = async (roleId: string) => {
  return getRequest<GetAllRolesResponseData>(
    `${ServiceUrl.GET_ROLE_BY_ID}/${roleId}`
  );
};

export const changeAppAccess = async (
  roleId: string,
  hasAppAccess: boolean
) => {
  return patchRequest<boolean, ApiResponse>(
    `${ServiceUrl.CHANGE_APP_ACCESS}/${roleId}`,
    hasAppAccess
  );
};

// departments
export const getAllDepartments = async () => {
  return getRequest<GetDepartmentResponseModel>(ServiceUrl.GET_DEPARTMENTLIST);
};

export const updateDepartment = async (payload: DepartmentModel[]) => {
  return postRequest<DepartmentModel[], ApiResponse>(
    ServiceUrl.UPDATE_DEPARTMENT,
    payload
  );
};

export const deleteDepartment = async (departmentId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_DEPARTMENT}/${departmentId}`
  );
};

// application modules
export const updateModuleAccess = async (moduleId: string) => {
  return patchRequest<{}, UpdateModuleAccessResponse>(
    `${ServiceUrl.UPDATE_MODULE_ACCESS}/${moduleId}`
  );
};

//modules
export const getAllModulesInfo = async () => {
  return getRequest<GetAllModulesInfoResponseModel>(
    ServiceUrl.GET_ALL_MODULES_INFO
  );
};

// company details
export const getCompanyDetails = async () => {
  return getRequest<GetCompanyDetailsResponse>(ServiceUrl.GET_COMPANY_DETAILS);
};

export const updateCompanyDetails = async (payload: FormData) => {
  return postRequest<FormData, GetCompanyDetailsResponse>(
    ServiceUrl.UPDATE_COMPANY_DETAILS,
    payload,
    {},
    true
  );
};
