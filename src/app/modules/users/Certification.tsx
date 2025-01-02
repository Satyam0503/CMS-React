import { Add, Check, Download, Edit, Sort } from "@mui/icons-material";
import {
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
import { CustomisedModal } from "../components/CustomisedModal";
import CustomisedButton from "../components/CustomisedButton";
import CustomisedDatePicker from "../components/CustomisedDatePicker";

export default function Certification() {
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
        <Grid container className="d-flex mt-2">
          <Stack>
            <Typography variant="h5" className="text-primary mb-2">
              {intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "INFO.TITLE" })}
              </Typography>
              <TextField fullWidth id="outlined-basic" variant="outlined" />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({
                  id: "APPLICATION.START",
                })}
              </Typography>
              <CustomisedDatePicker />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({
                  id: "APPLICATION.END",
                })}
              </Typography>
              <CustomisedDatePicker />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({
                  id: "MENU.ORGNIZATION.NAME",
                })}
              </Typography>
              <TextField fullWidth id="outlined-basic" variant="outlined" />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.MODE" })}
              </Typography>
              <Select fullWidth id="outlined-basic" variant="outlined">
                <MenuItem>Online</MenuItem>
                <MenuItem>Offline</MenuItem>
              </Select>
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
                variant="outlined"
                size="medium"
                label="Add New"
                Icon={<Add />}
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
      </CustomisedModal>
    </Grid>
  );
}
