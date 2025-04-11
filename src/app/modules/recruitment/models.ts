import { Dayjs } from "dayjs";
import { BaseModel, ResponseData } from "../../../utils/common_types";

export interface ApplicantModel {
  applicantId: string;
  firstName: string;
  lastName: string;
  state: string;
  email: string;
  phone: string;
  vacancyId: string;
  experience: number;
  status: number;
  activityType: number;
  resume?: null | File;
}

export type EditApplicantModel = Omit<ApplicantModel, "experience"> & {
  experienceInYears: number;
  experienceInMonths: number;
};

export type Applicant = Omit<ApplicantModel, "resume"> & {
  vacancyName: string;
  statusName: string;
  status: number;
  activityTypeName: string;
  applyDate: string;
  updateDate: string;
  resumeUrl: string;
  fullApplicantResumePath: string;
};
export interface GetApplicationPayloadModel {
  name: string;
  filterFrom?: null | Dayjs | string;
  filterTo?: null | Dayjs | string;
  activityTypes?: number[];
  vacancyIds?: string[];
  status?: number[];
  minExperience?: number | string | null;
  maxExperience?: number | string | null;
}

export interface ApplicationFilterModel {
  filterFrom: null | Dayjs | string;
  filterTo: null | Dayjs | string;
  activityTypes: number[];
  vacancyIds: string[];
  status: number[];
  minExperience: number | string;
  maxExperience: number | string;
}

export interface ProcessLogFilterModel {
  jobRole: string;
  activityCategory: number[];
  filterFrom: null | Dayjs | string;
  filterTo: null | Dayjs | string;
}

export interface JobsFilterModel {
  jobType: string;
  status: number;
}

export interface JobModal {
  jobId: string;
  companyId?: string;
  title: string;
  vacancies: number;
  jobType: string;
  status: boolean;
  description: string;
}

export interface CommentModel {
  applicantId: string;
  userId: string;
  description: string;
  activityCategory: number;
  jobTitle: string;
}

export type ProcessLogPayoadModel = ProcessLogFilterModel & {
  pageNo: number;
  pageSize: number;
  applicantName: string;
};
export type GetCommentPayloadModel = {
  pageNo: number;
  pageSize: number;
  applicantId: string;
};

export type CommentResponseModel = CommentModel &
  BaseModel & {
    id: string;
    userName: string;
  };

export type JobsResponseData = ResponseData<JobModal>;
export type ApplicantsResponseData = ResponseData<Applicant>;
export type CommentResponseData = ResponseData<CommentResponseModel>;
