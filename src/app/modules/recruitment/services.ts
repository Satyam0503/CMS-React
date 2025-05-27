import { get } from "http";
import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import { ApiResponse } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { ApplicantModel, ApplicantsResponseData, CommentModel, CommentResponseData, GetAllVacancyPayload, GetApplicationPayloadModel, GetCommentPayloadModel, JobModal, JobsResponseData, ProcessLogPayoadModel } from "./models";

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

export const getAllJobVacancies = async (payload: GetAllVacancyPayload | null, active: boolean = false) => {
  return postRequest<GetAllVacancyPayload | null, JobsResponseData>(active ? `${ServiceUrl.GET_ALL_VACANCIES}?active=${active}` : ServiceUrl.GET_ALL_VACANCIES, payload);
};

export const deleteJobVacancy = (vacancyId: string) => {
  return deleteRequest<ApiResponse>(ServiceUrl.DELETE_VACANCY, {
    params: { vacancyId: vacancyId },
  });
};

// applicant services
export const getAllApplicantList = async (filters: GetApplicationPayloadModel | null) => {
  return postRequest<GetApplicationPayloadModel | null, ApplicantsResponseData>(ServiceUrl.GET_ALL_APPLICANTS, filters);
};

export const addApplicant = async (payload: ApplicantModel) => {
  return postRequest<ApplicantModel, ApiResponse>(
    ServiceUrl.ADD_APPLICANT,
    payload
  );
};

export const editApplicant = async (payload: ApplicantModel) => {
  return postRequest<ApplicantModel, ApiResponse>(
    ServiceUrl.EDIT_APPLICANT,
    payload
  );
};

export const getApplicantById = async (applicantId: string) => {
  return getRequest<ApplicantsResponseData>(
    `${ServiceUrl.GET_APPLICANT_BY_ID}?id=${applicantId}`
  );
};

export const uploadResume = async (email: string, payload: FormData) => {
  return postRequest<FormData, ApiResponse>(
    `${ServiceUrl.UPLOAD_RESUME}?email=${email}`,
    payload,
    {},
    true
  );
};

export const getProcessLogData = async (payload: ProcessLogPayoadModel) => {
  return postRequest<ProcessLogPayoadModel, CommentResponseData>(ServiceUrl.GET_PROCESS_LOG, payload);
}

export const addComment = async (payload: CommentModel) => {
  return postRequest<CommentModel, ApiResponse>(
    ServiceUrl.ADD_COMMENT,
    payload
  );
};

export const getApplicantComments = async (payload: GetCommentPayloadModel) => {
  return getRequest<CommentResponseData>(
    `${ServiceUrl.GET_APPLICANT_COMMENTS}/${payload.applicantId}?pageNo=${payload.pageNo}&pageSize=${payload.pageSize}`
  );
};
