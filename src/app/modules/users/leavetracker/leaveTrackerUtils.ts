export const resolveLeaveBalanceTargetUserId = (
  employeeId: string | undefined,
  currentUserId: string,
) => employeeId ?? currentUserId;
