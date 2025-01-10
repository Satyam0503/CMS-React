import { Delete, Edit, Place, Visibility } from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import {
  ColumnListTypes,
  EmployeesDataTypes,
  RolesType,
} from "./utils/common_types";
import CustomisedButton from "./app/modules/components/CustomisedButton";
import { CustomisedModal } from "./app/modules/components/CustomisedModal";
import { dateFormatter } from "./utils/common";
import { CustomIconButton } from "./app/modules/components/CustomIconButton";

export const BaseUrl =
  import.meta.env.VITE_BASEURL || "http://localhost:3000/api";

export const ServiceUrl = {
  GET_ALL_ROLES: `${BaseUrl}/users/getAllRole`,
  ADD_UPDATE_EMPLOYEE: `${BaseUrl}/employees/addEmployeeDetails`,
  GET_ALL_EMPLOYEE: `${BaseUrl}/employees/getAllEmployees`,
  DELETE_EMPLOYEE: `${BaseUrl}/employees/deleteEmployee`,
  GET_EMPLOYEE_DETAILS: `${BaseUrl}/employees/getEmployee`,
  UPDATE_USER_AVATAR: `${BaseUrl}/users/updateAvatarImage`,
  ADD_UPDATE_USER_SUMMARY: `${BaseUrl}/employees/addEmployeeSummary`,
  UPDATE_USER_DETAILS: `${BaseUrl}/employees/addEmployeeDetails`,
  ADD_USER_SKILLS: `${BaseUrl}/employees/addEmployeeSkills`,
  ADD_USER_EDUCATION: `${BaseUrl}/employees/addEmployeeEducation`,
  ADD_USER_CERTIFICATION: `${BaseUrl}/employees/addEmployeeCertificates`,
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

enum cellContentAlignment {
  LEFT = "left",
  RIGHT = "right",
  CENTER = "center",
  JUSTIFY = "justify",
}

export const EmployeeTabTableColumnList: ColumnListTypes[] = [
  {
    id: "serialNo",
    label: "#",
    minWidth: 30,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "name",
    label: "Name",
    minWidth: 180,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "email",
    label: "Email",
    align: cellContentAlignment.LEFT,
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
    align: cellContentAlignment.LEFT,
  },
  {
    id: "department",
    label: "Department",
    align: cellContentAlignment.LEFT,
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
      row: EmployeesDataTypes,
      handleEmployeeEdit: (row: EmployeesDataTypes) => void,
      openConfirmationModal: (id: string) => void,
      openViewModal: (id: string) => void
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

// export const DashBoardLeaveTableColumnList:ColumnListTypes[] = [
//   {
//     id: "serialNo",
//     label:"#",
//   },
//   {
//     id:"type",
//     label:"Type",
//   },
//   {
//     id:"count",
//     label:"Count"
//   },
//   {
//     id:"reason",
//     label:"Reaseon"
//   },
//   {
//     id:"status",
//     label:"Status"
//   },
//   {
//     id:"action",
//     label:"Action",
//     build:(
//       row:any,
//       handleEdit:()=>void,
//       openConfirmationModal:(leaveId:string)=>void
//     )=>{
//       <ActionComponent
//         row={row}
//         handleEdit={handleEdit}
//         openConfirmationModal={openConfirmationModal}
//       />
//     }
//   }
// ];

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
    build: (row: RolesType, handleEdit: (role: RolesType) => void) => (
      <CustomisedButton label="Edit Permission" handleClick={()=>handleEdit(row)} />
    ),
  },
];

interface ActionComponentProps<Row> {
  row: Row;
  handleEdit?: (row: Row) => void;
  openConfirmationModal?: (id: string) => void;
  openViewModal?: (id: string) => void;
}
const ActionComponent = <Row extends { id: string }>(
  props: ActionComponentProps<Row>
) => {
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
          handleClick={() => openConfirmationModal(row.id)}
          icon={<Delete />}
          tooltip="Delete"
          ariaLabel="Delete"
        />
      )}
      {openViewModal && (
        <CustomIconButton
          handleClick={() => openViewModal(row.id)}
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
