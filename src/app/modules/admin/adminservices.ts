import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
  putRequest,
} from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  AddEditRoleModel,
  AddEditRoleResponseData,
  GetAllModulePermissionData,
  GetAllRolesResponseData,
  GetDepartmentResponseModel,
  GetAllModulesInfoResponseModel,
  UpdateModuleAccessResponse,
  GetCompanyDetailsResponse,
  DepartmentRequestModel,
  JobTitleRequestModel,
  GetJobTitleResponse,
  GetCompanyCustomAttribute,
  GetCustomAttributeByIdResponse,
  CreateNewCustomAttributeResponse,
  UpdateCustomAttributePayload,
} from "./models";

export const getAllRoles = async (excludeAdmin: boolean = false) => {
  return getRequest<GetAllRolesResponseData>(
    excludeAdmin
      ? `${ServiceUrl.GET_ALL_ROLES}?excludeAdmin=${true}`
      : ServiceUrl.GET_ALL_ROLES
  );
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
export const getAllDepartments = async (isActive: boolean = false) => {
  return getRequest<GetDepartmentResponseModel>(
    isActive
      ? `${ServiceUrl.GET_DEPARTMENTLIST}?isActive=${isActive}`
      : ServiceUrl.GET_DEPARTMENTLIST
  );
};

export const updateDepartment = async (payload: DepartmentRequestModel[]) => {
  return postRequest<DepartmentRequestModel[], ApiResponse>(
    ServiceUrl.UPDATE_DEPARTMENT,
    payload
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

// company jobTitles

export const getJobTitles = async (isActive: boolean = false) => {
  return getRequest<GetJobTitleResponse>(
    isActive
      ? `${ServiceUrl.GET_JOB_TITLE}?isActive=${isActive}`
      : ServiceUrl.GET_JOB_TITLE
  );
};

export const addUpdateJobTitles = async (payload: JobTitleRequestModel[]) => {
  return postRequest<JobTitleRequestModel[], ApiResponse>(
    ServiceUrl.ADD_UPDATE_JOB_TITLE,
    payload
  );
};

export const deleteAttributeItem = async (url: string, itemId: string) => {
  return deleteRequest<ApiResponse>(`${url}/${itemId}`);
};

// custom attributes
export const getAllCustomAttributes = async () => {
  return getRequest<GetCompanyCustomAttribute>(
    ServiceUrl.GET_COMPANY_CUSTOM_ATTRIBUTE
  );
};

export const getCustomAttributeById = async (
  customAttributeId: string,
  active: boolean = false
) => {
  return getRequest<GetCustomAttributeByIdResponse>(
    active
      ? `${ServiceUrl.GET_CUSTOM_ATTRIBUTE_BY_ID}/${customAttributeId}?active=${active}`
      : `${ServiceUrl.GET_CUSTOM_ATTRIBUTE_BY_ID}/${customAttributeId}`
  );
};

export const createNewCustomAttribute = async () => {
  return postRequest<any, CreateNewCustomAttributeResponse>(
    ServiceUrl.CREATE_NEW_CUSTOM_ATTRIBUTE,
    {}
  );
};

export const updateCustomAttribute = (
  payload: UpdateCustomAttributePayload
) => {
  return putRequest<UpdateCustomAttributePayload, ApiResponse>(
    ServiceUrl.UPDATE_CUSTOM_ATTRIBUTE,
    payload
  );
};
