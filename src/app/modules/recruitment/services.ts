
import { getRequest, postRequest } from "../../../server/axios"
import { JobsResponseData, JobModal, ApplicantsResponseData, ApplicantModel, ApiResponse } from "../../../utils/common_types"
import { ServiceUrl } from "../../../utils/constant/Constant"

export const addJobVacancy = (payload:JobModal)=>{
    return postRequest<JobModal,JobsResponseData>(ServiceUrl.ADD_JOB_VACANCY,payload);
}
export const editJobVacancy = (payload:JobModal,jobId:string)=>{
    return postRequest<JobModal,JobsResponseData>(`${ServiceUrl.EDIT_JOB_VACANCY}?jobId=${jobId}`,payload);
}

export const getAllJobVacancies = ()=>{
    return getRequest<JobsResponseData>(ServiceUrl.GET_ALL_JOBS);
}

export const deleteJobVacancy = ()=>{
    
}

// applicant services
export const getAllApplicantList= ()=>{
    return getRequest<ApplicantsResponseData>(ServiceUrl.GET_ALL_APPLICANTS);
}

export const addApplicant = (payload:ApplicantModel )=>{
    return postRequest<ApplicantModel,ApiResponse>(ServiceUrl.ADD_APPLICANT,payload);
}

export const getApplicantById = () =>{
    return getRequest(ServiceUrl.ADD_APPLICANT);
}