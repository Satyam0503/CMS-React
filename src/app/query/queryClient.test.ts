import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { queryClient } from "./queryClient";

describe("query client defaults", () => {
  const retry = queryClient.getDefaultOptions().queries?.retry;

  it("does not retry client errors", () => {
    const error = new AxiosError(
      "Unauthorized",
      "ERR_BAD_REQUEST",
      { headers: new AxiosHeaders() },
      undefined,
      {
        data: undefined,
        status: 401,
        statusText: "Unauthorized",
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      },
    );

    expect(typeof retry).toBe("function");
    expect((retry as (count: number, error: unknown) => boolean)(0, error)).toBe(false);
  });

  it("bounds retries for transient failures", () => {
    const shouldRetry = retry as (count: number, error: unknown) => boolean;

    expect(shouldRetry(0, new Error("Network error"))).toBe(true);
    expect(shouldRetry(2, new Error("Network error"))).toBe(false);
  });
});

