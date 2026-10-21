export type AttendanceStatus =
  | "P"
  | "A"
  | "SL"
  | "CL"
  | "EL"
  | "WFH"
  | "HD"
  | "ED"
  | "LHD"
  | "WFH+WFO"
  | "COMP-OFF"
  | "CL-HALF"
  | "SL-HALF"
  | "WFH-HD"
  | "WFH+SL"
  | "WFH+CL"
  | "LHD+ED"
  | "LC"
  | "EHD"
  | "L"
  | "MED"
  | "ML"
  | "SAB"
  | "UL";

export interface AttendancePayload {
  fromDate: string;
  toDate: string;
  userIds?: string[];
}

export interface AttendanceModel {
  attendanceId: string;
  userId: string;
  employeeId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  status: AttendanceStatus;
  remarks?: string;
  sourceType?: string | null;
  sourceId?: string | null;
  scheduleId?: string | null;
  // Half-day leave and WFH are returned as individual segment rows. A day can
  // therefore contain both FIRST_HALF and SECOND_HALF records.
  isDaySegment?: boolean;
  segment?: "FIRST_HALF" | "SECOND_HALF" | string | null;
}

export interface CalendarAttendanceRow {
  id: string;
  userId: string;
  employeeId: string;
  userName: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  sourceType?: string | null;
  sourceId?: string | null;
  scheduleId?: string | null;
}

export interface GetAllAttendanceData {
  items: AttendanceModel[];
}

export interface AdminAttendanceCreateDto {
  UserId: string;
  EmployeeId: string;
  Date: string;
  CheckInTime?: string;
  CheckOutTime?: string;
  Status: AttendanceStatus;
  Remarks?: string | null;
}

export interface AttendanceImportIssue {
  rowNumber: number;
  columnHeader?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  date?: string | null;
  severity: "Error" | "Warning" | string;
  message: string;
}

export interface AttendanceImportValidationResult {
  isValid: boolean;
  totalEmployees: number;
  totalDaysInMonth: number;
  totalCellsProcessed: number;
  validEntriesCount: number;
  preservedLeavesCount: number;
  warningCount: number;
  errorCount: number;
  issues: AttendanceImportIssue[];
}

export interface AttendanceImportCommitResult {
  success: boolean;
  message: string;
  employeesAffected: number;
  recordsUpserted: number;
  preservedLeavesCount: number;
  issues: AttendanceImportIssue[];
}

