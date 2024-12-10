import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Card, Grid, Stack, TextField } from '@mui/material';
import { Add, CalendarMonth, DeleteOutline, Edit, School } from '@mui/icons-material';
import { useIntl } from 'react-intl';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

export default function Education() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const intl = useIntl();
  return (
    <Grid>
         <Stack onClick={() => handleOpen()} className="btn btn-sm bg-white border btn-active-light-primary p-1">
        <Add/>
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>

        <Stack direction="row" className="d-flex justify-content-between mb-4">
          <Stack>
          
            <Typography variant="h5" className="text-primary">
              {intl.formatMessage({ id: "PROFILE.EDUCATION" })}
            </Typography>
          </Stack>

    
        </Stack>

     
        </Box>
      </Modal>
    </Grid>
  );
}