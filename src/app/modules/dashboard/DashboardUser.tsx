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
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { colors } from "../theme/MuiTheme";
import EmpOfMonth from "./components/EmpOfMonth";
import UpcomingBirthday from "./components/UpcomingBirthday";
import Punctual from "./components/Punctual";
import Help from "./components/Help";
import { AttendanceChart } from "../components/AttendanceChart";
import CustomisedButton from "../components/CustomisedButton";
import { Celebration } from "@mui/icons-material";
import AttendanceTable from "./components/LeaveTable";

export default function DashboardUser() {
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
            {intl.formatMessage({ id: "MENU.WELCOME" })} Prachi !
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
          <Stack sx={{ width: "2.5rem" }}>
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
            <Grid item xs={12} sm={6}>
              <NoticeBoard />
            </Grid>
            <Grid item xs={12} sm={6}>
              <OpenPositions />
            </Grid>

            <Grid item xs={12}>
              <Card>
                <Stack p={2}>
                  <Typography variant="h6">
                    {intl.formatMessage({ id: "ATTENDANCE.GRAPH" })}
                  </Typography>
                </Stack>

                <AttendanceChart
                  className="card-xxl-stretch "
                  chartColor="secondary"
                  chartHeight="180px"
                />
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <AttendanceTable />
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack direction={"column"} gap={3} width={"100%"}>
            <Card sx={{ p: 2, background: colors.alpha.primary[100] }}>
              <Stack direction="row">
                <Stack className=" symbol symbol-45px" sx={{ mr: 1 }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-1.jpg")}
                    alt=""
                    style={{ borderRadius: "50%" }}
                  />
                </Stack>
                <Stack>
                  <Typography variant="body1">Deepak Chaurasiya</Typography>
                  <Typography
                    variant="body2"
                    color={colors.alpha.neutral[600]}
                    sx={{ mb: 1 }}
                  >
                    {intl.formatMessage({ id: "BIRTHDAY.TODAY" })}
                  </Typography>
                  <CustomisedButton
                    variant="contained"
                    label="Send wishes"
                    size="large"
                    Icon={<Celebration />}
                    iconPosition="start"
                  />
                </Stack>
              </Stack>
            </Card>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6">
                {intl.formatMessage({ id: "MENU.ATTENDANCE" })}
              </Typography>
              <Stack direction={"row"} display={"flex"} mt={1}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">Present</Typography>
                  <Typography variant="body1">18</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">Late</Typography>
                  <Typography variant="body1">6</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">Absent</Typography>
                  <Typography variant="body1">2</Typography>
                </Grid>
              </Stack>
            </Card>
            <EmpOfMonth />
            <UpcomingBirthday />
            <Punctual />
            <Help />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
