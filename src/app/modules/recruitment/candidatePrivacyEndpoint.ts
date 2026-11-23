import { ServiceUrl } from "../../../utils/constant/data";
import type { RecruitmentCandidatePrivacyCommand } from "./models";

export const getCandidatePrivacyEndpoint = (action: RecruitmentCandidatePrivacyCommand["action"]) =>
  action === "Anonymize"
    ? "api/RecruitmentCandidatePrivacy/Anonymize"
    : ServiceUrl.APPLY_CANDIDATE_PRIVACY;
