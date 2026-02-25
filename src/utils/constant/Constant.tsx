import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { ColumnListTypes, SideBarTabListProps } from "../common_types";
import {
  dateFormatter,
  applicantStatusDecoder,
  sanitizeHtmlContent,
  commentActionMapper,
  noticeTypeDecoder,
  relativeTimeFormatter,
  JobTypeMapper,
  jobStatusMapper,
} from "../common";
import { Link } from "react-router-dom";
import {
  ApplicantStatus,
  ApplicationStatus,
  CommentAction,
  JOB_TYPE_ENUM,
  HOLIDAY_TYPE,
  LANGUAGE,
  LEAVE_REQUEST_STATUS,
  LEAVE_TYPE,
  Modules,
  ModulesName,
  ModulesTitles,
  NOTICE_TYPE,
  TIME_PERIOD_MAP,
  EMPLOYMENT,
} from "../enums";

import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  AccessTime,
  AdminPanelSettings,
  Book,
  CalendarMonth,
  Check,
  Close,
  Contacts,
  CurrencyRupee,
  Info,
  Mail,
  NoteAlt,
  PermContactCalendar,
  Person,
  PersonSearch,
  Settings,
  ToggleOn,
  Work,
} from "@mui/icons-material";
import PolicyIcon from "@mui/icons-material/Policy";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Applicant, JobModal } from "../../app/modules/recruitment/models";
import { ActionComponent } from "../../app/shared/components/ActionComponent";
import { StyleStatus } from "../../app/shared/components/StyledStatus";
import { AvatarCell } from "../../app/shared/components/AvatarCell";
import { RoleModel } from "../../app/modules/admin/models";
import { FormattedMessage } from "react-intl";
import { toAbsoluteUrl } from "../../_themes/helpers";
import clsx from "clsx";
import {
  NoticeModel,
  NoticeResponseModel,
  ViewModel,
} from "../../app/modules/noticeboard/models";
import {
  LeaveBalance,
  LeaveBalanceType,
  LeaveType,
} from "../../app/modules/leaves/model";
export const BaseUrl = import.meta.env.VITE_BASEURL;
export const ReCAPTCHA_SITE_KEY = import.meta.env.VITE_CAPTCHA_SITE_KEY;
export const APP_FILTER_KEY = "app-filters";
export const AUTH_LOCAL_STORAGE_KEY = "kt-auth-react-v";
export const APP_THEME_MODE = "theme-mode";
export const I18N_CONFIG_KEY =
  import.meta.env.VITE_APP_I18N_CONFIG_KEY || "i18nConfig";
export const DEFAULT_USER_AVATAR = "/media/avatars/default-emp-imag.jpg";
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
  UPDATE_SALARY: `api/Salary/UpdateSalary`,

  GET_LAST_EMPLOYEE_ID: "api/User/GetLastEmployeeId",
  GET_ALL_EMPLOYEE: `api/User/GetAllEmployees`,
  GET_EMPLOYEE_DETAILS: `api/User/GetEmployeeById`,
  GET_EMPLOYEE_CERTIFICATIONS: `api/User/GetEmployeeCertificationDetails`,
  GET_EMPLOYEE_EDUCATIONS: `api/User/GetEmployeeEducationDetails`,
  GET_EMPLOYEE_SUMMARY: `api/User/GetEmployeeSummary`,
  GET_EMPLOYEE_SKILLS: `api/User/GetEmployeeSkills`,

  INVITE_NEW_EMPLOYEE: "api/User/InviteNewEmployee",
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
  ADD_APPLICANT: `api/Applicants/AddApplicant`,
  EDIT_APPLICANT: `api/Applicants/EditApplicant`,
  UPLOAD_RESUME: `api/Applicants/UploadResume`,

  ADD_COMMENT: `api/Applicants/AddComment`,
  APPLY_JOB: `api/applicant/applyJob`,

  // process log
  GET_PROCESS_LOG: `api/Applicants/GetProcessLogData`,

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
  DELETE_CALENDAR_ITEM: `api/Calendar/DeleteCalendarItem`,
  GET_HOLIDAYS: "api/Calendar/GetHolidays",

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

  CREATE_LEAVE_REQUEST: `api/LeaveManagement/CreateLeaveRequest`,
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
  DELETE_CUSTOM_ATTRIBUTE_VALUE: `api/CompanyMaster/DeleteCustomAttributeValue`,

  // payroll
  UPLOAD_PAYROLL: `api/PayRoll/UploadPayloadData`,
  GENERATE_PAY_SLIP: `api/PayRoll/GeneratePaySlip`,
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

export const NoticeBoardTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "userName",
    label: "NOTICE.POSTED_BY",
    minWidth: 200,
    avatarCell: (notice: NoticeResponseModel) => {
      return (
        <AvatarCell
          avatarSrc={notice.userProfile}
          title={notice.userName}
          subTitle={notice.userDesignation}
        />
      );
    },
  },
  {
    id: "createdDateTime",
    label: "NOTICE.POSTED_DATETIME",
    minWidth: 150,
    format: (value: string) => relativeTimeFormatter(value),
  },

  {
    id: "noticeType",
    label: "NOTICE.TYPE",
    build: (noticeType: number) => {
      const type = noticeTypeDecoder[noticeType];
      return (
        <StyleStatus
          label={type}
          className={clsx({
            success: noticeType === NOTICE_TYPE.GENERAL,
            warning: noticeType === NOTICE_TYPE.IMPORTANT,
            danger: noticeType === NOTICE_TYPE.URGENT,
          })}
        />
      );
    },
  },
  {
    id: "noticeTitle",
    label: "NOTICE.MESSAGE",
    build: (notice: NoticeResponseModel) => {
      return (
        <Box
          component="span"
          sx={{
            textOverflow: "ellipsis",
            maxWidth: 250,
            overflow: "hidden",
            whiteSpace: "nowrap",
            display: "inline-block",
            margin: 0,
            fontSize: 14,
            color: notice.viewedStatus ? "text.secondary" : "text.primary",
          }}
        >
          {notice.noticeTitle}
        </Box>
      );
    },
  },
];

export const MyNoticeTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "createdDate",
    label: "NOTICE.POSTED_DATETIME",
    minWidth: 150,
    format: (value: string) => relativeTimeFormatter(value),
  },

  {
    id: "noticeType",
    label: "NOTICE.TYPE",
    build: (noticeType: number) => {
      const type = noticeTypeDecoder[noticeType];
      return (
        <StyleStatus
          label={type}
          className={clsx({
            success: noticeType === NOTICE_TYPE.GENERAL,
            warning: noticeType === NOTICE_TYPE.IMPORTANT,
            danger: noticeType === NOTICE_TYPE.URGENT,
          })}
        />
      );
    },
  },
  {
    id: "title",
    label: "NOTICE.MESSAGE",
    build: (message: string) => {
      return (
        <Stack direction="row">
          <Box
            component="span"
            sx={{
              textOverflow: "ellipsis",
              maxWidth: 200,
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: "inline-block",
              margin: 0,
            }}
          >
            {message}
          </Box>
        </Stack>
      );
    },
  },
  {
    id: "views",
    label: "NOTICE.VIEWS",
    build: (views: ViewModel) => {
      return views.length === 0 ? (
        "_"
      ) : (
        <AvatarGroup
          spacing={20}
          className="justify-content-end"
          total={views.length}
          slotProps={{
            additionalAvatar: {
              sx: {
                width: 32,
                height: 32,
                left: 10,
              },
            },
          }}
          renderSurplus={(surplus) => <span>+{surplus.toString()[0]}</span>}
        >
          {views.slice(0, 8).map((view) => (
            <Tooltip key={view.employeeId} title={view.employeeName}>
              <Avatar
                alt={view.employeeName}
                src={view.profileUrl ?? DEFAULT_USER_AVATAR}
                sx={{ width: 32, height: 32 }}
              />
            </Tooltip>
          ))}
        </AvatarGroup>
      );
    },
  },
  {
    id: "action",
    label: "ACTION",
    build: (
      row: NoticeModel,
      handleNoticeEdit: (row: NoticeModel) => void,
      openConfirmationModal: (row: NoticeModel) => void,
    ) => (
      <ActionComponent
        row={row}
        openConfirmationModal={openConfirmationModal}
      />
    ),
  },
];
export const ProcessLogTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "applicantName",
    label: "APPLICANT.NAME",
    minWidth: 150,
  },
  {
    id: "jobRole",
    label: "FORM.JOB_ROLE",
    minWidth: 150,
  },
  {
    id: "createdDate",
    label: "COMMENT.COMMENT_ON",
    format: (value: string) => dateFormatter(value, "DD MMM YYYY hh:mm A"),
    minWidth: 150,
    sorting: true,
  },
  {
    id: "userName",
    label: "COMMENT.COMMENT_BY",
    minWidth: 150,
  },
  {
    id: "activityCategory",
    label: "COMMENT.ACTION_CATEGORY",
    minWidth: 150,
    format: (value: number) => (
      <FormattedMessage id={commentActionMapper[value]} />
    ),
  },
  {
    id: "description",
    label: "COMMENT.COMMENT",
    minWidth: 200,
    build: (value: string) => (
      <Tooltip
        title={
          <Typography
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(value) }}
            sx={{
              fontSize: "12px",
              "& p": {
                margin: 0,
                color: "#FFFFFF",
              },
            }}
          />
        }
        arrow
        placement="top"
      >
        <Typography
          variant="body1"
          style={{
            width: "200px",
            overflow: "hidden",
            textWrap: "nowrap",
            textOverflow: "ellipsis",
            fontSize: "12px",
          }}
          dangerouslySetInnerHTML={{ __html: value }}
          sx={{
            "& p": {
              margin: 0,
            },
          }}
        />
      </Tooltip>
    ),
  },
];

export const AttendanceMangementTableColumnList: ColumnListTypes[] = [
  {
    id: "name",
    label: "Name",
  },
  {
    id: "first_in",
    label: "First_In",
  },

  {
    id: "break",
    label: "Break",
  },

  {
    id: "Last_Out",
    label: "Last_Out",
  },
  {
    id: "total_hours",
    label: "Total_Hours",
  },
  {
    id: "shift",
    label: "Shift",
  },
  {
    id: "status",
    label: "STATUS",
  },

  {
    id: "action",
    label: "ACTION",
    build: (row: Applicant) => <ActionComponent row={row} />,
  },
];

export const ApplicationTabTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },

  {
    id: "fullName",
    label: "FORM.FULL_NAME",
    minWidth: 150,
  },
  {
    id: "vacancyName",
    label: "JOB.JOB_TITLE",
    minWidth: 150,
  },
  {
    id: "status",
    label: "STATUS",
    build: (status: number) => {
      const values = applicantStatusDecoder[status];
      return (
        <StyleStatus
          label={values}
          className={clsx({
            success: status === ApplicantStatus.Active,
            danger: status === ApplicantStatus.InActive,
          })}
        />
      );
    },
  },
  {
    id: "experience",
    label: "FORM.EXPERIENCE",
    align: "center",
    sorting: true,
    format: (value: number) => {
      const experience = (value / 12).toFixed(1);
      return (
        <FormattedMessage id={"PLURAL.YEAR"} values={{ years: experience }} />
      );
    },
  },
  {
    id: "applyDate",
    label: "APPLICATION.APPLIED_DATE",
    minWidth: 180,
    sorting: true,
    format: (value: string) => dateFormatter(value, "DD MMM YYYY hh:mm A"),
  },
  {
    id: "action",
    label: "APPLICATION.CV",
    build: (
      row: Applicant,
      handleApplicationEdit: (row: Applicant) => void,
      openConfirmationModal: (row: Applicant) => void,
      openViewApplication: (row: Applicant) => void,
    ) => <ActionComponent row={row} openViewModal={openViewApplication} />,
  },
];

export const RoleTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "titles",
    label: "ROLE.NAME",
    minWidth: 200,
  },
  {
    id: "description",
    label: "ROLE.DESCRIPTION",
    minWidth: 200,
  },
  {
    id: "hasAppAccess",
    label: "ROLE.HAS_APP_ACCESS",
    minWidth: 180,
    format: (hasAccess: boolean) => (
      <StyleStatus
        label={hasAccess ? "ROLE.HAS_ACCESS" : "ROLE.NO_ACCESS"}
        className={clsx({ success: hasAccess, danger: !hasAccess })}
      />
    ),
  },
  {
    id: "action",
    label: "ACTION",
    minWidth: 180,
    build: (row: RoleModel) => (
      <Link to={`/admin/roles/edit/${row.rolesId}`}>
        <Button variant="contained">
          <FormattedMessage
            id={
              row.isNotEditable
                ? "ROLE.VIEW_PERMISSION"
                : "ROLE.EDIT_PERMISSION"
            }
          />
        </Button>
      </Link>
    ),
  },
];

export const JobRequirementTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 30,
  },

  {
    id: "title",
    label: "JOB.JOB_TITLE",
  },
  {
    id: "vacancies",
    label: "JOB.NO_OF_VACANCIES",
    align: "center",
    sorting: true,
  },
  {
    id: "jobType",
    label: "JOB.TYPE",
    format: (jobType: number) => (
      <FormattedMessage id={JobTypeMapper[jobType]} />
    ),
  },
  {
    id: "status",
    label: "STATUS",
    build: (status: boolean) => {
      return (
        <StyleStatus
          label={jobStatusMapper[Number(status)]}
          className={clsx({ success: status, danger: !status })}
        />
      );
    },
  },
  {
    id: "action",
    label: "ACTION",
    build: (
      row: JobModal,
      handleJobEdit: (row: JobModal) => void,
      openDeleteModal: (row: JobModal) => void,
      openViewJobDetail: (row: JobModal) => void,
    ) => <ActionComponent row={row} openViewModal={openViewJobDetail} />,
  },
];

export const CommentTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "userName",
    label: "COMMENT.ACTION_BY",
    minWidth: 150,
  },
  {
    id: "createdDate",
    label: "COMMENT.COMMENT_ON",
    minWidth: 200,
    format: (value: string) => dateFormatter(value, "MMMM DD YYYY  hh:mm A"),
  },
  {
    id: "activityCategory",
    label: "COMMENT.ACTION_CATEGORY",
    minWidth: 150,
    format: (value: number) => (
      <FormattedMessage id={commentActionMapper[value]} />
    ),
  },
  {
    id: "description",
    label: "COMMENT.COMMENT",
    minWidth: 200,
    build: (value: string) => (
      <Tooltip
        title={
          <Typography
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(value) }}
            sx={{
              fontSize: "12px",
              "& p": {
                margin: 0,
                color: "#FFFFFF",
              },
            }}
          />
        }
        arrow
        placement="top"
      >
        <Typography
          variant="body1"
          style={{
            width: "200px",
            overflow: "hidden",
            textWrap: "nowrap",
            textOverflow: "ellipsis",
            fontSize: "12px",
          }}
          dangerouslySetInnerHTML={{ __html: value }}
          sx={{
            "& p": {
              margin: 0,
            },
          }}
        />
      </Tooltip>
    ),
  },
];

export const EmployeeLeaveBalanceColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S_No",
    minWidth: 60,
  },
  {
    id: "employeeName",
    label: "LEAVE.EMPLOYEE_NAME",
    minWidth: 200,
    avatarCell: (data: LeaveBalance) => {
      return (
        <AvatarCell
          avatarSrc={data.profileUrl}
          title={data.employeeName}
          subTitle={data.jobRole}
        />
      );
    },
  },
  {
    id: "sickLeave",
    label: "LEAVE.TYPES.SICK_LEAVE",
    format: (value: LeaveBalanceType) => {
      return value === null ? (
        <FormattedMessage id="NOT_AVAILABLE" />
      ) : (
        `${value.remainingLeave} / ${value.maximumLeave}`
      );
    },
  },
  {
    id: "casualLeave",
    label: "LEAVE.TYPES.CASUAL_LEAVE",
    format: (value: LeaveBalanceType) => {
      return value === null ? (
        <FormattedMessage id="NOT_AVAILABLE" />
      ) : (
        `${value.remainingLeave} / ${value.maximumLeave}`
      );
    },
  },
  {
    id: "earnedLeave",
    label: "LEAVE.TYPES.EARNED_LEAVE",
    format: (value: LeaveBalanceType) => {
      return value === null ? (
        <FormattedMessage id="NOT_AVAILABLE" />
      ) : (
        `${value.remainingLeave} / ${value.maximumLeave}`
      );
    },
  },
  {
    id: "maternityLeave",
    label: "LEAVE.TYPES.MATERNITY_LEAVE",
    format: (value: LeaveBalanceType) => {
      return value === null ? (
        <FormattedMessage id="NOT_AVAILABLE" />
      ) : (
        `${value.remainingLeave} / ${value.maximumLeave}`
      );
    },
  },
  {
    id: "paternityLeave",
    label: "LEAVE.TYPES.PATERNITY_LEAVE",
    format: (value: LeaveBalanceType) => {
      return value === null ? (
        <FormattedMessage id="NOT_AVAILABLE" />
      ) : (
        `${value.remainingLeave} / ${value.maximumLeave}`
      );
    },
  },
  {
    id: "action",
    label: "ACTION",
    build: (
      row: LeaveBalance,
      handleLeaveBalanceEdit: (row: LeaveBalance) => void,
    ) => <ActionComponent row={row} handleEdit={handleLeaveBalanceEdit} />,
  },
];

export const EmployeeLeavePoliciesColumnList: ColumnListTypes[] = [
  {
    id: "name",
    label: "LEAVE.TYPES.POLICY_NAME",
  },
  {
    id: "code",
    label: "LEAVE.TYPES.POLICY_CODE",
  },
  {
    id: "paid",
    label: "LEAVE.TYPES.POLICY_PAID",
    build: (value: boolean) => {
      return value ? (
        <Check className="text-success fs-20" />
      ) : (
        <Close className="text-danger fs-20" />
      );
    },
  },
  {
    id: "accrualPeriod",
    label: "LEAVE.TYPES.POLICY_ACCURAL_PERIOD",
    build: (value: number) => {
      return (
        value &&
        (value === 1 ? (
          <Typography>Monthly</Typography>
        ) : value === 2 ? (
          <Typography>Yearly</Typography>
        ) : (
          <Typography>None</Typography>
        ))
      );
    },
  },
  {
    id: "carryOverAllowed",
    label: "LEAVE.TYPES.POLICY_CARRY_OVER_ALLOWED",
    build: (value: boolean) => {
      return value ? (
        <Check className="text-success fs-20" />
      ) : (
        <Close className="text-danger fs-20" />
      );
    },
  },
  {
    id: "minNoticeDays",
    label: "LEAVE.TYPES.POLICY_MIN_NOTICE_DAYS",
  },
  {
    id: "halfDayAllowed",
    label: "LEAVE.TYPES.POLICY_HALF_DAYS_ALLOWED",
    build: (value: boolean) => {
      return value ? (
        <Check className="text-success fs-20" />
      ) : (
        <Close className="text-danger fs-20" />
      );
    },
  },
  {
    id: "status",
    label: "LEAVE.TYPES.POLICY_STATUS",
    build: (status: boolean) => {
      return (
        <StyleStatus
          label={jobStatusMapper[Number(status)]}
          className={clsx({ success: status, danger: !status })}
        />
      );
    },
  },
  {
    id: "action",
    label: "ACTION",
    build: (row: LeaveType, handleLeaveTypeEdit: (row: LeaveType) => void) => (
      <ActionComponent row={row} handleEdit={handleLeaveTypeEdit} />
    ),
  },
];

export const SideBarTabList: SideBarTabListProps[] = [
  {
    id: Modules.Dashboard,
    title: ModulesTitles.Dashboard,
    constant: ModulesName.Dashboard,
    route: "/dashboard",
    icon: <DashboardIcon />,
    isDefault: true,
  },
  {
    id: Modules.Employees,
    constant: ModulesName.Employees,
    title: ModulesTitles.Employees,
    route: "/employees",
    icon: <Person />,
    isDefault: false,
  },
  {
    id: Modules.PayRoll,
    constant: ModulesName.PayRoll,
    title: ModulesTitles.PayRoll,
    route: "/",
    icon: <Contacts />,
    hasSubTabs: true,
    isDefault: false,
    subTabs: [
      {
        id: Modules.LeaveManagement,
        constant: ModulesName.LeaveManagement,
        title: ModulesTitles.LeaveManagement,
        route: "/leavemanagement",
        icon: <PermContactCalendar />,
        isDefault: false,
      },
      {
        id: Modules.Attendance,
        title: ModulesTitles.Attendance,
        constant: ModulesName.Attendance,
        route: "/attendance",
        icon: <AccessTime />,
        isDefault: false,
      },
      {
        id: Modules.PayRoll,
        title: ModulesTitles.PayRoll,
        constant: ModulesName.PayRoll,
        route: "/payroll",
        icon: <CurrencyRupee />,
        isDefault: false,
      },
      {
        id: Modules.PayrollSettings,
        title: ModulesTitles.PayrollSettings,
        constant: ModulesName.PayrollSettings,
        route: "/settingspayroll",
        icon: <ReceiptLongIcon />,
        isDefault: false,
      },
    ],
  },
  {
    id: Modules.Recruitment,
    title: ModulesTitles.Recruitment,
    constant: ModulesName.Recruitment,
    route: "/recruitment/",
    icon: <PersonSearch />,
    hasSubTabs: true,
    isDefault: false,
    subTabs: [
      {
        id: Modules.Jobs,
        constant: ModulesName.Jobs,
        title: ModulesTitles.Jobs,
        route: "/recruitment/jobs",
        icon: <Work />,
        isDefault: false,
      },
      {
        id: Modules.Applications,
        title: ModulesTitles.Applications,
        constant: ModulesName.Applications,
        route: "/recruitment/applications",
        icon: <Mail />,
        isDefault: false,
      },
      {
        id: Modules.ProcessLog,
        constant: ModulesName.ProcessLog,
        title: ModulesTitles.ProcessLog,
        route: "/recruitment/processlog",
        icon: <Book />,
        isDefault: false,
      },
    ],
  },
  {
    id: Modules.Admin,
    title: ModulesTitles.Admin,
    constant: ModulesName.Admin,
    route: "/admin/",
    icon: <Settings />,
    hasSubTabs: true,
    isDefault: false,
    adminOnly: true,
    subTabs: [
      {
        id: Modules.Permissions,
        title: ModulesTitles.Permissions,
        constant: ModulesName.Permissions,
        route: "/admin/roles",
        icon: <ToggleOn />,
        isDefault: false,
      },
      {
        id: Modules.CompanyMaster,
        title: ModulesTitles.CompanyMaster,
        constant: ModulesName.CompanyMaster,
        route: "/admin/companymaster/",
        icon: <AdminPanelSettings />,
        isDefault: false,
      },
      {
        id: Modules.CompanyDetails,
        title: ModulesTitles.CompanyDetails,
        constant: ModulesName.CompanyDetails,
        route: "/admin/companydetails",
        icon: <Info />,
        isDefault: false,
      },
    ],
  },
  {
    id: Modules.Calendar,
    title: ModulesTitles.Calendar,
    constant: ModulesName.Calendar,
    route: "/calendar",
    icon: <CalendarMonth />,
    isDefault: false,
  },
  {
    id: Modules.NoticeBoard,
    constant: ModulesName.NoticeBoard,
    title: ModulesTitles.NoticeBoard,
    route: "/noticeboard",
    icon: <NoteAlt />,
    isDefault: false,
  },
  {
    id: Modules.Policies,
    constant: ModulesName.Policy,
    title: ModulesTitles.Policies,
    route: "/companypolicy/policies",
    icon: <PolicyIcon />,
    isDefault: false,
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
  {
    id: 2,
    label: "1 - 2",
    value: 2,
  },
  {
    id: 3,
    label: "2 - 3",
    value: 3,
  },
  {
    id: 4,
    label: "3 - 4",
    value: 4,
  },
  {
    id: 5,
    label: "4 - 5",
    value: 5,
  },
  {
    id: 6,
    label: "5 - 6",
    value: 6,
  },
  {
    id: 7,
    label: "6 - 7",
    value: 7,
  },
  {
    id: 8,
    label: "7 - 8",
    value: 8,
  },
  {
    id: 9,
    label: "8 - 9",
    value: 9,
  },
  {
    id: 10,
    label: "9 - 10",
    value: 10,
  },
  {
    id: 11,
    label: "10 - 11",
    value: 11,
  },
  {
    id: 12,
    label: "11 - 12",
    value: 12,
  },
  {
    id: 13,
    label: "12 - 13",
    value: 13,
  },
  {
    id: 14,
    label: "13 - 14",
    value: 14,
  },
  {
    id: 15,
    label: "14 - 15",
    value: 15,
  },
];
export const monthsExperienceList = [
  { id: 1, label: "0", value: 0 },
  {
    id: 2,
    label: "1",
    value: 1,
  },
  {
    id: 3,
    label: "2",
    value: 2,
  },
  {
    id: 4,
    label: "3",
    value: 3,
  },
  {
    id: 5,
    label: "4",
    value: 4,
  },
  {
    id: 6,
    label: "5",
    value: 5,
  },
  {
    id: 7,
    label: "6",
    value: 6,
  },
  {
    id: 8,
    label: "7",
    value: 7,
  },
  {
    id: 9,
    label: "8",
    value: 8,
  },
  {
    id: 10,
    label: "9",
    value: 9,
  },
  {
    id: 11,
    label: "10",
    value: 10,
  },
  {
    id: 12,
    label: "11",
    value: 11,
  },
  {
    id: 13,
    label: "12",
    value: 12,
  },
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
