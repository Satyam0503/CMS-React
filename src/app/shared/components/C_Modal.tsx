import Close from "@mui/icons-material/Close";
import Fullscreen from "@mui/icons-material/Fullscreen";
import FullscreenExit from "@mui/icons-material/FullscreenExit";
import { Breakpoint,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  SxProps,
  Theme,
  Zoom,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import clsx from "clsx";
import React, { useState } from "react";

import { AppIconButton } from "./ui";
type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  children: React.ReactNode;
  maxWidth?: Breakpoint;
  title?: React.ReactNode;
  // shows a maximize/restore toggle in the title bar; off by default so existing modals are unaffected
  allowMaximize?: boolean;
  // Lets complex forms opt into a wider responsive paper without changing the
  // sizing of every existing shared modal.
  paperSx?: SxProps<Theme>;
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
  const { open, handleClose, children, title, maxWidth = "md", allowMaximize = false, paperSx } = props;
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
        paper: {
          sx: isMaximized
            ? { maxWidth: "100%", width: "100%" }
            : paperSx,
        }
      }}
    >
      {
        title &&
        <DialogTitle className="d-flex justify-content-between align-items-center" variant="h5">
          {title}
          <Stack direction="row">
            {
              allowMaximize &&
              <AppIconButton
                aria-label={isMaximized ? "restore" : "maximize"}
                onClick={() => setIsMaximized(prev => !prev)}
                className="border-0"
              >
                {isMaximized ? <FullscreenExit /> : <Fullscreen />}
              </AppIconButton>
            }
            <AppIconButton
              aria-label="close"
              onClick={handleClose}
              className="border-0"
            >
              <Close />
            </AppIconButton>
          </Stack>
        </DialogTitle>
      }
      <DialogContent className={clsx({ "pt-2": Boolean(title) })}>{children}</DialogContent>
    </Dialog>
  );
};
