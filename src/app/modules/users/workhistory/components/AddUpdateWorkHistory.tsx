import * as React from "react";

import Typography from "@mui/material/Typography";
import {
  Button,
  FormHelperText,
  Grid,
  Stack,
  TextField,
} from "@mui/material";
import { useIntl } from "react-intl";

import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import CustomisedButton from "../../../../shared/components/CustomisedButton";

type Props = {
  open: boolean,
  handleClose: () => void;
}

export const AddUpdateWorkHistory: React.FC<Props> = ({ open, handleClose }) => {
  const intl = useIntl();

  return (
    <>
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
