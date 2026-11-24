export type CareerSearchFilters = {
  location: string;
  workplaceType: string;
  employmentType: string;
  experienceMin: string;
  department: string;
  industry: string;
  skills: string;
  datePostedDays: string;
  featured: boolean;
  urgentHiring: boolean;
  walkIn: boolean;
  sort: string;
};

export const buildCareerSearchParams = (
  search: string,
  pageNo: number,
  filters: CareerSearchFilters,
) => ({
  search: search.trim() || undefined,
  pageNo: Math.max(1, pageNo),
  pageSize: 12,
  ...Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value !== false),
  ),
});

export const countActiveCareerFilters = (filters: CareerSearchFilters): number =>
  Object.entries(filters).filter(([key, value]) =>
    key !== "sort" && value !== "" && value !== false,
  ).length;

export const careerSearchErrorMessage = (reason: unknown): string => {
  const error = reason as {
    message?: string;
    response?: { status?: number; data?: { message?: string } };
  } | null;
  const serverMessage = error?.response?.data?.message;
  if (serverMessage) return serverMessage;
  if (error?.response?.status != null && error.response.status >= 500)
    return "We couldn’t load job results right now. Please try again.";
  if (error?.message === "Network Error")
    return "We couldn’t reach the jobs service. Check your connection and try again.";
  return error?.message || "Jobs could not be loaded. Please try again.";
};

export const shouldOfferCareerAlerts = (input: {
  loading: boolean;
  hasSearchError: boolean;
  alreadySeen: boolean;
  hasCandidateSession: boolean;
}) => !input.loading && !input.hasSearchError && !input.alreadySeen && !input.hasCandidateSession;
