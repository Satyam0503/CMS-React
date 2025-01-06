import { Delete, Edit, Place, Visibility } from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { EmployeesDataTypes } from "./utils/common_types";
import CustomisedButton from "./app/modules/components/CustomisedButton";
import { CustomisedModal } from "./app/modules/components/CustomisedModal";

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

export const EmployeeTabTableColumnList = [
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
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "department",
    label: "Department",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "address",
    label: "Address",
    minWidth: 140,
    align: "left",
    build: (address: string) => <AddressDetailsIcon address={address} />,
  },
  {
    id: "action",
    label: "Address",
    minWidth: 140,
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
        <IconButton onClick={() => handleEdit(row)}>
          <Edit />
        </IconButton>
      )}
      {openConfirmationModal && (
        <IconButton onClick={() => openConfirmationModal(row.id)}>
          <Delete />
        </IconButton>
      )}
      {openViewModal && (
        <IconButton onClick={() => openViewModal(row.id)}>
          <Visibility />
        </IconButton>
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
      <IconButton onClick={() => setOpen(true)}>
        <Place />
      </IconButton>
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
