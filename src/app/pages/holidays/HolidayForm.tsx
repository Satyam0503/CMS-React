import React from "react";
import {
  TextField,
  Stack,
  Button,
  DialogTitle,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Box,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../modules/components/CustomisedDatePicker";
import CustomisedButton from "../../modules/components/CustomisedButton";
import { Check } from "@mui/icons-material";

interface HolidayFormProps {
  handleCloseModal: () => void;
  handleAddHoliday: () => void;
}

const HolidayForm: React.FC<HolidayFormProps> = ({
  handleCloseModal,
  handleAddHoliday,
}) => {
  const intl = useIntl();
  return (
    <Stack>
      <Stack>
        <Typography variant="h4" sx={{ pb: "20px" }}>
          {intl.formatMessage({ id: "MENU.HOLIDAYS" })}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body1">
            {intl.formatMessage({ id: "FORM.TITLE" })}*
          </Typography>
          <TextField
            sx={{ width: "100%" }}
            id="outlined-basic"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            {intl.formatMessage({ id: "FORM.TYPE" })}*
          </Typography>
          <TextField
            sx={{ width: "100%" }}
            id="outlined-basic"
            variant="outlined"
          />
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body1">
            {intl.formatMessage({ id: "APPLICATION.START" })}*
          </Typography>
          <CustomisedDatePicker sx={{ width: "100%" }} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            {intl.formatMessage({ id: "APPLICATION.END" })}*
          </Typography>
          <CustomisedDatePicker />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1">
            {intl.formatMessage({
              id: "INFO.DESCRIPTION",
            })}
          </Typography>
          <TextField
            sx={{ width: "100%" }}
            id="outlined-basic"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} display={"flex"} justifyContent={"end"} gap={2}>
          <CustomisedButton
            variant="outlined"
            label="Cancel"
            handleClick={handleCloseModal}
          />
          <CustomisedButton
            variant="contained"
            label="Save"
            Icon={<Check />}
            handleClick={handleAddHoliday}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default HolidayForm;
