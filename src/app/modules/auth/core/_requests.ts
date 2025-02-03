import axios from "axios";
import { CompanyRegisterModel, UserLoginModel} from "./_models";
import { postRequest } from "../../../../server/axios";
import { ServiceUrl } from "../../../../utils/constant/Constant";
import { ApiResponse, GetUserDetailsResponseData } from "../../../../utils/common_types";


export const registerCompany = async (payload:CompanyRegisterModel)=>{
  return postRequest<CompanyRegisterModel,ApiResponse>(ServiceUrl.REGISTER_COMPANY,payload);
}

export const login = async (payload:UserLoginModel ) => {
  return postRequest<UserLoginModel,ApiResponse> (ServiceUrl.USER_LOGIN,payload);
}

export const getSignedUserDetails= async () => {
  return postRequest<{},GetUserDetailsResponseData>(ServiceUrl.GET_USER_DETAILS);
}

export function requestPassword(email: string) {
  // return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
  //   email,
  // });
}

