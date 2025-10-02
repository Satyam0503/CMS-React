import { ResponseData } from "../../../../utils/common_types";

export interface AuthModel {
  token: string;
  refreshToken?: string;
}

export interface CompanyRegisterModel {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  password: string;
}

export type UserLoginModel = Pick<CompanyRegisterModel, "email" | "password">;

export interface UserAddressModel {
  addressLine: string;
  city: string;
  state: string;
  postCode: string;
}

export interface UserCommunicationModel {
  email: boolean;
  sms: boolean;
  phone: boolean;
}

export type AuthTokens = {
  token: string;
  refreshToken: string;
};

export type RefreshTokenPayload = {
  refreshToken: string;
};

export type LogInResponseModel = ResponseData<AuthTokens>;
