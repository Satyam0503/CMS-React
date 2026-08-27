import { getRequest, postRequest } from "../../../server/axios";
import { ResponseData } from "../../../utils/common_types";

export type FormerEmployeePortalCase = {
  employeeExitId: string;
  status: string;
  lastWorkingDate: string;
  requests: Array<{ requestId: string; type: string; status: string; details: string; requestedAtUtc: string }>;
  documents: Array<{ evidenceId: string; fileName?: string; contentType?: string }>;
};

const sessionConfig = (session: string) => ({ headers: { "X-Former-Employee-Session": session, "Cache-Control": "no-cache" } });

export const redeemFormerEmployeePortalInvite = (token: string) =>
  postRequest<{ token: string }, ResponseData<{ sessionToken: string; expiresAtUtc: string }>>("api/public/former-employee/redeem", { token }, { headers: { "Cache-Control": "no-cache" } });

export const getFormerEmployeePortalCase = (session: string) =>
  getRequest<ResponseData<FormerEmployeePortalCase>>("api/public/former-employee/case", sessionConfig(session));

export const createFormerEmployeePortalRequest = (session: string, payload: { type: string; details: string }) =>
  postRequest<typeof payload, ResponseData<void>>("api/public/former-employee/requests", payload, sessionConfig(session));

export const formerEmployeeDocumentUrl = (evidenceId: string) => `api/public/former-employee/documents/${encodeURIComponent(evidenceId)}`;
