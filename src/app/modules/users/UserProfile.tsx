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
    title: "ABOUT",
    icon: <Person />,
  },
  {
    tabId: 2,
    to: "leave",
    title: "LEAVE_TRACKER",
    icon: <CalendarMonth />,
  },
  {
    tabId: 3,
    to: "performance",
    title: "PERFORMANCE",
    icon: <Speed />,
  },
  {
    tabId: 4,
    to: "workhistory",
    title: "WORK_HISTORY",
    icon: <WorkHistory />,
  },
  {
    tabId: 5,
    to: "setting",
    title: "SETTING",
    icon: <Settings />,
  },
];

const UserProfile = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { setPageTitle } = usePageData();
  const empId = useParams().employeeid;

  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: empId ? "PAGE.PROFILE" : "PAGE.MY_PROFILE" }));
  }, []);

  return (
    <UserDetailsProvider>
      <Grid container spacing={{ xs: 2, lg: 3, xl: 4 }} className="flex-grow-1">
        <Grid
          item
          xs={12}
          lg={4}
          xl={3}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={12} >
              <ProfileCard />
            </Grid>
            <Grid item xs={12} md={6} lg={12}>
              <LeaveAllowences />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          md={12}
          lg={8}
          xl={9}
          className="d-flex flex-column gap-4"
        >
          <ProfileHeader />
          <Stack spacing={1} className="flex-grow-1">
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
                    sx={{ color: "text.secondary" }}
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
          </Stack>
        </Grid>
      </Grid>
    </UserDetailsProvider >
  );
};

export default UserProfile;
