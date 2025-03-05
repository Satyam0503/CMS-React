import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { AUTH_LOCAL_STORAGE_KEY } from "../app/modules/auth";
import { toast } from "react-toastify";

// using interceptors to automatically set token for each request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)
      ? localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)!
      : "";
    if (token) {
      config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor to handle response error
axios.interceptors.response.use(
  (response) => response,
  (error:AxiosError) => {
    if(!error.response){
      toast.error("Something Went Wrong");
    }
    else if (error.response?.status === 404) {
      toast.error("Requested Resource Not Found");
    }
    else if (error.response?.status === 401) {
      toast.error("Token expired");
    }
    else if(error.response?.status === 500) {
      toast.error("Opps! Server is down. Try Again later")
    }
    else {
      toast.error("Something Went wrong");
    }
    return Promise.reject();
  }
);

export const getRequest = <ResponseData>(
  path: string,
  config?: AxiosRequestConfig ,
) => {  
  return axios.get<ResponseData>(path, {
    ...config,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "max-age=3600",
    },
  });
};

export const postRequest = <RequestData, ResponseData>(
  path: string,
  data?: RequestData,
  config?: AxiosRequestConfig,
  isformData: boolean = false,
) => {
  return axios.post<ResponseData>(path, data, {
    ...config,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": isformData ? "multipart/form-data" : "application/json ",
      "Cache-Control": " max-age=3600",
    },
  });
};

export const patchRequest = <D>(
  path: string,
  data?: D,
  config?: AxiosRequestConfig 
) => {
  return axios.patch(path, data, config);
};

export const deleteRequest = <ResponseData>(path: string, config?:AxiosRequestConfig) => {
  return axios.delete<ResponseData>(path, config);
};
export const putRequest = <D>(path: string, data?: D, config?:AxiosRequestConfig) => {
  return axios.put(path, data, config);
};
