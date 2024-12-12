import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Chip, Grid, Paper, Stack, styled, TextField } from "@mui/material";
import { Edit, TagFacesOutlined } from "@mui/icons-material";

interface ChipData {
  key: number;
  label: string;
}

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));
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

export default function Skills() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [chipData, setChipData] = React.useState<readonly ChipData[]>([
    { key: 0, label: "Angular" },
    { key: 1, label: "jQuery" },
    { key: 2, label: "Polymer" },
    { key: 3, label: "React" },
    { key: 4, label: "Vue.js" },
  ]);

  const handleDelete = (chipToDelete: ChipData) => () => {
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
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
        sx={{ display: "flex" }}
      >
        <Box sx={style}>
          <Stack>
            <Typography variant="h5" className="text-primary">
              Skills
            </Typography>
            <TextField variant="outlined" placeholder="Type"></TextField>
          </Stack>

          <Grid container>
            {chipData.map((data) => {
              return (
                <ListItem key={data.key} className="d-flex skills-chips">
                  <Chip label={data.label} onDelete={handleDelete(data)} />
                </ListItem>
              );
            })}
          </Grid>
          <Grid container className="d-flex justify-content-end gap-2 ">
            <Button variant="contained" className="bg-primary">
              Cancel
            </Button>
            <Button variant="contained" className="bg-primary">
              Save
            </Button>
          </Grid>
        </Box>
      </Modal>
    </Grid>
  );
}
