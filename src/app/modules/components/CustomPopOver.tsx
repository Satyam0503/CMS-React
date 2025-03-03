import { Close, Edit } from "@mui/icons-material";
import { IconButton, Popover, Stack, Typography } from "@mui/material";
import { FC } from "react";

interface PropsType {
  id?: string;
  open: boolean;
  anchorEl: null | Element;
  children?: React.ReactNode;
  handleClose: () => void;
}

export const CustomPopOver: FC<PropsType> = ({
  id,
  open,
  anchorEl,
  handleClose,
  children
}) => {
  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      elevation={20}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Stack direction={"row"} sx={{justifyContent:"space-between", alignItems:"center"}}>
        <Typography variant="h6">Filter</Typography>
        <IconButton className="border-0" onClick={handleClose}>
          <Close />
        </IconButton>
      </Stack>
      {children}
    </Popover>
  );
};
