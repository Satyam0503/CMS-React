import dayjs, { Dayjs } from "dayjs";
import DOMPurify from "dompurify";

import {
  EmployeeModel,
  FiltersType,
  ModulePermissoinModel,
  PermissionModel,
} from "./common_types";
import {
  ApplicantStatus,
  ApplicationStatus,
  CommentAction,
  ModulesName,
  Permission,
} from "./enums";
import { APP_FILTER_KEY, SideBarTabList } from "./constant/Constant";
export const dateFormatter = (
  date: Date | Dayjs | string | null,
  format: string
) => {
  if (!date) {
    return "NA";
  }
  return dayjs(date).format(format);
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
  [ApplicationStatus.New]: "New",
  [ApplicationStatus.InProgress]: "In Progress",
  [ApplicationStatus.OnHold]: "On Hold",
  [ApplicationStatus.Shortlisted]: "Shortlisted",
  [ApplicationStatus.Selected]: "Selected",
  [ApplicationStatus.Rejected]: "Rejected",
};

export const applicationStatusClassMapper: {
  [index: number]: string;
} = {
  [ApplicationStatus.New]: "info",
  [ApplicationStatus.InProgress]: "warning",
  [ApplicationStatus.OnHold]: "warning",
  [ApplicationStatus.Shortlisted]: "warning",
  [ApplicationStatus.Selected]: "success",
  [ApplicationStatus.Rejected]: "danger",
};

export const getApplicationStatusClass = (applicationStatus: number) => {
  return applicationStatusClassMapper[applicationStatus];
};

export const applicantStatusDecoder: {
  [index: number]: string;
} = {
  [ApplicantStatus.InActive]: "Inactive",
  [ApplicantStatus.Active]: "Active",
};

const applicantStatusClassMapper: {
  [index: number]: string;
} = {
  [ApplicantStatus.InActive]: "danger",
  [ApplicantStatus.Active]: "success",
};

export const getApplicantStatusClass = (applicantStatus: number) => {
  return applicantStatusClassMapper[applicantStatus] || "";
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

export const commentActionDecoder = (commentAction: number) => {
  switch (commentAction) {
    case CommentAction.InProgress:
      return "In Process";
    case CommentAction.OnHold:
      return "On Hold";
    case CommentAction.Shortlisted:
      return "Shortlisted";
    case CommentAction.Selection:
      return "Selection";
    case CommentAction.Rejection:
      return "Rejection";
    case CommentAction.Edit:
      return "Edit";
    case CommentAction.Process:
      return "Process";
    default:
      "Process";
  }
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
      return "Active";
    case false:
      return "Inactive";
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
  moduleName: ModulesName,
  requiredPermission: Permission,
  userModulePermissions: ModulePermissoinModel[]
) => {
  const module = userModulePermissions.find(
    (module) => module.moduleConstant === moduleName
  );
  if (!module) {
    return false;
  }
  const hasPermission = module.permissions.find(
    (permission) => permission.permissionConstant === requiredPermission
  );
  if (!hasPermission) {
    return false;
  }
  return hasPermission.hasAccess;
};

export const findUserDefaultTab = (
  userModulePermissions: ModulePermissoinModel[]
) => {
  const defaultTab = SideBarTabList.find((tab) => {
    if (tab.hasSubTabs) {
      const defaultSubTab= tab.subTabs?.find(subTabs=>{
        return checkPermissionForModulesFeatureAccess(subTabs.title,Permission.View,userModulePermissions);
      })
      return defaultSubTab ? true: false;
    }
    return (
      checkPermissionForModulesFeatureAccess(
        tab.title,
        Permission.View,
        userModulePermissions
      ) === true
    );
  });

  if (!defaultTab) {
    return "/error/";
  }
  return defaultTab.route;
};

export const getModulePermissions = (
  moduleName: ModulesName,
  modulesPermissions: ModulePermissoinModel[]
) => {
  const allowedPermission: string[] = [];
  const hasModuleAccess = modulesPermissions.find(
    (module) => module.moduleConstant === moduleName
  );
  if (hasModuleAccess) {
    hasModuleAccess.permissions.forEach((permission) => {
      if (permission.hasAccess) {
        allowedPermission.push(permission.permissionConstant);
      }
    });
  }
  return allowedPermission;
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
        processLog:null,
      };
  return appliedfilters;
};

export const setLocalFilter = (filters: FiltersType) => {
  if (localStorage) {
    localStorage.setItem(APP_FILTER_KEY, JSON.stringify(filters));
  } else {
    console.log("Unable to access localstorage");
  }
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
