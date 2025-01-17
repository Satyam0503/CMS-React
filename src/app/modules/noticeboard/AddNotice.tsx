import {
  Add,
  EditOutlined,
  FileOpenOutlined,
  LinkOutlined,
  Send,
  Telegram,
  Visibility,
} from "@mui/icons-material";
import {
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../modules/components/CustomisedModal";
import CustomisedButton from "../../modules/components/CustomisedButton";
import CustomisedDatePicker from "../../modules/components/CustomisedDatePicker";

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
        <Typography variant="h5">
          {intl.formatMessage({ id: "MENU.POST_NOTICE" })}
        </Typography>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "FORM.TYPE" })}*
              </Typography>
              <Select fullWidth variant="outlined">
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Offline">Offline</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "USER.TARGET" })}*
              </Typography>
              <Select fullWidth variant="outlined">
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Offline">Offline</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "USER.GROUP" })}*
              </Typography>
              <Select fullWidth variant="outlined">
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Offline">Offline</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "MENU.MESSAGE" })}
              </Typography>
              <TextField fullWidth />
            </Grid>
          </Grid>
          <Stack
            direction={"row"}
            spacing={1}
            className="justify-content-end mt-4"
          >
            <CustomisedButton
              label="Cancel"
              handleClick={handleClose}
              variant="outlined"
            />
            <CustomisedButton label="Publish" type="submit" Icon={<Send />} />
          </Stack>
        </form>
      </CustomisedModal>
    </Grid>
  );
}
