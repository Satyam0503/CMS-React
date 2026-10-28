import {
  CompanyRegisterModel,
  LogInResponseModel,
  RefreshTokenPayload,
  UserLoginModel,
} from "./_models";
import { postRequest, rawPostRequest } from "../../../../server/axios";
import { ServiceUrl } from "../../../../utils/constant/Constant";
import {
  ApiResponse,
  CreatePasswordModel,
  GetUserDetailsResponseData,
} from "../../../../utils/common_types";

export const registerCompany = async (payload: CompanyRegisterModel) => {
  return postRequest<CompanyRegisterModel, ApiResponse>(
    ServiceUrl.REGISTER_COMPANY,
    payload
  );
};

export const login = async (payload: UserLoginModel) => {
  return postRequest<UserLoginModel, LogInResponseModel>(
    ServiceUrl.USER_LOGIN,
    payload
  );
};

export const resendEmailVerification = async (email: string) => {
  return postRequest<{ email: string }, ApiResponse>(
    "api/account/resend-email-verification",
    { email }
  );
};

export const logoutUser = async (payload: RefreshTokenPayload) => {
  return postRequest<RefreshTokenPayload, ApiResponse>(
    ServiceUrl.LOGOUT,
    payload
  );
};

export const refreshTokenAsync = async (payload: RefreshTokenPayload) => {
  return rawPostRequest<RefreshTokenPayload, LogInResponseModel>(
    ServiceUrl.REFRESH_TOKEN,
    payload
  );
};

export const getSignedUserDetails = async () => {
  return postRequest<object, GetUserDetailsResponseData>(
    ServiceUrl.GET_USER_DETAILS
  );
};

export const createPassword = async (payload: CreatePasswordModel) => {
  return postRequest<CreatePasswordModel, ApiResponse>(
    ServiceUrl.CREATE_NEW_PASSWORD,
    payload
  );
};

export const resetPassword = async (email: string) => {
  return postRequest<string, ApiResponse>(ServiceUrl.RESET_PASSWORD, email);
};
