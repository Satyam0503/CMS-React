import {
  BaseModel,
  DateRangeFilter,
  PaginationModel,
} from "../../../utils/common_types";

export interface PublicJobApplicationResponse { applicationReference: string; resumeUploadToken: string; tokenExpiresAt: string; jobTitle: string; companyName: string; }

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
  isHired?: boolean;
  employeeUserId?: string;
  employeeId?: string;
  finalInterviewScore?: number | null;
  finalInterviewRating?: number | null;
  finalInterviewRecommendation?: string | null;
  evaluatedRoundsCount?: number | null;
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
  totalApplication?: number;
  summary?: string;
  location?: string;
  workplaceType?: string;
  employmentType?: string;
  experienceMin?: number | null;
  experienceMax?: number | null;
  department?: string;
  functionalArea?: string;
  industry?: string;
  roleCategory?: string;
  educationRequirement?: string;
  responsibilities?: string[];
  requiredSkills?: string[];
  preferredSkills?: string[];
  benefits?: string[];
  keywords?: string[];
  shiftType?: string;
  workingDays?: string;
  recruiterContactEmail?: string;
  applicationMode?: "Internal" | "External";
  externalApplicationUrl?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  showSalary?: boolean;
  isWalkIn?: boolean;
  walkInStartAt?: string | null;
  walkInEndAt?: string | null;
  walkInAddress?: string;
  applicationDeadline?: string | null;
  publishToCareerPortal?: boolean;
  publishToMasterPortal?: boolean;
  isFeatured?: boolean;
  isUrgentHiring?: boolean;
  screeningPassScore?: number | null;
  screeningCriteria?: string[];
  workflowMode?: "Inherit" | "Direct" | "Standard" | "Enterprise";
  requireInterview?: boolean | null;
  requirePreboarding?: boolean | null;
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

export interface RecruitmentApplicationStageCommand { applicationId?: string; applicantId: string; vacancyId: string; stage: "New" | "InProgress" | "OnHold" | "Shortlisted" | "Selected" | "Rejected" | "ReApply"; pipelineSnapshot?: string | null; reason?: string | null; idempotencyKey: string; expectedVersion?: number; }

export interface RecruitmentInterviewCommand {
  interviewId?: string;
  applicantId: string;
  vacancyId: string;
  title: string;
  startsAtUtc: string;
  endsAtUtc: string;
  timeZoneId?: string;
  location?: string | null;
  meetingUrl?: string | null;
  panelistUserIds?: string[];
  idempotencyKey: string;
  expectedVersion?: number;
  status?: "Draft" | "Scheduled" | "Confirmed" | "Cancelled" | "Completed";
}

export interface RecruitmentResumeExtractionReviewCommand { reviewId?: string; applicantId: string; vacancyId: string; resumeVersion?: string | null; extractedFields: Record<string, string>; decision: "Pending" | "Approved" | "Rejected"; notes?: string | null; idempotencyKey: string; expectedVersion?: number; }
export interface RecruitmentCandidateOfferActionCommand { token: string; decision: "Accepted" | "Declined" | "RequestOfferChange"; message?: string | null; idempotencyKey: string; }
export interface RecruitmentCandidateOfferDetails {
  offerId: string;
  candidateName: string;
  jobTitle: string;
  currency: string;
  salary: number;
  totalCtc: number;
  startDateUtc?: string | null;
  expiresAtUtc?: string | null;
  status: string;
  actionType: string;
}
export interface RecruitmentCandidatePrivacyCommand { applicantId: string; action: "Grant" | "Revoke" | "Anonymize"; retentionDays?: number; idempotencyKey: string; reason?: string | null; }

export interface RecruitmentOfferVersion { offerVersionId: string; offerId: string; applicantId: string; versionNumber: number; salary: number; compensationComponents?: Record<string, number>; totalCtc?: number; status: string; currency: string; }
export interface RecruitmentOfferVersionCommand { offerId: string; salary: number; currency: string; startDateUtc?: string | null; status: "Draft" | "PendingApproval" | "Approved" | "Sent" | "RevisedSent"; versionReason?: string | null; approvalReference?: string | null; expiresAtUtc?: string | null; idempotencyKey: string; expectedVersionNumber?: number; }
export interface RecruitmentOfferCounterRequest { counterRequestId: string; offerId: string; applicantId: string; baseVersionNumber: number; requestedSalary: number; requestedCurrency: string; requestedStartDateUtc?: string | null; message?: string | null; status: string; negotiationRound: number; resolutionNote?: string | null; }
export interface RecruitmentOfferCounterCommand { offerId: string; requestedSalary: number; requestedCurrency: string; requestedStartDateUtc?: string | null; message?: string | null; idempotencyKey: string; expectedBaseVersionNumber?: number; }
export interface RecruitmentOfferCounterDecisionCommand { counterRequestId: string; decision: "Approved" | "Rejected"; resolutionNote?: string | null; approvedSalary?: number | null; approvedCurrency?: string | null; approvedStartDateUtc?: string | null; idempotencyKey: string; expectedBaseVersionNumber?: number | null; }

export interface RecruitmentHiringDecisionCommand { decisionId?: string; applicantId: string; vacancyId: string; decision: "Approve" | "Hold" | "Reject"; notes?: string | null; idempotencyKey: string; expectedVersion?: number; }

export interface RecruitmentOfferCommand {
  offerId?: string;
  applicantId: string;
  vacancyId: string;
  salary: number;
  currency: string;
  startDateUtc?: string | null;
  compensationComponents?: Record<string, number>;
  approvalReference?: string | null;
  expiresAtUtc?: string | null;
  idempotencyKey: string;
  expectedVersion?: number;
  status: "Draft" | "PendingApproval" | "Approved" | "Sent" | "ChangeRequested" | "Accepted" | "Declined" | "Expired" | "Withdrawn";
}

export interface RecruitmentOnboardingTask { code: string; title: string; status: "Pending" | "InProgress" | "Completed" | "Skipped"; assigneeUserId?: string | null; }
export interface RecruitmentOnboardingQueueItem { caseId: string; applicantId: string; employeeUserId: string; status: RecruitmentOnboardingCase["status"]; version: number; totalTasks: number; completedTasks: number; requiredPendingTasks: number; completionPercent: number; firstBlockingTaskCode?: string | null; firstBlockingTaskTitle?: string | null; updatedDate?: string | null; }
export interface RecruitmentOnboardingCase { caseId: string; applicantId: string; employeeUserId: string; status: "PendingActivation" | "InProgress" | "Completed"; tasks: RecruitmentOnboardingTask[]; version?: number; }
export interface RecruitmentOnboardingUpdateCommand { caseId: string; status: RecruitmentOnboardingCase["status"]; tasks: Array<{ code: string; status: RecruitmentOnboardingTask["status"] }>; idempotencyKey: string; expectedVersion?: number; }

export interface CandidateHandoffRequest {
  applicantId: string;
  idempotencyKey: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  roleId?: string;
  departmentId?: string;
  jobRoleId?: string;
  gender?: string;
  reportingManager?: string;
  scheduleId?: string;
  autoCompletePreboarding?: boolean;
}

export interface RecruitmentRequisitionCommand {
  requisitionId?: string;
  vacancyId: string;
  positionTitle: string;
  departmentId?: string | null;
  location?: string | null;
  employmentType?: string | null;
  hiringManagerUserId?: string | null;
  costCenter?: string | null;
  targetStartDateUtc?: string | null;
  justification?: string | null;
  headcount: number;
  approvedHeadcount?: number | null;
  approvalReference?: string | null;
  idempotencyKey: string;
  expectedVersion?: number;
  status: "Draft" | "PendingApproval" | "Approved" | "Rejected" | "Closed";
}
export interface RecruitmentScorecardCriterionCommand {
  code?: string;
  name: string;
  rating: number;
  qualitativeLabel?: string | null;
  weight?: number | null;
  isMandatory?: boolean;
  notes?: string | null;
}

export interface RecruitmentScorecardCriterion {
  code?: string;
  name: string;
  rating: number;
  normalizedScore?: number | null;
  qualitativeLabel?: string | null;
  weight?: number | null;
  isMandatory?: boolean;
  notes?: string | null;
}

export interface RecruitmentQualitativeRatingLevel {
  label: string;
  value: number;
  description?: string | null;
}

export interface RecruitmentRatingScaleConfig {
  scaleType: "Numeric1To5" | "Numeric1To10" | "Numeric0To100" | "CustomNumeric" | "Qualitative";
  minRating: number;
  maxRating: number;
  step: number;
  normalizationMethod: "PercentageOfMax" | "MinMaxPercentage";
  levels: RecruitmentQualitativeRatingLevel[];
}

export interface RecruitmentCompetencyConfig {
  code: string;
  name: string;
  description?: string | null;
  weight: number;
  isMandatory: boolean;
  minScore?: number | null;
}

export interface RecruitmentInterviewPlanStageCommand {
  order: number;
  code: string;
  name: string;
  type?: string | null;
  requiredPanelSize: number;
  scorecardRequired: boolean;
  feedbackDueHours: number;
  weight?: number | null;
  passThreshold?: number | null;
  isMandatory?: boolean;
}

export interface RecruitmentInterviewPlanStage {
  order: number;
  code: string;
  name: string;
  type?: string | null;
  requiredPanelSize: number;
  scorecardRequired: boolean;
  feedbackDueHours: number;
  weight?: number | null;
  passThreshold?: number | null;
  isMandatory?: boolean;
}

export interface RecruitmentInterviewPlan {
  planId?: string;
  vacancyId?: string | null;
  name: string;
  isDefault: boolean;
  stages: RecruitmentInterviewPlanStage[];
  ratingScale?: RecruitmentRatingScaleConfig;
  competencies?: RecruitmentCompetencyConfig[];
  hiringTargetScore?: number;
  missingScorePolicy?: string;
  version?: number;
}

export interface RecruitmentInterviewPlanCommand {
  planId?: string;
  vacancyId?: string | null;
  name: string;
  isDefault: boolean;
  stages: RecruitmentInterviewPlanStageCommand[];
  ratingScale?: RecruitmentRatingScaleConfig;
  competencies?: RecruitmentCompetencyConfig[];
  hiringTargetScore?: number;
  missingScorePolicy?: string;
  idempotencyKey: string;
  expectedVersion?: number;
}

export interface RecruitmentInterviewDebriefCommand { interviewId: string; decision: "Advance" | "Hold" | "Reject"; notes?: string | null; idempotencyKey: string; expectedVersion?: number; }

export interface RecruitmentScorecardCommand {
  scorecardId?: string;
  applicantId: string;
  vacancyId: string;
  interviewId?: string | null;
  roundNumber?: number;
  feedbackDueAtUtc?: string | null;
  recommendation?: string | null;
  reviewerUserId: string;
  criteria: RecruitmentScorecardCriterionCommand[];
  idempotencyKey: string;
  expectedVersion?: number;
  status: "Draft" | "Submitted" | "Locked";
}
export interface RecruitmentTalentPoolCommand {
  memberId?: string;
  applicantId: string;
  poolName: string;
  tags: string[];
  notes?: string | null;
  idempotencyKey: string;
  expectedVersion?: number;
  status: "Active" | "Archived";
}

export interface RecruitmentDuplicateLookupRequest { applicantId?: string; email?: string; phone?: string; linkedInUrl?: string; }
export interface RecruitmentDuplicateCandidate { applicantId: string; fullName: string; email?: string; phone?: string; linkedInUrl?: string; matchReasons: string[]; }

export interface RecruitmentApplicantMergeCommand { sourceApplicantId: string; targetApplicantId: string; idempotencyKey: string; expectedSourceVersion?: number; reason?: string | null; }
export interface RecruitmentOfferApprovalPolicy { policyId?: string; vacancyId?: string | null; legalEntityId?: string | null; departmentId?: string | null; grade?: string | null; currency: string; approvalThreshold: number; requireApprovalReference: boolean; approverRoleId?: string | null; delegatedApproverUserId?: string | null; delegationExpiresAtUtc?: string | null; version?: number; }
export interface RecruitmentOfferApprovalPolicyCommand { policyId?: string; vacancyId?: string | null; legalEntityId?: string | null; departmentId?: string | null; grade?: string | null; currency: string; approvalThreshold: number; requireApprovalReference: boolean; approverRoleId?: string | null; delegatedApproverUserId?: string | null; delegationExpiresAtUtc?: string | null; idempotencyKey: string; expectedVersion?: number; }
export interface RecruitmentFeedbackSlaItem { interviewId: string; applicantId: string; vacancyId: string; roundNumber: number; dueAtUtc: string; assignedInterviewers: number; submittedScorecards: number; overdue: boolean; }
export interface RecruitmentCandidateShareCommand { applicantId: string; sharedWithUserId: string; scope?: "View"; expiresAtUtc?: string | null; idempotencyKey: string; }
export interface RecruitmentCandidateShareItem { shareId: string; applicantId: string; sharedWithUserId: string; scope: string; expiresAtUtc?: string | null; revokedAtUtc?: string | null; }
export interface RecruitmentFeedbackSlaReport { totalOpenRounds: number; overdueRounds: number; items: RecruitmentFeedbackSlaItem[]; }
export interface RecruitmentAnalytics { totalApplicants: number; activeApplicants: number; rejectedApplicants: number; mergedApplicants: number; byStage: Record<string, number>; averageTimeToHireDays?: number | null; timeToHireSampleSize?: number; }
export interface RecruitmentStageSlaPolicyCommand { stage: string; targetHours: number; enabled: boolean; location?: string | null; idempotencyKey: string; }
export interface RecruitmentEnterpriseConfig { configId?: string; locations: string[]; recruitmentMode: "Simple" | "Standard" | "Enterprise"; enableSla: boolean; enableAutomation: boolean; applicationReview: boolean; hiringManagerReview: boolean; interviewRounds: boolean; parallelPanels: boolean; scorecards: boolean; offerApproval: boolean; offerNegotiation: boolean; candidateEmailActions: boolean; requisitions: boolean; slaTracking: boolean; automation: boolean; internalMobility: boolean; rehireLinks: boolean; autoAdvanceOnScreening?: boolean; requireInterviewBeforeDecision?: boolean; requirePreboardingBeforeHandoff?: boolean; allowMultiVacancyApplications?: boolean; allowJobWorkflowCustomization?: boolean; defaultTimezone?: string | null; configSource?: string; overriddenFields?: string[]; screeningCriteria?: string[]; screeningPassScore?: number; preboardingChecklist?: string[]; compensationSchemeName?: string; compensationCurrency?: string; compensationComponents?: Record<string, number>; defaultCandidateRetentionDays?: number; offerLetterSubjectTemplate?: string; offerLetterBodyTemplate?: string; }
export interface RecruitmentEnterpriseConfigCommand { locations: string[]; recruitmentMode: "Simple" | "Standard" | "Enterprise"; enableSla: boolean; enableAutomation: boolean; applicationReview?: boolean; hiringManagerReview?: boolean; interviewRounds?: boolean; parallelPanels?: boolean; scorecards?: boolean; offerApproval?: boolean; offerNegotiation?: boolean; candidateEmailActions?: boolean; requisitions?: boolean; slaTracking?: boolean; automation?: boolean; internalMobility?: boolean; rehireLinks?: boolean; autoAdvanceOnScreening?: boolean; requireInterviewBeforeDecision?: boolean; requirePreboardingBeforeHandoff?: boolean; allowMultiVacancyApplications?: boolean; allowJobWorkflowCustomization?: boolean; defaultTimezone?: string | null; resetToDefaults?: boolean; idempotencyKey: string; screeningCriteria?: string[]; screeningPassScore?: number; preboardingChecklist?: string[]; compensationSchemeName?: string; compensationCurrency?: string; compensationComponents?: Record<string, number>; defaultCandidateRetentionDays?: number; offerLetterSubjectTemplate?: string; offerLetterBodyTemplate?: string; }
export interface RecruitmentRelationshipLinkCommand { applicantId: string; relationshipType: "InternalMobility" | "Rehire"; relatedPersonId: string; notes?: string | null; idempotencyKey: string; }
export interface RecruitmentAutomationEventCommand { eventType: string; applicantId?: string | null; payload: Record<string, string>; idempotencyKey: string; }



export interface RecruitmentWorkflowAction {
  code: string;
  enabled: boolean;
  disabledReason?: string | null;
}

export interface RecruitmentWorkflow {
  applicantId: string;
  currentStage: number;
  pipelineVersion: number;
  actions: RecruitmentWorkflowAction[];
}

export interface RecruitmentScreeningCriterionCommand {
  name: string;
  passed: boolean;
  notes?: string | null;
}

export interface RecruitmentScreeningBulkItem { applicantId: string; vacancyId: string; }
export interface RecruitmentScreeningBulkCommand { items: RecruitmentScreeningBulkItem[]; decision: "Pending" | "Pass" | "Hold" | "Reject"; score: number; criteria: RecruitmentScreeningCriterionCommand[]; evidence?: string | null; rejectionReason?: string | null; idempotencyKey: string; }
export interface RecruitmentScreeningBulkResult { succeeded: number; failed: number; failedApplicantIds: string[]; }
export interface RecruitmentScreeningQueueItem { applicantId: string; vacancyId: string; applicantName: string; email?: string | null; reviewId: string; decision: "Pending" | "Hold"; score: number; reviewerUserId?: string | null; rejectionReason?: string | null; submittedAtUtc: string; ageHours: number; overdue: boolean; }
export interface RecruitmentScreeningQueueReport { totalPending: number; overdueCount: number; items: RecruitmentScreeningQueueItem[]; }

export interface RecruitmentScreeningReviewCommand {
  reviewId?: string;
  applicantId: string;
  vacancyId: string;
  reviewerUserId?: string;
  resumeVersion?: string | null;
  score: number;
  decision: "Pending" | "Pass" | "Hold" | "Reject";
  rejectionReason?: string | null;
  evidence?: string | null;
  criteria: RecruitmentScreeningCriterionCommand[];
  idempotencyKey: string;
  expectedVersion?: number;
}



























export interface RecruitmentApplicationStageEvent { fromStage: string; toStage: string; actorUserId: string; changedAtUtc: string; reason?: string | null; }

export interface RecruitmentSelectedCandidateQueueItem { applicantId: string; vacancyId: string; applicantName: string; email?: string | null; stage: string; isEmployee: boolean; selectedAtUtc: string; }

export interface RecruitmentOfferPendingQueueItem { offerId: string; applicantId: string; vacancyId: string; applicantName: string; status: string; salary: number; currency: string; approvalRequired: boolean; }

export interface RecruitmentPreboardingQueueItem { caseId: string; applicantId: string; offerId: string; status: string; ownerUserId: string; pendingTaskCount: number; readyForHire: boolean; firstBlockerCode?: string | null; }

export interface RecruitmentPreboardingUpdateCommand { caseId: string; status: string; tasks: Array<{ code: string; status: string; assigneeUserId?: string | null }>; expectedVersion?: number; idempotencyKey: string; }

export interface RecruitmentRoundScoreBreakdown {
  roundNumber: number;
  stageName: string;
  stageType?: string | null;
  normalizedScore: number;
  rawRating: number;
  weight?: number | null;
  passThreshold?: number | null;
  passedThreshold: boolean;
  isMandatory: boolean;
  scorecardsCount: number;
  requiredPanelSize: number;
  quorumMet: boolean;
  consensusRecommendation: string;
}

export interface RecruitmentCompetencyScoreBreakdown {
  code: string;
  name: string;
  normalizedScore: number;
  rawRating: number;
  weight?: number | null;
  minScore?: number | null;
  isMandatory: boolean;
  passed: boolean;
  ratingCount: number;
}

export interface RecruitmentFinalScoreResult {
  finalInterviewScore: number;
  finalInterviewRating: number;
  finalInterviewRecommendation: string;
  evaluatedRoundsCount: number;
  totalScorecardsCount: number;
  excludesHrRound: boolean;
  evaluatedRoundNumbers: number[];
  passedMandatoryGates?: boolean;
  mandatoryGateFailures?: string[];
  targetScore?: number;
  meetsHiringTarget?: boolean;
  scaleType?: string;
  normalizationFormula?: string;
  roundBreakdowns?: RecruitmentRoundScoreBreakdown[];
  competencyBreakdowns?: RecruitmentCompetencyScoreBreakdown[];
}




