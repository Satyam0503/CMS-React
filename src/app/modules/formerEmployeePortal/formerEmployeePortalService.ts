import { getRequest, postRequest } from "../../../server/axios";
import { ResponseData } from "../../../utils/common_types";

export type FormerEmployeePortalCase = {
  companyName?: string; companyLogo?: string;
  employeeExitId: string;
  status: string;
  lastWorkingDate: string;
  profile?: { fullName: string; employeeId: string; jobRole?: string; department?: string; dateOfJoining?: string; lastWorkingDate: string };
  requests: Array<{ requestId: string; type: string; status: string; details: string; requestedAtUtc: string; evidenceId?: string; issuedAtUtc?: string }>;
  documents: Array<{ evidenceId: string; fileName?: string; contentType?: string }>;
};

const sessionConfig = (session: string) => ({ headers: { "X-Former-Employee-Session": session, "Cache-Control": "no-cache" } });

export const redeemFormerEmployeePortalInvite = (token: string) =>
  postRequest<{ token: string }, ResponseData<{ sessionToken: string; expiresAtUtc: string; theme?: string; companyName?: string; companyLogo?: string }>>("api/public/former-employee/redeem", { token }, { headers: { "Cache-Control": "no-cache" } });

export const verifyFormerEmployeeContact = (token: string) =>
  postRequest<{ token: string }, ResponseData<void>>("api/public/former-employee/verify-contact", { token }, { headers: { "Cache-Control": "no-cache" } });

export const requestFormerEmployeeOtp = (personalEmail: string) => postRequest<{ personalEmail: string }, ResponseData<void>>("api/public/former-employee/otp/request", { personalEmail });
export const verifyFormerEmployeeOtp = (personalEmail: string, otp: string) => postRequest<{ personalEmail: string; otp: string }, ResponseData<{ sessionToken: string; expiresAtUtc: string; theme?: string; companyName?: string; companyLogo?: string }>>("api/public/former-employee/otp/verify", { personalEmail, otp });
export const logoutFormerEmployeePortal = (session: string) => postRequest<Record<string, never>, ResponseData<void>>("api/public/former-employee/logout", {}, sessionConfig(session));

export const getFormerEmployeePortalCase = (session: string) =>
  getRequest<ResponseData<FormerEmployeePortalCase>>("api/public/former-employee/case", sessionConfig(session));

export const createFormerEmployeePortalRequest = (session: string, payload: { type: string; details: string }) =>
  postRequest<typeof payload, ResponseData<void>>("api/public/former-employee/requests", payload, sessionConfig(session));

export const formerEmployeeDocumentUrl = (evidenceId: string) => `api/public/former-employee/documents/${encodeURIComponent(evidenceId)}`;
export const formerEmployeeDocumentPreviewUrl = (evidenceId: string) => `api/public/former-employee/documents/${encodeURIComponent(evidenceId)}/preview`;
