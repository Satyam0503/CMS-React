import { Stack, Typography } from "@mui/material";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { FC } from "react";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import TextEditor from "../../../../shared/components/TextEditor";
import { useIntl } from "react-intl";

interface PropTypes {
  loading: boolean,
  open: boolean;
  comment: string;
  handleCommentChange: (value: string) => void;
  handleClose: () => void;
  handleAddComment: () => void;
}
export const AddComment: FC<PropTypes> = ({
  loading,
  comment,
  handleCommentChange,
  open,
  handleClose,
  handleAddComment,
}) => {
  const intl = useIntl();
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack spacing={2}>
        <Typography variant="h5">{intl.formatMessage({ id: "COMMENT.ADD_COMMENT" })}</Typography>
        <TextEditor value={comment} setValue={(value) => handleCommentChange(value)} />
        <Stack direction={"row"} spacing={1} className="justify-content-end">
          <CustomisedButton
            variant="outlined"
            label={intl.formatMessage({ id: "BUTTON.CLOSE" })}
            handleClick={handleClose}
          />
          <CustomisedButton
            loading={loading}
            label={intl.formatMessage({ id: "BUTTON.ADD" })}
            disabled={comment.length === 0}
            handleClick={handleAddComment}
          />
        </Stack>
      </Stack>
    </CustomisedModal>
  );
};
