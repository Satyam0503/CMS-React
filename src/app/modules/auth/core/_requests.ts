import axios from "axios";
import { AuthModel, UserModel } from "./_models";

const API_URL = 'http://localhost:3000/api';

console.log("API ::", API_URL);

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/annonymous/verify_token`;
export const LOGIN_URL = `${API_URL}/users/getToken`;
export const REGISTER_URL = `${API_URL}/register`;
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`;

interface resultModel<T = object>{
  success:boolean,
  message:string,
  statusCode:number,
  methodResult:T,
  methodResults?:T[],
  totalRecords?:number,
  byteLength?:number
}

// Server should return AuthModel
export function login(email: string, password: string) {
  return axios.post<resultModel<AuthModel>>(LOGIN_URL, {
    email,
    password,
  });
}

// Server should return AuthModel
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

export function getUserByToken(token: string) {
  return axios.post<resultModel<UserModel>>(
    GET_USER_BY_ACCESSTOKEN_URL,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
