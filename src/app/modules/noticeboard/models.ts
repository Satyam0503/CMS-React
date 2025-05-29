import { BaseModel, ResponseData } from "../../../utils/common_types"

export interface NoticeModel {
    noticeId?: string,
    title: string,
    message: string,
    target: string,
    noticeType: number
}

export type GetAllNoticeResponse = ResponseData<BaseModel & NoticeModel> 