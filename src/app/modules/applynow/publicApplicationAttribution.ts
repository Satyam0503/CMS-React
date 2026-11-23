const readTag = (params: URLSearchParams, key: string) => {
  const value = params.get(key)?.trim();
  return value ? value.slice(0, 200) : "";
};

type Attribution = ReturnType<typeof readAttribution>;
const memoryAttribution = new Map<string, Attribution>();

const readAttribution = (search: string, referrer: string, currentHost: string) => {
  const params = new URLSearchParams(search);
  let referrerHost = "";
  try {
    const referrerUrl = referrer ? new URL(referrer) : null;
    if (referrerUrl && ["http:", "https:"].includes(referrerUrl.protocol) && referrerUrl.hostname !== currentHost) {
      referrerHost = referrerUrl.hostname.slice(0, 253);
    }
  } catch {
    // Ignore invalid or non-URL referrers; attribution must never block applying.
  }

  return {
    attributionSource: readTag(params, "utm_source"),
    attributionMedium: readTag(params, "utm_medium"),
    attributionCampaign: readTag(params, "utm_campaign"),
    attributionContent: readTag(params, "utm_content"),
    attributionTerm: readTag(params, "utm_term"),
    referrerHost,
  };
};

export const capturePublicApplicationAttribution = (
  jobId: string,
  search: string,
  referrer: string,
  currentHost: string,
) => {
  const key = `codeji.public-application.attribution.v1:${encodeURIComponent(jobId)}`;
  const cached = memoryAttribution.get(key);
  if (cached) return cached;
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored) as Attribution;
      memoryAttribution.set(key, parsed);
      return parsed;
    }
  } catch {
    // Storage can be disabled; keep this attempt's values in memory instead.
  }
  const attribution = readAttribution(search, referrer, currentHost);
  memoryAttribution.set(key, attribution);
  try { sessionStorage.setItem(key, JSON.stringify(attribution)); } catch { /* Attribution is optional. */ }
  return attribution;
};
