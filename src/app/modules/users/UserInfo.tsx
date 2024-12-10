import { Edit } from "@mui/icons-material";
import { Grid, TextField, Button, Stack, Modal, Box } from "@mui/material";
import React from "react";
import { useIntl } from "react-intl";


export default function UserInfo() {
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
  
  const intl = useIntl();
  
 
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  
    return (
      <Grid>
           <Stack onClick={() => handleOpen()} className="btn btn-sm bg-white border btn-active-light-primary p-1">
          <Edit />
        </Stack>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
          <Grid container className="d-flex gap-5 mt-2">
      
      <Grid container >
        <Grid item xs={12}><TextField sx={{width:"100%"}} id="outlined-basic" label="Address" variant="standard" /></Grid>
      <Grid container spacing={4}>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Email Address" variant="standard"  /></Grid>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Phone number" variant="standard" /></Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Date of birth" variant="standard" /></Grid>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Gender" variant="standard" /></Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Languages Known" variant="standard" /></Grid>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Date of joining" variant="standard" /></Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={6}><TextField sx={{width:"100%"}}id="outlined-basic" label="Employee ID" variant="standard" /></Grid>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Department" variant="standard" /></Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Reporting Manager" variant="standard" /></Grid>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Team Lead" variant="standard" /></Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Personal Email" variant="standard" /></Grid>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Emergency Contact" variant="standard" /></Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={6}><TextField sx={{width:"100%"}} id="outlined-basic" label="Blood Group" variant="standard" /></Grid>
      </Grid>
      
      
      </Grid>
      <Grid item xs={12} sx={{display:"flex", justifyContent:"center"}}>
      <Button variant="contained">Save</Button>
      </Grid>
            </Grid>
          </Box>
        </Modal>
      </Grid>
    );
  }

