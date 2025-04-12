import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import {
  Person,
  PersonOffOutlined,
  Settings,
  Today,
  WorkHistory,
} from "@mui/icons-material";
import LeaveAllowences from "./components/LeaveAllowences";
import { UserDetailsProvider, useUserDetails } from "./UserDataProvider";
import ProfileCard from "./components/ProfileCard";
import { useIntl } from "react-intl";
import { usePageData } from "../../../_themes/layout/core";
import { useEffect } from "react";
import {  Outlet, useNavigate } from "react-router-dom";

import { TabModel } from "../../../utils/common_types";
import { checkIsActive } from "../../../_themes/helpers";
import clsx from "clsx";
import { ProfileHeader } from "./about/components/ProfileHeader";

const tabsRoutes: TabModel[] = [
  {
    tabId: 1,
    to: "/myprofile/about",
    title: "PROFILE.TAB.ABOUT",
    icon: <Person />,
  },
  {
    tabId: 2,
    to: "/myprofile/leave",
    title: "PROFILE.TAB.LEAVE",
    icon: <Person />,
  },
  {
    tabId: 3,
    to: "/myprofile/performance",
    title: "PROFILE.TAB.PERFORMANCE",
    icon: <Today />,
  },
  {
    tabId: 4,
    to: "/myprofile/workhistory",
    title: "PROFILE.TAB.WORK",
    icon: <WorkHistory />,
  },
  {
    tabId: 5,
    to: "/myprofile/setting",
    title: "PROFILE.TAB.SETTING",
    icon: <Settings />,
  },
];

const UserProfile = () => {
  const intl = useIntl();
  const navigate = useNavigate();
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
          // position={{ xs: "inherit", lg: "sticky" }}
          // top={{ lg: 100 }}
          // height={{ lg: "60vh" }}
        >
          <Stack width={"100%"}>
            <ProfileCard />
          </Stack>
          <Stack width={"100%"}>
            <LeaveAllowences />
          </Stack>
        </Grid>
        <Grid item xs={12} md={12} lg={8.2} xl={9} className="d-flex flex-column gap-4">
          <ProfileHeader />
            <Card className="tab-container d-flex flex-row">
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
            </Card>
            <Box component="div" className="flex-grow-1">
              <Outlet />
            </Box>
        </Grid>
      </Grid>
    </UserDetailsProvider>
  );
};

export default UserProfile;
