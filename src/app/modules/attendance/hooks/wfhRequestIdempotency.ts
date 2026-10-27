export type WfhRequestPayload = {
  fromDate: string;
  toDate: string;
  durationType: string;
  reasonCode: string;
  reasonText?: string;
};

const STORAGE_PREFIX = "codeji:wfh-request-idempotency:v1:";
const RETRY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const memoryKeys = new Map<string, { key: string; createdAt: number }>();
const pendingKeys = new Map<string, Promise<string>>();

async function payloadFingerprint(payload: WfhRequestPayload): Promise<string> {
  const canonical = JSON.stringify({
    fromDate: payload.fromDate,
    toDate: payload.toDate,
    durationType: payload.durationType.trim(),
    reasonCode: payload.reasonCode.trim().toUpperCase(),
    reasonText: payload.reasonText?.trim() ?? "",
  });

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
    return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
  }

  // The fingerprint only selects a local retry slot. The server independently hashes
  // the canonical request body and rejects any accidental key collision.
  let left = 0x811c9dc5;
  let right = 0x9e3779b9;
  for (let index = 0; index < canonical.length; index += 1) {
    const code = canonical.charCodeAt(index);
    left = Math.imul(left ^ code, 0x01000193);
    right = Math.imul(right ^ (code + index), 0x85ebca6b);
  }
  return `${(left >>> 0).toString(16)}${(right >>> 0).toString(16)}`;
}

function createKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function readStoredKey(fingerprint: string): { key: string; createdAt: number } | null {
  const memory = memoryKeys.get(fingerprint);
  if (memory && Date.now() - memory.createdAt < RETRY_WINDOW_MS) return memory;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${fingerprint}`);
    if (raw) {
      const parsed = JSON.parse(raw) as { key?: unknown; createdAt?: unknown };
      if (typeof parsed.key === "string" && typeof parsed.createdAt === "number" &&
        Date.now() - parsed.createdAt >= 0 && Date.now() - parsed.createdAt < RETRY_WINDOW_MS) {
        const stored = { key: parsed.key, createdAt: parsed.createdAt };
        memoryKeys.set(fingerprint, stored);
        return stored;
      }
      localStorage.removeItem(`${STORAGE_PREFIX}${fingerprint}`);
    }
  } catch {
    // Storage may be blocked by browser privacy settings; keep the retry key in memory.
  }
  memoryKeys.delete(fingerprint);
  return null;
}

function createOrReadKey(fingerprint: string): string {
  const existing = readStoredKey(fingerprint);
  if (existing) return existing.key;
  const created = { key: createKey(), createdAt: Date.now() };
  memoryKeys.set(fingerprint, created);
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${fingerprint}`, JSON.stringify(created));
  } catch {
    // In-memory persistence still keeps repeated submissions in this page idempotent.
  }
  return created.key;
}

export async function getWfhRequestIdempotencyKey(payload: WfhRequestPayload): Promise<string> {
  const fingerprint = await payloadFingerprint(payload);
  const pending = pendingKeys.get(fingerprint);
  if (pending) return pending;

  const create = () => createOrReadKey(fingerprint);
  const operation = (async () => {
    if (typeof navigator !== "undefined" && "locks" in navigator && navigator.locks) {
      return navigator.locks.request(`${STORAGE_PREFIX}${fingerprint}`, create);
    }
    return create();
  })().finally(() => pendingKeys.delete(fingerprint));
  pendingKeys.set(fingerprint, operation);
  return operation;
}

export async function clearWfhRequestIdempotencyKey(payload: WfhRequestPayload): Promise<void> {
  const fingerprint = await payloadFingerprint(payload);
  memoryKeys.delete(fingerprint);
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${fingerprint}`);
  } catch {
    // The in-memory key is already removed.
  }
}
