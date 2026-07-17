/**
 * Shared root keys keep invalidation predictable as features are migrated.
 * Feature-specific factories should extend one of these keys.
 */
export const queryKeys = {
  api: ["api"] as const,
  admin: ["admin"] as const,
  attendance: ["attendance"] as const,
  company: ["company"] as const,
  dashboard: {
    all: ["dashboard"] as const,
    departments: ["dashboard", "departments"] as const,
    gender: ["dashboard", "gender"] as const,
    upcomingCelebrations: ["dashboard", "upcoming-celebrations"] as const,
    upcomingEvents: ["dashboard", "upcoming-events"] as const,
  },
  employees: ["employees"] as const,
  holidays: ["holidays"] as const,
  leaves: ["leaves"] as const,
  noticeboard: ["noticeboard"] as const,
  payroll: ["payroll"] as const,
  policies: ["policies"] as const,
  recruitment: ["recruitment"] as const,
  users: ["users"] as const,
} as const;

export const apiQueryKey = (
  path: string,
  params: unknown,
  language: string,
  authScope: string,
) => [...queryKeys.api, authScope, language, path, params ?? null] as const;
