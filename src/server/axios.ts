
import axios, { AxiosRequestConfig } from "axios";

const { token } = JSON.parse(localStorage.getItem("kt-auth-react-v") || "{}");

const configData = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

export const getRequest = (
  path: string,
  config: AxiosRequestConfig = configData,
  tokenData: string = token
) => {
  return axios.get(path, {
    ...config,
    headers: {
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${!tokenData ? token : tokenData}`,
      "Cache-Control": " max-age=3600",
    },
  });
};

export const postRequest = <D,R>(
  path: string,
  data?: D,
  config?: AxiosRequestConfig,
  isformData: boolean = false,
  tokenData: string = token
) => {
  return axios.post<R>(path, data, {
    ...config,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": isformData ? "multipart/form-data" : "application/json ",
      Authorization: `Bearer ${!tokenData ? token : tokenData}`,
      "Cache-Control": " max-age=3600",
    },
  });
};

export const patchRequest = <D,>(
  path: string,
  data?: D,
  config: AxiosRequestConfig = configData
) => {
  return axios.patch(path, data, config);
};

export const deleteRequest = (path: string, config = configData) => {
  return axios.delete(path, config);
};
export const putRequest =  <D,>(path: string, data?: D, config = configData) => {
  return axios.put(path, data, config);
};

