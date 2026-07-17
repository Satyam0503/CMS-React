import { describe, expect, it } from "vitest";
import { apiQueryKey, queryKeys } from "./queryKeys";

describe("API query keys", () => {
  it("separates requests by account, language, path and parameters", () => {
    const base = apiQueryKey("/employees", { page: 1 }, "en", "account-a");

    expect(base).toEqual([
      ...queryKeys.api,
      "account-a",
      "en",
      "/employees",
      { page: 1 },
    ]);
    expect(apiQueryKey("/employees", { page: 2 }, "en", "account-a")).not.toEqual(base);
    expect(apiQueryKey("/employees", { page: 1 }, "fr", "account-a")).not.toEqual(base);
    expect(apiQueryKey("/employees", { page: 1 }, "en", "account-b")).not.toEqual(base);
  });
});

