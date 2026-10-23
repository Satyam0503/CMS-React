export interface ParsedInterviewMeta {
  isInterview: boolean;
  candidateName?: string;
  roleTitle?: string;
  roundNumber?: number;
  roundType?: string;
  applicantId?: string;
  vacancyId?: string;
  interviewId?: string;
  meetingUrl?: string;
  panelistIds?: string[];
  rawDescription: string;
}

export function parseInterviewCalendarItem(item: { name?: string; description?: string }): ParsedInterviewMeta {
  const name = item.name ?? "";
  const desc = item.description ?? "";

  const isInterview =
    name.toLowerCase().startsWith("interview:") ||
    desc.toLowerCase().includes("applicant") ||
    desc.toLowerCase().includes("candidate:");

  if (!isInterview) {
    return { isInterview: false, rawDescription: desc };
  }

  // 1. Extract applicantId (matches GUID or alphanumeric ID)
  const appMatch = desc.match(/applicant(?:id)?[:\s]+([a-f0-9-]+)/i);
  const applicantId = appMatch ? appMatch[1] : undefined;

  // 2. Extract vacancyId
  const vacMatch = desc.match(/vacancyid[:\s]+([a-f0-9-]+)/i);
  const vacancyId = vacMatch ? vacMatch[1] : undefined;

  // 3. Extract interviewId
  const intMatch = desc.match(/interviewid[:\s]+([a-f0-9-]+)/i);
  const interviewId = intMatch ? intMatch[1] : undefined;

  // 4. Extract candidateName
  let candidateName: string | undefined;
  const candMatch = desc.match(/candidate[:\s]+([^|;]+)/i);
  if (candMatch) {
    candidateName = candMatch[1].trim();
  } else if (name.toLowerCase().startsWith("interview:")) {
    const afterPrefix = name.substring("interview:".length).trim();
    if (afterPrefix && !afterPrefix.toLowerCase().startsWith("interview")) {
      const parts = afterPrefix.split(" - ");
      candidateName = parts[0]?.trim();
    }
  }

  // 5. Extract roleTitle
  const roleMatch = desc.match(/role[:\s]+([^|;]+)/i);
  const roleTitle = roleMatch ? roleMatch[1].trim() : undefined;

  // 6. Extract meeting URL
  const urlMatch = desc.match(/(https?:\/\/[^\s|;]+)/i);
  const meetingUrl = urlMatch ? urlMatch[1].trim() : undefined;

  // 7. Extract round number
  const roundMatch = desc.match(/round[:\s]+(\d+)/i);
  const roundNumber = roundMatch ? Number(roundMatch[1]) : 1;

  // 8. Extract round type
  const roundTypeMatch = desc.match(/round\s+\d+\s*\(([^)]+)\)/i);
  const roundType = roundTypeMatch ? roundTypeMatch[1].trim() : undefined;

  // 9. Extract panelists
  const panelMatch = desc.match(/panel(?:ists)?[:\s]+([^|;]+)/i);
  const panelistIds = panelMatch
    ? panelMatch[1].split(",").map((p) => p.trim()).filter(Boolean)
    : undefined;

  return {
    isInterview: true,
    candidateName,
    roleTitle,
    roundNumber,
    roundType,
    applicantId,
    vacancyId,
    interviewId,
    meetingUrl,
    panelistIds,
    rawDescription: desc,
  };
}

