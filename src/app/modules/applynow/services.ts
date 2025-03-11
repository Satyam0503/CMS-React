import { postRequest } from "../../../server/axios"
import { ApiResponse } from "../../../utils/common_types"
import { ServiceUrl } from "../../../utils/constant/Constant"
import { ApplicantModel } from "../recruitment/models";

export const applyNow = async (payload:ApplicantModel)=>{
    return postRequest<ApplicantModel,ApiResponse>(ServiceUrl.APPLY_JOB,payload);
}

