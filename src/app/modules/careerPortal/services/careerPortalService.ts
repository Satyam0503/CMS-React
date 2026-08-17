import { deleteRequest, getRequest, postRequest, putRequest } from "../../../../server/axios";
import { ResponseData } from "../../../../utils/common_types";
import { PublicJobSummary } from "../../applynow/publicCareerTypes";
import {
  CareerPreferences,
  CompanyFollowStatus,
  JobAlert,
  PublicCompanyProfile,
  SavedCareerJob,
} from "../types/careerPortalTypes";

const sessionConfig = (session = "") => ({
  headers: session ? { "X-Career-Session": session } : {},
});

export const discoverJobs = (companyCode: string | undefined, params: Record<string, unknown>) =>
  getRequest<ResponseData<PublicJobSummary>>(
    companyCode
      ? `api/public/companies/${encodeURIComponent(companyCode)}/jobs`
      : "api/public/jobs",
    { params },
  );

export const getCompanyProfile = (companyCode: string) =>
  getRequest<ResponseData<PublicCompanyProfile>>(
    `api/public/career/companies/${encodeURIComponent(companyCode)}/profile`,
  );

export const getCompanies = () =>
  getRequest<ResponseData<PublicCompanyProfile>>("api/public/career/companies");

export const getJobLocations = (companyCode?: string, search?: string) =>
  getRequest<ResponseData<string>>("api/public/job-locations", {
    params: { companyCode, search },
  });

export const getManagedCompanyProfile = () =>
  getRequest<ResponseData<PublicCompanyProfile>>("api/CareerProfile");

export const saveManagedCompanyProfile = (profile: PublicCompanyProfile) =>
  putRequest<PublicCompanyProfile, ResponseData<PublicCompanyProfile>>("api/CareerProfile", profile);

export const saveJob = (publicJobId: string, visitorToken: string, session: string) =>
  postRequest(
    `api/public/career/jobs/${encodeURIComponent(publicJobId)}/save`,
    { visitorToken, subscriberSessionToken: session },
    sessionConfig(session),
  );

export const unsaveJob = (publicJobId: string, visitorToken: string, session: string) =>
  deleteRequest(
    `api/public/career/jobs/${encodeURIComponent(publicJobId)}/save`,
    { ...sessionConfig(session), params: { visitorToken } },
  );

export const getSavedJobs = (visitorToken: string, session: string) =>
  getRequest<ResponseData<SavedCareerJob>>("api/public/career/jobs/saved", {
    ...sessionConfig(session),
    params: { visitorToken },
  });

export const subscribe = (email: string, frequency: CareerPreferences["notificationFrequency"]) =>
  postRequest("api/public/career/subscribers", {
    email,
    notificationFrequency: frequency,
    preferredLanguage: "en",
    consentSource: "career-portal",
    privacyPolicyVersion: "2026-07",
  });

export const verifySubscription = (token: string) =>
  postRequest<Record<string, string>, ResponseData<{ sessionToken: string; expiresAt: string }>>(
    "api/public/career/subscribers/verify",
    { token },
  );

export const unsubscribe = (token: string) =>
  postRequest("api/public/career/subscribers/unsubscribe", { token });

export const getPreferences = (session: string) =>
  getRequest<ResponseData<CareerPreferences>>(
    "api/public/career/subscribers/preferences",
    sessionConfig(session),
  );

export const updatePreferences = (session: string, value: CareerPreferences) =>
  putRequest("api/public/career/subscribers/preferences", value, sessionConfig(session));

export const followCompany = (companyCode: string, session: string) =>
  postRequest<{ subscriberSessionToken: string; notifyForNewJobs: boolean; notifyForJobUpdates: boolean }, ResponseData<void>>(
    `api/public/career/companies/${encodeURIComponent(companyCode)}/follow`,
    { subscriberSessionToken: session, notifyForNewJobs: true, notifyForJobUpdates: false },
    sessionConfig(session),
  );

export const unfollowCompany = (companyCode: string, session: string) =>
  deleteRequest<ResponseData<void>>(
    `api/public/career/companies/${encodeURIComponent(companyCode)}/follow`,
    sessionConfig(session),
  );

export const getFollowStatus = (companyCode: string, session: string) =>
  getRequest<ResponseData<CompanyFollowStatus>>(
    `api/public/career/companies/${encodeURIComponent(companyCode)}/follow-status`,
    sessionConfig(session),
  );

export const getAlerts = (session: string) =>
  getRequest<ResponseData<JobAlert>>("api/public/career/job-alerts", sessionConfig(session));

export const createAlert = (
  session: string,
  value: Pick<JobAlert, "name" | "searchText" | "locations" | "skills" | "notificationFrequency">,
) =>
  postRequest("api/public/career/job-alerts", {
    ...value,
    subscriberSessionToken: session,
    employmentTypes: [],
    workplaceTypes: [],
    jobTypes: [],
    industries: [],
    departments: [],
  }, sessionConfig(session));

export const deleteAlert = (id: string, session: string) =>
  deleteRequest(`api/public/career/job-alerts/${encodeURIComponent(id)}`, sessionConfig(session));

export const dismissSubscribePopup = (visitorToken: string, companyCode?: string, suppressDays = 7) =>
  putRequest("api/public/career/visitor-preferences", {
    visitorToken,
    dismissSubscribePopup: true,
    lastVisitedCompanyCode: companyCode,
    suppressDays,
  });

export const getVisitorPreferences = (visitorToken: string) =>
  getRequest<ResponseData<{ suppressSubscribePopup: boolean; doNotShowUntil?: string; popupDisplayCount: number }>>(
    "api/public/career/visitor-preferences",
    { params: { visitorToken } },
  );

export const trackCareerEvent = (
  eventType: string,
  visitorToken: string,
  publicJobId?: string,
  publicCompanyCode?: string,
) =>
  postRequest("api/public/career/analytics", {
    eventType,
    visitorToken,
    publicJobId,
    publicCompanyCode,
  }).catch(() => undefined);
