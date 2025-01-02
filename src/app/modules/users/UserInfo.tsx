import { Check, Edit } from "@mui/icons-material";
import {
  Grid,
  TextField,
  Button,
  Stack,
  Modal,
  Box,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import React from "react";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../components/CustomisedDatePicker";
import { Dayjs } from "dayjs";
import CustomisedButton from "../components/CustomisedButton";

export default function UserInfo() {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
  };

  const intl = useIntl();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid>
      <Stack
        onClick={() => handleOpen()}
        className="btn btn-sm bg-white border btn-active-light-primary p-1"
      >
        <Edit />
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Grid container className="d-flex mt-2">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5" className="text-primary mb-2">
                  {intl.formatMessage({ id: "PROFILE.PI" })}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                </Typography>
                <TextField fullWidth id="outlined-basic" variant="outlined" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.PHONE" })}
                </Typography>
                <TextField fullWidth id="outlined-basic" variant="outlined" />
              </Grid>

              <Grid item xs={12} md={6} className="pt-2">
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.DOB" })}
                </Typography>
                <CustomisedDatePicker
                  sx={{ width: "100%" }}
                  setValue={function (newDate: Dayjs | null): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.GENDER" })}
                </Typography>
                <Select fullWidth id="outlined-basic" variant="outlined">
                  <MenuItem>Male</MenuItem>
                  <MenuItem>Female</MenuItem>
                  <MenuItem>Other</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "TRANSLATOR.LANGUAGES" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({
                    id: "USER.PERSONAL_EMAIL",
                  })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({
                    id: "USER.EMERGENCY_CONTACT",
                  })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {intl.formatMessage({
                    id: "USER.BLOOD_GROUP",
                  })}
                </Typography>
                <Select fullWidth id="outlined-basic" variant="outlined">
                  <MenuItem>O+</MenuItem>
                  <MenuItem>A+</MenuItem>
                  <MenuItem>B+</MenuItem>
                  <MenuItem>AB+</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  {intl.formatMessage({
                    id: "USER.ADDRESS",
                  })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <CustomisedButton
                  variant="outlined"
                  size="medium"
                  label="Cancel"
                />
                <CustomisedButton
                  variant="contained"
                  size="medium"
                  label="Save"
                  Icon={<Check />}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Grid>
  );
}
