import { deleteRequest, getBlobRequest, getRequest, postRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/data";
import {
  Applicant,
  RecruitmentWorkflow,
  RecruitmentScreeningReviewCommand,
  ApplicantModel,
  CommentModel,
  CommentResponseModel,
  GetAllVacancyPayload,
  ApplicationPayload,
  GetCommentPayloadModel,
  JobModal,
  ProcessLogPayoadModel,
  RecruitmentApplicationStageCommand, RecruitmentInterviewCommand, RecruitmentInterviewDebriefCommand, RecruitmentFeedbackSlaReport, RecruitmentOfferApprovalPolicy, RecruitmentOfferApprovalPolicyCommand, RecruitmentInterviewPlan, RecruitmentInterviewPlanCommand,
  RecruitmentOfferCommand,
  CandidateHandoffRequest,
  RecruitmentRequisitionCommand,
  RecruitmentScorecardCommand,
  RecruitmentTalentPoolCommand,
  RecruitmentDuplicateLookupRequest,
  RecruitmentDuplicateCandidate,
  RecruitmentApplicantMergeCommand, RecruitmentAnalytics, RecruitmentEnterpriseConfig, RecruitmentStageSlaPolicyCommand, RecruitmentEnterpriseConfigCommand, RecruitmentRelationshipLinkCommand, RecruitmentAutomationEventCommand, RecruitmentOnboardingCase, RecruitmentOnboardingUpdateCommand, RecruitmentScreeningQueueReport, RecruitmentHiringDecisionCommand, RecruitmentCandidatePrivacyCommand, RecruitmentCandidateOfferActionCommand, RecruitmentOfferVersionCommand, RecruitmentOfferCounterCommand, RecruitmentResumeExtractionReviewCommand,
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

export const getRecruitmentWorkflow = async (applicantId: string) => getRequest<ResponseData<RecruitmentWorkflow>>(`${ServiceUrl.GET_APPLICANT_WORKFLOW}/${applicantId}`);

export const getApplicantById = async (applicantId: string) => {
  return getRequest<ResponseData<Applicant>>(
    `${ServiceUrl.GET_APPLICANT_BY_ID}?id=${applicantId}`
  );
};

export const uploadResumeForApplicant = async (applicantId: string, payload: FormData) => {
  return postRequest<FormData, ApiResponse>(
    `${ServiceUrl.UPLOAD_RESUME_FOR_APPLICANT}/${encodeURIComponent(applicantId)}`,
    payload,
    {},
    true
  );
};

export const exportRecruitmentAudit = async (payload?: { applicantId?: string; eventType?: string; fromUtc?: string; toUtc?: string; limit?: number }) => {
  const params = new URLSearchParams();
  Object.entries(payload ?? {}).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") params.set(key, String(value)); });
  return getBlobRequest(`${ServiceUrl.EXPORT_RECRUITMENT_AUDIT}${params.toString() ? `?${params.toString()}` : ""}`);
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

export const upsertRecruitmentApplicationStage = async (payload: RecruitmentApplicationStageCommand) =>
  postRequest<RecruitmentApplicationStageCommand, ResponseData<string>>(ServiceUrl.UPSERT_APPLICATION_STAGE, payload);

export const queueRecruitmentFeedbackReminders = async (vacancyId?: string) =>
  postRequest<unknown, ResponseData<number>>(`${ServiceUrl.QUEUE_FEEDBACK_REMINDERS}${vacancyId ? `?vacancyId=${encodeURIComponent(vacancyId)}` : ""}`, {});

export const getRecruitmentOfferApprovalPolicy = async (vacancyId?: string) =>
  getRequest<ResponseData<RecruitmentOfferApprovalPolicy>>(`${ServiceUrl.GET_OFFER_APPROVAL_POLICY}${vacancyId ? `?vacancyId=${encodeURIComponent(vacancyId)}` : ""}`);
export const upsertRecruitmentOfferApprovalPolicy = async (payload: RecruitmentOfferApprovalPolicyCommand) =>
  postRequest<RecruitmentOfferApprovalPolicyCommand, ResponseData<string>>(ServiceUrl.UPSERT_OFFER_APPROVAL_POLICY, payload);

export const getRecruitmentFeedbackSla = async (vacancyId?: string) =>
  getRequest<ResponseData<RecruitmentFeedbackSlaReport>>(`${ServiceUrl.RECRUITMENT_FEEDBACK_SLA}${vacancyId ? `?vacancyId=${encodeURIComponent(vacancyId)}` : ""}`);

export const getRecruitmentInterviewPlan = async (vacancyId?: string) =>
  getRequest<ResponseData<RecruitmentInterviewPlan>>(`${ServiceUrl.GET_INTERVIEW_PLAN}${vacancyId ? `?vacancyId=${encodeURIComponent(vacancyId)}` : ""}`);

export const upsertRecruitmentInterviewPlan = async (payload: RecruitmentInterviewPlanCommand) =>
  postRequest<RecruitmentInterviewPlanCommand, ResponseData<string>>(ServiceUrl.UPSERT_INTERVIEW_PLAN, payload);

export const completeRecruitmentInterviewDebrief = async (payload: RecruitmentInterviewDebriefCommand) =>
  postRequest<RecruitmentInterviewDebriefCommand, ResponseData<string>>(ServiceUrl.COMPLETE_INTERVIEW_DEBRIEF, payload);

export const upsertRecruitmentInterview = async (payload: RecruitmentInterviewCommand) =>
  postRequest<RecruitmentInterviewCommand, ResponseData<string>>(
    ServiceUrl.UPSERT_INTERVIEW,
    payload
  );

export const createRecruitmentOfferVersion = async (payload: RecruitmentOfferVersionCommand) => postRequest<RecruitmentOfferVersionCommand, ResponseData<string>>(ServiceUrl.CREATE_OFFER_VERSION, payload);
export const requestRecruitmentOfferCounter = async (payload: RecruitmentOfferCounterCommand) => postRequest<RecruitmentOfferCounterCommand, ResponseData<string>>(ServiceUrl.REQUEST_OFFER_COUNTER, payload);
export const reviewRecruitmentResumeExtraction = async (payload: RecruitmentResumeExtractionReviewCommand) => postRequest<RecruitmentResumeExtractionReviewCommand, ResponseData<string>>(ServiceUrl.REVIEW_RESUME_EXTRACTION, payload);
export const respondToRecruitmentOffer = async (payload: RecruitmentCandidateOfferActionCommand) => postRequest<RecruitmentCandidateOfferActionCommand, ResponseData<string>>("api/recruitment/candidate-actions/offer/respond", payload);
export const applyRecruitmentCandidatePrivacy = async (payload: RecruitmentCandidatePrivacyCommand) => postRequest<RecruitmentCandidatePrivacyCommand, ResponseData<string>>(ServiceUrl.APPLY_CANDIDATE_PRIVACY, payload);
export const upsertRecruitmentHiringDecision = async (payload: RecruitmentHiringDecisionCommand) => postRequest<RecruitmentHiringDecisionCommand, ResponseData<string>>(ServiceUrl.UPSERT_HIRING_DECISION, payload);

export const upsertRecruitmentOffer = async (payload: RecruitmentOfferCommand) =>
  postRequest<RecruitmentOfferCommand, ResponseData<string>>(
    ServiceUrl.UPSERT_OFFER,
    payload
  );

export const getRecruitmentScreeningQueue = async (vacancyId?: string, overdueAfterHours = 48) => getRequest<ResponseData<RecruitmentScreeningQueueReport>>(ServiceUrl.RECRUITMENT_SCREENING_QUEUE, { params: { vacancyId, overdueAfterHours } });
export const getRecruitmentOnboarding = async (applicantId: string) => getRequest<ResponseData<RecruitmentOnboardingCase>>(`${ServiceUrl.GET_ONBOARDING_BY_APPLICANT}/${encodeURIComponent(applicantId)}`);
export const updateRecruitmentOnboarding = async (payload: RecruitmentOnboardingUpdateCommand) => postRequest<RecruitmentOnboardingUpdateCommand, ResponseData<string>>(ServiceUrl.UPDATE_ONBOARDING, payload);

export const handoffCandidateToPreboarding = async (payload: CandidateHandoffRequest) =>
  postRequest<CandidateHandoffRequest, ResponseData<string>>(
    ServiceUrl.HANDOFF_TO_PREBOARDING,
    payload
  );


export const upsertRecruitmentRequisition = async (payload: RecruitmentRequisitionCommand) =>
  postRequest<RecruitmentRequisitionCommand, ResponseData<string>>(
    ServiceUrl.UPSERT_REQUISITION,
    payload
  );
export const upsertRecruitmentScreening = async (payload: RecruitmentScreeningReviewCommand) => postRequest<RecruitmentScreeningReviewCommand, ResponseData<string>>(ServiceUrl.UPSERT_SCREENING, payload);

export const upsertRecruitmentScorecard = async (payload: RecruitmentScorecardCommand) =>
  postRequest<RecruitmentScorecardCommand, ResponseData<string>>(
    ServiceUrl.UPSERT_SCORECARD,
    payload
  );
export const upsertRecruitmentTalentPool = async (payload: RecruitmentTalentPoolCommand) =>
  postRequest<RecruitmentTalentPoolCommand, ResponseData<string>>(
    ServiceUrl.UPSERT_TALENT_POOL,
    payload
  );



export const findRecruitmentDuplicates = async (payload: RecruitmentDuplicateLookupRequest) =>
  getRequest<ResponseData<RecruitmentDuplicateCandidate>>(
    ServiceUrl.FIND_DUPLICATES,
    { params: payload }
  );



export const mergeRecruitmentApplicants = async (payload: RecruitmentApplicantMergeCommand) => postRequest<RecruitmentApplicantMergeCommand, ResponseData<string>>(ServiceUrl.MERGE_APPLICANTS, payload);
export const getRecruitmentAnalytics = async (vacancyId?: string) => getRequest<ResponseData<RecruitmentAnalytics>>(ServiceUrl.RECRUITMENT_ANALYTICS, { params: { vacancyId } });
export const upsertRecruitmentSlaPolicy = async (payload: RecruitmentStageSlaPolicyCommand) => postRequest<RecruitmentStageSlaPolicyCommand, ResponseData<string>>(ServiceUrl.UPSERT_RECRUITMENT_SLA, payload);
export const getRecruitmentEnterpriseConfig = async () => getRequest<ResponseData<RecruitmentEnterpriseConfig>>(ServiceUrl.GET_RECRUITMENT_CONFIG);
export const upsertRecruitmentEnterpriseConfig = async (payload: RecruitmentEnterpriseConfigCommand) => postRequest<RecruitmentEnterpriseConfigCommand, ResponseData<string>>(ServiceUrl.UPSERT_RECRUITMENT_CONFIG, payload);
export const linkRecruitmentRelationship = async (payload: RecruitmentRelationshipLinkCommand) => postRequest<RecruitmentRelationshipLinkCommand, ResponseData<string>>(ServiceUrl.LINK_RECRUITMENT_RELATIONSHIP, payload);
export const queueRecruitmentAutomation = async (payload: RecruitmentAutomationEventCommand) => postRequest<RecruitmentAutomationEventCommand, ResponseData<string>>(ServiceUrl.QUEUE_RECRUITMENT_AUTOMATION, payload);




























