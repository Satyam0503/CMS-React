import { getRequest, postRequest } from "../../../server/axios";
import {
  JobsResponseData,
  JobModal,
  ApplicantsResponseData,
  ApplicantModel,
  ApiResponse,
  CommentResponseData,
  CommentModel,
} from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";

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

export const getAllJobVacancies = async () => {
  return getRequest<JobsResponseData>(ServiceUrl.GET_ALL_JOBS);
};

export const deleteJobVacancy = () => {};

// applicant services
export const getAllApplicantList = async () => {
  return getRequest<ApplicantsResponseData>(ServiceUrl.GET_ALL_APPLICANTS);
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