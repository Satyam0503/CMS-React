import { Stack } from "@mui/material";
import { CustomIconButton } from "./CustomIconButton";
import { DeleteOutlineOutlined, Edit, Visibility } from "@mui/icons-material";

interface ActionComponentProps<Row> {
  row: Row;
  handleEdit?: (row: Row) => void;
  openConfirmationModal?: (row: Row) => void;
  openViewModal?: (row: Row) => void;
}
export const ActionComponent = <Row,>(props: ActionComponentProps<Row>) => {
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
