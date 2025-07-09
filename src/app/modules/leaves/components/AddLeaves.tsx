import { Add, Check, Download, Edit, Sort } from "@mui/icons-material";
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import CustomisedButton from "../../../shared/components/CustomisedButton";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";

export default function AddLeaves() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid container>
      <CustomisedButton
        variant="contained"
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
        <Grid
          container
          rowSpacing={2}
          columnSpacing={{ xs: 1, sm: 2 }}
          alignItems={"end"}
        >
          <Grid item xs={12} md={6}>
            <TextField
              label={intl.formatMessage({ id: "FORM.FULL_NAME" })}
              fullWidth
              id="outlined-basic"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label={intl.formatMessage({ id: "FORM.TITLE" })}
              fullWidth
              id="outlined-basic"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label={intl.formatMessage({ id: "MENU.DEPT" })}
              fullWidth
              id="outlined-basic"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label={intl.formatMessage({
                id: "FORM.EMAIL",
              })}
              fullWidth
              id="outlined-basic"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label={intl.formatMessage({
                id: "LEAVE_TYPE",
              })}
              fullWidth
              id="outlined-basic"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label={intl.formatMessage({
                id: "LEAVE.REMAINING",
              })}
              fullWidth
              id="outlined-basic"
              variant="outlined"
            />
          </Grid>

          <Grid
            item
            xs={12}
            display={"flex"}
            flexDirection={{ xs: "column", md: "row" }}
            columnGap={1}
            alignItems={"end"}
          >
            <Grid item xs={12} md={3.9}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  {intl.formatMessage({ id: "APPLICATION.DURATION" })}
                </InputLabel>
                <Select
                  label={intl.formatMessage({ id: "APPLICATION.DURATION" })}
                  fullWidth
                  id="outlined-basic"
                  variant="outlined"
                >
                  <MenuItem>Full day</MenuItem>
                  <MenuItem>Half Day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3.9}>
              <CustomisedDatePicker
                label={intl.formatMessage({
                  id: "START_DATE",
                })}
                name="startDate"
              />
            </Grid>
            <Grid item xs={12} md={3.9}>
              <CustomisedDatePicker
                label={intl.formatMessage({
                  id: "END_DATE",
                })}
                name="startDate"
              />

              {/* <CustomisedDatePicker /> */}
            </Grid>
            <Grid item xs={0.8} alignContent={"end"}>
              <IconButton size="small" sx={{ width: "35px", height: "35px" }}>
                <Add />
              </IconButton>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label={intl.formatMessage({
                id: "REASON",
              })}
              fullWidth
              id="outlined-basic"
              variant="outlined"
            />
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
