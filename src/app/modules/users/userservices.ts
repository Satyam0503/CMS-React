import { AxiosResponse } from "axios";
import { ServiceUrl } from "../../../Constant"
import { getRequest, postRequest } from "../../../server/axios"
import { AddCertificationResponseData, AddUpdateSummaryResponseData, AddUserEducationResponseData, ApiResponse, EmployeesDataTypes, GetEmployeeDetailsResponseData, UserCertificationType, UserEducationType } from "../../../utils/common_types";

type AddUpdatePayload ={
    summary:string;
}

export const getUserDetails = async (id:string,token:string): Promise<AxiosResponse<GetEmployeeDetailsResponseData>> =>{
    return getRequest(`${ServiceUrl.GET_EMPLOYEE_DETAILS}:${id}`,{},token);
}

export const updateUserAvatar = async(payload:FormData,token:string)=>{
    return postRequest(ServiceUrl.UPDATE_USER_AVATAR,payload,{},true,token);
}

export const addUpdateUserSummary = async(id:string,payload:AddUpdatePayload,token:string):Promise<AxiosResponse<AddUpdateSummaryResponseData,any>> =>{
    return postRequest(`${ServiceUrl.ADD_UPDATE_USER_SUMMARY}:${id}`,payload,{},false,token);
}

export const updateUserDetails = async(id:string,payload:any,token:string):Promise<AxiosResponse<ApiResponse>> =>{
    return postRequest(`${ServiceUrl.UPDATE_USER_DETAILS}:${id}`,payload,{},false,token);
}

type AddUserSkillsPayload={
    skills:string[];
}

export const addUserSkills = async (id:string,payload:AddUserSkillsPayload,token:string):Promise<AxiosResponse<any>> =>{
    return postRequest(`${ServiceUrl.ADD_USER_SKILLS}:${id}`,payload,{},false,token);
}

export const addUserEducation = async (id:string,payload:UserEducationType,token:string):Promise<AxiosResponse<AddUserEducationResponseData>> =>{
    return  postRequest(`${ServiceUrl.ADD_USER_EDUCATION}:${id}`,payload,{},false,token)
}
export const updateUserEducation = async ()=>{
    //  for updating the user education details
}

export const addUpdateUserCertification = async (id:string,payload:any,token:string):Promise<AxiosResponse<AddCertificationResponseData>> =>{
    return postRequest(`${ServiceUrl.ADD_USER_CERTIFICATION}:${id}`,payload,{},false,token);
}