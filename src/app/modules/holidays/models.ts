import { Dayjs } from "dayjs";
import { ResponseData } from "../../../utils/common_types";
import { HOLIDAY_TYPE } from "../../../utils/enums";

export interface OccasionModel {
  occasionId?: string;
  occasionName: string;
  date: Dayjs | null | string;
  detail: string;
  occasionType: number;
  occasionImage?: File | null;
  recurring: boolean;
}

export type OccasionResponseModel = Omit<OccasionModel, "occasionImage"> & {
  occasionImageUrl?: string | null;
  occasionCoverImageUrl?: string | null;
};

export type CalendarItemType = 0 | 1 | 2 | 3 | 4;

export interface GetCalendarItemPayload {
  type: null | CalendarItemType;
  year: null | number;
}

export type CalendarItem = {
  id: string;
  name: string;
  date: Dayjs | null | string;
  description: string;
  type: CalendarItemType;
  imageUrl: string | null;
  recurring: boolean;
  image?: File | null;
};

export interface HolidayFilterModel {
  occasionType: HOLIDAY_TYPE[];
  date: string | null;
}

export type HolidayPayload = {
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
};

export type HolidayModel = {
  id: string;
  name: string;
  date: string;
  description: string;
};

export type GetAllCalendarItemData = ResponseData<CalendarItem>;
export type AddHolidayResponseData = ResponseData<OccasionModel>;

export type CalendarImportItem = { name: string; date: string; type: 1 | 2 };
