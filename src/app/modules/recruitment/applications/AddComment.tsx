import { Stack, TextField, Typography } from "@mui/material";
import { CustomisedModal } from "../../components/CustomisedModal";
import { FC, memo, useEffect, useState } from "react";
import CustomisedButton from "../../components/CustomisedButton";
import { useDebounce } from "../../../hooks/useDebounce";

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
  const [value, setValue] = useState(comment);
  const debouncedValue = useDebounce(value);

  useEffect(() => {
    handleCommentChange(debouncedValue);
  }, [debouncedValue]);

  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack spacing={2}>
        <Typography variant="h5">Add Comment</Typography>
        <TextField
          value={value}
          name="comment"
          fullWidth
          multiline
          autoFocus={true}
          minRows={3}
          placeholder="Write Comment"
          type="text"
          required
          onChange={(event) => setValue(event.target.value)}
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
