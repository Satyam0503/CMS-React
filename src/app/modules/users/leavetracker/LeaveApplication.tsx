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
      <Grid>
        <Stack
          onClick={() => handleOpen()}
          className="btn btn-sm bg-white border btn-active-light-primary p-4"
        >
          <Typography variant="body2">
            {intl.formatMessage({ id: "APPLICATION.LEAVE" })}
          </Typography>
        </Stack>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Stack>
              <Typography variant="h5" className="text-primary">
                {intl.formatMessage({ id: "APPLICATION.LEAVE" })}
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  {" "}
                  {intl.formatMessage({ id: "PROFILE.TYPE" })}
                </Typography>
                <TextField fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "PROFILE.AVAILABLE" })}
                </Typography>
                <TextField fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "APPLICATION.START" })}
                </Typography>
                <TextField fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "APPLICATION.END" })}
                </Typography>
                <TextField fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "APPLICATION.HALF.DAY" })}
                </Typography>
                <TextField fullWidth />
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
            <Grid container className="d-flex justify-content-end mt-4 gap-2">
              <Button variant="contained" className="bg-primary">
                Cancel
              </Button>
              <Button variant="contained" className="bg-primary">
                Add New
              </Button>
              <Button variant="contained" className="bg-primary">
                Save
              </Button>
            </Grid>
          </Box>
        </Modal>
      </Grid>
    </>
  );
};
