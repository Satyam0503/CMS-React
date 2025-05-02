import {
    ModulePermissoinModel,
    PermissionModel,
    ResponseData,
  } from "../../../utils/common_types";

  export interface GenderModel {
    gender: string;
    count: number;
  }

  export type getAllGenderDetailsResponseData = ResponseData<GenderModel>;
  