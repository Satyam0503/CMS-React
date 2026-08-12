export const DEFAULT_ATTENDANCE_STATUS_COLOR = "#607D8B";

export type AttendanceStatusSettingColorInput = {
  code?: string | null;
  colorHex?: string | null;
};

export const normalizeAttendanceStatusCode = (value?: string | null) =>
  (value ?? "").trim().toUpperCase();

export const toAlphaHex = (hex: string, alphaPercent: number) => {
  const cleaned = hex.replace("#", "");
  if (!/^([0-9A-Fa-f]{6})$/.test(cleaned)) return "rgba(96, 125, 139, 0.16)";

  const alpha = Math.max(0, Math.min(100, alphaPercent));
  const normalizedAlpha = Math.round((alpha / 100) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${cleaned}${normalizedAlpha}`.toUpperCase();
};

export const buildAttendanceStatusColorMap = (
  settings: AttendanceStatusSettingColorInput[] = [],
) =>
  settings.reduce<Record<string, string>>((acc, setting) => {
    const code = normalizeAttendanceStatusCode(setting.code);
    const color = setting.colorHex?.trim();
    if (!code || !color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return acc;
    }
    acc[code] = color.toUpperCase();
    return acc;
  }, {});

export const resolveAttendanceStatusColor = (
  status: string | null | undefined,
  colorMap: Record<string, string> = {},
  fallback = DEFAULT_ATTENDANCE_STATUS_COLOR,
) => {
  const normalized = normalizeAttendanceStatusCode(status);
  if (!normalized) return fallback;
  return colorMap[normalized] ?? fallback;
};
