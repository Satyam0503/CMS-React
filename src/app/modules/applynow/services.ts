import { postRequest } from "../../../server/axios"
import { ApiResponse } from "../../../utils/common_types"
import { ServiceUrl } from "../../../utils/constant/Constant"
import { ApplicantModel } from "../recruitment/models";

export const applyNow = async (payload:ApplicantModel)=>{
    return postRequest<ApplicantModel,ApiResponse>(ServiceUrl.APPLY_JOB,payload);
}

export const uploadApplicationResume = async (applicationReference: string, token: string, payload: FormData) => {
    payload.set("token", token);
    return postRequest<FormData, ApiResponse>(`api/public/applications/${encodeURIComponent(applicationReference)}/resume`, payload, {}, true);
};



