import {
  BaseModel,
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
  titles: Record<string, string>;
  isActive: boolean;
}

export interface MultilingualModel {
  language: string;
  label: string;
}

export type DepartmentRequestModel = Pick<
  DepartmentModel,
  "departmentId" | "isActive"
> & {
  titles: MultilingualModel[];
};

export interface ModulesInfoModel {
  moduleId: string;
  moduleName: string;
  moduleConstant: string;
  isAccessible: boolean;
}

export type CompanyModel = {
  status?: boolean;
  companyName: string;
  companyLogo: string | null;
  defaultLanguage: string;
  applicationLanguage: string[];
  primaryContact: string;
  country: string;
  companyId?: string;
  careerSlug?: string;
  publicCompanyCode?: string;
  employeeIdPrefix?: string;
  autoGenerateEmployeeId?: boolean;
  careerPortalEnabled?: boolean;
  address: string;
  appTheme?: "glass" | "slate" | "dawn" | "blush";
};

export type JobTitleResponseModel = Pick<
  DepartmentModel,
  "isActive" | "titles"
> & {
  jobTitleId?: string;
  departmentId?: string;
};
export type JobTitleRequestModel = Pick<
  JobTitleResponseModel,
  "isActive" | "jobTitleId" | "departmentId"
> & {
  titles: MultilingualModel[];
};

export type CompanyCustomAttributeModel = {
  customAttributeId: string;
  customAttributeTitle: Record<string, string>;
  customAttributeNumber: number;
};
export type CustomAttributeValueModel = {
  customAttributeValueId?: string;
  isActive: boolean;
  titles: Record<string, string>;
};

export type CustomAttributeModel = CompanyCustomAttributeModel & {
  customAttributeValues: CustomAttributeValueModel[];
};

type CustomAttributeValuePayload = Omit<CustomAttributeValueModel, "titles"> & {
  titles: MultilingualModel[];
};

export type UpdateCustomAttributePayload = {
  customAttributeId: string;
  customAttributeTitle: MultilingualModel[];
  customAttributeValues: CustomAttributeValuePayload[];
};

export type CompanyInfoModel = BaseModel & CompanyModel;

export type OutletContextType = {
  updateAttribute: (attribute: CompanyCustomAttributeModel) => void;
  removeAttribute: (customAttributeId: string) => void;
};

export type GetAllRolesResponseData = ResponseData<RoleModel>;
export type GetAllModulePermissionData = ResponseData<ModulePermissoinModel>;
export type AddEditRoleResponseData = ResponseData<AddEditRoleModel>;
export type GetDepartmentResponseModel = ResponseData<DepartmentModel>;
export type GetAllModulesInfoResponseModel = ResponseData<ModulesInfoModel>;
export type UpdateModuleAccessResponse = ResponseData<Array<string>>;
export type GetCompanyDetailsResponse = ResponseData<CompanyInfoModel>;
export type GetJobTitleResponse = ResponseData<JobTitleResponseModel>;
export type GetCompanyCustomAttribute =
  ResponseData<CompanyCustomAttributeModel>;
export type GetCustomAttributeByIdResponse = ResponseData<CustomAttributeModel>;
export type CreateNewCustomAttributeResponse =
  ResponseData<CompanyCustomAttributeModel>;
