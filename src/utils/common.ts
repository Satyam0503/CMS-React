import dayjs, { Dayjs } from "dayjs";
import { EmployeeModel, FiltersType, ModulePermissoinModel } from "./common_types";
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

export const applicationStatusMapper : {
  [index:number]:string
} = {
  [ApplicationStatus.New]:"New",
  [ApplicationStatus.InProgress]:"In Progress",
  [ApplicationStatus.OnHold]:"On Hold",
  [ApplicationStatus.Shortlisted]:"Shortlisted",
  [ApplicationStatus.Selected]:"Selected",
  [ApplicationStatus.Rejected]:"Rejected",
}

export const applicationStatusClassMapper :{
  [index:number]:string
} ={
  [ApplicationStatus.New]:"info",
  [ApplicationStatus.InProgress]:"warning",
  [ApplicationStatus.OnHold]:"warning",
  [ApplicationStatus.Shortlisted]:"warning",
  [ApplicationStatus.Selected]:"success",
  [ApplicationStatus.Rejected]:"danger",
}

export const getApplicationStatusClass = (applicationStatus: number) => {
  return applicationStatusClassMapper[applicationStatus];
};

export const applicantStatusDecoder:{
  [index:number]:string
} ={
  [ApplicantStatus.InActive]:"Inactive",
  [ApplicantStatus.Active]:"Active",
}

const applicantStatusClassMapper:{
  [index:number]:string
} ={
  [ApplicantStatus.InActive]:"danger",
  [ApplicantStatus.Active]:"success",
}

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
    default:
      "In Process";
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

export const experienceCategoryList = [
  { id: 1, label: "0 - 1", value: 1 },
  {
    id: 2,
    label: "1 - 2",
    value: 2,
  },
  {
    id: 3,
    label: "2 - 3",
    value: 3,
  },
  {
    id: 4,
    label: "3 - 4",
    value: 4,
  },
  {
    id: 5,
    label: "4 - 5",
    value: 5,
  },
  {
    id: 6,
    label: "5 - 6",
    value: 6,
  },
  {
    id: 7,
    label: "6 - 7",
    value: 7,
  },
  {
    id: 8,
    label: "7 - 8",
    value: 8,
  },
  {
    id: 9,
    label: "8 - 9",
    value: 9,
  },
  {
    id: 10,
    label: "9 - 10",
    value: 10,
  },
  {
    id: 11,
    label: "10 - 11",
    value: 11,
  },
  {
    id: 12,
    label: "11 - 12",
    value: 12,
  },
  {
    id: 13,
    label: "12 - 13",
    value: 13,
  },
  {
    id: 14,
    label: "13 - 14",
    value: 14,
  },
  {
    id: 15,
    label: "14 - 15",
    value: 15,
  },
];
export const monthsExperienceList = [
  { id: 1, label: "0", value: 0 },
  {
    id: 2,
    label: "1",
    value: 1,
  },
  {
    id: 3,
    label: "2",
    value: 2,
  },
  {
    id: 4,
    label: "3",
    value: 3,
  },
  {
    id: 5,
    label: "4",
    value: 4,
  },
  {
    id: 6,
    label: "5",
    value: 5,
  },
  {
    id: 7,
    label: "6",
    value: 6,
  },
  {
    id: 8,
    label: "7",
    value: 7,
  },
  {
    id: 9,
    label: "8",
    value: 8,
  },
  {
    id: 10,
    label: "9",
    value: 9,
  },
  {
    id: 11,
    label: "10",
    value: 10,
  },
  {
    id: 12,
    label: "11",
    value: 11,
  },
  {
    id: 13,
    label: "12",
    value: 12,
  },
];

export const getDateDiffInYears = (from:Dayjs, to: Dayjs= dayjs()) => {
  return dayjs(to).diff(from, "years");
};

export const convertMonthsToYear = (months: number) => {
  let years = Math.round(months / 12);
  let suffix = years > 1 ? "Years" : "Year";
  return years + " " + suffix;
};

export const checkPermissionForModuleAndRoute = (
  moduleName: ModulesName,
  userModulePermissions: ModulePermissoinModel[]
) => {
  const module = userModulePermissions.find(
    (module) => module.moduleConstant === moduleName
  );
  if (!module) {
    return false;
  }
  const hasPermission = module.permissions.find(
    (permission) => permission.permissionConstant === Permission.View
  );
  if(!hasPermission){
    return false;
  }
  return hasPermission.hasAccess;
};

export const findUserDefaultTab = (
  userModulePermissions: ModulePermissoinModel[]
) => {
  const defaultTab = SideBarTabList.find(
    (tab) => checkPermissionForModuleAndRoute(tab.title, userModulePermissions) === true
  );
  if (!defaultTab) {
    return "/error/";
  }
  return defaultTab.route;
};

// export const checkUserPermissionForRouteAccess = (
//   moduleName: ModulesName,
//   userPermissions: ModulePermissoinModel[]
// ) => {
//   const module = userPermissions.find(
//     (permission) => permission.moduleConstant === moduleName
//   );
//   if (!module) {
//     return false;
//   }
//   const index = module.permissions.findIndex(
//     (permission) => permission.permissionConstant === Permission.View
//   );

//   return index !== -1 ? true : false;
// };

export const sortAscendingOrder = <Rows,>(arr:Rows[], key: keyof Rows)=> {
  const columnValueType = typeof arr[0][key];
  if( columnValueType === "number" ){
    arr.sort((a,b)=>(a[key] as number) - (b[key] as number));
    return arr;
  }
  if(columnValueType === "string"){
    arr.sort((a,b)=> (a[key] as string).toLowerCase().localeCompare((b[key] as string).toLowerCase()));
    return arr;
  }
  return arr;
};

export const sortingDescendingOrder = <Rows,>(arr:Rows[], key: keyof Rows) => {
  const columnValueType = typeof arr[0][key];
  if( columnValueType === "number" ){
    arr.sort((a,b)=>(b[key] as number) - (a[key] as number));
    return arr;
  }
  if(columnValueType === "string"){
    arr.sort((a,b)=> (b[key] as string).toLowerCase().localeCompare((a[key] as string).toLowerCase()));
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

export const blockInvalidCharOnNumberField = (event:React.KeyboardEvent<HTMLElement>) => ['e', 'E', '+', '-'].includes(event.key) && event.preventDefault();

// filter helper 

export const getAppliedFilters = () => {
  const savedFilters = localStorage.getItem(APP_FILTER_KEY);
  const appliedfilters: FiltersType = savedFilters
    ? JSON.parse(savedFilters)
    : {
        application: null,
        jobs: null,
      };
  return appliedfilters;
};


export const setLocalFilter = (filters:FiltersType) => {
  if(localStorage){
      localStorage.setItem(APP_FILTER_KEY,JSON.stringify(filters));
  }
  else{
      console.log("Unable to access localstorage");
  }
}

export const clearAllLocalFilter = ()=>{
  if(!localStorage){
    return;
  }
  localStorage.removeItem(APP_FILTER_KEY);
}