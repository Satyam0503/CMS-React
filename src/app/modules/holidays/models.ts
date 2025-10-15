import dayjs, { Dayjs } from "dayjs";
import { ResponseData } from "../../../utils/common_types";
import { HOLIDAY_TYPE } from "../../../utils/enums";

export interface HolidayModel {
  holidayId?: string;
  holidayName: string;
  date: Dayjs | null | string;
  detail: string;
  holidayType: number;
  holidayImage?: File | null;
}


export type HolidayResponseModel = Omit<HolidayModel, "holidayImage"> & {
  holidayImageUrl?: string | null;
  holidayCoverImageUrl?: string | null;
};

export interface GetHolidayPayloadModel {
  holidayName: string;
  holidayType: HOLIDAY_TYPE[];
  date: string | null;
}

export interface HolidayFilterModel {
  holidayType: HOLIDAY_TYPE[];
  date: string | null;
}

export type GetAllHolidayResponseData = ResponseData<HolidayResponseModel>;
export type AddHolidayResponseData = ResponseData<HolidayModel>;
