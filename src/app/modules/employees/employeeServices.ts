import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import { ServiceUrl } from "../../../utils/constant/Constant";
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

export const getDirectoryDepartments = () =>
  getRequest<GetAllDepartmentDetailsResponseData>(
    ServiceUrl.GET_DIRECTORY_DEPARTMENTS,
  );

export const submitOwnResignation = (payload: { employeeUserId: string; exitType: "Resigned"; lastWorkingDate: string; reason?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/SubmitOwnResignation", payload);

export const getOwnEmployeeExitCase = (userId: string) =>
  getRequest<ResponseData<EmployeeExitCase>>(`api/User/EmployeeExit/${encodeURIComponent(userId)}`);

export const withdrawOwnEmployeeExit = (payload: { employeeExitId: string; version: number; reason?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/WithdrawOwnEmployeeExit", payload);

export const getEmployeeExitCaseForManagement = (userId: string) =>
  getRequest<ResponseData<EmployeeExitCase>>(`api/User/EmployeeExitManagement/${encodeURIComponent(userId)}`);

export const reviewEmployeeExit = (payload: { employeeExitId: string; version: number; action: "Approve" | "Discuss" | "JointDiscussion"; notes?: string; proposedLastWorkingDate?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/ReviewEmployeeExit", payload);

export const respondToEmployeeExitDiscussion = (payload: { employeeExitId: string; version: number; notes?: string; proposedLastWorkingDate?: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/RespondToEmployeeExitDiscussion", payload);

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

export const createFormerEmployeePortalInvite = (payload: { employeeExitId: string; version: number; validForHours: number }) =>
  postRequest<typeof payload, ResponseData<{ portalToken: string; expiresAtUtc: string }>>("api/User/EmployeeExitFormerEmployeePortalInvite", payload);

export const revokeFormerEmployeePortalAccess = (payload: { employeeExitId: string; version: number; reason: string }) =>
  postRequest<typeof payload, ApiResponse>("api/User/EmployeeExitFormerEmployeePortalRevoke", payload);

export const updateEmployeeExitDate = (payload: { employeeExitId: string; version: number; lastWorkingDate: string; reason?: string; overrideNoticePolicy: boolean }) => postRequest<typeof payload, ApiResponse>("api/User/UpdateEmployeeExitDate", payload);
export const completeEmployeeExit = (payload: { employeeUserId: string; notes?: string }) => postRequest<typeof payload, ApiResponse>("api/User/CompleteEmployeeExit", payload);
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
export const uploadEmployeeExitEvidence = (payload: FormData) => postRequest<FormData, ApiResponse>("api/User/EmployeeExitEvidenceUpload", payload, { headers: { "Content-Type": "multipart/form-data" } });
export type EmployeeExitPolicy = { employeeExitPolicyId?: string; departmentId?: string; roleId?: string; minimumNoticeDays: number; requireManagerReview: boolean; requireHrReview: boolean; allowJointDiscussion: boolean; requireResignationEvidence: boolean; requireEmployeeAcknowledgement: boolean; enableFormerEmployeePortal: boolean; isActive: boolean };
export type EmployeeExitClearanceTemplate = { employeeExitClearanceTemplateId?: string; category: string; ownerRole?: string; isMandatory: boolean; dueDaysBeforeLastWorkingDate: number; isActive: boolean };
export const getEmployeeExitPolicies = () => getRequest<ResponseData<EmployeeExitPolicy>>("api/User/EmployeeExitPolicies");
export const saveEmployeeExitPolicy = (payload: EmployeeExitPolicy) => postRequest<EmployeeExitPolicy, ApiResponse>("api/User/EmployeeExitPolicy", payload);
export const getEmployeeExitClearanceTemplates = () => getRequest<ResponseData<EmployeeExitClearanceTemplate>>("api/User/EmployeeExitClearanceTemplates");
export const saveEmployeeExitClearanceTemplate = (payload: EmployeeExitClearanceTemplate) => postRequest<EmployeeExitClearanceTemplate, ApiResponse>("api/User/EmployeeExitClearanceTemplate", payload);

export type EmployeeExitCase = {
  employeeExitId: string; status: string; lastWorkingDate: string; version: number;
  clearances: Array<{ clearanceId: string; category: string; status: string; isMandatory: boolean; dueAtUtc?: string }>;
  handoverTasks: Array<{ handoverTaskId: string; title: string; details?: string; assigneeUserId?: string; dueAtUtc?: string; status: string }>;
  assets: Array<{ assetExitId: string; assetType: string; assetIdentifier?: string; status: string; trackingReference?: string; recoveryAmount: number; notes?: string }>;
  accessItems: Array<{ accessItemId: string; system: string; mode: string; status: string; scheduledAtUtc?: string; externalReference?: string; notes?: string }>;
  financeItems: Array<{ financeItemId: string; category: string; direction: string; amount: number; status: string; reference?: string; notes?: string }>;
  benefitItems: Array<{ benefitItemId: string; category: string; status: string; effectiveEndDate?: string; reference?: string; notes?: string }>;
  evidence: Array<{ evidenceId: string; category: string; type: string; status: string; visibility: string; fileName?: string; contentType?: string; uploadedAtUtc: string }>;
  formerEmployeeRequests: Array<{ requestId: string; type: string; status: string; details: string; requestedAtUtc: string }>;
  auditHistory: Array<{ action: string; atUtc: string; notes?: string }>;
  permittedActions: string[];
  pendingHandoverCount: number; pendingAssetCount: number; pendingAccessCount: number; pendingFinanceCount: number; pendingBenefitCount: number;
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
