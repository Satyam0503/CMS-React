import { PublicJobSummary } from "../../applynow/publicCareerTypes";

export type PublicCompanyProfile = {
  publicCompanyCode: string;
  displayName: string;
  shortDescription?: string | null;
  aboutCompanyHtml?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  websiteUrl?: string | null;
  industry?: string | null;
  companyType?: string | null;
  companySize?: string | null;
  foundedYear?: number | null;
  headquarters?: string | null;
  officeLocations: string[];
  mission?: string | null;
  vision?: string | null;
  values: string[];
  benefits: string[];
  technologies: string[];
  socialLinks: Record<string, string>;
  workCultureHtml?: string | null;
  hiringProcessHtml?: string | null;
  diversityStatementHtml?: string | null;
  isPublished: boolean;
};

export type SavedCareerJob = Pick<
  PublicJobSummary,
  "publicJobId" | "slug" | "title" | "applicationDeadline"
> & {
  companyCode: string;
  companyName: string;
  locations: string[];
  savedAt: string;
};

export type CareerPreferences = {
  notificationFrequency: "Instant" | "DailyDigest" | "WeeklyDigest" | "None";
  preferredLanguage: string;
  isActive: boolean;
};

export type JobAlert = {
  jobAlertSubscriptionId: string;
  name: string;
  searchText?: string | null;
  locations: string[];
  employmentTypes: string[];
  workplaceTypes: string[];
  jobTypes: number[];
  industries: string[];
  departments: string[];
  skills: string[];
  experienceMin?: number | null;
  experienceMax?: number | null;
  salaryMin?: number | null;
  currency?: string | null;
  notificationFrequency: CareerPreferences["notificationFrequency"];
  isActive: boolean;
};
