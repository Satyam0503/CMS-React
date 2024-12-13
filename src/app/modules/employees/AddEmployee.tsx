import { Edit } from "@mui/icons-material";
import {
  Grid,
  TextField,
  Button,
  Stack,
  Modal,
  Box,
  Typography,
} from "@mui/material";
import React from "react";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../components/CustomisedDatePicker";

export default function AddEmployee() {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
  };

  const intl = useIntl();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid container className="pb-10">
      <Stack
        onClick={() => handleOpen()}
        className="btn btn-sm bg-white border btn-active-light-primary p-1"
      >
        <Edit />
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="overflow-auto "
      >
        <Box sx={style}>
          <Grid container className="d-flex  ">
            <Stack>
              <Typography variant="h5" className="text-primary mb-2">
                {intl.formatMessage({ id: "UPDATE.EMP.INFO" })}
              </Typography>
            </Stack>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.FIRST_NAME" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.LAST_NAME" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.GENDER" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.EMP_ID" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6} className="pt-3">
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.DOB" })}
                </Typography>
                <CustomisedDatePicker
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6} className="pt-6">
                <Typography variant="body1">
                  {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.ROLE" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.DEPARTMENT" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.TEAM_LEAD" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.PHONE" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.PERSONAL_EMAIL" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6} className="pt-3">
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.DOJ" })}
                </Typography>
                <CustomisedDatePicker
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6} className="pt-6">
                <Typography variant="body1">
                  {intl.formatMessage({ id: "PROFILE.STATUS" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.ADDRESS" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.PROFILE_PICTURE" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.ROLE" })}
                </Typography>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  variant="outlined"
                />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button variant="contained" className="me-4 bg-primary">
                  Cancel
                </Button>
                <Button variant="contained" className="bg-primary">
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Grid>
  );
}
