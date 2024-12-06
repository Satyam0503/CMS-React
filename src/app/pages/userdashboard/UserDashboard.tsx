import { Grid } from '@mui/material';
import PageHeader from '../../modules/dashboard/PageHeader';
import DashboardMain from '../../modules/dashboard/DashboardMain';


export default function UserDashboard() {
  return (

<Grid container   sx={{ maxWidth: "1200px" }} className='m-auto'>
  <PageHeader/>
  <DashboardMain/>
</Grid>
  );
}
