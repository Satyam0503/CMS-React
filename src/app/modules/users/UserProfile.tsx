import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import DonutApexChart from "../components/DonutApexChart";
import ProfileCard from "./ProfileCard";
import BasicTabs from "./BasicTabs";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { useUserDetails } from "./UserDataProvider";
import dayjs from "dayjs";
import { useAppSelector } from "../../Redux/hooks";
// import { getEmployeeDetails } from "./userservices";

// get token and id from store
export default function UserProfile() {
  const token = useAppSelector(state=>state.auth.token)!;
  const intl = useIntl();
  const {
    userDetails: currentUser,
    setUserDetails,
    setRefresh,
  } = useUserDetails();
  const leaveAllowanceLables = ["Pending", "Taken"];
  const leaveAllowanceValue = [13, 10];

  const profileCardPayload = {
    name: `${currentUser?.firstName} ${currentUser?.lastName}`,
    designation: currentUser?.jobRole,
    bloodGroup: currentUser?.bloodGroup,
    age: dayjs(new Date()).diff(currentUser?.dateOfBirth, "year"),
  };

  return (
    <Grid container spacing={4}>
      <Grid
        item
        xs={12}
        md={3}
        display={"flex"}
        flexDirection={"column"}
        gap={4}
      >
        <Stack>
          <ProfileCard {...profileCardPayload} />
        </Stack>

        <Stack>
          <Card sx={{ p: 2 }}>
            <Stack
              mb={5}
              display={"flex"}
              justifyContent={"space-between"}
              flexDirection={"row"}
              alignItems={"center"}
            >
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
          direction="row"
          display={"flex"}
          justifyContent={"space-evenly"}
          className="w-100 bg-white p-4 rounded "
        >
          <Grid item xs={4} display={"flex"} alignItems={"center"}>
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
          <Grid item xs={4} display={"flex"} alignItems={"center"}>
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
          <Grid item xs={4} display={"flex"} alignItems={"center"}>
            <Stack className="me-4 symbol symbol-45px">
              <img
                src={toAbsoluteUrl("media/Icons/skills.svg")}
                alt=""
                className="rounded-circle"
              />
            </Stack>
            <Box>
              <Typography variant="h2">
                {currentUser?.skills?.length || 0}+
              </Typography>
              <Typography variant="body2">
                {intl.formatMessage({ id: "PROFILE.SKILLS_HOLDER" })}
              </Typography>
            </Box>
          </Grid>
        </Stack>
        <Stack sx={{ width: "100%" }}>
          <BasicTabs />
        </Stack>
      </Grid>
    </Grid>
  );
}
