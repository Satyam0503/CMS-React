import { getRequest, postRequest } from "../../../server/axios";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { AddEditRoleModel, AddEditRoleResponseData, GetAllModulePermissionData, GetAllRolesResponseData } from "./models";

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