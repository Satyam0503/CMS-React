import { deleteRequest, postRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  GetAllCalendarItemData,
  GetCalendarItemPayload,
  HolidayModel,
  HolidayPayload,
  CalendarImportItem,
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
  const body = {
    fromDate: payload.fromDate ? payload.fromDate.format("YYYY-MM-DD") : null,
    toDate: payload.toDate ? payload.toDate.format("YYYY-MM-DD") : null,
  };
  return postRequest<typeof body, ResponseData<HolidayModel>>(
    ServiceUrl.GET_HOLIDAYS,
    body as any
  );
};

export const importCalendarItems = async (items: CalendarImportItem[]) =>
  postRequest<{ items: CalendarImportItem[] }, ApiResponse>(
    ServiceUrl.IMPORT_CALENDAR_ITEMS,
    { items }
  );
