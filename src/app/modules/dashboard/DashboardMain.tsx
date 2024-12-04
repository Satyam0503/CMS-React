import { Stack, Typography, Grid, Card, Avatar } from "@mui/material";
import { useIntl } from "react-intl";
import DonutApexChart from "../components/DonutApexChart";
import OpenPositions from "../components/OpenPositions";
import NoticeBoard from "./NoticeBoard";
import DynamicContent from "./DynamicContent";
import StackedBarChart from "../components/StackedBarChart";
import { toAbsoluteUrl } from "../../../_themes/helpers";

export default function DashboardMain() {
  const intl = useIntl();
  return (
    <>
      <Grid
        container
        className="d-flex justify-content-center gap-5"
      >
        <Grid container className="d-flex justify-content-between">
          <Stack>
            <Typography variant="h2" className="mb-2"> 
              {intl.formatMessage({ id: "MENU.WELCOME" })} Aishwarya !
            </Typography>
            <Typography variant="body1">
              4{intl.formatMessage({ id: "NOTIFICATIONS.APPLICATIONS" })}
              <a className="text-secondary"> {intl.formatMessage({ id: "LINK.NOTIFICATION" })}</a>
            </Typography>
          </Stack>

          <Stack direction="row" alignItems={"center"}>
          <Stack className="me-4 symbol symbol-45px">
                    <img src={toAbsoluteUrl('media/Icons/Sun_behind_clouds.png')} alt='' className="rounded-circle" />
                </Stack>
                <Stack>     <Typography variant="h3">Monday</Typography>
                <Typography variant="body2">25 Nov 2024</Typography></Stack>
       
          </Stack>
        </Grid>
        <Grid container spacing={3} className="d-flex justify-content-between">
          <Grid item xs={12} md={8} className="d-flex flex-column gap-6">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              
              <Grid item xs={12} sm={6} className="h-100">
                <DonutApexChart />
              </Grid>
              <Grid item xs={12} sm={6} className="h-100">
                <OpenPositions />
              </Grid>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              
              <Grid item xs={12} md={6} className="h-100">
             <StackedBarChart/>
              </Grid>
              <Grid item xs={12} md={6} className="h-100">
                <DonutApexChart />
              </Grid>
            </Stack>
            <Stack>
            <NoticeBoard/>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
        <DynamicContent/>          
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
