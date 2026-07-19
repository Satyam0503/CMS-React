import { Close, Fullscreen, FullscreenExit } from "@mui/icons-material";
import { Breakpoint, Dialog, DialogContent, DialogTitle, IconButton, Stack, Zoom } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import clsx from "clsx";
import React, { useState } from "react";

type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  children: React.ReactNode;
  maxWidth?: Breakpoint;
  title?: string;
  // shows a maximize/restore toggle in the title bar; off by default so existing modals are unaffected
  allowMaximize?: boolean;
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
  const { open, handleClose, children, title, maxWidth = "md", allowMaximize = false } = props;
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <Dialog role="dialog" aria-modal={true} scroll="paper" open={open} onClose={handleClose}
      maxWidth={isMaximized ? false : maxWidth} fullScreen={isMaximized} fullWidth={isMaximized} transitionDuration={500}
      slots={{
        transition: Transition
      }}
      slotProps={{
        // the theme's MuiDialog styleOverrides hardcode paper maxWidth: 720px, which otherwise
        // wins over the maxWidth/fullWidth/fullScreen props above and caps the maximized width
        paper: isMaximized ? { sx: { maxWidth: "100%", width: "100%" } } : undefined
      }}
    >
      {
        title &&
        <DialogTitle className="d-flex justify-content-between align-items-center" variant="h5">
          {title}
          <Stack direction="row">
            {
              allowMaximize &&
              <IconButton
                aria-label={isMaximized ? "restore" : "maximize"}
                onClick={() => setIsMaximized(prev => !prev)}
                className="border-0"
              >
                {isMaximized ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            }
            <IconButton
              aria-label="close"
              onClick={handleClose}
              className="border-0"
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
      }
      <DialogContent className={clsx({ "pt-2": Boolean(title) })}>{children}</DialogContent>
    </Dialog>
  );
};
