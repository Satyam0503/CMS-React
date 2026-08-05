import { Box, Card, Grid, Stack } from "@mui/material";
import {
  CalendarMonth,
  Person,
  Settings,
  Speed,
  WorkHistory,
} from "@mui/icons-material";
import { UserDetailsProvider } from "./UserDataProvider";
import ProfileCard from "./components/ProfileCard";
import { useIntl } from "react-intl";
import { useEffect, useMemo } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import { TabModel } from "../../../utils/common_types";
import { checkIsActive } from "../../../_themes/helpers";
import clsx from "clsx";
import { ProfileHeader } from "./about/components/ProfileHeader";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";
import { usePageData } from "../../Context/PageDataProvider";
import { useAppSelector } from "../../Redux/hooks";
import LeaveCalendar from "./components/LeaveCalendar";
import { getProfileTabs } from "./profileTabs";

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

const UserProfile = () => {
  const { formatMessage: i } = useIntl();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { setPageTitle } = usePageData();
  const empId = useParams().employeeid;
  // const employeeId = useParams().employeeid;
  const modulePermission = useAppSelector(
    (state) => state.user.userData?.modulePermission,
  );
  const userModulePermission = useMemo(
    () => modulePermission ?? [],
    [modulePermission],
  );

  useEffect(() => {
    setPageTitle(i({ id: empId ? "PAGE.PROFILE" : "PAGE.MY_PROFILE" }));
    setBreadcrumbs(employeeBreadCrumbs);
  }, [empId, i, setBreadcrumbs, setPageTitle]);

  const tabsRoutes = useMemo<TabModel[]>(
    () => getProfileTabs(userModulePermission, empId),
    [empId, userModulePermission],
  );

  const filteredTabs = tabsRoutes;

  return (
    <UserDetailsProvider>
      <Grid container spacing={{ xs: 2, lg: 3 }} className="flex-grow-1" sx={{ maxWidth: 1440, width: "100%", mx: "auto", pb: 4, position: "relative", isolation: "isolate", "&::before": { content: '""', position: "absolute", zIndex: -1, width: 280, height: 280, borderRadius: "50%", top: -80, right: 20, bgcolor: "primary.main", opacity: .06, filter: "blur(4px)" }, "&::after": { content: '""', position: "absolute", zIndex: -1, width: 220, height: 220, borderRadius: "50%", bottom: 60, left: 180, bgcolor: "secondary.main", opacity: .05, filter: "blur(8px)" } }}>
        <Grid
          size={{
            xs: 12,
            lg: 4,
            xl: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid
              container
              spacing={2}
              size={{
                xs: 12,
                md: 12,
                lg: 12,
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 12,
                }}
              >
                <ProfileCard />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 12,
                }}
              >
                <LeaveCalendar />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          className="d-flex flex-column gap-4"
          size={{
            xs: 12,
            md: 12,
            lg: 8,
            xl: 9,
          }}
        >
          <ProfileHeader />
          <Stack spacing={2.5} className="flex-grow-1">
            <Card className="tab-container d-flex flex-row" sx={{ borderRadius: 3, p: 0.75, gap: 0.5, boxShadow: "0 8px 24px rgba(0,0,0,.08)", overflowX: "auto" }}>
              {filteredTabs.map((tab) => {
                const tabTo = empId
                  ? `employees/${empId}/${tab.to}`
                  : `profile/${tab.to}`;
                if (tab.isActive) {
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
                }
              })}
            </Card>
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
