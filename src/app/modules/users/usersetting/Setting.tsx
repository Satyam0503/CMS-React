import {
  Add,
  Check,
  Download,
  Edit,
  Key,
  KeyOutlined,
  Sort,
  Visibility,
  VisibilityOff,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Card,
  colors,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import NotificationSetting from "./NotificationSetting";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { toAbsoluteUrl } from "../../../../_themes/helpers";

export default function Setting() {
  const intl = useIntl();
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [refresh, setRefresh] = useState(false);
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // const handleMouseDownPassword = (
  //   event: React.MouseEvent<HTMLButtonElement>
  // ) => {
  //   event.preventDefault();
  // };

  // const handleMouseUpPassword = (
  //   event: React.MouseEvent<HTMLButtonElement>
  // ) => {
  //   event.preventDefault();
  // };

  return (
    <>
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
            <Typography variant="h5">
              {intl.formatMessage({ id: "AUTH.INPUT.PASSWORD.RESET" })}
            </Typography>
          </Stack>
          <Stack>
            <CustomisedButton
              label={intl.formatMessage({ id: "AUTH.PASSWORD.RESET" })}
              Icon={<KeyOutlined />}
              iconPosition="start"
              handleClick={handleOpenModal}
            />
          </Stack>
        </Card>
      </Grid>

      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <Grid container p={4}>
          <Typography variant="h5" my={2}>
            {intl.formatMessage({ id: "AUTH.INPUT.PASSWORD.RESET" })}
          </Typography>
          <Grid container gap={3}>
            <Grid item xs={6} display={"flex"} flexDirection={"column"} gap={2}>
              <Stack>
                <TextField fullWidth label="Old Password" />
              </Stack>
              <Stack>
                <TextField fullWidth label="New Password" />
              </Stack>
              <Stack>
                <Stack>
                  <TextField
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={handleClickShowPassword}
                    sx={{ border: "none" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {showPassword ? (
                            <VisibilityOffOutlined />
                          ) : (
                            <VisibilityOutlined />
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Stack>
            </Grid>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              style={{ background: "grey" }}
            />
            <Grid item xs={4.5}>
              <img
                src={toAbsoluteUrl("media/auth/confirmation.svg")}
                width={"100%"}
                height={"100%"}
              />
            </Grid>
          </Grid>

          <Grid item xs={12} display={"flex"} justifyContent={"start"} gap={1}>
            <CustomisedButton
              label="Cancel"
              variant="outlined"
              handleClick={handleCloseModal}
            />
            <CustomisedButton
              label="Change Password"
              variant="contained"
              Icon={<Check />}
              iconPosition="start"
              handleClick={() => {
                setModalOpen(false);
              }}
            />
          </Grid>
        </Grid>
      </Dialog>
    </>
  );
}
