import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import DonutApexChart from "../components/DonutApexChart";
import ProfileCard from "./ProfileCard";
import BasicTabs from "./BasicTabs";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { useUserDetails } from "./UserDataProvider";
import dayjs from "dayjs";
import { useAppSelector } from "../../Redux/hooks";
import IconStat from "../components/IconStat";
import { colors } from "../theme/MuiTheme";
import {
  Build,
  Calculate,
  CalendarMonth,
  CorporateFareOutlined,
  HourglassBottom,
} from "@mui/icons-material";
// import { getEmployeeDetails } from "./userservices";

// get token and id from store
export default function UserProfile() {
  const token = useAppSelector((state) => state.auth.token)!;
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
          direction={{ xs: "column", sm: "row" }}
          display={"flex"}
          justifyContent={"center"}
          bgcolor={colors.alpha.white[500]}
          borderRadius={1}
        >
          <Grid item xs={12} md={4}>
            <Box component={CardContent}>
              <IconStat
                iconBg={colors.alpha.secondary[100]}
                icon={<CalendarMonth fontSize="large" />}
                iconColor={colors.alpha.secondary[500]}
                number={14}
                title="Years of experience"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box component={CardContent}>
              <IconStat
                iconBg={colors.alpha.primary[100]}
                icon={<CorporateFareOutlined fontSize="large" />}
                iconColor={colors.alpha.primary[500]}
                number={6}
                title="Years in Codeji"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box component={CardContent}>
              <IconStat
                iconBg={colors.alpha.danger[100]}
                icon={<Build fontSize="large" />}
                iconColor={colors.alpha.danger[400]}
                number={0}
                title="Skills holder"
              />
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
