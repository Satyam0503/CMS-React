import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import DonutApexChart from "../components/DonutApexChart";
import ProfileCard from "./ProfileCard";
import BasicTabs from "./BasicTabs";
import IconStat from "../components/IconStat";
import { colors } from "../theme/MuiTheme";
import {
  Build,
  CalendarMonth,
  CorporateFareOutlined,
} from "@mui/icons-material";
import LeaveAllowences from "./LeaveAllowences";
import { useUserDetails } from "./UserDataProvider";

export default function UserProfile() {
  const userSkills = useUserDetails().userSkills;
  const intl = useIntl();
  const leaveAllowanceLables = ["Pending", "Taken"];
  const leaveAllowanceValue = [13, 10];

  return (
    <Grid container spacing={4}>
      <Grid
        item
        xs={12}
        lg={3}
        display={"flex"}
        flexDirection={{ xs: "column", sm: "row", lg: "column" }}
        gap={4}
        justifyContent={{ lg: "flex-start" }}
      >
        <Stack width={"100%"}>
          <ProfileCard />
        </Stack>
        <Stack width={"100%"}>
          <LeaveAllowences />
        </Stack>
      </Grid>
      <Grid item xs={12} md={12} lg={9}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          display={"flex"}
          justifyContent={"center"}
          bgcolor={colors.alpha.white[500]}
          borderRadius={1}
        >
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
            <Box component={CardContent}>
              <IconStat
                iconBg={colors.alpha.danger[100]}
                icon={<Build fontSize="large" />}
                iconColor={colors.alpha.danger[400]}
                number={userSkills.length +"+"}
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
