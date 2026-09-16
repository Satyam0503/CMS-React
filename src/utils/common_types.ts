import { ReactNode } from "react";
import { LANGUAGE, Modules, ModulesName, ModulesTitles, Permission } from "./enums";
import {
  ApplicationFilterModel,
  JobsFilterModel,
  ProcessLogFilterModel,
} from "../app/modules/recruitment/models";
import { EmployeeFilterModel } from "../app/modules/employees/models";
import { NoticeBoardFilterModel } from "../app/modules/noticeboard/models";
import { HolidayFilterModel } from "../app/modules/holidays/models";
import { LeaveRequestsFilterModel } from "../app/modules/leaves/model";
import { Dayjs } from "dayjs";

export interface ApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
}

export interface CreatePasswordModel {
  newPassword: string;
  token: string;
}

export interface UserModel {
  userId: string;
  roleType: number;
  companyName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  // Localized job title — already resolved by the backend using Accept-Language.
  // Empty/absent when the employee has no job role assigned.
  jobTitle?: string | null;
  profileImage: string | null;
  companyLogo: string | null;
  defaultLanguage: string;
  applicationLanguage: string[];
  modulePermission: string[];
}

export interface ModulePermissoinModel {
  moduleName: string;
  moduleConstant: string;
  permissions: PermissionModel[];
}

export interface PermissionModel {
  permissionName: string;
  rolePermissionId: string;
  modulePermissionId: number;
  rolesId: string;
  hasAccess: boolean;
  permissionConstant: string;
}

/* export type NoticeModel = {
  id: string;
  target: string;
  type: string;
  group: string;
  message: string;
};
*/
export type AppLanguageProps = {
  selectedLang: LANGUAGE;
};

export type NotificationRedirectOption = {
  targetPath: string;
  data: any;
};

export type LeavesModel = {
  id: string;
  target: string;
  type: string;
  group: string;
  message: string;
};
export type AttendanceModel = {
  [x: string]: any;
  id: string;
  target: string;
  type: string;
  group: string;
  message: string;
};

export interface ResetPasswordModel {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  type: string;
}

export type ColumnListTypes = {
  id: string;
  label: string;
  align?: "center" | "left" | "right" | "inherit" | "justify";
  minWidth?: number;
  width?: number;
  build?: any;
  sorting?: boolean;
  format?: (value: any) => any;
  avatarCell?: (row: any) => ReactNode;
  permission?: boolean;
};

export interface ResponseData<T> {
  items: never[];
  message: string;
  success: boolean;
  totalRecords: number;
  statusCode: number;
  methodResult: T;
  methodResults: T[];
}

export interface SideBarTabListProps {
  id: Modules;
  title: ModulesTitles;
  constant: ModulesName;
  route: string;
  icon: JSX.Element;
  hasSubTabs?: boolean;
  subTabs?: Omit<SideBarTabListProps, "subTabs" | "hasSubTabs">[];
  isDefault: boolean;
  adminOnly?: boolean;
  permission?: Permission;
}

export interface FiltersType {
  application: ApplicationFilterModel | null;
  jobs: JobsFilterModel | null;
  processLog: ProcessLogFilterModel | null;
  employee: EmployeeFilterModel | null;
  holiday: HolidayFilterModel | null;
  noticeBoard: NoticeBoardFilterModel | null;
  leaveRequest: LeaveRequestsFilterModel | null;
}

export type WithChildren = {
  children?: ReactNode;
};

export interface BaseModel {
  companyId: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

export interface TabModel {
  to: string;
  title: string;
  icon?: ReactNode | null;
  tabId: number;
  isActive?: boolean;
}

export type EmployeeSearchModel = {
  userId: string;
  firstName: string;
  lastName: string;
  empId: string | null;
  jobRole: Record<string, string> | null;
  fullProfileUrl: string | null;
};

export type FilterComponentProps = {
  id?: string;
  open: boolean;
  handleClose: () => void;
  anchorEl: null | Element;
  children?: React.ReactNode;
};

export interface PaginationModel {
  pageNo: number;
  pageSize: number;
}

export interface DateRangeFilter {
  filterFrom: null | Dayjs | string;
  filterTo: null | Dayjs | string;
}

export type Nullable<T> = { [K in keyof T]: T[K] | null };

export type GetUserDetailsResponseData = ResponseData<UserModel>;
