export const isPanelistOptionDisabled = (
  userId: string,
  selectedUserIds: readonly string[],
  parallelPanelsEnabled: boolean,
): boolean =>
  !parallelPanelsEnabled &&
  selectedUserIds.length >= 1 &&
  !selectedUserIds.includes(userId);
