import { ServiceUrl } from "../../../utils/constant/Constant";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "../../../server/axios";
import { ApiResponse, ResponseData } from "../../../utils/common_types";
import {
  CertificationResponseData,
  ChangePasswordPayload,
  EmployeeResponseData,
  EmployeeSearchResponseModel,
  GetCollegeListResponseModel,
  GetSkillListResponseModel,
  NotificationPreferences,
  NotificationRequestPayload,
  NotificationResponseModel,
  UploadProfileResponseModel,
  UserCertificationModel,
  UserEducationModel,
  UserEducationResponseData,
  UserSkillsResponseData,
  UserSummaryModel,
  UserSummaryResponseData,
  WorkHistoryModel,
  WorkHistoryResponseModel,
} from "./models";

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

export const udpateEmployeeSkills = async (payload: {
  skills: Array<string>;
  userId: string;
}) => {
  return postRequest<typeof payload, ApiResponse>(
    ServiceUrl.ADD_EDIT_EMPLOYEE_SKILLS,
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
  return postRequest<UserSummaryModel, ApiResponse>(
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

export const removeProfilePicture = async () => {
  return deleteRequest<ApiResponse>(ServiceUrl.REMOVE_PROFILE_PICTURE);
};

export const deleteEmployeeEducation = async (
  educationId: string,
  userId: string = ""
) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_EMPLOYEE_EDUCATION}/${educationId}`,
    {
      data: userId,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const deleteEmployeeCertification = async (
  certificationId: string,
  userId: string = ""
) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_EMPLOYEE_CERTIFICATION}/${certificationId}`,
    {
      data: userId,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// skills

export const getSkillsList = async (skill: string) => {
  return getRequest<GetSkillListResponseModel>(
    `${ServiceUrl.GET_SKILLS_LIST}?query=${encodeURIComponent(skill)}`
  );
};

export const addSkill = async (skill: string) => {
  return postRequest<string, ApiResponse>(ServiceUrl.ADD_SKILL, skill);
};

// notifications
export const getNotifications = async (payload: NotificationRequestPayload) => {
  return getRequest<NotificationResponseModel>(ServiceUrl.GET_NOTIFICATION, {
    params: {
      type: payload.type,
      pageNo: payload.pageNo,
      records: payload.records,
    },
  });
};

export const markNotificationAsRead = async (userNotificationId: string) => {
  return patchRequest<string, ApiResponse>(
    `${ServiceUrl.MARK_NOTIFICATION_AS_READ}/${userNotificationId}/MarkAsRead`
  );
};

export const markAllNotificationAsRead = async () => {
  return postRequest<unknown, ApiResponse>(
    ServiceUrl.MARK_ALL_NOTIFICATION_AS_READ
  );
};

// work history
export const getWorkHistory = async (userId?: string) => {
  if (userId) {
    return getRequest<WorkHistoryResponseModel>(ServiceUrl.GET_WORK_HISTORY, {
      params: { userId },
    });
  }
  return getRequest<WorkHistoryResponseModel>(ServiceUrl.GET_WORK_HISTORY);
};

export const addUpdateWorkHistory = async (payload: WorkHistoryModel) => {
  return postRequest<WorkHistoryModel, ApiResponse>(
    ServiceUrl.ADD_UPDATE_WORK_HISTORY,
    payload
  );
};

export const deleteEmployeeWorkHistory = (workId: string, userId?: string) => {
  return deleteRequest<ApiResponse>(
    `${ServiceUrl.DELETE_WORK_HISTORY}/${workId}`,
    {
      data: userId,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// employee search
export const searchEmployee = (name: string) => {
  return getRequest<EmployeeSearchResponseModel>(ServiceUrl.SEARCH_EMPLOYEE, {
    params: { name },
  });
};

// college name suggestion
export const getCollegeList = (name: string) => {
  return getRequest<GetCollegeListResponseModel>(ServiceUrl.GET_COLLEGE_LIST, {
    params: { searchValue: name },
  });
};

export const changePassword = (payload: ChangePasswordPayload) => {
  return postRequest<ChangePasswordPayload, ApiResponse>(
    ServiceUrl.CHANGE_PASSWORD,
    payload
  );
};

// notification preferences service methods

export const getNotificationPreferences = () => {
  return getRequest<ResponseData<NotificationPreferences>>(
    ServiceUrl.GET_NOTIFICATION_PREFERENCES
  );
};

export const updateNotificationPreferences = (
  payload: NotificationPreferences
) => {
  return postRequest<
    NotificationPreferences,
    ResponseData<NotificationPreferences>
  >(ServiceUrl.UPDATE_NOTIFICATION_PREFERENCES, payload);
};

//  get last employee id

export const getLastAddedEmployeeId = () => {
  return getRequest<ApiResponse>(ServiceUrl.GET_LAST_EMPLOYEE_ID);
};
