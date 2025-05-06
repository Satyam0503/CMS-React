import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import {
  CalendarMonth,
  Person,
  Settings,
  Speed,
  WorkHistory,
} from "@mui/icons-material";
import LeaveAllowences from "./components/LeaveAllowences";
import { UserDetailsProvider } from "./UserDataProvider";
import ProfileCard from "./components/ProfileCard";
import { useIntl } from "react-intl";
import { usePageData } from "../../../_themes/layout/core";
import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import { TabModel } from "../../../utils/common_types";
import { checkIsActive } from "../../../_themes/helpers";
import clsx from "clsx";
import { ProfileHeader } from "./about/components/ProfileHeader";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";

// const employeeBreadCrumbs: Array<Breadcrumb> = [
//   {
//     label: "PAGE.EMPLOYEES",
//     path: "/employees",
//     parent: "/",
//   },
//   {
//     label: "PAGE.PROFILE",
//     path: "/employees/{employeeid}",
//     parent: "/employees",
//   },
// ];

const tabsRoutes: TabModel[] = [
  {
    tabId: 1,
    to: "about",
    title: "PROFILE.TAB.ABOUT",
    icon: <Person />,
  },
  {
    tabId: 2,
    to: "leave",
    title: "PROFILE.TAB.LEAVE",
    icon: <CalendarMonth />,
  },
  {
    tabId: 3,
    to: "performance",
    title: "PROFILE.TAB.PERFORMANCE",
    icon: <Speed />,
  },
  {
    tabId: 4,
    to: "workhistory",
    title: "PROFILE.TAB.WORK",
    icon: <WorkHistory />,
  },
  {
    tabId: 5,
    to: "setting",
    title: "PROFILE.TAB.SETTING",
    icon: <Settings />,
  },
];

const UserProfile = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { setPageTitle } = usePageData();
  const empId = useParams().employeeid;

  useEffect(() => {
    if (empId) {
      setPageTitle(intl.formatMessage({ id: "PAGE.PROFILE" }));
    } else {
      setPageTitle(intl.formatMessage({ id: "PAGE.MY_PROFILE" }));
    }
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
        >
          <Stack width={"100%"}>
            <ProfileCard />
          </Stack>
          <Stack width={"100%"}>
            <LeaveAllowences />
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={12}
          lg={8.2}
          xl={9}
          className="d-flex flex-column gap-4"
        >
          <ProfileHeader />
          <Card className="tab-container d-flex flex-row">
            {tabsRoutes.map((tab) => {
              const tabTo = empId ? `employees/${empId}/${tab.to}` : `profile/${tab.to}`;
              return (
                <Box
                  component={"div"}
                  key={tab.tabId}
                  className={clsx("tab-box", {
                    tab_active: checkIsActive(location.pathname, tabTo),
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
