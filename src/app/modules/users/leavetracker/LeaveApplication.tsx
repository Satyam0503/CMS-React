import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { FC } from "react";

import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../components/CustomisedDatePicker";
import CustomisedButton from "../../components/CustomisedButton";
import { CustomisedModal } from "../../components/CustomisedModal";

export const LeaveApplication: FC = () => {
  const intl = useIntl();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [degree, setDegree] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setDegree(event.target.value as string);
  };
  return (
    <>
      <CustomisedButton
        variant="text"
        label="Leave Application"
        handleClick={handleOpen}
      />

      <CustomisedModal open={open} handleClose={handleClose}>
        <Stack>
          <Typography variant="h5">
            {intl.formatMessage({ id: "APPLICATION.LEAVE" })}
          </Typography>
        </Stack>
        <Grid container rowSpacing={1} columnSpacing={2} my={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "LEAVE.TYPE" })}
            </Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "LEAVE.AVAILABLE" })}
            </Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "APPLICATION.DURATION" })}
            </Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "APPLICATION.START" })}
            </Typography>
            <CustomisedDatePicker />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "APPLICATION.END" })}
            </Typography>
            <CustomisedDatePicker />
          </Grid>
          <Grid item xs={12} sm={12}>
            <CustomisedButton variant="outlined" label="Add" Icon={<Add />} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "APPLICATION.NOS" })}
            </Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "APPLICATION.REASON" })}
            </Typography>
            <TextField fullWidth />
          </Grid>
        </Grid>
        <Grid container display={"flex"} justifyContent={"end"} gap={1}>
          <CustomisedButton variant="outlined" label="Cancel" />
          <CustomisedButton variant="contained" label="Save" />
        </Grid>
      </CustomisedModal>
    </>
  );
};
