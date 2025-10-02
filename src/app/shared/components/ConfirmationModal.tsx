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
  ok_btn?: boolean;
}
export const ConfirmationModal = (props: PropsTypes) => {
  const { formatMessage: i } = useIntl();
  const { open, handleClose, handleConfirmation, title, content, ok_btn = false } = props;
  return (
    <CustomisedModal open={open} handleClose={handleClose} maxWidth="sm">
      <Stack spacing={1.5}>
        <Typography variant="h5">{title}</Typography>
        <Typography>{content}</Typography>
        <Stack direction="row" spacing={1} justifyContent={"flex-end"}>
          <CustomisedButton
            label={i({ id: "BUTTON.CANCEL" })}
            handleClick={handleClose}
            variant="outlined"
          />
          <CustomisedButton
            label={i({ id: ok_btn ? "BUTTON.OK" : "BUTTON.DELETE" })}
            handleClick={() => handleConfirmation("ok")}
          />
        </Stack>
      </Stack>
    </CustomisedModal>
  );
};
