import * as React from "react";

import Typography from "@mui/material/Typography";
import {
  Button,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useIntl } from "react-intl";

import { Add } from "@mui/icons-material";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../../shared/components/CustomisedButton";

export function AddUpdateWorkHistory() {
  const intl = useIntl();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <CustomIconButton icon={<Add />} tooltip="Add" handleClick={handleOpen} />
      <CustomisedModal open={open} handleClose={handleClose}>
        <Typography variant="h5" mb={2}>
          {intl.formatMessage({ id: "PROFILE.EMPLOYMENT" })}
        </Typography>
        <form>
          <Grid container rowSpacing={1} columnSpacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "INFO.TITLE" })}
              </Typography>
              <TextField fullWidth variant="outlined" />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({
                  id: "APPLICATION.START",
                })}
              </Typography>
              {/* <CustomisedDatePicker name="startDate" /> */}
              <FormHelperText></FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                {intl.formatMessage({
                  id: "APPLICATION.END",
                })}
              </Typography>
              {/* <CustomisedDatePicker name="endDate" /> */}
              <FormHelperText></FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                {intl.formatMessage({
                  id: "APPLICATION.END",
                })}
              </Typography>
              <TextField fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "USER.ORGNISATION" })}
              </Typography>
              <TextField fullWidth></TextField>
              <FormHelperText></FormHelperText>
            </Grid>
          </Grid>

          <Stack
            direction={"row"}
            spacing={1}
            justifyContent={"flex-end"}
            mt={2}
          >
            <CustomisedButton
              label="Cancel"
              handleClick={handleClose}
              variant="outlined"
            />
            <CustomisedButton label="Save" type="submit" />
          </Stack>
        </form>
      </CustomisedModal>
    </>
  );
}
