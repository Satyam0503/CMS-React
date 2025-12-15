import {
  BaseModel,
  DateRangeFilter,
  PaginationModel,
} from "../../../utils/common_types";

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
  status: number;
  applyDate: string;
  resumeUrl: string | null;
};

export interface ApplicationFilterModel extends DateRangeFilter {
  activityTypes: number[];
  vacancyIds: string[];
  status: number[];
  minExperience: number | null;
  maxExperience: number | null;
}

export interface ApplicationPayload extends ApplicationFilterModel, PaginationModel {
  name: string;
}

export interface ProcessLogFilterModel extends DateRangeFilter {
  jobRole: string;
  activityCategory: number[];
}

export interface JobsFilterModel {
  jobTypes: number[];
  status: number | null;
}

export interface JobModal {
  jobId: string;
  companyId?: string;
  title: string;
  vacancies: number;
  jobType: number;
  status: boolean;
  description: string;
  totalSubmissions?: number;
}

export interface CommentModel {
  applicantId: string;
  userId: string;
  description: string;
  activityCategory: number;
  jobTitle: string;
}

export interface ProcessLogPayoadModel extends ProcessLogFilterModel, PaginationModel {
  applicantName: string;
}
export interface GetCommentPayloadModel extends PaginationModel {
  applicantId: string;
}

export type GetAllVacancyPayload = {
  pageNo?: number;
  records?: number;
  search?: string;
  jobTypes: number[];
  status: boolean | null;
};

export type CommentResponseModel = CommentModel &
  BaseModel & {
    id: string;
    userName: string;
  };
