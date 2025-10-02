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
import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import { TabModel } from "../../../utils/common_types";
import { checkIsActive } from "../../../_themes/helpers";
import clsx from "clsx";
import { ProfileHeader } from "./about/components/ProfileHeader";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";
import { usePageData } from "../../Context/PageDataProvider";

const employeeBreadCrumbs: Array<Breadcrumb> = [
  {
    label: "PAGE.EMPLOYEES",
    path: "/employees",
    parent: "/",
  },
  {
    label: "EMPLOYEE.PROFILE",
    path: "/employees/{employeeid}/*",
    parent: "/employees",
  },
];

const tabsRoutes: TabModel[] = [
  {
    tabId: 1,
    to: "about",
    title: "PROFILE.TABS.ABOUT",
    icon: <Person />,
  },
  {
    tabId: 2,
    to: "leave",
    title: "PROFILE.TABS.LEAVE_TRACKER",
    icon: <CalendarMonth />
  },
  {
    tabId: 3,
    to: "performance",
    title: "PROFILE.TABS.PERFORMANCE",
    icon: <Speed />,
  },
  {
    tabId: 4,
    to: "workhistory",
    title: "PROFILE.TABS.WORKHISTORY",
    icon: <WorkHistory />,
  },
  {
    tabId: 5,
    to: "setting",
    title: "PROFILE.TABS.SETTING",
    icon: <Settings />,
  },
];

const UserProfile = () => {
  const { formatMessage: i } = useIntl();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { setPageTitle } = usePageData();
  const empId = useParams().employeeid;

  useEffect(() => {
    setPageTitle(i({ id: empId ? "PAGE.PROFILE" : "PAGE.MY_PROFILE" }));
    setBreadcrumbs(employeeBreadCrumbs);
  }, []);

  const filteredTabs = () => {
    const protectedTabs = [2, 5];
    return tabsRoutes.filter(tab => {
      if (empId) {
        return !protectedTabs.includes(tab.tabId);
      } else {
        return true;
      }
    })
  }
  return (
    <UserDetailsProvider>
      <Grid container spacing={{ xs: 2, lg: 3, xl: 2 }} className="flex-grow-1">
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
              {/* <LeaveAllowences /> */}
              <ProfileHeader />
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
          <Stack spacing={2} className="flex-grow-1">
            <Card className="tab-container d-flex flex-row">
              {filteredTabs().map((tab) => {
                const tabTo = empId ? `employees/${empId}/${tab.to}` : `profile/${tab.to}`;
                return (
                  <Box
                    component="div"
                    key={tab.tabId}
                    className={clsx("tab-box", {
                      tab_active: checkIsActive(location.pathname, tabTo),
                    })}
                    onClick={() => navigate(tab.to)}
                    sx={{ color: "text.secondary" }}
                  >
                    {tab.icon}
                    {i({ id: tab.title })}
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
