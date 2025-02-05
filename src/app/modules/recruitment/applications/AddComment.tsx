import { Stack, Typography } from "@mui/material";
import { CustomisedModal } from "../../components/CustomisedModal";
import { FC } from "react";
import CustomisedButton from "../../components/CustomisedButton";
import TextEditor from "../../components/TextEditor";

interface PropTypes {
  open: boolean;
  comment:string;
  setComment:React.Dispatch<React.SetStateAction<string>>
  handleClose: () => void;
  handleAddComment: () => void;
}
export const AddComment: FC<PropTypes> = ({
  comment,
  setComment,
  open,
  handleClose,
  handleAddComment,
}) => {
  
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack spacing={2}>
        <Typography variant="h5">Add Comment</Typography>
        <TextEditor value={comment} setValue={setComment} />
        <Stack direction={"row"} spacing={1} justifyContent={"flex-end"}>
          <CustomisedButton variant="outlined" label="Cancel" handleClick={handleClose} />
          <CustomisedButton
            label="Add"
            disabled={comment.length===0}
            handleClick={handleAddComment}
          />
        </Stack>
      </Stack>
    </CustomisedModal>
  );
};
