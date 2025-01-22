
import { getRequest, postRequest } from "../../../server/axios"
import { AddJobResponseData, JobModal } from "../../../utils/common_types"
import { ServiceUrl } from "../../../utils/constant/Constant"

export const addJobVacancy = (payload:JobModal,token:string)=>{
    return postRequest<JobModal,AddJobResponseData>(ServiceUrl.ADD_JOB_VACANCY,payload,{},false,token);
}

export const getAllJobs = (token:string)=>{
    return getRequest<AddJobResponseData>(ServiceUrl.GET_ALL_JOBS,{},token);
}