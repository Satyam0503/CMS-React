import dayjs from "dayjs";

export type DatedConfiguration = { effectiveFrom: string; effectiveTo?: string | null; isActive: boolean };

export type ConfigurationWindowIssue = "inactive" | "invalid-window" | "starts-after" | "ends-before";

/** Explains why a dated configuration cannot cover the complete requested window. */
export function configurationWindowIssue(record: DatedConfiguration, from: string, to?: string | null): ConfigurationWindowIssue | null {
  if (!record.isActive) return "inactive";
  if (!from || !dayjs(from).isValid() || (to && (!dayjs(to).isValid() || to < from))) return "invalid-window";
  if (dayjs(record.effectiveFrom).isAfter(dayjs(from), "day")) return "starts-after";
  if (record.effectiveTo && (!to || dayjs(record.effectiveTo).isBefore(dayjs(to), "day"))) return "ends-before";
  return null;
}

export function coversConfigurationWindow(record: DatedConfiguration, from: string, to?: string | null) {
  return configurationWindowIssue(record, from, to) === null;
}

export function isApprovedConfigurationForWindow(record: DatedConfiguration & { approvalStatus?: string }, from: string, to?: string | null) {
  return record.approvalStatus === "APPROVED" && coversConfigurationWindow(record, from, to);
}

// Match the backend: an expired/inactive latest revision cannot resurrect an older one.
export function currentComponentVersions<T extends DatedConfiguration & { code: string; version: number }>(records: T[], date: string) {
  const latest = new Map<string, T>();
  for (const record of records) {
    if (dayjs(record.effectiveFrom).isAfter(dayjs(date), "day")) continue;
    const code = record.code.trim().toUpperCase();
    const previous = latest.get(code);
    if (!previous || dayjs(record.effectiveFrom).isAfter(dayjs(previous.effectiveFrom), "day") ||
      (dayjs(record.effectiveFrom).isSame(dayjs(previous.effectiveFrom), "day") && record.version > previous.version)) latest.set(code, record);
  }
  return [...latest.values()].filter(record => !record.effectiveTo || !dayjs(record.effectiveTo).isBefore(dayjs(date), "day"));
}
