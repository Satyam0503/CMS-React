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
import DonutApexChart from "../../components/DonutApexChart";
import { AttendanceChart } from "../../components/AttendanceChart";
// import CustomisedTable from "../../components/CustomisedTable";
import CustomisedDatePicker from "../../components/CustomisedDatePicker";
import { LeaveApplication } from "./LeaveApplication";
import { Block, CalendarToday } from "@mui/icons-material";
import { colors } from "../../theme/MuiTheme";

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
            <Button
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              variant="text"
              sx={{ width: "120px" }}
            >
              <CalendarToday /> Today
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>My account</MenuItem>
              <MenuItem onClick={handleClose}>Logout</MenuItem>
            </Menu>
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
