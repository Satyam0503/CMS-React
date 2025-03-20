import { Stack, Typography } from "@mui/material";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { FC} from "react";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import TextEditor from "../../../../shared/components/TextEditor";

interface PropTypes {
  open: boolean;
  comment: string;
  handleCommentChange: (value: string) => void;
  handleClose: () => void;
  handleAddComment: () => void;
}
export const AddComment: FC<PropTypes> = ({
  comment,
  handleCommentChange,
  open,
  handleClose,
  handleAddComment,
}) => {

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack spacing={2}>
        <Typography variant="h5">Add Comment</Typography>
        <TextEditor value={comment} setValue={(value)=>handleCommentChange(value)} />
        <Stack direction={"row"} spacing={1} justifyContent={"flex-end"}>
          <CustomisedButton
            variant="outlined"
            label="Cancel"
            handleClick={handleClose}
          />
          <CustomisedButton
            label="Add"
            disabled={comment.length === 0}
            handleClick={handleAddComment}
          />
        </Stack>
      </Stack>
    </CustomisedModal>
  );
};
