import axios from "axios";
import { postRequest, deleteRequest, getRequest } from "../../../server/axios"; 
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { AdminAttendanceCreateDto, AttendanceImportCommitResult, AttendanceImportValidationResult, AttendanceModel, AttendancePayload, GetAllAttendanceData } from "./AttendanceModels";
import { ServiceUrl } from "../../../utils/constant/Constant"

// export const ServiceUrl = {
//   GET_ALL_ATTENDANCE: `/api/admin/attendance/GetAllAttendanceItems`,
//   CREATE_AND_UPDATE_ATTENDANCE: `/api/admin/attendance`,
//   DELETE_ATTENDANCE: `api/admin/attendance/DeleteAttendance`, 
// };


export const getAllAttendance = async (payload: AttendancePayload) => {
  return postRequest<AttendancePayload, ResponseData<GetAllAttendanceData>>(
    ServiceUrl.GET_ALL_ATTENDANCE,
    payload
  );
};

export const addEditAttendance = async (
  payload: AdminAttendanceCreateDto
) => {
  return postRequest(
    ServiceUrl.CREATE_AND_UPDATE_ATTENDANCE,
    payload
  );
};

export const deleteAttendance = async (attendanceId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_ATTENDANCE}/${attendanceId}`
  );
};

export const exportMonthlyAttendance = async (year: number, month: number) => {
  return getRequest<Blob>("api/admin/attendance/export/monthly", {
    params: { year, month },
    responseType: "blob",
    headers: { "Cache-Control": "no-cache" },
  });
};

export const downloadAttendanceImportTemplate = async (year: number, month: number) => {
  return getRequest<Blob>("api/admin/attendance/import/template", {
    params: { year, month },
    responseType: "blob",
    headers: { "Cache-Control": "no-cache" },
  });
};

export const validateAttendanceImport = async (
  file: File,
  year: number,
  month: number,
  preserveApprovedLeaves: boolean = true
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("year", year.toString());
  formData.append("month", month.toString());
  formData.append("preserveApprovedLeaves", preserveApprovedLeaves.toString());

  return postRequest<FormData, AttendanceImportValidationResult>(
    "api/admin/attendance/import/validate",
    formData,
    undefined,
    true
  );
};

export const commitAttendanceImport = async (
  file: File,
  year: number,
  month: number,
  preserveApprovedLeaves: boolean = true
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("year", year.toString());
  formData.append("month", month.toString());
  formData.append("preserveApprovedLeaves", preserveApprovedLeaves.toString());

  return postRequest<FormData, AttendanceImportCommitResult>(
    "api/admin/attendance/import/commit",
    formData,
    undefined,
    true
  );
};

