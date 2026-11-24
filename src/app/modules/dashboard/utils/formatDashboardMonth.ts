/** Format a canonical dashboard month without relying on the browser's local timezone. */
export const formatDashboardMonth = (month: string, locale: string, monthStyle: "long" | "short" = "long") => {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) return month;

  return new Intl.DateTimeFormat(locale, {
    month: monthStyle,
    ...(monthStyle === "long" ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
};
