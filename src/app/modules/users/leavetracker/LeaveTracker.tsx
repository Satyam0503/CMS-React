import {
  Button,
  Card,
  FormControl,
  Grid,
  Menu,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React, { FC, useState } from "react";

import { useIntl } from "react-intl";
import DonutApexChart from "../../../shared/components/DonutApexChart";
import { AttendanceChart } from "../../../shared/components/AttendanceChart";
// import CustomisedTable from "../../components/CustomisedTable";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import { LeaveApplication } from "./components/LeaveApplication";
import { Add, Block, CalendarToday } from "@mui/icons-material";
import CustomisedButton from "../../../shared/components/CustomisedButton";

export const LeaveTracker: FC = () => {
  const { formatMessage: i } = useIntl();
  const leavesLabels = ["Pending", "Taken"];
  const casualLeaves = [2, 2];
  const medicalLeaves = [3, 1];
  const earnedLeaves = [5, 10];
  const unpaidLeaves = [0, 12];
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  }

  return (
    <Stack spacing={2}>
      <Stack className="flex-row justify-content-between ">
        <CustomisedButton Icon={<Add />} variant="outlined" label={i({ id: "APPLY_FOR_LEAVE" })} handleClick={() => setOpen(true)} />
        {open && <LeaveApplication open={true} handleClose={handleClose} />}
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2, height: "100%" }}>
            <Stack
              direction={"row"}
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant="h6">
                {i({ id: "LEAVE.CL" })}
              </Typography>
              <Typography variant="h4">5</Typography>
            </Stack>
            <DonutApexChart series={casualLeaves} labels={leavesLabels} />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2, height: "100%" }}>
            <Stack
              direction={"row"}
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant="h6">
                {i({ id: "LEAVE.ML" })}
              </Typography>
              <Typography variant="h4">4</Typography>
            </Stack>
            <DonutApexChart series={medicalLeaves} labels={leavesLabels} />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2, height: "100%" }}>
            <Stack
              direction={"row"}
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant="h6">
                {i({ id: "LEAVE.EL" })}
              </Typography>
              <Typography variant="h4">5</Typography>
            </Stack>
            <DonutApexChart series={earnedLeaves} labels={leavesLabels} />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2, height: "100%" }}>
            <Stack
              direction={"row"}
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant="h6">
                {i({ id: "LEAVE.UNPAID" })}
              </Typography>
              <Block />
            </Stack>
            <DonutApexChart series={earnedLeaves} labels={leavesLabels} />
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
      <Stack>{/* <CustomisedTable /> */}</Stack>
      <Stack>{/* <CustomisedTable /> */}</Stack>
    </Stack>
  );
};
