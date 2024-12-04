import { Card, Grid, Stack, Typography } from "@mui/material";
import Chart from "react-apexcharts";
import { useIntl } from "react-intl";

export default function StackedBarChart() {
  const intl = useIntl();
  
  const series = [
    {
      name: "Applications received", //will be displayed on the y-axis
      data: [60, 60, 60]
    }
  ];
  const options = {
    chart: {
      id: "simple-bar"
    },
    xaxis: {
      categories: [1, 2, 3] //will be displayed on the x-asis
    }
  };
  return (
    <Grid container>
      <Card className="p-4 w-100">
        <Stack className="d-flex flex-row justify-content-between align-items-center">
        <Typography variant="h6">{intl.formatMessage({ id: "MENU.TOTAL_APP" })}</Typography>
        <Typography variant="h4">1500</Typography>
        </Stack>
      
      <Chart options={options} type="bar" series={series}   height={205}/>

      <Stack spacing={4} direction="row" className="d-flex justify-content-center">
    <Typography variant="subtitle2">{intl.formatMessage({ id: "STATUS.SHORT_LISTED" })}</Typography>
    <Typography variant="subtitle2">{intl.formatMessage({ id: "STATUS.PENDING" })}</Typography>
    <Typography variant="subtitle2">{intl.formatMessage({ id: "STATUS.REJECTED" })}</Typography>
   </Stack>
      </Card>
    </Grid>
  );
}