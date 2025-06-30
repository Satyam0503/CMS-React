import { Dayjs } from "dayjs";
import { ResponseData } from "../../../utils/common_types";
import { NOTICE_TYPE } from "../../../utils/enums";

export interface NoticeModel {
  noticeId?: string;
  title: string;
  message: string;
  target: string | null;
  noticeType: NOTICE_TYPE;
  departments: string;
  createdDate?: string;
}

export interface NoticeBoardFilterModel {
  noticeType: NOTICE_TYPE[];
  filterFrom: string | Dayjs | null;
  filterTo: string | Dayjs | null;
}

export interface NoticeResponseModel {
  noticeId: string;
  userName: string;
  userProfile: string;
  userDesignation: string;
  noticeMessage: string;
  noticeTitle: string;
  createdDateTime: string;
  noticeType: number;
}
export type GetAllNoticePayload = NoticeBoardFilterModel & {
  pageNo: number;
  records: number;
  postedBy: string;
};

export type GetAllNoticeResponse = ResponseData<NoticeResponseModel>;
export type GetMyNoticesResponse = ResponseData<NoticeModel>;
