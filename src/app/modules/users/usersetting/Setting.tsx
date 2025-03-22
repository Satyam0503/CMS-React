import { Add, Check, Download, Edit, Key, Sort } from "@mui/icons-material";
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
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";

export default function Setting() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const [refresh, setRefresh] = useState(false);

  return (
    <Grid container gap={2}>
      <Card sx={{ width: "100%", p: 2.25 }}>
        <Typography variant="h5">
          {intl.formatMessage({ id: "SETTING.NOTIFICATIONS" })}
        </Typography>
        <NotificationSetting />
      </Card>

      <Card
        sx={{
          width: "100%",
          p: 2.25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack>
          <Typography variant="h5" mb={2}>
            {intl.formatMessage({ id: "AUTH.INPUT.PASSWORD.RESET" })}
          </Typography>
        </Stack>
        <Stack>
          <CustomisedButton
            label="Reset Password"
            Icon={<Key />}
            iconPosition="end"
            handleClick={() => setModalOpen(true)}
          />
        </Stack>

        {/* <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">Old Password</Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">New Password</Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">Confirm Password</Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12} display={"flex"} justifyContent={"flex-end"}>
            <CustomisedButton
              label="Change Password"
              variant="contained"
              Icon={<Check />}
            />
          </Grid>
        </Grid> */}
      </Card>
    </Grid>
  );
}
