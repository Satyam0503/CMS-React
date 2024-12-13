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
    <Grid>
      <Stack onClick={() => handleOpen()}>
        <Edit style={{ color: "black" }} />
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Grid container className="d-flex mt-2">
            <Stack>
              <Typography variant="h5" className="text-primary mb-2">
                {intl.formatMessage({ id: "UPDATE.EMP.INFO" })}
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="First Name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Last Name"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Gender"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Emp ID"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6} className="pt-3">
                <CustomisedDatePicker
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Date of birth"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Email"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Role"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Department"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Reporting Manager"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Team Lead"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Phone"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Blood Group"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Personal Email"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Emergency Contact"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6} className="pt-3">
                <CustomisedDatePicker
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Date of joining"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Status"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Address"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Profile Picture"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Role"
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
