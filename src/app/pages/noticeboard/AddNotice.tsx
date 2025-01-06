import {
  Add,
  EditOutlined,
  FileOpenOutlined,
  LinkOutlined,
  Visibility,
} from "@mui/icons-material";
import { Grid, IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../modules/components/CustomisedModal";
import CustomisedButton from "../../modules/components/CustomisedButton";

export default function AddNotice() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid container>
      <IconButton onClick={() => setOpen(true)}>
        <Add />
      </IconButton>
      <CustomisedModal open={open} handleClose={handleClose}>
        hii
      </CustomisedModal>
    </Grid>
  );
}
