import { Breakpoint, Dialog, DialogContent, SxProps, Zoom } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";

type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: Breakpoint;
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
    <Dialog open={open} onClose={handleClose} maxWidth={maxWidth} TransitionComponent={Transition} transitionDuration={500} aria-modal="true">
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};
