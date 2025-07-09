export enum ApplicationStatus {
  New = 0,
  InProgress = 1,
  OnHold = 2,
  Shortlisted = 3,
  Selected = 4,
  Rejected = 5,
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
  Holidays = 7,
  NoticeBoard = 8,
  Jobs = 9,
  Applications = 10,
  Permissions = 11,
  Theme = 12,
  ProcessLog = 13,
  CompanyMaster = 14,
  PayRoll = 15,
  CompanyDetails = 16,
}

export enum ModulesName {
  Dashboard = "Dashboard",
  Employees = "Employees",
  Attendance = "Attendance",
  LeaveManagement = "Leave_Management",
  Recruitment = "Recruitment",
  Admin = "Admin",
  Holidays = "Holidays",
  NoticeBoard = "Notice_board",
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
  Dashboard = "Modules.Dashboard",
  Employees = "Modules.Employees",
  Attendance = "Modules.Attendance",
  LeaveManagement = "Modules.LeaveManagement",
  Recruitment = "Modules.Recruitment",
  Admin = "Modules.Admin",
  Holidays = "Modules.Holidays",
  NoticeBoard = "Modules.NoticeBoard",
  Jobs = "Modules.Jobs",
  Applications = "Modules.Applications",
  Permissions = "Modules.Permissions",
  Theme = "Modules.Theme",
  ProcessLog = "Modules.ProcessLog",
  CompanyMaster = "Modules.CompanyMaster",
  PayRoll = "Modules.PayRoll",
  CompanyDetails = "Modules.CompanyDetails",
}

export enum Roles {
  Administrator = "Company Administrator",
  HRManager = "HR Manager",
  Employee = "Employee",
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
  MESSAGE = 2,
  ALERT = 3,
}

export enum LEAVE_TYPE {
  SICK_LEAVE = 1,
  CASUAL_LEAVE = 2,
  EARNED_LEAVE = 3,
  MATERNITY_LEAVE = 4,
  PATERNITY_LEAVE = 5,
  MARRIAGE = 6,
}

export enum LEAVE_REQUEST_STATUS {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}
