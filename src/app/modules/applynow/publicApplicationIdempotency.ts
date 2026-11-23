const storagePrefix = "codeji.public-application.attempts.v1";
const attemptLifetimeMs = 24 * 60 * 60 * 1000;
const maxRememberedAttempts = 10;

type Attempt = { fingerprint: string; key: string; createdAt: number };
type AttemptStore = { attempts: Attempt[] };

const memoryFallback = new Map<string, AttemptStore>();

const createKey = () => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const random = new Uint8Array(32);
  crypto.getRandomValues(random);
  return Array.from(random, (value) => value.toString(16).padStart(2, "0")).join("");
};

const storageKey = (jobId: string) => `${storagePrefix}:${encodeURIComponent(jobId)}`;

const readStore = (key: string): AttemptStore => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || "null") as AttemptStore | null;
    if (parsed && Array.isArray(parsed.attempts)) return parsed;
  } catch {
    // Keep an in-memory retry key when browser storage is unavailable or malformed.
  }
  return memoryFallback.get(key) ?? { attempts: [] };
};

const writeStore = (key: string, store: AttemptStore) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(store));
    memoryFallback.delete(key);
  } catch {
    // The memory fallback still protects retries during the current page session.
    memoryFallback.set(key, store);
  }
};

const fingerprint = async (values: Record<string, unknown>) => {
  const canonical = JSON.stringify(Object.keys(values).sort().map((key) => {
    const value = values[key];
    const normalized = typeof value === "string" ? value.trim() : value;
    return [key, key.toLowerCase() === "email" && typeof normalized === "string" ? normalized.toLowerCase() : normalized];
  }));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
};

/** Reuses a pending application key after reload without persisting candidate fields or the resume token. */
export async function getPublicApplicationSubmissionKey(jobId: string, values: Record<string, unknown>) {
  const key = storageKey(jobId);
  const payloadFingerprint = await fingerprint(values);
  const now = Date.now();
  const store = readStore(key);
  const attempts = store.attempts.filter((attempt) => now - attempt.createdAt <= attemptLifetimeMs);
  const existing = attempts.find((attempt) => attempt.fingerprint === payloadFingerprint);
  if (existing) {
    writeStore(key, { attempts });
    return existing.key;
  }

  const newAttempt = { fingerprint: payloadFingerprint, key: createKey(), createdAt: now };
  writeStore(key, { attempts: [...attempts, newAttempt].slice(-maxRememberedAttempts) });
  return newAttempt.key;
}

/** Removes only the completed payload's key, preserving other pending attempts for this job. */
export async function clearPublicApplicationSubmissionKey(jobId: string, values: Record<string, unknown>) {
  const key = storageKey(jobId);
  const payloadFingerprint = await fingerprint(values);
  const store = readStore(key);
  const attempts = store.attempts.filter((attempt) => attempt.fingerprint !== payloadFingerprint);
  if (attempts.length === 0) {
    memoryFallback.delete(key);
    try { sessionStorage.removeItem(key); } catch { /* Memory fallback is already cleared. */ }
    return;
  }
  writeStore(key, { attempts });
}
