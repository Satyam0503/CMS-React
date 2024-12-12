import { Button, Grid, Stack, Typography } from "@mui/material";
import { FC } from "react";

import { useIntl } from "react-intl";
import DonutApexChart from "../../components/DonutApexChart";
import { AttendanceChart } from "../../components/AttendanceChart";
import CustomisedTable from "../../components/CustomisedTable";
import CustomisedDatePicker from "../../components/CustomisedDatePicker";
import { LeaveApplication } from "./LeaveApplication";

export const LeaveTracker: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Grid container className="d-flex flex-column gap-4">
        <Grid container className="d-flex justify-content-between">
          <Grid item xs={4} className="d-flex gap-2">
            <CustomisedDatePicker />
            <CustomisedDatePicker />
          </Grid>
          <Stack>
            <LeaveApplication />
          </Stack>
        </Grid>
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
        <Stack className="w-100">
          <CustomisedTable />
        </Stack>
        <Stack className="w-100 ">
          <CustomisedTable />
        </Stack>
      </Grid>
    </>
  );
};
