import { getRequest, postRequest } from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { AddEditRoleModel, AddEditRoleResponseData, DepartmentModel, GetAllModulePermissionData, GetAllRolesResponseData, GetDepartmentResponseModel } from "./models";

export const getAllRoles = async () => {
  return getRequest<GetAllRolesResponseData>(ServiceUrl.GET_ALL_ROLES);
};
export const getAllModulePermission = async ()=>{
    return getRequest<GetAllModulePermissionData>(ServiceUrl.GET_ALL_MODULE_PERMISSION);
}
export const getRolePermissionsById = async (roleId:string| null) =>{
  return getRequest<GetAllModulePermissionData>(ServiceUrl.GET_ROLE_ALL_PERMISSIONS,{params:{roleId}});
}

export const addEditRole = async (payload:AddEditRoleModel)=>{
  return postRequest<AddEditRoleModel,AddEditRoleResponseData>(ServiceUrl.ADD_EDIT_ROLE,payload)
}

// departments

export const getAllDepartments = async ()=>{
  return getRequest<GetDepartmentResponseModel>(ServiceUrl.GET_DEPARTMENTLIST);
}

export const addDepartment = async (payload:DepartmentModel)=>{
  return postRequest<DepartmentModel,ApiResponse>(ServiceUrl.ADD_DEPARTMENT,payload);
}