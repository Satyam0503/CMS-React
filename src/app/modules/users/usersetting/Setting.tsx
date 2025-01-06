import { Add, Check, Download, Edit, Sort } from "@mui/icons-material";
import {
  Card,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import NotificationSetting from "./NotificationSetting";
import CustomisedButton from "../../components/CustomisedButton";

export default function Setting() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid container>
      <Card sx={{ width: "100%", my: 2, p: 3 }}>
        <Typography variant="h5">
          {intl.formatMessage({ id: "SETTING.NOTIFICATION" })}
        </Typography>
        <NotificationSetting />
      </Card>

      <Card sx={{ width: "100%", p: 4 }}>
        <Typography variant="h5">
          {intl.formatMessage({ id: "AUTH.INPUT.PASSWORD" })}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1">Old Password</Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">New Password</Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12} display={"flex"} justifyContent={"flex-end"}>
            <CustomisedButton
              label="Change Password"
              variant="contained"
              Icon={<Check />}
            />
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
}
