export enum ApplicationStatus {
  New = 0,
  InProgress = 1,
  OnHold = 2,
  Shortlisted = 3,
  Selected = 4,
  Rejected = 5,
  ReApply = 6,
}

export enum ApplicantStatus {
  InActive = 0,
  Active = 1,
}

export enum EmployeeStatus {
  InActive = 0,
  Active = 1,
}

export enum CommentAction {
  Process = 0,
  InProgress = 1,
  OnHold = 2,
  Shortlisted = 3,
  Selection = 4,
  Rejection = 5,
  Edit = 6,
}

export enum Permission {
  View = "View",
  Delete = "Delete",
  Edit = "Edit",
  Create = "Create",
}
export enum Modules {
  Dashboard = 1,
  Employees = 2,
  Attendance = 3,
  LeaveManagement = 4,
  Recruitment = 5,
  Admin = 6,
  Calendar = 7,
  NoticeBoard = 8,
  Jobs = 9,
  Applications = 10,
  Permissions = 11,
  ProcessLog = 12,
  CompanyMaster = 13,
  PayRoll = 14,
  CompanyDetails = 15,
}

export enum ModulesName {
  Dashboard = "Dashboard",
  Employees = "Employees",
  Attendance = "Attendance",
  LeaveManagement = "Leave_Management",
  Recruitment = "Recruitment",
  Admin = "Admin",
  Calendar = "Calendar",
  NoticeBoard = "Notice_Board",
  Jobs = "Jobs",
  Applications = "Applications",
  Permissions = "Permissions",
  Theme = "Theme",
  ProcessLog = "Process_Log",
  CompanyMaster = "Company_Master",
  PayRoll = "PayRoll",
  CompanyDetails = "Company_Details",
}

export enum ModulesTitles {
  Dashboard = "MODULES.DASHBOARD",
  Employees = "MODULES.EMPLOYEES",
  Attendance = "MODULES.ATTENDANCE",
  LeaveManagement = "MODULES.LEAVE_MANAGEMENT",
  Recruitment = "MODULES.RECRUITMENT",
  Admin = "MODULES.ADMIN",
  Calendar = "MODULES.CALENDAR",
  NoticeBoard = "MODULES.NOTICE_BOARD",
  Jobs = "MODULES.JOBS",
  Applications = "MODULES.APPLICATIONS",
  Permissions = "MODULES.PERMISSIONS",
  ProcessLog = "MODULES.PROCESS_LOG",
  CompanyMaster = "MODULES.COMPANY_MASTER",
  PayRoll = "MODULES.PAYROLL",
  CompanyDetails = "MODULES.COMPANY_DETAILS",
}

export enum Roles {
  Administrator = 1,
  HRManager = 2,
  Employee = 3,
}

export enum TIME_PERIOD_MAP {
  LAST_WEEK = 1,
  LAST_MONTH = 2,
  LAST_THREE_MONTHS = 3,
  LAST_SIX_MONTHS = 4,
  LAST_12_MONTHS = 5,
  LAST_TWO_WEEK = 7,
}

export enum LANGUAGE {
  ENGLISH = "en",
  MANDARIN = "zh",
  SPANISH = "es",
  JAPANESE = "ja",
  GERMAN = "de",
  FRENCH = "fr",
}

export enum NOTICE_TYPE {
  GENERAL = 1,
  IMPORTANT = 2,
  URGENT = 3,
}

export enum NOTIFICATION_TYPE {
  NOTICE = 1,
  LEAVE_REQUEST = 2,
  LEAVE_REQUEST_APPROVED = 3,
  LEAVE_REQUEST_REJECTED = 4,
  BIRTHDAY = 5,
  WORK_ANNIVERSARY = 6,
  MESSAGE = 7,
}

export enum LEAVE_TYPE {
  SICK_LEAVE = 1,
  CASUAL_LEAVE = 2,
  EARNED_LEAVE = 3,
  MATERNITY_LEAVE = 4,
  PATERNITY_LEAVE = 5,
}

export enum LEAVE_REQUEST_STATUS {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export enum JOB_TYPE_ENUM {
  ONSITE = 1,
  HYBRID = 2,
  REMOTE = 3,
}

export enum HOLIDAY_TYPE {
  CULTURAL = 1,
  HEALTH = 2,
  RELIGIOUS = 3,
  NATIONAL = 4,
}

export enum EMPLOYMENT {
  FULLTIME = 1,
  PARTTIME,
  CONTRACTUAL,
  INTERNSHIP,
  APPRENTICESHIP,
}

export enum ACCURAL_PERIOD {
  MONTHLY = 1,
  YEARLY = 2,
  NONE = 3,
}
