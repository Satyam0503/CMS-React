import { getRequest, postRequest } from "../../../server/axios";
import { ResponseData } from "../../../utils/common_types";
import {
  PublicJobApplicationPayload,
  PublicJobApplicationResponse,
  PublicJobDetails,
  PublicJobSummary,
} from "./publicCareerTypes";

export const getPublicJobs = (params?: Record<string, unknown>) =>
  getRequest<ResponseData<PublicJobSummary>>("api/public/jobs", { params });

export const getCompanyPublicJobs = (
  companyCode: string,
  params?: Record<string, unknown>,
) =>
  getRequest<ResponseData<PublicJobSummary>>(
    `api/public/companies/${encodeURIComponent(companyCode)}/jobs`,
    { params },
  );

export const getPublicJobBySlug = (jobSlug: string) =>
  getRequest<ResponseData<PublicJobDetails>>(
    `api/public/jobs/by-slug/${encodeURIComponent(jobSlug)}`,
  );

export const applyForPublicJob = (
  publicJobId: string,
  payload: PublicJobApplicationPayload,
) =>
  postRequest<PublicJobApplicationPayload, ResponseData<PublicJobApplicationResponse>>(
    `api/public/jobs/${encodeURIComponent(publicJobId)}/applications`,
    payload,
  );

export const uploadPublicResume = (
  applicationReference: string,
  token: string,
  resume: File,
) => {
  const formData = new FormData();
  formData.append("token", token);
  formData.append("resume", resume);
  return postRequest<FormData, ResponseData<{ applicationReference: string }>>(
    `api/public/applications/${encodeURIComponent(applicationReference)}/resume`,
    formData,
    undefined,
    true,
  );
};
