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
  MyProfile = 5,
  Recruitment = 6,
  Admin = 7,
  Holidays = 8,
  NoticeBoard = 9,
  Jobs = 10,
  Applications = 11,
  Permissions = 12,
  Theme = 13,
  ProcessLog = 14,
  CompanyMaster = 15,
  PayRoll = 16,
}

export enum ModulesName {
  Dashboard = "Dashboard",
  Employees = "Employees",
  Attendance = "Attendance",
  LeaveManagement = "Leave_Management",
  MyProfile = "My_Profile",
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
}

export enum ModulesTitles {
  Dashboard = "Dashboard",
  Employees = "Employees",
  Attendance = "Attendance",
  LeaveManagement = "Leave Management",
  MyProfile = "My Profile",
  Recruitment = "Recruitment",
  Admin = "Admin",
  Holidays = "Holidays",
  NoticeBoard = "Notice board",
  Jobs = "Jobs",
  Applications = "Applications",
  Permissions = "Roles & Permissions",
  Theme = "Theme",
  ProcessLog = "Process Log",
  CompanyMaster = "Company Master",
  PayRoll = "PayRoll",
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
