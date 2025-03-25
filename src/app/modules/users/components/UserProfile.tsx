import { Box, CardContent, Grid, Stack, Typography } from "@mui/material";
import BasicTabs from "./BasicTabs";
import IconStat from "../../../shared/components/IconStat";
import { colors } from "../../theme/MuiTheme";
import {
  Build,
  CalendarMonth,
  CorporateFareOutlined,
} from "@mui/icons-material";
import LeaveAllowences from "./LeaveAllowences";
import { useUserDetails } from "../UserDataProvider";
import { useAppSelector } from "../../../Redux/hooks";
import { getDateDiffInYears } from "../../../../utils/common";
import ProfileCard from "./ProfileCard";
import { useIntl } from "react-intl";

export default function UserProfile() {
  const intl = useIntl();
  const companyName = useAppSelector(
    (state) => state.user.userData?.companyName
  );
  const { userDetails, userSkills } = useUserDetails();
  return (
    <>
      <Stack position={{ lg: "sticky" }} top={{ lg: 80 }}>
        <Typography variant="h4" mb={3}>
          {intl.formatMessage({ id: "MENU.PROFILE" })}
        </Typography>
      </Stack>

      <Grid container spacing={4} zIndex={0}>
        <Grid
          item
          xs={12}
          lg={3.8}
          xl={3}
          display={"flex"}
          flexDirection={{ xs: "column", sm: "row", lg: "column" }}
          gap={{ xs: 4, sm: 2, md: 4 }}
          justifyContent={{ lg: "flex-start" }}
          position={{ xs: "inherit", lg: "sticky" }}
          top={{ lg: 100 }}
          height={{ lg: "60vh" }}
        >
          <Stack width={"100%"}>
            <ProfileCard />
          </Stack>
          <Stack width={"100%"}>
            <LeaveAllowences />
          </Stack>
        </Grid>
        <Grid item xs={12} md={12} lg={8.2} xl={9}>
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
                  number={getDateDiffInYears(userDetails.dateOfJoining!)}
                  title={`Years in ${companyName}`}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box component={CardContent}>
                <IconStat
                  iconBg={colors.alpha.danger[100]}
                  icon={<Build fontSize="large" />}
                  iconColor={colors.alpha.danger[400]}
                  number={userSkills.length}
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
    </>
  );
}
