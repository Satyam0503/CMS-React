import { Grid, TextField, Button } from "@mui/material";
import { useIntl } from "react-intl";


export default function UserInfo() {
  const intl = useIntl();
  return (
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
  );
}
