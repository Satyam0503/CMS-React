import { isValidCandidatePhone } from "../../../utils/validation/candidatePhone";

export type PublicApplicationCandidateFields = {
  phone: string;
  state: string;
  experience: number | string;
  noticePeriodDays?: number | string;
};

export const validatePublicApplicationCandidateFields = (
  fields: PublicApplicationCandidateFields,
): string | null => {
  if (!fields.state.trim()) return "Please enter your state, province, or region.";
  if (!isValidCandidatePhone(fields.phone)) {
    return "Enter a valid phone number with 7 to 15 digits. Include a country code when needed.";
  }

  if (fields.experience === "" || !Number.isFinite(Number(fields.experience))) {
    return "Enter your experience in years.";
  }
  if (Number(fields.experience) < 0 || Number(fields.experience) > 80) {
    return "Enter experience between 0 and 80 years.";
  }

  if (fields.noticePeriodDays !== undefined && fields.noticePeriodDays !== "") {
    const noticePeriod = Number(fields.noticePeriodDays);
    if (!Number.isFinite(noticePeriod) || noticePeriod < 0 || noticePeriod > 3650) {
      return "Enter a notice period between 0 and 3650 days.";
    }
  }

  return null;
};
