export const toLocalDateInputValue = (date: Date): string => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-");

export const currentMonthStartInputValue = (now = new Date()): string =>
  toLocalDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1));

export const currentMonthEndInputValue = (now = new Date()): string =>
  toLocalDateInputValue(new Date(now.getFullYear(), now.getMonth() + 1, 0));

export const nextLocalDateInputValue = (now = new Date()): string => {
  const nextDay = new Date(now);
  nextDay.setDate(nextDay.getDate() + 1);
  return toLocalDateInputValue(nextDay);
};
