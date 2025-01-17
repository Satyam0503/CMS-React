import axios from "axios";
import { CompanyRegisterModel, UserLoginModel} from "./_models";
import { postRequest } from "../../../../server/axios";
import { ServiceUrl } from "../../../../utils/constant/Constant";
import { ApiResponse, GetUserDetailsResponseData } from "../../../../utils/common_types";

const API_URL = import.meta.env.VITE_BASEURL;

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`;
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`;


export const registerCompany = async (payload:CompanyRegisterModel)=>{
  return postRequest<CompanyRegisterModel,ApiResponse>(ServiceUrl.REGISTER_COMPANY,payload,{},false);
}

export const login = async (payload:UserLoginModel ) => {
  return postRequest<UserLoginModel,ApiResponse> (ServiceUrl.USER_LOGIN,payload,{}, false);
}

export const getSignedUserDetails= async (token: string) => {
  return postRequest<{},GetUserDetailsResponseData>(ServiceUrl.GET_USER_DETAILS,{},{},false,token);
}

export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

