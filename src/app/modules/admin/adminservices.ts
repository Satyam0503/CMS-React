import { getRequest } from "../../../server/axios";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { GetAllModulePermissionData, GetAllRolesResponseData } from "./models";

export const getAllRoles = async () => {
  return getRequest<GetAllRolesResponseData>(ServiceUrl.GET_ALL_ROLES);
};
export const getAllModulePermission = async ()=>{
    return getRequest<GetAllModulePermissionData>(ServiceUrl.GET_ALL_MODULE_PERMISSION);
}