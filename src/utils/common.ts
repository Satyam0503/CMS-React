import dayjs, { Dayjs } from "dayjs";
import DOMPurify from "dompurify";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import {
  EmployeeModel,
  FiltersType,
  ModulePermissoinModel,
  NotificationRedirectOption,
  PermissionModel,
} from "./common_types";
import {
  ApplicantStatus,
  ApplicationStatus,
  CommentAction,
  LEAVE_REQUEST_STATUS,
  LEAVE_TYPE,
  ModulesName,
  NOTICE_TYPE,
  NOTIFICATION_TYPE,
  Permission,
} from "./enums";
import {
  APP_FILTER_KEY,
  NoticeTypes,
  SideBarTabList,
} from "./constant/Constant";
import { ReactNode } from "react";
import { NotificationModel } from "../app/modules/users/models";
import { NavigateFunction } from "react-router-dom";

export const dateFormatter = (
  date: Date | Dayjs | string | null,
  format: string
) => {
  if (!date) {
    return "NA";
  }
  return dayjs(date).format(format);
};

export const relativeTimeFormatter = (date: Dayjs | string) => {
  const daysDiff = dayjs().diff(date, "day");
  if (daysDiff > 3) {
    return dayjs(date).format("DD MMM YYYY hh:mm A");
  }
  return dayjs(date).fromNow();
};

export const employeesListMapperforExport = (
  employeesList: EmployeeModel[]
) => {
  const mappedData = employeesList.map((employee) => {
    return {
      Id: employee.userId,
      "First Name": employee.firstName,
      "Last Name": employee.lastName,
      Email: employee.email,
      "Phone Number": employee.phoneNumber,
      Gender: employee.gender,
      "Date of Birth": dateFormatter(employee.dateOfBirth, "DD MMMM YYYY"),
      "Date of Joining": dateFormatter(employee.dateOfJoining, "DD MMMM YYYY"),
      Department: employee.department,
      Address: employee.address,
    };
  });
  return mappedData;
};

export const applicationStatusMapper: {
  [index: number]: string;
} = {
  [ApplicationStatus.New]: "APPLICATION.STATUS.NEW",
  [ApplicationStatus.InProgress]: "APPLICATION.STATUS.INPROGRESS",
  [ApplicationStatus.OnHold]: "APPLICATION.STATUS.ONHOLD",
  [ApplicationStatus.Shortlisted]: "APPLICATION.STATUS.SHORTLISTED",
  [ApplicationStatus.Selected]: "APPLICATION.STATUS.SELECTED",
  [ApplicationStatus.Rejected]: "APPLICATION.STATUS.REJECTED",
};

export const applicantStatusDecoder: {
  [index: number]: string;
} = {
  [ApplicantStatus.Active]: "APPLICANT.STATUS.ACTIVE",
  [ApplicantStatus.InActive]: "APPLICANT.STATUS.INACTIVE",
};

export const noticeTypeDecoder: {
  [index: number]: string;
} = {
  [NOTICE_TYPE.GENERAL]: "NOTICE_TYPE.GENERAL",
  [NOTICE_TYPE.IMPORTANT]: "NOTICE_TYPE.IMPORTANT",
  [NOTICE_TYPE.URGENT]: "NOTICE_TYPE.URGENT",
};

export const commentActionEncoderForApplicationStatus = (
  activityStatus: number
) => {
  switch (activityStatus) {
    case ApplicationStatus.InProgress:
      return CommentAction.InProgress;
    case ApplicationStatus.OnHold:
      return CommentAction.OnHold;
    case ApplicationStatus.Shortlisted:
      return CommentAction.Shortlisted;
    case ApplicationStatus.Selected:
      return CommentAction.Selection;
    case ApplicationStatus.Rejected:
      return CommentAction.Rejection;
    default:
      return CommentAction.InProgress;
  }
};

export const commentActionMapper: { [index: number]: string } = {
  [CommentAction.InProgress]: "COMMENT.ACTION.INPROGRESS",
  [CommentAction.OnHold]: "COMMENT.ACTION.ONHOLD",
  [CommentAction.Shortlisted]: "COMMENT.ACTION.SHORTLISTED",
  [CommentAction.Selection]: "COMMENT.ACTION.SELECTION",
  [CommentAction.Rejection]: "COMMENT.ACTION.REJECTION",
  [CommentAction.Edit]: "COMMENT.ACTION.EDIT",
  [CommentAction.Process]: "COMMENT.ACTION.PROCESS",
};

export const leaveRequestStatusMapper: { [index: number]: string } = {
  [LEAVE_REQUEST_STATUS.PENDING]: "PENDING",
  [LEAVE_REQUEST_STATUS.APPROVED]: "APPROVED",
  [LEAVE_REQUEST_STATUS.REJECTED]: "REJECTED",
};

export const LeaveTypeMapper: { [index: number]: string } = {
  [LEAVE_TYPE.SICK_LEAVE]: "SICK_LEAVE",
  [LEAVE_TYPE.CASUAL_LEAVE]: "CASUAL_LEAVE",
  [LEAVE_TYPE.EARNED_LEAVE]: "EARNED_LEAVE",
  [LEAVE_TYPE.MATERNITY_LEAVE]: "MATERNITY_LEAVE",
};

export const statusEncoder = (status: string) => {
  switch (status) {
    case "Active":
      return true;
    case "Inactive":
      return false;
    default:
      return false;
  }
};
export const statusDecoder = (status: boolean) => {
  switch (status) {
    case true:
      return "ACTIVE";
    case false:
      return "INACTIVE";
    default:
      return "";
  }
};

export const getDateDiffInYears = (from: Dayjs, to: Dayjs = dayjs()) => {
  return dayjs(to).diff(from, "years");
};

export const convertMonthsToYear = (months: number) => {
  let years = Math.round(months / 12);
  let suffix = years > 1 ? "Years" : "Year";
  return years + " " + suffix;
};

export const checkPermissionForModulesFeatureAccess = (
  requiredPermission: string,
  userModulePermissions: string[]
) => {
  return userModulePermissions.findIndex((x) => x == requiredPermission) > -1;
};

export const findUserDefaultTab = (userModulePermissions: string[]) => {
  const defaultTab = SideBarTabList.find((tab) => {
    if (tab.hasSubTabs) {
      const defaultSubTab = tab.subTabs?.find((subTabs) => {
        return checkPermissionForModulesFeatureAccess(
          `${subTabs.constant}.${Permission.View}`,
          userModulePermissions
        );
      });
      return defaultSubTab ? true : false;
    }
    return checkPermissionForModulesFeatureAccess(
      `${tab.constant}.${Permission.View}`,
      userModulePermissions
    );
  });

  if (!defaultTab) {
    return "/error/";
  }
  return defaultTab.route;
};

export const getModulePermissions = (
  moduleName: ModulesName,
  modulesPermissions: string[]
) => {
  const allowedPermission = modulesPermissions.filter((permission) =>
    permission.includes(moduleName)
  );
  return allowedPermission;
};

export const hasModuleFeaturePermission = (
  moduleName: ModulesName,
  permission: Permission,
  modulesPermissions: string[]
) => {
  if (modulesPermissions.length === 0) {
    return false;
  }
  const modulePermisson = `${moduleName}.${permission}`;
  return (
    modulesPermissions.findIndex(
      (permission) => permission === modulePermisson
    ) > -1
  );
};

export const sortAscendingOrder = <Rows>(arr: Rows[], key: keyof Rows) => {
  const columnValueType = typeof arr[0][key];
  if (columnValueType === "number") {
    arr.sort((a, b) => (a[key] as number) - (b[key] as number));
    return arr;
  }
  if (columnValueType === "string") {
    arr.sort((a, b) =>
      (a[key] as string)
        .toLowerCase()
        .localeCompare((b[key] as string).toLowerCase())
    );
    return arr;
  }
  return arr;
};

export const sortingDescendingOrder = <Rows>(arr: Rows[], key: keyof Rows) => {
  const columnValueType = typeof arr[0][key];
  if (columnValueType === "number") {
    arr.sort((a, b) => (b[key] as number) - (a[key] as number));
    return arr;
  }
  if (columnValueType === "string") {
    arr.sort((a, b) =>
      (b[key] as string)
        .toLowerCase()
        .localeCompare((a[key] as string).toLowerCase())
    );
    return arr;
  }
  return arr;
};

// function handleEmployeeExport() {
//   const mappedEmployeeData = employeesListMapperforExport(employeeList);
//   const worksheet = XLSX.utils.json_to_sheet(mappedEmployeeData);
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
//   XLSX.writeFile(workbook, "Employees.xlsx");
// }

export const blockInvalidCharOnNumberField = (
  event: React.KeyboardEvent<HTMLElement>
) => ["e", "E", "+", "-"].includes(event.key) && event.preventDefault();

// filter helper
export const getAppliedFilters = () => {
  const savedFilters = localStorage.getItem(APP_FILTER_KEY);
  const appliedfilters: FiltersType = savedFilters
    ? JSON.parse(savedFilters)
    : {
        application: null,
        jobs: null,
        processLog: null,
        employee: null,
        noticeBoard: null,
      };
  return appliedfilters;
};

export const setLocalFilter = (filters: FiltersType) => {
  if (!localStorage) {
    return;
  }
  localStorage.setItem(APP_FILTER_KEY, JSON.stringify(filters));
};

export const clearAllLocalFilter = () => {
  if (!localStorage) {
    return;
  }
  localStorage.removeItem(APP_FILTER_KEY);
};

export const countAppliedFilter = (filter: Record<string, any> | null) => {
  if (!filter || Object.keys(filter).length === 0) {
    return 0;
  } else {
    let count = 0;

    Object.keys(filter).forEach((element) => {
      if (filter[element] !== null) {
        if (Array.isArray(filter[element])) {
          count += Boolean(filter[element].length) ? 1 : 0;
        } else if (typeof filter[element] === "string") {
          count += Boolean(filter[element]) ? 1 : 0;
        } else if (typeof filter[element] === "number") {
          count += filter[element] >= 0 ? 1 : 0;
        }
      }
    });
    return count;
  }
};

export const addCurrentTimeToDate = (date: Dayjs | null) => {
  const currentDateInMs = dayjs().valueOf();
  const currentDateWithoutTime = dayjs().startOf("day").valueOf();
  const diffInMs = currentDateInMs - currentDateWithoutTime;
  return dayjs(date).startOf("day").add(diffInMs, "milliseconds").toISOString();
};

export const sanitizeHtmlContent = (htmlString: string) => {
  return DOMPurify.sanitize(htmlString);
};

export const removeUnwantedString = (htmlstring: string) => {
  return htmlstring.replace(/<p><br><\/p>/g, "");
};

export const getKeyForTableRow = <Row>(row: Row, keyName: keyof Row) => {
  return row[keyName] as string;
};

export const flatRolePermissionList = (
  rolePermissionList: ModulePermissoinModel[]
) => {
  const updatedRolePermission: PermissionModel[] = [];
  rolePermissionList.forEach((module) => {
    module.permissions.forEach((permission) => {
      updatedRolePermission.push(permission);
    });
  });
  return updatedRolePermission;
};

export const redirectUserToTargetUrl = (
  notification: NotificationModel,
  navigate: NavigateFunction
) => {
  const redirectOption: NotificationRedirectOption = {
    targetPath: "",
    data: null,
  };
  switch (notification.notificationTypes) {
    case NOTIFICATION_TYPE.NOTICE: {
      redirectOption.targetPath = "/noticeboard/notices";
      redirectOption.data = notification.targetId;
      break;
    }
  }
  navigate(redirectOption.targetPath, {
    state: redirectOption.data,
    replace: true,
  });
};
