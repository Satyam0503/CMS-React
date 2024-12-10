import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Edit } from '@mui/icons-material';
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
  borderRadius: 2,
};

export default function PIModal() {
  const [open, setOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<string>('');
  
  const handleOpen = (type: string) => {
    setModalType(type);
    setOpen(true);
  }

  const handleClose = () => setOpen(false);

  return (
    <Grid item>
      <Stack onClick={() => handleOpen('skills')} className="btn btn-sm bg-white border btn-active-light-primary p-1">
        <Edit />
      </Stack>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {modalType === 'personalInfo' ? (
            <Stack>
              <Typography variant="h6">Summary</Typography>
              <TextField id="outlined-basic" label="Summary" variant="outlined" fullWidth />
            </Stack>
          ) : modalType === 'personalInfo' ? (
            <Stack>
              <Typography variant="h6">Personal Info</Typography>
              <UserInfo />
            </Stack>
          ) : modalType === 'skills' ? (
            <Stack>
              <Typography variant="h6">Skills</Typography>
              <Skills />
            </Stack>
          ) : null}
        </Box>
      </Modal>
    </Grid>
  );
}
