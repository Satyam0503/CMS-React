import { getRequest, postRequest } from "../../../server/axios"
import { ApiResponse } from "../../../utils/common_types"
import { ServiceUrl } from "../../../utils/constant/Constant"
import { GetAllNoticeResponse, GetMyNoticesResponse, NoticeModel } from "./models"

export const postNotice = async (payload: NoticeModel) => {
    return postRequest<NoticeModel, ApiResponse>(ServiceUrl.POST_NOTICE, payload);
}
export const getAllNotices = async () => {
    return getRequest<GetAllNoticeResponse>(ServiceUrl.GET_ALL_NOTICES);
}
export const getMyNotices = async () => {
    return getRequest<GetMyNoticesResponse>(ServiceUrl.GET_MY_NOTICES);
}