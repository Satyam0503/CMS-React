
import { getRequest, postRequest } from "../../../server/axios"
import { JobsResponseData, JobModal, ApplicantsResponseData, ApplicantModel, ApiResponse } from "../../../utils/common_types"
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

// applicant services

export const getAllApplicantList= (token:string)=>{
    return getRequest<ApplicantsResponseData>(ServiceUrl.GET_ALL_APPLICANTS,{},token);
}

export const addEditApplicant = (payload:ApplicantModel, token:string)=>{
    return postRequest<ApplicantModel,ApiResponse>(ServiceUrl.ADD_EDIT_APPLICANT,payload,{},false,token);
}