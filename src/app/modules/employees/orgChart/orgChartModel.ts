export interface OrgChartNode {
  userId: string;
  employeeId: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  email: string;
  profileUrl?: string | null;
  fullProfileUrl?: string | null;
  jobRoleId: string;
  jobRoleTitle: string;
  departmentId: string;
  departmentName: string;
  reportingManagerUserId?: string | null;
  reportingManagerName?: string | null;
  directReportsCount: number;
  totalTeamCount: number;
  directReports: OrgChartNode[];
}

export interface OrgChartDepartmentSummary {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
}

export interface OrgChartResponse {
  roots: OrgChartNode[];
  totalEmployeesCount: number;
  totalDepartmentsCount: number;
  departments: OrgChartDepartmentSummary[];
}

