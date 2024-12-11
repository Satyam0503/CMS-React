import { Grid, Stack } from "@mui/material";
import { FC } from "react";

import { useIntl } from "react-intl";
import DonutApexChart from "../../components/DonutApexChart";
import { AttendanceChart } from "../../components/AttendanceChart";

export const LeaveTracker: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Grid container>
        <Stack></Stack>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <DonutApexChart />
          </Grid>
          <Grid item xs={6}>
            <DonutApexChart />
          </Grid>
          <Grid item xs={6}>
            <DonutApexChart />
          </Grid>
          <Grid item xs={6}>
            <DonutApexChart />
          </Grid>
        </Grid>
        <Grid container>
          <AttendanceChart
            className="card-xxl-stretch"
            chartColor="primary"
            chartHeight="179px"
          />
        </Grid>
      </Grid>
    </>
  );
};
