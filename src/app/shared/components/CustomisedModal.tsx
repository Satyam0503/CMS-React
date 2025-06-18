import { Breakpoint, Dialog, DialogContent, SxProps } from "@mui/material";

type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: Breakpoint;
};

export const CustomisedModal = (props: PropsTypes) => {
  const { open, handleClose, children, title, maxWidth = "md" } = props;
  return (
    <Dialog open={open} onClose={handleClose} maxWidth={maxWidth} aria-modal>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};
