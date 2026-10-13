 import { deleteRequest, getBlobRequest, getRequest, patchRequest, postRequest, putRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/data";
import {
  BulkImportEmployeesRequest,
  BulkImportEmployeesResponse,
  CreateEmployeeSalary,
  CreateEmployeeSalaryResponseData,
  EditEmployeeResponseData,
  GetAllEmployeePayloadModel,
  GetAllEmployeeResponseData,
  InviteEmployeeResponse,
  InviteNewEmployeeModel,
  InitiateEmployeeExitRequest,
  ChangeEmployeeAvailabilityRequest,
  ChangeEmployeeLifecycleDimensionRequest,
} from "./models";
import { EditEmployeePayloadModel } from "../users/models";
import { GetAllDepartmentDetailsResponseData } from "../dashboard/model";

export const updateEmployee = async (
  payload: EditEmployeePayloadModel,
  userId: string,
) => {
  return postRequest<EditEmployeePayloadModel, EditEmployeeResponseData>(
    `${ServiceUrl.UPDATE_EMPLOYEE}?userId=${userId}`,
    payload,
  );
};

export type EditOwnProfilePayloadModel = Pick<
  EditEmployeePayloadModel,
  | "firstName"
  | "lastName"
  | "gender"
  | "dateOfBirth"
  | "phoneNumber"
  | "bloodGroup"
  | "personalEmail"
  | "emergencyContact"
  | "address"
>;

// Lets a user update their own profile without requiring the Employees module's Edit
// permission (that permission governs managing *other* employees). Always targets the
// caller's own account server-side; only accepts non-privileged, self-service fields.
export const updateOwnProfile = async (payload: EditOwnProfilePayloadModel) => {
  return postRequest<EditOwnProfilePayloadModel, EditEmployeeResponseData>(
    ServiceUrl.EDIT_OWN_PROFILE,
    payload,
  );
};

export const updateSalary = async (
  payload: CreateEmployeeSalary,
  userId: string,
  employeeId: string,
) => {
  return postRequest<CreateEmployeeSalary, CreateEmployeeSalaryResponseData>(
    `${ServiceUrl.UPDATE_SALARY}`,
    payload,
  );
};

export const deleteEmployee = async (employeeId: string) => {
  return deleteRequest<ApiResponse>(ServiceUrl.DELETE_EMPLOYEE, {
    params: { employeeId },
  });
};

export const getAllEmployees = async (
  payload: GetAllEmployeePayloadModel | null = null,
) => {
  return postRequest<
    GetAllEmployeePayloadModel | null,
    GetAllEmployeeResponseData
  >(ServiceUrl.GET_ALL_EMPLOYEE, payload);
};

export const initiateEmployeeExit = (payload: InitiateEmployeeExitRequest) =>
  postRequest<InitiateEmployeeExitRequest, ApiResponse>(
    ServiceUrl.INITIATE_EMPLOYEE_EXIT,
    payload,
  );

export type UpdateEmployeeContractRequest = { employeeUserId: string; version: number; startDate?: string; endDate?: string; action: "Extend" | "End"; reason?: string };
export const updateEmployeeContract = (payload: UpdateEmployeeContractRequest) =>
  postRequest<UpdateEmployeeContractRequest, ApiResponse>("api/User/EmployeeLifecycle/Contract", payload);

export const changeEmployeeAvailability = (payload: ChangeEmployeeAvailabilityRequest) =>
  postRequest<ChangeEmployeeAvailabilityRequest, ApiResponse>(
    "api/User/EmployeeLifecycle/Availability",
    payload,
  );

export const changeEmployeeLifecycleDimension = (payload: ChangeEmployeeLifecycleDimensionRequest) =>
  postRequest<ChangeEmployeeLifecycleDimensionRequest, ApiResponse>(
    "api/User/EmployeeLifecycle/Dimension", payload,
  );

export const getEmployeeLifecycleHistory = (employeeUserId: string) =>
  getRequest<ResponseData<{
    dimension: string;
    previousValue: string;
    newValue: string;
    reasonCode?: string;
    reason?: string;
    effectiveFromUtc: string;
    expectedReturnDate?: string;
    changedBy: string;
    changedAtUtc: string;
  }>>(`api/User/EmployeeLifecycle/History/${employeeUserId}`);

export type EmployeeLifecyclePolicy = {
  id?: string;
  name?: string;
  code?: string;
  version?: number;
  eventType: string;
  leavePolicyId?: string;
  effectiveFromUtc?: string;
  requiresHrApproval: boolean;
  requiresReason: boolean;
  requiresExpectedReturnDate: boolean;
  requiresDocument?: boolean;
  defaultEmploymentStatus?: string;
  defaultAvailabilityStatus?: string;
  defaultAccountStatus?: string;
  defaultPayrollStatus?: string;
  attendanceExpected: boolean;
  leaveRequestsAllowed: boolean;
  workFromHomeRequestsAllowed: boolean;
  isActive?: boolean;
};

export const getEmployeeLifecyclePolicies = () =>
  getRequest<EmployeeLifecyclePolicy[]>("api/User/EmployeeLifecycle/Policies");
export const getEmployeeLifecycleSelfServicePolicies = () =>
  getRequest<EmployeeLifecyclePolicy[]>("api/User/EmployeeLifecycle/SelfServicePolicies");
export const saveEmployeeLifecyclePolicy = (payload: EmployeeLifecyclePolicy) =>
  putRequest<EmployeeLifecyclePolicy, ApiResponse>("api/User/EmployeeLifecycle/Policies", payload);
export const changeEmployeeLifecycle = (payload: Record<string, unknown>) => postRequest<Record<string, unknown>, ApiResponse>("api/User/EmployeeLifecycle", payload);

export type EmployeeLifecycleCase = {
  caseId: string;
  employeeUserId: string;
  employeeName?: string;
  employeeId?: string;
  employeeEmail?: string;
  employeePhoneNumber?: string;
  employeeDepartment?: string;
  employeeDepartmentName?: string;
  employeeJobRole?: string;
  employeeProfileUrl?: string;
  employeeEmploymentStatus?: string;
  caseOwnerName?: string;
  lifecycleStatus: string;
  leaveRequestId?: string;
  leavePolicyId?: string;
  leaveTotalDays: number;
  leaveReconciliationStatus: string;
  status: "Open" | "UnderReview" | "Active" | "Extended" | "Completed" | "Cancelled" | string;
  effectiveFromUtc: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  nextReviewDate?: string;
  reason?: string;
  caseOwnerUserId?: string;
  previousAccountStatus?: string;
  appliedAccountStatus?: string;
  previousPayrollStatus?: string;
  appliedPayrollStatus?: string;
  documentsVerified: boolean;
  documentsVerifiedAtUtc?: string;
  documentsVerifiedBy?: string;
  isReturnOverdue?: boolean;
  evidence: Array<{ evidenceId?: string; evidenceID?: string; evidenceIdLegacy?: string; EvidenceId?: string; EvidenceID?: string; id?: string; _id?: string; fileName: string; contentType: string; sizeBytes: number; status: string; sha256: string; uploadedAtUtc: string }>;
  events: Array<{ eventType: string; fromStatus: string; toStatus: string; actorUserId: string; comment?: string; occurredAtUtc: string }>;
};
export type EmployeeLifecycleCaseSummary = { total: number; active: number; pendingDocuments: number; overdueReturns: number; upcomingReturns: number; byStatus: Record<string, number> };
export const getEmployeeLifecycleCaseSummary = () => getRequest<EmployeeLifecycleCaseSummary>("api/EmployeeLifecycleCases/summary");

export const getEmployeeLifecycleCases = (employeeUserId?: string, status?: string, overdueOnly = false) => {
  const params = new URLSearchParams(); if (employeeUserId) params.set("employeeUserId", employeeUserId); if (status) params.set("status", status); if (overdueOnly) params.set("overdueOnly", "true");
  return getRequest<EmployeeLifecycleCase[]>(`api/EmployeeLifecycleCases${params.toString() ? `?${params}` : ""}`);
};

export const createEmployeeLifecycleCase = (payload: { leaveRequestId: string; caseOwnerUserId?: string; nextReviewDate?: string }) =>
  postRequest<typeof payload, EmployeeLifecycleCase>("api/EmployeeLifecycleCases", payload);

export const updateEmployeeLifecycleCase = (payload: { caseId: string; status: string; actualReturnDate?: string; expectedReturnDate?: string; nextReviewDate?: string; caseOwnerUserId?: string; accountStatus?: "Active" | "TemporarilyDisabled"; payrollStatus?: "Active" | "Hold" | "Paused"; comment?: string; documentsVerified?: boolean }) =>
  patchRequest<typeof payload, EmployeeLifecycleCase>("api/EmployeeLifecycleCases", payload);

export const uploadEmployeeLifecycleCaseEvidence = (caseId: string, file: File) => {
  const form = new FormData(); form.append("file", file);
  return postRequest<FormData, EmployeeLifecycleCase>(`api/EmployeeLifecycleCases/${encodeURIComponent(caseId)}/evidence`, form, undefined, true);
};
export const getSpecialLeaves = () =>
  getRequest<EmployeeLifecyclePolicy[]>(
    "api/User/EmployeeLifecycle/SpecialLeaves"
  );

export const createSpecialLeave = (
  payload: EmployeeLifecyclePolicy
) =>
  postRequest<EmployeeLifecyclePolicy, ApiResponse>(
    "api/User/EmployeeLifecycle/SpecialLeaves",
    payload
  );

export const updateSpecialLeave = (
  id: string,
  payload: EmployeeLifecyclePolicy
) =>
  putRequest<EmployeeLifecyclePolicy, ApiResponse>(
    `api/User/EmployeeLifecycle/SpecialLeaves/${id}`,
    payload
  );

export const linkSpecialLeave = (
  id: string,
  leavePolicyId: string
) =>
  postRequest<undefined, ApiResponse>(
    `api/User/EmployeeLifecycle/SpecialLeaves/${id}/link/${leavePolicyId}`,
    undefined
  );

export const unlinkSpecialLeave = (id: string) =>
  postRequest<undefined, ApiResponse>(
    `api/User/EmployeeLifecycle/SpecialLeaves/${id}/unlink`,
    undefined
  );

export const deleteSpecialLeave = (id: string) =>
  deleteRequest<ApiResponse>(
    `api/User/EmployeeLifecycle/SpecialLeaves/${id}`
  );

export const verifyEmployeeLifecycleCaseEvidence = (payload: { caseId: string; evidenceId: string; verified: boolean }) =>
  patchRequest<typeof payload, EmployeeLifecycleCase>("api/EmployeeLifecycleCases/evidence/verification", payload);
export const downloadEmployeeLifecycleCaseEvidence = (caseId: string, evidenceId: string) =>
  getBlobRequest(`api/EmployeeLifecycleCases/${encodeURIComponent(caseId)}/evidence/${encodeURIComponent(evidenceId)}`);

export const completeEmployeeExit = (employeeUserId: string | { employeeExitId?: string; employeeUserId: string; version?: number; notes?: string }, notes?: string) =>
  postRequest<{ employeeExitId?: string; employeeUserId: string; version?: number; notes?: string }, ApiResponse>(
    ServiceUrl.COMPLETE_EMPLOYEE_EXIT,
    typeof employeeUserId === "string" ? { employeeUserId, notes } : employeeUserId,
  );

export const getDirectoryDepartments = () =>
  getRequest<GetAllDepartmentDetailsResponseData>(
    ServiceUrl.GET_DIRECTORY_DEPARTMENTS,
  );

export const submitOwnResignation = (payload: { employeeUserId: string; exitType: "Resigned"; lastWorkingDate: string; reason?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/SubmitOwnResignation", payload);

export const getOwnEmployeeExitCase = (userId: string) =>
  getRequest<ResponseData<EmployeeExitCase>>(`api/User/EmployeeExit/${encodeURIComponent(userId)}`);

export const getOwnEmployeeExitHistory = (userId: string) =>
  getRequest<ResponseData<EmployeeExitHistory[]>>(`api/User/EmployeeExitHistory/${encodeURIComponent(userId)}`);

export const withdrawOwnEmployeeExit = (payload: { employeeExitId: string; version: number; reason?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/WithdrawOwnEmployeeExit", payload);

export const getEmployeeExitCaseForManagement = (userId: string) =>
  getRequest<ResponseData<EmployeeExitCase>>(`api/User/EmployeeExitManagement/${encodeURIComponent(userId)}`);
export type EmployeeExitQueueItem = { employeeUserId: string; employeeExitId: string; employeeName: string; employeeId: string; departmentId?: string; status: string; lastWorkingDate: string; initiatedAtUtc: string; progressPercent: number };
export const getEmployeeExitQueue = (params?: { page?: number; pageSize?: number; search?: string; status?: string }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.status && params.status !== "All") query.set("status", params.status);
  return getRequest<ResponseData<EmployeeExitQueueItem[]>>(`api/User/EmployeeExitQueue${query.size ? `?${query.toString()}` : ""}`);
};

export const reviewEmployeeExit = (payload: { employeeExitId: string; version: number; action: "Approve" | "Discuss" | "JointDiscussion" | "Reject" | "RequestDiscussion"; notes?: string; recommendedLastWorkingDate?: string; discussionParticipantUserIds?: string[] }) =>
  postRequest<typeof payload, ApiResponse>("api/User/ReviewEmployeeExit", payload);

export const respondToEmployeeExitDiscussion = (payload: { employeeExitId: string; version: number; notes?: string; proposedLastWorkingDate?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/RespondToEmployeeExitDiscussion", payload);

export const respondToEmployeeExitJointDiscussion = (payload: { employeeExitId: string; version: number; notes: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/RespondToEmployeeExitJointDiscussion", payload);

export const requestEmployeeExitNoticeAdjustment = (payload: { employeeExitId: string; version: number; type: string; requestedLastWorkingDate: string; waivedDays: number; recoveryAmount: number; reason: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/RequestEmployeeExitNoticeAdjustment", payload);

export const updateEmployeeExitPostExitContact = (payload: { employeeExitId: string; version: number; personalEmail: string; mobile?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/EmployeeExitPostExitContact", payload);

export const acknowledgeEmployeeExit = (payload: { employeeExitId: string; version: number; notes?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/AcknowledgeEmployeeExit", payload);

export const createEmployeeExitFormerEmployeeRequest = (payload: { employeeExitId: string; version: number; type: "RelievingLetter" | "ExperienceLetter" | "FnFStatement" | "TaxDocument" | "Correction" | "Other"; details: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/EmployeeExitFormerEmployeeRequest", payload);

export const resolveEmployeeExitFormerEmployeeRequest = (payload: { employeeExitId: string; requestId: string; version: number; status: "InProgress" | "Issued" | "Closed"; notes?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/EmployeeExitFormerEmployeeRequestResolve", payload);

export const issueEmployeeExitDocument = (payload: { employeeExitId: string; evidenceId: string; requestId?: string; version: number; message?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/IssueEmployeeExitDocument", payload);

export const createFormerEmployeePortalInvite = (payload: { employeeExitId: string; version: number; validForHours: number }) =>
  postRequest<typeof payload, ResponseData<{ expiresAtUtc: string }>>("api/User/EmployeeExitFormerEmployeePortalInvite", payload);

export const revokeFormerEmployeePortalAccess = (payload: { employeeExitId: string; version: number; reason: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/EmployeeExitFormerEmployeePortalRevoke", payload);
export const setFormerEmployeePortalAccess = (payload: { employeeExitId: string; version: number; enabled: boolean; reason?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/EmployeeExitFormerEmployeePortalAccess", payload);

export const updateEmployeeExitDate = (payload: { employeeExitId: string; version: number; lastWorkingDate: string; reason?: string; overrideNoticePolicy: boolean }) => postRequest<typeof payload, ApiResponse>("api/User/UpdateEmployeeExitDate", payload);
export const exceptionalCompleteEmployeeExit = (payload: { employeeExitId: string; version: number; reason: string }) => postRequest<typeof payload, ApiResponse>("api/User/ExceptionalCompleteEmployeeExit", payload);
export const approveEmployeeFinalSettlement = (payload: { employeeExitId: string; version: number }) => postRequest<typeof payload, ApiResponse>("api/User/ApproveEmployeeFinalSettlement", payload);
export const updateEmployeeFinalSettlementPayment = (payload: { employeeExitId: string; status: "PaymentInitiated" | "Paid" | "PaymentFailed" | "Disputed"; paidAmount: number; paymentReference?: string; paymentMethod?: string; reason?: string }) => postRequest<typeof payload, ApiResponse>("api/User/UpdateEmployeeFinalSettlementPayment", payload);
export const completeEmployeeExitClearance = (payload: { employeeExitId: string; clearanceId: string; version: number; evidenceUrl?: string; notes?: string }, waive = false) => postRequest<typeof payload, ApiResponse>(`api/User/${waive ? "Waive" : "Complete"}EmployeeExitClearance`, payload);
export const upsertEmployeeExitHandover = (payload: Record<string, unknown>) => postRequest<Record<string, unknown>, ApiResponse>("api/User/EmployeeExitHandoverTask", payload);
export const reviewEmployeeExitHandover = (payload: Record<string, unknown>) => postRequest<Record<string, unknown>, ApiResponse>("api/User/ReviewEmployeeExitHandoverTask", payload);
export const upsertEmployeeExitAsset = (payload: Record<string, unknown>) => postRequest<Record<string, unknown>, ApiResponse>("api/User/EmployeeExitAsset", payload);
export const upsertEmployeeExitAccess = (payload: Record<string, unknown>) => postRequest<Record<string, unknown>, ApiResponse>("api/User/EmployeeExitAccessItem", payload);
export const upsertEmployeeExitFinance = (payload: Record<string, unknown>) => postRequest<Record<string, unknown>, ApiResponse>("api/User/EmployeeExitFinanceItem", payload);
export const upsertEmployeeExitBenefit = (payload: Record<string, unknown>) => postRequest<Record<string, unknown>, ApiResponse>("api/User/EmployeeExitBenefitItem", payload);
export const verifyEmployeeExitEvidence = (payload: { employeeExitId: string; evidenceId: string; version: number; verified: boolean }) => postRequest<typeof payload, ApiResponse>("api/User/VerifyEmployeeExitEvidence", payload);
export const supersedeEmployeeExitEvidence = (payload: { employeeExitId: string; evidenceId: string; version: number }) => postRequest<typeof payload, ApiResponse>("api/User/SupersedeEmployeeExitEvidence", payload);
export const uploadEmployeeExitEvidence = (payload: FormData) => postRequest<FormData, ApiResponse>("api/User/EmployeeExitEvidenceUpload", payload, { headers: { "Content-Type": "multipart/form-data" } });
export const downloadEmployeeExitEvidence = (employeeExitId: string, evidenceId: string) =>
  getBlobRequest(`api/User/EmployeeExitEvidence/${encodeURIComponent(employeeExitId)}/${encodeURIComponent(evidenceId)}/download`);
export type EmployeeExitFeatureConfiguration = { key: "SelfResignation" | "HrInitiatedExit" | "ManagerApproval" | "HrApproval" | "Discussion" | "NoticePeriod" | "NoticeAdjustments" | "Withdrawal" | "Handover" | "Clearance" | "Assets" | "ItAccess" | "Finance" | "Benefits" | "Evidence" | "FinalSettlement" | "ExitInterview" | "Documents" | "FormerEmployeePortal"; enabled: boolean; blocksCompletion: boolean; required: boolean; ownerPermission?: string; allowWaiver: boolean; waiverReasonRequired: boolean; dueDaysBeforeLastWorkingDate?: number };
export type EmployeeExitPolicy = { employeeExitPolicyId?: string; version?: number; exitType?: "Resigned" | "Terminated" | "Retired" | "ContractEnded" | "Deceased"; departmentId?: string; departmentIds?: string[]; consolidateDepartmentPolicies?: boolean; roleId?: string; minimumNoticeDays: number; noticePaySalaryBasis: "BasicMonthly" | "GrossMonthly"; noticePayDailyRateDivisor: number; enableOffboarding: boolean; allowEmployeeSelfResignation: boolean; allowRejoin: boolean; requireManagerReview: boolean; requireHrReview: boolean; allowJointDiscussion: boolean; requireResignationEvidence: boolean; requireEmployeeAcknowledgement: boolean; enableFormerEmployeePortal: boolean; enableNoticePeriodReminders: boolean; noticePeriodReminderEveryDays: number; noticePeriodReminderOffsets: string[]; notifyNoticePeriodEmployee: boolean; notifyNoticePeriodReportingManager: boolean; notifyNoticePeriodHr: boolean; notifyNoticePeriodAdmins: boolean; noticePeriodReminderEmail: boolean; requireHandover: boolean; requireAssetClearance: boolean; requireAccessRevocation: boolean; requireFinanceClearance: boolean; requireBenefitClearance: boolean; requireFinalSettlement: boolean; presetLevel?: "Disabled" | "Basic" | "Structured" | "Operational" | "Advanced" | "Enterprise" | "Custom"; features?: EmployeeExitFeatureConfiguration[]; isActive: boolean };
export type EmployeeExitClearanceTemplate = { employeeExitClearanceTemplateId?: string; templateKey?: string; scope?: "Global" | "Department"; departmentId?: string; category: string; description?: string; ownerRole?: string; ownerPermission?: string; requiredPolicyGate: "General" | "Handover" | "AssetClearance" | "AccessRevocation" | "FinanceClearance" | "BenefitClearance"; isMandatory: boolean; dueDaysBeforeLastWorkingDate: number; isActive: boolean; effectiveFromUtc?: string; effectiveToUtc?: string; version?: number };
export const getEmployeeExitPolicies = () => getRequest<ResponseData<EmployeeExitPolicy>>("api/User/EmployeeExitPolicies");
export const saveEmployeeExitPolicy = (payload: EmployeeExitPolicy) => postRequest<EmployeeExitPolicy, ApiResponse>("api/User/EmployeeExitPolicy", payload);
export const updateEmployeeExitPolicy = (policyId: string, payload: EmployeeExitPolicy) => putRequest<EmployeeExitPolicy, ApiResponse>(`api/User/EmployeeExitPolicy/${encodeURIComponent(policyId)}`, payload);
export const getEmployeeExitClearanceTemplates = () => getRequest<ResponseData<EmployeeExitClearanceTemplate>>("api/User/EmployeeExitClearanceTemplates");
export const saveEmployeeExitClearanceTemplate = (payload: EmployeeExitClearanceTemplate) => postRequest<EmployeeExitClearanceTemplate, ApiResponse>("api/User/EmployeeExitClearanceTemplate", payload);
export const deleteEmployeeExitClearanceTemplate = (templateId: string) => deleteRequest<ApiResponse>(`api/User/EmployeeExitClearanceTemplate/${encodeURIComponent(templateId)}`);
export const decideEmployeeExitWithdrawal = (payload: { employeeExitId: string; version: number; approve: boolean; notes?: string }) => postRequest<typeof payload, ApiResponse>("api/User/DecideEmployeeExitWithdrawal", payload);
export const decideEmployeeExitNoticeAdjustment = (payload: { employeeExitId: string; noticeAdjustmentId: string; version: number; approve: boolean; reason?: string; decisionType?: string; waivedDays?: number; recoveryAmount?: number }) => postRequest<typeof payload, ApiResponse>("api/User/DecideEmployeeExitNoticeAdjustment", payload);
export const decideOwnEmployeeExitNoticeOffer = (payload: { employeeExitId: string; noticeAdjustmentId: string; version: number; accept: boolean }) => postRequest<typeof payload, ApiResponse>("api/User/DecideOwnEmployeeExitNoticeOffer", payload);
export const recordEmployeeExitInterview = (payload: { employeeExitId: string; version: number; employeeFeedback?: string; managerFeedback?: string; hrNotes?: string; isRehireEligible?: boolean }) => postRequest<typeof payload, ApiResponse>("api/User/RecordEmployeeExitInterview", payload);
export const rejoinEmployee = (payload: { employeeExitId: string; version: number; reason: string }) => postRequest<typeof payload, ApiResponse>("api/User/RejoinEmployee", payload);
export const upsertEmployeeExitReassignment = (payload: { employeeExitId: string; version: number; responsibility: string; newOwnerUserId: string; notes?: string }) => postRequest<typeof payload, ApiResponse>("api/User/EmployeeExitReassignment", payload);
export const calculateEmployeeFinalSettlement = (payload: { employeeExitId: string; version: number }) => postRequest<typeof payload, ApiResponse>("api/User/CalculateEmployeeFinalSettlement", payload);
export const markEmployeeFinalSettlementPaid = (payload: { employeeExitId: string; version: number }) => postRequest<typeof payload, ApiResponse>("api/User/MarkEmployeeFinalSettlementPaid", payload);
export const generateEmployeeExitDocument = (payload: { employeeExitId: string; version: number; type: "RelievingLetter" | "ExperienceLetter" | "FinalSettlementStatement"; url?: string; requestId?: string }) => postRequest<typeof payload, ApiResponse>("api/User/GenerateEmployeeExitDocument", payload);

export type EmployeeExitCase = {
  employeeExitId: string; employeeUserId: string; status: string; lastWorkingDate: string; version: number;
  presetLevel?: string; features?: EmployeeExitFeatureConfiguration[];
  postExitContact?: { personalEmail?: string; mobile?: string; personalEmailVerified: boolean; portalEnabled: boolean; personalEmailVerificationExpiresAtUtc?: string };
  clearances: Array<{ clearanceId: string; category: string; status: string; isMandatory: boolean; dueAtUtc?: string }>;
  handoverTasks: Array<{ handoverTaskId: string; title: string; details?: string; assigneeUserId?: string; dueAtUtc?: string; status: string }>;
  assets: Array<{ assetExitId: string; assetType: string; assetIdentifier?: string; status: string; trackingReference?: string; recoveryAmount: number; notes?: string }>;
  accessItems: Array<{ accessItemId: string; system: string; mode: string; status: string; scheduledAtUtc?: string; externalReference?: string; notes?: string }>;
  financeItems: Array<{ financeItemId: string; category: string; direction: string; amount: number; status: string; reference?: string; notes?: string }>;
  benefitItems: Array<{ benefitItemId: string; category: string; status: string; effectiveEndDate?: string; reference?: string; notes?: string }>;
  evidence: Array<{ evidenceId: string; category: string; type: string; status: string; visibility: string; fileName?: string; contentType?: string; uploadedAtUtc: string; formerEmployeeRequestId?: string; issuedToFormerEmployeeAtUtc?: string; seenByFormerEmployeeAtUtc?: string }>;
  formerEmployeeRequests: Array<{ requestId: string; type: string; status: string; details: string; requestedAtUtc: string; evidenceId?: string; issuedAtUtc?: string }>;
  responsibilityReassignments: Array<{ responsibility: string; newOwnerUserId: string; notes?: string }>;
  exitInterview?: { employeeFeedback?: string; managerFeedback?: string; hrNotes?: string; isRehireEligible?: boolean; conductedAtUtc?: string };
  finalSettlement?: { status: string; salaryPayable: number; deductions: number; noticeRecovery: number; netPayable: number; sourcePayrollId?: string; sourcePayrollMonth?: string; sourcePayrollRunId?: string; sourcePayrollRunEmployeeId?: string; calculatedAtUtc?: string; approvedAtUtc?: string; paidAtUtc?: string };
  documents: Array<{ type: string; status: string; url?: string }>;
  withdrawal?: { status: string; reason?: string };
  noticeAdjustments: Array<{ noticeAdjustmentId: string; type: string; status: string; requestedLastWorkingDate: string; requiredNoticeDays: number; servedNoticeDays: number; shortfallDays: number; waivedDays: number; recoveryAmount: number; reason?: string }>;
  auditHistory: Array<{ action: string; atUtc: string; notes?: string }>;
  discussionRequest?: string; discussionResponse?: string; discussionMode?: string; discussionParticipantUserIds: string[];
  discussionMessages: Array<{ messageId: string; authorUserId: string; message: string; createdAtUtc: string }>;
  permittedActions: string[];
  isAssignedManagerReviewer: boolean;
  isHrReviewer: boolean;
  pendingHandoverCount: number; pendingAssetCount: number; pendingAccessCount: number; pendingFinanceCount: number; pendingBenefitCount: number;
};

export type EmployeeExitHistory = {
  employeeExitId: string; status: string; lastWorkingDate: string; initiatedAtUtc: string; withdrawalReason?: string;
};

export const inviteNewEmployee = (payload: InviteNewEmployeeModel) => {
  return postRequest<
    InviteNewEmployeeModel,
    ResponseData<InviteEmployeeResponse>
  >(ServiceUrl.INVITE_NEW_EMPLOYEE, payload);
};

export const resendInvitationLink = (userId: string) => {
  return postRequest<undefined, ApiResponse>(
    `${ServiceUrl.RESEND_INVITE_LINK}/${userId}`,
  );
};

export const bulkImportEmployees = (payload: BulkImportEmployeesRequest) => {
  return postRequest<BulkImportEmployeesRequest, ResponseData<BulkImportEmployeesResponse>>(
    ServiceUrl.BULK_IMPORT_EMPLOYEES,
    payload,
  );
};

