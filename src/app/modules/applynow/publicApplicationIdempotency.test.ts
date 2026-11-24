import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearPublicApplicationSubmissionKey,
  getPublicApplicationSubmissionKey,
} from "./publicApplicationIdempotency";

const values = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  coverLetter: "Private candidate note",
  privacyNoticeVersion: "2026-01",
};

const createSessionStorage = () => {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
    values: () => [...entries.values()],
  };
};

describe("public application idempotency persistence", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reuses the same payload key across component remounts without storing candidate fields", async () => {
    const storage = createSessionStorage();
    vi.stubGlobal("sessionStorage", storage);

    const first = await getPublicApplicationSubmissionKey("job-1", values);
    const afterReload = await getPublicApplicationSubmissionKey("job-1", { ...values, email: " ADA@example.com " });

    expect(afterReload).toBe(first);
    expect(storage.values().join(" ")).not.toContain("ada@example.com");
    expect(storage.values().join(" ")).not.toContain("Private candidate note");
  });

  it("keeps separate pending keys for changed payloads and clears only a completed payload", async () => {
    vi.stubGlobal("sessionStorage", createSessionStorage());

    const original = await getPublicApplicationSubmissionKey("job-2", values);
    const changed = await getPublicApplicationSubmissionKey("job-2", { ...values, email: "grace@example.com" });
    expect(changed).not.toBe(original);
    expect(await getPublicApplicationSubmissionKey("job-2", values)).toBe(original);

    await clearPublicApplicationSubmissionKey("job-2", values);
    expect(await getPublicApplicationSubmissionKey("job-2", { ...values, email: "grace@example.com" })).toBe(changed);
    expect(await getPublicApplicationSubmissionKey("job-2", values)).not.toBe(original);
  });

  it("keeps retries stable for the current page session when session storage is unavailable", async () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => { throw new Error("Storage unavailable"); },
      setItem: () => { throw new Error("Storage unavailable"); },
      removeItem: () => { throw new Error("Storage unavailable"); },
    });

    const first = await getPublicApplicationSubmissionKey("job-storage-blocked", values);
    expect(await getPublicApplicationSubmissionKey("job-storage-blocked", values)).toBe(first);
  });
});
