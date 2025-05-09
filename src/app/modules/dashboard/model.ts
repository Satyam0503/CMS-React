import {
    ModulePermissoinModel,
    PermissionModel,
    ResponseData,
  } from "../../../utils/common_types";
  import { MultilingualModel } from "../admin/models"

  export interface GenderModel {
    gender: string;
    count: number;
  }

  export interface DepartmentModel {
    label: string,
    departmentId: string;
    employeeCount: number;
  }

  export type getAllGenderDetailsResponseData = ResponseData<GenderModel>;
  export type getAllDepartmentDetailsResponseData = ResponseData<DepartmentModel>;