import { Button, Tooltip, Typography } from "@mui/material";
import {
  ColumnListTypes,
  EmployeeModel,
  SideBarTabListProps,
} from "../common_types";
import {
  dateFormatter,
  statusDecoder,
  commentActionDecoder,
  applicantStatusDecoder,
  getApplicantStatusClass,
  convertMonthsToYear,
  sanitizeHtmlContent,
} from "../common";
import { Link } from "react-router-dom";
import {
  ApplicantStatus,
  ApplicationStatus,
  Modules,
  ModulesName,
  TIME_PERIOD_MAP,
} from "../enums";

import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  AccessTime,
  AccountCircle,
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
import { RoleModel } from "../../app/modules/admin/models";
import { FormattedMessage } from "react-intl";
export const BaseUrl =
  import.meta.env.VITE_BASEURL ;

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
  GET_APPLICANT_COMMENTS: `${BaseUrl}/api/User/GetAllComment`,
  GET_APPLICANT_BY_ID: `${BaseUrl}/api/Applicants/ApplicantById`,
  ADD_APPLICANT: `${BaseUrl}/api/Applicants/AddApplicant`,
  EDIT_APPLICANT: `${BaseUrl}/api/Applicants/EditApplicant`,
  UPLOAD_RESUME: `${BaseUrl}/api/Applicants/UploadResume`,

  ADD_COMMENT: `${BaseUrl}/api/User/AddComment`,
  APPLY_JOB: `${BaseUrl}/api/applicant/applyJob`,

  // process log
  GET_PROCESS_LOG: `${BaseUrl}/api/User/GetProcessLogData`,
};

export const Regex = {
  Name: /^[A-Za-z]+(?:[-'][A-Za-z]+)*(?: [A-Za-z]+(?:[-'][A-Za-z]+)*)*$/,
  Email: /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  Phone: /^[6-9]\d{9}$/,
  Password: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
};

export const Gender = [
  {
    id: 1,
    label: "Male",
    value: "male",
  },
  {
    id: 2,
    label: "Female",
    value: "female",
  },
  {
    id: 3,
    label: "Other",
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
    label: "Onsite",
    value: "Onsite",
  },
  {
    id: 2,
    label: "Hybrid",
    value: "Hybrid",
  },
  {
    id: 3,
    label: "Remote",
    value: "Remote",
  },
];

export const ApplicationEvaluationStatus = [
  { id: 1, label: "In Progress", value: ApplicationStatus.InProgress },
  { id: 2, label: "On Hold", value: ApplicationStatus.OnHold },
  { id: 3, label: "Shortlisted", value: ApplicationStatus.Shortlisted },
  { id: 4, label: "Selected", value: ApplicationStatus.Selected },
  { id: 5, label: "Rejected", value: ApplicationStatus.Rejected },
];

export const ApplicantApplicationStatus = [
  { id: 0, label: "New", value: ApplicationStatus.New },
  { id: 1, label: "In Progress", value: ApplicationStatus.InProgress },
  { id: 2, label: "On Hold", value: ApplicationStatus.OnHold },
  { id: 3, label: "Shortlisted", value: ApplicationStatus.Shortlisted },
  { id: 4, label: "Selected", value: ApplicationStatus.Selected },
  { id: 5, label: "Rejected", value: ApplicationStatus.Rejected },
];
export const ApplicantStatusConstant = [
  { id: 1, label: "InActive", value: ApplicantStatus.InActive },
  { id: 2, label: "Active", value: ApplicantStatus.Active },
];

export const DepartmentList = [
  { id: 1, label: "Human Resource", value: "Human Resource" },
  { id: 2, label: "Sales", value: "Sales" },
  { id: 3, label: "Marketing", value: "Marketing" },
  { id: 4, label: "IT", value: "IT" },
];

export const EmployeeTabTableColumnList: ColumnListTypes[] = [
  {
    id: "employeeId",
    label: "Emp Id",
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
    label: "Name",
    minWidth: 200,
    avatarCell: (row: EmployeeModel) => {
      const fullName = row.firstName + " " + row.lastName;
      const jobRole = row.jobRole;
      return (
        <AvatarCell
          avatarSrc={row.fullProfileUrl}
          title={fullName}
          subTitle={jobRole}
        />
      );
    },
  },
  {
    id: "email",
    label: "Email",
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
  },
  {
    id: "department",
    label: "Department",
  },
  // {
  //   id: "address",
  //   label: "Address",
  //   align: "left",
  //   build: (address: string) => <AddressDetailsIcon address={address} />,
  // },
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
    id:'serialNo',
    label:"S.No.",
    minWidth:60
  },
  {
    id: "applicantName",
    label: "Applicant Name",
    minWidth:150
  },
  {
    id: "jobRole",
    label: "Job Role",
    minWidth:150
  },
  {
    id: "commentedOn",
    label: "Commented On",
    format:(value:string)=> dateFormatter(value, "DD MMM YYYY hh:mm A"),
    minWidth:150
  },
  {
    id: "commentedBy",
    label: "Commented By",
    minWidth:150
  },
  {
    id: "actionCategory",
    label: "Action",
    minWidth:150,
    format: (value: number) => commentActionDecoder(value),
  },
  {
    id: "comments",
    label: "Comment",
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
    label: "Action",
    build: (row: Applicant) => <ActionComponent row={row} />,
  },
];

export const ApplicationTabTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S.No.",
    minWidth: 60,
  },

  {
    id: "fullName",
    label: "Full Name",
    minWidth: 150,
  },
  {
    id: "vacancyName",
    label: "Job Title",
    minWidth: 150,
  },
  {
    id: "status",
    label: "Status",
    build: (status: number) => {
      const values = applicantStatusDecoder[status];
      const className = getApplicantStatusClass(status);
      return <StyleStatus label={values} className={className} />;
    },
  },
  {
    id: "experience",
    label: "Experience",
    align: "center",
    sorting: true,
    format: (value: number) => {
      return convertMonthsToYear(value);
    },
  },
  // {
  //   id: "email",
  //   label: "Email",
  // },
  {
    id: "applyDate",
    label: "Applied",
    minWidth: 180,
    sorting: true,
    format: (value: string) => dateFormatter(value, "DD MMM YYYY hh:mm A"),
  },
  {
    id: "action",
    label: "CV",
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
    label: "S.No.",
    minWidth: 60,
  },
  {
    id: "titles",
    label: "Role Name",
    minWidth: 200,
  },
  {
    id: "description",
    label: "Description",
    minWidth: 200,
  },
  {
    id: "accessToApp",
    label: "Access To Application",
    minWidth: 180,
  },
  {
    id: "action",
    label: "Action",
    minWidth: 180,
    build: (row: RoleModel) => (
      <Link to={"/admin/editpermission"} state={{ ...row }}>
        <Button variant="contained">
          <FormattedMessage
            id={
              row.isNotEditable
                ? "ADMIN.VIEW_PERMISSION"
                : "ADMIN.EDIT_PERMISSION"
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
    label: "S.No.",
    minWidth: 30,
  },

  {
    id: "title",
    label: "Job Title",
  },
  {
    id: "vacancies",
    label: "No of Position",
    align: "center",
    sorting: true,
  },
  {
    id: "jobType",
    label: "Job Type",
  },
  {
    id: "status",
    label: "Status",
    build: (status: boolean) => {
      const className = status ? "success" : "danger";
      return (
        <StyleStatus label={statusDecoder(status)} className={className} />
      );
    },
  },
  {
    id: "action",
    label: "Action",
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
    label: "S.No.",
    minWidth: 60,
  },
  {
    id: "userName",
    label: "Action By",
    minWidth: 150,
  },
  {
    id: "createdDate",
    label: "Date",
    minWidth: 200,
    format: (value: string) => dateFormatter(value, "MMMM DD YYYY  hh:mm A"),
  },
  {
    id: "activityCategory",
    label: "Action Category",
    minWidth: 150,
    format: (value: number) => commentActionDecoder(value),
  },
  {
    id: "description",
    label: "Comment",
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

export const SideBarTabList: SideBarTabListProps[] = [
  {
    id: Modules.Dashboard,
    title: ModulesName.Dashboard,
    route: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    id: Modules.MyProfile,
    title: ModulesName.MyProfile,
    route: "/myprofile",
    icon: <AccountCircle />,
  },
  {
    id: Modules.Employees,
    title: ModulesName.Employees,
    route: "/employee/",
    icon: <Contacts />,
    hasSubTabs: true,
    subTabs: [
      {
        id: Modules.Employees,
        title: ModulesName.Employees,
        route: "/employee/employees",
        icon: <Person />,
      },
      {
        id: Modules.LeaveManagement,
        title: ModulesName.LeaveManagement,
        route: "/employee/employeeleave",
        icon: <PermContactCalendar />,
      },
      {
        id: Modules.Attendance,
        title: ModulesName.Attendance,
        route: "/employee/attendance",
        icon: <AccessTime />,
      },
    ],
  },
  {
    id: Modules.Recruitment,
    title: ModulesName.Recruitment,
    route: "/recruitment/",
    icon: <PersonSearch />,
    hasSubTabs: true,
    subTabs: [
      {
        id: Modules.Jobs,
        title: ModulesName.Jobs,
        route: "/recruitment/jobs",
        icon: <Work />,
      },
      {
        id: Modules.Applications,
        title: ModulesName.Applications,
        route: "/recruitment/applications",
        icon: <Mail />,
      },
      {
        id: Modules.ProcessLog,
        title: ModulesName.ProcessLog,
        route: "/recruitment/processlog",
        icon: <Book />,
      },
    ],
  },
  {
    id: Modules.Admin,
    title: ModulesName.Admin,
    route: "/admin/",
    icon: <Settings />,
    hasSubTabs: true,
    subTabs: [
      {
        id: Modules.Permissions,
        title: ModulesName.Permissions,
        route: "/admin/permissions",
        icon: <ToggleOn />,
      },
      {
        id: Modules.Theme,
        title: ModulesName.Theme,
        route: "/admin/theme",
        icon: <ColorLens />,
      },
    ],
  },
  {
    id: Modules.Holidays,
    title: ModulesName.Holidays,
    route: "/holidays",
    icon: <CalendarMonth />,
  },
  {
    id: Modules.NoticeBoard,
    title: ModulesName.NoticeBoard,
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
