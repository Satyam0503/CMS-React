import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Edit, ModeEdit } from '@mui/icons-material';
import { Grid, Stack, TextField } from '@mui/material';
import UserInfo from '../users/UserInfo';
import Skills from '../users/Skills';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius:2,
};

export default function BasicModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid item>
        <Stack onClick={handleOpen} className="btn btn-sm bg-white border btn-active-light-primary p-1">
                  <ModeEdit/> 
                  </Stack>
      {/* <Button variant='text' onClick={handleOpen}><Edit/></Button> */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
        <TextField id="outlined-basic" label="Summary" variant="outlined" />
  <UserInfo/>
   <Skills/>
        </Box>
      </Modal>
    </Grid>
  );
}