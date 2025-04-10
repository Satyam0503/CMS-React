import {
  ModulePermissoinModel,
  PermissionModel,
  ResponseData,
} from "../../../utils/common_types";

export interface RoleModel {
  rolesId: string;
  titles: string;
  description: string;
  isNotEditable: boolean;
  isDefault: boolean;
  userRoles: string[];
  hasAppAccess:boolean;
}
export interface AddEditRoleModel {
  roleId?: string | null;
  roleTitle: string;
  description: string;
  rolePermissions: PermissionModel[];
  hasAppAccess: boolean;
  userRoles: string[];
}

export interface DepartmentModel {
  departmentId?:string;
  departmentName: string;
  departmentDescription: string;
}

export interface CompanyMasterTabModel {
  to: string;
  title: string;
  component: JSX.Element;
  icon: JSX.Element;
  tabId:number;
}

export type GetAllRolesResponseData = ResponseData<RoleModel>;
export type GetAllModulePermissionData = ResponseData<ModulePermissoinModel>;
export type AddEditRoleResponseData = ResponseData<AddEditRoleModel>;
export type GetDepartmentResponseModel = ResponseData<DepartmentModel>
