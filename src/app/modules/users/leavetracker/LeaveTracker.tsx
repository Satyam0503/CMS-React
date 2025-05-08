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
import React, { FC } from "react";

import { useIntl } from "react-intl";
import DonutApexChart from "../../../shared/components/DonutApexChart";
import { AttendanceChart } from "../../../shared/components/AttendanceChart";
// import CustomisedTable from "../../components/CustomisedTable";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import { LeaveApplication } from "./components/LeaveApplication";
import { Block, CalendarToday } from "@mui/icons-material";

export const LeaveTracker: FC = () => {
  const intl = useIntl();
  const leavesLabels = ["Pending", "Taken"];
  const casualLeaves = [2, 2];
  const medicalLeaves = [3, 1];
  const earnedLeaves = [5, 10];
  const unpaidLeaves = [0, 12];
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Grid container display={"flex"} gap={2}>
        <Grid container display={"flex"} justifyContent={"space-between"}>
          <Stack>
            <FormControl sx={{ minWidth: 150, border: "none" }}>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                defaultValue={19}
                renderValue={(value) => {
                  if (value === 19) return "Today";
                  if (value === 20) return "This Week";
                  if (value === 21) return "This Month";
                  if (value === 22) return "This Year";

                  return "";
                }}
                sx={{ background: "white" }}
              >
                <MenuItem value={19}>Today</MenuItem>
                <MenuItem value={20}>This Week</MenuItem>
                <MenuItem value={21}>This Month</MenuItem>
                <MenuItem value={22}>This Year</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack>
            <LeaveApplication />
          </Stack>
        </Grid>
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
                  {intl.formatMessage({ id: "LEAVE.CL" })}
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
                  {intl.formatMessage({ id: "LEAVE.ML" })}
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
                  {intl.formatMessage({ id: "LEAVE.EL" })}
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
                  {intl.formatMessage({ id: "LEAVE.UNPAID" })}
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
      </Grid>
    </>
  );
};
