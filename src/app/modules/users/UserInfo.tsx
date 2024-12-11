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

export default function UserInfo() {
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
      >
        <Box sx={style}>
          <Grid container className="d-flex mt-2">
            <Stack>
              <Typography variant="h5" className="text-primary mb-2">
                {intl.formatMessage({ id: "PROFILE.PI" })}
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Email Address"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Phone number"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
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
                  label="Gender"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Languages Known"
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
              <Grid item xs={6}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label="Blood Group"
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

              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button variant="contained" className="me-4">
                  Cancel
                </Button>
                <Button variant="contained">Save</Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Grid>
  );
}
