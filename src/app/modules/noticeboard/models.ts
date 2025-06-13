import { ResponseData } from "../../../utils/common_types"
import { NOTICE_TYPE } from "../../../utils/enums"

export interface NoticeModel {
    noticeId?: string,
    title: string,
    message: string,
    target: string | null,
    noticeType: NOTICE_TYPE,
    departments: string,
}

export interface NoticeResponseModel {
    userName: string,
    userProfile: string,
    userDesignation: string,
    noticeMessage: string,
    noticeTitle: string,
    createdDateTime: string,
    noticeType: number,
}

export type GetAllNoticeResponse = ResponseData<NoticeResponseModel>
export type GetMyNoticesResponse = ResponseData<NoticeModel> 