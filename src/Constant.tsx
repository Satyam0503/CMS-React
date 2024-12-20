import { Delete, Edit, Place, Visibility } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { EmployeesDataTypes } from "./common_types";

export const BaseUrl = import.meta.env.VITE_BASEURL || 'http://localhost:3000/api';

export const ServiceUrl = {
    ADD_UPDATE_EMPLOYEE: `${BaseUrl}/employees/addEmployeeDetails`,
    GET_ALL_ROLES: `${BaseUrl}/users/getAllRole`,
    GET_ALL_EMPLOYEE: `${BaseUrl}/employees/getAllEmployees`,
}

export const Gender = [
    {
        id: 1,
        label: "Male",
        value: "male"
    },
    {
        id: 2,
        label: "Female",
        value: "female"
    },
    {
        id: 3,
        label: "Other",
        value: "other"
    }
];

export const bloodGroups = [
    { id: 1, label: 'A+', value: 'A+' },
    { id: 2, label: 'A-', value: 'A-' },
    { id: 3, label: 'B+', value: 'B+' },
    { id: 4, label: 'B-', value: 'B-' },
    { id: 5, label: 'AB+', value: 'AB+' },
    { id: 6, label: 'AB-', value: 'AB-' },
    { id: 7, label: 'O+', value: 'O+' },
    { id: 8, label: 'O-', value: 'O-' }
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
        build: (address: string) => (
            <AddressDetailsIcon address={address} />
        )
    },
    {
        id: "action",
        label: "Address",
        minWidth: 140,
        align: "left",
        build: (row: EmployeesDataTypes, handleEmployeeEdit: (row: EmployeesDataTypes) => void) => (
            <ActionComponent row={row} handleEdit={handleEmployeeEdit} />
        )
    },
]

interface ActionComponentProps<Row,> {
    row: Row,
    handleEdit?: (row: Row) => void
}
const ActionComponent = <Row,>(props: ActionComponentProps<Row>) => {
    const { row, handleEdit } = props;
    return (
        <Stack direction={"row"} spacing={1}>
            {
                handleEdit &&
                <IconButton onClick={()=>handleEdit(row)}>
                    <Edit />
                </IconButton>
            }
            <IconButton>
                <Delete />
            </IconButton>
            <IconButton>
                <Visibility />
            </IconButton>
        </Stack>
    )
}


const AddressDetailsIcon = (props: { address: string }) => {
    const [open, setOpen] = useState(false);
    function handleClose() {
        setOpen(false)
    }
    return (
        <>
            <IconButton onClick={() => setOpen(true)}>
                <Place />
            </IconButton>
            <Dialog onClose={handleClose} open={open} aria-modal maxWidth={"sm"} sx={{ "& .MuiDialog-paper": { minWidth: 250 } }}>
                <DialogTitle>Address</DialogTitle>
                <DialogContent>
                    <Typography>{props.address}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
