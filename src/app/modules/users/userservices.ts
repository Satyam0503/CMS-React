import { AxiosResponse } from "axios";
import { ServiceUrl } from "../../../utils/constant/Constant";
import { getRequest, postRequest } from "../../../server/axios";
import {

  CertificationResponseData,
  EmployeeResponseData,
  SkillsResponseData,
  UserCertificationModel,
  UserEducationModel,
  UserEducationResponseData,
  UserSummaryResponseData,
} from "../../../utils/common_types";

export  type UserSummaryModel = {
  summaryId:string,
  summary: string;
};

export const getEmployeeDetails = async (token: string) => {
  return getRequest<EmployeeResponseData>(
    ServiceUrl.GET_EMPLOYEE_DETAILS,
    {},
    token
  );
};

export const getEmployeeCertifications = async (token:string)=>{
  return postRequest<{},CertificationResponseData>(ServiceUrl.GET_EMPLOYEE_CERTIFICATIONS,{},{},false,token);
}
export const getEmployeeEducations = async (token:string)=>{
  return postRequest<{},UserEducationResponseData>(ServiceUrl.GET_EMPLOYEE_EDUCATIONS,{},{},false,token);
}

export const getEmployeeSummary = async (token:string) =>{
  return postRequest<{},UserSummaryResponseData>(ServiceUrl.GET_EMPLOYEE_SUMMARY,{},{},false,token);
}

export const getEmployeeSkills = async (token:string) =>{
  return postRequest<{},UserSummaryResponseData>(ServiceUrl.GET_EMPLOYEE_SKILLS,{},{},false,token);
}

export const updateEmployeeDetails = async (payload: any, token: string) => {
  return postRequest(ServiceUrl.UPDATE_EMPLOYEE, payload, {}, false, token);
};

export const udpateEmployeeSkills = async (payload:{skills:string[]},token:string)=>{
  return postRequest<{skills:string[]},SkillsResponseData>(ServiceUrl.UPDATE_EMPLOYEE_SKILLS,payload,{},false,token);
}

export const addEmployeeEducation = async(
  payload: UserEducationModel,
  token: string
) => {
  return postRequest<UserEducationModel, UserEducationResponseData>(
    ServiceUrl.ADD_EMPLOYEE_EDUCATION,
    payload,
    {},
    false,
    token
  );
};

export const updateEmployeeSummary = async (payload:UserSummaryModel,token:string)=>{
  return postRequest<UserSummaryModel,any>(ServiceUrl.UPDATE_EMPLOYEE_SUMMARY,payload,{},false,token);
}


export const addEmployeeCertification = async (
  payload: UserCertificationModel,
  token: string
) => {
  return postRequest<UserCertificationModel, CertificationResponseData>(
    ServiceUrl.ADD_EMPLOYEE_CERTIFICATION,
    payload,
    {},
    false,
    token
  );
};

export const updateUserEducation = async () => {
  //  for updating the user education details
};
