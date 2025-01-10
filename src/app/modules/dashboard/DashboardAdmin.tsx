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
import OpenPositions from "../components/OpenPositions";
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

export default function DashboardAdmin() {
  const intl = useIntl();
  const series = [21, 12, 0];
  const labels = ["Male", "Female", "Other"];
  const teams = ["Development", "Design", "Testing", "Business"];
  const teamSize = [8, 2, 4, 3];
  return (
    <>
      <Grid
        container
        display={"flex"}
        justifyContent={"space-between"}
        mb={2}
        gap={4}
      >
        <Stack>
          <Typography variant="h2">
            {intl.formatMessage({ id: "MENU.WELCOME" })} Aishwarya !
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: colors.alpha.neutral[600], mt: 1 }}
          >
            4{intl.formatMessage({ id: "NOTIFICATIONS.APPLICATIONS" })}
            <Link
              href="#"
              underline="always"
              sx={{ color: colors.alpha.secondary[500] }}
            >
              {"Check the submissions"}
            </Link>
          </Typography>
        </Stack>

        <Stack direction="row" alignItems={"start"} spacing={1}>
          <Stack sx={{ width: "40px" }}>
            <img
              src={toAbsoluteUrl("media/Icons/Sun_behind_clouds.png")}
              alt="clouds"
            />
          </Stack>
          <Stack alignItems={"end"}>
            <Typography variant="h3">Monday</Typography>
            <Typography variant="body1">25 Nov 2024</Typography>
          </Stack>
        </Stack>
      </Grid>
      <Grid
        container
        spacing={3}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ px: 3, height: "100%", py: 2 }}>
                <Stack
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  mb={1}
                >
                  <Typography variant="h6">
                    {intl.formatMessage({ id: "MENU.TOTAL_EMP" })}
                  </Typography>
                  <Typography variant="h4">50</Typography>
                </Stack>
                <DonutApexChart
                  series={series}
                  labels={labels}
                  showDataLabels={true}
                />
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <OpenPositions />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StackedBarChart />
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
