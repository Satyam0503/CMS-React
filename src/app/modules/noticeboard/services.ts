import { getRequest, postRequest, putRequest } from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  GetAllNoticeResponse,
  GetMyNoticesResponse,
  NoticeModel,
} from "./models";

export const postNotice = async (payload: NoticeModel) => {
  return postRequest<NoticeModel, ApiResponse>(ServiceUrl.POST_NOTICE, payload);
};

export const updateNotice = async (payload: NoticeModel) => {
  return putRequest<NoticeModel, ApiResponse>(
    ServiceUrl.UPDATE_NOTICE,
    payload
  );
};

export const getAllNotices = async (pageNo: number, records: number) => {
  return getRequest<GetAllNoticeResponse>(ServiceUrl.GET_ALL_NOTICES, {
    params: {
      pageNo,
      records,
    },
  });
};
export const getMyPostedNotices = async (pageNo: number, records: number) => {
  return getRequest<GetMyNoticesResponse>(ServiceUrl.GET_MY_NOTICES, {
    params: {
      pageNo,
      records,
    },
  });
};
