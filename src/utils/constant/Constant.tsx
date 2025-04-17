import { Button, Stack, Tooltip, Typography } from "@mui/material";
import {
  ColumnListTypes,
  EmployeeModel,
  SideBarTabListProps,
} from "../common_types";
import {
  dateFormatter,
  statusDecoder,
  applicantStatusDecoder,
  convertMonthsToYear,
  sanitizeHtmlContent,
  commentActionMapper,
} from "../common";
import { Link } from "react-router-dom";
import {
  ApplicantStatus,
  ApplicationStatus,
  CommentAction,
  Modules,
  ModulesName,
  ModulesTitles,
  TIME_PERIOD_MAP,
} from "../enums";

import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  AccessTime,
  AdminPanelSettings,
  Book,
  CalendarMonth,
  ColorLens,
  Contacts,
  Mail,
  PermContactCalendar,
  Person,
  PersonSearch,
  Settings,
  ToggleOn,
  Work,
} from "@mui/icons-material";
import { Applicant, JobModal } from "../../app/modules/recruitment/models";
import { ActionComponent } from "../../app/shared/components/ActionComponent";
import { StyleStatus } from "../../app/shared/components/StyledStatus";
import { AvatarCell } from "../../app/shared/components/AvatarCell";
import { DepartmentModel, RoleModel } from "../../app/modules/admin/models";
import { FormattedMessage } from "react-intl";
import { toAbsoluteUrl } from "../../_themes/helpers";
import clsx from "clsx";
import { GetAllEmployeeResponseModel } from "../../app/modules/employees/models";
export const BaseUrl = import.meta.env.VITE_BASEURL;

export const ReCAPTCHA_SITE_KEY = import.meta.env.VITE_CAPTCHA_SITE_KEY;
export const APP_FILTER_KEY = "app-filters";

export const ServiceUrl = {
  // account
  REGISTER_COMPANY: `${BaseUrl}/api/account/register`,
  USER_LOGIN: `${BaseUrl}/api/account/login`,
  GET_USER_DETAILS: `${BaseUrl}/api/account/getSignedUserDetails`,
  CREATE_NEW_PASSWORD: `${BaseUrl}/api/CreateNewPassword`,

  // role
  GET_ALL_ROLES: `${BaseUrl}/api/Roles/GetRoles`,
  GET_ALL_MODULE_PERMISSION: `${BaseUrl}/api/Roles/GetAllRolesWithPermission`,
  GET_ROLE_ALL_PERMISSIONS: `${BaseUrl}/api/Roles/GetRoleWithPermissionById`,
  ADD_EDIT_ROLE: `${BaseUrl}/api/Roles/AddEditRole`,
  GET_ROLE_BY_ID: `${BaseUrl}/api/Roles/GetRoleById`,
  CHANGE_APP_ACCESS: `${BaseUrl}/api/Roles/UpdateAppAccessForRole`,

  //user
  UPDATE_PROFILE_PICTURE: `${BaseUrl}/api/User/UploadUserImage`,
  UPDATE_EMPLOYEE: `${BaseUrl}/api/User/EditEmployees`,

  GET_ALL_EMPLOYEE: `${BaseUrl}/api/User/GetAllEmployees`,
  GET_EMPLOYEE_DETAILS: `${BaseUrl}/api/User/GetEmployeeById`,
  GET_EMPLOYEE_CERTIFICATIONS: `${BaseUrl}/api/User/GetEmployeeCertificationDetails`,
  GET_EMPLOYEE_EDUCATIONS: `${BaseUrl}/api/User/GetEmployeeEducationDetails`,
  GET_EMPLOYEE_SUMMARY: `${BaseUrl}/api/User/GetEmployeeSummary`,
  GET_EMPLOYEE_SKILLS: `${BaseUrl}/api/User/GetEmployeeSkills`,

  ADD_EMPLOYEE: `${BaseUrl}/api/User/AddEmployees`,
  ADD_EMPLOYEE_EDUCATION: `${BaseUrl}/api/User/AddEmployeeEducation`,
  ADD_EMPLOYEE_CERTIFICATION: `${BaseUrl}/api/User/AddEmployeeCertification`,

  UPDATE_EMPLOYEE_SUMMARY: `${BaseUrl}/api/User/AddEditEmployeeSummary`,
  UPDATE_EMPLOYEE_SKILLS: `${BaseUrl}/api/User/AddSkills`,
  UPDATE_EMPLOYEE_CERTIFICATION: `${BaseUrl}/api/User/EditEmployeeCertification`,
  UPDATE_EMPLOYEE_EDUCATION: `${BaseUrl}/api/User/EditEmployeeEducation`,

  DELETE_EMPLOYEE_EDUCATION: `${BaseUrl}/api/User/DeleteEducationDetails`,
  DELETE_EMPLOYEE_CERTIFICATION: `${BaseUrl}/api/User/DeleteCertificationDetails`,
  DELETE_EMPLOYEE: `${BaseUrl}/api/User/DeleteEmployee`,

  // jobs
  ADD_JOB_VACANCY: `${BaseUrl}/api/JobVacancy/AddJobVacancy`,
  EDIT_JOB_VACANCY: `${BaseUrl}/api/JobVacancy/EditJobVacancy`,
  GET_ALL_VACANCIES: `${BaseUrl}/api/JobVacancy/GetAllVacancy`,
  DELETE_VACANCY: `${BaseUrl}/api/JobVacancy/DeleteJobVacancy`,

  // applicant
  GET_ALL_APPLICANTS: `${BaseUrl}/api/Applicants/GetApplicantList`,
  GET_APPLICANT_COMMENTS: `${BaseUrl}/api/Applicants/GetAllComment`,
  GET_APPLICANT_BY_ID: `${BaseUrl}/api/Applicants/ApplicantById`,
  ADD_APPLICANT: `${BaseUrl}/api/Applicants/AddApplicant`,
  EDIT_APPLICANT: `${BaseUrl}/api/Applicants/EditApplicant`,
  UPLOAD_RESUME: `${BaseUrl}/api/Applicants/UploadResume`,

  ADD_COMMENT: `${BaseUrl}/api/Applicants/AddComment`,
  APPLY_JOB: `${BaseUrl}/api/applicant/applyJob`,

  // process log
  GET_PROCESS_LOG: `${BaseUrl}/api/Applicants/GetProcessLogData`,

  // departments
  GET_DEPARTMENTLIST: `${BaseUrl}/api/CompanyMaster/GetDepartmentList`,
  ADD_DEPARTMENT: `${BaseUrl}/api/CompanyMaster/AddEditDepartment`, // Updated endpoint from AddDeparments to AddEditDepartment`,

};

export const languages = [
  {
    id: 1,
    lang: "en",
    name: <FormattedMessage id="Language.English" />,
    flag: toAbsoluteUrl("media/flags/united-states.svg"),
  },
  {
    id: 2,
    lang: "zh",
    name: <FormattedMessage id="Language.Mandarin" />,
    flag: toAbsoluteUrl("media/flags/china.svg"),
  },
  {
    id: 3,
    lang: "es",
    name: <FormattedMessage id="Language.Spanish" />,
    flag: toAbsoluteUrl("media/flags/spain.svg"),
  },
  {
    id: 4,
    lang: "ja",
    name: <FormattedMessage id="Language.Japanese" />,
    flag: toAbsoluteUrl("media/flags/japan.svg"),
  },
  {
    id: 5,
    lang: "de",
    name: <FormattedMessage id="Language.German" />,
    flag: toAbsoluteUrl("media/flags/germany.svg"),
  },
  {
    id: 6,
    lang: "fr",
    name: <FormattedMessage id="Language.French" />,
    flag: toAbsoluteUrl("media/flags/france.svg"),
  },
];

export const Regex = {
  Name: /^[A-Za-z]+(?:[-'][A-Za-z]+)*(?: [A-Za-z]+(?:[-'][A-Za-z]+)*)*$/,
  Email: /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  Phone: /^[6-9]\d{9}$/,
  Password: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
};

export const Gender = [
  {
    id: 1,
    label: <FormattedMessage id="GENDER.MALE" />,
    value: "male",
  },
  {
    id: 2,
    label: <FormattedMessage id="GENDER.FEMALE" />,
    value: "female",
  },
  {
    id: 3,
    label: <FormattedMessage id="GENDER.OTHER" />,
    value: "other",
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
  { id: 1, label: "Public Holiday", value: "Public Holiday" },
  { id: 2, label: "Custom Holiday", value: "Custom Holiday" },
];

export const NoticeTypes = [
  { id: 1, label: "General", value: "General" },
  { id: 2, label: "Important", value: "Important" },
  { id: 3, label: "Urgent", value: "Urgent" },
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

export const JobTime = [
  {
    id: 1,
    label: "Full Time",
    value: "Full Time",
  },
  {
    id: 2,
    label: "Part Time",
    value: "Part Time",
  },
  {
    id: 3,
    label: "Internship",
    value: "Internship",
  },
];
export const JobType = [
  {
    id: 1,
    label: <FormattedMessage id="Jobtype.Onsite" />,
    value: "Onsite",
  },
  {
    id: 2,
    label: <FormattedMessage id="Jobtype.Hybrid" />,
    value: "Hybrid",
  },
  {
    id: 3,
    label: <FormattedMessage id="Jobtype.Remote" />,
    value: "Remote",
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
  { id: 1, label: "InActive", value: ApplicantStatus.InActive },
  { id: 2, label: "Active", value: ApplicantStatus.Active },
];

export const EmployeeTabTableColumnList: ColumnListTypes[] = [
  {
    id: "employeeId",
    label: "EMPLOYEE.EMPID",
    minWidth: 60,
  },
  // {
  //   id: "action",
  //   label: "Action",
  //   align: "left",
  //   build: (
  //     row: EmployeeModel,
  //     handleEmployeeEdit: (row: EmployeeModel) => void,
  //     openConfirmationModal: (row: EmployeeModel) => void,
  //     openViewModal: (row: EmployeeModel) => void
  //   ) => (
  //     <ActionComponent
  //       row={row}
  //       handleEdit={handleEmployeeEdit}
  //       openConfirmationModal={openConfirmationModal}
  //       openViewModal={openViewModal}
  //     />
  //   ),
  // },
  {
    id: "name",
    label: "FORM.FULL_NAME",
    minWidth: 200,
    avatarCell: (emp: GetAllEmployeeResponseModel) => {
      return (
        <AvatarCell
          avatarSrc={emp.fullProfileUrl}
          title={emp.fullName}
          subTitle={emp.jobRole}
        />
      );
    },
  },
  {
    id: "email",
    label: "FORM.EMAIL",
  },
  {
    id: "phoneNumber",
    label: "FORM.PHONE",
  },
  {
    id: "department",
    label: "FORM.DEPARTMENT",
    format: (value: string | null) =>
      value ?? <FormattedMessage id="NOT_AVAILABLE" />,
  },
];

export const HolidayTabTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S.No.",
    minWidth: 30,
  },

  {
    id: "title",
    label: "Title",
  },
  {
    id: "type",
    label: "Type",
  },
  {
    id: "startDate",
    label: "Start Date",
    format: (value) => dateFormatter(value, "DD MMMM YYYY"),
  },
  {
    id: "endDate",
    label: "End Date",
    format: (value) => dateFormatter(value, "DD MMMM YYYY"),
  },
  {
    id: "description",
    label: "Description",
  },
  {
    id: "action",
    label: "Action",
    build: (
      row: any,
      handleHolidayEdit: (row: any) => void,
      openConfirmationModal: (id: string) => void
    ) => (
      <ActionComponent
        row={row}
        handleEdit={handleHolidayEdit}
        openConfirmationModal={openConfirmationModal}
      />
    ),
  },
];

export const NoticeBoardTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S.No.",
    minWidth: 60,
  },
  {
    id: "name",
    label: "Name",
  },
  {
    id: "datetime",
    label: "Date/Time",
  },

  {
    id: "type",
    label: "Type",
  },
  {
    id: "message",
    label: "Message",
  },
  {
    id: "action",
    label: "Action",
    build: (
      row: any,
      handleNoticeEdit: (row: any) => void,
      openConfirmationModal: (id: string) => void
    ) => (
      <ActionComponent
        row={row}
        handleEdit={handleNoticeEdit}
        openConfirmationModal={openConfirmationModal}
      />
    ),
  },
];
export const ProcessLogTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "Table.S_No",
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
    label: "Table.Column.Action",
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
export const LeaveSummaryTableColumnList: ColumnListTypes[] = [
  {
    id: "date",
    label: "Date",
  },
  {
    id: "absent",
    label: "Absent",
  },

  {
    id: "firsthalf",
    label: "First Half",
  },

  {
    id: "secondhalf",
    label: "Second Half",
  },
  {
    id: "workfromhome",
    label: "Working from home",
  },
  {
    id: "total",
    label: "Total",
  },

  {
    id: "action",
    label: "Action",
    build: (row: Applicant) => <ActionComponent row={row} />,
  },
];
export const LeaveMangementTableColumnList: ColumnListTypes[] = [
  {
    id: "name",
    label: "Name",
  },
  {
    id: "type",
    label: "Leave type",
  },

  {
    id: "from",
    label: "From",
  },

  {
    id: "to",
    label: "To",
  },
  {
    id: "days",
    label: "Days",
  },
  {
    id: "remaining",
    label: "Remaining",
  },
  {
    id: "reason",
    label: "Reason",
  },
  {
    id: "status",
    label: "Status",
  },
  {
    id: "action",
    label: "Table.Column.Action",
    build: (row: Applicant) => <ActionComponent row={row} />,
  },
];
export const AttendanceMangementTableColumnList: ColumnListTypes[] = [
  {
    id: "name",
    label: "Name",
  },
  {
    id: "first_in",
    label: "First in",
  },

  {
    id: "break",
    label: "Break",
  },

  {
    id: "last_out",
    label: "Last Out",
  },
  {
    id: "total_hours",
    label: "Total Hours ",
  },
  {
    id: "shift",
    label: "Shift",
  },
  {
    id: "status",
    label: "Status",
  },

  {
    id: "action",
    label: "Table.Column.Action",
    build: (row: Applicant) => <ActionComponent row={row} />,
  },
];

export const ApplicationTabTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "Table.S_No",
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
    label: "JOB.STATUS",
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
      return convertMonthsToYear(value);
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
      openViewApplication: (row: Applicant) => void
    ) => (
      <ActionComponent
        row={row}
        // handleEdit={handleApplicationEdit}
        // openConfirmationModal={openConfirmationModal}
        openViewModal={openViewApplication}
      />
    ),
  },
];

export const RoleTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "Table.S_No",
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
    label: "Table.Column.Action",
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
    label: "Table.S_No",
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
  },
  {
    id: "status",
    label: "JOB.STATUS",
    build: (status: boolean) => {
      return (
        <StyleStatus
          label={statusDecoder(status)}
          className={clsx({ success: status, danger: !status })}
        />
      );
    },
  },
  {
    id: "action",
    label: "Table.Column.Action",
    build: (
      row: JobModal,
      handleJobEdit: (row: JobModal) => void,
      openDeleteModal: (row: JobModal) => void,
      openViewJobDetail: (row: JobModal) => void
    ) => (
      <ActionComponent
        row={row}
        handleEdit={handleJobEdit}
        openConfirmationModal={openDeleteModal}
        // openViewModal={openViewJobDetail}
      />
    ),
  },
];

export const CommentTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "Table.S_No",
    minWidth: 60,
  },
  {
    id: "userName",
    label: "COMMENT.ACTION_BY",
    minWidth: 150,
  },
  {
    id: "createdDate",
    label: "COMMENT.DATE",
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

export const DepartmentTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "Table.S_No",
    minWidth: 60,
  },
  {
    id: "departmentName",
    label: "Department.Name",
    minWidth: 200,
  },
  {
    id: "departmentDescription",
    label: "Department.Description",
    minWidth: 200,
  },
  {
    id: "action",
    label: "Table.Column.Action",
    build: (
      row: DepartmentModel,
      handleJobEdit: (row: DepartmentModel) => void,
      openDeleteModal: (row: DepartmentModel) => void
    ) => (
      <ActionComponent
        row={row}
        handleEdit={handleJobEdit}
        openConfirmationModal={openDeleteModal}
      />
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
  },
  {
    id: Modules.Employees,
    constant: ModulesName.Employees,
    title: ModulesTitles.Employees,
    route: "/employees",
    icon: <Person />,
  },
  {
    id: Modules.PayRoll,
    constant: ModulesName.PayRoll,
    title: ModulesTitles.PayRoll,
    route: "/",
    icon: <Contacts />,
    hasSubTabs: true,
    subTabs: [
      {
        id: Modules.LeaveManagement,
        constant: ModulesName.LeaveManagement,
        title: ModulesTitles.LeaveManagement,
        route: "/leavemanagement",
        icon: <PermContactCalendar />,
      },
      {
        id: Modules.Attendance,
        title: ModulesTitles.Attendance,
        constant: ModulesName.Attendance,
        route: "/attendance",
        icon: <AccessTime />,
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
    subTabs: [
      {
        id: Modules.Jobs,
        constant: ModulesName.Jobs,
        title: ModulesTitles.Jobs,
        route: "/recruitment/jobs",
        icon: <Work />,
      },
      {
        id: Modules.Applications,
        title: ModulesTitles.Applications,
        constant: ModulesName.Applications,
        route: "/recruitment/applications",
        icon: <Mail />,
      },
      {
        id: Modules.ProcessLog,
        constant: ModulesName.ProcessLog,
        title: ModulesTitles.ProcessLog,
        route: "/recruitment/processlog",
        icon: <Book />,
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
    subTabs: [
      {
        id: Modules.Permissions,
        title: ModulesTitles.Permissions,
        constant: ModulesName.Permissions,
        route: "/admin/roles",
        icon: <ToggleOn />,
      },
      {
        id: Modules.Theme,
        title: ModulesTitles.Theme,
        constant: ModulesName.Theme,
        route: "/admin/theme",
        icon: <ColorLens />,
      },
      {
        id: Modules.CompanyMaster,
        title: ModulesTitles.CompanyMaster,
        constant: ModulesName.CompanyMaster,
        route: "/admin/companymaster/",
        icon: <AdminPanelSettings />,
      },
      {
        id: Modules.CompanyDetails,
        title: ModulesTitles.CompanyDetails,
        constant: ModulesName.CompanyDetails,
        route: "/admin/company",
        icon: <AdminPanelSettings />,
      },
    ],
  },
  {
    id: Modules.Holidays,
    title: ModulesTitles.Holidays,
    constant: ModulesName.Holidays,
    route: "/holidays",
    icon: <CalendarMonth />,
  },
  {
    id: Modules.NoticeBoard,
    constant: ModulesName.NoticeBoard,
    title: ModulesTitles.NoticeBoard,
    route: "/noticeboard",
    icon: <AdminPanelSettings />,
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
  { id: TIME_PERIOD_MAP.LAST_WEEK, value: 7, name: "FILTER.LAST_WEEK" },
  {
    id: TIME_PERIOD_MAP.LAST_TWO_WEEK,
    value: 14,
    name: "FILTER.LAST_TWO_WEEK",
  },
  { id: TIME_PERIOD_MAP.LAST_MONTH, value: 30, name: "FILTER.LAST_MONTH" },
  {
    id: TIME_PERIOD_MAP.LAST_THREE_MONTHS,
    value: 90,
    name: "FILTER.LAST_THREE_MONTHS",
  },
  {
    id: TIME_PERIOD_MAP.LAST_SIX_MONTHS,
    value: 180,
    name: "FILTER.LAST_SIX_MONTHS",
  },
  {
    id: TIME_PERIOD_MAP.LAST_12_MONTHS,
    value: 365,
    name: "FILTER.LAST_12_MONTHS",
  },
];
