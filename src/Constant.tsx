import {
  Delete,
  DeleteOutline,
  DeleteOutlineOutlined,
  Edit,
  Place,
  Visibility,
} from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { EmployeeModel } from "./utils/common_types";
import { CustomIconButton } from "./app/modules/components/CustomIconButton";





enum cellContentAlignment {
  LEFT = "left",
  RIGHT = "right",
  CENTER = "center",
  JUSTIFY = "justify",
}


export const EmployeeLeaves = [
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
    id: "type",
    label: "Type",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "from",
    label: "From",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "to",
    label: "To",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "remaining",
    label: "Remaining",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "reason",
    label: "Reason",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "status",
    label: "Status",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "action",
    label: "Address",
    minWidth: 140,
    align: "left",
    build: (
      row: EmployeeModel,
      handleEmployeeEdit: (row: EmployeeModel) => void
    ) => <ActionComponent row={row} handleEdit={handleEmployeeEdit} />,
  },
];
export const EmployeeAbsentSummary = [
  {
    id: "date",
    label: "Date",
    minWidth: 50,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "absent",
    label: "Absent",
    minWidth: 180,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "firsthalf",
    label: "First Half",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "second half",
    label: "Seconf Half",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "wfh",
    label: "Work from Home",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "total",
    label: "Total",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },

  {
    id: "action",
    label: "Action",
    minWidth: 140,
    align: "left",
    build: (
      row: EmployeeModel,
      handleEmployeeEdit: (row: EmployeeModel) => void
    ) => <ActionComponent row={row} handleEdit={handleEmployeeEdit} />,
  },
];
export const AbsentSummary = [
  {
    id: "sno",
    label: "#",
    minWidth: 50,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "name",
    label: "Name",
    minWidth: 180,
    align: cellContentAlignment.LEFT,
  },
  {
    id: "absent",
    label: "Absent",
    minWidth: 140,
    align: cellContentAlignment.LEFT,
  },
];

interface ActionComponentProps<Row> {
  row: Row;
  handleEdit?: (row: Row) => void;
}
const ActionComponent = <Row,>(props: ActionComponentProps<Row>) => {
  const { row, handleEdit } = props;
  return (
    <Stack direction={"row"} spacing={1}>
      {handleEdit && (
        <CustomIconButton icon={<Edit />} handleClick={() => handleEdit(row)} />
      )}
      <CustomIconButton icon={<DeleteOutlineOutlined />} />
      <CustomIconButton icon={<Visibility />} />
    </Stack>
  );
};
