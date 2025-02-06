import {
  DeleteOutlineOutlined,
  Edit,
  Place,
  Visibility,
} from "@mui/icons-material";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import {
  Applicant,
  ColumnListTypes,
  EmployeeModel,
  JobModal,
  RolesType,
} from "../common_types";
import {
  dateFormatter,
  applicationStatusDecoder,
  statusDecoder,
  getApplicationStatusClass,
  commentActionDecoder,
} from "../common";
import CustomisedButton from "../../app/modules/components/CustomisedButton";
import { CustomIconButton } from "../../app/modules/components/CustomIconButton";
import { CustomisedModal } from "../../app/modules/components/CustomisedModal";
import { Link } from "react-router-dom";
import { StyleStatus } from "../../app/modules/components/StyledStatus";
import { colors } from "../../app/modules/theme/MuiTheme";
import { ApplicationStatus } from "../enums";
import DOMPurify from "dompurify";

export const BaseUrl =
  import.meta.env.VITE_BASEURL || "https://stage.codeji.in";

export const ServiceUrl = {
  // account
  REGISTER_COMPANY: `${BaseUrl}/api/account/register`,
  USER_LOGIN: `${BaseUrl}/api/account/login`,
  GET_USER_DETAILS: `${BaseUrl}/api/account/getSignedUserDetails`,

  // role
  GET_ALL_ROLES: `${BaseUrl}/api/Roles/GetRoles`,

  //user
  GET_EMPLOYEE_DETAILS: `${BaseUrl}/api/User/GetEmployeeById`,
  GET_ALL_EMPLOYEE: `${BaseUrl}/api/User/GetAllEmployees`,
  ADD_EMPLOYEE: `${BaseUrl}/api/User/AddEmployees`,
  UPDATE_EMPLOYEE: `${BaseUrl}/api/User/EditEmployees`,

  GET_EMPLOYEE_CERTIFICATIONS: `${BaseUrl}/api/User/GetEmployeeCertificationDetails`,
  GET_EMPLOYEE_EDUCATIONS: `${BaseUrl}/api/User/GetEmployeeEducationDetails`,
  GET_EMPLOYEE_SUMMARY: `${BaseUrl}/api/User/GetEmployeeSummary`,

  ADD_EMPLOYEE_EDUCATION: `${BaseUrl}/api/User/AddEmployeeEducation`,
  ADD_EMPLOYEE_CERTIFICATION: `${BaseUrl}/api/User/AddEmployeeCertification`,

  UPDATE_EMPLOYEE_SUMMARY: `${BaseUrl}/api/User/AddEditEmployeeSummary`,

  // jobs
  ADD_JOB_VACANCY: `${BaseUrl}/api/JobVacancy/AddJobVacancy`,
  EDIT_JOB_VACANCY: `${BaseUrl}/api/JobVacancy/EditJobVacancy`,
  GET_ALL_JOBS: `${BaseUrl}/api/JobVacancy/GetAllVacancy`,

  // applicant
  GET_ALL_APPLICANTS: `${BaseUrl}/api/Applicants/GetApplicantList`,
  ADD_APPLICANT: `${BaseUrl}/api/Applicants/AddApplicant`,
  EDIT_APPLICANT: `${BaseUrl}/api/Applicants/EditApplicant`,
  GET_APPLICANT_BY_ID: `${BaseUrl}/api/Applicants/ApplicantById`,
  UPLOAD_RESUME: `${BaseUrl}/api/Applicants/UploadResume`,

  ADD_COMMENT: `${BaseUrl}/api/User/AddComment`,
  GET_APPLICANT_COMMENTS: `${BaseUrl}/api/User/GetAllComment`,

  // not working
  UPDATE_EMPLOYEE_SKILLS: `${BaseUrl}/api/User/AddEmployeeSkills`,
  DELETE_EMPLOYEE: `${BaseUrl}/employees/deleteEmployee`,
  GET_EMPLOYEE_SKILLS: `${BaseUrl}/api/User/GetEmployeeSkills`,

  // UPDATE_USER_AVATAR: `${BaseUrl}/users/updateAvatarImage`,
  // ADD_UPDATE_USER_SUMMARY: `${BaseUrl}/employees/addEmployeeSummary`,
  // UPDATE_USER_DETAILS: `${BaseUrl}/employees/addEmployeeDetails`,
  // ADD_USER_SKILLS: `${BaseUrl}/employees/addEmployeeSkills`,
  // ADD_USER_EDUCATION: `${BaseUrl}/employees/addEmployeeEducation`,
  // ADD_USER_CERTIFICATION: `${BaseUrl}/employees/addEmployeeCertificates`,
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
  { id: 5, label: "Selected", value: ApplicationStatus.Selected },
  { id: 4, label: "Rejected", value: ApplicationStatus.Rejected },
];

export const EmployeeTabTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "#",
    minWidth: 30,
  },
  {
    id: "name",
    label: "Name",
    minWidth: 180,
    avatarCell: (row: EmployeeModel) => {
      const fullName = row.firstName + " " + row.lastName;
      const jobRole = row.department;
      return <AvatarCell title={fullName} subTitle={jobRole} />;
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
    label: "#",
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
    label: "#",
    minWidth: 30,
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
    label: "#",
    minWidth: 30,
  },
  {
    id: "firstName",
    label: "Name",
    minWidth: 30,
  },
  {
    id: "vacancyName",
    label: "Job Title",
  },
  {
    id: "experience",
    label: "Experience",
    align: "center",
    format: (value: number) => {
      const suffix = value > 1 ? "Years" : "Year";
      return value + " " + suffix;
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
    format: (value: string) => dateFormatter(value, "DD MMM YYYY hh:mm A"),
  },
  {
    id: "activityType",
    label: "Status",
    build: (status: number) => {
      const values = applicationStatusDecoder(status);
      const className = getApplicationStatusClass(status);
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
    label: "#",
    minWidth: 40,
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
      <Link to={"/setting/editpermission"} state={{ ...row }}>
        <Button variant="contained">Edit Permission</Button>
      </Link>
    ),
  },
];

export const JobRequirementTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "#",
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
    label: "#",
    minWidth: 30,
  },
  {
    id: "userName",
    label: "User Name",
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
    build: (description: string) => {
      const trustedHtml = DOMPurify.sanitize(description);
      return (
        <Box
          component={"div"}
          dangerouslySetInnerHTML={{
            __html: trustedHtml,
          }}
        ></Box>
      );
    },
  },
];

interface ActionComponentProps<Row> {
  row: Row;
  handleEdit?: (row: Row) => void;
  openConfirmationModal?: (row: Row) => void;
  openViewModal?: (row: Row) => void;
}
const ActionComponent = <Row,>(props: ActionComponentProps<Row>) => {
  const { row, handleEdit, openConfirmationModal, openViewModal } = props;
  return (
    <Stack direction={"row"} spacing={1}>
      {handleEdit && (
        <CustomIconButton
          handleClick={() => handleEdit(row)}
          icon={<Edit />}
          tooltip="Edit"
          ariaLabel="Edit"
        />
      )}
      {openConfirmationModal && (
        <CustomIconButton
          handleClick={() => openConfirmationModal(row)}
          icon={<DeleteOutlineOutlined />}
          tooltip="Delete"
          ariaLabel="Delete"
        />
      )}
      {openViewModal && (
        <CustomIconButton
          handleClick={() => openViewModal(row)}
          icon={<Visibility />}
          tooltip="View"
          ariaLabel="View"
        />
      )}
    </Stack>
  );
};

const AddressDetailsIcon = (props: { address: string }) => {
  const [open, setOpen] = useState(false);
  function handleClose() {
    setOpen(false);
  }
  return (
    <>
      <CustomIconButton
        handleClick={() => setOpen(true)}
        icon={<Place />}
        tooltip="Address"
        ariaLabel="Address"
      />
      <CustomisedModal open={open} handleClose={handleClose}>
        <Stack spacing={2}>
          <Typography variant="h5">Address</Typography>
          <Typography>{props.address}</Typography>
          <Stack sx={{ alignSelf: "flex-end" }}>
            <CustomisedButton label="Close" handleClick={handleClose} />
          </Stack>
        </Stack>
      </CustomisedModal>
    </>
  );
};

interface AvatarCellPropsTypes {
  title?: string;
  subTitle?: string;
  avatarSrc?: any;
}

export const AvatarCell = ({
  title,
  avatarSrc,
  subTitle,
}: AvatarCellPropsTypes) => {
  return (
    <Stack direction="row" spacing={1}>
      <Avatar src={avatarSrc || ""}>{title?.at(0)?.toLocaleUpperCase()}</Avatar>
      <Stack direction="column" sx={{ alignSelf: "center" }}>
        <Typography
          variant="body2"
          display={"block"}
          fontWeight={500}
          color={colors.alpha.neutral[800]}
        >
          {title || "NA"}
        </Typography>
        <Typography variant="body2">{subTitle}</Typography>
      </Stack>
    </Stack>
  );
};
