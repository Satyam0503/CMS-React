import { Stack, Typography } from "@mui/material";
import { CustomisedModal } from "../../../../shared/components/C_Modal";
import { FC } from "react";
import CustomisedButton from "../../../../shared/components/C_Button";
import TextEditor from "../../../../shared/components/TextEditor";
import { useIntl } from "react-intl";

interface PropTypes {
  loading: boolean,
  open: boolean;
  comment: string;
  handleCommentChange: (value: string) => void;
  handleClose: () => void;
  handleAddComment: () => void;
  statusChange?: { from: string; to: string };
}
export const AddComment: FC<PropTypes> = ({
  loading,
  comment,
  handleCommentChange,
  open,
  handleClose,
  handleAddComment,
  statusChange,
}) => {
  const intl = useIntl();
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack spacing={2}>
        <Typography variant="h5">
          {statusChange ? "Confirm applicant status change" : intl.formatMessage({ id: "COMMENT.ADD_COMMENT" })}
        </Typography>
        {statusChange && (
          <Stack sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
            <Typography variant="body2" color="text.secondary">The applicant will move from</Typography>
            <Typography fontWeight={700}>{statusChange.from} → {statusChange.to}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              This action is recorded in the applicant history and cannot be moved backward.
            </Typography>
          </Stack>
        )}
        <TextEditor value={comment} setValue={(value) => handleCommentChange(value)} />
        <Stack direction={"row"} spacing={1} className="justify-content-end">
          <CustomisedButton
            variant="outlined"
            label={intl.formatMessage({ id: "BUTTON.CLOSE" })}
            handleClick={handleClose}
          />
          <CustomisedButton
            loading={loading}
            label={statusChange ? "Confirm change" : intl.formatMessage({ id: "BUTTON.ADD" })}
            disabled={!statusChange && comment.length === 0}
            handleClick={handleAddComment}
          />
        </Stack>
      </Stack>
    </CustomisedModal>
  );
};
