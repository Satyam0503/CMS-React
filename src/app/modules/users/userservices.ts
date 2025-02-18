import { ServiceUrl } from "../../../utils/constant/Constant";
import { getRequest, postRequest } from "../../../server/axios";
import {
  ApiResponse,
  CertificationResponseData,
  EmployeeResponseData,
  SkillsResponseData,
  UserCertificationModel,
  UserEducationModel,
  UserEducationResponseData,
  UserSummaryResponseData,
} from "../../../utils/common_types";

export type UserSummaryModel = {
  userId:string,
  summaryId: string;
  summary: string;
};

export const getEmployeeById = async () => {
  return getRequest<EmployeeResponseData>(ServiceUrl.GET_EMPLOYEE_DETAILS);
};

export const getEmployeeCertifications = async () => {
  return getRequest<CertificationResponseData>(
    ServiceUrl.GET_EMPLOYEE_CERTIFICATIONS
  );
};
export const getEmployeeEducations = async () => {
  return getRequest<UserEducationResponseData>(
    ServiceUrl.GET_EMPLOYEE_EDUCATIONS
  );
};

export const getEmployeeSummary = async () => {
  return getRequest<UserSummaryResponseData>(
    ServiceUrl.GET_EMPLOYEE_SUMMARY
  );
};

export const getEmployeeSkills = async () => {
  return getRequest<UserSummaryResponseData>(
    ServiceUrl.GET_EMPLOYEE_SKILLS
  );
};

export const updateEmployeeDetails = async (payload: any) => {
  return postRequest(ServiceUrl.UPDATE_EMPLOYEE, payload);
};

export const udpateEmployeeSkills = async (payload: { skills: string[] }) => {
  return postRequest<{ skills: string[] }, SkillsResponseData>(
    ServiceUrl.UPDATE_EMPLOYEE_SKILLS,
    payload
  );
};

export const addEmployeeEducation = async (payload: UserEducationModel) => {
  return postRequest<UserEducationModel, UserEducationResponseData>(
    ServiceUrl.ADD_EMPLOYEE_EDUCATION,
    payload
  );
};

export const updateEmployeeSummary = async (payload: UserSummaryModel) => {
  return postRequest<UserSummaryModel, any>(
    ServiceUrl.UPDATE_EMPLOYEE_SUMMARY,
    payload
  );
};

export const addEmployeeCertification = async (
  payload: UserCertificationModel
) => {
  return postRequest<UserCertificationModel, CertificationResponseData>(
    ServiceUrl.ADD_EMPLOYEE_CERTIFICATION,
    payload
  );
};

export const updateUserEducation = async () => {
  //  for updating the user education details
};


export const updateProfilePicture = async (payload:FormData)=>{
  return postRequest<FormData,ApiResponse>(ServiceUrl.UPDATE_PROFILE_PICTURE,payload,{},true);
}