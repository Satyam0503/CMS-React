import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export const CustomisedModal = (props: PropsTypes) => {
  const { open, handleClose, children, title } = props;
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={"md"}
      aria-modal
      sx={{ "& .MuiDialog-paper": { minWidth: 300 } }}
    >
      {/* {/* <DialogTitle>{title}</DialogTitle> */}
      <DialogContent>{children}</DialogContent>
      {/* <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={hand}>Close</Button>
      </DialogActions> */}
    </Dialog>
  );
};
