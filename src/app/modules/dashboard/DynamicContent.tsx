import { Stack, Typography, Grid, Card, Avatar, Button } from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { AttendanceChart } from "../components/AttendanceChart";
export default function DynamicContent() {
  const intl = useIntl();
  return (
    <>
      <Grid container className="d-flex flex-column gap-6">
        <AttendanceChart
        className="card-xxl-stretch mb-xl-3"
        chartColor="primary"
        chartHeight="179px"/>

<Stack direction={{sm:"row", md:"column"}} className="d-flex gap-6">
        <Card className="py-4 w-100 px-6">
      
          <Typography variant="h6" className="card-label  text-gray-900 mb-4">
            {intl.formatMessage({ id: "MENU.LEAVE" })}
          </Typography>
          <Stack direction="row" className="mb-2 d-flex justify-content-between align-items-center">
           
         
           
           <Stack direction="row">
           <Stack className="me-4 symbol symbol-45px">
                   <img src={toAbsoluteUrl('media/avatars/300-6.jpg')} alt='' className="rounded-circle" />
               </Stack>
             <Stack>
             <Typography
               variant="body1"
               className="text-gray-800 text-hover-primary fw-semibold "
             >
               Deepak Chaurasiya
             </Typography>
             <Typography
               variant="body2"
               className="text-muted fw-semibold d-block "
             >
               {intl.formatMessage({ id: "POSITION.QA" })}
             </Typography>
             </Stack>
    
           </Stack>
           <Stack>
             <Typography variant="subtitle2" className="text-primary">Today</Typography>
           </Stack>
         </Stack>
         <Stack direction="row" className="mb-2 d-flex justify-content-between align-items-center">
           
         
           
           <Stack direction="row">
           <Stack className="me-4 symbol symbol-45px">
                   <img src={toAbsoluteUrl('media/avatars/300-6.jpg')} alt='' className="rounded-circle" />
               </Stack>
             <Stack>
             <Typography
               variant="body1"
               className="text-gray-800 text-hover-primary fw-semibold "
             >
             Satish Singh
             </Typography>
             <Typography
               variant="body2"
               className="text-muted fw-semibold d-block "
             >
               {intl.formatMessage({ id: "POSITION.QA" })}
             </Typography>
             </Stack>
    
           </Stack>
           <Stack>
             <Typography variant="subtitle2" className="text-primary">5-Dec - 10-Dec</Typography>
           </Stack>
         </Stack>
        </Card>
        <Card className="py-4 px-6 w-100">
          <Typography variant="h6" className="card-label  text-gray-900 mb-4">
            {intl.formatMessage({ id: "MENU.BIRTHDAY" })}
          </Typography>
          <Stack direction="row" className="mb-2 d-flex justify-content-between align-items-center">
           
         
           
            <Stack direction="row">
            <Stack className="me-4 symbol symbol-45px">
                    <img src={toAbsoluteUrl('media/avatars/300-6.jpg')} alt='' className="rounded-circle" />
                </Stack>
              <Stack>
              <Typography
                variant="body1"
                className="text-gray-800 text-hover-primary fw-semibold "
              >
                Deepa Chauhan
              </Typography>
              <Typography
                variant="body2"
                className="text-muted fw-semibold d-block "
              >
                {intl.formatMessage({ id: "POSITION.QA" })}
              </Typography>
              </Stack>
     
            </Stack>
            <Stack>
              <Typography variant="subtitle2" className="text-primary">Today</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" className="mb-2 d-flex justify-content-between align-items-center">
           
         
           
           <Stack direction="row">
           <Stack className="me-4 symbol symbol-45px">
                   <img src={toAbsoluteUrl('media/avatars/300-6.jpg')} alt='' className="rounded-circle" />
               </Stack>
             <Stack>
             <Typography
               variant="body1"
               className="text-gray-800 text-hover-primary fw-semibold "
             >
               Pankaj Purohit
             </Typography>
             <Typography
               variant="body2"
               className="text-muted fw-semibold d-block "
             >
               {intl.formatMessage({ id: "POSITION.FULL_STACK" })}
             </Typography>
             </Stack>
    
           </Stack>
           <Stack>
             <Typography variant="subtitle2" className="text-primary"> 10-Dec</Typography>
           </Stack>
         </Stack>
      
        </Card>

        </Stack>

        <Card className="py-4 px-6 w-100">
          <Typography variant="h5">
            {intl.formatMessage({ id: "MENU.HELP" })}
          </Typography>
          <Typography
            variant="body2"
            className="text-muted d-block my-2 "
          >
            {intl.formatMessage({ id: "MENU.HELP_INFO" })}
          </Typography>
          <Button variant="contained" className="btn btn-sm btn-primary m">
            <Typography variant="body2">
              {intl.formatMessage({ id: "BUTTON.CONTACT" })}
            </Typography>
          </Button>
        </Card>
      </Grid>
    </>
  );
}
