import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  Applicant,
  ApplicantModel,
  CommentModel,
  CommentResponseModel,
  GetAllVacancyPayload,
  ApplicationPayload,
  GetCommentPayloadModel,
  JobModal,
  ProcessLogPayoadModel,
} from "./models";

export const addJobVacancy = async (payload: JobModal) => {
  return postRequest<JobModal, ResponseData<JobModal>>(
    ServiceUrl.ADD_JOB_VACANCY,
    payload
  );
};
export const editJobVacancy = async (payload: JobModal, jobId: string) => {
  return postRequest<JobModal, ResponseData<JobModal>>(
    `${ServiceUrl.EDIT_JOB_VACANCY}?jobId=${jobId}`,
    payload
  );
};

export const getAllJobVacancies = async (payload: GetAllVacancyPayload) => {
  return postRequest<GetAllVacancyPayload, ResponseData<JobModal>>(
    ServiceUrl.GET_ALL_VACANCIES,
    payload
  );
};

export const deleteJobVacancy = (vacancyId: string) => {
  return deleteRequest<ApiResponse>(ServiceUrl.DELETE_VACANCY, {
    params: { vacancyId: vacancyId },
  });
};

// applicant services
export const getAllApplicantList = async (
  filters: ApplicationPayload | null
) => {
  return postRequest<ApplicationPayload | null, ResponseData<Applicant>>(
    ServiceUrl.GET_ALL_APPLICANTS,
    filters
  );
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
  return getRequest<ResponseData<Applicant>>(
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
  return postRequest<ProcessLogPayoadModel, ResponseData<CommentResponseModel>>(
    ServiceUrl.GET_PROCESS_LOG,
    payload
  );
};

export const addComment = async (payload: CommentModel) => {
  return postRequest<CommentModel, ApiResponse>(
    ServiceUrl.ADD_COMMENT,
    payload
  );
};

export const getApplicantComments = async (payload: GetCommentPayloadModel) => {
  return getRequest<ResponseData<CommentResponseModel>>(
    `${ServiceUrl.GET_APPLICANT_COMMENTS}/${payload.applicantId}?pageNo=${payload.pageNo}&pageSize=${payload.pageSize}`
  );
};
