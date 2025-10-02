import { deleteRequest, postRequest } from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  GetAllHolidayResponseData,
  GetHolidayPayloadModel,
  HolidayModel,
} from "./models";

export const getAllHolidays = async (payload?: GetHolidayPayloadModel) => {
  return postRequest<GetHolidayPayloadModel | null, GetAllHolidayResponseData>(
    ServiceUrl.GET_ALL_HOLIDAYS,
    payload
  );
};

export const addEditHoliday = async (payload: FormData) => {
  return postRequest<FormData, ApiResponse>(
    ServiceUrl.CREATE_UPDATE_HOLIDAYS,
    payload,
    {},
    true
  );
};

export const deleteHoliday = async (holidayId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_HOLIDAYS}/${holidayId}`
  );
};
