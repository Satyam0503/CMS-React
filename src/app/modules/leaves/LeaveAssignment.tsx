import { Add, Check, Download, Edit, Person, Sort } from "@mui/icons-material";
import {
  Box,
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

export default function LeaveAssignment() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid container>
      <CustomisedButton
        variant="text"
        size="medium"
        label="Leave Assignment"
        Icon={<Person sx={{ px: "2px" }} />}
        handleClick={() => setOpen(true)}
      />
      <CustomisedModal open={open} handleClose={handleClose}>
        <Grid container spacing={3} alignItems={"end"}>
          <Grid item xs={12}>
            <Typography variant="h5">
              {intl.formatMessage({ id: "LEAVE.ASSIGNMENT" })}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "SELECT.EMP" })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.EMP_ID" })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "LEAVE.CL" })}
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
                id: "LEAVE.ML",
              })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "LEAVE.EL",
              })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "LEAVE.UNPAID",
              })}
            </Typography>
            <TextField fullWidth id="outlined-basic" variant="outlined" />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "USER.DOJ",
              })}
            </Typography>
            <CustomisedDatePicker />
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
              {intl.formatMessage({ id: "USER.ROLE" })}
            </Typography>
            <Select fullWidth id="outlined-basic" variant="outlined">
              <MenuItem>Tester</MenuItem>
              <MenuItem>Backend Developer</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.DEPARTMENT" })}
            </Typography>
            <Select fullWidth id="outlined-basic" variant="outlined">
              <MenuItem>Testing</MenuItem>
              <MenuItem>Development</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.DEPARTMENT" })}
            </Typography>
            <Select fullWidth id="outlined-basic" variant="outlined">
              <MenuItem>Testing</MenuItem>
              <MenuItem>Development</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
            </Typography>
            <Select fullWidth id="outlined-basic" variant="outlined">
              <MenuItem>Sanjay</MenuItem>
              <MenuItem>Seema</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.TEAM_LEAD" })}
            </Typography>
            <Select fullWidth id="outlined-basic" variant="outlined">
              <MenuItem>Sohan</MenuItem>
              <MenuItem>Sameeer</MenuItem>
            </Select>
          </Grid>
          <Grid
            item
            xs={12}
            display={"flex"}
            justifyContent={"flex-end"}
            mt={1}
            gap={1}
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
