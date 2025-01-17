import { Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "./CustomisedButton";
import { CustomisedModal } from "./CustomisedModal";

interface PropsTypes {
  open: boolean;
  title: string;
  content: string;
  handleClose: () => void;
  handleConfirmation: (res: string) => void;
}
export const ConfirmationModal = (props: PropsTypes) => {
  const intl = useIntl();
  const { open, handleClose, handleConfirmation, title, content } = props;
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack spacing={1.5}>
        <Typography variant="h5">{title}</Typography>
        <Typography>{content}</Typography>
        <Stack
          direction={"row"}
          spacing={1}
          sx={{ justifyContent: "flex-end" }}
        >
          <CustomisedButton
            label="Cancel"
            handleClick={handleClose}
            variant="outlined"
          />
          <CustomisedButton
            label="Delete"
            handleClick={() => handleConfirmation("ok")}
          />
        </Stack>
      </Stack>
    </CustomisedModal>
  );
};
