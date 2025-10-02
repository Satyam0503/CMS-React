import { Close } from "@mui/icons-material";
import { Breakpoint, Dialog, DialogContent, DialogTitle, IconButton, SxProps, Zoom } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import clsx from "clsx";
import React from "react";

type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  children: React.ReactNode;
  maxWidth?: Breakpoint;
  title?: string;
};
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Zoom in ref={ref} {...props} />;
});

export const CustomisedModal = (props: PropsTypes) => {
  const { open, handleClose, children, title, maxWidth = "md" } = props;
  return (
    <Dialog role="dialog" aria-modal={true} scroll="paper" open={open} onClose={handleClose} maxWidth={maxWidth} TransitionComponent={Transition} transitionDuration={500}>
      {
        title &&
        <DialogTitle className="d-flex justify-content-between align-items-center" variant="h5">
          {title}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            className="border-0"
          >
            <Close />
          </IconButton>
        </DialogTitle>
      }
      <DialogContent className={clsx({ "pt-2": Boolean(title) })}>{children}</DialogContent>
    </Dialog>
  );
};
