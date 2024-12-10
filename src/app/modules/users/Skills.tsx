import { Grid, TextField, Button } from "@mui/material";
import { useIntl } from "react-intl";


export default function Skills() {
  const intl = useIntl();
  return (
    <Grid container className="d-flex gap-5 mt-2">
            <TextField id="outlined-basic" variant="outlined" placeholder="Type" label="Skills"/>
            
    

<Grid item xs={12} sx={{display:"flex", justifyContent:"center"}}>
<Button variant="contained">Save</Button>
</Grid>
      </Grid>
  );
}
