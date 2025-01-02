import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Grid, Stack, TextField } from "@mui/material";
import { Check, Edit } from "@mui/icons-material";
import CustomisedButton from "./CustomisedButton";

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

export default function BasicModal() {
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
          <Stack>
            <Typography variant="h6">Summary</Typography>
            <TextField
              id="outlined-basic"
              placeholder="Type.."
              variant="outlined"
              fullWidth
              sx={{ marginBlock: "10px" }}
            />
          </Stack>

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
