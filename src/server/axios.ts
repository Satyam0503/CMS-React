import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import {
  getLocalKey,
  RefreshTokenPayload,
  setLocalKey,
  removeLocalKey,
} from "../app/modules/auth";

import { refreshTokenAsync } from "../app/modules/auth/core/_requests";
import { getCurrentAppLanguage } from "../utils/common";
import { BaseUrl, ServiceUrl } from "../utils/constant/Constant";
import { queryClient } from "../app/query/queryClient";
import { apiQueryKey } from "../app/query/queryKeys";
import { store } from "../app/Redux/store";
import { setToken } from "../app/Redux/Reducers/authSlice";

let refreshTokenPromise: Promise<string | null> | null = null;


const anonymousAuthRoutes = new Set([
  ServiceUrl.USER_LOGIN,
  ServiceUrl.REGISTER_COMPANY,
  ServiceUrl.REFRESH_TOKEN,
  ServiceUrl.CREATE_NEW_PASSWORD,
  ServiceUrl.RESET_PASSWORD,
  "api/account/resend-email-verification",
]);

const isAnonymousAuthRoute = (url?: string) => {
  const path = (url ?? "").split("?")[0].replace(/^\//, "");
  // The former-employee portal authenticates with a separate one-time link or
  // OTP session header. Its expected 401 responses must never invoke the HRMS
  // refresh-token flow and redirect a former employee to the normal login page.
  return anonymousAuthRoutes.has(path) || path.startsWith("api/public/former-employee/");
};

const timeout = 30000;

const getAuthCacheScope = () => {
  const token = getLocalKey()?.token ?? "anonymous";
  let hash = 0;

  for (let index = 0; index < token.length; index += 1) {
    hash = (hash * 31 + token.charCodeAt(index)) | 0;
  }

  return hash.toString(36);
};

const instance = axios.create({
  baseURL: BaseUrl,
  timeout: timeout,
});

export const rawPostRequest = async <RequestData, ResponseData>(
  path: string,
  data?: RequestData,
  config?: AxiosRequestConfig,
  isformData: boolean = false
) => {
  const headers: Record<string, string> = { "Cache-Control": "max-age=3600" };
  if (!isformData) headers["Content-Type"] = "application/json";

  return instance.post<ResponseData>(path, data, {
    ...config,
    headers: { ...headers, ...config?.headers },
  });
};

// function to get new access token
export const refreshToken = async (): Promise<string | null> => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      const storedRefreshToken = getLocalKey()?.refreshToken;
      if (!storedRefreshToken) {
        throw new Error("No refresh token");
      }
      const { data } = await refreshTokenAsync({
        refreshToken: storedRefreshToken,
      });
      if (data.success && data.methodResult?.token) {
        setLocalKey(data.methodResult);
        instance.defaults.headers.common.Authorization = `Bearer ${data.methodResult.token}`;
        try {
          store.dispatch(setToken({ token: data.methodResult.token }));
        } catch {
          // ignore if store is not yet initialized
        }
        return data.methodResult.token;
      } else {
        throw new Error(data.message || "Failed to refresh token");
      }
    } catch (error) {
      removeLocalKey();
      localStorage.clear();
      window.location.href = "/auth";
      return null;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

// using interceptors to automatically set token and current Language for each request
instance.interceptors.request.use(
  (config) => {
    const isAnonymousRoute = isAnonymousAuthRoute(config.url);
    const token = getLocalKey()?.token ?? "";
    config.headers["Accept-Language"] = getCurrentAppLanguage();
    if (!isAnonymousRoute && token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isAnonymousRoute) {
      const cId = localStorage.getItem("clientId") || "";
      if (cId != null && cId != "") config.headers["cId"] = cId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor to handle response error
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !isAnonymousAuthRoute(originalRequest.url) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const token = await refreshToken();
      if (token) {
        if (originalRequest.url === ServiceUrl.LOGOUT) {
          const payload: RefreshTokenPayload = {
            refreshToken: getLocalKey()?.refreshToken ?? "",
          };
          originalRequest.data = JSON.stringify(payload);
        }
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance.request(originalRequest);
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export const getRequest = <ResponseData>(
  path: string,
  config?: AxiosRequestConfig
) => {
  const bypassQueryCache = config?.headers?.["Cache-Control"] === "no-cache";
  return queryClient.fetchQuery({
    queryKey: apiQueryKey(
      path,
      config?.params,
      getCurrentAppLanguage(),
      getAuthCacheScope(),
    ),
    queryFn: ({ signal }) =>
      instance.get<ResponseData>(path, {
        ...config,
        signal: config?.signal ?? signal,
        headers: {
          ...config?.headers,
          // Callers that display time-sensitive, token-derived data (for example
          // an employee's own attendance) can explicitly opt out of a cached
          // response. Preserve the default for the existing read-heavy screens.
          "Cache-Control": config?.headers?.["Cache-Control"] ?? "max-age=3600",
        },
      }),
    // `fetchQuery` otherwise returns a still-fresh TanStack cache entry before
    // Axios has a chance to honour the caller's no-cache header.
    staleTime: bypassQueryCache ? 0 : undefined,
  });
};

/** Authenticated binary download. Do not use a browser-tab URL for protected files. */
export const getBlobRequest = (path: string) =>
  instance.get(path, { responseType: "blob", headers: { "Cache-Control": "no-cache" } });

const invalidateApiQueries = () =>
  queryClient.invalidateQueries();

export const postRequest = async <RequestData, ResponseData>(
  path: string,
  data?: RequestData,
  config?: AxiosRequestConfig,
  isformData: boolean = false
) => {
  // For multipart uploads, do NOT set Content-Type manually — axios auto-sets
  // it to "multipart/form-data; boundary=...." when it sees a FormData body.
  // Setting it manually drops the boundary and the server fails to parse.
  const headers: Record<string, string> = { "Cache-Control": " max-age=3600" };
  if (!isformData) headers["Content-Type"] = "application/json";

  const response = await instance.post<ResponseData>(path, data, {
    ...config,
    headers: { ...headers, ...config?.headers },
  });
  await invalidateApiQueries();
  return response;
};

export const patchRequest = async <Data, ResponseData>(
  path: string,
  data?: Data,
  config?: AxiosRequestConfig
) => {
  const response = await instance.patch<ResponseData>(path, data, {
    ...config,
    headers: {
      "Content-Type": "application/json",
    },
  });
  await invalidateApiQueries();
  return response;
};

export const deleteRequest = async <ResponseData>(
  path: string,
  config?: AxiosRequestConfig
) => {
  const response = await instance.delete<ResponseData>(path, config);
  await invalidateApiQueries();
  return response;
};

export const putRequest = async <Data, ResponseData>(
  path: string,
  data?: Data,
  config?: AxiosRequestConfig
) => {
  const response = await instance.put<ResponseData>(path, data, {
    ...config,
    headers: {
      "Content-Type": "application/json",
    },
  });
  await invalidateApiQueries();
  return response;
};
