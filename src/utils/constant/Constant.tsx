import {
  Delete,
  DeleteOutlineOutlined,
  Download,
  Edit,
  Place,
  Visibility,
} from "@mui/icons-material";
import { Avatar, Button, IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import {
  ColumnListTypes,
  EmployeeModel,
  JobModal,
  RolesType,
} from "../common_types";
import {
  dateFormatter,
  applicationStatusDecoder,
  statusDecoder,
} from "../common";
import CustomisedButton from "../../app/modules/components/CustomisedButton";
import { CustomIconButton } from "../../app/modules/components/CustomIconButton";
import { CustomisedModal } from "../../app/modules/components/CustomisedModal";
import { Link } from "react-router-dom";
import { StyleStatus } from "../../app/modules/components/StyledStatus";

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
  GET_EMPLOYEE_DETAILS:`${BaseUrl}/api/User/GetEmployeeById`,
  GET_ALL_EMPLOYEE: `${BaseUrl}/api/User/GetAllEmployees`,
  ADD_EMPLOYEE: `${BaseUrl}/api/User/AddEmployees`,
  UPDATE_EMPLOYEE: `${BaseUrl}/api/User/EditEmployees`,

  GET_EMPLOYEE_CERTIFICATIONS:`${BaseUrl}/api/User/GetEmployeeCertificationDetails`,
  GET_EMPLOYEE_EDUCATIONS:`${BaseUrl}/api/User/GetEmployeeEducationDetails`,
  GET_EMPLOYEE_SUMMARY:`${BaseUrl}/api/User/GetEmployeeSummary`,

  
  ADD_EMPLOYEE_EDUCATION: `${BaseUrl}/api/User/AddEmployeeEducation`,
  ADD_EMPLOYEE_CERTIFICATION: `${BaseUrl}/api/User/AddEmployeeCertification`,
  
  UPDATE_EMPLOYEE_SUMMARY:`${BaseUrl}/api/User/AddEditEmployeeSummary`,
  
  // jobs
  ADD_JOB_VACANCY: `${BaseUrl}/api/JobVacancy/AddJobVacancy`,
  EDIT_JOB_VACANCY: `${BaseUrl}/api/JobVacancy/EditJobVacancy`,
  GET_ALL_JOBS: `${BaseUrl}/api/JobVacancy/GetAllVacancy`,
  
  // not working
  UPDATE_EMPLOYEE_SKILLS:`${BaseUrl}/api/User/AddEmployeeSkills`,
  DELETE_EMPLOYEE: `${BaseUrl}/employees/deleteEmployee`,
  GET_EMPLOYEE_SKILLS:`${BaseUrl}/api/User/GetEmployeeSkills`,

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
    id: "jobTitle",
    label: "Job Title",
    minWidth: 180,
    avatarCell: (row: any) => {
      const applicantName = row.firstName + " " + row.lastName;
      const vacancyName = row.vacanyName;
      return <AvatarCell title={applicantName} subTitle={vacancyName} />;
    },
  },
  {
    id: "exprience",
    label: "Experience",
  },
  {
    id: "applyDate",
    label: "Applied",
    format: (value) => dateFormatter(value, "DD MMM YYYY"),
  },
  {
    id: "location",
    label: "Location",
  },
  {
    id: "noticePeriod",
    label: "Notice Period",
  },
  {
    id: "status",
    label: "Status",
    build: (status: number) => {
      const values = applicationStatusDecoder(status);
      const className =
        values === "Pending"
          ? "warning"
          : values === "Shortlisted"
          ? "success"
          : "danger";
      return <StyleStatus label={values} className={className} />;
    },
  },
  {
    id: "action",
    label: "Action",
    build: (
      row: any,
      handleApplicationEdit: (row: any) => void,
      openConfirmationModal: (row: any) => void,
      openViewApplication: (row: any) => void,
      handleResumeDownload: (row: any) => void
    ) => (
      <ActionComponent
        row={row}
        handleEdit={handleApplicationEdit}
        openConfirmationModal={openConfirmationModal}
        openViewModal={openViewApplication}
        handleDownload={handleResumeDownload}
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
    id: "jobTitle",
    label: "Job Title",
    minWidth: 180,
    avatarCell: (row: JobModal) => {
      return <AvatarCell title={row.title} subTitle={row.jobType} />;
    },
  },
  {
    id: "vacancies",
    label: "No of Position",
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

interface ActionComponentProps<Row> {
  row: Row;
  handleEdit?: (row: Row) => void;
  openConfirmationModal?: (row: Row) => void;
  openViewModal?: (row: Row) => void;
  handleDownload?: (row: Row) => void;
}
const ActionComponent = <Row,>(props: ActionComponentProps<Row>) => {
  const {
    row,
    handleEdit,
    openConfirmationModal,
    openViewModal,
    handleDownload,
  } = props;
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
      {handleDownload && (
        <CustomIconButton
          handleClick={() => handleDownload(row)}
          icon={<Download />}
          tooltip="Download"
          ariaLabel="Download"
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
      <Stack direction="column">
        <Typography variant="body1" className="fw-semibold d-block">
          {title || "NA"}
        </Typography>
        <Typography variant="body2" className="text-muted">
          {subTitle || "NA"}
        </Typography>
      </Stack>
    </Stack>
  );
};
