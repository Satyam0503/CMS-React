export const RECRUITMENT_FEATURE_DISABLED = "REC_FEATURE_DISABLED";

export function isRecruitmentFeatureDisabled(response: unknown): boolean {
  if (!response || typeof response !== "object") return false;
  return (response as { errorCode?: unknown }).errorCode === RECRUITMENT_FEATURE_DISABLED;
}

export function responseDataFromError(error: unknown): unknown {
  if (!error || typeof error !== "object") return undefined;
  const response = (error as { response?: { data?: unknown } }).response;
  return response?.data;
}
