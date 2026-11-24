export const acknowledgesCurrentPrivacyNotice = (
  acknowledged: boolean,
  submittedVersion: string | null | undefined,
  currentVersion: string | null | undefined,
) =>
  acknowledged &&
  Boolean(currentVersion?.trim()) &&
  submittedVersion?.trim() === currentVersion?.trim();
