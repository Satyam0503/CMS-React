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
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import { TabModel } from "../../../utils/common_types";
import { checkIsActive } from "../../../_themes/helpers";
import clsx from "clsx";
import { ProfileHeader } from "./about/components/ProfileHeader";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";
import { usePageData } from "../../Context/PageDataProvider";
import { useAppSelector } from "../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../utils/common";
import { ModulesName, Permission } from "../../../utils/enums";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  getEmployeeLeaveBalance,
  getMyLeaveRequest,
} from "../leaves/leaveServices";
import {
  EmployeeLeaveTypeBalance,
  GetLeaveRequestPayLoad,
  MyLeaveRequestModel,
} from "../leaves/model";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { initialLeaveRequestFilter } from "../leaves/components/LeaveRequestFilter";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import LeaveCalendar from "./components/LeaveCalendar";

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
    icon: <CalendarMonth />,
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
  // const employeeId = useParams().employeeid;

  const modulePermission =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  useEffect(() => {
    setPageTitle(i({ id: empId ? "PAGE.PROFILE" : "PAGE.MY_PROFILE" }));
    setBreadcrumbs(employeeBreadCrumbs);
  }, []);

  // console.log(year);

  const filteredTabs = tabsRoutes.filter((tab) => {
    if (tab.to === "leave") {
      return (
        !empId ||
        hasModuleFeaturePermission(
          ModulesName.LeaveManagement,
          Permission.View,
          modulePermission
        )
      );
    }
    if (tab.to === "setting") {
      return !empId;
    }
    return true;
  });

  return (
    <UserDetailsProvider>
      <Grid container spacing={{ xs: 2, lg: 3, xl: 2 }} className="flex-grow-1">
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
            <Grid
              size={{
                xs: 12,
                // md: 6,
                // lg: 12,
              }}
            >
              <ProfileHeader />
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
          <Stack spacing={2} className="flex-grow-1">
            <Card className="tab-container d-flex flex-row">
              {filteredTabs.map((tab) => {
                const tabTo = empId
                  ? `employees/${empId}/${tab.to}`
                  : `profile/${tab.to}`;
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
    </UserDetailsProvider>
  );
};

export default UserProfile;
