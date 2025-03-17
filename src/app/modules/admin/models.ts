import { ModulePermissoinModel, ResponseData } from "../../../utils/common_types";

export interface RoleModel {
    rolesId: string;
    titles: string;
    description: string;
    isNotEditable: boolean;
    isDefault: boolean;
    userRoles: string[];
  }

  export type GetAllRolesResponseData = ResponseData<RoleModel>;
  export type GetAllModulePermissionData = ResponseData<ModulePermissoinModel>;