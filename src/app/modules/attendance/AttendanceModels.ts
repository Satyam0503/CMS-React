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
  | "L";

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
