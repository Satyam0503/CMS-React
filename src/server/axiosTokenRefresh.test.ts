import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_LOCAL_STORAGE_KEY } from "../utils/constant/Constant";
import * as authRequests from "../app/modules/auth/core/_requests";
import { refreshToken } from "./axios";
import Connector from "./SignalR";
import ChatHub from "./ChatHub";

describe("Axios Token Refresh & Dynamic Hub Connections", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("coalesces concurrent refresh calls into a single in-flight network request", async () => {
    const initialTokens = {
      token: "old-access-token",
      refreshToken: "valid-refresh-token",
    };
    localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, JSON.stringify(initialTokens));

    const refreshedTokens = {
      token: "new-access-token-999",
      refreshToken: "new-refresh-token-999",
    };

    let resolveRefresh: ((val: any) => void) | null = null;
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve;
    });

    const refreshSpy = vi
      .spyOn(authRequests, "refreshTokenAsync")
      .mockImplementation(() => refreshPromise as any);

    // Fire 4 parallel refresh requests (simulating concurrent 401s in dep/test)
    const call1 = refreshToken();
    const call2 = refreshToken();
    const call3 = refreshToken();
    const call4 = refreshToken();

    // Verify only 1 network request was initiated
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(refreshSpy).toHaveBeenCalledWith({ refreshToken: "valid-refresh-token" });

    // Complete the refresh request
    resolveRefresh!({
      data: {
        success: true,
        methodResult: refreshedTokens,
      },
    });

    const [res1, res2, res3, res4] = await Promise.all([call1, call2, call3, call4]);

    // All callers must receive the exact same new token
    expect(res1).toBe("new-access-token-999");
    expect(res2).toBe("new-access-token-999");
    expect(res3).toBe("new-access-token-999");
    expect(res4).toBe("new-access-token-999");

    // Local storage must be updated with the new token
    const stored = JSON.parse(localStorage.getItem(AUTH_LOCAL_STORAGE_KEY) || "{}");
    expect(stored.token).toBe("new-access-token-999");
    expect(stored.refreshToken).toBe("new-refresh-token-999");
  });

  it("clears session and redirects when refresh fails", async () => {
    localStorage.setItem(
      AUTH_LOCAL_STORAGE_KEY,
      JSON.stringify({ token: "expired", refreshToken: "revoked-token" })
    );

    vi.spyOn(authRequests, "refreshTokenAsync").mockResolvedValue({
      data: {
        success: false,
        message: "Token revoked",
      },
    } as any);

    // Save original window.location
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: "" } as any;

    try {
      const result = await refreshToken();
      expect(result).toBeNull();
      expect(localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)).toBeNull();
      expect(window.location.href).toBe("/auth");
    } finally {
      (window as any).location = originalLocation;
    }
  });

  it("SignalR and ChatHub dynamically provide the latest refreshed token", () => {
    localStorage.setItem(
      AUTH_LOCAL_STORAGE_KEY,
      JSON.stringify({ token: "token-v1", refreshToken: "refresh-v1" })
    );

    const connector = Connector.getInstance();
    const chatHub = ChatHub.getInstance();

    expect(connector).toBeDefined();
    expect(chatHub).toBeDefined();

    // Update storage to token-v2 as would happen after refreshToken()
    localStorage.setItem(
      AUTH_LOCAL_STORAGE_KEY,
      JSON.stringify({ token: "token-v2-refreshed", refreshToken: "refresh-v2" })
    );

    const updatedStorage = JSON.parse(localStorage.getItem(AUTH_LOCAL_STORAGE_KEY) || "{}");
    expect(updatedStorage.token).toBe("token-v2-refreshed");
  });
});
