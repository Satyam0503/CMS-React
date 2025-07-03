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
import CustomisedDatePicker from "../../../../shared/components/CustomisedDatePicker";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { TextInput } from "../../../../shared/components/form-component/TextInput";

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
        <form>
          <Grid
            container
            rowSpacing={1}
            columnSpacing={2}
            my={2}
            alignItems="end"
          >
            <Grid item xs={12} sm={6}>
              <TextField
                label={intl.formatMessage({ id: "LEAVE_TYPE" })}
                placeholder="Leave type"
                type="text"
                name="leaveType"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={intl.formatMessage({ id: "LEAVE.AVAILABLE" })}
                placeholder="Leave available"
                type="text"
                name="leaveAvailable"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label={intl.formatMessage({ id: "APPLICATION.DURATION" })}
                placeholder="Duration"
                type="text"
                name="leaveDuration"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomisedDatePicker
                label={intl.formatMessage({
                  id: "APPLICATION.START",
                })}
                name="startDate"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomisedDatePicker
                label={intl.formatMessage({
                  id: "APPLICATION.END",
                })}
                name="endDate"
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <CustomisedButton variant="outlined" label="Add" Icon={<Add />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={intl.formatMessage({ id: "APPLICATION.NOS" })}
                placeholder="Total nos. of days"
                type="text"
                name="totalDays"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={intl.formatMessage({ id: "REASON" })}
                placeholder="Reason"
                type="text"
                name="leaveReason"
                fullWidth
              />
            </Grid>
          </Grid>
        </form>

        <Grid container display={"flex"} justifyContent={"end"} gap={1}>
          <CustomisedButton variant="outlined" label="Cancel" />
          <CustomisedButton variant="contained" label="Save" />
        </Grid>
      </CustomisedModal>
    </>
  );
};
