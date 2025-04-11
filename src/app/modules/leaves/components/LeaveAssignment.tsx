import { Add, Check, Download, Edit, Person, Sort } from "@mui/icons-material";
import {
  Box,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import { SelectInput } from "../../../shared/components/form-component/SelectInput";
// import { CustomisedModal } from "../components/CustomisedModal";
// import CustomisedButton from "../components/CustomisedButton";
// import CustomisedDatePicker from "../components/CustomisedDatePicker";

export default function LeaveAssignment() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <form>
      <Grid container>
        <CustomisedButton
          variant="text"
          size="medium"
          label="Leave Assignment"
          Icon={<Person sx={{ px: "2px" }} />}
          handleClick={() => setOpen(true)}
        />
        <CustomisedModal open={open} handleClose={handleClose}>
          <Grid item xs={12} mb={3}>
            <Typography variant="h5">
              {intl.formatMessage({ id: "LEAVE.ASSIGNMENT" })}
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
                label={intl.formatMessage({ id: "SELECT.EMP" })}
                fullWidth
                id="outlined-basic"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={intl.formatMessage({ id: "USER.EMP_ID" })}
                fullWidth
                id="outlined-basic"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={intl.formatMessage({ id: "LEAVE.CL" })}
                fullWidth
                id="outlined-basic"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={intl.formatMessage({
                  id: "LEAVE.ML",
                })}
                fullWidth
                id="outlined-basic"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={intl.formatMessage({
                  id: "LEAVE.EL",
                })}
                fullWidth
                id="outlined-basic"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={intl.formatMessage({
                  id: "LEAVE.UNPAID",
                })}
                fullWidth
                id="outlined-basic"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomisedDatePicker
                label={intl.formatMessage({
                  id: "USER.DOJ",
                })}
                name="startDate"
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
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  {intl.formatMessage({ id: "USER.ROLE" })}
                </InputLabel>
                <Select
                  name="type"
                  label={intl.formatMessage({ id: "USER.ROLE" })}
                  id="outlined-basic"
                  variant="outlined"
                >
                  <MenuItem>Tester</MenuItem>
                  <MenuItem>Backend Developer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  {intl.formatMessage({ id: "USER.DEPARTMENT" })}
                </InputLabel>
                <Select
                  name="type"
                  label={intl.formatMessage({ id: "USER.DEPARTMENT" })}
                  id="outlined-basic"
                  variant="outlined"
                >
                  <MenuItem>Tester</MenuItem>
                  <MenuItem>Backend Developer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
                </InputLabel>
                <Select
                  name="type"
                  label={intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
                  id="outlined-basic"
                  variant="outlined"
                >
                  <MenuItem>Tester</MenuItem>
                  <MenuItem>Backend Developer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  {intl.formatMessage({ id: "USER.TEAM_LEAD" })}
                </InputLabel>
                <Select
                  name="type"
                  label={intl.formatMessage({ id: "USER.TEAM_LEAD" })}
                  id="outlined-basic"
                  variant="outlined"
                >
                  <MenuItem>Sohan</MenuItem>
                  <MenuItem>Sameeer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid
              item
              xs={12}
              display={"flex"}
              justifyContent={"flex-end"}
              mt={1}
              gap={1}
            >
              <CustomisedButton
                variant="outlined"
                size="medium"
                label="Cancel"
              />
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
    </form>
  );
}
