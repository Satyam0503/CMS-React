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
  hasAppAccess: boolean;
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
  departmentId?: string;
  titles: MultilingualModel[];
  isActive: boolean;
}

export interface MultilingualModel {
  language: string;
  label: string;
}

export interface AttributeModel {
  id: string;
  titles: MultilingualModel[];
  isActive: boolean;
}

export interface ModulesInfoModel {
  moduleId: string;
  moduleName: string;
  moduleConstant: string;
  isAccessible: boolean;
}

export type GetAllRolesResponseData = ResponseData<RoleModel>;
export type GetAllModulePermissionData = ResponseData<ModulePermissoinModel>;
export type AddEditRoleResponseData = ResponseData<AddEditRoleModel>;
export type GetDepartmentResponseModel = ResponseData<DepartmentModel>;
export type GetAllModulesInfoResponseModel = ResponseData<ModulesInfoModel>;
export type UpdateModuleAccessResponse = ResponseData<Array<string>>;
