import axios from "axios";
import { postRequest, deleteRequest, getRequest } from "../../../server/axios"; 
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { AdminAttendanceCreateDto, AttendanceModel, AttendancePayload, GetAllAttendanceData } from "./AttendanceModels";
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
