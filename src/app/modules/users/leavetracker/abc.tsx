import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
  Card,
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import {
  Add,
  CalendarMonth,
  Check,
  DeleteOutline,
  Edit,
  School,
} from "@mui/icons-material";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../components/CustomisedDatePicker";
import CustomisedButton from "../components/CustomisedButton";

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

export default function Certification() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const intl = useIntl();
  const [degree, setDegree] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setDegree(event.target.value as string);
  };
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
          <Stack>
            <Typography variant="h5" className="text-primary">
              {intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
            </Typography>
          </Stack>

          <Stack>
            <Typography>Title</Typography>
            <TextField variant="outlined"></TextField>
          </Stack>
          <Grid container className="d-flex" spacing={2}>
            <Grid item xs={12} md={6} className="w-100">
              <Typography>Start date</Typography>
              <CustomisedDatePicker />
            </Grid>
            <Grid item xs={12} md={6} className="w-100">
              <Typography>End date</Typography>
              <CustomisedDatePicker />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} sx={{ width: "100%" }}>
              <Typography>Organization Name</Typography>
              <TextField fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>Mode</Typography>

              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Mode"
                  onChange={handleChange}
                >
                  <MenuItem>Online</MenuItem>
                  <MenuItem>Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <CustomisedButton variant="outlined" size="medium" label="Cancel" />
            <CustomisedButton
              variant="outlined"
              size="medium"
              label="Add New"
              Icon={<Add />}
            />
            <CustomisedButton
              variant="contained"
              size="medium"
              label="Save"
              Icon={<Check sx={{ px: "2px" }} />}
            />
          </Grid>
        </Box>
      </Modal>
    </Grid>
  );
}
