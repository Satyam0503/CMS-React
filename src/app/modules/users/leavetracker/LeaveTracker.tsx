import { Button, Card, Grid, Stack, Typography } from "@mui/material";
import { FC } from "react";

import { useIntl } from "react-intl";
import DonutApexChart from "../../components/DonutApexChart";
import { AttendanceChart } from "../../components/AttendanceChart";
// import CustomisedTable from "../../components/CustomisedTable";
import CustomisedDatePicker from "../../components/CustomisedDatePicker";
import { LeaveApplication } from "./LeaveApplication";
import { Block } from "@mui/icons-material";
import { LeaveCalender } from "../../leaves/LeaveCalender";

export const LeaveTracker: FC = () => {
  const intl = useIntl();
  const leavesLabels = ["Pending", "Taken"];
  const casualLeaves = [2, 2];
  const medicalLeaves = [3, 1];
  const earnedLeaves = [5, 10];
  const unpaidLeaves = [0, 12];
  return (
    <>
      <Grid container className="d-flex flex-column gap-4">
        <Grid container className="d-flex justify-content-between">
          <Grid item xs={4} className="d-flex gap-2">
            <LeaveCalender />
          </Grid>
          <Stack>
            <LeaveApplication />
          </Stack>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card className="p-5 w-100">
              <Stack className="mb-8 d-flex flex-row justify-content-between align-items-center ">
                <Typography variant="h6">
                  {intl.formatMessage({ id: "LEAVE.CL" })}
                </Typography>
                <Typography variant="h4">5</Typography>
              </Stack>
              <DonutApexChart series={casualLeaves} labels={leavesLabels} />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className="p-5 w-100">
              <Stack className="mb-8 d-flex flex-row justify-content-between align-items-center ">
                <Typography variant="h6">
                  {intl.formatMessage({ id: "LEAVE.ML" })}
                </Typography>
                <Typography variant="h4">4</Typography>
              </Stack>
              <DonutApexChart series={medicalLeaves} labels={leavesLabels} />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className="p-5 w-100">
              <Stack className="mb-8 d-flex flex-row justify-content-between align-items-center ">
                <Typography variant="h6">
                  {intl.formatMessage({ id: "LEAVE.EL" })}
                </Typography>
                <Typography variant="h4">5</Typography>
              </Stack>

              <DonutApexChart series={earnedLeaves} labels={leavesLabels} />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className="p-5 w-100">
              <Stack className="mb-8 d-flex flex-row justify-content-between align-items-center ">
                <Typography variant="h6">
                  {intl.formatMessage({ id: "LEAVE.UNPAID" })}
                </Typography>
                <Typography variant="h4">
                  <Block />
                </Typography>
              </Stack>
              <DonutApexChart series={unpaidLeaves} labels={leavesLabels} />
            </Card>
          </Grid>
        </Grid>
        <Grid container>
          <AttendanceChart
            className="card-xxl-stretch"
            chartColor="primary"
            chartHeight="179px"
          />
        </Grid>
        <Stack className="w-100">{/* <CustomisedTable /> */}</Stack>
        <Stack className="w-100 ">{/* <CustomisedTable /> */}</Stack>
      </Grid>
    </>
  );
};
