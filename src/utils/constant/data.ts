import { toAbsoluteUrl } from "../../_themes/helpers";
import {
  ApplicantStatus,
  ApplicationStatus,
  CommentAction,
  EMPLOYMENT,
  HOLIDAY_TYPE,
  JOB_TYPE_ENUM,
  LANGUAGE,
  LEAVE_REQUEST_STATUS,
  LEAVE_TYPE,
  NOTICE_TYPE,
  TIME_PERIOD_MAP,
} from "../enums";

const rawBaseUrl =
  import.meta.env.VITE_BASEURL ?? import.meta.env.VITE_BASE_URL ?? "";
export const BaseUrl = rawBaseUrl.trim().replace(/\/+$/, "");
export const ReCAPTCHA_SITE_KEY = import.meta.env.VITE_CAPTCHA_SITE_KEY;
export const APP_FILTER_KEY = "app-filters";
export const AUTH_LOCAL_STORAGE_KEY = "kt-auth-react-v";
export const APP_THEME_MODE = "theme-mode";
export const I18N_CONFIG_KEY =
  import.meta.env.VITE_APP_I18N_CONFIG_KEY || "i18nConfig";
export const DEFAULT_USER_AVATAR = "/media/avatars/default-user-avatar.png";
export const DEFAULT_COMPANY_LOGO = "/media/logos/default_logo.png";

export const ServiceUrl = {
  // account
  REGISTER_COMPANY: `api/account/register`,
  USER_LOGIN: `api/account/login`,
  GET_USER_DETAILS: `api/account/getSignedUserDetails`,
  CREATE_NEW_PASSWORD: `api/CreateNewPassword`,
  RESET_PASSWORD: `api/account/ResetPassword`,
  REFRESH_TOKEN: `api/account/refresh-token`,
  LOGOUT: `api/account/logout`,

  // role
  GET_ALL_ROLES: `api/Roles/GetRoles`,
  GET_ALL_MODULE_PERMISSION: `api/Roles/GetAllRolesWithPermission`,
  GET_ROLE_ALL_PERMISSIONS: `api/Roles/GetRoleWithPermissionById`,
  ADD_EDIT_ROLE: `api/Roles/AddEditRole`,
  GET_ROLE_BY_ID: `api/Roles/GetRoleById`,
  CHANGE_APP_ACCESS: `api/Roles/UpdateAppAccessForRole`,
  UPDATE_MODULE_ACCESS: `api/CompanyMaster/UpdateModuleAccess`,
  GET_ALL_MODULES_INFO: `api/CompanyMaster/GetAllModuleDetails`,

  //user
  CHANGE_PASSWORD: `api/User/ChangePassword`,
  UPDATE_PROFILE_PICTURE: `api/User/UploadUserImage`,
  UPDATE_EMPLOYEE: `api/User/EditEmployees`,
  EDIT_OWN_PROFILE: `api/User/EditOwnProfile`,
  UPDATE_SALARY: `api/Salary/UpdateSalary`,
  GET_COMPANY_SALARIES: `api/Salary/GetCompanySalaries`,
  PROCESS_PAYROLL: `api/AutoPayroll/GeneratePayRollMonthly`,
  PUBLISH_PAYROLL_MONTH: `api/PayRoll/ProcessPayrollMonth`,

  GET_NEXT_EMPLOYEE_ID: "api/User/GetNextEmployeeId",
  GET_EMPLOYEE_ID_SEQUENCE: "api/User/EmployeeIdSequence",
  SKIP_EMPLOYEE_IDS: "api/User/EmployeeIdSequence/Skip",
  START_EMPLOYEE_ID_SEQUENCE: "api/User/EmployeeIdSequence/StartFrom",
  GET_ALL_EMPLOYEE: `api/User/GetAllEmployees`,
  GET_EX_EMPLOYEES: `api/User/GetExEmployees`,
  INITIATE_EMPLOYEE_EXIT: `api/User/InitiateEmployeeExit`,
  COMPLETE_EMPLOYEE_EXIT: `api/User/CompleteEmployeeExit`,
  GET_DIRECTORY_DEPARTMENTS: `api/User/GetDirectoryDepartments`,
  GET_EMPLOYEE_DETAILS: `api/User/GetEmployeeById`,
  GET_EMPLOYEE_CERTIFICATIONS: `api/User/GetEmployeeCertificationDetails`,
  GET_EMPLOYEE_EDUCATIONS: `api/User/GetEmployeeEducationDetails`,
  GET_EMPLOYEE_SUMMARY: `api/User/GetEmployeeSummary`,
  GET_EMPLOYEE_SKILLS: `api/User/GetEmployeeSkills`,

  INVITE_NEW_EMPLOYEE: "api/User/InviteNewEmployee",
  BULK_IMPORT_EMPLOYEES: "api/User/BulkImportEmployees",
  ADD_EMPLOYEE_EDUCATION: `api/User/AddEmployeeEducation`,
  ADD_EMPLOYEE_CERTIFICATION: `api/User/AddEmployeeCertification`,

  UPDATE_EMPLOYEE_SUMMARY: `api/User/AddEditEmployeeSummary`,
  ADD_EDIT_EMPLOYEE_SKILLS: `api/User/AddEditEmpSkills`,
  UPDATE_EMPLOYEE_CERTIFICATION: `api/User/EditEmployeeCertification`,
  UPDATE_EMPLOYEE_EDUCATION: `api/User/EditEmployeeEducation`,

  DELETE_EMPLOYEE_EDUCATION: `api/User/DeleteEducationDetails`,
  DELETE_EMPLOYEE_CERTIFICATION: `api/User/DeleteCertificationDetails`,
  DELETE_EMPLOYEE: `api/User/DeleteEmployee`,

  GET_WORK_HISTORY: `api/User/GetEmpWorkHistory`,
  ADD_UPDATE_WORK_HISTORY: `api/User/AddUpdateWorkHistory`,
  DELETE_WORK_HISTORY: `api/User/DeleteWorkHistory`,

  GET_NOTIFICATION: `api/User/GetAllNotifications`,
  MARK_NOTIFICATION_AS_READ: `api/User/Notification`,
  MARK_ALL_NOTIFICATION_AS_READ: `api/User/MarkAllNotificationAsRead`,
  REMOVE_PROFILE_PICTURE: `api/User/RemoveProfileImage`,
  GET_NOTIFICATION_PREFERENCES: "api/User/GetNotificationPreferences",
  UPDATE_NOTIFICATION_PREFERENCES: "api/User/UpdateNotificationPreferences",

  SEARCH_EMPLOYEE: `api/User/Search`,
  GET_COLLEGE_LIST: `api/User/GetCollegeList`,
  RESEND_INVITE_LINK: `api/User/ResendInvite`,

  // jobs
  ADD_JOB_VACANCY: `api/JobVacancy/AddJobVacancy`,
  EDIT_JOB_VACANCY: `api/JobVacancy/EditJobVacancy`,
  GET_ALL_VACANCIES: `api/JobVacancy/GetAllVacancy`,
  DELETE_VACANCY: `api/JobVacancy/DeleteJobVacancy`,

  // applicant
  GET_ALL_APPLICANTS: `api/Applicants/GetApplicantList`,
  GET_APPLICANT_COMMENTS: `api/Applicants/GetAllComment`,
  GET_APPLICANT_BY_ID: `api/Applicants/ApplicantById`,
  GET_APPLICANT_WORKFLOW: `api/Applicants/Workflow`,
  UPSERT_APPLICATION_STAGE: `api/RecruitmentApplication/UpsertStage`,
  GET_APPLICATION_HISTORY: `api/RecruitmentApplication`,
  ADD_APPLICANT: `api/Applicants/AddApplicant`,
  EDIT_APPLICANT: `api/Applicants/EditApplicant`,
  UPLOAD_RESUME_FOR_APPLICANT: `api/Applicants/UploadResume`,
  GET_INTERVIEW_ROUNDS: "api/Applicants/InterviewRounds",
  UPSERT_INTERVIEW: `api/Applicants/UpsertInterview`,
  RETRY_INTERVIEW_CALENDAR: `api/Applicants/RetryInterviewCalendar`,
  COMPLETE_INTERVIEW_DEBRIEF: `api/RecruitmentPlanning/CompleteInterviewDebrief`,
  GET_INTERVIEW_PLAN: `api/RecruitmentPlanning/InterviewPlan`,
  UPSERT_INTERVIEW_PLAN: `api/RecruitmentPlanning/UpsertInterviewPlan`,
  UPSERT_OFFER: `api/Applicants/UpsertOffer`,
  UPSERT_HIRING_DECISION: `api/RecruitmentHiringDecision/Upsert`,
  APPLY_CANDIDATE_PRIVACY: `api/RecruitmentCandidatePrivacy/Apply`,
  CREATE_OFFER_VERSION: `api/RecruitmentOfferNegotiation/CreateVersion`,
  GET_OFFER_VERSIONS: `api/RecruitmentOfferNegotiation/Versions`,
  GET_OFFER_COUNTERS: `api/RecruitmentOfferNegotiation/Counters`,
  REQUEST_OFFER_COUNTER: `api/RecruitmentOfferNegotiation/RequestCounter`,
  REVIEW_RESUME_EXTRACTION: `api/RecruitmentResumeExtraction/Review`,
  HANDOFF_TO_PREBOARDING: `api/Applicants/HandoffToPreboarding`,
  GET_ONBOARDING_BY_APPLICANT: `api/RecruitmentOnboarding/ByApplicant`,
  GET_ONBOARDING_QUEUE: `api/RecruitmentOnboarding/Queue`,
  UPDATE_ONBOARDING: `api/RecruitmentOnboarding/Update`,
  RETRY_ONBOARDING_ACTIVATION: `api/RecruitmentOnboarding/RetryActivation`,
  UPSERT_REQUISITION: `api/RecruitmentPlanning/UpsertRequisition`,
  UPSERT_SCORECARD: `api/RecruitmentPlanning/UpsertScorecard`,
  UPSERT_SCREENING: `api/RecruitmentPlanning/UpsertScreening`,
  BULK_SCREENING: `api/RecruitmentPlanning/BulkScreening`,
  RECRUITMENT_SCREENING_QUEUE: `api/RecruitmentScreening/Queue`,
  UPSERT_TALENT_POOL: `api/RecruitmentPlanning/UpsertTalentPoolMember`,
  FIND_DUPLICATES: `api/RecruitmentDuplicate/Find`,
  MERGE_APPLICANTS: `api/RecruitmentEnterprise/MergeApplicants`,
  RECRUITMENT_ANALYTICS: `api/RecruitmentEnterprise/Analytics`,
  RECRUITMENT_FEEDBACK_SLA: `api/RecruitmentEnterprise/FeedbackSla`,
  RECRUITMENT_DEBRIEF_PENDING: `api/RecruitmentEnterprise/DebriefPending`,
  RECRUITMENT_SELECTED_CANDIDATES: `api/RecruitmentEnterprise/SelectedCandidates`,
  RECRUITMENT_PENDING_OFFERS: `api/RecruitmentEnterprise/PendingOffers`,
  RECRUITMENT_PREBOARDING_QUEUE: `api/RecruitmentEnterprise/PreboardingQueue`,
  UPDATE_RECRUITMENT_PREBOARDING: `api/RecruitmentEnterprise/UpdatePreboarding`,
  QUEUE_FEEDBACK_REMINDERS: `api/RecruitmentEnterprise/QueueFeedbackReminders`,
  UPSERT_RECRUITMENT_SLA: `api/RecruitmentEnterprise/UpsertSlaPolicy`,
  GET_OFFER_APPROVAL_POLICY: `api/RecruitmentPlanning/OfferApprovalPolicy`,
  UPSERT_OFFER_APPROVAL_POLICY: `api/RecruitmentPlanning/UpsertOfferApprovalPolicy`,
  GET_RECRUITMENT_CONFIG: `api/RecruitmentEnterprise/Config`,
  UPSERT_RECRUITMENT_CONFIG: `api/RecruitmentEnterprise/UpsertConfig`,
  LINK_RECRUITMENT_RELATIONSHIP: `api/RecruitmentEnterprise/LinkRelationship`,
  QUEUE_RECRUITMENT_AUTOMATION: `api/RecruitmentEnterprise/QueueAutomation`,

  ADD_COMMENT: `api/Applicants/AddComment`,
  APPLY_JOB: `api/applicant/applyJob`,

  // process log
  GET_PROCESS_LOG: `api/Applicants/GetProcessLogData`,
  EXPORT_RECRUITMENT_AUDIT: `api/RecruitmentAudit/Export`,
  GRANT_RECRUITMENT_CANDIDATE_SHARE: `api/RecruitmentCandidateShare/Grant`,
  REVOKE_RECRUITMENT_CANDIDATE_SHARE: `api/RecruitmentCandidateShare/Revoke`,
  GET_RECRUITMENT_CANDIDATE_SHARES: `api/RecruitmentCandidateShare/ByApplicant`,

  // departments
  GET_DEPARTMENTLIST: `api/CompanyMaster/GetDepartmentList`,
  UPDATE_DEPARTMENT: `api/CompanyMaster/UpdateDepartment`,
  DELETE_DEPARTMENT: `api/CompanyMaster/DeleteDepartment`,

  // Job Titles
  ADD_UPDATE_JOB_TITLE: `api/CompanyMaster/AddUpdateJobTitle`,
  GET_JOB_TITLE: `api/CompanyMaster/GetJobTitles`,
  DELETE_JOB_TITLE: `api/CompanyMaster/DeleteJobTitle`,

  // skills
  GET_SKILLS_LIST: `api/User/GetSuggestedSkills`,
  ADD_SKILL: `api/User/AddSkill`,
  // company
  GET_COMPANY_DETAILS: `api/Company/GetCompanyDetails`,
  UPDATE_COMPANY_DETAILS: `api/Company/UpdateCompanyDetails`,

  // dashboard
  GET_ALL_GENDERS: `api/Dashboard/GetAllGenderDetails`,
  GET_ALL_DEPARTMENT: `api/Dashboard/GetAllDepartmentDetails`,
  GET_APPLICATION_DATA: `api/Dashboard/GetApplicationStatusData`,
  GET_UPCOMING_HOLIDAY_AND_EVENT: "api/Dashboard/GetUpComingHolidayAndEvents",
  GET_UPCOMING_CELEBRATIONS: "api/Dashboard/GetUpComingCelebrations",

  // notice
  GET_ALL_NOTICES: `api/NoticeBoard/GetAllNotice`,
  GET_MY_NOTICES: `api/NoticeBoard/GetMyNotices`,
  POST_NOTICE: `api/NoticeBoard/PostNotice`,
  UPDATE_NOTICE: `api/NoticeBoard/UpdateMyNotice`,

  // holiday
  GET_ALL_HOLIDAYS: `api/Holiday/GetAllHoliday`,
  CREATE_UPDATE_HOLIDAYS: `api/Holiday/CreateHoliday`,
  DELETE_HOLIDAYS: `api/Holiday/DeleteHoliday`,
  DELETE_NOTICE: `api/NoticeBoard/DeleteNotice`,
  GET_NOTICE_BY_ID: `api/NoticeBoard/GetNoticeById`,

  //Calendar
  GET_ALL_CALENDAR_ITEMS: `api/Calendar/GetAllCalendarItems`,
  ADD_AND_UPDATE_CALENDAR_ITEMS: `api/Calendar/AddUpdateCalendarItem`,
  IMPORT_CALENDAR_ITEMS: `api/Calendar/ImportCalendarItems`,
  DELETE_CALENDAR_ITEM: `api/Calendar/DeleteCalendarItem`,
  GET_HOLIDAYS: "api/Calendar/GetHolidays",

  //Attendance
  GET_ALL_ATTENDANCE: `/api/admin/attendance/GetAllAttendanceItems`,
  CREATE_AND_UPDATE_ATTENDANCE: `/api/admin/attendance`,
  DELETE_ATTENDANCE: `api/admin/attendance/DeleteAttendance`,


  // leave management
  CREATE_UPDATE_LEAVE_TYPE: `api/LeaveManagement/CreateUpdateLeaveType`,
  GET_LEAVE_TYPES: `api/LeaveManagement/GetLeaveType`,
  GET_LEAVE_BALANCE: `api/LeaveManagement/GetLeaveBalance`,
  CREATE_UPDATE_LEAVE_BALANCE: `api/LeaveManagement/CreateUpdateLeaveBalance`,
  UPDATE_EMPLOYEE_LEAVE_BALANCE:
    "api/LeaveManagement/UpdateEmployeeLeaveBalance",
  GET_LEAVE_POLICIES: "api/LeaveManagement/GetAllLeavePolicies",
  GET_ALL_EMPLOYEE_LEAVE_BALANCE:
    "api/LeaveManagement/GetAllEmployeeLeaveBalances",

  CREATE_NEW_LEAVE_POLICY: `api/LeaveManagement/CreateLeavePolicy`,
  UPDATE_LEAVE_POLICY: `api/LeaveManagement/UpdateLeavePolicy`,
  DELETE_LEAVE_POLICY: `api/LeaveManagement/DeleteLeavePolicy`,

  CREATE_LEAVE_REQUEST: `api/LeaveManagement/CreateLeaveRequest`,
  CREATE_EMPLOYEE_LEAVE_REQUEST: `api/LeaveManagement/CreateEmployeeLeaveRequest`,
  UPDATE_LEAVE_REQUEST: `api/LeaveManagement/UpdateLeaveRequest`,
  GET_LEAVE_REQUESTS: `api/LeaveManagement/GetLeaveRequests`,
  DELETE_LEAVE_REQUEST: `api/LeaveManagement/DeleteLeaveRequest`,
  GET_EMP_LEAVE_BALANCE: `api/LeaveManagement/GetEmployeeLeaveBalance`,
  UPDATE_LEAVE_REQUEST_STATUS: `api/LeaveManagement/LeaveRequest`,
  GET_MY_LEAVE_REQUEST: `api/LeaveManagement/GetMyLeaveRequests`,
  GET_LEAVE_REQUEST_SUMMARY: "api/LeaveManagement/GetLeaveRequestSummary",
  GET_MONTHLY_LEAVE_TAKEN_SUMMARY:
    "api/LeaveManagement/GetMonthlyTakenLeaveSummary",

  // custom attributes
  CREATE_NEW_CUSTOM_ATTRIBUTE: `api/CompanyMaster/CreateCustomAttribute`,
  GET_COMPANY_CUSTOM_ATTRIBUTE: `api/CompanyMaster/GetAllCustomAttribute`,
  GET_CUSTOM_ATTRIBUTE_BY_ID: `api/CompanyMaster/GetCustomAttributeById`,
  UPDATE_CUSTOM_ATTRIBUTE: `api/CompanyMaster/UpdateCustomAttribute`,
  DELETE_CUSTOM_ATTRIBUTE: `api/CompanyMaster/DeleteCustomAttribute`,
  DELETE_CUSTOM_ATTRIBUTE_VALUE: `api/CompanyMaster/DeleteCustomAttributeValue`,

  // payroll
  UPLOAD_PAYROLL: `api/PayRoll/UploadPayloadData`,
  GENERATE_PAY_SLIP: `api/PayRoll/GeneratePaySlip`,
  GENERATE_EMPLOYEE_PAY_SLIP: `api/PayRoll/GenerateEmployeePaySlip`,
  GET_PAYROLL_DATA: `api/PayRoll/GetEmpPayRollData`,
  ADD_UPDATE_EMP_PAYROLL: `api/PayRoll/AddUpdatePayRoll`,

  // signalR endpoints

  NOTIFICATION_HUB: "/notificationhub",
  CHAT_HUB: "/chathub",

  // policies
  GET_POLICIES: "api/company/GetAllPolicies",
  ADD_POLICY: "api/Company/AddPolicy",
  EDIT_POLICY: "api/Company/UpdatePolicy",
  CREATE_POLICY_VERSION: "api/Company/CreatePolicyVersion",
  EDIT_POLICY_VERSION: "api/Company/EditPolicyVersion",
  SET_CURRENT_POLICY_VERSION: "api/Company/SetCurrentPolicyVersion",
  GET_ALL_POLICY_VERSION: "api/Company/GetAllPolicyVersion",
  DELETE_POLICY: "api/Company/DeletePolicy",
  DELETE_POLICY_VERSION: "api/Company/DeletePolicyVersion",
  GET_POLICY_DOCUMENT: "api/Company/GetPolicyDocument",
} as const;

export const languages = [
  {
    id: 1,
    lang: LANGUAGE.ENGLISH,
    name: "LANGUAGES.ENGLISH",
    flag: toAbsoluteUrl("media/flags/united-states.svg"),
  },
  {
    id: 2,
    lang: LANGUAGE.MANDARIN,
    name: "LANGUAGES.MANDARIN",
    flag: toAbsoluteUrl("media/flags/china.svg"),
  },
  {
    id: 3,
    lang: LANGUAGE.SPANISH,
    name: "LANGUAGES.SPANISH",
    flag: toAbsoluteUrl("media/flags/spain.svg"),
  },
  {
    id: 4,
    lang: LANGUAGE.JAPANESE,
    name: "LANGUAGES.JAPANESE",
    flag: toAbsoluteUrl("media/flags/japan.svg"),
  },
  {
    id: 5,
    lang: LANGUAGE.GERMAN,
    name: "LANGUAGES.GERMAN",
    flag: toAbsoluteUrl("media/flags/germany.svg"),
  },
  {
    id: 6,
    lang: LANGUAGE.FRENCH,
    name: "LANGUAGES.FRENCH",
    flag: toAbsoluteUrl("media/flags/france.svg"),
  },
];

export const Regex = {
  Name: /^[A-Za-z]+(?:[-'][A-Za-z]+)*(?: [A-Za-z]+(?:[-'][A-Za-z]+)*)*$/,
  Email: /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  Phone: /^[6-9]\d{9}$/,
  Password: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
  PanCard: /[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  BankAccountNo: /^[0-9]{9,18}$/,
};

export const Gender = [
  {
    id: 1,
    label: "GENDER.MALE",
    value: "male",
  },
  {
    id: 2,
    label: "GENDER.FEMALE",
    value: "female",
  },
  {
    id: 3,
    label: "GENDER.OTHER",
    value: "other",
  },
];

export const EmploymentType = [
  {
    id: 1,
    label: "EMPLOYEE.TYPE.FULLTIME",
    value: EMPLOYMENT.FULLTIME,
  },
  {
    id: 2,
    label: "EMPLOYEE.TYPE.PARTTIME",
    value: EMPLOYMENT.PARTTIME,
  },
  {
    id: 3,
    label: "EMPLOYEE.TYPE.CONTRACTUAL",
    value: EMPLOYMENT.CONTRACTUAL,
  },
  {
    id: 4,
    label: "EMPLOYEE.TYPE.INTERNSHIP",
    value: EMPLOYMENT.INTERNSHIP,
  },
  {
    id: 5,
    label: "EMPLOYEE.TYPE.APPRENTICESHIP",
    value: EMPLOYMENT.APPRENTICESHIP,
  },
];

export const NoticeTypes = [
  {
    id: 1,
    label: "NOTICE.TYPES.GENERAL",
    value: NOTICE_TYPE.GENERAL,
  },
  {
    id: 2,
    label: "NOTICE.TYPES.IMPORTANT",
    value: NOTICE_TYPE.IMPORTANT,
  },
  {
    id: 3,
    label: "NOTICE.TYPES.URGENT",
    value: NOTICE_TYPE.URGENT,
  },
];

export const EducationType = [
  {
    id: 1,
    label: "Graduation",
    value: "Graduation",
  },
  {
    id: 2,
    label: "Post Graduation",
    value: "Post Graduation",
  },
  {
    id: 3,
    label: "Diploma",
    value: "Diploma",
  },
];

export const HolidayTypes = [
  { id: 1, label: "HOLIDAY.TYPES.CULTURAL", value: HOLIDAY_TYPE.CULTURAL },
  { id: 2, label: "HOLIDAY.TYPES.HEALTH", value: HOLIDAY_TYPE.HEALTH },
  { id: 3, label: "HOLIDAY.TYPES.RELIGIOUS", value: HOLIDAY_TYPE.RELIGIOUS },
  { id: 4, label: "HOLIDAY.TYPES.NATIONAL", value: HOLIDAY_TYPE.NATIONAL },
];

export const bloodGroups = [
  { id: 1, label: "A+", value: "A+" },
  { id: 2, label: "A-", value: "A-" },
  { id: 3, label: "B+", value: "B+" },
  { id: 4, label: "B-", value: "B-" },
  { id: 5, label: "AB+", value: "AB+" },
  { id: 6, label: "AB-", value: "AB-" },
  { id: 7, label: "O+", value: "O+" },
  { id: 8, label: "O-", value: "O-" },
];
export const Days = [
  {
    id: 1,
    label: "Today",
    value: "today",
  },
  {
    id: 2,
    label: "This week",
    value: "thisWeek",
  },
  {
    id: 3,
    label: "This month",
    value: "thisMonth",
  },
  {
    id: 4,
    label: "This year",
    value: "thisYear",
  },
];

export const JobType = [
  {
    id: 1,
    label: "JOBTYPE.ONSITE",
    value: JOB_TYPE_ENUM.ONSITE,
  },
  {
    id: 2,
    label: "JOBTYPE.HYBRID",
    value: JOB_TYPE_ENUM.HYBRID,
  },
  {
    id: 3,
    label: "JOBTYPE.REMOTE",
    value: JOB_TYPE_ENUM.REMOTE,
  },
];

export const ApplicationEvaluationStatus = [
  {
    id: 1,
    label: "APPLICATION.STATUS.INPROGRESS",
    value: ApplicationStatus.InProgress,
  },
  {
    id: 2,
    label: "APPLICATION.STATUS.ONHOLD",
    value: ApplicationStatus.OnHold,
  },
  {
    id: 3,
    label: "APPLICATION.STATUS.SHORTLISTED",
    value: ApplicationStatus.Shortlisted,
  },
  {
    id: 4,
    label: "APPLICATION.STATUS.SELECTED",
    value: ApplicationStatus.Selected,
  },
  {
    id: 5,
    label: "APPLICATION.STATUS.REJECTED",
    value: ApplicationStatus.Rejected,
  },
];

export const ApplicantApplicationStatus = [
  { id: 0, label: "APPLICATION.STATUS.NEW", value: ApplicationStatus.New },
  {
    id: 1,
    label: "APPLICATION.STATUS.INPROGRESS",
    value: ApplicationStatus.InProgress,
  },
  {
    id: 2,
    label: "APPLICATION.STATUS.ONHOLD",
    value: ApplicationStatus.OnHold,
  },
  {
    id: 3,
    label: "APPLICATION.STATUS.SHORTLISTED",
    value: ApplicationStatus.Shortlisted,
  },
  {
    id: 4,
    label: "APPLICATION.STATUS.SELECTED",
    value: ApplicationStatus.Selected,
  },
  {
    id: 5,
    label: "APPLICATION.STATUS.REJECTED",
    value: ApplicationStatus.Rejected,
  },
];

export const CommentActionCategory = [
  { id: 0, label: "COMMENT.ACTION.PROCESS", value: CommentAction.Process },
  {
    id: 1,
    label: "COMMENT.ACTION.INPROGRESS",
    value: CommentAction.InProgress,
  },
  { id: 2, label: "COMMENT.ACTION.ONHOLD", value: CommentAction.OnHold },
  {
    id: 3,
    label: "COMMENT.ACTION.SHORTLISTED",
    value: CommentAction.Shortlisted,
  },
  { id: 4, label: "COMMENT.ACTION.SELECTION", value: CommentAction.Selection },
  { id: 5, label: "COMMENT.ACTION.REJECTION", value: CommentAction.Rejection },
  { id: 6, label: "COMMENT.ACTION.EDIT", value: CommentAction.Edit },
];

export const ApplicantStatusConstant = [
  {
    id: 1,
    label: "APPLICANT.STATUS.INACTIVE",
    value: ApplicantStatus.InActive,
  },
  { id: 2, label: "APPLICANT.STATUS.ACTIVE", value: ApplicantStatus.Active },
];

export const LeaveRequestStatusTypes = [
  {
    id: 1,
    label: "LEAVE_REQUEST_STATUS.PENDING",
    value: LEAVE_REQUEST_STATUS.PENDING,
  },
  {
    id: 2,
    label: "LEAVE_REQUEST_STATUS.APPROVED",
    value: LEAVE_REQUEST_STATUS.APPROVED,
  },
  {
    id: 3,
    label: "LEAVE_REQUEST_STATUS.REJECTED",
    value: LEAVE_REQUEST_STATUS.REJECTED,
  },
  {
    id: 4,
    label: "LEAVE_REQUEST_STATUS.WITHDRAWN",
    value: LEAVE_REQUEST_STATUS.WITHDRAWN,
  },
];

export const LeaveTypeConstant = [
  {
    id: 1,
    label: "LEAVE.TYPES.SICK_LEAVE",
    value: LEAVE_TYPE.SICK_LEAVE,
  },
  {
    id: 2,
    label: "LEAVE.TYPES.CASUAL_LEAVE",
    value: LEAVE_TYPE.CASUAL_LEAVE,
  },
  {
    id: 3,
    label: "LEAVE.TYPES.EARNED_LEAVE",
    value: LEAVE_TYPE.EARNED_LEAVE,
  },
  {
    id: 4,
    label: "LEAVE.TYPES.MATERNITY_LEAVE",
    value: LEAVE_TYPE.MATERNITY_LEAVE,
  },
  {
    id: 5,
    label: "LEAVE.TYPES.PATERNITY_LEAVE",
    value: LEAVE_TYPE.PATERNITY_LEAVE,
  },
];

export const indianStates = [
  { id: 1, label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { id: 2, label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { id: 3, label: "Assam", value: "Assam" },
  { id: 4, label: "Bihar", value: "Bihar" },
  { id: 5, label: "Chhattisgarh", value: "Chhattisgarh" },
  { id: 6, label: "Goa", value: "Goa" },
  { id: 7, label: "Gujarat", value: "Gujarat" },
  { id: 8, label: "Haryana", value: "Haryana" },
  { id: 9, label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { id: 10, label: "Jharkhand", value: "Jharkhand" },
  { id: 11, label: "Karnataka", value: "Karnataka" },
  { id: 12, label: "Kerala", value: "Kerala" },
  { id: 13, label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { id: 14, label: "Maharashtra", value: "Maharashtra" },
  { id: 15, label: "Manipur", value: "Manipur" },
  { id: 16, label: "Meghalaya", value: "Meghalaya" },
  { id: 17, label: "Mizoram", value: "Mizoram" },
  { id: 18, label: "Nagaland", value: "Nagaland" },
  { id: 19, label: "Odisha", value: "Odisha" },
  { id: 20, label: "Punjab", value: "Punjab" },
  { id: 21, label: "Rajasthan", value: "Rajasthan" },
  { id: 22, label: "Sikkim", value: "Sikkim" },
  { id: 23, label: "Tamil Nadu", value: "Tamil Nadu" },
  { id: 24, label: "Telangana", value: "Telangana" },
  { id: 25, label: "Tripura", value: "Tripura" },
  { id: 26, label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { id: 27, label: "Uttarakhand", value: "Uttarakhand" },
  { id: 28, label: "West Bengal", value: "West Bengal" },
];

export const experienceCategoryList = [
  { id: 1, label: "0 - 1", value: 1 },
  { id: 2, label: "1 - 2", value: 2 },
  { id: 3, label: "2 - 3", value: 3 },
  { id: 4, label: "3 - 4", value: 4 },
  { id: 5, label: "4 - 5", value: 5 },
  { id: 6, label: "5 - 6", value: 6 },
  { id: 7, label: "6 - 7", value: 7 },
  { id: 8, label: "7 - 8", value: 8 },
  { id: 9, label: "8 - 9", value: 9 },
  { id: 10, label: "9 - 10", value: 10 },
  { id: 11, label: "10 - 11", value: 11 },
  { id: 12, label: "11 - 12", value: 12 },
  { id: 13, label: "12 - 13", value: 13 },
  { id: 14, label: "13 - 14", value: 14 },
  { id: 15, label: "14 - 15", value: 15 },
];

export const monthsExperienceList = [
  { id: 1, label: "0", value: 0 },
  { id: 2, label: "1", value: 1 },
  { id: 3, label: "2", value: 2 },
  { id: 4, label: "3", value: 3 },
  { id: 5, label: "4", value: 4 },
  { id: 6, label: "5", value: 5 },
  { id: 7, label: "6", value: 6 },
  { id: 8, label: "7", value: 7 },
  { id: 9, label: "8", value: 8 },
  { id: 10, label: "9", value: 9 },
  { id: 11, label: "10", value: 10 },
  { id: 12, label: "11", value: 11 },
  { id: 13, label: "12", value: 12 },
];

export const TimePeriodOptions = [
  { id: TIME_PERIOD_MAP.LAST_WEEK, value: 7, name: "DATETIME.LAST_WEEK" },
  {
    id: TIME_PERIOD_MAP.LAST_TWO_WEEK,
    value: 14,
    name: "DATETIME.LAST_TWO_WEEK",
  },
  { id: TIME_PERIOD_MAP.LAST_MONTH, value: 30, name: "DATETIME.LAST_MONTH" },
  {
    id: TIME_PERIOD_MAP.LAST_THREE_MONTHS,
    value: 90,
    name: "DATETIME.LAST_THREE_MONTHS",
  },
  {
    id: TIME_PERIOD_MAP.LAST_SIX_MONTHS,
    value: 180,
    name: "DATETIME.LAST_SIX_MONTHS",
  },
  {
    id: TIME_PERIOD_MAP.LAST_12_MONTHS,
    value: 365,
    name: "DATETIME.LAST_12_MONTHS",
  },
];

export const modules_description = [
  { name: "Employees", description: "EMPLOYEES_DESCRIPTION" },
  { name: "Calendar", description: "CALENDAR_DESCRIPTION" },
  { name: "Applications", description: "APPLICATIONS_DESCRIPTION" },
  { name: "Policy", description: "POLICY_DESCRIPTION" },

  { name: "Attendance", description: "ATTENDANCE_DESCRIPTION" },
  { name: "Notice_Board", description: "NOTICE_BOARD_DESCRIPTION" },
  { name: "Process_Log", description: "PROCESS_LOG_DESCRIPTION" },

  { name: "Leave_Management", description: "LEAVE_MANAGEMENT_DESCRIPTION" },
  { name: "Jobs", description: "JOBS_DESCRIPTION" },
  { name: "PayRoll", description: "PAYROLL_DESCRIPTION" },
];
































