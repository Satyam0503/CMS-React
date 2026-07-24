export type PublicJobSummary = {
  publicJobId: string;
  slug: string;
  title: string;
  shortDescription: string;
  summary?: string | null;
  department?: string | null;
  industry?: string | null;
  roleCategory?: string | null;
  educationRequirement?: string | null;
  isFeatured?: boolean | null;
  isUrgentHiring?: boolean | null;
  isWalkIn?: boolean | null;
  showSalary?: boolean | null;
  vacancies: number;
  jobType: number;
  location?: string | null;
  workplaceType?: string | null;
  employmentType?: string | null;
  experienceMin?: number | null;
  experienceMax?: number | null;
  currency?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  skills: string[];
  publishedAt?: string | null;
  applicationDeadline?: string | null;
  applicationMode: "Internal" | "External";
  externalApplicationUrl?: string | null;
  canApply: boolean;
  applicationClosedReason?: string | null;
  companyPublicCode: string;
  companyName: string;
  companySlug: string;
  companyLogo?: string | null;
};

export type PublicJobDetails = PublicJobSummary & {
  description: string;
  functionalArea?: string | null;
  responsibilities?: string[];
  requiredSkills?: string[];
  preferredSkills?: string[];
  benefits?: string[];
  shiftType?: string | null;
  workingDays?: string | null;
  travelRequirement?: string | null;
  walkInStartAt?: string | null;
  walkInEndAt?: string | null;
  walkInAddress?: string | null;
  noticePeriodMaxDays?: number | null;
  referenceCode?: string | null;
  expiresAt?: string | null;
};

export type PublicJobApplicationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state?: string;
  experience: number;
};

export type PublicJobApplicationResponse = {
  applicationReference: string;
  resumeUploadToken: string;
  tokenExpiresAt: string;
  jobTitle: string;
  companyName: string;
};
