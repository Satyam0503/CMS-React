import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import DonutApexChart from "../components/DonutApexChart";
import ProfileCard from "./ProfileCard";
import BasicTabs from "./BasicTabs";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import IconStat from "../components/IconStat";
import { Build, CorporateFare, HourglassBottom } from "@mui/icons-material";
import { colors } from "../theme/MuiTheme";
import { CalendarIcon } from "@mui/x-date-pickers";
import {  useState } from "react";
import { EmployeesDataTypes } from "../../../utils/common_types";
import { useUserDetails } from "./UserDataProvider";
import dayjs from "dayjs";
// import { getEmployeeDetails } from "./userservices";

// get token and id from store
const id= "66c5ea2f-6cfd-445d-b215-09dd3667c8c5";
const token = JSON.parse(localStorage.getItem("kt-auth-react-v") || "{}");

export default function UserProfile() {
  const intl = useIntl();

  const leaveAllowanceLables = ["Pending", "Taken"];
  const leaveAllowanceValue = [13, 10];

  const profileCardPayload = {
    name: `${currentUser?.firstName} ${currentUser?.lastName}`,
    designation: currentUser?.jobRole,
    bloodGroup: currentUser?.bloodGroup,
    age: dayjs(new Date()).diff(currentUser?.dateOfBirth, "year"),
  };

  return (
    <Container sx={{ p: "16px" }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3} className="d-flex flex-column gap-5">
          <Stack>
            <ProfileCard />
          </Stack>
    <Container sx={{ p:"16px" }}>
    <Grid container spacing={4}>
      <Grid item xs={12} md={3} className="d-flex flex-column gap-5">
        <Stack>
          <ProfileCard  {...profileCardPayload}/>
        </Stack>

          <Stack>
            <Card className="p-5 w-100">
              <Stack className="mb-8 d-flex flex-row justify-content-between align-items-center ">
                <Typography variant="h6">
                  {intl.formatMessage({ id: "MENU.LEAVE_ALLOWANCE" })}
                </Typography>
                <Typography variant="h4">4</Typography>
              </Stack>
              <DonutApexChart
                series={leaveAllowanceValue}
                labels={leaveAllowanceLables}
                showDataLabels={true}
              />
            </Card>
          </Stack>
        </Grid>
        <Grid item xs={12} md={9}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            className="d-md-flex justify-content-evenly w-100 bg-white p-4 rounded "
          >
            <Grid item xs={12} md={4} className="d-flex align-items-center">
              <IconStat
                iconBg={colors.alpha.secondary[100]}
                icon={<CalendarIcon fontSize="large" />}
                iconColor={colors.alpha.secondary[500]}
                number={"14"}
                title="Years in Codeji"
              />
            </Grid>
            <Grid item xs={12} md={4} className="d-flex align-items-center">
              <IconStat
                iconBg={colors.alpha.primary[100]}
                icon={<CorporateFare fontSize="large" />}
                iconColor={colors.alpha.primary[500]}
                number={"6"}
                title="Years of experience"
              />
            </Grid>
            <Grid item xs={12} md={4} className="d-flex align-items-center">
              <IconStat
                iconBg={colors.alpha.danger[100]}
                icon={<Build fontSize="large" />}
                iconColor={colors.alpha.danger[400]}
                number={"25+"}
                title="Skills Holder"
              />
            </Grid>
          </Stack>
          <Stack>
            <BasicTabs />
            {/* <AboutUser /> */}
          </Stack>
        </Grid>
        <Stack>
          <Card className="p-5 w-100">
            <Stack className="mb-8 d-flex flex-row justify-content-between align-items-center ">
              <Typography variant="h6">
                {intl.formatMessage({ id: "MENU.LEAVE_ALLOWANCE" })}
              </Typography>
              <Typography variant="h4">4</Typography>
            </Stack>
            <DonutApexChart series={leaveAllowanceValue} labels={leaveAllowanceLables} showDataLabels={true}/>
          </Card>
        </Stack>
      </Grid>
      <Grid item xs={12} md={9}>
        <Stack
          direction="row"
          className="d-flex justify-content-evenly w-100 bg-white p-4 rounded "
        >
          <Grid item xs={4} className="d-flex align-items-center">
            <Stack className="me-4 symbol symbol-45px">
              <img
                src={toAbsoluteUrl("media/Icons/calender.svg")}
                alt=""
                className="rounded-circle"
              />
            </Stack>
            <Box>
              <Typography variant="h2">14</Typography>
              <Typography variant="body2">
                {intl.formatMessage({ id: "PROFILE.EXP" })}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4} className="d-flex align-items-center">
            <Stack className="me-4 symbol symbol-45px">
              <img
                src={toAbsoluteUrl("media/Icons/experience.svg")}
                alt=""
                className="rounded-circle"
              />
            </Stack>
            <Box>
              <Typography variant="h2">6</Typography>
              <Typography variant="body2">
                {intl.formatMessage({ id: "PROFILE.EXP_CURRENT" })}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4} className="d-flex align-items-center">
            <Stack className="me-4 symbol symbol-45px">
              <img
                src={toAbsoluteUrl("media/Icons/skills.svg")}
                alt=""
                className="rounded-circle"
              />
            </Stack>
            <Box>
              <Typography variant="h2">{currentUser?.skills?.length ||0}+</Typography>
              <Typography variant="body2">
                {intl.formatMessage({ id: "PROFILE.SKILLS_HOLDER" })}
              </Typography>
            </Box>
          </Grid>
        </Stack>
        <Stack className="w-100">
          <BasicTabs />
          {/* <AboutUser /> */}
        </Stack>
      </Grid>
      </Grid>
    </Container>
  );
}
