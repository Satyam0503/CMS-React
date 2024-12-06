import { Add, CalendarMonth, Delete, DeleteOutline, Edit, ModeEdit, School, SchoolTwoTone } from "@mui/icons-material";
import { Card, Chip, Grid, Stack, TextField, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { KTIcon } from "../../../_themes/helpers";

export default function AboutUser() {
  const intl = useIntl();
  const handleDelete = () => {
    console.info('You clicked the delete icon.');
  };
  return (
    <Grid container className="d-flex gap-5 mt-2">
 
      <Card className="p-5">
        <Stack direction="row" className="d-flex justify-content-between mb-4"> 
          <Stack> <Typography variant="h5" className="text-primary">
          {intl.formatMessage({ id: "POSITION.DOT_NET" })}
        </Typography> 
</Stack>   
             
        <Stack>      <a className="btn btn-sm bg-white border btn-active-light-primary p-1">
                  <ModeEdit/>
                  </a></Stack>  
        </Stack>
   
        <Typography variant="body2">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem.
        </Typography>
      </Card>
      <Card className="w-100 p-5">
        <Stack direction="row" className="d-flex justify-content-between">
          <Stack>    <Typography variant="h5" className="text-primary">
          {intl.formatMessage({ id: "PROFILE.PI" })}
        </Typography> 
</Stack>
    
            
        <Stack>      <a className="btn btn-sm bg-white border btn-active-light-primary p-1">
                  <ModeEdit/>
                  </a></Stack>   

        </Stack>
<Grid container>
  <Grid item xs={12}><TextField className="w-100" id="outlined-basic" label="Address" variant="standard" /></Grid>

<Grid container spacing={4}>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Email Address" variant="standard" /></Grid>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Phone number" variant="standard" /></Grid>
</Grid>
<Grid container spacing={4}>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Date of birth" variant="standard" /></Grid>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Gender" variant="standard" /></Grid>
</Grid>
<Grid container spacing={4}>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Languages Known" variant="standard" /></Grid>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Date of joining" variant="standard" /></Grid>
</Grid>
<Grid container spacing={4}>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Employee ID" variant="standard" /></Grid>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Department" variant="standard" /></Grid>
</Grid>
<Grid container spacing={4}>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Reporting Manager" variant="standard" /></Grid>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Team Lead" variant="standard" /></Grid>
</Grid>
<Grid container spacing={4}>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Personal Email" variant="standard" /></Grid>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Emergency Contact" variant="standard" /></Grid>
</Grid>
<Grid container spacing={4}>
  <Grid item xs={6}><TextField className="w-100" id="outlined-basic" label="Blood Group" variant="standard" /></Grid>
</Grid>

</Grid>
      </Card>
      <Card className="w-100 p-5">
      <Stack direction="row" className="d-flex justify-content-between mb-4">
        <Stack>    <Typography variant="h5" className="text-primary">
          {intl.formatMessage({ id: "PROFILE.SKILLS" })}
        </Typography></Stack>
     
        
        <Stack>      <a className="btn btn-sm bg-white border btn-active-light-primary p-1">
                  <Add/>
                  </a></Stack>    

        </Stack>

        <Stack direction="row" spacing={1} className="skills-chips">
      <Chip label=".Net" variant="filled" color="primary" size="small" onDelete={handleDelete} />
      <Chip label="SQL Server" variant="filled" color="primary" size="small" onDelete={handleDelete} />
      <Chip label="Web API" variant="filled" color="primary" size="small" onDelete={handleDelete} />
      <Chip label="Javascript" variant="filled" color="primary" size="small" onDelete={handleDelete} />
    </Stack>
      </Card>
      <Card className="w-100 p-5">
      <Stack direction="row" className="d-flex justify-content-between mb-4">
        <Stack>     <Typography variant="h5" className="text-primary">
          {intl.formatMessage({ id: "PROFILE.EDUCATION" })}
        </Typography></Stack>
    

        <Stack>      <a className="btn btn-sm bg-white border btn-active-light-primary p-1">
                  <Add/>
                  </a></Stack>       

    

        </Stack>

        <Stack direction="row" className="mb-2 d-flex justify-content-between align-items-center">
           
         
           
           <Stack direction="row" alignItems={"center"}>
         <School className="me-4"/>
             <Stack>
             <Typography
               variant="body1"
               className="text-gray-800 text-hover-primary fw-semibold "
             >
               Degree in Bachelor of Computer Science
             </Typography>
             <Stack direction="row" spacing={1}>
             <Typography
               variant="body2"
               className="fw-semibold d-block "
             >
               Graphic Era Hill, Dehradun
             </Typography>
             <Typography
               variant="body2"
               className="text-muted fw-semibold d-block "
             >
              <CalendarMonth sx={{height:"14px"}}/>
              Jan 2012- June 2016
             </Typography>
             </Stack>
        
             </Stack>
    
           </Stack>
           <Stack direction="row">
                  <a className="btn btn-sm bg-white border btn-active-light-primary p-1 me-4">
                    <Edit/>
                  </a>
                  <a className="btn btn-sm bg-white border btn-active-light-danger p-1">
                  <DeleteOutline/>
                  </a>
                </Stack>
         </Stack>

         <Stack direction="row" className="mb-2 d-flex justify-content-between align-items-center">
           
         
           
           <Stack direction="row" alignItems={"center"}>
         <School className="me-4"/>
             <Stack>
             <Typography
               variant="body1"
               className="text-gray-800 text-hover-primary fw-semibold "
             >
              Higher Secondary
             </Typography>
             <Stack direction="row" spacing={1}>
             <Typography
               variant="body2"
               className="fw-semibold d-block "
             >
               ABC School, Mussoorie 
             </Typography>
             <Typography
               variant="body2"
               className="text-muted fw-semibold d-block "
             >
              <CalendarMonth sx={{height:"14px"}}/>
              Jan 2010- June 2012
             </Typography>
             </Stack>
      
             </Stack>
    
           </Stack>
           <Stack direction="row">
                  <a className="btn btn-sm bg-white border btn-active-light-primary p-1 me-4">
                    <Edit/>
                  </a>
                  <a className="btn btn-sm bg-white border btn-active-light-danger p-1">
                  <DeleteOutline/>
                  </a>
                </Stack>
         </Stack>
        
      </Card>
      <Card className="w-100 p-5">
      <Stack direction="row" className="d-flex justify-content-between mb-4">
        <Stack>  <Typography variant="h5" className="text-primary">
          {intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
        </Typography> </Stack>
      
        <Stack>      <a className="btn btn-sm bg-white border btn-active-light-primary p-1">
                  <Add/>
                  </a></Stack>       

        </Stack>

        <Stack direction="row" className="mb-2 d-flex justify-content-between align-items-center">
           
         
           
           <Stack direction="row" alignItems={"center"}>
         <School className="me-4"/>
             <Stack>
             <Typography
               variant="body1"
               className="text-gray-800 text-hover-primary fw-semibold "
             >
             Certification in AI Prompt
             </Typography>
             <Stack direction="row" spacing={1} >
             <Typography
               variant="body2"
               className="fw-semibold d-block "
             >
              ChatGPT, Online
             </Typography>
             <Typography
               variant="body2"
               className="text-muted fw-semibold d-block "
             >
              <CalendarMonth sx={{height:"14px"}}/>
              Mar 2022- Mar 2022
             </Typography>
             </Stack>
      
             </Stack>
    
           </Stack>
           <Stack direction="row">
                  <a className="btn btn-sm bg-white border btn-active-light-primary p-1 me-4">
                    <Edit/>
                  </a>
                  <a className="btn btn-sm bg-white border btn-active-light-danger p-1">
                  <DeleteOutline/>
                  </a>
                </Stack>
         </Stack>
  
      </Card>
      </Grid>
  );
}
