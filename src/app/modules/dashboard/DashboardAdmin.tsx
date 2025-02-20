import {
  Stack,
  Typography,
  Grid,
  Card,
  Avatar,
  Container,
  Link,
} from "@mui/material";
import { useIntl } from "react-intl";
import DonutApexChart from "../components/DonutApexChart";
import OpenPositions from "./components/OpenPositions";
import NoticeBoard from "./components/NoticeBoard";
import StackedBarChart from "../components/StackedBarChart";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { colors } from "../theme/MuiTheme";
import EmpOnLeave from "./components/EmpOnLeave";
import Punctual from "./components/Punctual";
import UpcomingBirthday from "./components/UpcomingBirthday";
import EmpOfMonth from "./components/EmpOfMonth";
import Help from "./components/Help";
import { AttendanceChart } from "../components/AttendanceChart";
import EmployeePerformance from "./components/EmployeePerformance";
import { useAppSelector } from "../../Redux/hooks";
import { DashboardHeader } from "./components/DashboardHeader";
import { EmployeeChart } from "./components/EmployeeChart";
import { ApplicationsChart } from "./components/ApplicationsChart";

export default function DashboardAdmin() {
  const user = useAppSelector(state =>state.user.userData)!;
  const intl = useIntl();
  const teams = ["Development", "Design", "Testing", "Business"];
  const teamSize = [8, 2, 4, 3];
  return (
    <>
      <DashboardHeader fullName={user.fullName}/>
      <Grid
        container
        spacing={3}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <EmployeeChart />
            </Grid>
            <Grid item xs={12} sm={6}>
              <OpenPositions />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ApplicationsChart/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ px: 3, height: "100%", py: 2 }}>
                <Stack
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Typography variant="h6">
                    {intl.formatMessage({ id: "MENU.DEPT" })}
                  </Typography>
                  <Typography variant="h4">4</Typography>
                </Stack>
                <DonutApexChart
                  series={teamSize}
                  labels={teams}
                  showDataLabels={false}
                />
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={3}>
                <NoticeBoard />

                <EmployeePerformance />
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack direction={"column"} gap={3} width={"100%"}>
            <Card sx={{ height: "100%" }}>
              <Stack p={2}>
                <Typography variant="h6">
                  {intl.formatMessage({ id: "MENU.ATTENDANCE" })}
                </Typography>

                <Stack
                  direction={"row"}
                  spacing={8}
                  display={"flex"}
                  justifyContent={"flex-start"}
                  mt={1}
                >
                  <Stack>
                    <Typography variant="body2">
                      {intl.formatMessage({ id: "ATTENDANCE.PRESENT" })}
                    </Typography>
                    <Typography variant="h6">185</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="body2">
                      {intl.formatMessage({ id: "ATTENDANCE.ABSENT" })}
                    </Typography>
                    <Typography variant="h6">16</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="body2">
                      {intl.formatMessage({ id: "ATTENDANCE.LATE" })}
                    </Typography>
                    <Typography variant="h6">9</Typography>
                  </Stack>
                </Stack>
              </Stack>

              <AttendanceChart
                className="card-xxl-stretch "
                chartColor="primary"
                chartHeight="180px"
              />
            </Card>

            <EmpOnLeave />
            <Punctual />
            <UpcomingBirthday />
            <EmpOfMonth />
            <Help />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
