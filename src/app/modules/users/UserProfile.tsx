import { Box, CardContent, Grid, Stack, Typography } from "@mui/material";
import BasicTabs from "./components/BasicTabs";
import IconStat from "../../shared/components/IconStat";
import { colors } from "../theme/MuiTheme";
import {
  Build,
  CalendarMonth,
  CorporateFareOutlined,
  PersonOffOutlined,
  Work,
} from "@mui/icons-material";
import LeaveAllowences from "./components/LeaveAllowences";
import { UserDetailsProvider, useUserDetails } from "./UserDataProvider";
import { useAppSelector } from "../../Redux/hooks";
import { getDateDiffInYears } from "../../../utils/common";
import ProfileCard from "./components/ProfileCard";
import { useIntl } from "react-intl";
import { usePageData } from "../../../_themes/layout/core";
import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import AboutUser from "./about/AboutUser";
import { LeaveTracker } from "./leavetracker/LeaveTracker";
import { UserPerformance } from "./performance/UserPerformance";
import { WorkHistory } from "./workhistory/WorkHistory";
import Setting from "./usersetting/Setting";
import { TabModel } from "../../../utils/common_types";
import { checkIsActive } from "../../../_themes/helpers";
import clsx from "clsx";

const tabsRoutes: TabModel[] = [
  {
    tabId: 1,
    to: "/myprofile/about",
    title: "COMPANY_MASTER.TAB.DEPARTMENT",
    icon: <PersonOffOutlined />,
  },
  {
    tabId: 2,
    to: "/myprofile/leave",
    title: "COMPANY_MASTER.TAB.JOBS",
    icon: <Work />,
  },
  {
    tabId: 3,
    to: "/myprofile/performance",
    title: "COMPANY_MASTER.TAB.JOBS",
    icon: <Work />,
  },
  {
    tabId: 4,
    to: "/myprofile/workhistory",
    title: "COMPANY_MASTER.TAB.JOBS",
    icon: <Work />,
  },
  {
    tabId: 5,
    to: "/myprofile/setting",
    title: "COMPANY_MASTER.TAB.JOBS",
    icon: <Work />,
  },
];

const UserProfile = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const companyName = useAppSelector(
    (state) => state.user.userData?.companyName
  );
  // const { userDetails, userSkills } = useUserDetails();
  const { setPageTitle } = usePageData();

  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.MY_PROFILE" }));
  }, []);

  return (
    <UserDetailsProvider>
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
                  // number={getDateDiffInYears(userDetails.dateOfJoining!)}
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
                  // number={userSkills.length}
                  title="Skills holder"
                />
              </Box>
            </Grid>
          </Stack>
          <Stack sx={{ width: "100%" }}>
            <Stack direction={"row"} spacing={0.5} className="tab-container">
              {tabsRoutes.map((tab) => {
                return (
                  <Box
                    component={"div"}
                    key={tab.tabId}
                    className={clsx("tab-box", {
                      tab_active: checkIsActive(location.pathname, tab.to),
                    })}
                    onClick={() => navigate(tab.to)}
                  >
                    {tab.icon}
                    {intl.formatMessage({ id: tab.title })}
                  </Box>
                );
              })}
            </Stack>
            <Box component="div" className="flex-grow-1">
              <Outlet />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </UserDetailsProvider>
  );
};

export default UserProfile;
