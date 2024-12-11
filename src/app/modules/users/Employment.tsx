import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Card, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useIntl } from 'react-intl';
import CustomisedDatePicker from '../components/CustomisedDatePicker';

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

export default function Employment() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const intl = useIntl();
  const [degree, setDegree] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setDegree(event.target.value as string);
  };
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

    
          <Stack>
          
            <Typography variant="h5" className="text-primary">
              {intl.formatMessage({ id: "PROFILE.EMPLOYMENT" })}
            </Typography>
          </Stack>
          <Stack>
            <Typography>Title</Typography>
            <TextField variant='outlined' ></TextField>
          </Stack>
          <Grid container className='d-flex' spacing={2}>
          <Grid item xs={12} md={6}  className='w-100'>
          <Typography>Start date</Typography>
  <CustomisedDatePicker
   />
           
          </Grid>
          <Grid item xs={12} md={6}className='w-100'>
          <Typography>End date</Typography>
  <CustomisedDatePicker
   /></Grid>
           
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} sx={{width:"100%"}}>
            <Typography>College Name</Typography>
        <TextField fullWidth/>
            </Grid>
            <Grid item xs={12} md={6}>
            <Typography>Type</Typography>
            
            <FormControl fullWidth>
        
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          
          label="Degree"
          onChange={handleChange}
        >
           <MenuItem>Degree</MenuItem>
          <MenuItem >Ten</MenuItem>
          <MenuItem>Twenty</MenuItem>
          <MenuItem>Thirty</MenuItem>
        </Select>
      </FormControl>
            </Grid>
          </Grid>
    
    <Grid container className='d-flex justify-content-end mt-4 gap-2'>
      <Button variant='contained'>Cancel</Button>
      <Button variant='contained'>Add New</Button>
      <Button variant='contained'>Save</Button>
    </Grid>
    

     
        </Box>
      </Modal>
    </Grid>
  );
}