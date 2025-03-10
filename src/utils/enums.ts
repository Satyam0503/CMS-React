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
  InProgress = 1,
  OnHold = 2,
  Shortlisted = 3,
  Selection = 4,
  Rejection = 5,
}

export enum Permission {
  View = "View",
  Delete = "Delete",
  Edit = "Edit",
  Create = "Create",
  List = "List",
}
export enum Modules {
  Dashboard = 1,
  UserDashboard = 2,
  Employees = 3,
  Attendance = 4,
  LeaveManagement = 5,
  MyProfile = 6,
  Recruitment = 7,
  Admin = 8,
  Holidays = 9,
  NoticeBoard = 10,
  Jobs = 11,
  Applications = 12,
  Permissions = 13,
  Theme = 14,
}

export enum ModulesName {
  Dashboard = "Dashboard",
  UserDashboard = "User Dashboard",
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
  Permissions = "Permissions",
  Theme = "Theme",
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