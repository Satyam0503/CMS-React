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
import CustomisedDatePicker from "../../components/CustomisedDatePicker";
import CustomisedButton from "../../components/CustomisedButton";
import { CustomisedModal } from "../../components/CustomisedModal";
import { CustomIconButton } from "../../components/CustomIconButton";

export default function AddLeaves() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid container>
      <CustomisedButton
        variant="text"
        size="medium"
        label="Add leave"
        Icon={<Add sx={{ px: "2px" }} />}
        handleClick={() => setOpen(true)}
      />

      <CustomisedModal open={open} handleClose={handleClose}>
        <Grid item xs={12} mb={2}>
          <Typography variant="h5">
            {intl.formatMessage({ id: "ADD.EMP.LEAVE" })}
          </Typography>
        </Grid>
        <Grid container rowSpacing={1} columnSpacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "AUTH.INPUT.FULLNAME" })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "FORM.TITLE" })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.DEPT" })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "AUTH.INPUT.EMAIL",
              })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "LEAVE.TYPE",
              })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "LEAVE.REMAINING",
              })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>

          <Grid
            item
            xs={12}
            display={"flex"}
            flexDirection={{ xs: "column", md: "row" }}
            gap={2}
          >
            <Grid item xs={12} md={3.4}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "APPLICATION.DURATION" })}
              </Typography>
              <Select fullWidth id="outlined-basic" variant="outlined">
                <MenuItem>Full day</MenuItem>
                <MenuItem>Half Day</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={3.4}>
              <Typography variant="body1">
                {intl.formatMessage({
                  id: "APPLICATION.START",
                })}
              </Typography>
              <CustomisedDatePicker />
            </Grid>
            <Grid item xs={12} md={3.4}>
              <Typography variant="body1">
                {intl.formatMessage({
                  id: "APPLICATION.END",
                })}
              </Typography>
              <CustomisedDatePicker />
            </Grid>
            <Grid item xs={0.8} alignContent={"end"}>
              <IconButton size="large" sx={{ width: "40px", height: "40px" }}>
                <Add />
              </IconButton>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "APPLICATION.REASON",
              })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>

          <Grid
            item
            xs={12}
            display={"flex"}
            justifyContent={"flex-end"}
            gap={1}
            mt={1}
          >
            <CustomisedButton variant="outlined" size="medium" label="Cancel" />
            <CustomisedButton
              variant="contained"
              size="medium"
              label="Apply"
              Icon={<Check />}
            />
          </Grid>
        </Grid>
      </CustomisedModal>
    </Grid>
  );
}
