import dayjs, { Dayjs } from "dayjs";
import DOMPurify from "dompurify";
import {
  AppLanguageProps,
  FiltersType,
  ModulePermissoinModel,
  NotificationRedirectOption,
  PermissionModel,
} from "./common_types";
import {
  ApplicantStatus,
  ApplicationStatus,
  CommentAction,
  JOB_TYPE_ENUM,
  LEAVE_REQUEST_STATUS,
  ModulesName,
  NOTICE_TYPE,
  NOTIFICATION_TYPE,
  Permission,
  LANGUAGE,
  Roles,
  EMPLOYMENT,
  ACCURAL_PERIOD,
  CALENDAR_ITEM,
} from "./enums";
import { APP_FILTER_KEY, I18N_CONFIG_KEY } from "./constant/data";
import { SideBarTabList } from "./constant/sidebarMenu";
import { NotificationModel } from "../app/modules/users/models";
import { NavigateFunction } from "react-router-dom";
import { MultilingualModel } from "../app/modules/admin/models";
import { IntlShape } from "react-intl";
import { NoticeBoardFilterModel } from "../app/modules/noticeboard/models";
import type { PieSeries } from "@mui/x-charts";

export const dateFormatter = (
  date: Date | Dayjs | string | null,
  format: string
) => {
  if (!date) {
    return "NA";
  }
  return dayjs(date).format(format);
};

export const formatServerDate = (
  date: Date | Dayjs | string | null | undefined,
  format: string
) => {
  if (!date) {
    return "NA";
  }

  const toIndiaDateString = (value: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: INDIA_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(value);
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;
    return year && month && day ? `${year}-${month}-${day}` : null;
  };

  if (typeof date === "string") {
    const normalized = date.trim();
    const dateOnlyMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})$/);
    if (dateOnlyMatch) {
      return dayjs(dateOnlyMatch[1], "YYYY-MM-DD").format(format);
    }

    const midnightBusinessDateMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})T00:00:00(?:\.0+)?$/);
    if (midnightBusinessDateMatch) {
      return dayjs(midnightBusinessDateMatch[1], "YYYY-MM-DD").format(format);
    }

    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      return dayjs(normalized).format(format);
    }

    const indiaDate = toIndiaDateString(parsed);
    return indiaDate ? dayjs(indiaDate, "YYYY-MM-DD").format(format) : dayjs(parsed).format(format);
  }

  if (date instanceof Date) {
    const indiaDate = toIndiaDateString(date);
    return indiaDate ? dayjs(indiaDate, "YYYY-MM-DD").format(format) : dayjs(date).format(format);
  }

  const value = date.toDate ? date.toDate() : new Date(String(date));
  const indiaDate = toIndiaDateString(value);
  return indiaDate ? dayjs(indiaDate, "YYYY-MM-DD").format(format) : dayjs(value).format(format);
};

/** CMS business timezone. Persisted timestamps stay UTC; user-facing times use IST. */
export const INDIA_TIME_ZONE = "Asia/Kolkata";

export const formatIndianTime = (date: Date | string | null | undefined) => {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-IN", { timeZone: INDIA_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(value);
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;
  return hour && minute ? `${hour}:${minute}` : "";
};

export const currencyFormatter = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) {
    return "NA";
  }
  return `₹ ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const relativeTimeFormatter = (date: Dayjs | string) => {
  const daysDiff = dayjs().diff(date, "day");
  if (daysDiff > 3) {
    return dayjs(date).format("lll");
  }
  return dayjs(date).fromNow();
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

export const genderMapper: {
  [index: string]: string;
} = {
  male: "GENDER.MALE",
  female: "GENDER.FEMALE",
  other: "GENDER.OTHER",
};

export const applicantStatusDecoder: {
  [index: number]: string;
} = {
  [ApplicantStatus.Active]: "APPLICANT.STATUS.ACTIVE",
  [ApplicantStatus.InActive]: "APPLICANT.STATUS.INACTIVE",
};

export const jobTypeDecoder: {
  [index: number]: string;
} = {
  [JOB_TYPE_ENUM.ONSITE]: "JOBTYPE.ONSITE",
  [JOB_TYPE_ENUM.HYBRID]: "JOBTYPE.HYBRID",
  [JOB_TYPE_ENUM.REMOTE]: "JOBTYPE.REMOTE",
};

export const noticeTypeDecoder: {
  [index: number]: string;
} = {
  [NOTICE_TYPE.GENERAL]: "NOTICE.TYPES.GENERAL",
  [NOTICE_TYPE.IMPORTANT]: "NOTICE.TYPES.IMPORTANT",
  [NOTICE_TYPE.URGENT]: "NOTICE.TYPES.URGENT",
};

export const EmploymentTypeMapper: { [key: number]: string } = {
  [EMPLOYMENT.FULLTIME]: "EMPLOYEE.TYPE.FULLTIME",
  [EMPLOYMENT.PARTTIME]: "EMPLOYEE.TYPE.PARTTIME",
  [EMPLOYMENT.CONTRACTUAL]: "EMPLOYEE.TYPE.CONTRACTUAL",
  [EMPLOYMENT.INTERNSHIP]: "EMPLOYEE.TYPE.INTERNSHIP",
  [EMPLOYMENT.APPRENTICESHIP]: "EMPLOYEE.TYPE.APPRENTICESHIP",
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
  [LEAVE_REQUEST_STATUS.PENDING]: "LEAVE_REQUEST_STATUS.PENDING",
  [LEAVE_REQUEST_STATUS.APPROVED]: "LEAVE_REQUEST_STATUS.APPROVED",
  [LEAVE_REQUEST_STATUS.REJECTED]: "LEAVE_REQUEST_STATUS.REJECTED",
  [LEAVE_REQUEST_STATUS.WITHDRAWN]: "LEAVE_REQUEST_STATUS.WITHDRAWN",
};

export const JobTypeMapper: { [index: number]: string } = {
  [JOB_TYPE_ENUM.ONSITE]: "JOBTYPE.ONSITE",
  [JOB_TYPE_ENUM.HYBRID]: "JOBTYPE.HYBRID",
  [JOB_TYPE_ENUM.REMOTE]: "JOBTYPE.REMOTE",
};

export const LanguageNameMapper: { [index: string]: string } = {
  [LANGUAGE.ENGLISH]: "LANGUAGES.ENGLISH",
  [LANGUAGE.MANDARIN]: "LANGUAGES.MANDARIN",
  [LANGUAGE.SPANISH]: "LANGUAGES.SPANISH",
  [LANGUAGE.JAPANESE]: "LANGUAGES.JAPANESE",
  [LANGUAGE.GERMAN]: "LANGUAGES.GERMAN",
  [LANGUAGE.FRENCH]: "LANGUAGES.FRENCH",
};

export const AccrualPeriodMapper: { [index: number]: string } = {
  [ACCURAL_PERIOD.MONTHLY]: "LEAVE.ACCRUAL_PERIOD.MONTHLY",
  [ACCURAL_PERIOD.YEARLY]: "LEAVE.ACCRUAL_PERIOD.YEARLY",
  [ACCURAL_PERIOD.NONE]: "LEAVE.ACCRUAL_PERIOD.NONE",
};

export const jobStatusMapper: { [index: number]: string } = {
  0: "INACTIVE",
  1: "ACTIVE",
};

export const getDateDiffInYears = (from: Dayjs, to: Dayjs = dayjs()) => {
  return dayjs(to).diff(from, "years");
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

export const blockInvalidCharOnNumberField = (
  event: React.KeyboardEvent<HTMLElement>
) => ["e", "E", "+", "-"].includes(event.key) && event.preventDefault();

// filter helper
export const getAppliedFilters = () => {
  const savedFilters = localStorage.getItem(APP_FILTER_KEY);
  const appliedfilters: FiltersType = savedFilters
    ? JSON.parse(savedFilters)
    : ({
      application: null,
      jobs: null,
      processLog: null,
      employee: null,
      holiday: null,
      noticeBoard: null,
      leaveRequest: null,
    } satisfies FiltersType);
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
          count += filter[element].length ? 1 : 0;
        } else if (typeof filter[element] === "string") {
          count += filter[element] ? 1 : 0;
        } else if (typeof filter[element] === "number") {
          count += filter[element] >= 0 ? 1 : 0;
        } else {
          count += 1;
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

// flatten nested translation file
export const flattenMessages = (
  messages: Record<string, any>,
  prefix = ""
): Record<string, string> => {
  let result: Record<string, string> = {};

  for (const key in messages) {
    if (Object.prototype.hasOwnProperty.call(messages, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof messages[key] === "object" && !Array.isArray(messages[key])) {
        result = { ...result, ...flattenMessages(messages[key], newKey) };
      } else {
        result[newKey] = messages[key];
      }
    }
  }

  return result;
};

export const getStatusCodeString = (statusCode: number) => {
  return `STATUS_CODES.${statusCode}`;
};

export const getCustomStatusCodesErrorMessage = (
  status: number,
  defaultMessage?: string
) => {
  if (status < 100 || status > 600) {
    return `STATUS_CODES.${status}`;
  } else {
    return defaultMessage ?? `ERROR.SOMETHING_WRONG`;
  }
};

const initialState: AppLanguageProps = {
  selectedLang: LANGUAGE.ENGLISH,
};
export const getCurrentAppLanguage = (): LANGUAGE => {
  const ls = localStorage.getItem(I18N_CONFIG_KEY);
  if (ls) {
    try {
      const selectedLang = (JSON.parse(ls) as AppLanguageProps).selectedLang;
      if (Object.values(LANGUAGE).includes(selectedLang as LANGUAGE)) {
        return selectedLang as LANGUAGE;
      }
    } catch (er) {
      console.error(er);
    }
  }
  return initialState.selectedLang;
};

export function setAppLanguage(lang: string) {
  if (Object.values(LANGUAGE).includes(lang as LANGUAGE)) {
    localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify({ selectedLang: lang }));
  }
}

export const transformAttributeObjectToList = (
  titles: Record<string, string>
) => {
  const itemList: MultilingualModel[] = [];
  for (const key in titles) {
    itemList.push({
      label: titles[key],
      language: key,
    });
  }
  return itemList;
};

// map current language to dayjs locale files
const mapLocal = {
  [LANGUAGE.ENGLISH]: () => import("dayjs/locale/en"),
  [LANGUAGE.MANDARIN]: () => import("dayjs/locale/zh"),
  [LANGUAGE.SPANISH]: () => import("dayjs/locale/es"),
  [LANGUAGE.JAPANESE]: () => import("dayjs/locale/ja"),
  [LANGUAGE.GERMAN]: () => import("dayjs/locale/de"),
  [LANGUAGE.FRENCH]: () => import("dayjs/locale/fr"),
};

export const setDayJsLocale = async () => {
  // get the current locale of the app
  const currentLocale = getCurrentAppLanguage();
  // dynamically import the locale file based on the current language
  try {
    await mapLocal[currentLocale]();
    dayjs.locale(currentLocale);
  } catch (error) {
    dayjs.locale(LANGUAGE.ENGLISH);
  }
};

export const filterSideBarTabs = (
  userModulePermission: string[],
  userRoleType: number
) => {
  // Administrators should see all sidebar tabs regardless of modulePermission entries
  if (userRoleType === Roles.Administrator) {
    return SideBarTabList;
  }

  const filteredTabList = SideBarTabList.map((tab) => {
    if (tab.isDefault) return tab;
    if (tab.adminOnly) return null; // non-admins can't see admin-only
    else if (tab.hasSubTabs) {
      const subTabsWithPermission = tab.subTabs?.filter((subTab) =>
        hasModuleFeaturePermission(
          subTab.constant,
          Permission.View,
          userModulePermission
        )
      );
      if (subTabsWithPermission && subTabsWithPermission.length > 0) {
        return {
          ...tab,
          subTabs: subTabsWithPermission,
        };
      }
      return null;
    }
    if (
      hasModuleFeaturePermission(
        tab.constant,
        Permission.View,
        userModulePermission
      )
    ) {
      return tab;
    }
    return null;
  }).filter((tab) => tab !== null);
  return filteredTabList;
};

export const canAccessHrManagement = (roleType?: number) =>
  roleType === Roles.Administrator || roleType === Roles.HRManager || roleType === Roles.HRExecutive;


export const getNotificationTitle = (
  notification: NotificationModel,
  intl: IntlShape
) => {
  const { formatMessage: i } = intl;
  // WFH notifications carry a server-generated title but do not have a legacy
  // translation entry, so use it instead of the generic fallback.
  if (notification.title?.trim().startsWith("WFH")) return notification.title;
  switch (notification.notificationTypes) {
    case NOTIFICATION_TYPE.NOTICE:
      return i({ id: "NOTIFICATION.TITLES.NEW_NOTICE" });
    case NOTIFICATION_TYPE.LEAVE_REQUEST:
      return i(
        { id: "NOTIFICATION.TITLES.LEAVE_REQUEST" },
        { employeeName: notification.body }
      );
    case NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED:
      return i(
        { id: "NOTIFICATION.TITLES.LEAVE_REQ_APPROVED" },
        { employeeName: notification.body }
      );
    case NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED:
      return i(
        { id: "NOTIFICATION.TITLES.LEAVE_REQ_REJECT" },
        { employeeName: notification.body }
      );
    case NOTIFICATION_TYPE.BIRTHDAY:
      return i(
        { id: "NOTIFICATION.TITLES.TODAY_BIRTHDAY" },
        { employeeName: notification.body }
      );
    case NOTIFICATION_TYPE.WORK_ANNIVERSARY:
      return i(
        { id: "NOTIFICATION.TITLES.TODAY_WORK_ANNIVERSARY" },
        { employeeName: notification.body }
      );
    default:
      return i({ id: "NOTIFICATION.TITLES.FALLBACK" });
  }
};

export const redirectUserToTargetUrl = (
  notification: NotificationModel,
  navigate: NavigateFunction
) => {
  const redirectOption: NotificationRedirectOption = {
    targetPath: "",
    data: null,
  };
  if (notification.targetId?.startsWith("attendance-review-")) {
    redirectOption.targetPath = "/attendance";
    redirectOption.data = notification.targetId.substring("attendance-review-".length);
  } else if (notification.title?.startsWith("WFH")) {
    redirectOption.targetPath = "/leavemanagement/work-from-home";
  } else switch (notification.notificationTypes) {
    case NOTIFICATION_TYPE.NOTICE: {
      redirectOption.targetPath = "/noticeboard/notices";
      redirectOption.data = notification.targetId;
      break;
    }
    case NOTIFICATION_TYPE.LEAVE_REQUEST: {
      redirectOption.targetPath = "/leavemanagement/leaverequest";
      redirectOption.data = notification.targetId;
      break;
    }
    case NOTIFICATION_TYPE.LEAVE_REQUEST_APPROVED:
    case NOTIFICATION_TYPE.LEAVE_REQUEST_REJECTED: {
      redirectOption.targetPath = "/profile/leave";
      break;
    }
  }
  navigate(redirectOption.targetPath, {
    state: redirectOption.data,
    replace: true,
  });
};

export const getOrdinalSuffix = (num: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
};

// initial Filter values
export const initialNoticeFilter: NoticeBoardFilterModel = {
  noticeType: [],
  filterFrom: null,
  filterTo: null,
};

// common pie chart series
export const defaultPieChartSeries: PieSeries = {
  innerRadius: "60%",
  outerRadius: "100%",
  paddingAngle: 2,
  startAngle: -90,
  highlightScope: { fade: "global", highlight: "item" },
  highlighted: { additionalRadius: 2 },
  cornerRadius: 4,
  data: [],
};

export const calendarItemStyleMapper: { [index: number]: string } = {
  [CALENDAR_ITEM.HOLIDAY]: "primary",
  [CALENDAR_ITEM.EVENT]: "secondary",
  [CALENDAR_ITEM.BIRTHDAY]: "success",
  [CALENDAR_ITEM.ANNIVERSARY]: "info",
};
