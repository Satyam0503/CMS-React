import { Button, Tooltip, Typography } from "@mui/material";
import {
  Applicant,
  ColumnListTypes,
  EmployeeModel,
  JobModal,
  RolesType,
  SideBarTabListProps,
} from "../common_types";
import {
  dateFormatter,
  statusDecoder,
  commentActionDecoder,
  applicantStatusDecoder,
  getApplicantStatusClass,
  convertMonthsToYear,
} from "../common";
import { Link } from "react-router-dom";
import { StyleStatus } from "../../app/modules/components/StyledStatus";
import { ApplicationStatus, Modules, ModulesName } from "../enums";
import { ActionComponent } from "../../app/modules/components/ActionComponent";
import { AvatarCell } from "../../app/modules/components/AvatarCell";
import { AddressDetailsIcon } from "../../app/modules/components/AddressDetailsIcon";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  AccessTime,
  AccountCircle,
  AdminPanelSettings,
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
export const BaseUrl =
  import.meta.env.VITE_BASEURL || "https://stage.codeji.in";

export const ReCAPTCHA_SITE_KEY = import.meta.env.VITE_CAPTCHA_SITE_KEY;

export const ServiceUrl = {
  // account
  REGISTER_COMPANY: `${BaseUrl}/api/account/register`,
  USER_LOGIN: `${BaseUrl}/api/account/login`,
  GET_USER_DETAILS: `${BaseUrl}/api/account/getSignedUserDetails`,
  CREATE_NEW_PASSWORD: `${BaseUrl}/api/User/CreateNewPassword`,

  // role
  GET_ALL_ROLES: `${BaseUrl}/api/Roles/GetRoles`,

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
  UPDATE_EMPLOYEE_CERTIFICATION:`${BaseUrl}/api/User/EditEmployeeCertification`,
  UPDATE_EMPLOYEE_EDUCATION:`${BaseUrl}/api/User/EditEmployeeEducation`,

  DELETE_EMPLOYEE_EDUCATION:`${BaseUrl}/api/User/DeleteEducationDetails`,
  DELETE_EMPLOYEE_CERTIFICATION:`${BaseUrl}/api/User/DeleteCertificationDetails`,
  
  
  // jobs
  ADD_JOB_VACANCY: `${BaseUrl}/api/JobVacancy/AddJobVacancy`,
  EDIT_JOB_VACANCY: `${BaseUrl}/api/JobVacancy/EditJobVacancy`,
  GET_ALL_VACANCIES: `${BaseUrl}/api/JobVacancy/GetAllVacancy`,

  // applicant
  GET_ALL_APPLICANTS: `${BaseUrl}/api/Applicants/GetApplicantList`,
  GET_APPLICANT_COMMENTS: `${BaseUrl}/api/User/GetAllComment`,
  GET_APPLICANT_BY_ID: `${BaseUrl}/api/Applicants/ApplicantById`,
  ADD_APPLICANT: `${BaseUrl}/api/Applicants/AddApplicant`,
  EDIT_APPLICANT: `${BaseUrl}/api/Applicants/EditApplicant`,
  UPLOAD_RESUME: `${BaseUrl}/api/Applicants/UploadResume`,

  ADD_COMMENT: `${BaseUrl}/api/User/AddComment`,
  APPLY_JOB: `${BaseUrl}/api/applicant/applyJob`,  
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


export const DepartmentList = [
  { id: 1, label: "Human Resource", value: "Human Resource" },
  { id: 2, label: "Sales", value: "Sales" },
  { id: 3, label: "Marketing", value: "Marketing" },
  { id: 4, label: "IT", value: "IT" },
];

export const EmployeeTabTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "S.No.",
    minWidth: 60,
  },
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
  {
    id: "address",
    label: "Address",
    align: "left",
    build: (address: string) => <AddressDetailsIcon address={address} />,
  },
  {
    id: "action",
    label: "Action",
    align: "left",
    build: (
      row: EmployeeModel,
      handleEmployeeEdit: (row: EmployeeModel) => void,
      openConfirmationModal: (row: EmployeeModel) => void,
      openViewModal: (row: EmployeeModel) => void
    ) => (
      <ActionComponent
        row={row}
        handleEdit={handleEmployeeEdit}
        openConfirmationModal={openConfirmationModal}
        openViewModal={openViewModal}
      />
    ),
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
    label:  "S.No.",
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

export const ApplicationTabTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label:  "S.No.",
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
    id: "experience",
    label: "Experience",
    align: "center",
    sorting: true,
    format: (value: number) => {
      return convertMonthsToYear(value);
    },
  },
  {
    id: "email",
    label: "Email",
  },

  {
    id: "applyDate",
    label: "Applied",
    minWidth: 180,
    sorting: true,
    format: (value: string) => dateFormatter(value, "DD MMM YYYY hh:mm A"),
  },
  {
    id: "status",
    label: "Status",
    build: (status: number) => {
      const values = applicantStatusDecoder(status);
      const className = getApplicantStatusClass(status);
      return <StyleStatus label={values} className={className} />;
    },
  },
  {
    id: "action",
    label: "Action",
    build: (
      row: Applicant,
      handleApplicationEdit: (row: Applicant) => void,
      openConfirmationModal: (row: Applicant) => void,
      openViewApplication: (row: Applicant) => void
    ) => (
      <ActionComponent
        row={row}
        handleEdit={handleApplicationEdit}
        openConfirmationModal={openConfirmationModal}
        openViewModal={openViewApplication}
      />
    ),
  },
];

export const RoleTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label:  "S.No.",
    minWidth: 60,
  },
  {
    id: "roleName",
    label: "Role Name",
    minWidth: 150,
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
    build: (row: RolesType) => (
      <Link to={"/admin/editpermission"} state={{ ...row }}>
        <Button variant="contained">Edit Permission</Button>
      </Link>
    ),
  },
];

export const JobRequirementTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label:  "S.No.",
    minWidth: 60,
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
        openViewModal={openViewJobDetail}
      />
    ),
  },
];

export const CommentTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label:  "S.No.",
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
    align: "center",
    minWidth: 150,
    format: (value: number) => commentActionDecoder(value),
  },
  {
    id: "description",
    label: "Comment",
    minWidth: 200,
    build: (value: string) => (
      <Tooltip title={value} arrow placement="top">
        <p
          style={{
            width: "200px",
            textOverflow: "ellipsis",
            textWrap: "nowrap",
            overflow: "hidden",
            margin: "0",
          }}
        >
          {value}
        </p>
      </Tooltip>
    ),
  },
];

export const SideBarTabList: SideBarTabListProps[] = [
  {
    id: Modules.Dashboard,
    title: ModulesName.Dashboard,
    route: "/admindashboard",
    icon: <DashboardIcon />,
  },
  {
    id: Modules.UserDashboard,
    title: ModulesName.UserDashboard,
    route: "/userdashboard",
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
