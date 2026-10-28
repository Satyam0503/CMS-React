import { Box, Card, Grid, Stack, Typography } from "@mui/material";
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
import { ResignationAction } from "./components/ResignationAction";
import { EmployeeExitCaseCard } from "./components/EmployeeExitCaseCard";
import { EmployeeExitManagementCard } from "./components/EmployeeExitManagementCard";
import { EmployeeOffboardingAction } from "./components/EmployeeOffboardingAction";
import { WorkShiftCard } from "./components/WorkShiftCard";
import { EmployeeExitQueueAction } from "./components/EmployeeExitQueueAction";

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
  const roleType = useAppSelector((state) => state.user.userData?.roleType);
  const hasOffboarding = Boolean(modulePermission?.some((p) => p.startsWith("Offboarding.")));
  const userModulePermission = useMemo(
    () => modulePermission ?? [],
    [modulePermission],
  );

  useEffect(() => {
    setPageTitle(i({ id: empId ? "PAGE.PROFILE" : "PAGE.MY_PROFILE" }));
    setBreadcrumbs(employeeBreadCrumbs);
  }, [empId, i, setBreadcrumbs, setPageTitle]);

  const tabsRoutes = useMemo<TabModel[]>(
    () => getProfileTabs(userModulePermission, empId, roleType),
    [empId, roleType, userModulePermission],
  );

  const filteredTabs = tabsRoutes;
  return (
    <UserDetailsProvider>
      <Grid container spacing={{ xs: 2, lg: 3 }} className="flex-grow-1" sx={{ width: "100%", minWidth: 0, pb: { xs: 2, sm: 3, md: 4 }, alignItems: "flex-start", position: "relative", isolation: "isolate", "&::before": { content: '""', position: "absolute", zIndex: -1, width: 280, height: 280, borderRadius: "50%", top: -80, right: 20, bgcolor: "primary.main", opacity: .06, filter: "blur(4px)" }, "&::after": { content: '""', position: "absolute", zIndex: -1, width: 220, height: 220, borderRadius: "50%", bottom: 60, left: 180, bgcolor: "secondary.main", opacity: .05, filter: "blur(8px)" } }}>
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
              <Grid size={12}>
                <ProfileCard />
              </Grid>
              <Grid size={12}>
                <WorkShiftCard />
              </Grid>
              <Grid size={12}>
                <LeaveCalendar />
              </Grid>
              {hasOffboarding && !empId && <Grid size={12}><ResignationAction /></Grid>}
              {hasOffboarding && !empId && <Grid size={12}><EmployeeExitQueueAction /></Grid>}
              {hasOffboarding && empId && <Grid size={12}><EmployeeOffboardingAction /></Grid>}
              {hasOffboarding && empId && (
                <Grid size={12}>
                  <EmployeeExitManagementCard employeeUserId={empId} />
                </Grid>
              )}
              {hasOffboarding && !empId && (
                <Grid size={12}>
                  <EmployeeExitCaseCard />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          className="d-flex flex-column gap-4"
          sx={{ minWidth: 0 }}
          size={{
            xs: 12,
            md: 12,
            lg: 8,
            xl: 9,
          }}
        >
          <ProfileHeader />
          <Stack spacing={2.5} className="flex-grow-1">
            <Card
              role="tablist"
              aria-label="Employee profile sections"
              className="tab-container d-flex flex-row"
              sx={{
                borderRadius: 3,
                p: 0.75,
                gap: 0.5,
                boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                "& .tab-box": {
                  flex: { xs: "0 0 auto", md: "1 1 0" },
                  minWidth: { xs: 132, md: 0 },
                  justifyContent: "center",
                  textAlign: "center",
                },
              }}
            >
              {filteredTabs.map((tab) => {
                const tabTo = empId
                  ? `employees/${empId}/${tab.to}`
                  : `profile/${tab.to}`;
                if (tab.isActive) {
                  const isSelected = checkIsActive(location.pathname, tabTo);
                  return (
                    <Box
                      component="div"
                      key={tab.tabId}
                      className={clsx("tab-box", {
                        tab_active: isSelected,
                      })}
                      onClick={() => navigate(tab.to)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(tab.to);
                        }
                      }}
                      role="tab"
                      aria-selected={isSelected}
                      tabIndex={0}
                      sx={{ color: "text.secondary", fontWeight: 600 }}
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
