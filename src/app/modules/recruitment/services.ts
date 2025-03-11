import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import {
  ApiResponse,  
} from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { ApplicantModel, ApplicantsResponseData, CommentModel, CommentResponseData, GetApplicationPayloadModel, JobModal, JobsResponseData } from "./models";

export const addJobVacancy = async (payload: JobModal) => {
  return postRequest<JobModal, JobsResponseData>(
    ServiceUrl.ADD_JOB_VACANCY,
    payload
  );
};
export const editJobVacancy = async (payload: JobModal, jobId: string) => {
  return postRequest<JobModal, JobsResponseData>(
    `${ServiceUrl.EDIT_JOB_VACANCY}?jobId=${jobId}`,
    payload
  );
};

export const getAllJobVacancies = async (payload:{companyId:string}={companyId:""},pageNo:number=0,records:number=0,) => {
  return postRequest<{companyId:string},JobsResponseData>(`${ServiceUrl.GET_ALL_VACANCIES}?pageNo=${pageNo}&records=${records}`,payload);
};

export const deleteJobVacancy = (vacancyId:string) => {
  return deleteRequest<ApiResponse>(ServiceUrl.DELETE_VACANCY,{params:{vacancyId:vacancyId}})
};

// applicant services
export const getAllApplicantList = async (filters:GetApplicationPayloadModel, pageNo:number=0, records:number=0) => {
  return postRequest<GetApplicationPayloadModel, ApplicantsResponseData>(`${ServiceUrl.GET_ALL_APPLICANTS}?pageNo=${pageNo}&records=${records}`,filters);
};

export const addApplicant = async (payload: ApplicantModel) => {
  return postRequest<ApplicantModel, ApiResponse>(
    ServiceUrl.ADD_APPLICANT,
    payload
  );
};

export const editApplicant = async (payload:ApplicantModel)=>{
  return postRequest<ApplicantModel,ApiResponse>(ServiceUrl.EDIT_APPLICANT,payload);
} 

export const getApplicantById = async (applicantId: string) => {
  return getRequest<ApplicantsResponseData>(`${ServiceUrl.GET_APPLICANT_BY_ID}?id=${applicantId}`);
};

export const uploadResume = async (email:string,payload:FormData)=>{
  return postRequest<FormData,ApiResponse>(`${ServiceUrl.UPLOAD_RESUME}?email=${email}`,payload,{},true);
}

export const addComment = async (payload:CommentModel) =>{
  return postRequest<CommentModel,ApiResponse>(ServiceUrl.ADD_COMMENT,payload);
}
 
export const getApplicantComments = async (applicantId:string)=>{
  return getRequest<CommentResponseData>(`${ServiceUrl.GET_APPLICANT_COMMENTS}?applicantId=${applicantId}`);
}