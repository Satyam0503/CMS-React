import { Stack } from "@mui/material";
import { CustomIconButton } from "./C_IconButton";
import {
  AssignmentOutlined,
  DeleteOutlineOutlined,
  Edit,
} from "@mui/icons-material";
import { LinkOff } from "@mui/icons-material";
interface ActionComponentProps<Row> {
  row: Row;
  handleEdit?: (row: Row) => void;
  openConfirmationModal?: (row: Row) => void;
  openViewModal?: (row: Row) => void;
  openUnlinkModal?: (row: Row) => void;
}
export const ActionComponent = <Row,>(props: ActionComponentProps<Row>) => {
  const { row, handleEdit, openConfirmationModal, openViewModal, openUnlinkModal } = props;

  return (
    <Stack direction={"row"} spacing={1}>
      {handleEdit && (
        <CustomIconButton
          handleClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}
          icon={<Edit />}
          tooltip="Edit"
          ariaLabel="Edit"
        />
      )}
      {
        openUnlinkModal &&(
          <CustomIconButton handleClick={(e)=>{
            e.stopPropagation();
            openUnlinkModal(row);
          }}
          icon={<LinkOff color="warning" />}
          tooltip="Unlink lifecycle policy"
          ariaLabel="Unlink lifecycle policy"
          />
        )
      }
      {openConfirmationModal && (
        <CustomIconButton
          handleClick={(e) => {
            e.stopPropagation();
            openConfirmationModal(row);
          }}
          icon={<DeleteOutlineOutlined color="error" />}
          tooltip="Delete"
          ariaLabel="Delete"
        />
      )}
      {openViewModal && (
        <CustomIconButton
          classNames="border-0"
          handleClick={(e) => {
            e.stopPropagation();
            openViewModal(row);
          }}
          icon={<AssignmentOutlined />}
          tooltip="View"
          ariaLabel="View"
        />
      )}
    </Stack>
  );
};
