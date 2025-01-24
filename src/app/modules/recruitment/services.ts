
import { getRequest, postRequest } from "../../../server/axios"
import { JobsResponseData, JobModal } from "../../../utils/common_types"
import { ServiceUrl } from "../../../utils/constant/Constant"

export const addJobVacancy = (payload:JobModal,token:string)=>{
    return postRequest<JobModal,JobsResponseData>(ServiceUrl.ADD_JOB_VACANCY,payload,{},false,token);
}
export const editJobVacancy = (payload:JobModal,jobId:string, token:string)=>{
    return postRequest<JobModal,JobsResponseData>(`${ServiceUrl.EDIT_JOB_VACANCY}?jobId=${jobId}`,payload,{},false,token);
}

export const getAllJobVacancies = (token:string)=>{
    return getRequest<JobsResponseData>(ServiceUrl.GET_ALL_JOBS,{},token);
}

export const deleteJobVacancy = ()=>{
    
}