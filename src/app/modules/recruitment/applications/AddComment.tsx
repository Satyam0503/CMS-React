import { Stack, TextField, Typography } from "@mui/material";
import { CustomisedModal } from "../../components/CustomisedModal";
import { FC, useEffect, useState } from "react";
import CustomisedButton from "../../components/CustomisedButton";
import TextEditor from "../../components/TextEditor";

interface PropTypes {
  open: boolean;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
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
  const [debouncedValue, setDebouncedValue] = useState(comment);
  const handleChange = () => {
    setComment(debouncedValue);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleChange();
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [debouncedValue]);

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack spacing={2}>
        <Typography variant="h5">Add Comment</Typography>
        <TextField
          value={debouncedValue}
          name="comment"
          fullWidth
          multiline
          autoFocus={true}
          minRows={3}
          placeholder="Write Comment"
          type="text"
          required
          onChange={(event) => setDebouncedValue(event.target.value)}
        />

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
