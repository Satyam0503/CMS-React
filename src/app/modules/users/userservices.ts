import { ServiceUrl } from "../../../utils/constant/Constant";
import { deleteRequest, getRequest, postRequest } from "../../../server/axios";
import {
  ApiResponse,
  CertificationResponseData,
  EmployeeResponseData,
  UserCertificationModel,
  UserEducationModel,
  UserEducationResponseData,
  UserSkillsResponseData,
  UserSummaryModel,
  UserSummaryResponseData,
} from "../../../utils/common_types";
import { UploadProfileResponseModel } from "./models";

export const getEmployeeById = async (userId?: string) => {
  if (userId) {
    return getRequest<EmployeeResponseData>(ServiceUrl.GET_EMPLOYEE_DETAILS, {
      params: { userId },
    });
  }
  return getRequest<EmployeeResponseData>(ServiceUrl.GET_EMPLOYEE_DETAILS);
};

export const getEmployeeCertifications = async (userId?: string) => {
  if (userId) {
    return getRequest<CertificationResponseData>(
      ServiceUrl.GET_EMPLOYEE_CERTIFICATIONS,
      { params: { userId } }
    );
  }
  return getRequest<CertificationResponseData>(
    ServiceUrl.GET_EMPLOYEE_CERTIFICATIONS
  );
};
export const getEmployeeEducations = async (userId?: string) => {
  if (userId) {
    return getRequest<UserEducationResponseData>(
      ServiceUrl.GET_EMPLOYEE_EDUCATIONS,
      { params: { userId } }
    );
  }
  return getRequest<UserEducationResponseData>(
    ServiceUrl.GET_EMPLOYEE_EDUCATIONS
  );
};

export const getEmployeeSummary = async (userId?: string) => {
  if (userId) {
    return getRequest<UserSummaryResponseData>(
      ServiceUrl.GET_EMPLOYEE_SUMMARY,
      { params: { userId } }
    );
  }
  return getRequest<UserSummaryResponseData>(ServiceUrl.GET_EMPLOYEE_SUMMARY);
};

export const getEmployeeSkills = async (userId?: string) => {
  if (userId) {
    return getRequest<UserSkillsResponseData>(ServiceUrl.GET_EMPLOYEE_SKILLS, {
      params: { userId },
    });
  }
  return getRequest<UserSkillsResponseData>(ServiceUrl.GET_EMPLOYEE_SKILLS);
};

export const updateEmployeeDetails = async (payload: any) => {
  return postRequest(ServiceUrl.UPDATE_EMPLOYEE, payload);
};

export const udpateEmployeeSkills = async (payload: {
  totalSkills: string;
}) => {
  return postRequest<{ totalSkills: string }, ApiResponse>(
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
  return postRequest<UserSummaryModel, UserSummaryResponseData>(
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

export const updateEmployeeCertification = async (
  payload: UserCertificationModel
) => {
  return postRequest<UserCertificationModel, ApiResponse>(
    ServiceUrl.UPDATE_EMPLOYEE_CERTIFICATION,
    payload
  );
};
export const updateEmployeeEducation = async (payload: UserEducationModel) => {
  return postRequest<UserEducationModel, ApiResponse>(
    ServiceUrl.UPDATE_EMPLOYEE_EDUCATION,
    payload
  );
};

export const updateProfilePicture = async (payload: FormData) => {
  return postRequest<FormData, UploadProfileResponseModel>(
    ServiceUrl.UPDATE_PROFILE_PICTURE,
    payload,
    {},
    true
  );
};

export const deleteEmployeeEducation = async (educationId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_EMPLOYEE_EDUCATION}?educationId=${educationId}`
  );
};

export const deleteEmployeeCertification = async (certificationId: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_EMPLOYEE_CERTIFICATION}?certificationId=${certificationId}`
  );
};
