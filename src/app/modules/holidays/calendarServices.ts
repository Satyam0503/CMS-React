import { deleteRequest, postRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  GetAllCalendarItemData,
  GetCalendarItemPayload,
  HolidayModel,
  HolidayPayload,
} from "./models";

export const getAllCalendarItem = async (payload: GetCalendarItemPayload) => {
  return postRequest<GetCalendarItemPayload, GetAllCalendarItemData>(
    ServiceUrl.GET_ALL_CALENDAR_ITEMS,
    payload
  );
};

export const addEditCalendarItem = async (payload: FormData) => {
  return postRequest<FormData, ApiResponse>(
    ServiceUrl.ADD_AND_UPDATE_CALENDAR_ITEMS,
    payload,
    {},
    true
  );
};

export const deleteCalendarItem = async (holidayId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_CALENDAR_ITEM}/${holidayId}`
  );
};

export const getHolidays = async (payload: HolidayPayload) => {
  return postRequest<HolidayPayload, ResponseData<HolidayModel>>(
    ServiceUrl.GET_HOLIDAYS,
    payload
  );
};
