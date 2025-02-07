import { postRequest } from "../../../server/axios"
import { ApiResponse, ApplicantModel } from "../../../utils/common_types"
import { ServiceUrl } from "../../../utils/constant/Constant"

export const applyNow = async (payload:ApplicantModel)=>{
    return postRequest<ApplicantModel,ApiResponse>(ServiceUrl.APPLY_JOB,payload);
}

