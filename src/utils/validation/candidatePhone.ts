const candidatePhoneFormat = /^\+?[0-9\s().-]{7,25}$/;

export const isValidCandidatePhone = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const phone = value.trim();
  if (!candidatePhoneFormat.test(phone)) return false;
  const digitCount = (phone.match(/\d/g) ?? []).length;
  return digitCount >= 7 && digitCount <= 15;
};
