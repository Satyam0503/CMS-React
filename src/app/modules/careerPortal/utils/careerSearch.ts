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
