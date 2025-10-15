import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import {
  getLocalKey,
  RefreshTokenPayload,
  setLocalKey,
} from "../app/modules/auth";

import { refreshTokenAsync } from "../app/modules/auth/core/_requests";
import { getCurrentAppLanguage } from "../utils/common";
import { BaseUrl, ServiceUrl } from "../utils/constant/Constant";

let isRefreshing = false;
let failedRequestsQueue: Array<(token: string) => void> = [];

const timeout = 10000;

const instance = axios.create({
  baseURL: BaseUrl,
  timeout: timeout,
});

// function to get new access token
export const refreshToken = async () => {
  try {
    isRefreshing = true;
    const refreshToken = getLocalKey()?.refreshToken;
    if (!refreshToken) {
      throw new Error();
    }
    const { data } = await refreshTokenAsync({
      refreshToken,
    });
    if (data.success) {
      setLocalKey(data.methodResult);
      return data.methodResult.token;
    } else {
      throw new Error();
    }
  } catch (error) {
    localStorage.clear();
    window.location.href = "/auth";
  } finally {
    isRefreshing = false;
  }
};

// using interceptors to automatically set token and current Language for each request
instance.interceptors.request.use(
  (config) => {
    const token = getLocalKey()?.token ?? "";
    config.headers["Accept-Language"] = getCurrentAppLanguage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
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
    if (error.response) {
      if (
        error.response.status === 401 &&
        !originalRequest?._retry &&
        !isRefreshing
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
          instance.defaults.headers.common.Authorization = `Bearer ${token}`;
          failedRequestsQueue.forEach((callback) => callback(token));
          failedRequestsQueue = [];
          return instance.request(originalRequest);
        } else {
          return Promise.reject(error);
        }
      }
      if (error.response.status === 401 && isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push((token: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(instance(originalRequest));
          });
        });
      }
    } else {
      console.error("Something Went Wrong");
    }
    return Promise.reject(error);
  }
);

export const getRequest = <ResponseData>(
  path: string,
  config?: AxiosRequestConfig
) => {
  return instance.get<ResponseData>(path, {
    ...config,
    headers: {
      "Cache-Control": "max-age=3600",
    },
  });
};

export const postRequest = <RequestData, ResponseData>(
  path: string,
  data?: RequestData,
  config?: AxiosRequestConfig,
  isformData: boolean = false
) => {
  return instance.post<ResponseData>(path, data, {
    ...config,
    headers: {
      "Content-Type": isformData ? "multipart/form-data" : "application/json",
      "Cache-Control": " max-age=3600",
    },
  });
};

export const patchRequest = <Data, ResponseData>(
  path: string,
  data?: Data,
  config?: AxiosRequestConfig
) => {
  return instance.patch<ResponseData>(path, data, {
    ...config,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteRequest = <ResponseData>(
  path: string,
  config?: AxiosRequestConfig
) => {
  return instance.delete<ResponseData>(path, config);
};

export const putRequest = <Data, ResponseData>(
  path: string,
  data?: Data,
  config?: AxiosRequestConfig
) => {
  return instance.put<ResponseData>(path, data, {
    ...config,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
