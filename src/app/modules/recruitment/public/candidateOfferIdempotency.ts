const storageKey = "codeji.candidate-offer-response.v1";
const maxKeys = 20;

type StoredKey = { idempotencyKey: string; lastUsedAt: number };
type StoredKeys = Record<string, StoredKey>;

const memoryFallback = new Map<string, StoredKeys>();
const offerVersionKey = (offerId: string, version: number) => `${encodeURIComponent(offerId)}:${version}`;

const createIdempotencyKey = () => {
  if (typeof crypto === "undefined") return "";
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const random = new Uint8Array(32);
  crypto.getRandomValues(random);
  return Array.from(random, (value) => value.toString(16).padStart(2, "0")).join("");
};

const read = (): StoredKeys => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(storageKey) || "null") as StoredKeys | null;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {
    // Keep an in-memory key if browser storage is unavailable or malformed.
  }
  return memoryFallback.get(storageKey) ?? {};
};

const write = (store: StoredKeys) => {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(store));
    memoryFallback.delete(storageKey);
  } catch {
    memoryFallback.set(storageKey, store);
  }
};

/** Persists only a random request key, never the bearer link or candidate form data. */
export function getCandidateOfferResponseIdempotencyKey(offerId: string, version: number) {
  if (!offerId || !Number.isInteger(version) || version < 1) return "";
  const keys = read();
  const id = offerVersionKey(offerId, version);
  const existing = keys[id];
  if (existing?.idempotencyKey) {
    existing.lastUsedAt = Date.now();
    write(keys);
    return existing.idempotencyKey;
  }

  const idempotencyKey = createIdempotencyKey();
  if (!idempotencyKey) return "";
  keys[id] = { idempotencyKey, lastUsedAt: Date.now() };
  const bounded = Object.fromEntries(
    Object.entries(keys)
      .sort(([, left], [, right]) => right.lastUsedAt - left.lastUsedAt)
      .slice(0, maxKeys),
  );
  write(bounded);
  return idempotencyKey;
}

export function clearCandidateOfferResponseIdempotencyKey(offerId: string, version: number) {
  const keys = read();
  delete keys[offerVersionKey(offerId, version)];
  if (Object.keys(keys).length === 0) {
    memoryFallback.delete(storageKey);
    try { sessionStorage.removeItem(storageKey); } catch { /* No storage is needed after success. */ }
    return;
  }
  write(keys);
}
